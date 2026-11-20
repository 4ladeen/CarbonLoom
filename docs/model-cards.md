# Model Cards & System Specifications

## 1. Isolation Forest & XGBoost Anomaly Detector
- **Purpose**: Detect anomalous consumption patterns on steam boilers, air compressors, and electrical baseload.
- **Features**: Active kW, Reactive kVAR, Power Factor, Steam Pressure, Ambient Temperature, Relative Humidity, SMV Production Volume.
- **Explainability**: TreeSHAP waterfall values for every flagged deviation.
- **Stratification**: Separate baselines for SME (< 500 sewing machines) vs Tier-1 (> 1,500 machines) facilities.

## 2. BGE-M3 + bge-reranker-v2-m3 Multilingual Retrieval
- **Purpose**: Bilingual Bangla/English retrieval over EU regulations, national tariff schedules, and equipment manuals.
- **Architecture**: Dense vectors (1024-dim) + BM25 sparse lexical matching with Corrective RAG (CRAG) confidence grading.
- **Refusal Invariant**: Enforces explicit refusal when relevance grade falls below confidence threshold.

## 3. Circom 2 / Groth16 Zero-Knowledge Compliance Circuit
- **Circuit**: `cbam_proof.circom`
- **Public Inputs**: `thresholdMax`, `anchoredMerkleRoot`, `nrbAuditorPubKey`, `batchIdHash`, `isCompliant`
- **Private Inputs**: `energyItems[N]`, `supplierIds[N]`, `unitCosts[N]`, `merklePath[N]`
- **Constraint System**: Proves total emissions $\le$ threshold and proof of inclusion in anchored Merkle root without disclosing unit costs or supplier identities.
