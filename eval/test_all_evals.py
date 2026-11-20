"""
CarbonLoom Automated CI Evaluation & Red-Team Suite (PRD §5.8)
Runs on prompt, model, retrieval, or calculation changes.
"""
import pytest
from eval.injection_redteam import test_prompt_injection_defense
from circuits.witness_verifier import ZKWitnessSimulator, get_six_adversarial_vectors
from services.rag.retrieval import HybridGraphRAGService
from services.api.core.scope1 import Scope1Engine
from services.api.core.scope2 import Scope2Engine
from services.api.core.smv_allocator import SMVAllocationEngine

def test_eval_carbon_math_zero_tolerance():
    """Evaluate carbon math vs exact hand calculation (0.00% tolerance)."""
    res1 = Scope1Engine.calculate(natural_gas_m3=5000.0, diesel_liters=1000.0)
    expected_tco2e = (5000.0 * 1.9840 + 1000.0 * 2.6820) / 1000.0
    assert abs(res1["total_tco2e"]["value"] - expected_tco2e) < 1e-6

def test_eval_security_injection_block_rate():
    """Verify 100% prompt-injection block rate."""
    test_prompt_injection_defense()

def test_eval_zk_circuit_soundness():
    """Verify 100% pass/fail accuracy across all 6 witness vectors."""
    vectors = get_six_adversarial_vectors()
    for v in vectors:
        eval_res = ZKWitnessSimulator.evaluate_witness(v)
        assert eval_res["constraints_satisfied"] == v["expected_verdict"]

def test_eval_rag_refusal_precision():
    """Verify 100% refusal accuracy when queries lack indexed evidence."""
    refusal_res = HybridGraphRAGService.search_and_grade("What is the tariff on lunar helium-3 exports?")
    assert refusal_res["verdict"] == "REFUSAL_ENFORCED"
    assert len(refusal_res["citations"]) == 0
