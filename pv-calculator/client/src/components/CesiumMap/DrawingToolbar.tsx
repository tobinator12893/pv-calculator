import type { DrawingMode } from "../../types/drawing";
import "./DrawingToolbar.css";

interface DrawingToolbarProps {
  drawingMode: DrawingMode;
  vertexCount: number;
  onStartDrawing: () => void;
  onUndo: () => void;
  onClear: () => void;
}

export function DrawingToolbar({
  drawingMode,
  vertexCount: _vertexCount,
  onStartDrawing,
  onUndo: _onUndo,
  onClear,
}: DrawingToolbarProps) {
  return (
    <div className="drawing-toolbar">
      {drawingMode === "IDLE" && (
        <button className="toolbar-btn toolbar-btn--primary" onClick={onStartDrawing}>
          Polygon zeichnen
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M4 9h10M10 5l4 4-4 4" stroke="var(--color-yellow)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
      {drawingMode === "DRAWING" && (
        <button className="toolbar-btn toolbar-btn--danger" onClick={onClear}>
          Abbrechen
        </button>
      )}
      {drawingMode === "COMPLETE" && (
        <button className="toolbar-btn toolbar-btn--danger" onClick={onClear}>
          Polygon löschen
        </button>
      )}
    </div>
  );
}
