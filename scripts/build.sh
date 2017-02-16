#!/usr/bin/env bash

rm -rf build/ && \
  NODE_ENV=production webpack && \
  cp serverless.yml build/ && \
  package-strip-deps < package.json > build/package.json
