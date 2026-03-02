# Requirements: PV-Calculator Containerisierung

**Defined:** 2026-03-02
**Core Value:** Production-fähige Docker-Container, die zuverlässig in einer Cloud-Umgebung deployt werden können

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Dockerfiles & Build

- [ ] **BUILD-01**: Server has multi-stage Dockerfile (TS compile stage → node:24-bookworm-slim runtime)
- [ ] **BUILD-02**: Client has multi-stage Dockerfile (Vite build stage → nginx:stable-alpine runtime)
- [x] **BUILD-03**: Both containers have .dockerignore excluding node_modules, dist, .env, .git
- [ ] **BUILD-04**: Package files copied before source code for layer cache optimization
- [ ] **BUILD-05**: Both containers run as non-root user

### Nginx Configuration

- [ ] **NGINX-01**: Nginx serves SPA with fallback routing (try_files $uri $uri/ /index.html)
- [ ] **NGINX-02**: Nginx proxies /api requests to server container via Docker Compose service DNS
- [ ] **NGINX-03**: Gzip compression enabled for text, JS, CSS, JSON
- [ ] **NGINX-04**: Cache headers set for static assets (JS, CSS, images)
- [ ] **NGINX-05**: Security headers added (X-Frame-Options, X-Content-Type-Options, etc.)

### Runtime & Secrets

- [ ] **RUNTIME-01**: VITE_CESIUM_ION_TOKEN injected at container startup via entrypoint script (not baked into image)
- [ ] **RUNTIME-02**: Server container runs with NODE_ENV=production
- [ ] **RUNTIME-03**: Server has GET /health endpoint returning 200 OK
- [ ] **RUNTIME-04**: Both containers have restart policies (unless-stopped)

### Orchestration

- [ ] **COMPOSE-01**: compose.yml wires client and server containers on shared network
- [ ] **COMPOSE-02**: Server container not exposed to host (only reachable via Nginx)
- [ ] **COMPOSE-03**: Log rotation configured for both containers

## v2 Requirements

### Enhanced Orchestration

- **ORCH-01**: depends_on with health condition (server healthy before client starts)
- **ORCH-02**: CI/CD pipeline for automated builds and deploys
- **ORCH-03**: Kubernetes/Helm charts for larger-scale deployment

### Monitoring

- **MON-01**: Structured logging (JSON format)
- **MON-02**: Application metrics endpoint
- **MON-03**: Container monitoring dashboard

## Out of Scope

| Feature | Reason |
|---------|--------|
| Dev environment (hot reload) | Focus is production deployment only |
| SSL/TLS termination | Handled by cloud provider (ALB, Cloud Run) |
| Kubernetes/Helm | Docker Compose sufficient for initial deployment |
| CI/CD pipeline | Separate concern, built after containers work |
| Mobile responsiveness | Not a containerization concern |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| BUILD-01 | Phase 2 | Pending |
| BUILD-02 | Phase 3 | Pending |
| BUILD-03 | Phase 1 | Complete |
| BUILD-04 | Phase 3 | Pending |
| BUILD-05 | Phase 3 | Pending |
| NGINX-01 | Phase 3 | Pending |
| NGINX-02 | Phase 3 | Pending |
| NGINX-03 | Phase 3 | Pending |
| NGINX-04 | Phase 3 | Pending |
| NGINX-05 | Phase 3 | Pending |
| RUNTIME-01 | Phase 4 | Pending |
| RUNTIME-02 | Phase 2 | Pending |
| RUNTIME-03 | Phase 2 | Pending |
| RUNTIME-04 | Phase 5 | Pending |
| COMPOSE-01 | Phase 5 | Pending |
| COMPOSE-02 | Phase 5 | Pending |
| COMPOSE-03 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 17 total
- Mapped to phases: 17
- Unmapped: 0

---
*Requirements defined: 2026-03-02*
*Last updated: 2026-03-02 after Phase 1 completion (BUILD-03 complete)*
