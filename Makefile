.PHONY: all
all:

project:
	docker compose run --rm app bun .projenrc.ts

run:
	docker compose run --rm app bun start

build:
	docker compose run --rm app bun install
	docker compose run --rm app bun run build
