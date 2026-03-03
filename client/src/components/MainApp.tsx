import { useState, useCallback, useMemo } from "react";
import { CesiumMap } from "./CesiumMap/CesiumMap";
import { Sidebar } from "./Sidebar/Sidebar";
import { ResultsPanel } from "./Sidebar/ResultsPanel";
import { usePolygonDrawing } from "../hooks/usePolygonDrawing";
import { usePVCalculation } from "../hooks/usePVCalculation";
import { useShadowSimulation } from "../hooks/useShadowSimulation";
import { useShadowAnalysis } from "../hooks/useShadowAnalysis";
import { areaToPeakPower } from "../utils/pvConversions";
import { adjustPVResults } from "../utils/adjustPVResults";
import { DEFAULT_PV_PARAMS } from "../constants/defaults";
import type { PVParameters } from "../types/pv";
import type { GeocodeResult } from "../types/geocode";
import type { ShadowAnalysisRequest } from "../types/shadowAnalysis";

export function MainApp() {
  const [pvParams, setPvParams] = useState<PVParameters>({
    angle: DEFAULT_PV_PARAMS.angle,
    aspect: DEFAULT_PV_PARAMS.aspect,
    efficiency: DEFAULT_PV_PARAMS.efficiency,
    loss: DEFAULT_PV_PARAMS.loss,
  });

  const [flyToLocation, setFlyToLocation] = useState<{ lat: number; lon: number; _key: number } | null>(null);
  const [shadowAnalysisRequest, setShadowAnalysisRequest] = useState<ShadowAnalysisRequest | null>(null);

  const polygon = usePolygonDrawing();
  const pvCalc = usePVCalculation();
  const shadow = useShadowSimulation();
  const shadowAnalysis = useShadowAnalysis();

  const peakPower =
    polygon.area !== null ? areaToPeakPower(polygon.area, pvParams.efficiency) : null;

  const canCalculate =
    polygon.mode === "COMPLETE" &&
    polygon.centroid !== null &&
    peakPower !== null &&
    peakPower > 0;

  const handleCalculate = useCallback(() => {
    if (!polygon.centroid || peakPower === null) return;
    pvCalc.calculate({
      lat: polygon.centroid.lat,
      lon: polygon.centroid.lon,
      peakpower: peakPower,
      loss: pvParams.loss,
      angle: pvParams.angle,
      aspect: pvParams.aspect,
    });

    // Trigger shadow analysis in parallel
    const avgHeight = polygon.vertices.length > 0
      ? polygon.vertices.reduce((sum, v) => sum + v.height, 0) / polygon.vertices.length
      : 0;

    setShadowAnalysisRequest({
      centroid: { lat: polygon.centroid.lat, lon: polygon.centroid.lon },
      avgHeight,
      _key: Date.now(),
    });
  }, [polygon.centroid, polygon.vertices, peakPower, pvParams, pvCalc]);

  const handleAddressSelect = useCallback((result: GeocodeResult) => {
    setFlyToLocation({ lat: result.lat, lon: result.lon, _key: Date.now() });
  }, []);

  // Derive adjusted result when both PV result and shadow analysis are available
  const adjustedResult = useMemo(() => {
    if (!pvCalc.result || !shadowAnalysis.result) return null;
    return adjustPVResults(pvCalc.result, shadowAnalysis.result);
  }, [pvCalc.result, shadowAnalysis.result]);

  return (
    <div className="app">
      <Sidebar
        params={pvParams}
        onParamsChange={setPvParams}
        area={polygon.area}
        peakPower={peakPower}
        loading={pvCalc.loading}
        canCalculate={canCalculate}
        onCalculate={handleCalculate}
        result={pvCalc.result}
        error={pvCalc.error}
        onErrorDismiss={() => {}}
        onAddressSelect={handleAddressSelect}
        adjustedResult={adjustedResult}
        shadowAnalysisStatus={shadowAnalysis.status}
      />
      {pvCalc.result && polygon.area !== null && peakPower !== null && (
        <div className="results-floating">
          <ResultsPanel
            result={pvCalc.result}
            area={polygon.area}
            peakPower={peakPower}
            adjustedResult={adjustedResult}
            shadowAnalysisStatus={shadowAnalysis.status}
          />
        </div>
      )}
      <CesiumMap
        drawingMode={polygon.mode}
        vertices={polygon.vertices}
        onAddVertex={polygon.addVertex}
        onStartDrawing={polygon.startDrawing}
        onUndoVertex={polygon.undoVertex}
        onCompletePolygon={polygon.completePolygon}
        onClearPolygon={polygon.clearPolygon}
        flyToLocation={flyToLocation}
        shadowEnabled={shadow.enabled}
        shadowDate={shadow.date}
        shadowTimeOfDay={shadow.timeOfDay}
        shadowAnimating={shadow.isAnimating}
        shadowAnimationSpeed={shadow.animationSpeed}
        onShadowTimeUpdate={shadow.setTimeOfDay}
        onToggleShadow={shadow.toggleEnabled}
        onShadowDateChange={shadow.setDate}
        onShadowTimeChange={shadow.setTimeOfDay}
        onToggleShadowAnimation={shadow.toggleAnimation}
        shadowAnalysisRequest={shadowAnalysisRequest}
        onShadowAnalysisStart={shadowAnalysis.onAnalysisStart}
        onShadowAnalysisComplete={shadowAnalysis.onAnalysisComplete}
        onShadowAnalysisError={shadowAnalysis.onAnalysisError}
      />
    </div>
  );
}
