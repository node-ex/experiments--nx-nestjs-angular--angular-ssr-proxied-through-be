#!/usr/bin/env bash

set -e

IMAGE_NAME="app-angular-1-ssr"
IMAGE_TAG="latest"
CONTAINER_NAME="app-angular-1-ssr"
HOST_PORT="4000"
CONTAINER_PORT="4000"

# Stop and remove existing container if it exists
./scripts/docker/app-angular-1-ssr/stop.sh

docker container run \
  --interactive \
  --tty \
  --rm \
  --init \
  --name "$CONTAINER_NAME" \
  --publish "${HOST_PORT}:${CONTAINER_PORT}" \
  "${IMAGE_NAME}:${IMAGE_TAG}"

