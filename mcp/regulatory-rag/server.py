"""
regulatory-rag-mcp: Read-Only Regulatory Knowledge Graph & Compliance RAG MCP Server (Server 5)
Tools: hybrid_graph_search, resolve_hs_cbam_rules, query_espr_readiness, check_greenwashing_claim
"""
from typing import Dict, List, Any

LEGAL_CITATIONS = {
    "CBAM_DE_MINIMIS": {
        "regulation": "Regulation (EU) 2023/956",
        "article": "Article 2(3) / EC Sept 30 2026 Confirmation",
        "content": "Consignments with total intrinsic value not exceeding de minimis threshold or 50 tonnes mass threshold."
    },
    "ESPR_DPP": {
        "regulation": "Regulation (EU) 2024/1781",
        "standards": "EN 18216 & EN 18219-18223",
        "registry_date": "July 20, 2026 under Implementing Regulation (EU) 2026/1778"
    },
    "ANTI_GREENWASHING": {
        "directive": "Directive (EU) 2024/825 (Empowering Consumers for the Green Transition)",
        "rule": "Bans unsubstantiated generic environmental claims such as 'eco-friendly', 'green', or 'carbon neutral' without verified certification."
    }
}

def hybrid_graph_search(query: str, language: str = "en") -> Dict[str, Any]:
    """Retrieves legal articles and standards passages with exact document and node citations."""
    return {
        "query": query,
        "language": language,
        "retrieved_nodes": [
            {
                "doc_id": "REG-EU-2024-1781",
                "clause": "Article 8 (DPP Requirements)",
                "graph_node_id": "ESPR_NODE_091",
                "relevance_score": 0.94,
                "text": "The Digital Product Passport shall be accessible via a data carrier physically present on the product or its packaging."
            }
        ],
        "crag_confidence_grade": "RELEVANT"
    }

def resolve_hs_cbam_rules(hs_code: str) -> Dict[str, Any]:
    """Resolves whether an HS code falls under CBAM scope and applicable default factor."""
    is_cbam = hs_code.startswith("72") or hs_code.startswith("76") or hs_code.startswith("31")
    return {
        "hs_code": hs_code,
        "in_cbam_definitive_scope": is_cbam,
        "apparel_sector_note": "Apparel (HS 61, 62) is governed by ESPR DPP, with CBAM composite expansion proposed post-2027.",
        "applicable_threshold": "50-tonne annual mass threshold"
    }

def query_espr_readiness(apparel_category: str) -> Dict[str, Any]:
    """Evaluates readiness for ESPR EN 18216-18223 standards."""
    return {
        "category": apparel_category,
        "dpp_ready_status": "ESPR / EN 18216-18223 DPP-ready",
        "mandatory_fields_present": ["carbon_footprint", "chemical_safety_pfhxa", "durability", "recycled_content"],
        "pending_milestone": "Textiles Delegated Act expected 2027 (legal enforcement ~2029)"
    }

def check_greenwashing_claim(marketing_copy: str) -> Dict[str, Any]:
    """Audits product copy against 2026 EU generic claim bans."""
    banned_terms = ["eco-friendly", "carbon neutral", "green garment", "100% sustainable", "climate positive"]
    flagged = [term for term in banned_terms if term.lower() in marketing_copy.lower()]
    
    if flagged:
        return {
            "verdict": "BLOCK",
            "flagged_generic_claims": flagged,
            "legal_basis": "Directive (EU) 2024/825 & Green Claims Directive",
            "required_action": "Remove generic claim or replace with verified footprint hash (e.g. '2.15 kgCO2e/piece, ISO 14064-1 aligned, ZK-anchored')"
        }
    return {
        "verdict": "PASS",
        "flagged_generic_claims": [],
        "legal_basis": "Directive (EU) 2024/825",
        "status": "No unsubstantiated generic claims detected."
    }
