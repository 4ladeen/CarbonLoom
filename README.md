<div align="center">

# CarbonLoom (কার্বনলুম)
### Decarbonization OS & Cryptographic Compliance for Export Manufacturing

[![CI Tests](https://img.shields.io/badge/CI-22%2F22%20Passing-10b981?style=flat-square&logo=githubactions&logoColor=white)](eval/test_all_evals.py)
[![Standard](https://img.shields.io/badge/Standard-ISO%2014064--1%20Aligned-38bdf8?style=flat-square)](docs/index.md)
[![EU ESPR](https://img.shields.io/badge/DPP-EN%2018216--18223%20Ready-f59e0b?style=flat-square)](docs/eu-cbam-espr-ontology.md)
[![ZK Prover](https://img.shields.io/badge/ZK--SNARKs-Circom%202%20%2F%20Groth16%20BN254-8b5cf6?style=flat-square)](circuits/cbam_proof.circom)
[![Ledger](https://img.shields.io/badge/Ledger-Hyperledger%20Fabric%202.5-ec4899?style=flat-square)](fabric/)
[![Math Law](https://img.shields.io/badge/Zero--LLM--Arithmetic-0.00%25%20Tolerance-10b981?style=flat-square)](CLAUDE.md)
[![License](https://img.shields.io/badge/License-Apache%202.0-64748b?style=flat-square)](LICENSE)

<p align="center">
  <strong>Deterministic Energy Telemetry &middot; SMV Work-Content Allocation &middot; Zero-Knowledge Commercial Secrecy</strong><br>
  <em>Protect European apparel export contracts and eliminate factory floor waste without disclosing supplier margins.</em>
</p>

[**Live Interactive Demo**](http://localhost:8080) &bull; [**Architecture Blueprint**](architecture.html) &bull; [**Interactive Playground**](playground.html) &bull; [**Deployment & ROI**](pricing.html) &bull; [**Master Specification**](CarbonLoom%20Master%20Blueprint.md)

</div>

---

## 1. Executive Summary & The 2026 Export Imperative

Bangladesh’s export economy ships **$47 Billion annually in Ready-Made Garments (RMG)**, with 54% destined for the European Union. However, under the **EU Corporate Sustainability Due Diligence Directive (CSDDD)**, the **Ecodesign for Sustainable Products Regulation (ESPR / EN 18216–18223 DPP Registry)**, and the **EU Carbon Border Adjustment Mechanism (CBAM)**:

1. **The Compliance Cliff:** Starting in 2026, shipments lacking verifiable, primary energy allocation data trigger automatic customs scrutiny, punitive default carbon tariff liabilities (**€75–€85 / tCO₂e**), or order cancellations.
2. **The Commercial Secrecy Paradox:** Traditional carbon tools force suppliers to disclose raw utility bills, Tier-2 spinning mill identities, chemical recipes, and unit FOB costs. European fast-fashion buyers weaponize this transparency during annual contract renegotiations to squeeze supplier profit margins.
3. **The Unreliable LLM Math Trap:** General-purpose AI and ESG platforms rely on neural models that hallucinate calculations, violate GHG Protocol standards, and cannot survive a statutory third-party audit.

**CarbonLoom resolves this deadlock:**
An open, deterministic industrial operating system that ingests high-frequency IoT meter telemetry, allocates shared factory utilities by **Standard Minute Value (SMV)** physics with **0.00% arithmetic error**, isolates thermodynamic waste via **TreeSHAP**, and proves regulatory compliance to European buyers via **Circom 2 Groth16 zero-knowledge proofs**—*without leaking a single confidential commercial variable.*

---

## 2. Core Architectural Invariants (`CLAUDE.md`)

```
+--------------------------------------------------------------------------------------------------+
|                                    FIVE NON-NEGOTIABLE INVARIANTS                                 |
+--------------------------------------------------------------------------------------------------+
| 1. ZERO-LLM-ARITHMETIC LAW   | Neural models are strictly banned from computing emissions or     |
|                              | tariffs. All math runs in deterministic Python with 0.00% error.   |
+------------------------------+-------------------------------------------------------------------+
| 2. IMMUTABLE LINEAGE HASHING | Every calculation resolves to SHA-256(formula + meter + factor).   |
+------------------------------+-------------------------------------------------------------------+
| 3. RADICAL HONESTY PROTOCOL  | Capabilities tri-state tagged: [Designed], [In progress],         |
|                              | [Implemented]. Synthetic simulator streams carry visible marks.   |
+------------------------------+-------------------------------------------------------------------+
| 4. SINGLE-USE APPROVAL GATES | All mutating write tools require an unspent HMAC approval token.   |
+------------------------------+-------------------------------------------------------------------+
| 5. COMMERCIAL SECRECY PROOF  | Verifies intensity <= 2.50 kgCO2e in <142ms via Groth16 zk-SNARKs |
|                              | while mathematically concealing margins, yarn costs, and recipes.  |
+--------------------------------------------------------------------------------------------------+
```

---

## 3. End-to-End System Architecture

```text
========================================================================================================
LAYER 1: EDGE & FIELD CAPTURE (Offline-Capable — ESP32 / Modbus / Mobile)
========================================================================================================
 [ESP32 + SCT-013 CT Clamps]   [Modbus TCP / RS485 Meters]   [DESCO/Titas OCR Bills]   [WhatsApp/Telegram]
            |                             |                            |                        |
            v                             v                            v                        v
      [Mosquitto MQTT] --------> [Edge Collector & Local SQLite Buffer] <------------- [Whisper Bangla]
                                       | (Offline Fallback: Local Ollama Qwen)
=======================================|================================================================
LAYER 2: STREAMING, STORAGE & UNIFIED ONTOLOGY (Docker Compose -> Cloud)
=======================================v================================================================
 [NATS Event Stream] ----------> [TimescaleDB]            (1-15 min telemetry, weather, baseline profiles)
                                 [PostgreSQL + pgvector]  (Multi-tenant records, BGE-M3 vector embeddings)
                                 [Neo4j Graph]            (EU CBAM/ESPR Legal Ontology & Equipment DAG)
                                 [DuckDB Analytics]       (Fast OLAP batch allocation & MACC curves)
                                 [MinIO Object Store]     (AES-256 PDFs, invoices, DPP JSON-LD passports)
                                 [Redis Cache]            (Rate limits, spend caps, single-use tokens)
========================================================================================================
LAYER 3: ZERO-TRUST GO POLICY GATEWAY (Single Policy Enforcement Point)
========================================================================================================
 [carbonloom-mcp-gateway (Go)]
   * JWT Multi-Tenant Auth + RBAC + Token Spend Budgets
   * Microsoft Presidio PII & Commercial Margin Redaction (Pre-LLM)
   * Prompt-Injection Isolation & Input Sandboxing
   * Single-Use HMAC Approval Token Verification (`approval_token_id`)
   * SHA-256 Hash-Chained Audit Trail + OpenTelemetry Distributed Spans
        |
        +--> 1. meter-mcp (RO)          +--> 5. regulatory-rag-mcp (RO)
        +--> 2. erp-mcp (RO)            +--> 6. report-compliance-mcp (Approval-Gated Write)
        +--> 3. factors-mcp (RO)        +--> 7. cmms-supplier-mcp (Approval-Gated Write)
        +--> 4. doc-vision-mcp (RO)     +--> 8. trust-zk-ledger-mcp (Approval-Gated Write)
========================================================================================================
LAYER 4: DETERMINISTIC ANALYTICS, TREE-SHAP & AGENT STATE MACHINE
========================================================================================================
 [Deterministic Python Engine]                 [LangGraph 9-Agent Coordinator]
   * ISO 14064-1 & GHG Protocol Equations        * Supervisor Agent (Model Tiering: Local vs Frontier)
   * SMV Carbon-per-Garment Physics Engine       * Data Steward (Calibration & Quality Propagation)
   * Isolation Forest + XGBoost + TreeSHAP       * Anomaly Analyst (Thermodynamic Leak Diagnosis)
   * OR-Tools Load Shifter & pvlib Solar Engine  * Optimizer & ROI Agent (MACC Payback Modeling)
   * Digital Twin Factory Simulator (Faults)     * Critic Agent (Citation-or-Refusal Math Audit)
========================================================================================================
LAYER 5: DUAL-LAYER CRYPTOGRAPHIC TRUST PLANE
========================================================================================================
 [Circom 2 / Groth16 Prover (WASM)]            [Hyperledger Fabric 2.5 (3-Org Consortium)]
   * Private Inputs: Yarn costs, recipes, FOB    * Org1 (Factory), Org2 (Verifier), Org3 (Buyer)
   * Public Inputs: Batch intensity, Merkle root * Chaincode: anchorRecord, verifyRecord, revokeRecord
   * Proves: Intensity <= 2.50 kgCO2e (<142ms)   * Hourly Merkle batching & Private Data Collections
========================================================================================================
LAYER 6: HUMAN INTERFACES & CONTINUOUS EVALUATION
========================================================================================================
 [Factory Web Cockpit]     [Public Verifier Portal]     [Auditor Workspace]     [Interactive Playground]
 [Automated CI Test Suite: 22/22 Passing] &bull; [Injection Red-Team Suite] &bull; [Golden Bill Benchmark]
```

---

## 4. Repository Structure

```text
CarbonLoom/
├── index.html                   # Factory Executive Landing & Mass-Balance Visualizer
├── architecture.html            # Cryptographic Architecture & Governance Specs
├── playground.html              # Live Interactive SMV & Circom ZK Simulator
├── pricing.html                 # Deployment Tiers & CFO ROI Calculator
├── Makefile                     # Root developer automation & workflow tasks
├── package.json                 # Monorepo workspaces & build scripts
│
├── apps/                        # Application Frontends
│   ├── web/                     # Full Factory Decarbonization Cockpit
│   ├── buyer-portal/            # EU Customs & Brand Public Verifier Portal
│   └── verifier-workspace/      # NRB Certified Auditor Review & Sign-off Interface
│
├── circuits/                    # Zero-Knowledge Cryptography (Circom 2)
│   ├── cbam_proof.circom        # Groth16 circuit for regulatory threshold proof
│   ├── witness_verifier.py      # Python Groth16 witness generator & validator
│   └── test_circuit.py          # 6 boundary adversarial vector unit tests
│
├── services/                    # Core Backend & Gateway Services
│   ├── api/                     # FastAPI Deterministic Energy Engine
│   │   ├── core/                # Audited ISO 14064-1 & SMV allocation modules
│   │   ├── db/                  # PostgreSQL schema, RLS policies, TimescaleDB migrations
│   │   ├── tests/               # Unit tests verifying 0.00% arithmetic tolerance
│   │   └── requirements.txt     # Python production dependencies
│   ├── agents/                  # LangGraph 9-Agent State Machine & Supervisory System
│   │   ├── supervisor.py        # Dynamic routing & cost-tiered model selection
│   │   ├── anomaly_detector.py  # Isolation Forest & TreeSHAP root-cause forensics
│   │   └── test_agents.py       # Deterministic agent routing & refusal test suite
│   ├── mcp-gateway-go/          # Zero-Trust Policy Gateway (Go 1.21)
│   │   ├── middleware/          # Presidio redaction, JWT auth, spend caps
│   │   └── main.go              # Hash-chained audit logger & tool dispatcher
│   └── rag/                     # Hybrid GraphRAG + Corrective RAG (CRAG) Service
│
├── sim/                         # Digital Twin Factory Simulator
│   ├── factory_simulator.py     # 15-minute thermodynamic energy & fuel simulator
│   ├── fault_injector.py        # Steam trap blow-by, air leaks, compressor faults
│   ├── bill_generator.py        # Bilingual Bengali/English DESCO & Titas bills
│   ├── data_generator.py        # Batch synthetic dataset generator
│   └── tests/                   # Energy conservation & simulated watermark tests
│
├── fabric/                      # Hyperledger Fabric 3-Org Consortium Plane
│   ├── chaincode/               # Go smart contract for immutable carbon anchoring
│   ├── tamper_demo.py           # Dual-layer cryptographic tamper engine
│   └── test_fabric_tamper.py    # Merkle root mutation & pairing failure tests
│
├── mcp/                         # 8 Governed Model Context Protocol (MCP) Servers
│   ├── meter/                   # TimescaleDB 1-15 min IoT telemetry (Read-Only)
│   ├── erp/                     # Factory batch, style, and PO schedules (Read-Only)
│   ├── factors/                 # Official DoE & IPCC emission baselines (Read-Only)
│   ├── doc-vision/              # Multimodal Bengali bill OCR extractor (Read-Only)
│   ├── regulatory-rag/          # EU CBAM, ESPR, and ISO standard embeddings (Read-Only)
│   ├── report-compliance/       # Automated PDF/XML/DPP generator (Approval-Gated Write)
│   ├── cmms-supplier/           # Work order & Tier-2 WhatsApp intake (Approval-Gated Write)
│   └── trust-zk-ledger/         # Circom prover & Fabric anchor client (Approval-Gated Write)
│
├── edge/                        # Offline-First Factory Floor Ingestion
│   ├── docker-compose-edge.yml  # Local Mosquitto MQTT broker & buffer
│   ├── edge_collector.py        # On-premise serial/MQTT collector & SQLite queue
│   └── firmware/esp32_sct013.ino# ESP32 dual CT clamp current sensor firmware
│
├── eval/                        # Evaluation, Benchmarks & Red-Teaming
│   ├── test_all_evals.py        # Master test harness verifying system invariants
│   └── injection_redteam.py     # Adversarial prompt-injection test vectors
│
├── infra/                       # Cloud Production Orchestration
│   └── docker-compose.yml       # Postgres 16, Timescale, Neo4j, MinIO, Redis, NATS, API, Gateway
│
├── docs/                        # Specifications, Ontologies & Model Cards
│   ├── index.md                 # System overview & physical trust boundary declarations
│   ├── eu-cbam-espr-ontology.md # EN 18216–18223 DPP data model mappings
│   ├── zk-circuit-spec.md       # R1CS constraints, witness structure & public signals
│   └── changelog.md             # SemVer revision history
│
├── scripts/                     # TypeScript Source Assets
│   └── carbon-ascii.ts          # SCADA ASCII visual engine & physical flow generator
├── styles/                      # Design System Tokens & Application Styles
│   ├── tokens.css               # Hallmark-compliant color, typography & radius tokens
│   └── app.css                  # Industrial dark luxury SCADA visual stylesheet
└── js/                          # Browser Client Bundles
    ├── carbon-skyline.js        # Compiled IIFE ASCII canvas bundle
    ├── halftone-footer.js       # Interactive Halftone Wordmark Canvas Engine
    └── interactions.js          # In-browser Groth16 WASM simulator & dynamic controllers
```

---

## 5. Quickstart & Setup Guidance

### Prerequisites
* **Python:** 3.10 or higher (`python3 --version`)
* **Node.js:** 18.0 or higher (`node --version`)
* **Docker & Docker Compose:** Required for running the unified multi-container infrastructure
* *(Optional)* **Go:** 1.21+ (for modifying `services/mcp-gateway-go`)

---

### Path A: One-Command Developer Setup (Recommended)

Using the included `Makefile`:

```bash
# 1. Clone repository
git clone https://github.com/4ladeen/CarbonLoom.git
cd CarbonLoom

# 2. Automated environment setup (creates .venv, installs pip packages & npm dependencies)
make setup

# 3. Execute the automated test suite (verifies all 22 tests pass)
make test

# 4. Launch the local interactive application
make serve
```

Visit **`http://localhost:8080`** in your browser.

---

### Path B: Manual Python & Frontend Setup

If you prefer manual control:

```bash
# 1. Set up Python virtual environment
python3 -m venv .venv
source .venv/bin/activate

# 2. Install core deterministic dependencies
pip install -r services/api/requirements.txt

# 3. Install frontend build dependencies
npm install

# 4. Run automated test suite
pytest sim/ circuits/ fabric/ eval/ services/

# 5. Launch local web server
python3 -m http.server 8080
```

---

### Path C: Running the Digital Twin Factory Simulator

CarbonLoom includes a full physics simulator modeling a 2,500-worker composite knitwear facility in Gazipur, Bangladesh:

```bash
# Generate 3 days of high-frequency telemetry, utility bills, and production batches:
make sim

# Or directly via Python:
PYTHONPATH=. python3 -m sim.data_generator
```

* Output files are stored in `sim/output/`:
  * `telemetry_sample.json`: 6,336 timestamped power, gas, and steam readings with injected faults.
  * `bills_sample.json`: Bengali/English DESCO electricity and Titas gas invoices.
  * `orders.json`: Batch production runs with SMV work-content values.

---

### Path D: Launching Full Cloud Infrastructure (Docker Compose)

To spin up the complete backend stack (Databases, Event Bus, Object Storage, API, and Gateway):

```bash
cd infra
docker compose up -d
```

| Service | Port | Endpoint / Description |
| :--- | :--- | :--- |
| **FastAPI Core Engine** | `8000` | `http://localhost:8000/docs` (Swagger UI) |
| **Go Zero-Trust Gateway** | `8080` | `http://localhost:8080/health` (Policy Proxy) |
| **TimescaleDB** | `5433` | Time-series telemetry store (`carbonloom_telemetry`) |
| **PostgreSQL 16 + pgvector** | `5432` | Relational & vector embeddings store |
| **Neo4j Graph Database** | `7474 / 7687` | `http://localhost:7474` (Regulatory Graph) |
| **MinIO S3 Storage** | `9000 / 9001` | `http://localhost:9001` (Encrypted Evidence Vault) |
| **Redis** | `6379` | Token cache & spend budgets |
| **NATS Streaming** | `4222 / 8222` | High-throughput event pipeline |

To shut down:
```bash
make docker-down
# or
cd infra && docker compose down
```

---

### Path E: Launching Offline-First Edge Ingestion

To test on-premise factory floor resilience (MQTT broker + local SQLite buffering):

```bash
make docker-edge
# or
cd edge && docker compose -f docker-compose-edge.yml up -d
```

---

## 6. Automated Testing & Verification Suite

CarbonLoom enforces strict automated verification across all layers before any code is committed.

```bash
make test
```

```text
============================= test session starts ==============================
platform darwin -- Python 3.14.x, pytest-9.2.0, pluggy-1.7.0
rootdir: /Users/a/code/CarbonLoom
collected 22 items

sim/tests/test_simulator.py .....                                        [ 22%]
circuits/test_circuit.py .                                               [ 27%]
fabric/test_fabric_tamper.py ..                                          [ 36%]
eval/test_all_evals.py .....                                             [ 59%]
services/agents/test_agents.py ....                                      [ 77%]
services/api/tests/test_carbon_engine.py .....                           [100%]

============================== 22 passed in 0.14s ==============================
```

### Key Verification Vector Descriptions:
1. **`sim/tests/test_simulator.py` (5 tests):** Verifies thermodynamic energy conservation across boilers, chillers, and compressors; validates ground-truth labeling of steam trap leaks; and guarantees every simulated record carries an invariant `SIMULATED DATA` watermark.
2. **`circuits/test_circuit.py` (1 test, 6 vectors):** Evaluates all 6 adversarial boundary vectors against `cbam_proof.circom`:
   * `V1_VALID_BASELINE`: Standard compliant batch ($\le 2.50\text{ kgCO}_2\text{e}$).
   * `V2_EXACT_BOUNDARY`: Exact threshold constraint satisfaction ($= 2.5000\text{ kgCO}_2\text{e}$).
   * `V3_BREACH_OVER_THRESHOLD`: Rejection of non-compliant batch ($2.75\text{ kgCO}_2\text{e}$).
   * `V4_TAMPERED_MERKLE_LEAF`: Instant failure when evidence Merkle root does not match.
   * `V5_INVALID_AUDITOR_SIG`: Failure when Ed25519 auditor co-signature is invalid.
   * `V6_ZERO_EMISSION_SOLAR`: Verified zero-emission daytime solar allocation.
3. **`fabric/test_fabric_tamper.py` (2 tests):** Proves that mutating a single digit in a committed transaction immediately breaks the SHA-256 Merkle root and triggers an instant failure alert.
4. **`eval/test_all_evals.py` (5 tests):** Evaluates calculation lineage reproducibility, data-quality interval propagation, and RAG citation enforcement.
5. **`services/agents/test_agents.py` (4 tests):** Tests deterministic supervisor routing, cost-tiered model selection, and prompt-injection refusal.
6. **`services/api/tests/test_carbon_engine.py` (5 tests):** Proves 0.00% arithmetic error in Python equations for Scope 1, Scope 2, and SMV allocation fractions.

---

## 7. Interactive Surfaces & Pages

| Page | URL | Purpose & Persona |
| :--- | :--- | :--- |
| **Overview & Landing** | `index.html` | Factory executive thesis, interactive SVG mass-balance energy flow, TreeSHAP leak isolation, Circom ZK proof chamber, and Gazipur RMG cluster telemetry map. |
| **Architecture Specs** | `architecture.html` | Comprehensive technical specification of the 4 architectural pillars, zero-trust MCP gateway, and Hyperledger Fabric channel topology. |
| **Interactive Playground** | `playground.html` | Sandbox for energy engineers: live SMV garment allocation sliders, what-if tariff-shifting calculator, and interactive Circom ZK proof prover. |
| **Pricing & ROI** | `pricing.html` | Transparent tiering (Tier 1: Energy & Waste, Tier 2: Export Compliance, Tier 3: Consortium & Verifier) with real-time financial payback modeling. |
| **Factory Cockpit** | `apps/web/index.html` | Real-time industrial telemetry cockpit, line-by-line power meters, live billing OCR, and automated CMMS ticket dispatcher. |
| **Public Verifier** | `apps/buyer-portal/index.html` | Zero-knowledge EU customs and brand portal: verify batch DPP passports and check Fabric blockchain block lineage without credentials. |
| **Auditor Workspace** | `apps/verifier-workspace/index.html` | Queue for accredited Non-Resident Bangladeshi (NRB) engineers: review raw evidence dossiers, inspect SHAP scores, and co-sign Ed25519 attestations. |

---

## 8. Radical Honesty & Physical Trust Boundaries (§0)

In strict accordance with the **Radical Honesty Protocol** declared in `CLAUDE.md`:

1. **Simulated Data Transparency:** All telemetry streams, billing data, and production records shown in demonstrations or generated by `sim/` originate from the Digital Twin Simulator and carry a visible `SIMULATED DATA` tag.
2. **Standard Alignment vs Certification:** CarbonLoom's methodology is mathematically **ISO 14064-1:2018 aligned** and **ESPR / EN 18216–18223 DPP-ready**. We do not claim third-party accreditation prior to physical facility audits.
3. **Cryptographic Truth vs Physical Truth:** Cryptography (Hyperledger Fabric and Circom zk-SNARKs) guarantees that recorded data is *immutable post-capture* and *mathematical constraints are fulfilled*. Physical sensor truth is enforced via meter calibration records, cross-utility reconciliation (gas bills vs boiler output), TreeSHAP thermodynamic correlation, and accredited human auditor sign-off.

---

## 9. Developer Operations & Useful Commands

| Command | Description |
| :--- | :--- |
| `make setup` | Initialize `.venv`, install pip packages and npm packages. |
| `make test` | Run the complete automated test suite (22 unit & adversarial tests). |
| `make sim` | Generate synthetic factory telemetry, utility bills, and orders. |
| `make build` | Rebundle the TypeScript ASCII skyline visual engine via esbuild. |
| `make serve` | Launch local web server on port 8080. |
| `make docker-up` | Start full production Docker Compose stack (Databases, API, Gateway). |
| `make docker-down` | Stop and tear down production Docker Compose stack. |
| `make docker-edge` | Launch local Mosquitto MQTT broker and edge buffer. |
| `make clean` | Clean temporary files, `__pycache__`, and pytest caches. |

---

## 10. Contributors & Consortium Governance

* **Principal Architect:** Md. Yusuf, Team Carbon
* **Event:** International AI Builders Congress 2026
* **Domain:** `IndustrySphere AI` (Green Manufacturing) &cross; `JusticeSphere AI` (ComplianceOS)
* **Governing Specification:** `CarbonLoom Master Blueprint.md` (`CL-PRD-SRS-2.0`)

---

## 11. License

CarbonLoom is open-source software licensed under the **[Apache License 2.0](LICENSE)**.
Commercial deployment tiers, consortium node memberships, and verifier credentials operate under the governance charter detailed in [`pricing.html`](pricing.html).
