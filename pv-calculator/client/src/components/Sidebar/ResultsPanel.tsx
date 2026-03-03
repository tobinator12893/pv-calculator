import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { PVResult } from "../../types/pv";
import type { ShadowAnalysisStatus } from "../../types/shadowAnalysis";
import type { AdjustedPVResult } from "../../utils/adjustPVResults";
import { MONTH_NAMES } from "../../constants/defaults";
import "./ResultsPanel.css";

interface ResultsPanelProps {
  result: PVResult;
  area: number;
  peakPower: number;
  adjustedResult?: AdjustedPVResult | null;
  shadowAnalysisStatus?: ShadowAnalysisStatus;
}

export function ResultsPanel({ result, area: _area, peakPower: _peakPower, adjustedResult, shadowAnalysisStatus }: ResultsPanelProps) {
  const yearlyIrradiation = result?.yearly?.H_i_y ?? 0;
  const monthlyData = result?.monthly ?? [];
  const hasAdjusted = !!adjustedResult;

  const chartData = monthlyData.map((m, i) => {
    const base: Record<string, string | number> = {
      name: MONTH_NAMES[(m.month ?? 1) - 1] ?? "?",
      kWh: hasAdjusted
        ? Math.round(adjustedResult!.monthly[i]?.E_m ?? 0)
        : Math.round(m.E_m ?? 0),
    };
    if (hasAdjusted) {
      base.kWhOriginal = Math.round(m.E_m ?? 0);
    }
    return base;
  });

  return (
    <div className="results-panel">
      {monthlyData.length > 0 && (
        <div className="chart-container">
          <h4 className="chart-title">
            Monatlicher Ertrag (kWh)
            {shadowAnalysisStatus === "running" && (
              <span className="chart-analysis-hint"> — Analyse läuft...</span>
            )}
          </h4>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ebece6" />
              <XAxis dataKey="name" tick={{ fill: "#101920b3", fontSize: 11 }} />
              <YAxis tick={{ fill: "#101920b3", fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: "#101920",
                  border: "1px solid #36393f99",
                  borderRadius: 8,
                  color: "#f1f5f9",
                  fontSize: 13,
                }}
              />
              {hasAdjusted && (
                <Bar dataKey="kWhOriginal" fill="#fff36540" radius={[4, 4, 0, 0]} name="Ohne Verschattung" />
              )}
              <Bar dataKey="kWh" fill="#fff365" radius={[4, 4, 0, 0]} name={hasAdjusted ? "Mit Verschattung" : "kWh"} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {monthlyData.length > 0 && (
        <div className="monthly-table">
          <h4 className="chart-title">Monatsdetails</h4>
          <table>
            <thead>
              <tr>
                <th>Monat</th>
                <th>kWh</th>
                <th>kWh/m²</th>
                {hasAdjusted && <th>Verschattung</th>}
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((m, i) => {
                const adjustedMonth = adjustedResult?.monthly[i];
                const displayEnergy = hasAdjusted ? adjustedMonth?.E_m : m.E_m;
                const shadingPct = adjustedMonth
                  ? Math.round((1 - adjustedMonth.shadingFactor) * 100)
                  : null;

                return (
                  <tr key={m.month}>
                    <td>{MONTH_NAMES[(m.month ?? 1) - 1] ?? "?"}</td>
                    <td>{displayEnergy?.toFixed(1) ?? "–"}</td>
                    <td>{m.H_i_m?.toFixed(1) ?? "–"}</td>
                    {hasAdjusted && (
                      <td className={shadingPct && shadingPct > 20 ? "shading-high" : ""}>
                        {shadingPct !== null ? `${shadingPct}%` : "–"}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="result-footer">
        <span className="result-footer__value">{yearlyIrradiation.toFixed(0)} kWh/m²/a</span>
        <span className="result-footer__label">Einstrahlung gesamt</span>
      </div>
    </div>
  );
}
