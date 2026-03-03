import { z } from "zod";

export const pvCalculateSchema = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  peakpower: z.number().positive(),
  loss: z.number().min(0).max(100),
  angle: z.number().min(0).max(90),
  aspect: z.number().min(-180).max(180),
});

export type PVCalculateInput = z.infer<typeof pvCalculateSchema>;
