import { useState, useCallback } from "react";
import type { PVResult, PVCalculationRequest } from "../types/pv";
import { calculatePV } from "../services/pvService";

export function usePVCalculation() {
  const [result, setResult] = useState<PVResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculate = useCallback(async (params: PVCalculationRequest) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await calculatePV(params);
      setResult(data);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Berechnung fehlgeschlagen. Standort möglicherweise außerhalb der PVGIS-Abdeckung.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  return { result, loading, error, calculate };
}
