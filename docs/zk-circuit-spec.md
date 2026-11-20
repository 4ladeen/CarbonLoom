# Zero-Knowledge Circuit Specification (`cbam_proof.circom`)

## Circuit Objectives
The Circom 2 circuit enables an export factory to prove compliance with buyer and EU regulatory emission thresholds without exposing sensitive commercial information:
1. Prove total emissions $\sum_{i=1}^n E_i \le T_{\text{threshold}}$.
2. Prove that emission entries $\{E_i\}$ are members of an anchored Merkle root committed on Hyperledger Fabric.
3. Prove that an accredited NRB auditor's Ed25519 public key has signed the Merkle root.
4. Keep private: unit costs, specific supplier IDs, profit margins, and machine capacities.

## Signal Definitions

### Public Signals
- `thresholdMax`: Maximum allowable kgCO2e per unit or batch.
- `anchoredMerkleRoot`: 256-bit Poseidon hash root anchored on ledger.
- `batchIdHash`: Identifier hash for the specific PO/batch.
- `isCompliant`: Binary output signal (1 = pass, 0 = fail).

### Private Signals (Witness Only)
- `lineItemEmissions[N]`: Individual emissions components.
- `supplierIds[N]`: Obfuscated vendor identifiers.
- `merklePathElements[N][DEPTH]`: Merkle inclusion proof siblings.
- `merklePathIndices[N][DEPTH]`: Direction flags for Poseidon tree.
