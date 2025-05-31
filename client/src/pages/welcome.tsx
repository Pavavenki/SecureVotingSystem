import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Vote, Users, Fingerprint, Camera, Lock, Database } from "lucide-react";

export default function Welcome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center">
            <Shield className="h-8 w-8 text-white mr-3" />
            <h1 className="text-2xl font-bold text-white">Digital India Portal</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Secure Digital Governance Platform
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Combining Aadhaar management with AI-powered blockchain voting system for transparent, 
            secure, and efficient democratic processes with real-time biometric verification.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Badge variant="secondary" className="text-sm px-3 py-1">
              <Fingerprint className="h-4 w-4 mr-2" />
              Biometric Verification
            </Badge>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              <Camera className="h-4 w-4 mr-2" />
              Live Camera Recognition
            </Badge>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              <Lock className="h-4 w-4 mr-2" />
              Blockchain Security
            </Badge>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              <Database className="h-4 w-4 mr-2" />
              Real-time Database
            </Badge>
          </div>
        </div>

        {/* System Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Aadhaar Management System */}
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 hover:shadow-3xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Database className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Aadhaar Management</h3>
                <p className="text-gray-600 mb-6">
                  Admin-only system for managing citizen biometric data, personal information, 
                  and identity verification with secure database integration.
                </p>
                
                <div className="space-y-3 mb-8 text-left">
                  <div className="flex items-center text-sm text-gray-700">
                    <Shield className="h-4 w-4 text-green-600 mr-3 flex-shrink-0" />
                    Secure biometric data storage and management
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <Camera className="h-4 w-4 text-green-600 mr-3 flex-shrink-0" />
                    Photo upload and facial recognition templates
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <Fingerprint className="h-4 w-4 text-green-600 mr-3 flex-shrink-0" />
                    Fingerprint template storage and verification
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <Users className="h-4 w-4 text-green-600 mr-3 flex-shrink-0" />
                    Comprehensive citizen data management
                  </div>
                </div>
                
                <Link href="/aadhaar/login">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 font-medium">
                    <Lock className="h-4 w-4 mr-2" />
                    Admin Access
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Voting System */}
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 hover:shadow-3xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Vote className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Voting System</h3>
                <p className="text-gray-600 mb-6">
                  AI & Blockchain-powered voting with real-time biometric verification, 
                  multilingual support, and immutable vote storage.
                </p>
                
                <div className="space-y-3 mb-8 text-left">
                  <div className="flex items-center text-sm text-gray-700">
                    <Camera className="h-4 w-4 text-green-600 mr-3 flex-shrink-0" />
                    Live camera facial recognition during voting
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <Fingerprint className="h-4 w-4 text-green-600 mr-3 flex-shrink-0" />
                    Real-time fingerprint verification
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <Lock className="h-4 w-4 text-green-600 mr-3 flex-shrink-0" />
                    Blockchain-secured vote storage
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <Users className="h-4 w-4 text-green-600 mr-3 flex-shrink-0" />
                    Constituency-based candidate display
                  </div>
                </div>
                
                <Link href="/voting/login">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 font-medium">
                    <Vote className="h-4 w-4 mr-2" />
                    Enter Voting Portal
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Notice */}
        <div className="mt-16 max-w-3xl mx-auto">
          <Card className="bg-blue-900/30 backdrop-blur-sm border border-blue-400/30">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Shield className="h-6 w-6 text-blue-300 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Security & Privacy Notice</h4>
                  <div className="text-blue-100 text-sm space-y-2">
                    <p>• All biometric data is encrypted and securely stored with government-grade security</p>
                    <p>• Camera access is used only for real-time verification, no recordings are stored</p>
                    <p>• Blockchain technology ensures vote immutability and transparency</p>
                    <p>• Multi-factor authentication protects against unauthorized access</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/20 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-blue-100 text-sm">
              © 2024 Digital India Portal. Powered by advanced biometric security and blockchain technology.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
