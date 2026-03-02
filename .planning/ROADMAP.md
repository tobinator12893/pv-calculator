# Roadmap: PV-Calculator Containerisierung

## Overview

Five phases that containerize an existing full-stack PV-Calculator application. Work proceeds in strict dependency order: build context safety first (prerequisite for all Docker builds), then the server container in isolation, then the client container with its Nginx configuration, then the complex runtime token injection for Cesium Ion, and finally Docker Compose integration that validates everything end-to-end. Each phase delivers a verifiable, independently testable artifact before the next phase begins.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Build Context Safety** - Create .dockerignore files to ensure correct, secure Docker build contexts
- [ ] **Phase 2: Server Container** - Multi-stage Dockerfile that compiles TypeScript and runs Express in production
- [ ] **Phase 3: Client Container** - Multi-stage Dockerfile with Vite build and Nginx serving + reverse proxy
- [ ] **Phase 4: Runtime Token Injection** - Inject Cesium Ion Token at container startup without baking it into the image
- [ ] **Phase 5: Compose Integration** - Wire both containers together and validate full end-to-end functionality

## Phase Details

### Phase 1: Build Context Safety
**Goal**: Correct, minimal Docker build contexts that exclude secrets, development artifacts, and unnecessary files before any docker build command runs
**Depends on**: Nothing (first phase)
**Requirements**: BUILD-03
**Success Criteria** (what must be TRUE):
  1. Running `docker build` for the server does not include node_modules, dist, .env, or .git in the build context
  2. Running `docker build` for the client does not include node_modules, dist, .env, or .git in the build context
  3. .dockerignore files exist at both client/ and server/ (or project root as appropriate) and cover all exclusion categories
**Plans:** 1 plan

Plans:
- [ ] 01-01-PLAN.md — Create .dockerignore files for client and server containers

### Phase 2: Server Container
**Goal**: A working production Docker image for the Express/TypeScript server that runs as non-root with NODE_ENV=production and exposes a /health endpoint
**Depends on**: Phase 1
**Requirements**: BUILD-01, RUNTIME-02, RUNTIME-03
**Success Criteria** (what must be TRUE):
  1. `docker build` produces a server image without error
  2. `docker run` starts the container and the Express server is reachable on port 3001
  3. `curl http://localhost:3001/health` returns HTTP 200 OK
  4. The container process runs as a non-root user (verifiable via `docker exec ... id`)
  5. The NODE_ENV environment variable is set to production inside the running container
**Plans**: TBD

Plans:
- [ ] 02-01: Write multi-stage server Dockerfile (TypeScript compile stage + slim production runtime stage)
- [ ] 02-02: Add GET /health endpoint to Express server if not already present; verify non-root user and NODE_ENV

### Phase 3: Client Container
**Goal**: A working production Docker image for the React/Vite frontend served by Nginx, with SPA routing, /api reverse proxy, gzip compression, static asset cache headers, and security headers
**Depends on**: Phase 2
**Requirements**: BUILD-02, BUILD-04, BUILD-05, NGINX-01, NGINX-02, NGINX-03, NGINX-04, NGINX-05
**Success Criteria** (what must be TRUE):
  1. `docker build` produces a client image without error
  2. Navigating to a React Router sub-path directly (e.g. /calculator) and refreshing the browser returns the React app, not a 404
  3. Requests to /api/* are forwarded to the server container and return valid API responses
  4. Response headers include gzip encoding for JS/CSS/JSON assets
  5. Security headers (X-Frame-Options, X-Content-Type-Options) are present on responses
**Plans**: TBD

Plans:
- [ ] 03-01: Write multi-stage client Dockerfile (Vite build stage + nginx:stable-alpine runtime stage); verify layer cache order and non-root user for both Dockerfiles
- [ ] 03-02: Write nginx.conf with SPA fallback routing, /api reverse proxy, gzip, cache headers, and security headers

### Phase 4: Runtime Token Injection
**Goal**: The client container receives VITE_CESIUM_ION_TOKEN at startup via environment variable and the Cesium map renders correctly, with the token never stored in any image layer
**Depends on**: Phase 3
**Requirements**: RUNTIME-01
**Success Criteria** (what must be TRUE):
  1. Building the client image without providing the token produces an image where no Cesium token value appears in any layer (verifiable with `docker history` or `docker inspect`)
  2. Starting the container with `-e VITE_CESIUM_ION_TOKEN=<token>` causes the Cesium map to load and render correctly in the browser
  3. Starting two containers with different token values serves each with its respective token (same image, different runtime config)
**Plans**: TBD

Plans:
- [ ] 04-01: Implement entrypoint script in /docker-entrypoint.d/ that replaces the token placeholder at startup; verify placeholder survives Vite minification

### Phase 5: Compose Integration
**Goal**: Both containers run together via Docker Compose, the full application works end-to-end, the server is not reachable from the host, and production-quality restart and log policies are in place
**Depends on**: Phase 4
**Requirements**: COMPOSE-01, COMPOSE-02, COMPOSE-03, RUNTIME-04
**Success Criteria** (what must be TRUE):
  1. `docker compose up` starts both containers and the PV-Calculator application loads fully in a browser at http://localhost
  2. A PV calculation request completes successfully end-to-end (frontend → Nginx → server → PVGIS API → response rendered)
  3. Attempting to reach the server directly from the host (e.g. `curl http://localhost:3001`) fails or times out
  4. Stopping and restarting the Docker daemon causes both containers to restart automatically
  5. Container logs are subject to rotation (json-file driver with max-size and max-file configured)
**Plans**: TBD

Plans:
- [ ] 05-01: Write compose.yml with service definitions, shared network, environment variable passing, restart policies, and log rotation

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Build Context Safety | 0/1 | Not started | - |
| 2. Server Container | 0/2 | Not started | - |
| 3. Client Container | 0/2 | Not started | - |
| 4. Runtime Token Injection | 0/1 | Not started | - |
| 5. Compose Integration | 0/1 | Not started | - |
