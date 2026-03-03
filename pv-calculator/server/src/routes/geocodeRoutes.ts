import { Router } from "express";
import type { Request, Response } from "express";
import axios from "axios";

export const geocodeRoutes = Router();

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

geocodeRoutes.get("/", async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string;
    const limit = parseInt(req.query.limit as string) || 5;

    if (!q || q.length < 2) {
      res.status(400).json({ error: "Query parameter 'q' must be at least 2 characters" });
      return;
    }

    const response = await axios.get(NOMINATIM_URL, {
      params: {
        q,
        format: "json",
        limit,
        addressdetails: 1,
      },
      headers: {
        "User-Agent": "PV-Calculator/1.0",
      },
      timeout: 10000,
    });

    const results = response.data.map((item: any) => ({
      display_name: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
    }));

    res.json(results);
  } catch (err: any) {
    console.error("Geocode error:", err.message);
    res.status(502).json({ error: "Geocoding service error" });
  }
});
