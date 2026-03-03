import { useRef, useEffect, memo } from "react";
import * as Cesium from "cesium";
import { DrawingToolbar } from "./DrawingToolbar";
import { ShadowControls } from "./ShadowControls";
import type { PolygonVertex, DrawingMode } from "../../types/drawing";
import type { ShadowAnalysisRequest, ShadowAnalysisResult } from "../../types/shadowAnalysis";
import { runShadowAnalysis } from "../../utils/shadowAnalysis";
import "./CesiumMap.css";

// Set Cesium Ion token
Cesium.Ion.defaultAccessToken =
  (window as any).__ENV__?.VITE_CESIUM_ION_TOKEN ||
  import.meta.env.VITE_CESIUM_ION_TOKEN ||
  "";

interface CesiumMapProps {
  drawingMode: DrawingMode;
  vertices: PolygonVertex[];
  onAddVertex: (vertex: PolygonVertex) => void;
  onStartDrawing: () => void;
  onUndoVertex: () => void;
  onCompletePolygon: () => void;
  onClearPolygon: () => void;
  flyToLocation: { lat: number; lon: number; _key: number } | null;
  shadowEnabled: boolean;
  shadowDate: Date;
  shadowTimeOfDay: number;
  shadowAnimating: boolean;
  shadowAnimationSpeed: number;
  onShadowTimeUpdate: (timeOfDay: number) => void;
  onToggleShadow: () => void;
  onShadowDateChange: (date: Date) => void;
  onShadowTimeChange: (timeOfDay: number) => void;
  onToggleShadowAnimation: () => void;
  shadowAnalysisRequest: ShadowAnalysisRequest | null;
  onShadowAnalysisStart: () => void;
  onShadowAnalysisComplete: (result: ShadowAnalysisResult) => void;
  onShadowAnalysisError: (error: string) => void;
}

