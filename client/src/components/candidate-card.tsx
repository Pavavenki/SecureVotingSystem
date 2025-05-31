import { Badge } from "@/components/ui/badge";
import { User, CheckCircle } from "lucide-react";

interface Candidate {
  id: number;
  name: string;
  party: string;
  qualification?: string;
  experience?: string;
  photoUrl?: string;
  symbol?: string;
}

interface CandidateCardProps {
  candidate: Candidate;
  isSelected: boolean;
}

export default function CandidateCard({ candidate, isSelected }: CandidateCardProps) {
  const getPartyColor = (party: string) => {
    const colors: { [key: string]: string } = {
      "Indian National Congress": "bg-blue-100 border-blue-200",
      "Bharatiya Janata Party": "bg-orange-100 border-orange-200", 
      "Aam Aadmi Party": "bg-purple-100 border-purple-200",
      "default": "bg-gray-100 border-gray-200"
    };
    return colors[party] || colors.default;
  };

  const getPartySymbol = (party: string) => {
    const symbols: { [key: string]: string } = {
      "Indian National Congress": "🖐️",
      "Bharatiya Janata Party": "🪷",
      "Aam Aadmi Party": "🧹"
    };
    return symbols[party] || "🗳️";
  };

  return (
    <div className={`border-2 rounded-lg p-6 transition-all duration-200 ${
      isSelected
        ? "border-green-500 bg-green-50 shadow-md"
        : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
    }`}>
      <div className="flex items-center space-x-6">
        {/* Party Symbol */}
        <div className={`w-20 h-20 rounded-lg flex items-center justify-center flex-shrink-0 ${getPartyColor(candidate.party)}`}>
          <div className="text-3xl">
            {getPartySymbol(candidate.party)}
          </div>
        </div>

        {/* Candidate Photo */}
        <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0">
          {candidate.photoUrl ? (
            <img 
              src={candidate.photoUrl} 
              alt={candidate.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="h-8 w-8 text-gray-400" />
          )}
        </div>

        {/* Candidate Info */}
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-1">
            {candidate.name}
          </h3>
          <div className="flex items-center space-x-2 mb-2">
            <Badge variant="outline" className={getPartyColor(candidate.party)}>
              {candidate.party}
            </Badge>
          </div>
          {candidate.qualification && (
            <p className="text-sm text-gray-600 mb-1">
              <strong>Qualification:</strong> {candidate.qualification}
            </p>
          )}
          {candidate.experience && (
            <p className="text-sm text-gray-600">
              <strong>Experience:</strong> {candidate.experience}
            </p>
          )}
        </div>

        {/* Selection Indicator */}
        <div className={`w-6 h-6 border-2 rounded-full flex items-center justify-center flex-shrink-0 ${
          isSelected ? "border-green-500 bg-green-500" : "border-gray-300"
        }`}>
          {isSelected && (
            <CheckCircle className="w-4 h-4 text-white" />
          )}
        </div>
      </div>
    </div>
  );
}
