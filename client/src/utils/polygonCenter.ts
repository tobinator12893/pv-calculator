import centroid from "@turf/centroid";
import { polygon } from "@turf/helpers";
import type { PolygonVertex } from "../types/drawing";

export function calculateCentroid(vertices: PolygonVertex[]): { lat: number; lon: number } | null {
  if (vertices.length < 3) return null;

  const coords = vertices.map((v) => [v.lon, v.lat]);
  coords.push([vertices[0].lon, vertices[0].lat]);

  const poly = polygon([coords]);
  const center = centroid(poly);

  return {
    lon: center.geometry.coordinates[0],
    lat: center.geometry.coordinates[1],
  };
}
