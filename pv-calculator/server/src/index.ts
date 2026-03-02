import express from "express";
import cors from "cors";
import { pvRoutes } from "./routes/pvRoutes";
import { geocodeRoutes } from "./routes/geocodeRoutes";
import { authRoutes } from "./routes/authRoutes";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check — infrastructure endpoint, not part of API
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use("/api/auth", authRoutes);
app.use("/api/pv", pvRoutes);
app.use("/api/geocode", geocodeRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
