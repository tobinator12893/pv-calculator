import { AddressSearch } from "./AddressSearch";
import { PVParametersForm } from "./PVParametersForm";
import { ErrorAlert } from "../common/ErrorAlert";
import type { PVParameters, PVResult } from "../../types/pv";
import type { GeocodeResult } from "../../types/geocode";
import type { ShadowAnalysisStatus } from "../../types/shadowAnalysis";
import type { AdjustedPVResult } from "../../utils/adjustPVResults";
import { CO2_FACTOR_KG_PER_KWH } from "../../constants/defaults";
import "./Sidebar.css";

interface SidebarProps {
  params: PVParameters;
  onParamsChange: (params: PVParameters) => void;
  area: number | null;
  peakPower: number | null;
  loading: boolean;
  canCalculate: boolean;
  onCalculate: () => void;
  result: PVResult | null;
  error: string | null;
  onErrorDismiss: () => void;
  onAddressSelect: (result: GeocodeResult) => void;
  adjustedResult: AdjustedPVResult | null;
  shadowAnalysisStatus: ShadowAnalysisStatus;
}

export function Sidebar({
  params,
  onParamsChange,
  area,
  peakPower,
  loading,
  canCalculate,
  onCalculate,
  result,
  error,
  onErrorDismiss,
  onAddressSelect,
  adjustedResult,
  shadowAnalysisStatus,
}: SidebarProps) {
  const yearlyEnergy = adjustedResult?.yearly.E_y ?? result?.yearly?.E_y ?? 0;
  const co2Saved = yearlyEnergy * CO2_FACTOR_KG_PER_KWH;
  const shadingPercent = adjustedResult
    ? Math.round((1 - adjustedResult.overallShadingFactor) * 100)
    : null;

  return (
    <aside className="sidebar">
      <div className="sidebar__header">
        <h1 className="sidebar__title">PV Potential</h1>
        <p className="sidebar__subtitle">Photovoltaik-Potential berechnen</p>
      </div>

      <div className="sidebar__content">
        <AddressSearch onSelect={onAddressSelect} />

        <PVParametersForm
          params={params}
          onChange={onParamsChange}
          area={area}
          peakPower={peakPower}
          loading={loading}
          canCalculate={canCalculate}
          onCalculate={onCalculate}
        />

        {error && <ErrorAlert message={error} onDismiss={onErrorDismiss} />}
      </div>

      <div className="sidebar__bottom">
        {area !== null && peakPower !== null && (
          <div className="sidebar__info-box">
            <div className="sidebar__info-row">
              <span className="info-label">Dachfläche</span>
              <span className="info-value">{area.toFixed(1)} m²</span>
            </div>
            <div className="sidebar__info-row">
              <span className="info-label">Leistung</span>
              <span className="info-value">{peakPower.toFixed(2)} kWp</span>
            </div>
          </div>
        )}

        {result && (
          <div className="sidebar__results-summary">
            <div className="summary-card summary-card--highlight">
              <span className="summary-card__value">
                {yearlyEnergy.toLocaleString("de-DE", { maximumFractionDigits: 0 })} kWh/a
              </span>
              <span className="summary-card__label">
                Jahresertrag
                {shadowAnalysisStatus === "running" && (
                  <span className="shading-spinner"> — Verschattungsanalyse...</span>
                )}
              </span>
              {shadingPercent !== null && shadingPercent > 0 && (
                <span className="shading-badge">Verschattung: {shadingPercent}%</span>
              )}
            </div>
            <div className="summary-row">
              <div className="summary-card">
                <span className="summary-card__value">{area?.toFixed(1)} m²</span>
                <span className="summary-card__label">Fläche</span>
              </div>
              <div className="summary-card">
                <span className="summary-card__value">{peakPower?.toFixed(2)} kWp</span>
                <span className="summary-card__label">Leistung</span>
              </div>
              <div className="summary-card">
                <span className="summary-card__value">{(co2Saved / 1000).toFixed(1)} t/a</span>
                <span className="summary-card__label">CO₂ gespart</span>
              </div>
            </div>
          </div>
        )}

        <div className="sidebar__footer">
          <button
            className="sidebar__cta"
            onClick={onCalculate}
            disabled={!canCalculate || loading}
          >
            {loading ? "Berechne..." : "Los geht's"}
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 9h10M10 5l4 4-4 4" stroke="var(--color-yellow)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
