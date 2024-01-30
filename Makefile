.PHONY: all
all:

project:
	docker compose run --rm app bun .projenrc.ts

run:
	docker compose run --rm app bun start

build:
	docker compose run --rm app bun install
	docker compose run --rm app bun run build

init plan apply tf_shell: % :
	docker compose run --rm terraform make $(*)

clean:
	rm -rf terraform/.terraform dist
	docker compose down --remove-orphans --volumes
