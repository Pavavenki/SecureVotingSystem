import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import CameraCapture from "@/components/camera-capture";
import FingerprintScanner from "@/components/fingerprint-scanner";
import { useBiometric } from "@/hooks/use-biometric";
import { ArrowLeft, ArrowRight, Fingerprint, Camera, CheckCircle, Clock, X } from "lucide-react";

export default function BiometricVerification() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState<"permission" | "fingerprint" | "face" | "complete">("permission");
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false);
  const { verifyFingerprint, verifyFace, isLoading } = useBiometric();
  
  const [verificationStatus, setVerificationStatus] = useState({
    fingerprint: { status: "pending", confidence: 0 },
    face: { status: "pending", confidence: 0 }
  });

  const handleCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraPermissionGranted(true);
      setCurrentStep("fingerprint");
      // Stop the stream immediately after getting permission
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error("Camera permission denied:", error);
    }
  };

  const handleFingerprintVerification = async (fingerprintData: string) => {
    try {
      const result = await verifyFingerprint("1234-5678-9012", fingerprintData);
      setVerificationStatus(prev => ({
        ...prev,
        fingerprint: { 
          status: result.isMatch ? "verified" : "failed", 
          confidence: result.confidence 
        }
      }));
      
      if (result.isMatch) {
        setCurrentStep("face");
      }
    } catch (error) {
      setVerificationStatus(prev => ({
        ...prev,
        fingerprint: { status: "failed", confidence: 0 }
      }));
    }
  };

  const handleFaceVerification = async (faceData: string) => {
    try {
      const result = await verifyFace("1234-5678-9012", faceData);
      setVerificationStatus(prev => ({
        ...prev,
        face: { 
          status: result.isMatch ? "verified" : "failed", 
          confidence: result.confidence 
        }
      }));
      
      if (result.isMatch) {
        setCurrentStep("complete");
      }
    } catch (error) {
      setVerificationStatus(prev => ({
        ...prev,
        face: { status: "failed", confidence: 0 }
      }));
    }
  };

  const canProceedToVoting = 
    verificationStatus.fingerprint.status === "verified" && 
    verificationStatus.face.status === "verified";

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "failed":
        return <X className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-50 border-green-200";
      case "failed":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="bg-green-600 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                <Fingerprint className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Biometric Verification</h1>
                <p className="text-sm text-gray-600">Step 2 of 3: Secure Identity Verification</p>
              </div>
            </div>
            <Link href="/voting/verification">
              <Button variant="ghost" className="text-gray-600">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <div className="flex items-center flex-1">
              <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full text-sm">
                <CheckCircle className="h-4 w-4" />
              </div>
              <span className="ml-2 text-sm font-medium text-green-600">Identity Verified</span>
            </div>
            <div className="flex-1 h-1 bg-green-600 mx-4"></div>
            <div className="flex items-center flex-1">
              <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full text-sm font-medium">
                2
              </div>
              <span className="ml-2 text-sm font-medium text-green-600">Biometric Verification</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-4">
              <div className={`h-full bg-green-600 ${canProceedToVoting ? 'w-full' : 'w-2/3'}`}></div>
            </div>
            <div className="flex items-center flex-1">
              <div className="flex items-center justify-center w-8 h-8 bg-gray-200 text-gray-600 rounded-full text-sm font-medium">
                3
              </div>
              <span className="ml-2 text-sm text-gray-600">Cast Vote</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Camera Permission Request */}
        {currentStep === "permission" && (
          <Card className="shadow-lg mb-8">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Camera className="h-10 w-10 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Camera Access Required</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                We need access to your camera for facial recognition verification. Your privacy is protected - 
                images are processed securely and not stored permanently.
              </p>
              
              <Alert className="mb-6 max-w-md mx-auto">
                <Camera className="h-4 w-4" />
                <AlertDescription>
                  <strong>Privacy Notice:</strong> Camera access is used only for biometric verification. 
                  No video recording occurs, and biometric data is encrypted during transmission.
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={handleCameraPermission}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
              >
                <Camera className="h-4 w-4 mr-2" />
                Grant Camera Access
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Biometric Verification Steps */}
        {currentStep !== "permission" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Fingerprint Verification */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Fingerprint className="h-5 w-5 mr-2" />
                  Fingerprint Verification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FingerprintScanner 
                  onScan={handleFingerprintVerification}
                  isActive={currentStep === "fingerprint"}
                  status={verificationStatus.fingerprint.status}
                />
              </CardContent>
            </Card>

            {/* Facial Recognition */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="h-5 w-5 mr-2" />
                  Facial Recognition
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CameraCapture 
                  onCapture={handleFaceVerification}
                  isActive={currentStep === "face"}
                  status={verificationStatus.face.status}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Verification Status */}
        {currentStep !== "permission" && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Verification Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className={`flex items-center justify-between p-4 rounded-lg border ${getStatusColor(verificationStatus.fingerprint.status)}`}>
                  <div className="flex items-center">
                    <Fingerprint className="h-5 w-5 mr-3 text-gray-600" />
                    <span className="font-medium">Fingerprint Verification</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(verificationStatus.fingerprint.status)}
                    <Badge variant={verificationStatus.fingerprint.status === "verified" ? "default" : "secondary"}>
                      {verificationStatus.fingerprint.status === "verified" ? "Verified" :
                       verificationStatus.fingerprint.status === "failed" ? "Failed" : "Pending"}
                    </Badge>
                    {verificationStatus.fingerprint.confidence > 0 && (
                      <span className="text-xs text-gray-600">
                        {verificationStatus.fingerprint.confidence}% confidence
                      </span>
                    )}
                  </div>
                </div>

                <div className={`flex items-center justify-between p-4 rounded-lg border ${getStatusColor(verificationStatus.face.status)}`}>
                  <div className="flex items-center">
                    <Camera className="h-5 w-5 mr-3 text-gray-600" />
                    <span className="font-medium">Facial Recognition</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(verificationStatus.face.status)}
                    <Badge variant={verificationStatus.face.status === "verified" ? "default" : "secondary"}>
                      {verificationStatus.face.status === "verified" ? "Verified" :
                       verificationStatus.face.status === "failed" ? "Failed" : "Pending"}
                    </Badge>
                    {verificationStatus.face.confidence > 0 && (
                      <span className="text-xs text-gray-600">
                        {verificationStatus.face.confidence}% confidence
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t">
                <Link href="/voting/verification">
                  <Button variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Verification
                  </Button>
                </Link>

                <Button
                  onClick={() => setLocation("/voting/vote")}
                  disabled={!canProceedToVoting || isLoading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      Proceed to Vote
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
