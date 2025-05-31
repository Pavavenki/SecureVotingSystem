import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import CameraCapture from "@/components/camera-capture";
import FingerprintScanner from "@/components/fingerprint-scanner";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft, ArrowRight, Fingerprint, Camera, CheckCircle, Clock, X, Shield } from "lucide-react";

export default function BiometricVerification() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState<"face" | "fingerprint" | "complete">("face");
  const [verificationResults, setVerificationResults] = useState({
    face: { verified: false, confidence: 0 },
    fingerprint: { verified: false, confidence: 0 }
  });

  const handleFaceVerification = async (faceData: string) => {
    // Simulate face verification with Aadhaar database
    setTimeout(() => {
      const confidence = Math.random() * 30 + 70; // 70-100% confidence
      const isMatch = confidence > 75;
      
      setVerificationResults(prev => ({
        ...prev,
        face: { verified: isMatch, confidence }
      }));

      if (isMatch) {
        // Move to fingerprint verification after successful face verification
        setTimeout(() => {
          setCurrentStep("fingerprint");
        }, 1500);
      }
    }, 2000);
  };

  const handleFingerprintVerification = async (fingerprintData: string) => {
    // Simulate fingerprint verification with Aadhaar database
    setTimeout(() => {
      const confidence = Math.random() * 25 + 75; // 75-100% confidence
      const isMatch = confidence > 80;
      
      setVerificationResults(prev => ({
        ...prev,
        fingerprint: { verified: isMatch, confidence }
      }));

      if (isMatch) {
        // Both verifications complete, proceed to voting
        setTimeout(() => {
          setCurrentStep("complete");
          setTimeout(() => {
            setLocation("/voting/vote");
          }, 2000);
        }, 1500);
      }
    }, 3000);
  };

  const getStepStatus = (step: string) => {
    if (step === "face") {
      if (currentStep === "face" && !verificationResults.face.verified) return "current";
      if (verificationResults.face.verified) return "completed";
      return "pending";
    }
    if (step === "fingerprint") {
      if (currentStep === "fingerprint" && !verificationResults.fingerprint.verified) return "current";
      if (verificationResults.fingerprint.verified) return "completed";
      if (verificationResults.face.verified) return "ready";
      return "pending";
    }
    return "pending";
  };

  const getStepIcon = (step: string, status: string) => {
    if (status === "completed") return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (status === "current") return <Clock className="h-5 w-5 text-blue-600 animate-pulse" />;
    if (step === "face") return <Camera className="h-5 w-5 text-gray-400" />;
    if (step === "fingerprint") return <Fingerprint className="h-5 w-5 text-gray-400" />;
    return <div className="h-5 w-5 rounded-full bg-gray-300"></div>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/voting/verification">
            <Button variant="ghost" className="text-gray-600 hover:text-gray-800">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('back')}
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">{t('biometric_verification')}</h1>
          <div></div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {/* Face Verification Step */}
            <div className="flex items-center space-x-3">
              {getStepIcon("face", getStepStatus("face"))}
              <div className="text-center">
                <p className={`text-sm font-medium ${
                  getStepStatus("face") === "completed" ? "text-green-600" :
                  getStepStatus("face") === "current" ? "text-blue-600" : "text-gray-500"
                }`}>
                  {t('face_verification')}
                </p>
                {verificationResults.face.verified && (
                  <p className="text-xs text-green-600">
                    {Math.round(verificationResults.face.confidence)}% {t('verification_success')}
                  </p>
                )}
              </div>
            </div>

            {/* Arrow */}
            <ArrowRight className="h-5 w-5 text-gray-400" />

            {/* Fingerprint Verification Step */}
            <div className="flex items-center space-x-3">
              {getStepIcon("fingerprint", getStepStatus("fingerprint"))}
              <div className="text-center">
                <p className={`text-sm font-medium ${
                  getStepStatus("fingerprint") === "completed" ? "text-green-600" :
                  getStepStatus("fingerprint") === "current" ? "text-blue-600" : "text-gray-500"
                }`}>
                  {t('fingerprint_verification')}
                </p>
                {verificationResults.fingerprint.verified && (
                  <p className="text-xs text-green-600">
                    {Math.round(verificationResults.fingerprint.confidence)}% {t('verification_success')}
                  </p>
                )}
              </div>
            </div>

            {/* Arrow */}
            <ArrowRight className="h-5 w-5 text-gray-400" />

            {/* Complete Step */}
            <div className="flex items-center space-x-3">
              {currentStep === "complete" ? 
                <CheckCircle className="h-5 w-5 text-green-600" /> :
                <div className="h-5 w-5 rounded-full bg-gray-300"></div>
              }
              <div className="text-center">
                <p className={`text-sm font-medium ${
                  currentStep === "complete" ? "text-green-600" : "text-gray-500"
                }`}>
                  {t('cast_vote')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Instructions */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Shield className="h-5 w-5 mr-2 text-blue-600" />
                  Security Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600">
                  <p className="font-medium mb-2">Step-by-step verification:</p>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Face verification using camera</li>
                    <li>Fingerprint scanning</li>
                    <li>Proceed to voting</li>
                  </ol>
                </div>
                
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Your biometric data is securely verified against your Aadhaar profile. 
                    All data is processed locally and encrypted.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Voter Information */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Voter Information</p>
                  <div className="text-sm text-gray-600">
                    <p><strong>Name:</strong> Rajesh Kumar Singh</p>
                    <p><strong>Voter ID:</strong> VOTER001</p>
                    <p><strong>Constituency:</strong> Mumbai North - 24</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center Panel - Active Verification */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-center">
                  {currentStep === "face" && t('face_verification')}
                  {currentStep === "fingerprint" && t('fingerprint_verification')}
                  {currentStep === "complete" && "Verification Complete!"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentStep === "face" && (
                  <div className="space-y-4">
                    <CameraCapture
                      onCapture={handleFaceVerification}
                      isActive={true}
                      status={
                        verificationResults.face.verified ? "verified" :
                        verificationResults.face.confidence > 0 ? "failed" : "pending"
                      }
                    />
                  </div>
                )}

                {currentStep === "fingerprint" && (
                  <div className="space-y-4">
                    <FingerprintScanner
                      onScan={handleFingerprintVerification}
                      isActive={true}
                      status={
                        verificationResults.fingerprint.verified ? "verified" :
                        verificationResults.fingerprint.confidence > 0 ? "failed" : "pending"
                      }
                    />
                  </div>
                )}

                {currentStep === "complete" && (
                  <div className="text-center space-y-6 py-8">
                    <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
                    <div>
                      <h3 className="text-xl font-semibold text-green-600 mb-2">
                        Verification Successful!
                      </h3>
                      <p className="text-gray-600">
                        Both face and fingerprint verification completed successfully.
                        Redirecting to voting interface...
                      </p>
                    </div>
                    <div className="flex justify-center">
                      <div className="w-8 h-8 border-4 border-green-600/20 border-t-green-600 rounded-full animate-spin"></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            This is a secure government voting system. Your privacy and vote confidentiality are protected.
          </p>
        </div>
      </div>
    </div>
  );
}