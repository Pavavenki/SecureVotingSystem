import { apiRequest } from "./queryClient";

export interface BiometricVerificationResult {
  isMatch: boolean;
  confidence: number;
  timestamp: string;
}

export interface FingerprintTemplate {
  leftThumb?: string;
  rightThumb?: string;
  leftIndex?: string;
  rightIndex?: string;
  leftMiddle?: string;
  rightMiddle?: string;
}

export interface FaceTemplate {
  encoding: string;
  landmarks: number[];
  quality: number;
}

export class BiometricAPI {
  /**
   * Verify fingerprint against stored template
   */
  static async verifyFingerprint(
    aadhaarNumber: string, 
    fingerprintData: string,
    fingerType: keyof FingerprintTemplate = "rightThumb"
  ): Promise<BiometricVerificationResult> {
    try {
      const response = await apiRequest("POST", "/api/verify/fingerprint", {
        aadhaarNumber,
        fingerprintData,
        fingerType
      });

      const result = await response.json();
      
      return {
        isMatch: result.isMatch,
        confidence: result.confidence,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error("Fingerprint verification error:", error);
      throw new Error("Failed to verify fingerprint");
    }
  }

  /**
   * Verify face image against stored template
   */
  static async verifyFace(
    aadhaarNumber: string,
    faceImageData: string
  ): Promise<BiometricVerificationResult> {
    try {
      const response = await apiRequest("POST", "/api/verify/face", {
        aadhaarNumber,
        faceData: faceImageData
      });

      const result = await response.json();
      
      return {
        isMatch: result.isMatch,
        confidence: result.confidence,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error("Face verification error:", error);
      throw new Error("Failed to verify face");
    }
  }

  /**
   * Extract face features from image (client-side preprocessing)
   */
  static async extractFaceFeatures(imageData: string): Promise<FaceTemplate | null> {
    try {
      // In a real implementation, this would use a face recognition library
      // like face-api.js or similar to extract facial features
      
      // For demo purposes, return mock template
      return {
        encoding: btoa(imageData.substring(0, 100)), // Mock encoding
        landmarks: Array.from({ length: 68 }, () => Math.random() * 100), // Mock landmarks
        quality: Math.floor(Math.random() * 40) + 60 // 60-100% quality
      };
    } catch (error) {
      console.error("Face feature extraction error:", error);
      return null;
    }
  }

  /**
   * Process fingerprint image for template generation
   */
  static async processFingerprint(imageData: string): Promise<string | null> {
    try {
      // In a real implementation, this would use a fingerprint SDK
      // to extract minutiae points and create a template
      
      // For demo purposes, return base64 encoded mock template
      const mockTemplate = {
        minutiae: Array.from({ length: 20 }, () => ({
          x: Math.floor(Math.random() * 256),
          y: Math.floor(Math.random() * 256),
          angle: Math.floor(Math.random() * 360),
          type: Math.random() > 0.5 ? "ridge_ending" : "bifurcation"
        })),
        quality: Math.floor(Math.random() * 40) + 60,
        timestamp: new Date().toISOString()
      };

      return btoa(JSON.stringify(mockTemplate));
    } catch (error) {
      console.error("Fingerprint processing error:", error);
      return null;
    }
  }

  /**
   * Check if device supports biometric capabilities
   */
  static async checkBiometricSupport(): Promise<{
    camera: boolean;
    fingerprint: boolean;
    webAuthn: boolean;
  }> {
    const support = {
      camera: false,
      fingerprint: false,
      webAuthn: false
    };

    try {
      // Check camera support
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        support.camera = true;
      }

      // Check WebAuthn support (can be used for fingerprint on mobile)
      if (window.PublicKeyCredential) {
        support.webAuthn = true;
        support.fingerprint = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      }
    } catch (error) {
      console.error("Biometric support check error:", error);
    }

    return support;
  }

  /**
   * Get biometric verification logs for audit
   */
  static async getVerificationLogs(aadhaarNumber?: string): Promise<any[]> {
    try {
      const url = aadhaarNumber 
        ? `/api/biometric/logs?aadhaar=${aadhaarNumber}`
        : "/api/biometric/logs";
        
      const response = await apiRequest("GET", url);
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch verification logs:", error);
      return [];
    }
  }
}

// Utility functions for biometric data handling
export function validateImageData(imageData: string): boolean {
  if (!imageData || !imageData.startsWith('data:image/')) {
    return false;
  }
  
  try {
    // Check if base64 is valid
    const base64Data = imageData.split(',')[1];
    atob(base64Data);
    return true;
  } catch (error) {
    return false;
  }
}

export function compressImageData(imageData: string, quality: number = 0.8): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();
  
  return new Promise((resolve) => {
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } else {
        resolve(imageData);
      }
    };
    img.src = imageData;
  }) as any;
}

export default BiometricAPI;
