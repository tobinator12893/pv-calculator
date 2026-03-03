import type { PVParameters } from "../../types/pv";
import "./PVParametersForm.css";

interface PVParametersFormProps {
  params: PVParameters;
  onChange: (params: PVParameters) => void;
  area: number | null;
  peakPower: number | null;
  loading: boolean;
  canCalculate: boolean;
  onCalculate: () => void;
}

function rangeStyle(value: number, min: number, max: number) {
  const percent = ((value - min) / (max - min)) * 100;
  return { "--value-percent": `${percent}%` } as React.CSSProperties;
}

export function PVParametersForm({
  params,
  onChange,
  area: _area,
  peakPower: _peakPower,
  loading: _loading,
  canCalculate: _canCalculate,
  onCalculate: _onCalculate,
}: PVParametersFormProps) {
  function updateParam(key: keyof PVParameters, value: number) {
    onChange({ ...params, [key]: value });
  }

  return (
    <div className="pv-params">
      <h3 className="section-title">PV-Parameter</h3>

      <div className="param-field">
        <label className="field-label">
          Neigung
          <span className="field-hint" title="Dachneigung in Grad (0° = flach, 90° = vertikal)">?</span>
        </label>
        <div className="range-row">
          <input
            type="range"
            min={0}
            max={90}
            value={params.angle}
            style={rangeStyle(params.angle, 0, 90)}
            onChange={(e) => updateParam("angle", Number(e.target.value))}
          />
          <span className="range-value">{params.angle}°</span>
        </div>
      </div>

      <div className="param-field">
        <label className="field-label">
          Azimut
          <span className="field-hint" title="Ausrichtung: -180°=Nord, -90°=Ost, 0°=Süd, 90°=West">?</span>
        </label>
        <div className="range-row">
          <input
            type="range"
            min={-180}
            max={180}
            value={params.aspect}
            style={rangeStyle(params.aspect, -180, 180)}
            onChange={(e) => updateParam("aspect", Number(e.target.value))}
          />
          <span className="range-value">{params.aspect}°</span>
        </div>
      </div>

      <div className="param-field">
        <label className="field-label">
          Moduleffizienz
          <span className="field-hint" title="Wirkungsgrad der PV-Module (typisch: 18-22%)">?</span>
        </label>
        <div className="range-row">
          <input
            type="range"
            min={10}
            max={25}
            value={params.efficiency * 100}
            style={rangeStyle(params.efficiency * 100, 10, 25)}
            onChange={(e) => updateParam("efficiency", Number(e.target.value) / 100)}
          />
          <span className="range-value">{(params.efficiency * 100).toFixed(0)}%</span>
        </div>
      </div>

      <div className="param-field">
        <label className="field-label">
          Systemverluste
          <span className="field-hint" title="Verluste durch Kabel, Wechselrichter, Verschattung etc.">?</span>
        </label>
        <div className="range-row">
          <input
            type="range"
            min={0}
            max={30}
            value={params.loss}
            style={rangeStyle(params.loss, 0, 30)}
            onChange={(e) => updateParam("loss", Number(e.target.value))}
          />
          <span className="range-value">{params.loss}%</span>
        </div>
      </div>

    </div>
  );
}
