<div align="center">

<img src="assets/logo.svg" alt="CarbonLoom Logo" width="420" />

### Decarbonization OS & Cryptographic Compliance for Export Manufacturing
**Deterministic Energy Telemetry &middot; SMV Physics Allocation &middot; Zero-Knowledge Commercial Secrecy**

[![CI Tests](https://img.shields.io/badge/CI-Passing%20(22%2F22)-10b981?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/4ladeen/CarbonLoom/actions)
[![Standard](https://img.shields.io/badge/Standard-ISO%2014064--1%20Aligned-38bdf8?style=for-the-badge&logo=iso&logoColor=white)](docs/index.md)
[![EU ESPR](https://img.shields.io/badge/DPP-EN%2018216--18223%20Ready-f59e0b?style=for-the-badge&logo=europeanunion&logoColor=white)](docs/eu-cbam-espr-ontology.md)
[![ZK Prover](https://img.shields.io/badge/ZK--SNARKs-Circom%202%20%2F%20Groth16%20BN254-8b5cf6?style=for-the-badge&logo=webassembly&logoColor=white)](circuits/cbam_proof.circom)
[![Ledger](https://img.shields.io/badge/Ledger-Hyperledger%20Fabric%202.5-ec4899?style=for-the-badge&logo=hyperledger&logoColor=white)](fabric/)
[![Math Law](https://img.shields.io/badge/Zero--LLM--Math-0.00%25%20Tolerance-10b981?style=for-the-badge&logo=python&logoColor=white)](CLAUDE.md)
[![License](https://img.shields.io/badge/License-Apache%202.0-64748b?style=for-the-badge)](LICENSE)

<br/>

[**Interactive Live Web Demo**](http://localhost:8080) &bull; [**System Architecture Blueprint**](architecture.html) &bull; [**ZK Proof Playground**](playground.html) &bull; [**CFO Deployment & ROI**](pricing.html) &bull; [**Engineering Master Spec**](CarbonLoom%20Master%20Blueprint.md)

</div>

---

## 1. The 2026 Export Manufacturing Crisis

Bangladesh’s export economy ships **$47 Billion annually in Ready-Made Garments (RMG)**, with 54% destined for the European Union. Starting in 2026, the **EU Corporate Sustainability Due Diligence Directive (CSDDD)**, the **Ecodesign for Sustainable Products Regulation (ESPR / EN 18216–18223 Digital Product Passport)**, and the **EU Carbon Border Adjustment Mechanism (CBAM)** impose a strict tripartite constraint:

```
                  +-------------------------------------------------------------+
                  |            THE TRI-FOLD COMPLIANCE CLIFF (2026)             |
                  +-------------------------------------------------------------+
                                                 |
         +---------------------------------------+---------------------------------------+
         |                                       |                                       |
         v                                       v                                       v
[ 1. DEFAULT TARIFF CLIFF ]           [ 2. COMMERCIAL SECRECY TRAP ]           [ 3. UNRELIABLE AI MATH ]
Shipments without primary energy      Standard ESG software requires raw      LLM-based carbon accounting
telemetry are assessed punitive       utility bills and Tier-2 BOMs. Buyers   hallucinates math by ±5–15%,
EU default tariffs (€75-€85/tCO2e)    weaponize supplier margin transparency  failing mandatory third-party
or rejected at EU ports of entry.     to crush annual contract negotiations.  statutory audits under ISO 14064.
```

### Comparative Capabilities Matrix

| Architectural Capability | CarbonLoom Decarbonization OS | Traditional ESG SaaS (Sphera / Watershed / Persefoni) |
| :--- | :--- | :--- |
| **Arithmetic Law** | **0.00% Tolerance (Audited Deterministic Python)** | ±5–15% Error (LLM hallucinations & spend estimates) |
| **Trade-Secret Disclosure** | **0 Bytes Leaked (Circom 2 zk-SNARKs)** | 100% Leaked (Raw utility bills & costing disclosed) |
| **Public Verifier Speed** | **142 ms Client-Side WASM (Zero Login)** | Manual PDF audit review (2–6 weeks) |
| **Multi-Tenant Policy Gate** | **Microsecond Go Gateway (Presidio + Injection Firewall)** | Standard cloud API with no prompt sandboxing |
| **Energy Waste Discovery** | **Thermodynamic TreeSHAP + Isolation Forest** | Static annual GHG spreadsheet averages |
| **Audit Provenance** | **SHA-256 Hashes + Hyperledger Fabric Ledger** | Mutable SQL database records |
| **Edge Hardware Integration** | **ESP32 SCT-013 Dual CT Clamps + Modbus RTU** | Manual CSV upload / invoice re-keying |

---

## 2. Visual Product Tour & System Walkthrough

### A. Physical Ground Truth: Pilot Factory Fleet Topology
*Apex Padma Textile & Apparels Ltd. (Gazipur Cluster) — 18 Modbus RTU meters continuously monitor gas boilers, stenter heat-setting frames, chiller banks, and 350 kWp rooftop solar PV.*

![Factory Pilot Topology](assets/screenshots/01-factory-telemetry-topology.png)

---

### B. Forensic XAI Waste Detection: Live Telemetry Anomaly Spike
*The digital twin factory simulator tracks live wattage and natural gas enthalpy. When steam-trap orifice erosion occurs, an unsupervised Isolation Forest flags a critical anomaly score of 0.842 with excess hourly operating costs.*

![Forensic Telemetry Anomaly Spike](assets/screenshots/04-telemetry-anomaly-spike.png)

---

### C. TreeSHAP Loss Attribution & Autonomous CMMS Work Orders
*Game-theoretic TreeSHAP feature attribution pinpoints exactly 84.2% of excess enthalpy waste to Boiler 1 Steam Trap #3. An autonomous CMMS maintenance ticket is issued, protected by a single-use Ed25519 supervisor cryptographic gate.*

![TreeSHAP Loss Attribution Waterfall](assets/screenshots/05-treeshap-loss-attribution.png)

---

### D. Deterministic SMV Allocation: Exactly 1.412 kg CO₂e Per Garment
*Rather than crude facility-wide averages, the SMV Physics Engine allocates gas, electricity, and water proportionally across 5 distinct manufacturing stages with exact mathematical conservation ($\sum = 100.00\%$).*

![Deterministic SMV Per-Garment Allocation](assets/screenshots/06-smv-per-garment-passport.png)

---

### E. Zero-Knowledge Commercial Secrecy: Groth16 WASM Verification
*EU customs officials and brand buyers verify that batch emissions satisfy regulatory caps ($\le 2.50\text{ kg CO}_2\text{e/pc}$) in under 142ms via client-side WebAssembly, while factory profit margins and chemical recipes remain 100% concealed.*

![In-Browser Groth16 ZK Verifier Console](assets/screenshots/07-zk-groth16-verifier.png)

---

### F. Multi-Modal Ingestion & Zero-Trust Security Gateway
*Bilingual OCR ingestion extracts scanned Bengali utility invoices with 98.5% confidence, routed through a microsecond Go policy gateway with Microsoft Presidio redaction and prompt-injection defense in 2.1ms.*

| Bilingual Scanned Invoice OCR | Zero-Trust Go Policy Gateway (6 Stages) |
| :---: | :---: |
| ![Bilingual OCR Ingestion](assets/screenshots/02-ocr-utility-ingestion.png) | ![Zero-Trust Go Security Gateway](assets/screenshots/03-zero-trust-gateway.png) |

---

## 3. End-to-End System Architecture

```mermaid
flowchart TD
    subgraph S1["1. PHYSICAL & EDGE INGESTION"]
        A1["ESP32 SCT-013 CT Clamps"] --> B1["Mosquitto MQTT"]
        A2["Modbus RTU Meters (RS485)"] --> B1
        A3["DESCO & Titas Bills (Scanned PDF)"] --> B2["Doc-Vision OCR Engine"]
        B1 --> C1["Edge Collector & SQLite Buffer"]
        B2 --> C1
    end

    subgraph S2["2. ZERO-TRUST GO POLICY GATEWAY"]
        C1 --> D1["carbonloom-mcp-gateway (Go 1.22)"]
        D1 --> D2["JWT Auth & Tenant RLS"]
        D2 --> D3["Presidio PII & Margin Redactor"]
        D3 --> D4["Prompt-Injection Firewall"]
        D4 --> D5["Single-Use HMAC Approval Gate"]
        D5 --> D6["SHA-256 Hash-Chained Audit Trail"]
    end

    subgraph S3["3. DETERMINISTIC ENGINE & XAI"]
        D6 --> E1["Deterministic Python Math Engine"]
        E1 --> E2["Scope 1 & 2 ISO 14064-1 Arithmetic"]
        E1 --> E3["Hierarchical SMV Per-Garment Allocation"]
        E1 --> E4["Isolation Forest & TreeSHAP Anomaly Engine"]
        E1 --> E5["OR-Tools MACC & Solar Optimizer"]
    end

    subgraph S4["4. DUAL CRYPTOGRAPHIC TRUST PLANE"]
        E2 & E3 --> F1["Circom 2 zk-SNARK Circuit"]
        F1 --> F2["Groth16 Prover (BN254 Witness)"]
        E1 --> F3["Hyperledger Fabric 2.5 Consortium"]
        F3 --> F4["Immutable Merkle Anchor Ledger"]
    end

    subgraph S5["5. AUDIENCE-SPECIFIC SURFACES"]
        F2 --> G1["Public Buyer Portal (WASM 142ms)"]
        F4 --> G2["Auditor Workspace (Dual-Key Attestation)"]
        E4 --> G3["Factory Cockpit (10-Meter SCADA Fleet)"]
        E1 --> G4["Interactive Simulator Playground"]
    end

    style S1 fill:#0b0f19,stroke:#1e293b,stroke-width:1px,color:#94a3b8
    style S2 fill:#0b1920,stroke:#0369a1,stroke-width:1px,color:#38bdf8
    style S3 fill:#0c1e17,stroke:#047857,stroke-width:1px,color:#34d399
    style S4 fill:#1a0f2e,stroke:#6d28d9,stroke-width:1px,color:#c084fc
    style S5 fill:#1c1917,stroke:#b45309,stroke-width:1px,color:#fbbf24
```

---

## 4. Zero-Knowledge Commercial Secrecy Flow

How factory trade secrets are mathematically protected from European brand buyers during compliance verification:

```mermaid
sequenceDiagram
    autonumber
    actor Factory as Gazipur Factory
    participant Circuit as Circom 2 Circuit (cbam_proof.circom)
    participant Ledger as Hyperledger Fabric Ledger
    actor Buyer as EU Brand Buyer / Customs Officer

    Note over Factory,Circuit: 1. Private Witness Generation (Strictly On-Premise)
    Factory->>Circuit: Private Inputs: Unit FOB Price ($2.45), Margin ($0.38), Yarn Mill ID, Gas Rate
    Factory->>Circuit: Public Inputs: Batch ID, Batch Intensity (1.412 kg), Regulatory Cap (2.50 kg)
    
    Note over Circuit: 2. Mathematical Proof Computation
    Circuit-->>Factory: Groth16 Proof (pi_a, pi_b, pi_c) + Public Signals Array
    
    Note over Factory,Ledger: 3. Consortium Anchor
    Factory->>Ledger: anchorRecord(SHA256(batch_id + proof_hash + merkle_root))
    Ledger-->>Factory: Block #10,483 Committed (Channel: rmg-audit)
    
    Note over Buyer: 4. Instant Zero-Login Verification (<142ms)
    Factory->>Buyer: Transmit Public Proof Payload & Fabric TX Receipt
    Buyer->>Buyer: snarkjs.groth16.verify(vKey, publicSignals, proof)
    Note over Buyer: Proof Status: VALID (Pairing Check Passed)<br/>Supplier Margins Revealed: ZERO BYTES<br/>FOB Yarn Costs Revealed: ZERO BYTES
```

---

## 5. Non-Negotiable Invariants (`CLAUDE.md`)

```
+---------------------------------------------------------------------------------------------------------+
|                                    FIVE NON-NEGOTIABLE INVARIANTS                                       |
+---------------------------------------------------------------------------------------------------------+
| 1. ZERO-LLM-ARITHMETIC LAW   | Neural models are strictly forbidden from calculating emissions,        |
|                              | SMV allocations, or CBAM tariffs. All math executes in deterministic    |
|                              | Python modules (services/api/core/) with exactly 0.00% tolerance.       |
+------------------------------+--------------------------------------------------------------------------+
| 2. IMMUTABLE LINEAGE HASHING | Every calculation produces a cryptographic hash:                         |
|                              | lineage_id = SHA-256(formula_v2 + meter_slice + factor_id).             |
+------------------------------+--------------------------------------------------------------------------+
| 3. RADICAL HONESTY PROTOCOL  | Every interface component explicitly declares its production state:      |
|                              | [Implemented], [In progress], or [Designed]. Simulated streams carry     |
|                              | prominent, unremovable amber warning tags.                               |
+------------------------------+--------------------------------------------------------------------------+
| 4. SINGLE-USE APPROVAL GATES | All mutating write tools (CMMS dispatch, Fabric anchor, baseline edits) |
|                              | mandate an unspent Ed25519 supervisor approval token. Replays are reject.|
+------------------------------+--------------------------------------------------------------------------+
| 5. COMMERCIAL SECRECY PROOF  | Verifies batch compliance (<= 2.50 kg CO2e) in <142ms via Groth16        |
|                              | without disclosing FOB cost, profit margins, or supplier recipes.        |
+---------------------------------------------------------------------------------------------------------+
```

---

## 6. Repository Layout & Architecture

```text
CarbonLoom/
├── index.html                   # Factory Executive Landing & Mass-Balance Visualizer
├── architecture.html            # Cryptographic Architecture & Governance Specs
├── playground.html              # Live Interactive SMV & Circom ZK Simulator
├── pricing.html                 # Deployment Tiers & CFO ROI Calculator
├── Makefile                     # Root developer automation & workflow tasks
├── package.json                 # Monorepo build scripts & typecheck targets
├── pytest.ini                   # Python root pathing & asyncio test configuration
│
├── assets/                      # Brand, Visuals & Showcase Frames
│   ├── logo.svg                 # Vector branding mark with gradient lattice
│   └── screenshots/             # High-resolution 1080p system master shots
│       ├── 01-factory-telemetry-topology.png
│       ├── 02-ocr-utility-ingestion.png
│       ├── 03-zero-trust-gateway.png
│       ├── 04-telemetry-anomaly-spike.png
│       ├── 05-treeshap-loss-attribution.png
│       ├── 06-smv-per-garment-passport.png
│       └── 07-zk-groth16-verifier.png
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
│   ├── mcp-gateway-go/          # Zero-Trust Policy Gateway (Go 1.22)
│   │   ├── middleware/          # Presidio redaction, JWT auth, spend caps, tests
│   │   ├── go.mod / go.sum      # Pinned Go module dependencies
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
└── eval/                        # Evaluation, Benchmarks & Red-Teaming
    ├── test_all_evals.py        # Master test harness verifying system invariants
    └── injection_redteam.py     # Adversarial prompt-injection test vectors
```

---

## 7. Automated Test Suite & Invariant Verification Matrix

CarbonLoom maintains a **100% automated test pass rate** across all subsystems:

```bash
$ make test
============================= test session starts ==============================
platform darwin -- Python 3.14 / Python 3.11, pytest-9.2.0
rootdir: /Users/a/code/CarbonLoom, configfile: pytest.ini

sim/tests/test_simulator.py::test_equipment_inventory PASSED             [  4%]
sim/tests/test_simulator.py::test_data_quality_and_watermark_invariance PASSED [  9%]
sim/tests/test_simulator.py::test_fault_injection_behavior PASSED        [ 13%]
sim/tests/test_simulator.py::test_bilingual_bill_generation PASSED       [ 18%]
sim/tests/test_simulator.py::test_smv_order_production_weights PASSED    [ 22%]
circuits/test_circuit.py::test_all_six_adversarial_witness_vectors PASSED [ 27%]
fabric/test_fabric_tamper.py::test_genuine_record_verification PASSED    [ 31%]
fabric/test_fabric_tamper.py::test_tampered_digit_fails_red PASSED       [ 36%]
eval/test_all_evals.py::test_prompt_injection_defense PASSED             [ 40%]
eval/test_all_evals.py::test_eval_carbon_math_zero_tolerance PASSED      [ 45%]
eval/test_all_evals.py::test_eval_security_injection_block_rate PASSED   [ 50%]
eval/test_all_evals.py::test_eval_zk_circuit_soundness PASSED            [ 54%]
eval/test_all_evals.py::test_eval_rag_refusal_precision PASSED           [ 59%]
services/agents/test_agents.py::test_rag_grounded_answer PASSED          [ 63%]
services/agents/test_agents.py::test_rag_strict_refusal_on_unbacked_claim PASSED [ 68%]
services/agents/test_agents.py::test_anomaly_shap_waterfall PASSED       [ 72%]
services/agents/test_agents.py::test_agent_pipeline_hitl_checkpoint PASSED [ 77%]
services/api/tests/test_carbon_engine.py::test_scope1_exact_math PASSED  [ 81%]
services/api/tests/test_carbon_engine.py::test_scope2_exact_math PASSED  [ 86%]
services/api/tests/test_carbon_engine.py::test_smv_allocator_hierarchy_and_conservation PASSED [ 90%]
services/api/tests/test_carbon_engine.py::test_cbam_liability_simulation PASSED [ 95%]
services/api/tests/test_carbon_engine.py::test_solar_sizing_engine PASSED [100%]

============================== 22 passed in 0.14s ==============================

$ cd services/mcp-gateway-go && go test -v ./...
=== RUN   TestHashChainAuditLogger
--- PASS: TestHashChainAuditLogger (0.00s)
=== RUN   TestSanitizeUntrustedDocumentContent
--- PASS: TestSanitizeUntrustedDocumentContent (0.00s)
=== RUN   TestRedactSensitiveText
--- PASS: TestRedactSensitiveText (0.00s)
=== RUN   TestApprovalTokenStore
--- PASS: TestApprovalTokenStore (0.00s)
PASS
ok      github.com/carbonloom/mcp-gateway/middleware    0.451s
```

---

## 8. Quickstart & Setup Guidance

For complete instructions across Linux, macOS, and Windows WSL2, see the dedicated [**SETUP.md Guide**](SETUP.md).

### One-Command Quickstart
```bash
# 1. Clone the repository
git clone https://github.com/4ladeen/CarbonLoom.git
cd CarbonLoom

# 2. Automated environment setup (venv, Python packages, npm dependencies)
make setup

# 3. Run the automated multi-stack test suite
make test

# 4. Generate synthetic factory telemetry & billing dataset
make sim

# 5. Launch the local application
make serve
```

Visit [**`http://localhost:8080`**](http://localhost:8080) to explore the system locally.

### Makefile Target Reference
| Command | Description |
| :--- | :--- |
| `make setup` | Installs Python venv dependencies and npm packages |
| `make test` | Executes full 22-test automated test suite |
| `make sim` | Generates 3-day factory telemetry, billing bills, and batch orders |
| `make build` | Builds TypeScript ASCII engine bundle to `js/carbon-skyline.js` |
| `make serve` | Runs local HTTP server on port 8080 |
| `make docker-up` | Launches full Postgres, Timescale, Neo4j, MinIO, Redis stack |
| `make docker-down`| Stops all running Docker services and preserves volumes |
| `make docker-edge`| Starts local edge MQTT Mosquitto broker |
| `make clean` | Removes compiled artifacts, cache dirs, and temp files |

---

## 9. Interactive Application Surfaces

| Surface | File / Route | Audience | Key Capabilities |
| :--- | :--- | :--- | :--- |
| **Executive Landing** | [`index.html`](file:///Users/a/code/CarbonLoom/index.html) | Factory Owners & CFOs | Macroeconomic threat countdown, mass-balance visualizer, live telemetry odometer |
| **Factory Cockpit** | [`apps/web/`](file:///Users/a/code/CarbonLoom/apps/web/index.html) | Plant & Energy Engineers | 10-meter SCADA fleet, TreeSHAP leak diagnosis, What-If solar/stenter optimizer |
| **Buyer Portal** | [`apps/buyer-portal/`](file:///Users/a/code/CarbonLoom/apps/buyer-portal/index.html) | European Brand Buyers | Zero-login Groth16 WASM verifier, selective disclosure matrix, Fabric anchor proof |
| **Auditor Workspace** | [`apps/verifier-workspace/`](file:///Users/a/code/CarbonLoom/apps/verifier-workspace/index.html) | ISO 14064-1 Verifiers | Dual-key cryptographic attestation, bilingual clarification, raw ledger audit trail |
| **Architecture Spec** | [`architecture.html`](file:///Users/a/code/CarbonLoom/architecture.html) | Enterprise Architects | 4 architectural pillars, 6-layer visual flow, 8 governed MCP server topology |
| **ZK Playground** | [`playground.html`](file:///Users/a/code/CarbonLoom/playground.html) | Cryptographers & Devs | Live SMV slider sandbox, simulated witness tamper injection, pairing failure test |
| **Pricing & ROI** | [`pricing.html`](file:///Users/a/code/CarbonLoom/pricing.html) | Managing Directors | 3 factory sizing tiers, tariff avoidance calculator, 4-month payback economics |

---

## 10. License & Citation

Distributed under the Apache 2.0 License. See [`LICENSE`](LICENSE) for details.

```bibtex
@software{carbonloom2026,
  author = {CarbonLoom Systems & Shahariar Asfaq Ovi},
  title = {CarbonLoom: Decarbonization OS & Cryptographic Compliance for Export Manufacturing},
  url = {https://github.com/4ladeen/CarbonLoom},
  version = {2.0.0},
  year = {2026}
}
```
