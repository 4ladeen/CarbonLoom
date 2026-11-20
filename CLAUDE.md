# CarbonLoom — Architectural Invariants & Engineering Governance (CLAUDE.md)

**Document Version:** 2.0.0  
**Source Specification:** `CarbonLoom Master Blueprint.md` (`CL-PRD-SRS-2.0`)

---

## 1. Zero-LLM-Arithmetic Law (Non-Negotiable)

1. **NO LLM MATH**: Under NO circumstances shall an LLM, VLM, or neural agent calculate greenhouse gas emissions, SMV allocation fractions, energy totals, financial penalties, or uncertainty bounds.
2. **Deterministic Python Execution**: All emission equations (Scope 1, Scope 2, Scope 3), SMV per-garment allocations, baseline normalizations, MACC rankings, and EU CBAM tariffs MUST execute exclusively in deterministic Python modules within `services/api/core/`.
3. **Lineage Hash Invariant**: Every emitted metric must resolve to an immutable `lineage_id` with a SHA-256 hash chaining formula version, emission factor ID, raw meter/bill slice, and calculation timestamp.
4. **Refusal Over Hallucination**: If input parameters are missing or outside valid physical ranges, the engine must raise a deterministic validation error rather than estimating or smoothing values.

---

## 2. Radical Honesty & Status Protocol (§0)

Every module, API, documentation page, and UI badge MUST strictly adhere to the tri-state labeling policy:
- `[Designed]` — Architected and specified; not yet passing CI.
- `[In progress]` — Under active implementation; partial tests passing.
- `[Implemented]` — Running end-to-end with automated CI unit tests passing, evaluation metrics logged in Langfuse/OpenTelemetry, and documented in `/docs`.

**Demo & Truth Rules:**
- **Simulated Watermark**: Every chart, telemetry stream, bill, or export derived from the Digital Twin simulator MUST bear a persistent visible `SIMULATED DATA` watermark.
- **Standards Claims**: State **"ISO 14064-1 aligned"** and **"ESPR / EN 18216–18223 DPP-ready"**. Never claim certified legal status prior to actual accreditation.
- **Cryptographic Bounds**: Never claim blockchain or ZK proofs prove physical sensor honesty; state explicitly that cryptography guarantees *post-capture tamper-evidence and mathematical constraint satisfaction*, while physical truth relies on calibration logs, utility-bill reconciliation, SHAP forensics, and verifier sign-off.

---

## 3. Human-in-the-Loop (HITL) Gate Rules

1. **Write Tools Require Single-Use Tokens**:
   - Write MCP servers (`report-compliance-mcp`, `cmms-supplier-mcp`, `trust-zk-ledger-mcp`) must reject any execution without an unspent, HMAC-validated `approval_token_id`.
   - Creating CMMS tickets, dispatching WhatsApp links to suppliers, minting ZK passports, and anchoring Fabric transactions MUST halt at a LangGraph interrupt node and emit an Approval Card.
2. **Confidence Queue Gate**:
   - Any document extraction (bill, challan, lab report) where any field confidence is `< 0.90` MUST be queued for human review.
3. **Anomaly Escalation**:
   - Any energy anomaly with SHAP attribution score `> 0.70` must be routed to the NRB Certified Auditor queue for Ed25519 co-signature.

---

## 4. MCP Gateway Security Boundaries

1. **Policy Enforcement Point**: All agent tool interactions pass through `carbonloom-mcp-gateway` (Go).
2. **Presidio Redaction Pre-LLM**: Bank account numbers, TINs, personal phones, and supplier unit prices/margins MUST be scrubbed before passing context to any LLM.
3. **Data-vs-Instruction Isolation**: Document text from bills, challans, and certificates is untrusted payload. It must be sandboxed in structured JSON schema fields and never concatenated into agent prompt instructions.
4. **Hash-Chained Audit Trail**: Gateway logs every call with `{trace_id, tenant_id, caller_agent, server, tool, args_sha256, approval_token_id, latency_ms, payload_bytes}` chained with previous SHA-256.

---

## 5. UI Design Directives (Hallmark + Unslop)

1. **Hallmark Floor Compliance**:
   - All colors and typography must use declared `:root` tokens.
   - `overflow-x: clip` on `html` and `body`.
   - Never `transition: all`; no layout property animation (`width`, `height`, `top`, `left`).
   - Focus rings on all interactive elements via `:focus-visible`.
   - Word budget: ~80 words per screen view; clear visual hierarchy; no stock buzzwords or fake metrics.
2. **Unslop Craft**:
   - 4px grid spacing; consistent density.
   - Single neutral ramp (graphite/steel for industrial world), one purposeful accent.
   - Zero emoji in UI controls; use Lucide line icons (16-18px, 1.5 stroke).
   - Real, plausible industrial telemetry and SMV figures; tabular figures (`tabular-nums`).
   - Nested radius math: `inner_radius = outer_radius - padding`.