export const CesiumMap = memo(function CesiumMap({
  drawingMode,
  vertices,
  onAddVertex,
  onStartDrawing,
  onUndoVertex,
  onCompletePolygon,
  onClearPolygon,
  flyToLocation,
  shadowEnabled,
  shadowDate,
  shadowTimeOfDay,
  shadowAnimating,
  shadowAnimationSpeed,
  onShadowTimeUpdate,
  onToggleShadow,
  onShadowDateChange,
  onShadowTimeChange,
  onToggleShadowAnimation,
  shadowAnalysisRequest,
  onShadowAnalysisStart,
  onShadowAnalysisComplete,
  onShadowAnalysisError,
}: CesiumMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const handlerRef = useRef<Cesium.ScreenSpaceEventHandler | null>(null);
  const entitiesRef = useRef<Cesium.Entity[]>([]);

  // Initialize viewer once
  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return;

    const viewer = new Cesium.Viewer(containerRef.current, {
      terrain: Cesium.Terrain.fromWorldTerrain(),
      animation: false,
      timeline: false,
      fullscreenButton: false,
      homeButton: false,
      navigationHelpButton: false,
      baseLayerPicker: false,
      sceneModePicker: false,
      geocoder: false,
    });

    viewer.scene.globe.depthTestAgainstTerrain = true;

    // Shadow map configuration
    viewer.shadowMap.size = 4096;
    viewer.shadowMap.softShadows = true;
    viewer.shadowMap.darkness = 0.6;
    viewer.scene.light = new Cesium.SunLight();

    // Disable default double-click zoom
    viewer.screenSpaceEventHandler.removeInputAction(
      Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
    );

    // Camera tilt: right-drag or middle-drag or ctrl+left-drag
    viewer.scene.screenSpaceCameraController.enableTilt = true;
    viewer.scene.screenSpaceCameraController.tiltEventTypes = [
      Cesium.CameraEventType.RIGHT_DRAG,
      Cesium.CameraEventType.MIDDLE_DRAG,
      {
        eventType: Cesium.CameraEventType.LEFT_DRAG,
        modifier: Cesium.KeyboardEventModifier.CTRL,
      },
    ];

    // Google Photorealistic 3D Tiles
    Cesium.Cesium3DTileset.fromIonAssetId(2275207).then((tileset) => {
      if (!viewer.isDestroyed()) {
        viewer.scene.primitives.add(tileset);
      }
    });

    // Initial camera: tilted view over Prenzlau (Brüssower Allee 87)
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(13.405, 52.52, 800),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-40),
        roll: 0,
      },
    });

    viewerRef.current = viewer;

    return () => {
      viewer.destroy();
      viewerRef.current = null;
    };
  }, []);

  // Fly to location
  useEffect(() => {
    if (!flyToLocation || !viewerRef.current) return;
    const viewer = viewerRef.current;

    const target = Cesium.Cartesian3.fromDegrees(
      flyToLocation.lon,
      flyToLocation.lat,
      50
    );

    viewer.camera.flyToBoundingSphere(
      new Cesium.BoundingSphere(target, 0),
      {
        offset: new Cesium.HeadingPitchRange(
          Cesium.Math.toRadians(0),
          Cesium.Math.toRadians(-35),
          300
        ),
        duration: 2,
      }
    );
  }, [flyToLocation]);

  // Update polygon entities imperatively
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    // Remove old entities
    for (const entity of entitiesRef.current) {
      viewer.entities.remove(entity);
    }
    entitiesRef.current = [];

    // Vertex points
    for (const v of vertices) {
      const entity = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(v.lon, v.lat, v.height),
        point: {
          pixelSize: 8,
          color: Cesium.Color.fromCssColorString("#fff365"),
          outlineColor: Cesium.Color.fromCssColorString("#101920"),
          outlineWidth: 2,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
      });
      entitiesRef.current.push(entity);
    }

    // Polyline connecting vertices
    if (vertices.length >= 2) {
      const positions = vertices.map((v) =>
        Cesium.Cartesian3.fromDegrees(v.lon, v.lat, v.height)
      );
      const entity = viewer.entities.add({
        polyline: {
          positions,
          width: 3,
          material: Cesium.Color.fromCssColorString("#fff365").withAlpha(0.9),
        },
      });
      entitiesRef.current.push(entity);
    }

    // Completed polygon fill
    if (drawingMode === "COMPLETE" && vertices.length >= 3) {
      const entity = viewer.entities.add({
        polygon: {
          hierarchy: new Cesium.PolygonHierarchy(
            vertices.map((v) =>
              Cesium.Cartesian3.fromDegrees(v.lon, v.lat, v.height)
            )
          ),
          material: Cesium.Color.fromCssColorString("#fff365").withAlpha(0.35),
          outline: true,
          outlineColor: Cesium.Color.fromCssColorString("#101920"),
          outlineWidth: 2,
          perPositionHeight: true,
        },
      });
      entitiesRef.current.push(entity);
    }
  }, [vertices, drawingMode]);

  // Handle drawing interactions
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    if (handlerRef.current) {
      handlerRef.current.destroy();
      handlerRef.current = null;
    }

    if (drawingMode !== "DRAWING") {
      viewer.canvas.style.cursor = "default";
      return;
    }

    viewer.canvas.style.cursor = "crosshair";
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
    handlerRef.current = handler;

    handler.setInputAction((click: { position: Cesium.Cartesian2 }) => {
      const position = viewer.scene.pickPosition(click.position);
      if (!position) return;
      const carto = Cesium.Cartographic.fromCartesian(position);
      onAddVertex({
        lat: Cesium.Math.toDegrees(carto.latitude),
        lon: Cesium.Math.toDegrees(carto.longitude),
        height: carto.height,
      });
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    handler.setInputAction(() => {
      onCompletePolygon();
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

    return () => {
      handler.destroy();
      handlerRef.current = null;
    };
  }, [drawingMode, onAddVertex, onCompletePolygon]);

  // Sync shadow state to Cesium
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    viewer.shadows = shadowEnabled;

    if (!shadowEnabled) return;

    // Build JulianDate from date + timeOfDay
    const hours = Math.floor(shadowTimeOfDay / 60);
    const minutes = shadowTimeOfDay % 60;
    const d = new Date(shadowDate);
    d.setHours(hours, minutes, 0, 0);
    const julianDate = Cesium.JulianDate.fromDate(d);
    viewer.clock.currentTime = julianDate;

    viewer.clock.shouldAnimate = shadowAnimating;
    viewer.clock.multiplier = shadowAnimationSpeed;

    if (!shadowAnimating) return;

    const removeListener = viewer.clock.onTick.addEventListener((clock: Cesium.Clock) => {
      const jsDate = Cesium.JulianDate.toDate(clock.currentTime);
      const mins = jsDate.getHours() * 60 + jsDate.getMinutes();
      onShadowTimeUpdate(mins);
    });

    return () => {
      removeListener();
    };
  }, [shadowEnabled, shadowDate, shadowTimeOfDay, shadowAnimating, shadowAnimationSpeed, onShadowTimeUpdate]);

  // Run shadow analysis when requested
  useEffect(() => {
    if (!shadowAnalysisRequest || !viewerRef.current) return;

    const cancelled = { current: false };
    const viewer = viewerRef.current;

    onShadowAnalysisStart();

    runShadowAnalysis(
      viewer,
      shadowAnalysisRequest.centroid,
      shadowAnalysisRequest.avgHeight,
      cancelled
    )
      .then((result) => {
        if (!cancelled.current) {
          onShadowAnalysisComplete(result);
        }
      })
      .catch((err) => {
        if (!cancelled.current && err.message !== "cancelled") {
          onShadowAnalysisError(err.message || "Verschattungsanalyse fehlgeschlagen");
        }
      });

    return () => {
      cancelled.current = true;
    };
  }, [shadowAnalysisRequest]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="cesium-map-container">
      <div ref={containerRef} className="cesium-viewer-container" />
      <DrawingToolbar
        drawingMode={drawingMode}
        vertexCount={vertices.length}
        onStartDrawing={onStartDrawing}
        onUndo={onUndoVertex}
        onClear={onClearPolygon}
      />
      <ShadowControls
        enabled={shadowEnabled}
        date={shadowDate}
        timeOfDay={shadowTimeOfDay}
        isAnimating={shadowAnimating}
        onToggleEnabled={onToggleShadow}
        onDateChange={onShadowDateChange}
        onTimeChange={onShadowTimeChange}
        onToggleAnimation={onToggleShadowAnimation}
      />
    </div>
  );
});
