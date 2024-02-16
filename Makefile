.PHONY: all
all:

project:
	docker compose run --rm app bun .projenrc.ts

build:
	docker compose run --rm app bun install
	docker compose run --rm app bun run build

clean:
	docker compose down --remove-orphans --volumes

run:
	docker compose run --service-ports --rm app bun --hot run src/local.ts

lint:
	docker compose run --service-ports --rm app bun run lint

format:
	docker compose run --service-ports --rm app bun run format
