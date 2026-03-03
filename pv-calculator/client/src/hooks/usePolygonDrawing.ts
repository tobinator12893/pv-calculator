import { useState, useCallback } from "react";
import type { PolygonVertex, PolygonState } from "../types/drawing";
import { calculateGeodesicArea } from "../utils/polygonArea";
import { calculateCentroid } from "../utils/polygonCenter";

const initialState: PolygonState = {
  mode: "IDLE",
  vertices: [],
  area: null,
  centroid: null,
};

export function usePolygonDrawing() {
  const [state, setState] = useState<PolygonState>(initialState);

  const startDrawing = useCallback(() => {
    setState({ ...initialState, mode: "DRAWING" });
  }, []);

  const addVertex = useCallback((vertex: PolygonVertex) => {
    setState((prev) => {
      if (prev.mode !== "DRAWING") return prev;
      return { ...prev, vertices: [...prev.vertices, vertex] };
    });
  }, []);

  const undoVertex = useCallback(() => {
    setState((prev) => {
      if (prev.mode !== "DRAWING" || prev.vertices.length === 0) return prev;
      return { ...prev, vertices: prev.vertices.slice(0, -1) };
    });
  }, []);

  const completePolygon = useCallback(() => {
    setState((prev) => {
      if (prev.vertices.length < 3) return prev;
      const area = calculateGeodesicArea(prev.vertices);
      const centroid = calculateCentroid(prev.vertices);
      return { mode: "COMPLETE", vertices: prev.vertices, area, centroid };
    });
  }, []);

  const clearPolygon = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    ...state,
    startDrawing,
    addVertex,
    undoVertex,
    completePolygon,
    clearPolygon,
  };
}
