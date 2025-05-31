import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  LogOut
} from "lucide-react";

export default function AadhaarDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  // Fetch citizens data
  const { data: citizens = [], isLoading } = useQuery({
    queryKey: ["/api/citizens"],
  });

  // Mock statistics (in real app, this would come from API)
  const stats = {
    totalCitizens: "1,24,567",
    verifiedBiometrics: "98,432",
    pendingUpdates: "234",
    failedVerifications: "45"
  };

  const filteredCitizens = citizens.filter((citizen: any) => {
    const matchesSearch = !searchQuery || 
      citizen.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      citizen.aadhaarNumber?.includes(searchQuery) ||
      citizen.district?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDistrict = !selectedDistrict || citizen.district === selectedDistrict;
    
    return matchesSearch && matchesDistrict;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Aadhaar Management</h1>
                <p className="text-sm text-gray-600">Admin Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Admin User</span>
              <Link href="/">
                <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Citizens</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalCitizens}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-green-600 rounded-full w-12 h-12 flex items-center justify-center">
                  <Fingerprint className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Verified Biometrics</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.verifiedBiometrics}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-orange-500 rounded-full w-12 h-12 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Pending Updates</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.pendingUpdates}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-red-600 rounded-full w-12 h-12 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Failed Verifications</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.failedVerifications}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Citizen
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
        </div>

        {/* Citizens Management */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold">Citizen Records</CardTitle>
              <div className="flex space-x-4">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search by Aadhaar, Name, District..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                >
                  <option value="">All Districts</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Chennai">Chennai</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                <span className="ml-2 text-gray-600">Loading citizens...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Aadhaar Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        District
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Biometric Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCitizens.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                          No citizens found matching your criteria
                        </td>
                      </tr>
                    ) : (
                      filteredCitizens.map((citizen: any) => (
                        <tr key={citizen.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {citizen.aadhaarNumber}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gray-300 rounded-full mr-3 flex items-center justify-center">
                                <Users className="h-4 w-4 text-gray-600" />
                              </div>
                              <span className="text-sm text-gray-900">{citizen.fullName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {citizen.district}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <Badge 
                                variant={citizen.fingerprintTemplates ? "default" : "secondary"}
                                className={citizen.fingerprintTemplates ? "bg-green-100 text-green-800" : ""}
                              >
                                <Fingerprint className="h-3 w-3 mr-1" />
                                {citizen.fingerprintTemplates ? "Verified" : "Pending"}
                              </Badge>
                              <Badge 
                                variant={citizen.faceTemplate ? "default" : "secondary"}
                                className={citizen.faceTemplate ? "bg-green-100 text-green-800" : ""}
                              >
                                Face {citizen.faceTemplate ? "Verified" : "Pending"}
                              </Badge>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-800">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t">
              <span className="text-sm text-gray-600">
                Showing {filteredCitizens.length} results
              </span>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" className="bg-blue-600 text-white">
                  1
                </Button>
                <Button variant="outline" size="sm">
                  2
                </Button>
                <Button variant="outline" size="sm">
                  3
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
