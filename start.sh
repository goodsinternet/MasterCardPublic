#!/bin/bash
set -e
export PORT=5000
export NODE_ENV=production
cd Screen-Image-Builder
node artifacts/api-server/dist/index.mjs
