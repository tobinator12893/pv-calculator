export type DrawingMode = "IDLE" | "DRAWING" | "COMPLETE";

export interface PolygonVertex {
  lat: number;
  lon: number;
  height: number;
}

export interface PolygonState {
  mode: DrawingMode;
  vertices: PolygonVertex[];
  area: number | null;      // m²
  centroid: { lat: number; lon: number } | null;
}
