# ==============================================================================
# CarbonLoom — Automation & Developer Operations Makefile
# ==============================================================================

.PHONY: help setup test sim build serve docker-up docker-down docker-edge clean

PYTHON ?= python3
VENV ?= .venv
BIN ?= $(VENV)/bin

help:
	@echo "CarbonLoom Development & Operations CLI"
	@echo ""
	@echo "Usage:"
	@echo "  make setup        Initialize Python virtualenv & install npm/pip dependencies"
	@echo "  make test         Execute full pytest suite across all modules (22 tests)"
	@echo "  make sim          Run Digital Twin simulator to produce synthetic telemetry & bills"
	@echo "  make build        Compile TypeScript ASCII skyline & SCADA visual engine"
	@echo "  make serve        Launch local HTTP server on http://localhost:8080"
	@echo "  make docker-up    Start full cloud production infrastructure via Docker Compose"
	@echo "  make docker-down  Stop production infrastructure"
	@echo "  make docker-edge  Start on-premise edge MQTT broker and local buffer"
	@echo "  make clean        Remove temporary files, cache, and build artifacts"

setup:
	@echo "==> Setting up Python virtual environment..."
	@$(PYTHON) -m venv $(VENV)
	@$(BIN)/pip install --upgrade pip
	@$(BIN)/pip install -r services/api/requirements.txt
	@echo "==> Installing Node.js packages..."
	@npm install
	@echo "==> CarbonLoom environment setup complete."

test:
	@echo "==> Running automated test suite..."
	@if [ -d "$(VENV)" ]; then \
		$(BIN)/pytest sim/ circuits/ fabric/ eval/ services/; \
	else \
		pytest sim/ circuits/ fabric/ eval/ services/; \
	fi

sim:
	@echo "==> Executing Digital Twin Factory Simulator..."
	@if [ -d "$(VENV)" ]; then \
		PYTHONPATH=. $(BIN)/python -m sim.data_generator; \
	else \
		PYTHONPATH=. $(PYTHON) -m sim.data_generator; \
	fi

build:
	@echo "==> Bundling ASCII skyline and interaction assets..."
	@npx esbuild scripts/carbon-ascii.ts --bundle --outfile=js/carbon-skyline.js --format=iife --global-name=CarbonAsciiSkyline

serve:
	@echo "==> Starting CarbonLoom server at http://localhost:8080..."
	@$(PYTHON) -m http.server 8080

docker-up:
	@echo "==> Starting production infrastructure (Postgres, Timescale, Neo4j, MinIO, Redis, NATS, API, Gateway)..."
	@cd infra && docker compose up -d

docker-down:
	@echo "==> Stopping production infrastructure..."
	@cd infra && docker compose down

docker-edge:
	@echo "==> Starting edge telemetry collector & Mosquitto MQTT broker..."
	@cd edge && docker compose -f docker-compose-edge.yml up -d

clean:
	@echo "==> Cleaning cache and temporary artifacts..."
	@find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	@find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	@find . -type f -name "*.pyc" -delete 2>/dev/null || true
	@echo "==> Clean complete."
