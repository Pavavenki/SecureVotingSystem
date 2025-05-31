import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, User, CheckCircle, AlertCircle } from "lucide-react";

export default function VoterVerification() {
  const [, setLocation] = useLocation();
  const [verificationConfirmed, setVerificationConfirmed] = useState(false);

  // Mock voter data (in real app, this would come from session/API)
  const voterData = {
    name: "Rajesh Kumar Singh",
    voterId: "VTR123456789",
    aadhaarNumber: "1234-5678-9012",
    dob: "15/08/1985",
    constituency: "Mumbai North - Constituency 24",
    address: "123 Main Street, Andheri West, Mumbai, Maharashtra - 400058",
    photoUrl: null // In real app, this would be fetched from Aadhaar database
  };

  const handleProceed = () => {
    if (!verificationConfirmed) {
      return;
    }
    setLocation("/voting/biometric");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="bg-green-600 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Voter Verification</h1>
                <p className="text-sm text-gray-600">Step 1 of 3: Identity Verification</p>
              </div>
            </div>
            <Link href="/voting/login">
              <Button variant="ghost" className="text-gray-600">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
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
              <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full text-sm font-medium">
                1
              </div>
              <span className="ml-2 text-sm font-medium text-green-600">Identity Verification</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-4">
              <div className="h-full bg-green-600 w-1/3"></div>
            </div>
            <div className="flex items-center flex-1">
              <div className="flex items-center justify-center w-8 h-8 bg-gray-200 text-gray-600 rounded-full text-sm font-medium">
                2
              </div>
              <span className="ml-2 text-sm text-gray-600">Biometric Verification</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-4"></div>
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
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-gray-900">
              Verify Your Details
            </CardTitle>
            <p className="text-gray-600">
              Please review your information below. This data has been retrieved from the Aadhaar database.
            </p>
          </CardHeader>

          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Voter Photo */}
              <div className="text-center">
                <div className="w-48 h-48 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  {voterData.photoUrl ? (
                    <img 
                      src={voterData.photoUrl} 
                      alt="Voter Photo" 
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <User className="h-24 w-24 text-gray-400" />
                  )}
                </div>
                <p className="text-sm text-gray-600">Photo from Aadhaar Database</p>
                <Badge variant="outline" className="mt-2">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              </div>

              {/* Voter Details */}
              <div className="space-y-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Full Name</Label>
                  <p className="text-lg font-medium text-gray-900 mt-1">{voterData.name}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Voter ID</Label>
                  <p className="text-lg text-gray-900 mt-1 font-mono">{voterData.voterId}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Aadhaar Number</Label>
                  <p className="text-lg text-gray-900 mt-1 font-mono">{voterData.aadhaarNumber}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Date of Birth</Label>
                  <p className="text-lg text-gray-900 mt-1">{voterData.dob}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Constituency</Label>
                  <p className="text-lg text-gray-900 mt-1">{voterData.constituency}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Address</Label>
                  <p className="text-lg text-gray-900 mt-1">{voterData.address}</p>
                </div>
              </div>
            </div>

            {/* Verification Checkbox */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-medium text-amber-800 mb-2">Important Verification Notice</h4>
                  <p className="text-sm text-amber-700 mb-4">
                    Please carefully review all the information displayed above. By proceeding, you confirm that:
                  </p>
                  <ul className="text-sm text-amber-700 space-y-1 mb-4">
                    <li>• All details shown above are correct and belong to you</li>
                    <li>• You understand that any false declaration may result in legal action</li>
                    <li>• You consent to biometric verification for secure voting</li>
                    <li>• You acknowledge that your vote will be recorded on blockchain for transparency</li>
                  </ul>
                  
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <Checkbox
                      checked={verificationConfirmed}
                      onCheckedChange={setVerificationConfirmed}
                      className="mt-0.5"
                    />
                    <span className="text-sm text-amber-800 font-medium">
                      I confirm that all the details shown above are correct and belong to me. 
                      I understand that any false declaration may result in legal action.
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-6 border-t">
              <Link href="/voting/login">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Login
                </Button>
              </Link>

              <Button
                onClick={handleProceed}
                disabled={!verificationConfirmed}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Proceed to Biometric Verification
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

// Helper component for labels
function Label({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <label className={`block text-sm font-medium text-gray-700 ${className}`}>
      {children}
    </label>
  );
}
