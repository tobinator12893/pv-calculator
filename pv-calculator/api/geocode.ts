import type { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const q = req.query.q as string;
    const limit = parseInt(req.query.limit as string) || 5;

    if (!q || q.length < 2) {
      return res.status(400).json({ error: "Query parameter 'q' must be at least 2 characters" });
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

    return res.status(200).json(results);
  } catch (err: any) {
    console.error("Geocode error:", err.message);
    return res.status(502).json({ error: "Geocoding service error" });
  }
}
