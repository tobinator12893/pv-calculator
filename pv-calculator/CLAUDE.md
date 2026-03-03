# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PV-Calculator is a full-stack photovoltaic energy calculation app. Users draw polygonal areas on a 3D Cesium map to represent rooftop surfaces, configure PV panel parameters, and calculate annual/monthly energy yields via the EU PVGIS API.

## Development Commands

### Client (`/client`)
```bash
npm run dev      # Vite dev server on port 5173, proxies /api to localhost:3001
npm run build    # TypeScript check + Vite production build
npm run lint     # ESLint
```

### Server (`/server`)
```bash
npm run dev      # tsx watch with hot reload on port 3001
npm run build    # TypeScript compilation to dist/
npm run start    # Run compiled output (node dist/index.js)
```

**Note:** Node is managed via nvm. Source nvm before running commands: `source "$HOME/.nvm/nvm.sh"`

Both must run simultaneously for development. Start the server first, then the client.

## Architecture

### Client (React 19 + TypeScript + Vite)
- **Components**: `CesiumMap/` (3D map + drawing toolbar) and `Sidebar/` (address search, parameter form, results panel)
- **Hooks**: `usePolygonDrawing` (polygon state/drawing), `usePVCalculation` (API calls/results), `useGeocode` (address search with 300ms debounce)
- **Services**: `api.ts` (Axios instance with `/api` base), `pvService.ts` (typed API call wrappers)
- **Types**: Separate files for `pv.ts`, `geocode.ts`, `drawing.ts`
- **Utils**: `polygonArea.ts` and `polygonCenter.ts` use Turf.js for geodesic calculations; `pvConversions.ts` converts area to peak power
- **Constants**: `defaults.ts` holds default PV params, panel density (200 W/m²), CO2 factor

### Server (Express 5 + TypeScript)
- **POST `/api/pv/calculate`**: Validates input with Zod, calls PVGIS v5.3 API, returns monthly/yearly energy data
- **GET `/api/geocode?q=...&limit=5`**: Proxies to Nominatim OpenStreetMap API
- **Validation**: All request validation via Zod schemas in `utils/validation.ts`
- **Error responses**: Always JSON with `error` and `message` fields; 400 for validation, 502 for upstream API failures

### Data Flow
1. User draws polygon on Cesium map → `usePolygonDrawing` calculates geodesic area + centroid
2. User adjusts PV parameters (tilt angle, azimuth, efficiency, system losses)
3. Peak power computed: `area × efficiency × panel_density`
4. "Berechnen" button → `POST /api/pv/calculate` with lat, lon, peakpower, angle, aspect, loss
5. Server calls PVGIS API → returns monthly kWh + yearly totals
6. Results displayed as Recharts bar chart + summary cards + monthly table

## Key Technical Details

- **UI language**: German (Neigung, Azimut, Systemverluste, Berechnen, etc.)
- **Styling**: CSS with variables; theme is yellow (#fff365) on navy (#101920)
- **Map**: Cesium with Google Photorealistic 3D Tiles via Cesium Ion token (in `.env` as `VITE_CESIUM_ION_TOKEN`)
- **CesiumMap is memoized** (`React.memo`) to prevent expensive re-renders
- **PVGIS coverage**: Works for European locations; non-EU coordinates may return 502
- **No state management library**: App uses React hooks only (useState, useCallback)
- **Layout**: Fixed two-column (map left, sidebar right), not responsive/mobile
