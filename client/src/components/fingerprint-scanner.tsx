import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Fingerprint, CheckCircle, X, AlertTriangle } from "lucide-react";

interface FingerprintScannerProps {
  onScan: (fingerprintData: string) => void;
  isActive: boolean;
  status: "pending" | "verified" | "failed";
}

export default function FingerprintScanner({ onScan, isActive, status }: FingerprintScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const simulateFingerprintScan = useCallback(async () => {
    if (!isActive || isScanning) return;

    setIsScanning(true);
    setScanProgress(0);

    // Simulate scanning progress
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          // Generate mock fingerprint data
          const mockFingerprintData = `FP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          setTimeout(() => {
            onScan(mockFingerprintData);
            setIsScanning(false);
          }, 100);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  }, [isActive, isScanning, onScan]);

  const getScannerColor = () => {
    if (status === "verified") return "bg-green-500";
    if (status === "failed") return "bg-red-500";
    if (isScanning) return "bg-blue-500";
    return "bg-gray-300";
  };

  const getStatusMessage = () => {
    if (status === "verified") return "Fingerprint verified successfully!";
    if (status === "failed") return "Fingerprint verification failed. Please try again.";
    if (isScanning) return `Scanning fingerprint... ${scanProgress}%`;
    return "Place your finger on the scanner";
  };

  const getStatusIcon = () => {
    if (status === "verified") return <CheckCircle className="h-6 w-6 text-green-600" />;
    if (status === "failed") return <X className="h-6 w-6 text-red-600" />;
    if (isScanning) return <div className="w-6 h-6 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>;
    return <Fingerprint className="h-6 w-6 text-gray-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Scanner Display */}
      <div className="text-center">
        <div 
          className={`w-32 h-32 rounded-full mx-auto mb-4 flex items-center justify-center transition-all duration-300 ${getScannerColor()} shadow-lg cursor-pointer`}
          onClick={simulateFingerprintScan}
        >
          {status === "verified" ? (
            <CheckCircle className="h-16 w-16 text-white" />
          ) : status === "failed" ? (
            <X className="h-16 w-16 text-white" />
          ) : (
            <Fingerprint className={`h-16 w-16 text-white ${isScanning ? 'animate-pulse' : ''}`} />
          )}
        </div>

        {/* Progress Ring for Scanning */}
        {isScanning && (
          <div className="relative -mt-36 mb-4">
            <svg className="w-32 h-32 mx-auto transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                className="text-gray-200"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={`${(scanProgress / 100) * 351.86} 351.86`}
                className="text-blue-500 transition-all duration-200"
              />
            </svg>
          </div>
        )}

        {/* Status Display */}
        <div className="flex items-center justify-center space-x-2 mb-4">
          {getStatusIcon()}
          <span className={`text-sm font-medium ${
            status === "verified" ? "text-green-600" :
            status === "failed" ? "text-red-600" :
            isScanning ? "text-blue-600" : "text-gray-600"
          }`}>
            {getStatusMessage()}
          </span>
        </div>
      </div>

      {/* Scan Button */}
      <div className="text-center">
        <Button
          onClick={simulateFingerprintScan}
          disabled={!isActive || isScanning || status === "verified"}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {isScanning ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
              Scanning...
            </>
          ) : status === "verified" ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Verified
            </>
          ) : (
            <>
              <Fingerprint className="h-4 w-4 mr-2" />
              Scan Fingerprint
            </>
          )}
        </Button>
      </div>

      {/* Instructions */}
      <Alert>
        <Fingerprint className="h-4 w-4" />
        <AlertDescription>
          Place your registered finger firmly on the scanner pad. Keep your finger steady during the scan process.
        </AlertDescription>
      </Alert>

      {/* Security Notice */}
      <div className="text-xs text-gray-500 text-center bg-gray-50 p-3 rounded">
        <p><strong>Security Notice:</strong> Fingerprint data is processed locally and compared against encrypted templates stored in the Aadhaar database.</p>
      </div>
    </div>
  );
}
