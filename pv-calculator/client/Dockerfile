# syntax=docker/dockerfile:1

# --- Stage 1: Build ---
FROM node:24-bookworm-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json tsconfig.app.json tsconfig.node.json ./
COPY index.html ./
COPY public ./public
COPY src ./src
COPY vite.config.ts ./

RUN npm run build

# --- Stage 2: Runtime ---
FROM nginx:stable-alpine AS runtime

# Create writable directories for non-root nginx
RUN mkdir -p /var/run/nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/run/nginx /var/cache/nginx /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Copy build output
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html

USER nginx

EXPOSE 8080

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
