#!/bin/sh
set -e

# Inject runtime environment variables into index.html
if [ -n "$VITE_CESIUM_ION_TOKEN" ]; then
  sed -i "s|window.__ENV__ = {};|window.__ENV__ = {VITE_CESIUM_ION_TOKEN:\"$VITE_CESIUM_ION_TOKEN\"};|" /usr/share/nginx/html/index.html
fi

exec "$@"
