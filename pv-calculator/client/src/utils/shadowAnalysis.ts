import * as Cesium from "cesium";
import type { ShadowAnalysisResult, MonthlyShadingFactor } from "../types/shadowAnalysis";

const SAMPLE_HOURS = Array.from({ length: 15 }, (_, i) => 6 + i); // 6:00 to 20:00

function yieldToUI(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function getSunDirectionECEF(julianDate: Cesium.JulianDate): Cesium.Cartesian3 {
  // Sun position in Earth Inertial (ECI) frame
  const sunECI = Cesium.Simon1994PlanetaryPositions.computeSunPositionInEarthInertialFrame(julianDate);

  // Transform ECI -> ECEF using TEME-to-PseudoFixed rotation
  const transform = Cesium.Transforms.computeTemeToPseudoFixedMatrix(julianDate);
  if (!transform) return sunECI;

  const sunECEF = Cesium.Matrix3.multiplyByVector(transform, sunECI, new Cesium.Cartesian3());
  return sunECEF;
}

function computeSunElevation(
  surfacePoint: Cesium.Cartesian3,
  sunPositionECEF: Cesium.Cartesian3
): number {
  // Direction from surface to sun
  const dirToSun = Cesium.Cartesian3.subtract(sunPositionECEF, surfacePoint, new Cesium.Cartesian3());
  Cesium.Cartesian3.normalize(dirToSun, dirToSun);

  // Surface normal (up direction at the point)
  const surfaceNormal = Cesium.Cartesian3.normalize(
    Cesium.Cartesian3.clone(surfacePoint),
    new Cesium.Cartesian3()
  );

  // Elevation = angle between horizon plane and sun direction
  const dot = Cesium.Cartesian3.dot(dirToSun, surfaceNormal);
  return Math.asin(Cesium.Math.clamp(dot, -1, 1));
}

export async function runShadowAnalysis(
  viewer: Cesium.Viewer,
  centroid: { lat: number; lon: number },
  avgHeight: number,
  cancelled: { current: boolean }
): Promise<ShadowAnalysisResult> {
  const surfacePoint = Cesium.Cartesian3.fromDegrees(centroid.lon, centroid.lat, avgHeight);

  // Offset the ray origin 1m above the surface along the surface normal
  const surfaceNormal = Cesium.Cartesian3.normalize(
    Cesium.Cartesian3.clone(surfacePoint),
    new Cesium.Cartesian3()
  );
  const rayOrigin = Cesium.Cartesian3.add(
    surfacePoint,
    Cesium.Cartesian3.multiplyByScalar(surfaceNormal, 1.0, new Cesium.Cartesian3()),
    new Cesium.Cartesian3()
  );

  const monthlyShadingFactors: MonthlyShadingFactor[] = [];
  let sampleCount = 0;

  for (let month = 1; month <= 12; month++) {
    if (cancelled.current) throw new Error("cancelled");

    let sunlitHours = 0;
    let totalHours = 0;

    // Use the 21st of each month as representative day
    const year = new Date().getFullYear();
    const day = 21;

    for (const hour of SAMPLE_HOURS) {
      if (cancelled.current) throw new Error("cancelled");

      const date = new Date(Date.UTC(year, month - 1, day, hour, 0, 0));
      const julianDate = Cesium.JulianDate.fromDate(date);

      const sunPositionECEF = getSunDirectionECEF(julianDate);
      const elevation = computeSunElevation(surfacePoint, sunPositionECEF);

      // Skip if sun is below horizon
      if (elevation <= 0) continue;

      totalHours++;

      // Direction from ray origin to sun
      const dirToSun = Cesium.Cartesian3.subtract(
        sunPositionECEF,
        rayOrigin,
        new Cesium.Cartesian3()
      );
      Cesium.Cartesian3.normalize(dirToSun, dirToSun);

      const ray = new Cesium.Ray(rayOrigin, dirToSun);
      const hit = (viewer.scene as any).pickFromRay(ray, []);

      if (!hit || !hit.object) {
        // No obstruction -> sunlit
        sunlitHours++;
      }

      sampleCount++;
      // Yield to UI every 12 samples
      if (sampleCount % 12 === 0) {
        await yieldToUI();
      }
    }

    const factor = totalHours > 0 ? sunlitHours / totalHours : 1;

    monthlyShadingFactors.push({
      month,
      factor,
      sunlitHours,
      totalHours,
    });
  }

  // Overall factor: weighted by totalHours per month
  const totalSunlit = monthlyShadingFactors.reduce((s, m) => s + m.sunlitHours, 0);
  const totalChecked = monthlyShadingFactors.reduce((s, m) => s + m.totalHours, 0);
  const overallFactor = totalChecked > 0 ? totalSunlit / totalChecked : 1;

  return { monthlyShadingFactors, overallFactor };
}
