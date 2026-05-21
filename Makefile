COMPOSE ?= docker compose
COMPOSE_DEV = $(COMPOSE) -f docker-compose.yml -f docker-compose.dev.yml

.PHONY: up down logs migrate seed test-backend test-web test format lint help

help:
	@echo "Targets: up down logs migrate seed test-backend test-web test format lint"

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
