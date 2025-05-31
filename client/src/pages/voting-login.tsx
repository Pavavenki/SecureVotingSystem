import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft, Vote, User, UserCog, Globe } from "lucide-react";

export default function VotingLogin() {
  const [, setLocation] = useLocation();
  const [selectedRole, setSelectedRole] = useState<"voter" | "admin">("voter");
  const { language, setLanguage, t } = useLanguage();
  const [formData, setFormData] = useState({
    userId: "",
    password: ""
  });
  const { toast } = useToast();

  const languages = [
    { code: "en", name: "English" },
    { code: "hi", name: "हिन्दी (Hindi)" },
    { code: "ta", name: "தமிழ் (Tamil)" },
    { code: "te", name: "తెలుగు (Telugu)" },
    { code: "mr", name: "मराठी (Marathi)" },
    { code: "bn", name: "বাংলা (Bengali)" }
  ];

  const loginMutation = useMutation({
    mutationFn: async (credentials: { userId: string; password: string; role: string }) => {
      const response = await apiRequest("POST", "/api/voting/login", credentials);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Login Successful",
        description: selectedRole === "admin" ? "Welcome to Voting Admin Panel" : "Welcome to Voting Portal",
      });
      
      if (selectedRole === "admin") {
        setLocation("/voting/admin");
      } else {
        setLocation("/voting/verification");
      }
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
    loginMutation.mutate({ ...formData, role: selectedRole });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-700 to-green-800 flex items-center justify-center p-4">
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
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Vote className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Voting Portal
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Secure Digital Voting System
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Language Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 flex items-center">
                <Globe className="h-4 w-4 mr-2" />
                Select Language / भाषा चुनें
              </Label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Login As</Label>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant={selectedRole === "voter" ? "default" : "outline"}
                  className={`p-4 h-auto flex flex-col items-center space-y-2 ${
                    selectedRole === "voter" 
                      ? "bg-green-600 hover:bg-green-700 text-white" 
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedRole("voter")}
                >
                  <User className="h-6 w-6" />
                  <span className="text-sm font-medium">Voter</span>
                </Button>
                <Button
                  type="button"
                  variant={selectedRole === "admin" ? "default" : "outline"}
                  className={`p-4 h-auto flex flex-col items-center space-y-2 ${
                    selectedRole === "admin" 
                      ? "bg-green-600 hover:bg-green-700 text-white" 
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedRole("admin")}
                >
                  <UserCog className="h-6 w-6" />
                  <span className="text-sm font-medium">Admin</span>
                </Button>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userId" className="text-sm font-medium text-gray-700">
                  {selectedRole === "voter" ? "Voter ID" : "Admin ID"}
                </Label>
                <Input
                  id="userId"
                  type="text"
                  placeholder={selectedRole === "voter" ? "Enter your voter ID" : "Enter admin ID"}
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
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 font-medium"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
                    Authenticating...
                  </div>
                ) : (
                  <>
                    <Vote className="h-4 w-4 mr-2" />
                    Login to Vote
                  </>
                )}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="text-center">
              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded border space-y-1">
                <p className="font-medium">Demo Credentials:</p>
                {selectedRole === "voter" ? (
                  <>
                    <p>Voter ID: <span className="font-mono">VOTER001</span></p>
                    <p>Password: <span className="font-mono">voter123</span></p>
                  </>
                ) : (
                  <>
                    <p>Admin ID: <span className="font-mono">votingadmin</span></p>
                    <p>Password: <span className="font-mono">admin123</span></p>
                  </>
                )}
              </div>
            </div>

            {/* Features for Voters */}
            {selectedRole === "voter" && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-700">Voting Features:</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Biometric Verification
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Blockchain Security
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Real-time Results
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
