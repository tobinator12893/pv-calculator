# Login Page Design

**Date:** 2026-03-01
**Status:** Approved

## Summary

Password-gate login page shown before the PV calculator app. Fullscreen Cesium 3D map as background with a centered glasmorphism card containing a single password field.

## Requirements

- Single password field ("Zugangs-Code")
- Password checked server-side against `AUTH_PASSWORD` env var
- Token stored in localStorage, verified on app load
- Tokens stored in server memory (lost on restart — acceptable)
- Visual style matches existing sidebar (glasmorphism, navy/yellow theme)

## Architecture

- **Client:** `isAuthenticated` state in App.tsx. `false` → LoginPage, `true` → current app.
- **Server:** `POST /api/auth/login` (check password, return token), `POST /api/auth/verify` (check token validity).
- **No router needed** — simple conditional render.

## Components

- `LoginPage.tsx` + `LoginPage.css` — fullscreen with Cesium bg + glass card
- `authRoutes.ts` — Express routes for login/verify
- `authStore.ts` — in-memory token Set
