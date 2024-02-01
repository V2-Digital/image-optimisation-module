ARG BUN_VERSION
FROM --platform=linux/amd64 oven/bun:${BUN_VERSION}


RUN apt-get update && apt-get install --yes --no-install-recommends \
  make \
  bash

WORKDIR /app

ENTRYPOINT [ "" ]
