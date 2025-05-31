import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface BiometricResult {
  isMatch: boolean;
  confidence: number;
}

export interface BiometricHook {
  verifyFingerprint: (aadhaarNumber: string, fingerprintData: string) => Promise<BiometricResult>;
  verifyFace: (aadhaarNumber: string, faceData: string) => Promise<BiometricResult>;
  isLoading: boolean;
}

export function useBiometric(): BiometricHook {
  const fingerprintMutation = useMutation({
    mutationFn: async ({ aadhaarNumber, fingerprintData }: { aadhaarNumber: string; fingerprintData: string }) => {
      const response = await apiRequest("POST", "/api/verify/fingerprint", {
        aadhaarNumber,
        fingerprintData
      });
      return response.json();
    },
  });

  const faceMutation = useMutation({
    mutationFn: async ({ aadhaarNumber, faceData }: { aadhaarNumber: string; faceData: string }) => {
      const response = await apiRequest("POST", "/api/verify/face", {
        aadhaarNumber,
        faceData
      });
      return response.json();
    },
  });

  const verifyFingerprint = async (aadhaarNumber: string, fingerprintData: string): Promise<BiometricResult> => {
    const result = await fingerprintMutation.mutateAsync({ aadhaarNumber, fingerprintData });
    return result;
  };

  const verifyFace = async (aadhaarNumber: string, faceData: string): Promise<BiometricResult> => {
    const result = await faceMutation.mutateAsync({ aadhaarNumber, faceData });
    return result;
  };

  return {
    verifyFingerprint,
    verifyFace,
    isLoading: fingerprintMutation.isPending || faceMutation.isPending
  };
}
