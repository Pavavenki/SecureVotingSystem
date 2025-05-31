import { useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Home, Share2, Download } from "lucide-react";

export default function VoteConfirmation() {
  // Mock vote data (in real app, this would come from the voting submission)
  const voteData = {
    voteId: `VT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toLocaleString(),
    blockchainHash: `0x${Math.random().toString(16).substr(2, 40)}`,
    constituency: "Mumbai North - 24",
    voterName: "Rajesh Kumar Singh"
  };

  // Cleanup any camera streams when component mounts
  useEffect(() => {
    // Stop any active camera streams
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        stream.getTracks().forEach(track => track.stop());
      })
      .catch(() => {
        // Camera not accessible, which is fine
      });
  }, []);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Vote Confirmation',
        text: `I have successfully cast my vote in the digital election. Vote ID: ${voteData.voteId}`,
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(`Vote ID: ${voteData.voteId}`);
    }
  };

  const handleDownloadReceipt = () => {
    const receiptData = `
DIGITAL VOTING RECEIPT
=====================

Vote ID: ${voteData.voteId}
Timestamp: ${voteData.timestamp}
Constituency: ${voteData.constituency}
Voter: ${voteData.voterName}
Blockchain Hash: ${voteData.blockchainHash}

This vote has been securely recorded on the blockchain
and cannot be modified or deleted.

Thank you for participating in the democratic process!
    `;

    const blob = new Blob([receiptData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vote-receipt-${voteData.voteId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-700 to-green-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="bg-white shadow-2xl border-0">
          <CardContent className="p-8 text-center">
            {/* Success Icon */}
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>

            {/* Success Message */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Vote Cast Successfully!
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Thank you for participating in the democratic process. Your vote has been 
              securely recorded on the blockchain and cannot be modified.
            </p>

            {/* Vote Details */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Vote Confirmation Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="text-left">
                  <span className="text-gray-600 block">Vote ID:</span>
                  <code className="font-mono text-gray-900 break-all">{voteData.voteId}</code>
                </div>
                <div className="text-left">
                  <span className="text-gray-600 block">Timestamp:</span>
                  <span className="text-gray-900">{voteData.timestamp}</span>
                </div>
                <div className="text-left">
                  <span className="text-gray-600 block">Constituency:</span>
                  <span className="text-gray-900">{voteData.constituency}</span>
                </div>
                <div className="text-left">
                  <span className="text-gray-600 block">Voter:</span>
                  <span className="text-gray-900">{voteData.voterName}</span>
                </div>
                <div className="text-left md:col-span-2">
                  <span className="text-gray-600 block">Blockchain Hash:</span>
                  <code className="font-mono text-xs text-gray-900 break-all">{voteData.blockchainHash}</code>
                </div>
              </div>
            </div>

            {/* Security Features */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">
                <CheckCircle className="h-3 w-3 mr-1" />
                Blockchain Secured
              </Badge>
              <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-50">
                <CheckCircle className="h-3 w-3 mr-1" />
                Biometric Verified
              </Badge>
              <Badge variant="outline" className="text-purple-700 border-purple-300 bg-purple-50">
                <CheckCircle className="h-3 w-3 mr-1" />
                Immutable Record
              </Badge>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleDownloadReceipt}
                variant="outline"
                className="border-green-600 text-green-700 hover:bg-green-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Receipt
              </Button>

              <Button
                onClick={handleShare}
                variant="outline"
                className="border-blue-600 text-blue-700 hover:bg-blue-50"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Confirmation
              </Button>

              <Link href="/">
                <Button className="bg-green-600 hover:bg-green-700 text-white px-8">
                  <Home className="h-4 w-4 mr-2" />
                  Return to Home
                </Button>
              </Link>
            </div>

            {/* Additional Information */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Important:</strong> Your vote is now part of the permanent blockchain record. 
                For any queries regarding this election, please contact the Election Commission 
                with your Vote ID: <code className="font-mono">{voteData.voteId}</code>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
