import { useState, useMemo } from "react";
import "./ShadowControls.css";

interface ShadowControlsProps {
  enabled: boolean;
  date: Date;
  timeOfDay: number;
  isAnimating: boolean;
  onToggleEnabled: () => void;
  onDateChange: (date: Date) => void;
  onTimeChange: (timeOfDay: number) => void;
  onToggleAnimation: () => void;
}

const DATE_PRESETS = [
  { label: "Heute", getDate: () => new Date() },
  { label: "21. Juni (Sommer)", getDate: () => new Date(new Date().getFullYear(), 5, 21) },
  { label: "21. Dez (Winter)", getDate: () => new Date(new Date().getFullYear(), 11, 21) },
  { label: "21. Mär (Frühling)", getDate: () => new Date(new Date().getFullYear(), 2, 21) },
  { label: "23. Sep (Herbst)", getDate: () => new Date(new Date().getFullYear(), 8, 23) },
];

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export function ShadowControls({
  enabled,
  date,
  timeOfDay,
  isAnimating,
  onToggleEnabled,
  onDateChange,
  onTimeChange,
  onToggleAnimation,
}: ShadowControlsProps) {
  const [expanded, setExpanded] = useState(false);

  const selectedPresetIndex = useMemo(() => {
    const d = date;
    const month = d.getMonth();
    const day = d.getDate();
    if (month === 5 && day === 21) return 1;
    if (month === 11 && day === 21) return 2;
    if (month === 2 && day === 21) return 3;
    if (month === 8 && day === 23) return 4;
    return 0; // Heute
  }, [date]);

  if (!enabled) {
    return (
      <div className="shadow-controls">
        <button className="toolbar-btn toolbar-btn--primary" onClick={onToggleEnabled}>
          Verschattung
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="4" stroke="var(--color-yellow)" strokeWidth="1.5" />
            <path d="M9 2v2M9 14v2M2 9h2M14 9h2M4.2 4.2l1.4 1.4M12.4 12.4l1.4 1.4M4.2 13.8l1.4-1.4M12.4 5.6l1.4-1.4" stroke="var(--color-yellow)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    );
  }

  if (!expanded) {
    return (
      <div className="shadow-controls">
        <button
          className="toolbar-btn toolbar-btn--primary shadow-pill"
          onClick={() => setExpanded(true)}
        >
          Verschattung aktiv — {formatTime(timeOfDay)}
        </button>
      </div>
    );
  }

  return (
    <div className="shadow-controls">
      <div className="shadow-panel">
        <div className="shadow-panel__header">
          <span className="shadow-panel__title">Verschattung</span>
          <button
            className="shadow-panel__close"
            onClick={() => setExpanded(false)}
            aria-label="Schliessen"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="shadow-panel__section">
          <label className="shadow-panel__label">Datum</label>
          <div className="shadow-panel__presets">
            {DATE_PRESETS.map((preset, i) => (
              <button
                key={preset.label}
                className={`shadow-preset ${i === selectedPresetIndex ? "shadow-preset--active" : ""}`}
                onClick={() => onDateChange(preset.getDate())}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="shadow-panel__section">
          <label className="shadow-panel__label">
            Uhrzeit: {formatTime(timeOfDay)}
          </label>
          <div className="shadow-panel__slider-row">
            <span className="shadow-panel__time-label">05:00</span>
            <input
              type="range"
              className="shadow-slider"
              min={300}
              max={1260}
              step={5}
              value={timeOfDay}
              onChange={(e) => onTimeChange(Number(e.target.value))}
            />
            <span className="shadow-panel__time-label">21:00</span>
          </div>
        </div>

        <div className="shadow-panel__actions">
          <button
            className="shadow-action-btn"
            onClick={onToggleAnimation}
          >
            {isAnimating ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="3" y="2" width="4" height="12" rx="1" fill="currentColor" />
                <rect x="9" y="2" width="4" height="12" rx="1" fill="currentColor" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 2l10 6-10 6V2z" fill="currentColor" />
              </svg>
            )}
            {isAnimating ? "Pause" : "Abspielen"}
          </button>
          <button
            className="shadow-action-btn shadow-action-btn--danger"
            onClick={onToggleEnabled}
          >
            Deaktivieren
          </button>
        </div>
      </div>
    </div>
  );
}
