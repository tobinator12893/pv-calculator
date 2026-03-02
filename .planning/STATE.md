# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-01)

**Core value:** Production-fähige Docker-Container, die zuverlässig in einer Cloud-Umgebung deployt werden können — mit sauberer Trennung von Client und Server
**Current focus:** Phase 1 - Build Context Safety

## Current Position

Phase: 1 of 5 (Build Context Safety)
Plan: 1 of 1 in current phase (COMPLETE)
Status: Phase 1 complete — ready for Phase 2 (Server Dockerfile)
Last activity: 2026-03-02 — Completed 01-01 (.dockerignore files)

Progress: [██░░░░░░░░] 20%

## Performance Metrics

**Velocity:**
- Total plans completed: 1
- Average duration: 2min
- Total execution time: 0.03 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-build-context-safety | 1 | 2min | 2min |

**Recent Trend:**
- Last 5 plans: 2min
- Trend: -

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap]: Two separate containers (client Nginx, server Node.js) — not a monolith
- [Roadmap]: Runtime token injection via entrypoint script — token never baked into image
- [Roadmap]: Server-first build order — server container verified independently before Nginx proxy config written
- [01-01]: Per-service .dockerignore placement at each service directory root (not project root) — required for Docker to pick up the file when build context is the service directory
- [01-01]: Proactive server .env exclusion added even though no .env exists yet — zero cost, prevents future secret leaks

### Pending Todos

None yet.

### Blockers/Concerns

- [Phase 4]: Runtime token injection has two viable implementation approaches (sed placeholder vs. window.__ENV__). Verify during Phase 4 which approach the existing React codebase supports and that the placeholder string survives Vite minification.
- [Phase 2]: GET /health endpoint may not exist in Express server — verify and add if needed.
- [Phase 3]: Existing Express route prefix must be inspected before writing nginx.conf proxy_pass (Pitfall 3 from research).

## Session Continuity

Last session: 2026-03-02
Stopped at: Completed 01-01-PLAN.md — Phase 1 complete, both .dockerignore files committed (d5bb4dc)
Resume file: None
