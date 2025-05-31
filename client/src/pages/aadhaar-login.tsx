import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Shield, Lock } from "lucide-react";

export default function AadhaarLogin() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    userId: "",
    password: ""
  });
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async (credentials: { userId: string; password: string }) => {
      const response = await apiRequest("POST", "/api/admin/login", credentials);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Login Successful",
        description: "Welcome to Aadhaar Management System",
      });
      setLocation("/aadhaar/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.userId || !formData.password) {
      toast({
        title: "Missing Information",
        description: "Please enter both User ID and Password",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-white hover:bg-white/10 p-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Login Card */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Aadhaar Admin Login
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Secure access to citizen management system
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Security Notice */}
            <Alert className="border-blue-200 bg-blue-50">
              <Lock className="h-4 w-4" />
              <AlertDescription className="text-blue-800">
                This system is restricted to authorized government personnel only. 
                All access attempts are logged and monitored.
              </AlertDescription>
            </Alert>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userId" className="text-sm font-medium text-gray-700">
                  Admin User ID
                </Label>
                <Input
                  id="userId"
                  type="text"
                  placeholder="Enter your admin user ID"
                  value={formData.userId}
                  onChange={(e) => handleInputChange("userId", e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 font-medium"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
                    Authenticating...
                  </div>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Secure Login
                  </>
                )}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="text-center">
              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded border">
                <p className="font-medium mb-1">Demo Credentials:</p>
                <p>User ID: <span className="font-mono">admin</span></p>
                <p>Password: <span className="font-mono">admin123</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
