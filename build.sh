#!/bin/bash
set -e
cd Screen-Image-Builder
PORT=5000 BASE_PATH=/ pnpm --filter @workspace/cardmaker run build
pnpm --filter @workspace/api-server run build
