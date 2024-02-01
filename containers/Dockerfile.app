ARG BUN_VERSION
FROM --platform=linux/amd64 oven/bun:${BUN_VERSION}

RUN apk add --no-cache \
  make \
  bash

WORKDIR /app

ENTRYPOINT [ "" ]
