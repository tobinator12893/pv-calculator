import type { PVResult, PVMonthlyData } from "../types/pv";
import type { ShadowAnalysisResult } from "../types/shadowAnalysis";

export interface AdjustedPVMonthlyData extends PVMonthlyData {
  E_m_unadjusted: number;
  shadingFactor: number; // 0-1, where 1 = no shading
}

export interface AdjustedPVResult {
  monthly: AdjustedPVMonthlyData[];
  yearly: {
    E_y: number;
    E_y_unadjusted: number;
    H_i_y: number;
  };
  overallShadingFactor: number;
}

export function adjustPVResults(
  pvResult: PVResult,
  shadowResult: ShadowAnalysisResult
): AdjustedPVResult {
  const factorByMonth = new Map(
    shadowResult.monthlyShadingFactors.map((f) => [f.month, f.factor])
  );

  const monthly: AdjustedPVMonthlyData[] = pvResult.monthly.map((m) => {
    const factor = factorByMonth.get(m.month) ?? 1;
    return {
      ...m,
      E_m_unadjusted: m.E_m,
      E_m: m.E_m * factor,
      shadingFactor: factor,
    };
  });

  const E_y = monthly.reduce((sum, m) => sum + m.E_m, 0);

  return {
    monthly,
    yearly: {
      E_y,
      E_y_unadjusted: pvResult.yearly.E_y,
      H_i_y: pvResult.yearly.H_i_y,
    },
    overallShadingFactor: shadowResult.overallFactor,
  };
}
