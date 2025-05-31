import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, CheckCircle, X, RotateCcw } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  isActive: boolean;
  status: "pending" | "verified" | "failed";
}

export default function CameraCapture({ onCapture, isActive, status }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setError(null);

      // Stop any existing stream first
      stopCamera();

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsStreaming(true);
        setHasPermission(true);
      }
    } catch (err) {
      console.error("Camera permission denied:", err);
      setHasPermission(false);
      setError("Camera access denied. Please allow camera permissions and try again.");
    }
  }, [stopCamera]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isStreaming) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (context && video.videoWidth > 0 && video.videoHeight > 0) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);

      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(imageData);
      onCapture(imageData);
      stopCamera();
    }
  }, [isStreaming, onCapture, stopCamera]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    if (isActive) {
      startCamera();
    }
  }, [startCamera, isActive]);

  useEffect(() => {
    if (isActive && !isStreaming && !capturedImage && hasPermission !== false) {
      startCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isActive, startCamera, stopCamera, isStreaming, capturedImage, hasPermission]);

  const getStatusMessage = () => {
    if (status === "verified") return "Face verification successful!";
    if (status === "failed") return "Face verification failed. Please try again.";
    if (capturedImage) return "Photo captured. Processing...";
    if (hasPermission === false) return "Camera permission required";
    if (!isStreaming) return "Starting camera...";
    return "Position your face in the frame and capture";
  };

  const getStatusColor = () => {
    if (status === "verified") return "text-green-600";
    if (status === "failed") return "text-red-600";
    if (error) return "text-red-600";
    return "text-blue-600";
  };

  return (
    <div className="space-y-4">
      {/* Camera Display */}
      <div className="relative w-full max-w-md mx-auto">
        <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
          {capturedImage ? (
            <img 
              src={capturedImage} 
              alt="Captured" 
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${!isStreaming ? 'hidden' : ''}`}
              />
              {!isStreaming && (
                <div className="w-full h-full flex items-center justify-center">
                  <Camera className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </>
          )}
        </div>

        {/* Status Overlay */}
        <div className="absolute bottom-2 left-2 right-2">
          <div className={`text-sm font-medium text-center p-2 bg-white/90 rounded ${getStatusColor()}`}>
            {getStatusMessage()}
          </div>
        </div>
      </div>

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Controls */}
      <div className="flex justify-center space-x-3">
        {!capturedImage ? (
          <>
            {!isStreaming && hasPermission !== false && (
              <Button onClick={startCamera} className="bg-blue-600 hover:bg-blue-700">
                <Camera className="h-4 w-4 mr-2" />
                Start Camera
              </Button>
            )}
            {hasPermission === false && (
              <Button onClick={startCamera} className="bg-blue-600 hover:bg-blue-700">
                <Camera className="h-4 w-4 mr-2" />
                Allow Camera Access
              </Button>
            )}
            {isStreaming && (
              <Button onClick={capturePhoto} className="bg-green-600 hover:bg-green-700">
                <Camera className="h-4 w-4 mr-2" />
                Capture Photo
              </Button>
            )}
          </>
        ) : (
          <Button onClick={retakePhoto} variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
            <RotateCcw className="h-4 w-4 mr-2" />
            Retake Photo
          </Button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <X className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Instructions */}
      <Alert>
        <Camera className="h-4 w-4" />
        <AlertDescription>
          Position your face in the center of the frame. Ensure good lighting and look directly at the camera.
        </AlertDescription>
      </Alert>
    </div>
  );
}