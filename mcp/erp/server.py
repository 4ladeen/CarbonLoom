"""
erp-mcp: Read-Only ERP & Production Data MCP Server (Server 2)
Tools: get_orders, get_production, get_smv, get_fiber_or_alloy_bom, get_shipment_tonnage
"""
from typing import Dict, List, Any

ORDERS_DB = [
    {
        "order_id": "PO-EU-HM-2026-01",
        "buyer": "H&M Group",
        "style_code": "TSHIRT-CREW-100COTTON",
        "pieces_ordered": 25000,
        "pieces_produced": 25240,
        "smv_minutes": 4.25,
        "fabric_gsm": 160,
        "fiber_composition": {"cotton": 1.0},
        "shipment_tonnage": 4.16
    },
    {
        "order_id": "PO-EU-ZARA-2026-04",
        "buyer": "Inditex Zara",
        "style_code": "HOODIE-FLEECE-BLEND",
        "pieces_ordered": 12000,
        "pieces_produced": 12080,
        "smv_minutes": 11.50,
        "fabric_gsm": 320,
        "fiber_composition": {"cotton": 0.80, "recycled_polyester": 0.20},
        "shipment_tonnage": 5.80
    }
]

def get_orders(tenant_id: str, status: str = "active") -> List[Dict[str, Any]]:
    return ORDERS_DB

def get_production(order_id: str) -> Dict[str, Any]:
    for o in ORDERS_DB:
        if o["order_id"] == order_id:
            return {"order_id": order_id, "pieces_produced": o["pieces_produced"], "efficiency_pct": 88.5}
    return {"error": "Order not found"}

def get_smv(style_code: str) -> Dict[str, Any]:
    for o in ORDERS_DB:
        if o["style_code"] == style_code:
            return {"style_code": style_code, "smv_minutes": o["smv_minutes"], "gmt_type": "T-Shirt/Hoodie"}
    return {"style_code": style_code, "smv_minutes": 5.0}

def get_fiber_or_alloy_bom(style_code: str) -> Dict[str, Any]:
    for o in ORDERS_DB:
        if o["style_code"] == style_code:
            return {"style_code": style_code, "bom": o["fiber_composition"]}
    return {"style_code": style_code, "bom": {"cotton": 1.0}}

def get_shipment_tonnage(order_id: str) -> Dict[str, Any]:
    for o in ORDERS_DB:
        if o["order_id"] == order_id:
            return {"order_id": order_id, "tonnage": o["shipment_tonnage"]}
    return {"order_id": order_id, "tonnage": 1.0}
