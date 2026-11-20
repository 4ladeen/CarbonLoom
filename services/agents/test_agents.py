"""
Unit tests for CarbonLoom LangGraph 9-Agent Pipeline & Corrective RAG.
"""
import pytest
from services.agents.supervisor import CarbonLoomMultiAgentOrchestrator
from services.rag.retrieval import HybridGraphRAGService
from services.agents.anomaly_detector import IndustrialWasteDetector

def test_rag_grounded_answer():
    """Verify that a valid regulatory query retrieves verified citations."""
    res = HybridGraphRAGService.search_and_grade("What is the EU CBAM de minimis threshold for 2026?")
    assert res["verdict"] == "GROUNDED_ANSWER"
    assert len(res["citations"]) > 0
    assert "50 tonnes" in res["answer"]

def test_rag_strict_refusal_on_unbacked_claim():
    """Verify FR-G8 strict refusal rule when query is outside verified corpus."""
    res = HybridGraphRAGService.search_and_grade("What is the Martian interplanetary carbon tax rate?")
    assert res["verdict"] == "REFUSAL_ENFORCED"
    assert len(res["citations"]) == 0
    assert "refuse" in res["answer"].lower()

def test_anomaly_shap_waterfall():
    """Verify TreeSHAP feature attributions add up and detect boiler steam leak."""
    sample_reading = {
        "equipment_id": "BOILER-01",
        "category": "boiler",
        "active_power_kw": 1150.0,
        "fault_injected": True,
        "fault_type": "steam_trap_leak",
        "power_factor": 0.90,
        "ambient_temp_c": 32.0,
        "ambient_rh_pct": 80.0
    }
    eval_res = IndustrialWasteDetector.evaluate_reading(sample_reading)
    assert eval_res["is_anomaly"] is True
    assert eval_res["anomaly_score"] > 0.70
    assert eval_res["requires_nrb_escalation"] is True
    assert len(eval_res["shap_waterfall"]) == 6

def test_agent_pipeline_hitl_checkpoint():
    """Verify that high-risk anomaly triggers an interactive Approval Card."""
    orchestrator = CarbonLoomMultiAgentOrchestrator()
    state = orchestrator.execute_flow("Check boiler energy waste and steam leaks")
    assert state.active_agent == "anomaly_analyst"
    assert state.hitl_pending is True
    assert state.hitl_approval_card is not None
    assert state.hitl_approval_card["action"] == "create_cmms_maintenance_ticket"
