COMPOSE ?= docker compose
COMPOSE_DEV = $(COMPOSE) -f docker-compose.yml -f docker-compose.dev.yml
COMPOSE_SELFHOST = $(COMPOSE) -f docker-compose.selfhost.yml --env-file .env.selfhost

.PHONY: up down logs migrate seed test-backend test-web test format lint help \
	selfhost-secrets selfhost-up selfhost-down selfhost-logs selfhost-ps selfhost-migrate

help:
	@echo "Targets: up down logs migrate seed test-backend test-web test format lint"
	@echo "Self-host: selfhost-secrets selfhost-up selfhost-down selfhost-logs selfhost-ps selfhost-migrate"

up:
	$(COMPOSE) up -d --build

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f --tail=200

migrate:
	$(COMPOSE) exec backend alembic upgrade head

seed:
	$(COMPOSE) exec -T db psql -U $${POSTGRES_USER:-postgres} -d $${POSTGRES_DB:-handwerk} < supabase/seed.sql

test-backend:
	$(COMPOSE) exec backend pytest -q

test-web:
	cd web && npx tsc --noEmit

test: test-backend test-web

format:
	cd backend && ruff format .

lint:
	cd backend && ruff check .
	cd web && npx tsc --noEmit

# --- Self-hosting (docker-compose.selfhost.yml) ------------------------------
selfhost-secrets:
	./scripts/generate-secrets.sh --write

selfhost-up:
	$(COMPOSE_SELFHOST) up -d --build

selfhost-down:
	$(COMPOSE_SELFHOST) down

selfhost-logs:
	$(COMPOSE_SELFHOST) logs -f --tail=200

selfhost-ps:
	$(COMPOSE_SELFHOST) ps

selfhost-migrate:
	set -a; . ./.env.selfhost; set +a; ./scripts/migrate-cloud-to-selfhost.sh all
