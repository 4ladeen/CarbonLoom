# CarbonLoom Changelog

All notable changes to the CarbonLoom platform are documented here.

## [2.0.0] - 2026-11-20
### Master Architecture Release
- **Architecture**: Complete 6-layer architecture implemented.
- **Database**: 26 canonical entities defined in PostgreSQL 16 schema with Row Level Security (RLS) and TimescaleDB hypertable for telemetry.
- **MCP Gateway**: Zero-trust Go gateway architecture with Presidio PII scrubbing, approval tokens, and hash-chained audit log.
- **Deterministic Math**: Scope 1, Scope 2, Scope 3 and SMV carbon-per-garment engines isolated in deterministic Python modules.
- **Simulation**: Digital Twin factory simulator with 4 labeled ground-truth faults and persistent `SIMULATED DATA` watermark.
- **Trust Plane**: Circom 2 Groth16 circuit for regulatory threshold compliance and Hyperledger Fabric multi-org anchor chaincode.
- **Design System**: Strict Hallmark Floor and Unslop 9-pass design rules integrated into frontend cockpits.
