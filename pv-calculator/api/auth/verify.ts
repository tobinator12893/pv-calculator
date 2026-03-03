import type { VercelRequest, VercelResponse } from "@vercel/node";
import jwt from "jsonwebtoken";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { token } = req.body ?? {};
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return res.status(500).json({ error: "JWT_SECRET not configured" });
  }

  if (!token) {
    return res.status(401).json({ error: "Token ungültig" });
  }

  try {
    jwt.verify(token, jwtSecret);
    return res.status(200).json({ valid: true });
  } catch {
    return res.status(401).json({ error: "Token ungültig" });
  }
}
