#!/usr/bin/env bash

set -e

IMAGE_NAME="app-angular-1-ssr"
IMAGE_TAG="latest"
DOCKERFILE_PATH="./docker/app-angular-1-ssr/Dockerfile"
BUILD_CONTEXT="."

docker image build \
  --tag "${IMAGE_NAME}:${IMAGE_TAG}" \
  --file "$DOCKERFILE_PATH" \
  "$BUILD_CONTEXT"
