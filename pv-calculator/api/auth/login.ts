import type { VercelRequest, VercelResponse } from "@vercel/node";
import jwt from "jsonwebtoken";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { password } = req.body ?? {};
  const authPassword = process.env.AUTH_PASSWORD ?? "solar2025";
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return res.status(500).json({ error: "JWT_SECRET not configured" });
  }

  if (password !== authPassword) {
    return res.status(401).json({ error: "Falscher Zugangs-Code" });
  }

  const token = jwt.sign({ authorized: true }, jwtSecret, { expiresIn: "7d" });
  return res.status(200).json({ token });
}
