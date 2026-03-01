# PV-Calculator Containerisierung

## What This Is

Containerisierung der bestehenden PV-Calculator Anwendung (React+Vite Frontend, Express+TypeScript Backend) als zwei separate Docker-Container für Cloud-Deployment (AWS/GCP). Der Client wird über Nginx als statische Dateien serviert, der Server läuft als Node.js Container.

## Core Value

Production-fähige Docker-Container, die zuverlässig in einer Cloud-Umgebung deployt werden können — mit sauberer Trennung von Client und Server.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Dockerfile für den Server (Express/TypeScript) mit Multi-Stage Build
- [ ] Dockerfile für den Client (React/Vite) mit Nginx als Webserver
- [ ] Docker Compose für das Zusammenspiel beider Container
- [ ] Nginx-Konfiguration mit Reverse Proxy für /api Requests an den Server
- [ ] Cesium Ion Token wird zur Laufzeit injiziert (nicht im Image gebacken)
- [ ] .dockerignore für Client und Server (node_modules, dist, etc.)
- [ ] Container starten korrekt und Anwendung funktioniert end-to-end

### Out of Scope

- Dev-Umgebung mit Hot Reload — Fokus ist rein Production
- CI/CD Pipeline — wird separat aufgesetzt
- Kubernetes/Helm Charts — erstmal Docker Compose reicht
- SSL/TLS Termination — wird vom Cloud-Provider gehandelt
- Monitoring/Logging-Setup — kommt später

## Context

- **Bestehende App**: PV-Calculator mit React 19 + Vite (Client) und Express 5 + TypeScript (Server)
- **Separate node_modules**: Client und Server haben jeweils eigene package.json und node_modules
- **API Proxy**: Client erwartet /api Prefix, Server lauscht auf Port 3001
- **Secrets**: Cesium Ion Token liegt in client/.env als VITE_CESIUM_ION_TOKEN — muss zur Laufzeit injiziert werden
- **PVGIS API**: Server ruft extern die EU PVGIS API auf — Container braucht Internetzugang
- **UI-Sprache**: Deutsch
- **Ziel-Hosting**: Cloud (AWS/GCP) — Container Registry + Cloud Run, ECS o.ä.

## Constraints

- **Runtime Injection**: VITE_CESIUM_ION_TOKEN darf nicht im Docker Image eingebacken sein — Laufzeit-Injektion erforderlich
- **Bestehende Struktur**: Die App-Struktur (client/, server/) bleibt unverändert
- **Node Version**: Node v24.12.0 wird aktuell verwendet (nvm)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Zwei separate Container statt Monolith | Unabhängiges Skalieren, klare Trennung, Cloud-native | — Pending |
| Nginx für Client statt Node serve | Performanter für statische Dateien, bewährt in Production | — Pending |
| Runtime Token Injection statt Build-Arg | Secret nicht im Image, flexibel zwischen Environments | — Pending |

---
*Last updated: 2026-03-01 after initialization*
