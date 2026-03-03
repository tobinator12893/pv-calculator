import { Router } from "express";
import crypto from "node:crypto";

const router = Router();

const AUTH_PASSWORD = process.env.AUTH_PASSWORD || "solar2025";
const activeTokens = new Set<string>();

router.post("/login", (req, res) => {
  const { password } = req.body ?? {};

  if (!password || password !== AUTH_PASSWORD) {
    res.status(401).json({ error: "unauthorized", message: "Falscher Zugangs-Code" });
    return;
  }

  const token = crypto.randomUUID();
  activeTokens.add(token);
  res.json({ token });
});

router.post("/verify", (req, res) => {
  const { token } = req.body ?? {};

  if (!token || !activeTokens.has(token)) {
    res.status(401).json({ error: "unauthorized", message: "Token ungültig" });
    return;
  }

  res.json({ valid: true });
});

export const authRoutes = router;
