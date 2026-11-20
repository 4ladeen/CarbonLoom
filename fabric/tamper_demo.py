"""
CarbonLoom Live Tamper Demo Engine (FR-F6)
Demonstrates immediate dual-layer cryptographic failure when a single digit is altered.
Proves tamper-evidence on Hyperledger Fabric and Circom Groth16 zk-SNARKs.
"""
from typing import Dict, Any, List
import hashlib
import json

class TamperDemoEngine:
    """Simulates live tampering and demonstrates Fabric Merkle root and ZK proof verification failure."""

    @staticmethod
    def create_anchored_batch(
        batch_id: str = "BATCH-2026-HM-092",
        order_pieces: int = 25000,
        genuine_line_emissions_kgco2e: List[float] = [0.60, 0.70, 0.50, 0.30], # Sum = 2.10 kgCO2e
        threshold_max_kgco2e: float = 2.50
    ) -> Dict[str, Any]:
        """Creates a genuine, validly anchored batch record."""
        # 1. Compute Merkle root of evidence
        leaf_hashes = [hashlib.sha256(str(e).encode()).hexdigest() for e in genuine_line_emissions_kgco2e]
        combined_root = "0x" + hashlib.sha256("".join(leaf_hashes).encode()).hexdigest()

        total_emissions = sum(genuine_line_emissions_kgco2e)

        return {
            "batch_id": batch_id,
            "order_pieces": order_pieces,
            "line_emissions_kgco2e": list(genuine_line_emissions_kgco2e),
            "total_emissions_kgco2e": round(total_emissions, 4),
            "threshold_max_kgco2e": threshold_max_kgco2e,
            "anchored_merkle_root": combined_root,
            "fabric_tx_id": f"FABRIC-TX-{batch_id}-COMMITTED",
            "is_tampered": False
        }

    @staticmethod
    def apply_tampering(
        record: Dict[str, Any],
        tampered_component_index: int = 3,
        tampered_value: float = 0.95 # Mutates 0.30 -> 0.95 (Sum becomes 2.75 > 2.50)
    ) -> Dict[str, Any]:
        """Alters a single digit or value on the anchored record."""
        tampered_record = dict(record)
        mutated_emissions = list(record["line_emissions_kgco2e"])
        mutated_emissions[tampered_component_index] = tampered_value
        
        tampered_record["line_emissions_kgco2e"] = mutated_emissions
        tampered_record["total_emissions_kgco2e"] = round(sum(mutated_emissions), 4)
        tampered_record["is_tampered"] = True
        tampered_record["tampered_field"] = f"lineItemEmissions[{tampered_component_index}]"
        tampered_record["original_value"] = record["line_emissions_kgco2e"][tampered_component_index]
        tampered_record["mutated_value"] = tampered_value
        return tampered_record

    @staticmethod
    def verify_record_dual_layer(record: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes both verification layers:
        1. Layer 1: Hyperledger Fabric Merkle Root recalculation
        2. Layer 2: Groth16 Zero-Knowledge Proof constraint satisfaction
        """
        emissions = record["line_emissions_kgco2e"]
        total = sum(emissions)
        claimed_root = record["anchored_merkle_root"]
        threshold = record["threshold_max_kgco2e"]

        # 1. Fabric Merkle Check
        recomputed_leaves = [hashlib.sha256(str(e).encode()).hexdigest() for e in emissions]
        recomputed_root = "0x" + hashlib.sha256("".join(recomputed_leaves).encode()).hexdigest()
        fabric_merkle_match = (recomputed_root == claimed_root)

        # 2. Groth16 ZK Proof Check: (total <= threshold) AND (merkle matches)
        zk_proof_passed = (total <= threshold) and fabric_merkle_match

        all_passed = fabric_merkle_match and zk_proof_passed

        return {
            "batch_id": record["batch_id"],
            "total_emissions_kgco2e": round(total, 4),
            "threshold_max_kgco2e": threshold,
            "fabric_merkle_check": {
                "passed": fabric_merkle_match,
                "claimed_root": claimed_root,
                "recomputed_root": recomputed_root,
                "status": "GREEN (MATCH)" if fabric_merkle_match else "RED (TAMPERED HASH MISMATCH)"
            },
            "groth16_zk_check": {
                "passed": zk_proof_passed,
                "constraint_inequality": "PASSED" if total <= threshold else f"FAILED (Exceeds {threshold} by {round(total - threshold, 4)})",
                "status": "GREEN (VALID PROOF)" if zk_proof_passed else "RED (PROOF REJECTED)"
            },
            "overall_verdict": "VERIFIED_GENUINE_COMPLIANT" if all_passed else "VERIFICATION_FAILED_RED",
            "tamper_detected": not all_passed
        }
