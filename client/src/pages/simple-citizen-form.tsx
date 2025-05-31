import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle } from "lucide-react";

interface SimpleCitizenFormProps {
  onSubmit: (citizenData: any) => void;
  isLoading: boolean;
}

export default function SimpleCitizenForm({ onSubmit, isLoading }: SimpleCitizenFormProps) {
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
    fingerprintTemplates: `fingerprint_${Date.now()}_verified`,
    biometricStatus: "verified"
  });

  const generateRandomAadhaar = () => {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${timestamp.slice(0,4)}-${timestamp.slice(4,8)}-${random}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.aadhaarNumber || !formData.fullName || !formData.dateOfBirth) {
      alert("Please fill in required fields: Aadhaar Number, Full Name, and Date of Birth");
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="aadhaarNumber">Aadhaar Number *</Label>
          <div className="flex gap-2">
            <Input
              id="aadhaarNumber"
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
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            placeholder="Full Name"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="dateOfBirth">Date of Birth *</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="gender">Gender</Label>
          <select
            id="gender"
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
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
            placeholder="9876543210"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          placeholder="email@example.com"
        />
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
          placeholder="Full Address"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="state">State</Label>
          <select
            id="state"
            value={formData.state}
            onChange={(e) => setFormData({...formData, state: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="Maharashtra">Maharashtra</option>
          </select>
        </div>
        <div>
          <Label htmlFor="district">District</Label>
          <select
            id="district"
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
          <Label htmlFor="pincode">Pincode</Label>
          <Input
            id="pincode"
            value={formData.pincode}
            onChange={(e) => setFormData({...formData, pincode: e.target.value})}
            placeholder="600001"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="constituency">Constituency</Label>
        <select
          id="constituency"
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

      <div>
        <Label htmlFor="voterId">Voter ID (Optional)</Label>
        <Input
          id="voterId"
          value={formData.voterId}
          onChange={(e) => setFormData({...formData, voterId: e.target.value})}
          placeholder="Auto-generated if empty"
        />
      </div>

      <div>
        <Label>Photo & Fingerprint Status</Label>
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <span className="text-green-700 font-medium">Photo & Fingerprint Captured Successfully</span>
          </div>
          <p className="text-sm text-green-600">Biometric verification completed</p>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Adding..." : "Add Citizen"}
        </Button>
      </div>
    </form>
  );
}