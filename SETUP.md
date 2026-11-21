# CarbonLoom — Comprehensive Setup & Operations Guide

This guide provides step-by-step instructions for running CarbonLoom across development, testing, and production environments.

---

## Table of Contents
1. [System Requirements](#1-system-requirements)
2. [Quickstart (3-Minute Setup)](#2-quickstart-3-minute-setup)
3. [Python Deterministic Environment](#3-python-deterministic-environment)
4. [Node.js & Frontend Tooling](#4-nodejs--frontend-tooling)
5. [Docker Production Infrastructure Stack](#5-docker-production-infrastructure-stack)
6. [Running the Automated Verification Suite](#6-running-the-automated-verification-suite)
7. [Digital Twin Simulator & Synthetic Data Generation](#7-digital-twin-simulator--synthetic-data-generation)
8. [Edge Gateway & ESP32 Current Sensor Flashing](#8-edge-gateway--esp32-current-sensor-flashing)
9. [Zero-Knowledge Circuit Verification (Circom 2)](#9-zero-knowledge-circuit-verification-circom-2)
10. [Hyperledger Fabric Tamper Demo Engine](#10-hyperledger-fabric-tamper-demo-engine)
11. [Troubleshooting & FAQ](#11-troubleshooting--faq)

---

## 1. System Requirements

### Supported Operating Systems
* **macOS:** Apple Silicon (M1/M2/M3/M4) or Intel, macOS 13+
* **Linux:** Ubuntu 22.04 LTS / Debian 12 / RHEL 9 (amd64 or arm64)
* **Windows:** Windows 10/11 with WSL2 (Ubuntu 22.04 LTS recommended)

### Software Prerequisites
| Tool | Minimum Version | Installation Check | Required For |
| :--- | :--- | :--- | :--- |
| **Python** | `3.10+` | `python3 --version` | Deterministic carbon math engine & test suites |
| **Node.js** | `18.0+` | `node --version` | Frontend assets, esbuild bundling & styling |
| **Docker** | `24.0+` | `docker --version` | PostgreSQL, TimescaleDB, Neo4j, MinIO, Redis, NATS |
| **Docker Compose** | `v2.20+` | `docker compose version` | Multi-container production & edge orchestration |
| **Make** | `3.81+` | `make --version` | Developer automation CLI |
| *(Optional)* **Go** | `1.21+` | `go version` | `services/mcp-gateway-go` policy gateway |

---

## 2. Quickstart (3-Minute Setup)

### Clone the Repository
```bash
git clone https://github.com/4ladeen/CarbonLoom.git
cd CarbonLoom
```

### Option A: Using the Automation Makefile (Fastest)
```bash
# 1. Initialize virtualenv and install all dependencies:
make setup

# 2. Run the automated test suite (verifies all 22 tests pass):
make test

# 3. Launch the local web server:
make serve
```
Open **`http://localhost:8080`** in your browser.

### Option B: Manual Setup
```bash
# 1. Python virtual environment
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r services/api/requirements.txt

# 2. Node.js dependencies
npm install

# 3. Verify tests
pytest sim/ circuits/ fabric/ eval/ services/

# 4. Serve
python3 -m http.server 8080
```

---

## 3. Python Deterministic Environment

CarbonLoom enforces the **Zero-LLM-Arithmetic Law (`CLAUDE.md §1`)**: all emission calculations, Standard Minute Value (SMV) physics equations, and European Carbon Border Adjustment Mechanism (CBAM) financial math execute strictly in deterministic Python.

### Virtual Environment Configuration
```bash
# Create virtual environment in project root
python3 -m venv .venv

# Activate environment:
# On macOS / Linux:
source .venv/bin/activate

# On Windows (PowerShell):
.venv\Scripts\Activate.ps1

# Install core deterministic dependencies:
pip install -r services/api/requirements.txt
```

### Installed Core Packages
* `fastapi`: High-performance deterministic API framework
* `pydantic`: Strict physical schema validation and type enforcement
* `pytest` & `pytest-asyncio`: Automated test harness
* `numpy` & `pandas`: Vectorized telemetry time-series and allocation tables
* `openpyxl`: Audit-ready spreadsheet and customs export generators

---

## 4. Node.js & Frontend Tooling

CarbonLoom uses lightweight, vanilla, zero-bundle-overhead HTML5 and modern CSS tokens paired with `esbuild` for high-performance canvas visualizers.

```bash
# Install development dependencies:
npm install

# Rebuild the SCADA ASCII canvas engine:
npm run build:skyline
# or:
make build
```

This compiles `scripts/carbon-ascii.ts` into the client-side IIFE bundle `js/carbon-skyline.js` in `<20ms`.

---

## 5. Docker Production Infrastructure Stack

CarbonLoom includes a complete production Docker Compose configuration orchestrating the entire multi-tenant backend in `infra/docker-compose.yml`.

### Launching the Stack
```bash
# 1. Copy the environment configuration template:
cp .env.example .env

# 2. Launch all services in detached mode:
make docker-up
# or:
cd infra && docker compose up -d
```

### Inspecting Container Status
```bash
docker compose -f infra/docker-compose.yml ps
```

You should see 8 healthy containers:
1. `carbonloom-postgres`: PostgreSQL 16 with `pgvector` extension and Row-Level Security (RLS) on port `5432`.
2. `carbonloom-timescaledb`: TimescaleDB 2.14 time-series engine on port `5433`.
3. `carbonloom-neo4j`: Neo4j 5.20 Graph Database on ports `7474` (browser) and `7687` (Bolt).
4. `carbonloom-minio`: MinIO S3 Object Storage on ports `9000` (API) and `9001` (Web Console).
5. `carbonloom-redis`: Redis 7.2 Cache and Token Spend Tracker on port `6379`.
6. `carbonloom-nats`: NATS 2.10 High-Throughput Streaming Bus on port `4222`.
7. `carbonloom-api`: FastAPI Deterministic Math Core on port `8000`.
8. `carbonloom-mcp-gateway`: Zero-Trust Go Policy Gateway on port `8080`.

### Stopping the Stack
```bash
make docker-down
# or:
cd infra && docker compose down
```

---

## 6. Running the Automated Verification Suite

Before merging any code or deploying to a pilot factory site, execute the complete 22-vector automated test suite:

```bash
make test
# or:
pytest sim/ circuits/ fabric/ eval/ services/ -v
```

### Test Breakdown by Subsystem:
| Test File | Tests | Coverage & Scope |
| :--- | :---: | :--- |
| `sim/tests/test_simulator.py` | 5 | Verifies energy conservation laws, boiler/chiller physics, injected steam trap leak labeling, and persistent `SIMULATED DATA` watermarks. |
| `circuits/test_circuit.py` | 1 | Evaluates all 6 adversarial boundary vectors against the Circom 2 `cbam_proof.circom` circuit. |
| `fabric/test_fabric_tamper.py` | 2 | Proves instant dual-layer cryptographic failure (Merkle root mismatch) when a single telemetry digit is altered. |
| `eval/test_all_evals.py` | 5 | Tests calculation lineage hashing (`lineage_id`), uncertainty propagation, and citation enforcement. |
| `services/agents/test_agents.py` | 4 | Tests dynamic supervisor routing, model cost tiering, and prompt-injection refusal. |
| `services/api/tests/test_carbon_engine.py` | 5 | Proves 0.00% arithmetic error across Scope 1, Scope 2, and SMV allocation equations. |

---

## 7. Digital Twin Simulator & Synthetic Data Generation

CarbonLoom includes a comprehensive Digital Twin factory simulator that models a 2,500-worker composite knitwear facility in Gazipur, Bangladesh (Apex Padma Knitwear Ltd):

```bash
# Generate 3 days of high-frequency telemetry, utility bills, and production batches:
make sim
# or:
PYTHONPATH=. python3 -m sim.data_generator
```

### Generated Files (`sim/output/`):
* `telemetry_sample.json`: 6,336 timestamped 15-minute readings across grid feeds, gas boilers, stenter ovens, air compressors, and sewing lines, including ground-truth injected steam trap leaks.
* `bills_sample.json`: Bilingual Bengali/English DESCO electricity and Titas gas invoices with realistic peak/off-peak charges and meter multipliers.
* `orders.json`: Apparel batch production runs with Standard Minute Value (SMV) work-content figures for Crewneck T-Shirts, Fleece Hoodies, and Chino Trousers.

---

## 8. Edge Gateway & ESP32 Current Sensor Flashing

For on-premise factory installations that must continue operating during internet outages:

### Launch Local Edge MQTT Broker
```bash
make docker-edge
# or:
cd edge && docker compose -f docker-compose-edge.yml up -d
```
This runs Mosquitto MQTT on port `1883` and a local SQLite queuing collector that buffers readings during ISP disconnects.

### Flashing ESP32 + SCT-013 Hardware Nodes
1. Open `edge/firmware/esp32_sct013.ino` in the Arduino IDE or PlatformIO.
2. Connect your ESP32-S3 or ESP32-C6 via USB-C.
3. Configure factory WiFi credentials in the firmware:
   ```cpp
   const char* ssid = "FACTORY_IOT_WIFI";
   const char* password = "SECURE_WPA2_KEY";
   const char* mqtt_server = "192.168.1.100"; // Local Mini-PC IP
   ```
4. Attach SCT-013 100A/50mA non-invasive current transformers to analog pins `GPIO34` and `GPIO35`.
5. Select board **ESP32 Dev Module** and flash.
6. The node will immediately stream 1-second RMS current readings to `factory/apex/line04/meter/sub_01`.

---

## 9. Zero-Knowledge Circuit Verification (Circom 2)

CarbonLoom uses Circom 2.1+ to compile Groth16 zk-SNARK circuits that prove compliance to European customs without revealing supplier trade secrets.

### Circuit Specification: `circuits/cbam_proof.circom`
* **Private Inputs (100% Concealed):**
  * `factory_fob_price_usd`: Supplier unit selling price.
  * `profit_margin_cents`: Supplier net margin.
  * `tier2_spinning_mill_id`: Supplier upstream yarn supplier.
  * `raw_steam_leak_kg`: Factory maintenance inefficiencies.
* **Public Inputs (Disclosed to Customs/Buyer):**
  * `allocated_carbon_intensity_kg`: Verified emission per garment.
  * `eu_benchmark_threshold_kg`: Regulatory ceiling ($\le 2.50\text{ kgCO}_2\text{e}$).
  * `evidence_merkle_root`: Cryptographic hash binding to raw telemetry.
* **Output:**
  * Groth16 proof pairing verification in `<142ms` client-side WebAssembly.

### Evaluating All 6 Boundary Vectors
```bash
python3 -c "
from circuits.witness_verifier import ZKWitnessSimulator, get_six_adversarial_vectors
vectors = get_six_adversarial_vectors()
for v in vectors:
    res = ZKWitnessSimulator.evaluate_witness(v)
    status = 'PASS (Expected)' if res['constraints_satisfied'] == v['expected_verdict'] else 'FAIL'
    print(f\"{v['vector_id']:25} -> {status}\")
"
```

---

## 10. Hyperledger Fabric Tamper Demo Engine

CarbonLoom's dual-layer trust plane pairs ZK proofs with Hyperledger Fabric 3-org private data collections (Factory, Accredited Verifier, and Brand Buyer).

### Testing the Tamper Demo
```bash
python3 -c "
from fabric.tamper_demo import TamperDemoEngine

# 1. Genuine Record:
genuine = TamperDemoEngine.create_anchored_batch()
v_genuine = TamperDemoEngine.verify_record_dual_layer(genuine)
print('Untampered Record:', v_genuine['overall_verdict'])

# 2. Alter a single digit:
tampered = TamperDemoEngine.apply_tampering(genuine, tampered_component_index=3, tampered_value=0.95)
v_tampered = TamperDemoEngine.verify_record_dual_layer(tampered)
print('Tampered Record:  ', v_tampered['overall_verdict'])
"
```

---

## 11. Troubleshooting & FAQ

### Q1: `ModuleNotFoundError: No module named 'pytest'`
**Solution:** Ensure your virtual environment is active:
```bash
source .venv/bin/activate
pip install -r services/api/requirements.txt
```

### Q2: Port 8080 or 8000 is already in use
**Solution:** If another local development server or proxy is running on port 8080:
```bash
# Check what is using port 8080:
lsof -i :8080

# Serve CarbonLoom on a custom port (e.g. 8085):
python3 -m http.server 8085
```

### Q3: How do I verify zero background text in the ASCII canvas?
**Solution:** The ASCII canvas visualizer in `scripts/carbon-ascii.ts` renders purely non-alphanumeric glyphs (`▀`, `║`, `≡`, `●`, `█`, `═`, `╤`, `│`, `▣`, `▒`, `░`). To recompile the bundle after making any changes:
```bash
make build
# or:
npx esbuild scripts/carbon-ascii.ts --bundle --outfile=js/carbon-skyline.js --format=iife --global-name=CarbonAsciiSkyline
```

### Q4: How do I test the in-browser WASM Groth16 verifier?
**Solution:** Navigate to [playground.html](http://localhost:8080/playground.html) or [index.html#secrecy](http://localhost:8080/#secrecy) and click **"Run Live In-Browser ZK Proof (WASM)"**. The WebAssembly worker generates a genuine Groth16 pairing proof in ~142ms.

---

### Need Help or Reporting Security Issues?
* File an issue on [GitHub Issues](https://github.com/4ladeen/CarbonLoom/issues).
* Review the technical invariants in [`CLAUDE.md`](CLAUDE.md).
* Review the full master specification in [`CarbonLoom Master Blueprint.md`](CarbonLoom%20Master%20Blueprint.md).
