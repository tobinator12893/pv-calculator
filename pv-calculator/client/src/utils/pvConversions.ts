import { PANEL_DENSITY } from "../constants/defaults";

export function areaToPeakPower(areaM2: number, efficiency: number): number {
  // kWp = area (m²) × efficiency × packing density
  return Math.round(areaM2 * efficiency * PANEL_DENSITY * 100) / 100;
}
