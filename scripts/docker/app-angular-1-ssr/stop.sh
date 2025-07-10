#!/usr/bin/env bash

set -e

CONTAINER_NAME="app-angular-1-ssr"

docker container stop "$CONTAINER_NAME" 2>/dev/null || true
docker container rm "$CONTAINER_NAME" 2>/dev/null || true
