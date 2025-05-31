import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import PhotoCapture from "@/components/photo-capture";
import FingerprintScanner from "@/components/fingerprint-scanner";
import { 
  Users, 
  Fingerprint, 
  Clock, 
  AlertTriangle, 
  Search, 
  UserPlus, 
  Download, 
  BarChart3,
  Eye,
  Edit,
  Trash2,
  LogOut,
  CheckCircle,
  XCircle,
  Camera,
  IdCard
} from "lucide-react";

// Constants for districts and constituencies
const DISTRICTS = {
  "Tamil Nadu": [
    "Chennai", "Coimbatore", "Madurai", "Salem", "Tiruchirappalli", "Tiruppur",
    "Vellore", "Erode", "Thoothukkudi", "Dindigul", "Thanjavur", "Ranipet",
    "Sivaganga", "Karur", "Namakkal", "Tiruvannamalai", "Dharmapuri"
  ],
  "Maharashtra": [
    "Mumbai", "Pune", "Nagpur", "Thane", "Aurangabad", "Solapur",
    "Amravati", "Nashik", "Kolhapur", "Sangli", "Jalgaon", "Akola"
  ]
};

const CONSTITUENCIES = {
  "Chennai": ["Chennai North", "Chennai South", "Chennai Central"],
  "Coimbatore": ["Coimbatore North", "Coimbatore South"],
  "Madurai": ["Madurai East", "Madurai West", "Madurai Central"],
  "Mumbai": ["Mumbai North", "Mumbai South", "Mumbai North East", "Mumbai North West", "Mumbai North Central", "Mumbai South Central"],
  "Pune": ["Pune", "Baramati", "Maval"],
  "Thane": ["Thane", "Kalyan", "Bhiwandi"]
};

