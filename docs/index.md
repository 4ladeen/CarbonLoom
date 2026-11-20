# CarbonLoom Methodology & Architecture Documentation

**Status:** `[Implemented]` for Core Engine, `[In progress]` for Multi-Org Fabric  
**Standard Alignment:** ISO 14064-1:2018, GHG Protocol Corporate Standard, EU ESPR (EN 18216–18223 DPP-ready)

---

## 1. Overview & Trust Philosophy

CarbonLoom eliminates the blind spot between factory floor meters and global buyer compliance. 
Unlike typical ESG dashboards that accept self-reported estimations or let LLMs guess numbers, CarbonLoom executes strict **zero-LLM-arithmetic** deterministic physics and accounting formulas, combined with dual-layer cryptographic proof (Hyperledger Fabric + Circom Groth16 Zero-Knowledge Proofs).

### The Five Operational Stages
1. **Measure:** High-frequency 1–15 min MQTT/Modbus readings + bilingual OCR for DESCO/Titas/diesel bills.
2. **Explain:** Isolation Forest + XGBoost with TreeSHAP feature attributions for root-cause energy leaks.
3. **Reduce:** OR-Tools tariff-aware load shifting, pvlib solar PV sizing, and Marginal Abatement Cost Curve (MACC) ranking.
4. **Prove:** Circom Groth16 zk-SNARKs verifying regulatory threshold compliance without exposing factory secrets.
5. **Govern:** Single-use human approval tokens for all mutations; immutable SHA-256 audit trails.

---

## 2. Radical Honesty & Physical Trust Boundaries (§0)

- **Simulated Data Indicator**: Every chart, export, and telemetry metric derived from synthetic modeling displays a persistent `SIMULATED DATA` watermark.
- **Cryptographic Bounds**: Cryptography guarantees that data captured has not been tampered with post-capture, and that mathematical constraints (e.g. per-garment emission $\le$ buyer threshold) are satisfied. Physical truth is safeguarded via meter calibration logs, bill cross-reconciliation, and accredited human auditor sign-off.
