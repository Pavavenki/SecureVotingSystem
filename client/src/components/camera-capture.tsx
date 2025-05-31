import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, CheckCircle, X, AlertTriangle } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  isActive: boolean;
  status: "pending" | "verified" | "failed";
}

export default function CameraCapture({ onCapture, isActive, status }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);

  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isActive]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      
      // Request camera permission
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Wait for video to load before playing
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().then(() => {
            // Simple face detection simulation
            setTimeout(() => {
              setFaceDetected(true);
            }, 2000);
          }).catch((playError) => {
            console.error("Video play error:", playError);
            setCameraError("Unable to start video stream.");
          });
        };
      }
    } catch (error) {
      console.error("Camera access error:", error);
      
      if (error.name === "NotAllowedError") {
        setCameraError("Camera access denied. Please allow camera permissions and refresh the page.");
      } else if (error.name === "NotFoundError") {
        setCameraError("No camera found. Please ensure a camera is connected.");
      } else {
        setCameraError("Unable to access camera. Please check camera permissions.");
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setFaceDetected(false);
  };

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      // Convert to base64
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      // Simulate processing delay
      setTimeout(() => {
        onCapture(imageData);
        setIsCapturing(false);
      }, 1000);
    }
  };

  const getStatusDisplay = () => {
    if (status === "verified") {
      return {
        icon: <CheckCircle className="h-4 w-4 text-green-600" />,
        message: "Face verified successfully!",
        color: "text-green-600"
      };
    } else if (status === "failed") {
      return {
        icon: <X className="h-4 w-4 text-red-600" />,
        message: "Face verification failed. Please try again.",
        color: "text-red-600"
      };
    } else if (isCapturing) {
      return {
        icon: <div className="w-4 h-4 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>,
        message: "Processing facial recognition...",
        color: "text-blue-600"
      };
    } else if (faceDetected) {
      return {
        icon: <CheckCircle className="h-4 w-4 text-green-600" />,
        message: "Face detected - Ready to capture",
        color: "text-green-600"
      };
    } else {
      return {
        icon: <Camera className="h-4 w-4 text-gray-500" />,
        message: "Position your face in the center...",
        color: "text-gray-600"
      };
    }
  };

  const statusDisplay = getStatusDisplay();

  if (cameraError) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          {cameraError}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Camera Feed */}
      <div className="relative bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-64 object-cover"
          autoPlay
          playsInline
          muted
        />
        
        {/* Face Detection Overlay */}
        {faceDetected && status === "pending" && (
          <div className="absolute inset-4 border-2 border-green-400 rounded-lg opacity-80">
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-green-400 text-white text-xs px-2 py-1 rounded">
              Face Detected
            </div>
          </div>
        )}

        {/* Status Overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-black bg-opacity-70 text-white px-3 py-2 rounded text-sm text-center flex items-center justify-center">
            {statusDisplay.icon}
            <span className={`ml-2 ${statusDisplay.color}`}>
              {statusDisplay.message}
            </span>
          </div>
        </div>
      </div>

      {/* Hidden Canvas for Capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Capture Button */}
      <div className="text-center">
        <Button
          onClick={captureImage}
          disabled={!faceDetected || isCapturing || status === "verified"}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
        >
          {isCapturing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
              Capturing...
            </>
          ) : status === "verified" ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Verified
            </>
          ) : (
            <>
              <Camera className="h-4 w-4 mr-2" />
              Capture & Verify
            </>
          )}
        </Button>
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-gray-600">
        <p>Look directly at the camera and ensure your face is clearly visible</p>
        <p className="text-xs mt-1">The system will automatically detect your face</p>
      </div>
    </div>
  );
}
