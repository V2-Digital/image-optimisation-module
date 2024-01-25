.PHONY: all
all:

run:
	docker compose run --rm app bun start

project:
	docker compose run --rm app bun .projenrc.ts
