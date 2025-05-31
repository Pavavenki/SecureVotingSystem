import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import CandidateCard from "@/components/candidate-card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Vote, CheckCircle, AlertTriangle, User } from "lucide-react";

export default function VotingInterface() {
  const [, setLocation] = useLocation();
  const [selectedCandidate, setSelectedCandidate] = useState<string>("");
  const { toast } = useToast();

  // Mock voter data (in real app, this would come from session)
  const voterData = {
    name: "Rajesh Kumar Singh",
    voterId: "VTR123456789",
    constituency: "Mumbai North - 24"
  };

  // Fetch candidates for voter's constituency
  const { data: candidates = [], isLoading } = useQuery({
    queryKey: [`/api/candidates/${voterData.constituency}`],
  });

  // Vote submission mutation
  const voteMutation = useMutation({
    mutationFn: async (voteData: { candidateId?: number; isNota: boolean; constituency: string }) => {
      const response = await apiRequest("POST", "/api/vote", voteData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Vote Cast Successfully!",
        description: "Your vote has been securely recorded on the blockchain.",
      });
      setLocation("/voting/confirmation");
    },
    onError: (error: Error) => {
      toast({
        title: "Vote Submission Failed",
        description: error.message || "Failed to cast vote. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleVoteSubmit = () => {
    if (!selectedCandidate) {
      toast({
        title: "No Selection Made",
        description: "Please select a candidate before submitting your vote.",
        variant: "destructive",
      });
      return;
    }

    const isNota = selectedCandidate === "nota";
    const candidateId = isNota ? undefined : parseInt(selectedCandidate);

    voteMutation.mutate({
      candidateId,
      isNota,
      constituency: voterData.constituency
    });
  };

  const clearSelection = () => {
    setSelectedCandidate("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="bg-green-600 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                <Vote className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Cast Your Vote</h1>
                <p className="text-sm text-gray-600">Step 3 of 3: Select Your Candidate</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Constituency: {voterData.constituency}</p>
              <p className="text-xs text-gray-500">Voter: {voterData.name}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <div className="flex items-center flex-1">
              <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full text-sm">
                <CheckCircle className="h-4 w-4" />
              </div>
              <span className="ml-2 text-sm font-medium text-green-600">Identity Verified</span>
            </div>
            <div className="flex-1 h-1 bg-green-600 mx-4"></div>
            <div className="flex items-center flex-1">
              <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full text-sm">
                <CheckCircle className="h-4 w-4" />
              </div>
              <span className="ml-2 text-sm font-medium text-green-600">Biometric Verified</span>
            </div>
            <div className="flex-1 h-1 bg-green-600 mx-4"></div>
            <div className="flex items-center flex-1">
              <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full text-sm font-medium">
                3
              </div>
              <span className="ml-2 text-sm font-medium text-green-600">Cast Vote</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-semibold text-gray-900">
              Select Your Candidate
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Choose one candidate to cast your vote. This action cannot be undone.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-green-600/20 border-t-green-600 rounded-full animate-spin"></div>
                <span className="ml-2 text-gray-600">Loading candidates...</span>
              </div>
            ) : (
              <>
                {/* Candidates List */}
                <RadioGroup value={selectedCandidate} onValueChange={setSelectedCandidate}>
                  <div className="space-y-4">
                    {candidates.map((candidate: any) => (
                      <div key={candidate.id} className="relative">
                        <RadioGroupItem
                          value={candidate.id.toString()}
                          id={candidate.id.toString()}
                          className="sr-only"
                        />
                        <Label htmlFor={candidate.id.toString()} className="cursor-pointer">
                          <CandidateCard
                            candidate={candidate}
                            isSelected={selectedCandidate === candidate.id.toString()}
                          />
                        </Label>
                      </div>
                    ))}

                    {/* NOTA Option */}
                    <div className="relative">
                      <RadioGroupItem value="nota" id="nota" className="sr-only" />
                      <Label htmlFor="nota" className="cursor-pointer">
                        <div className={`border-2 rounded-lg p-6 transition-all duration-200 ${
                          selectedCandidate === "nota"
                            ? "border-green-500 bg-green-50 shadow-md"
                            : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                        }`}>
                          <div className="flex items-center space-x-6">
                            {/* NOTA Symbol */}
                            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <User className="h-10 w-10 text-gray-400 line-through" />
                            </div>

                            {/* NOTA Info */}
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold text-gray-900">NOTA</h3>
                              <p className="text-lg text-gray-600 mb-2">None of the Above</p>
                              <p className="text-sm text-gray-500">
                                Choose this option if you don't want to vote for any candidate
                              </p>
                            </div>

                            {/* Selection Indicator */}
                            <div className={`w-6 h-6 border-2 rounded-full flex items-center justify-center ${
                              selectedCandidate === "nota" ? "border-green-500" : "border-gray-300"
                            }`}>
                              {selectedCandidate === "nota" && (
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>

                {/* Vote Confirmation Notice */}
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    <strong>Important Notice:</strong> Once you submit your vote, it cannot be changed. 
                    Please review your selection carefully before proceeding. Your vote will be recorded 
                    on the blockchain for transparency and immutability.
                  </AlertDescription>
                </Alert>

                {/* Selected Candidate Display */}
                {selectedCandidate && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-700 font-medium">Selected Candidate:</p>
                        <p className="text-lg font-semibold text-green-900">
                          {selectedCandidate === "nota" 
                            ? "NOTA (None of the Above)"
                            : candidates.find((c: any) => c.id.toString() === selectedCandidate)?.name
                          }
                        </p>
                      </div>
                      <Badge variant="outline" className="border-green-600 text-green-700">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Selected
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-6 border-t">
                  <Link href="/voting/biometric">
                    <Button variant="outline">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Biometric
                    </Button>
                  </Link>

                  <div className="flex space-x-4">
                    {selectedCandidate && (
                      <Button variant="outline" onClick={clearSelection}>
                        Clear Selection
                      </Button>
                    )}

                    <Button
                      onClick={handleVoteSubmit}
                      disabled={!selectedCandidate || voteMutation.isPending}
                      className="bg-green-600 hover:bg-green-700 text-white px-8"
                    >
                      {voteMutation.isPending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
                          Submitting Vote...
                        </>
                      ) : (
                        <>
                          <Vote className="h-4 w-4 mr-2" />
                          Submit Vote
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
