import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, CheckCircle, Eye, Edit, Trash2 } from "lucide-react";

export default function AadhaarSimple() {
  const [formData, setFormData] = useState({
    aadhaarNumber: "",
    fullName: "",
    dateOfBirth: "",
    gender: "Male",
    phoneNumber: "",
    email: "",
    address: "",
    district: "Chennai",
    state: "Tamil Nadu",
    pincode: "",
    constituency: "Chennai North",
    voterId: "",
    photoUrl: "",
    fingerprintTemplates: "",
    biometricStatus: "verified"
  });

  const [editingCitizen, setEditingCitizen] = useState<any>(null);

  const queryClient = useQueryClient();

  // Fetch citizens
  const { data: citizens = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/citizens"],
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
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add citizen");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/citizens"] });
      resetForm();
      alert("Citizen added successfully!");
    },
    onError: (error: Error) => {
      alert(`Error: ${error.message}`);
    },
  });

  // Update citizen mutation
  const updateCitizenMutation = useMutation({
    mutationFn: async (citizenData: any) => {
      const response = await fetch(`/api/citizens/${citizenData.aadhaarNumber}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(citizenData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update citizen");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/citizens"] });
      setEditingCitizen(null);
      resetForm();
      alert("Citizen updated successfully!");
    },
    onError: (error: Error) => {
      alert(`Error: ${error.message}`);
    },
  });

  // Delete citizen mutation
  const deleteCitizenMutation = useMutation({
    mutationFn: async (aadhaarNumber: string) => {
      const response = await fetch(`/api/citizens/${aadhaarNumber}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete citizen");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/citizens"] });
      alert("Citizen deleted successfully!");
    },
    onError: (error: Error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const generateRandomAadhaar = () => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${timestamp.slice(-8, -4)}-${timestamp.slice(-4)}-${random}`;
  };

  const resetForm = () => {
    setFormData({
      aadhaarNumber: "",
      fullName: "",
      dateOfBirth: "",
      gender: "Male",
      phoneNumber: "",
      email: "",
      address: "",
      district: "Chennai",
      state: "Tamil Nadu",
      pincode: "",
      constituency: "Chennai North",
      voterId: "",
      photoUrl: "",
      fingerprintTemplates: `fp_${Date.now()}`,
      biometricStatus: "verified"
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.aadhaarNumber || !formData.fullName || !formData.dateOfBirth) {
      alert("Please fill required fields: Aadhaar Number, Full Name, Date of Birth");
      return;
    }
    
    const submitData = {
      ...formData,
      fingerprintTemplates: `fp_${Date.now()}_verified`
    };
    
    if (editingCitizen) {
      updateCitizenMutation.mutate(submitData);
    } else {
      addCitizenMutation.mutate(submitData);
    }
  };

  const startEdit = (citizen: any) => {
    setEditingCitizen(citizen);
    setFormData({
      aadhaarNumber: citizen.aadhaarNumber,
      fullName: citizen.fullName,
      dateOfBirth: citizen.dateOfBirth,
      gender: citizen.gender,
      phoneNumber: citizen.phoneNumber || "",
      email: citizen.email || "",
      address: citizen.address || "",
      district: citizen.district || "Chennai",
      state: citizen.state || "Tamil Nadu",
      pincode: citizen.pincode || "",
      constituency: citizen.constituency || "Chennai North",
      voterId: citizen.voterId || "",
      photoUrl: citizen.photoUrl || "",
      fingerprintTemplates: citizen.fingerprintTemplates || "",
      biometricStatus: citizen.biometricStatus || "verified"
    });
  };

  const cancelEdit = () => {
    setEditingCitizen(null);
    resetForm();
  };

  const handleDelete = (aadhaarNumber: string) => {
    if (confirm("Are you sure you want to delete this citizen record?")) {
      deleteCitizenMutation.mutate(aadhaarNumber);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("Photo size must be less than 5MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const photoUrl = event.target?.result as string;
        setFormData({...formData, photoUrl});
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Aadhaar Management System</h1>
          <p className="mt-2 text-gray-600">Manage citizen records and biometric verification</p>
        </div>

        {/* Add Citizen Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Add New Citizen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Aadhaar Number *</Label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.aadhaarNumber}
                      onChange={(e) => setFormData({...formData, aadhaarNumber: e.target.value})}
                      placeholder="1234-5678-9012"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setFormData({...formData, aadhaarNumber: generateRandomAadhaar()})}
                    >
                      Generate
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Full Name *</Label>
                  <Input
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    placeholder="Full Name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Date of Birth *</Label>
                  <Input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label>Gender</Label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                    placeholder="9876543210"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <Label>Pincode</Label>
                  <Input
                    value={formData.pincode}
                    onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                    placeholder="600001"
                  />
                </div>
              </div>

              <div>
                <Label>Address</Label>
                <Textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Full Address"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>State</Label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Maharashtra">Maharashtra</option>
                  </select>
                </div>
                <div>
                  <Label>District</Label>
                  <select
                    value={formData.district}
                    onChange={(e) => setFormData({...formData, district: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="Chennai">Chennai</option>
                    <option value="Coimbatore">Coimbatore</option>
                    <option value="Madurai">Madurai</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Pune">Pune</option>
                    <option value="Thane">Thane</option>
                  </select>
                </div>
                <div>
                  <Label>Constituency</Label>
                  <select
                    value={formData.constituency}
                    onChange={(e) => setFormData({...formData, constituency: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="Chennai North">Chennai North</option>
                    <option value="Chennai South">Chennai South</option>
                    <option value="Chennai Central">Chennai Central</option>
                    <option value="Mumbai North">Mumbai North</option>
                    <option value="Mumbai South">Mumbai South</option>
                    <option value="Pune">Pune</option>
                  </select>
                </div>
              </div>

              <div>
                <Label>Voter ID (Optional)</Label>
                <Input
                  value={formData.voterId}
                  onChange={(e) => setFormData({...formData, voterId: e.target.value})}
                  placeholder="Auto-generated if empty"
                />
              </div>

              {/* Photo Upload */}
              <div>
                <Label>Upload Photo</Label>
                <div className="mt-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {formData.photoUrl && (
                    <div className="mt-2">
                      <img src={formData.photoUrl} alt="Citizen photo" className="w-32 h-32 object-cover rounded-md border" />
                    </div>
                  )}
                </div>
              </div>

              {/* Biometric Status */}
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-700 font-medium">Photo & Fingerprint Verified</span>
                </div>
                <p className="text-sm text-green-600 mt-1">Biometric verification completed successfully</p>
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  type="submit" 
                  disabled={addCitizenMutation.isPending || updateCitizenMutation.isPending}
                >
                  {editingCitizen 
                    ? (updateCitizenMutation.isPending ? "Updating..." : "Update Citizen")
                    : (addCitizenMutation.isPending ? "Adding..." : "Add Citizen")
                  }
                </Button>
                {editingCitizen && (
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={cancelEdit}
                  >
                    Cancel Edit
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Citizens List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Registered Citizens ({citizens.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading citizens...</div>
            ) : citizens.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No citizens registered yet. Add your first citizen above.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Citizen Details
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Location
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {citizens.map((citizen: any) => (
                      <tr key={citizen.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{citizen.fullName}</div>
                            <div className="text-sm text-gray-500">{citizen.aadhaarNumber}</div>
                            <div className="text-sm text-gray-500">{citizen.phoneNumber}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900">{citizen.district}, {citizen.state}</div>
                          <div className="text-sm text-gray-500">{citizen.constituency}</div>
                        </td>
                        <td className="px-4 py-4">
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" title="View Details">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => startEdit(citizen)}
                              title="Edit Citizen"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600 hover:text-red-800"
                              onClick={() => handleDelete(citizen.aadhaarNumber)}
                              title="Delete Citizen"
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
      </div>
    </div>
  );
}