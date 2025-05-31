import { useState, useRef, useCallback } from "react";

export interface CameraConfig {
  width?: number;
  height?: number;
  facingMode?: "user" | "environment";
}

export interface CameraHook {
  stream: MediaStream | null;
  isActive: boolean;
  error: string | null;
  startCamera: (config?: CameraConfig) => Promise<void>;
  stopCamera: () => void;
  captureImage: () => Promise<string | null>;
}

export function useCamera(): CameraHook {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const startCamera = useCallback(async (config: CameraConfig = {}) => {
    try {
      setError(null);
      
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: config.width || 640 },
          height: { ideal: config.height || 480 },
          facingMode: config.facingMode || "user"
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setIsActive(true);

      // If there's a video element, connect it
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setError("Unable to access camera. Please check permissions.");
      setIsActive(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsActive(false);
    setError(null);
  }, [stream]);

  const captureImage = useCallback(async (): Promise<string | null> => {
    if (!stream || !videoRef.current) {
      setError("Camera not available for capture");
      return null;
    }

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        setError("Canvas not supported");
        return null;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);

      return canvas.toDataURL('image/jpeg', 0.8);
    } catch (err) {
      console.error("Image capture error:", err);
      setError("Failed to capture image");
      return null;
    }
  }, [stream]);

  return {
    stream,
    isActive,
    error,
    startCamera,
    stopCamera,
    captureImage
  };
}
