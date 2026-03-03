import area from "@turf/area";
import { polygon } from "@turf/helpers";
import type { PolygonVertex } from "../types/drawing";

export function calculateGeodesicArea(vertices: PolygonVertex[]): number {
  if (vertices.length < 3) return 0;

  const coords = vertices.map((v) => [v.lon, v.lat]);
  // Close the ring
  coords.push([vertices[0].lon, vertices[0].lat]);

  const poly = polygon([coords]);
  return area(poly); // m²
}
