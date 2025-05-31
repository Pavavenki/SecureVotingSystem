import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Upload, X, Check } from "lucide-react";

interface PhotoCaptureProps {
  onPhotoCapture: (photoData: string) => void;
  initialPhoto?: string;
}

export default function PhotoCapture({ onPhotoCapture, initialPhoto }: PhotoCaptureProps) {
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(initialPhoto || null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setShowCamera(true);
      }
    } catch (error) {
      console.error("Camera access failed:", error);
      alert("Camera access denied. Please allow camera permissions and try again.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      // Set reasonable dimensions to reduce file size
      const maxWidth = 640;
      const maxHeight = 480;
      canvas.width = maxWidth;
      canvas.height = maxHeight;
      
      if (context) {
        context.drawImage(video, 0, 0, maxWidth, maxHeight);
        const photoData = canvas.toDataURL('image/jpeg', 0.6);
        setCapturedPhoto(photoData);
        onPhotoCapture(photoData);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const photoData = e.target?.result as string;
        setCapturedPhoto(photoData);
        onPhotoCapture(photoData);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearPhoto = () => {
    setCapturedPhoto(null);
    onPhotoCapture("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">Photo</Label>
      
      {!showCamera && (
        <Card>
          <CardContent className="p-4">
            {capturedPhoto ? (
              <div className="space-y-3">
                <div className="relative">
                  <img 
                    src={capturedPhoto} 
                    alt="Captured photo" 
                    className="w-full max-w-xs mx-auto rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={clearPhoto}
                    className="absolute top-2 right-2"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex items-center justify-center text-sm text-green-600">
                  <Check className="h-4 w-4 mr-1" />
                  Photo captured successfully
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-32 h-32 bg-gray-100 rounded-lg mx-auto flex items-center justify-center border-2 border-dashed border-gray-300">
                  <Camera className="h-8 w-8 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <div className="flex gap-2 justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={startCamera}
                      className="flex items-center"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Take Photo
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Photo
                    </Button>
                  </div>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {showCamera && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full max-w-md mx-auto rounded-lg border"
                />
              </div>
              <div className="flex gap-2 justify-center">
                <Button onClick={capturePhoto} className="bg-blue-600 hover:bg-blue-700">
                  <Camera className="h-4 w-4 mr-2" />
                  Capture Photo
                </Button>
                <Button variant="outline" onClick={stopCamera}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}