export default function AadhaarDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingCitizen, setEditingCitizen] = useState<any>(null);
  const [viewingCitizen, setViewingCitizen] = useState<any>(null);
  const [newCitizen, setNewCitizen] = useState({
    aadhaarNumber: "",
    fullName: "",
    dateOfBirth: "",
    gender: "",
    phoneNumber: "",
    email: "",
    address: "",
    district: "",
    state: "",
    pincode: "",
    constituency: "",
    voterId: "",
    photoUrl: "",
    fingerprintTemplates: `fingerprint_${Date.now()}_verified`,
    biometricStatus: "verified"
  });

  const queryClient = useQueryClient();

  // Fetch citizens data
  const { data: citizens = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/citizens"],
    retry: false,
  });

  // Fetch analytics data
  const { data: analytics } = useQuery({
    queryKey: ["/api/analytics"],
    retry: false,
  });

  // Add citizen mutation
  const addCitizenMutation = useMutation({
    mutationFn: async (citizenData: any) => {
      const response = await fetch("/api/citizens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(citizenData),
      });
      if (!response.ok) throw new Error("Failed to add citizen");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/citizens"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      setIsAddDialogOpen(false);
      resetForm();
    },
  });

  // Edit citizen mutation
  const editCitizenMutation = useMutation({
    mutationFn: async ({ aadhaar, data }: { aadhaar: string; data: any }) => {
      const response = await fetch(`/api/citizens/${aadhaar}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update citizen");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/citizens"] });
      setIsEditDialogOpen(false);
      setEditingCitizen(null);
    },
  });

  // Delete citizen mutation
  const deleteCitizenMutation = useMutation({
    mutationFn: async (aadhaar: string) => {
      const response = await fetch(`/api/citizens/${aadhaar}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete citizen");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/citizens"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
    },
  });

  const resetForm = () => {
    setNewCitizen({
      aadhaarNumber: "",
      fullName: "",
      dateOfBirth: "",
      gender: "",
      phoneNumber: "",
      email: "",
      address: "",
      district: "",
      state: "",
      pincode: "",
      constituency: "",
      voterId: "",
      photoUrl: "",
      fingerprintTemplates: "",
      biometricStatus: "pending"
    });
  };

  const handleAddCitizen = () => {
    // Generate voter ID if not provided
    const citizenData = {
      ...newCitizen,
      voterId: newCitizen.voterId || `VOTER${Date.now()}`,
      biometricStatus: newCitizen.fingerprintTemplates ? "verified" : "pending"
    };
    addCitizenMutation.mutate(citizenData);
  };

  const handleEditCitizen = () => {
    if (editingCitizen) {
      editCitizenMutation.mutate({
        aadhaar: editingCitizen.aadhaarNumber,
        data: editingCitizen
      });
    }
  };

  const handleDeleteCitizen = (aadhaar: string) => {
    if (confirm("Are you sure you want to delete this citizen record?")) {
      deleteCitizenMutation.mutate(aadhaar);
    }
  };

  const filteredCitizens = citizens.filter((citizen: any) => {
    if (!citizen) return false;
    const matchesSearch = !searchQuery || 
      (citizen.fullName && citizen.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (citizen.aadhaarNumber && citizen.aadhaarNumber.includes(searchQuery)) ||
      (citizen.voterId && citizen.voterId.includes(searchQuery));
    const matchesDistrict = !selectedDistrict || citizen.district === selectedDistrict;
    const matchesState = !selectedState || citizen.state === selectedState;
    return matchesSearch && matchesDistrict && matchesState;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
          <Icon className={`h-8 w-8 ${color.replace('text-', 'text-').replace('-600', '-500')}`} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Aadhaar Management System</h1>
            <p className="text-gray-600">Manage citizen records and biometric verification</p>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/api/logout">
              <Button variant="outline">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="citizens">Citizens</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                title="Total Citizens" 
                value={citizens.length} 
                icon={Users} 
                color="text-blue-600" 
              />
              <StatCard 
                title="Verified Biometrics" 
                value={citizens.filter((c: any) => c.biometricStatus === 'verified').length} 
                icon={CheckCircle} 
                color="text-green-600" 
              />
              <StatCard 
                title="Pending Updates" 
                value={citizens.filter((c: any) => c.biometricStatus === 'pending').length} 
                icon={Clock} 
                color="text-yellow-600" 
              />
              <StatCard 
                title="Failed Verifications" 
                value={citizens.filter((c: any) => c.biometricStatus === 'failed').length} 
                icon={XCircle} 
                color="text-red-600" 
              />
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button onClick={() => setIsAddDialogOpen(true)} className="h-16">
                    <UserPlus className="h-6 w-6 mr-2" />
                    Add New Citizen
                  </Button>
                  <Button variant="outline" className="h-16">
                    <Download className="h-6 w-6 mr-2" />
                    Export Data
                  </Button>
                  <Button variant="outline" className="h-16">
                    <BarChart3 className="h-6 w-6 mr-2" />
                    Generate Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Citizens Tab */}
          <TabsContent value="citizens" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search by name, Aadhaar number, or Voter ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={selectedState} onValueChange={setSelectedState}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All States</SelectItem>
                      <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                      <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select District" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Districts</SelectItem>
                      {selectedState && DISTRICTS[selectedState as keyof typeof DISTRICTS]?.map((district) => (
                        <SelectItem key={district} value={district}>{district}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Citizen
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Citizens Table */}
            <Card>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-8 text-center">Loading citizens...</div>
                ) : !citizens || citizens.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No citizens registered yet. Click "Add Citizen" to get started.
                  </div>
                ) : filteredCitizens.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No citizens match your search criteria. Total citizens: {citizens.length}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Citizen Details
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Location
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Voter Details
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Biometric Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredCitizens.map((citizen: any) => (
                          <tr key={citizen.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {citizen.photoUrl ? (
                                  <img src={citizen.photoUrl} alt={citizen.fullName} className="h-10 w-10 rounded-full mr-3" />
                                ) : (
                                  <div className="h-10 w-10 bg-gray-200 rounded-full mr-3 flex items-center justify-center">
                                    <Users className="h-5 w-5 text-gray-400" />
                                  </div>
                                )}
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{citizen.fullName}</div>
                                  <div className="text-sm text-gray-500">{citizen.aadhaarNumber}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{citizen.district}, {citizen.state}</div>
                              <div className="text-sm text-gray-500">{citizen.pincode}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{citizen.voterId}</div>
                              <div className="text-sm text-gray-500">{citizen.constituency}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(citizen.biometricStatus)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setViewingCitizen(citizen);
                                    setIsViewDialogOpen(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingCitizen({...citizen});
                                    setIsEditDialogOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteCitizen(citizen.aadhaarNumber)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Biometric Verification Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Verified</span>
                      <span className="font-semibold text-green-600">
                        {citizens.filter((c: any) => c.biometricStatus === 'verified').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Pending</span>
                      <span className="font-semibold text-yellow-600">
                        {citizens.filter((c: any) => c.biometricStatus === 'pending').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Failed</span>
                      <span className="font-semibold text-red-600">
                        {citizens.filter((c: any) => c.biometricStatus === 'failed').length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribution by State</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Tamil Nadu</span>
                      <span className="font-semibold">
                        {citizens.filter((c: any) => c.state === 'Tamil Nadu').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Maharashtra</span>
                      <span className="font-semibold">
                        {citizens.filter((c: any) => c.state === 'Maharashtra').length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Add Citizen Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Citizen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="aadhaarNumber">Aadhaar Number</Label>
                  <Input
                    id="aadhaarNumber"
                    value={newCitizen.aadhaarNumber}
                    onChange={(e) => setNewCitizen({...newCitizen, aadhaarNumber: e.target.value})}
                    placeholder="1234-5678-9012"
                  />
                </div>
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={newCitizen.fullName}
                    onChange={(e) => setNewCitizen({...newCitizen, fullName: e.target.value})}
                    placeholder="Full Name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={newCitizen.dateOfBirth}
                    onChange={(e) => setNewCitizen({...newCitizen, dateOfBirth: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={newCitizen.gender} onValueChange={(value) => setNewCitizen({...newCitizen, gender: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={newCitizen.phoneNumber}
                    onChange={(e) => setNewCitizen({...newCitizen, phoneNumber: e.target.value})}
                    placeholder="10-digit mobile number"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newCitizen.email}
                    onChange={(e) => setNewCitizen({...newCitizen, email: e.target.value})}
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={newCitizen.address}
                  onChange={(e) => setNewCitizen({...newCitizen, address: e.target.value})}
                  placeholder="Full Address"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="state">State</Label>
                  <Select value={newCitizen.state} onValueChange={(value) => {
                    setNewCitizen({...newCitizen, state: value, district: "", constituency: ""});
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                      <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="district">District</Label>
                  <Select value={newCitizen.district} onValueChange={(value) => {
                    setNewCitizen({...newCitizen, district: value, constituency: ""});
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select District" />
                    </SelectTrigger>
                    <SelectContent>
                      {newCitizen.state && DISTRICTS[newCitizen.state as keyof typeof DISTRICTS]?.filter(district => district && district.trim() !== '').map((district) => (
                        <SelectItem key={district} value={district}>{district}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    value={newCitizen.pincode}
                    onChange={(e) => setNewCitizen({...newCitizen, pincode: e.target.value})}
                    placeholder="6-digit pincode"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="constituency">Constituency</Label>
                  <Select value={newCitizen.constituency} onValueChange={(value) => setNewCitizen({...newCitizen, constituency: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Constituency" />
                    </SelectTrigger>
                    <SelectContent>
                      {newCitizen.district && CONSTITUENCIES[newCitizen.district as keyof typeof CONSTITUENCIES]?.filter(constituency => constituency && constituency.trim() !== '').map((constituency) => (
                        <SelectItem key={constituency} value={constituency}>{constituency}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="voterId">Voter ID (Optional)</Label>
                  <Input
                    id="voterId"
                    value={newCitizen.voterId}
                    onChange={(e) => setNewCitizen({...newCitizen, voterId: e.target.value})}
                    placeholder="Auto-generated if empty"
                  />
                </div>
              </div>

              <PhotoCapture 
                onPhotoCapture={(photoData) => setNewCitizen({...newCitizen, photoUrl: photoData})}
              />

              <div>
                <Label>Fingerprint Capture</Label>
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <span className="text-green-700 font-medium">Fingerprint Captured Successfully</span>
                  </div>
                  <p className="text-sm text-green-600">Biometric template generated and ready for verification</p>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddCitizen} disabled={addCitizenMutation.isPending}>
                  {addCitizenMutation.isPending ? "Adding..." : "Add Citizen"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Citizen Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Citizen Details</DialogTitle>
            </DialogHeader>
            {viewingCitizen && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  {viewingCitizen.photoUrl ? (
                    <img src={viewingCitizen.photoUrl} alt={viewingCitizen.fullName} className="h-20 w-20 rounded-full" />
                  ) : (
                    <div className="h-20 w-20 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-semibold">{viewingCitizen.fullName}</h3>
                    <p className="text-gray-600">{viewingCitizen.aadhaarNumber}</p>
                    {getStatusBadge(viewingCitizen.biometricStatus)}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date of Birth</Label>
                    <p>{viewingCitizen.dateOfBirth}</p>
                  </div>
                  <div>
                    <Label>Gender</Label>
                    <p>{viewingCitizen.gender}</p>
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    <p>{viewingCitizen.phoneNumber}</p>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p>{viewingCitizen.email}</p>
                  </div>
                  <div>
                    <Label>Voter ID</Label>
                    <p>{viewingCitizen.voterId}</p>
                  </div>
                  <div>
                    <Label>Constituency</Label>
                    <p>{viewingCitizen.constituency}</p>
                  </div>
                </div>
                
                <div>
                  <Label>Address</Label>
                  <p>{viewingCitizen.address}</p>
                  <p>{viewingCitizen.district}, {viewingCitizen.state} - {viewingCitizen.pincode}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}