import type { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";
import { z } from "zod";

const pvCalculateSchema = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  peakpower: z.number().positive(),
  loss: z.number().min(0).max(100),
  angle: z.number().min(0).max(90),
  aspect: z.number().min(-180).max(180),
});

const PVGIS_BASE_URL = "https://re.jrc.ec.europa.eu/api/v5_3/PVcalc";

interface PVGISMonthlyItem {
  month: number;
  E_m: number;
  "H(i)_m": number;
  [key: string]: number;
}

interface PVGISYearly {
  E_y: number;
  "H(i)_y": number;
  [key: string]: number | string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const parsed = pvCalculateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
    }

    const input = parsed.data;
    const response = await axios.get(PVGIS_BASE_URL, {
      params: {
        lat: input.lat,
        lon: input.lon,
        peakpower: input.peakpower,
        loss: input.loss,
        angle: input.angle,
        aspect: input.aspect,
        outputformat: "json",
      },
      timeout: 30000,
    });

    const data = response.data;

    if (!data.outputs) {
      return res.status(502).json({
        error: "PVGIS API error",
        message: "PVGIS returned no outputs. Location may be outside coverage area.",
      });
    }

    if (!data.outputs.monthly?.fixed || !data.outputs.totals?.fixed) {
      return res.status(502).json({
        error: "PVGIS API error",
        message: "PVGIS response missing expected data fields.",
      });
    }

    const monthlyRaw: PVGISMonthlyItem[] = data.outputs.monthly.fixed;
    const yearlyRaw: PVGISYearly = data.outputs.totals.fixed;

    return res.status(200).json({
      monthly: monthlyRaw.map((m) => ({
        month: m.month,
        E_m: Math.round(m.E_m * 100) / 100,
        H_i_m: Math.round((m["H(i)_m"] as number) * 100) / 100,
      })),
      yearly: {
        E_y: Math.round(yearlyRaw.E_y * 100) / 100,
        H_i_y: Math.round((yearlyRaw["H(i)_y"] as number) * 100) / 100,
      },
    });
  } catch (err: any) {
    if (err.response?.status) {
      return res.status(502).json({
        error: "PVGIS API error",
        message: err.response?.data?.message || "The PVGIS service returned an error. The location may be outside the coverage area.",
      });
    }
    return res.status(500).json({ error: "Internal server error", message: err.message });
  }
}
