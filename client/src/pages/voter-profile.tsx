import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, Edit2, Save, X, LogOut } from "lucide-react";

export default function VoterProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    voterId: "",
    fullName: "",
    aadhaarNumber: "",
    constituency: "",
    password: ""
  });

  const queryClient = useQueryClient();

  // Get current user from session
  const { data: authUser } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Fetch voter details
  const { data: voter, isLoading } = useQuery({
    queryKey: ["/api/voter-profile", authUser?.userId],
    enabled: !!authUser?.userId,
    retry: false,
  });

  // Update voter mutation
  const updateVoterMutation = useMutation({
    mutationFn: async (voterData: any) => {
      const response = await fetch(`/api/voters/${voterData.voterId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(voterData),
      });
      if (!response.ok) {
        throw new Error("Failed to update profile");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/voter-profile"] });
      setIsEditing(false);
      alert("Profile updated successfully!");
    },
    onError: (error: Error) => {
      alert(`Error: ${error.message}`);
    },
  });

  useEffect(() => {
    if (voter) {
      setFormData({
        voterId: voter.voterId || "",
        fullName: voter.fullName || "",
        aadhaarNumber: voter.aadhaarNumber || "",
        constituency: voter.constituency || "",
        password: voter.password || ""
      });
    }
  }, [voter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateVoterMutation.mutate(formData);
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!authUser || !voter) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">Please log in to view your profile.</p>
            <Button onClick={() => window.location.href = "/voting-login"}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow-sm rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center mr-4">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Voter Profile</h1>
                  <p className="text-gray-600">Manage your voting information</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Verified Voter
                </Badge>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              {!isEditing ? (
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        voterId: voter.voterId || "",
                        fullName: voter.fullName || "",
                        aadhaarNumber: voter.aadhaarNumber || "",
                        constituency: voter.constituency || "",
                        password: voter.password || ""
                      });
                    }}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Voter ID</Label>
                  <Input
                    value={formData.voterId}
                    disabled={true}
                    className="bg-gray-50"
                  />
                  <p className="text-sm text-gray-500 mt-1">Voter ID cannot be changed</p>
                </div>
                
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                  />
                </div>

                <div>
                  <Label>Aadhaar Number</Label>
                  <Input
                    value={formData.aadhaarNumber}
                    disabled={true}
                    className="bg-gray-50"
                  />
                  <p className="text-sm text-gray-500 mt-1">Aadhaar number cannot be changed</p>
                </div>

                <div>
                  <Label>Constituency</Label>
                  <select
                    value={formData.constituency}
                    onChange={(e) => setFormData({...formData, constituency: e.target.value})}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md ${!isEditing ? "bg-gray-50" : ""}`}
                  >
                    <option value="Mumbai North - 24">Mumbai North - 24</option>
                    <option value="Mumbai South - 25">Mumbai South - 25</option>
                    <option value="Thane - 26">Thane - 26</option>
                    <option value="Pune - 27">Pune - 27</option>
                    <option value="Chennai North">Chennai North</option>
                    <option value="Chennai South">Chennai South</option>
                    <option value="Chennai Central">Chennai Central</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <Label>Date of Birth (Password)</Label>
                  <Input
                    type="date"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Your date of birth is used for authentication when voting
                  </p>
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={updateVoterMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {updateVoterMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Voting Status */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Voting Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900">Registration Status</h3>
                <Badge variant="default" className="mt-2 bg-green-100 text-green-800">
                  Registered
                </Badge>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900">Voting Status</h3>
                <Badge variant={voter.hasVoted ? "default" : "secondary"} className="mt-2">
                  {voter.hasVoted ? "Voted" : "Not Voted"}
                </Badge>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-900">Account Status</h3>
                <Badge variant="default" className="mt-2 bg-green-100 text-green-800">
                  Active
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}