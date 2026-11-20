"""
CarbonLoom ZK Circuit Adversarial Vector Unit Tests (§5.8)
Guarantees 100% constraint pass/fail accuracy across all 6 boundary vectors.
"""
import pytest
from circuits.witness_verifier import ZKWitnessSimulator, get_six_adversarial_vectors

def test_all_six_adversarial_witness_vectors():
    """Iterate through all 6 vectors and verify exact match with expected constraint verdict."""
    vectors = get_six_adversarial_vectors()
    assert len(vectors) == 6

    for vec in vectors:
        eval_res = ZKWitnessSimulator.evaluate_witness(vec)
        expected = vec["expected_verdict"]
        actual = eval_res["constraints_satisfied"]
        
        assert actual == expected, (
            f"Adversarial vector {vec['vector_id']} failed: "
            f"Expected {expected}, got {actual}. Details: {eval_res}"
        )
