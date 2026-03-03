export interface PVParameters {
  angle: number;     // tilt/neigung in degrees
  aspect: number;    // azimut in degrees (-180 to 180, 0=south)
  efficiency: number; // panel efficiency (0-1)
  loss: number;       // system losses in percent
}

export interface PVMonthlyData {
  month: number;
  E_m: number;   // monthly energy kWh
  H_i_m: number; // monthly irradiation kWh/m²
}

export interface PVYearlyData {
  E_y: number;   // yearly energy kWh
  H_i_y: number; // yearly irradiation kWh/m²
}

export interface PVResult {
  monthly: PVMonthlyData[];
  yearly: PVYearlyData;
}

export interface PVCalculationRequest {
  lat: number;
  lon: number;
  peakpower: number;
  loss: number;
  angle: number;
  aspect: number;
}
