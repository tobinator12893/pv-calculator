import { Router } from "express";
import type { Request, Response } from "express";
import { pvCalculateSchema } from "../utils/validation";
import { calculatePVGIS } from "../services/pvgisService";

export const pvRoutes = Router();

pvRoutes.post("/calculate", async (req: Request, res: Response) => {
  try {
    const parsed = pvCalculateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
      return;
    }

    const result = await calculatePVGIS(parsed.data);
    res.json(result);
  } catch (err: any) {
    if (err.response?.status) {
      res.status(502).json({
        error: "PVGIS API error",
        message: err.response?.data?.message || "The PVGIS service returned an error. The location may be outside the coverage area.",
      });
    } else {
      res.status(500).json({ error: "Internal server error", message: err.message });
    }
  }
});
