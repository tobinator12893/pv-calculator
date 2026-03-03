import { useState, useCallback } from "react";
import type { ShadowAnalysisResult, ShadowAnalysisStatus } from "../types/shadowAnalysis";

export function useShadowAnalysis() {
  const [result, setResult] = useState<ShadowAnalysisResult | null>(null);
  const [status, setStatus] = useState<ShadowAnalysisStatus>("idle");

  const onAnalysisStart = useCallback(() => {
    setStatus("running");
    setResult(null);
  }, []);

  const onAnalysisComplete = useCallback((analysisResult: ShadowAnalysisResult) => {
    setResult(analysisResult);
    setStatus("complete");
  }, []);

  const onAnalysisError = useCallback((error: string) => {
    console.error("Shadow analysis error:", error);
    setStatus("error");
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setStatus("idle");
  }, []);

  return {
    result,
    status,
    onAnalysisStart,
    onAnalysisComplete,
    onAnalysisError,
    reset,
  };
}
