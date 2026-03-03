import api from "./api";
import type { PVCalculationRequest, PVResult } from "../types/pv";
import type { GeocodeResult } from "../types/geocode";

export async function calculatePV(params: PVCalculationRequest): Promise<PVResult> {
  const response = await api.post<PVResult>("/pv/calculate", params);
  return response.data;
}

export async function geocodeSearch(query: string, limit = 5): Promise<GeocodeResult[]> {
  const response = await api.get<GeocodeResult[]>("/geocode", {
    params: { q: query, limit },
  });
  return response.data;
}
