import axios from "axios";
import type { PVCalculateInput } from "../utils/validation";

const PVGIS_BASE_URL = "https://re.jrc.ec.europa.eu/api/v5_3/PVcalc";

// PVGIS v5_3 uses parentheses in field names: "H(i)_m", "H(i)_d", "H(i)_y"
// We use index-signature access for these fields
interface PVGISMonthlyItem {
  month: number;
  E_d: number; // avg daily energy (kWh/day)
  E_m: number; // avg monthly energy (kWh/month)
  "H(i)_d": number; // avg daily irradiation (kWh/m²/day)
  "H(i)_m": number; // avg monthly irradiation (kWh/m²/month)
  SD_m: number; // standard deviation of monthly energy
  [key: string]: number; // allow bracket access
}

interface PVGISYearly {
  E_d: number;
  E_m: number;
  E_y: number; // total yearly energy (kWh/year)
  "H(i)_d": number;
  "H(i)_m": number;
  "H(i)_y": number; // total yearly irradiation (kWh/m²/year)
  SD_m: number;
  SD_y: number;
  l_aoi: number;
  l_spec: number | string;
  l_tg: number;
  l_total: number;
  [key: string]: number | string; // allow bracket access
}

export interface PVGISResult {
  monthly: {
    month: number;
    E_m: number;
    H_i_m: number;
  }[];
  yearly: {
    E_y: number;
    H_i_y: number;
  };
}

export async function calculatePVGIS(input: PVCalculateInput): Promise<PVGISResult> {
  const pvgisParams = {
    lat: input.lat,
    lon: input.lon,
    peakpower: input.peakpower,
    loss: input.loss,
    angle: input.angle,
    aspect: input.aspect,
    outputformat: "json",
  };

  const response = await axios.get(PVGIS_BASE_URL, {
    params: pvgisParams,
    timeout: 30000,
  });

  const data = response.data;

  if (!data.outputs) {
    throw new Error("PVGIS returned no outputs. Location may be outside coverage area.");
  }

  if (!data.outputs.monthly?.fixed) {
    throw new Error("PVGIS response missing monthly data.");
  }
  if (!data.outputs.totals?.fixed) {
    throw new Error("PVGIS response missing yearly totals data.");
  }

  const monthlyRaw: PVGISMonthlyItem[] = data.outputs.monthly.fixed;
  const yearlyRaw: PVGISYearly = data.outputs.totals.fixed;

  return {
    monthly: monthlyRaw.map((m) => ({
      month: m.month,
      E_m: Math.round(m.E_m * 100) / 100,
      // PVGIS v5_3 uses "H(i)_m" with parentheses, not "H_i_m"
      H_i_m: Math.round((m["H(i)_m"] as number) * 100) / 100,
    })),
    yearly: {
      E_y: Math.round(yearlyRaw.E_y * 100) / 100,
      // PVGIS v5_3 uses "H(i)_y" with parentheses, not "H_i_y"
      H_i_y: Math.round((yearlyRaw["H(i)_y"] as number) * 100) / 100,
    },
  };
}
