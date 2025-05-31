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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { 
  Vote, 
  Users, 
  BarChart3, 
  MapPin, 
  UserPlus, 
  Search, 
  Eye,
  Edit,
  Trash2,
  LogOut,
  Download,
  TrendingUp,
  Clock,
  CheckCircle
} from "lucide-react";

export default function VotingAdminDashboard() {
  const [selectedConstituency, setSelectedConstituency] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddVoterDialogOpen, setIsAddVoterDialogOpen] = useState(false);
  const [isAddCandidateDialogOpen, setIsAddCandidateDialogOpen] = useState(false);
  const [newVoter, setNewVoter] = useState({
    voterId: "",
    aadhaarNumber: "",
    password: "",
    fullName: "",
    constituency: ""
  });
  const [editingVoter, setEditingVoter] = useState<any>(null);
  const [newCandidate, setNewCandidate] = useState({
    name: "",
    party: "",
    constituency: "",
    qualification: "",
    experience: "",
    photoUrl: ""
  });
  const [editingCandidate, setEditingCandidate] = useState<any>(null);

  const queryClient = useQueryClient();
  
  // Fetch voting statistics
  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  // Fetch voters
  const { data: voters = [] } = useQuery({
    queryKey: ["/api/voters"],
  });

  // Fetch candidates
  const { data: candidates = [] } = useQuery({
    queryKey: ["/api/candidates"],
  });

  // Mock constituency data for results
  const constituencies = [
    "Mumbai North - 24",
    "Mumbai South - 25", 
    "Thane - 26",
    "Pune - 27"
  ];

  // Fetch results for selected constituency
  const { data: results } = useQuery({
    queryKey: [`/api/results/${selectedConstituency}`],
    enabled: !!selectedConstituency,
  });

  // CRUD Mutations
  const addVoterMutation = useMutation({
    mutationFn: async (voterData: any) => {
      const response = await apiRequest("POST", "/api/voters", voterData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/voters"] });
      setIsAddVoterDialogOpen(false);
      setNewVoter({ voterId: "", aadhaarNumber: "", password: "", fullName: "", constituency: "" });
    }
  });

  const addCandidateMutation = useMutation({
    mutationFn: async (candidateData: any) => {
      const response = await apiRequest("POST", "/api/candidates", candidateData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/candidates"] });
      setIsAddCandidateDialogOpen(false);
      setNewCandidate({ name: "", party: "", constituency: "", qualification: "", experience: "", photoUrl: "" });
    }
  });

  const updateVoterMutation = useMutation({
    mutationFn: async (voterData: any) => {
      const response = await apiRequest("PUT", `/api/voters/${voterData.voterId}`, voterData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/voters"] });
      setEditingVoter(null);
      setNewVoter({ voterId: "", aadhaarNumber: "", password: "", fullName: "", constituency: "" });
    }
  });

  const updateCandidateMutation = useMutation({
    mutationFn: async (candidateData: any) => {
      const response = await apiRequest("PUT", `/api/candidates/${candidateData.id}`, candidateData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/candidates"] });
      setEditingCandidate(null);
      setNewCandidate({ name: "", party: "", constituency: "", qualification: "", experience: "" });
    }
  });

  const deleteVoterMutation = useMutation({
    mutationFn: async (voterId: string) => {
      const response = await apiRequest("DELETE", `/api/voters/${voterId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/voters"] });
    }
  });

  const deleteCandidateMutation = useMutation({
    mutationFn: async (candidateId: string) => {
      const response = await apiRequest("DELETE", `/api/candidates/${candidateId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/candidates"] });
    }
  });

  const handleEditVoter = (voter: any) => {
    setEditingVoter(voter);
    setNewVoter({
      voterId: voter.voterId,
      aadhaarNumber: voter.aadhaarNumber,
      password: voter.password,
      fullName: voter.fullName,
      constituency: voter.constituency
    });
    setIsAddVoterDialogOpen(true);
  };

  const handleEditCandidate = (candidate: any) => {
    setEditingCandidate(candidate);
    setNewCandidate({
      name: candidate.name,
      party: candidate.party,
      constituency: candidate.constituency,
      qualification: candidate.qualification || "",
      experience: candidate.experience || ""
    });
    setIsAddCandidateDialogOpen(true);
  };

  const handleDeleteVoter = (voterId: string) => {
    if (confirm("Are you sure you want to delete this voter?")) {
      deleteVoterMutation.mutate(voterId);
    }
  };

  const handleDeleteCandidate = (candidateId: string) => {
    if (confirm("Are you sure you want to delete this candidate?")) {
      deleteCandidateMutation.mutate(candidateId);
    }
  };

  const displayStats = stats || {
    totalVotes: 0,
    eligibleVoters: 0,
    constituencies: 0,
    turnoutRate: "0.0"
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="bg-green-600 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Voting Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Election Management & Results</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Admin Panel</span>
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
                <div className="bg-green-600 rounded-full w-12 h-12 flex items-center justify-center">
                  <Vote className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Votes Cast</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {displayStats.totalVotes.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Eligible Voters</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {displayStats.eligibleVoters.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-orange-500 rounded-full w-12 h-12 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Turnout Rate</p>
                  <p className="text-2xl font-semibold text-gray-900">{displayStats.turnoutRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-purple-600 rounded-full w-12 h-12 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Constituencies</p>
                  <p className="text-2xl font-semibold text-gray-900">{displayStats.constituencies}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Election Results Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-semibold">Real-time Election Results</CardTitle>
              <div className="flex items-center space-x-4">
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={selectedConstituency}
                  onChange={(e) => setSelectedConstituency(e.target.value)}
                >
                  <option value="">Select Constituency</option>
                  {constituencies.map((constituency) => (
                    <option key={constituency} value={constituency}>
                      {constituency}
                    </option>
                  ))}
                </select>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Results
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {selectedConstituency && results ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Results List */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Vote Distribution</h4>
                  <div className="space-y-3">
                    {results.results.map((result: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded mr-3 ${
                            index === 0 ? 'bg-green-500' : 
                            index === 1 ? 'bg-blue-500' : 
                            index === 2 ? 'bg-orange-500' : 'bg-gray-500'
                          }`}></div>
                          <div>
                            <span className="font-medium text-gray-900">
                              {result.candidate.name}
                            </span>
                            <span className="text-sm text-gray-600 ml-2">
                              ({result.candidate.party})
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-gray-900">
                            {result.votes.toLocaleString()} votes
                          </span>
                          <span className="text-sm text-gray-600 block">
                            {result.percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Results Chart Placeholder */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Visual Representation</h4>
                  <div className="w-full h-80 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">Results Chart</p>
                      <p className="text-sm text-gray-500">Live blockchain data visualization</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Total: {results.totalVotes.toLocaleString()} votes
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Select a constituency to view real-time results</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Management Tabs */}
        <Card>
          <CardContent className="p-0">
            <Tabs defaultValue="voters" className="w-full">
              <div className="border-b border-gray-200 px-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="voters" className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Voter Management
                  </TabsTrigger>
                  <TabsTrigger value="candidates" className="flex items-center">
                    <Vote className="h-4 w-4 mr-2" />
                    Candidate Management
                  </TabsTrigger>
                  <TabsTrigger value="blockchain" className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Blockchain Logs
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Voters Tab */}
              <TabsContent value="voters" className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-lg font-medium text-gray-900">Voter Management</h4>
                  <div className="flex space-x-4">
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input 
                        placeholder="Search voters..." 
                        className="pl-10 w-80"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Dialog open={isAddVoterDialogOpen} onOpenChange={setIsAddVoterDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add Voter
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Voter</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Voter ID</Label>
                            <Input
                              value={newVoter.voterId}
                              onChange={(e) => setNewVoter({...newVoter, voterId: e.target.value})}
                              placeholder="VTR123456789"
                            />
                          </div>
                          <div>
                            <Label>Aadhaar Number</Label>
                            <Input
                              value={newVoter.aadhaarNumber}
                              onChange={(e) => setNewVoter({...newVoter, aadhaarNumber: e.target.value})}
                              placeholder="1234-5678-9012"
                            />
                          </div>
                          <div>
                            <Label>Password</Label>
                            <Input
                              type="password"
                              value={newVoter.password}
                              onChange={(e) => setNewVoter({...newVoter, password: e.target.value})}
                              placeholder="Enter password"
                            />
                          </div>
                          <div>
                            <Label>Full Name</Label>
                            <Input
                              value={newVoter.fullName}
                              onChange={(e) => setNewVoter({...newVoter, fullName: e.target.value})}
                              placeholder="Enter full name"
                            />
                          </div>
                          <div>
                            <Label>Constituency</Label>
                            <Select value={newVoter.constituency} onValueChange={(value) => setNewVoter({...newVoter, constituency: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select constituency" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Mumbai North - 24">Mumbai North - 24</SelectItem>
                                <SelectItem value="Mumbai South - 25">Mumbai South - 25</SelectItem>
                                <SelectItem value="Thane - 26">Thane - 26</SelectItem>
                                <SelectItem value="Pune - 27">Pune - 27</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2 mt-4">
                          <Button variant="outline" onClick={() => {
                            setIsAddVoterDialogOpen(false);
                            setEditingVoter(null);
                            setNewVoter({ voterId: "", aadhaarNumber: "", password: "", fullName: "", constituency: "" });
                          }}>Cancel</Button>
                          <Button 
                            onClick={() => {
                              if (editingVoter) {
                                updateVoterMutation.mutate({ ...newVoter, id: editingVoter.id });
                              } else {
                                addVoterMutation.mutate(newVoter);
                              }
                            }} 
                            disabled={addVoterMutation.isPending || updateVoterMutation.isPending}
                          >
                            {editingVoter 
                              ? (updateVoterMutation.isPending ? "Updating..." : "Update Voter")
                              : (addVoterMutation.isPending ? "Adding..." : "Add Voter")
                            }
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                          Voter ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                          Constituency
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                          Voted
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Array.isArray(voters) && voters.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                            No voters found
                          </td>
                        </tr>
                      ) : (
                        Array.isArray(voters) && voters
                          .filter((voter: any) => {
                            if (!searchQuery) return true;
                            return voter.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                   voter.voterId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                   voter.constituency?.toLowerCase().includes(searchQuery.toLowerCase());
                          })
                          .map((voter: any) => (
                            <tr key={voter.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm font-mono text-gray-900">
                                {voter.voterId}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                {voter.fullName}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                {voter.constituency}
                              </td>
                              <td className="px-6 py-4">
                                <Badge variant={voter.isActive ? "default" : "secondary"}>
                                  {voter.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </td>
                              <td className="px-6 py-4">
                                <Badge variant={voter.hasVoted ? "default" : "secondary"}>
                                  {voter.hasVoted ? "Yes" : "No"}
                                </Badge>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex space-x-2">
                                  <Button variant="ghost" size="sm" className="text-blue-600">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-orange-600"
                                    onClick={() => handleEditVoter(voter)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-red-600"
                                    onClick={() => {
                                      if (confirm("Are you sure you want to delete this voter?")) {
                                        deleteVoterMutation.mutate(voter.voterId);
                                      }
                                    }}
                                  >
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
              </TabsContent>

              {/* Candidates Tab */}
              <TabsContent value="candidates" className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-lg font-medium text-gray-900">Candidate Management</h4>
                  <Dialog open={isAddCandidateDialogOpen} onOpenChange={setIsAddCandidateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-green-600 hover:bg-green-700">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Candidate
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Candidate</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Name</Label>
                          <Input
                            value={newCandidate.name}
                            onChange={(e) => setNewCandidate({...newCandidate, name: e.target.value})}
                            placeholder="Enter candidate name"
                          />
                        </div>
                        <div>
                          <Label>Party</Label>
                          <Input
                            value={newCandidate.party}
                            onChange={(e) => setNewCandidate({...newCandidate, party: e.target.value})}
                            placeholder="Enter party name"
                          />
                        </div>
                        <div>
                          <Label>Constituency</Label>
                          <Select value={newCandidate.constituency} onValueChange={(value) => setNewCandidate({...newCandidate, constituency: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select constituency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Mumbai North - 24">Mumbai North - 24</SelectItem>
                              <SelectItem value="Mumbai South - 25">Mumbai South - 25</SelectItem>
                              <SelectItem value="Thane - 26">Thane - 26</SelectItem>
                              <SelectItem value="Pune - 27">Pune - 27</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Qualification</Label>
                          <Input
                            value={newCandidate.qualification}
                            onChange={(e) => setNewCandidate({...newCandidate, qualification: e.target.value})}
                            placeholder="Enter qualification"
                          />
                        </div>
                        <div>
                          <Label>Experience</Label>
                          <Input
                            value={newCandidate.experience}
                            onChange={(e) => setNewCandidate({...newCandidate, experience: e.target.value})}
                            placeholder="Enter experience"
                          />
                        </div>
                        <div>
                          <Label>Party Logo URL</Label>
                          <Input
                            value={newCandidate.photoUrl}
                            onChange={(e) => setNewCandidate({...newCandidate, photoUrl: e.target.value})}
                            placeholder="Enter Google image URL for party logo"
                          />
                          {newCandidate.photoUrl && (
                            <div className="mt-2">
                              <img 
                                src={newCandidate.photoUrl} 
                                alt="Party logo preview" 
                                className="w-16 h-16 object-contain rounded border"
                                onError={(e) => {
                                  e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z'%3E%3C/path%3E%3Cpolyline points='3.27,6.96 12,12.01 20.73,6.96'%3E%3C/polyline%3E%3Cline x1='12' y1='22.08' x2='12' y2='12'%3E%3C/line%3E%3C/svg%3E";
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2 mt-4">
                        <Button variant="outline" onClick={() => setIsAddCandidateDialogOpen(false)}>Cancel</Button>
                        <Button onClick={() => addCandidateMutation.mutate(newCandidate)} disabled={addCandidateMutation.isPending}>
                          {addCandidateMutation.isPending ? "Adding..." : "Add Candidate"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {candidates.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      <Vote className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>No candidates found</p>
                    </div>
                  ) : (
                    candidates.map((candidate: any) => (
                      <Card key={candidate.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="text-center">
                            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                              <Users className="h-8 w-8 text-gray-400" />
                            </div>
                            <h5 className="font-semibold text-gray-900 mb-1">{candidate.name}</h5>
                            <p className="text-sm text-gray-600 mb-2">{candidate.party}</p>
                            <p className="text-xs text-gray-500 mb-4">{candidate.constituency}</p>
                            
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" className="flex-1">
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1 text-red-600 border-red-200"
                                onClick={() => {
                                  if (confirm("Are you sure you want to remove this candidate?")) {
                                    deleteCandidateMutation.mutate(candidate.id);
                                  }
                                }}
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Blockchain Logs Tab */}
              <TabsContent value="blockchain" className="p-6">
                <div className="text-center py-8">
                  <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Blockchain Transaction Logs</h4>
                  <p className="text-gray-600 mb-4">
                    Real-time monitoring of all voting transactions on the blockchain
                  </p>
                  <div className="flex justify-center space-x-4">
                    <Badge variant="outline" className="border-green-300 text-green-700">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Blockchain Active
                    </Badge>
                    <Badge variant="outline" className="border-blue-300 text-blue-700">
                      <Clock className="h-3 w-3 mr-1" />
                      Real-time Monitoring
                    </Badge>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
