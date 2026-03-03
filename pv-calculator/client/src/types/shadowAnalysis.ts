export interface MonthlyShadingFactor {
  month: number;       // 1-12
  factor: number;      // 0-1, where 1 = full sun, 0 = fully shaded
  sunlitHours: number;
  totalHours: number;
}

export interface ShadowAnalysisResult {
  monthlyShadingFactors: MonthlyShadingFactor[];
  overallFactor: number; // weighted average across all months
}

export interface ShadowAnalysisRequest {
  centroid: { lat: number; lon: number };
  avgHeight: number;
  _key: number; // trigger pattern like flyToLocation
}

export type ShadowAnalysisStatus = "idle" | "running" | "complete" | "error";
