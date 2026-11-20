"""
CarbonLoom 9-Agent LangGraph State & Topology (§5.2)
Defines shared state, tool routing, human-in-the-loop interrupt nodes, and execution flow.
"""
from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field

class AgentState(BaseModel):
    """Unified state dictionary passed across the 9-agent LangGraph execution graph."""
    session_id: str
    tenant_id: str
    user_query: str
    language: str = "en"
    
    # Execution plan and intent
    planned_steps: List[str] = Field(default_factory=list)
    current_step_index: int = 0
    active_agent: str = "supervisor"

    # Ingested context and data slices
    raw_document_id: Optional[str] = None
    extracted_ocr_data: Optional[Dict[str, Any]] = None
    telemetry_slice: Optional[List[Dict[str, Any]]] = None

    # Analytical outputs (Deterministic Python)
    scope1_result: Optional[Dict[str, Any]] = None
    scope2_result: Optional[Dict[str, Any]] = None
    smv_allocation_result: Optional[Dict[str, Any]] = None
    anomaly_shap_result: Optional[Dict[str, Any]] = None
    optimizer_result: Optional[Dict[str, Any]] = None
    cbam_simulation_result: Optional[Dict[str, Any]] = None

    # Compliance & RAG
    rag_retrieval_result: Optional[Dict[str, Any]] = None
    greenwashing_audit_result: Optional[Dict[str, Any]] = None

    # Human-in-the-Loop Approval checkpoints
    hitl_pending: bool = False
    hitl_approval_card: Optional[Dict[str, Any]] = None
    approval_token_id: Optional[str] = None

    # Cryptographic trust outputs
    zk_proof_result: Optional[Dict[str, Any]] = None
    fabric_anchor_tx: Optional[Dict[str, Any]] = None

    # Critic audit
    critic_passed: bool = False
    critic_audit_notes: List[str] = Field(default_factory=list)

    # Final response
    final_response_en: str = ""
    final_response_bn: str = ""
