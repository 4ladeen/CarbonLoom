"""
CarbonLoom Deterministic Carbon Accounting — SMV Allocation Engine (FR-B5)
Allocates facility emissions down to production order, style, and individual garment.
Formula: w_j = (Pieces_j * SMV_j) / Σ(Pieces_k * SMV_k)
Strict ISO 14064-1 & GHG Protocol allocation hierarchy. Zero-LLM math.
"""
from typing import Dict, List, Any, Optional
from services.api.core.lineage import CalculationLineage
from services.api.core.uncertainty import UncertaintyEngine

class SMVAllocationEngine:
    """Allocates facility Scope 1, Scope 2, and Scope 3 emissions to products via Standard Minute Value."""

    FORMULA_VERSION = "CARBONLOOM-SMV-ALLOC-V2"

    @classmethod
    def allocate(
        cls,
        total_scope1_tco2e: float,
        total_scope2_tco2e: float,
        total_scope3_tco2e: float,
        orders: List[Dict[str, Any]],
        allocation_method: str = "smv_weighted", # "smv_weighted", "physical_mass", "machine_runtime"
        data_quality: str = "simulated"
    ) -> Dict[str, Any]:
        """
        Executes deterministic allocation across all batch orders.
        Returns detailed allocation table and per-piece carbon intensity.
        """
        if not orders:
            raise ValueError("Cannot perform allocation on empty orders list")

        # 1. Compute denominators based on chosen allocation method
        if allocation_method == "smv_weighted":
            # SMV work-content: pieces * smv_minutes
            weights_raw = [o["pieces_produced"] * o["smv_minutes"] for o in orders]
        elif allocation_method == "physical_mass":
            # Physical mass: pieces * fabric_weight_kg_per_piece
            weights_raw = [o["pieces_produced"] * o.get("fabric_weight_kg_per_piece", 0.20) for o in orders]
        elif allocation_method == "machine_runtime":
            weights_raw = [o["pieces_produced"] * o.get("machine_runtime_hours_per_piece", 0.1) for o in orders]
        else:
            raise ValueError(f"Unsupported allocation method: {allocation_method}")

        total_weight_units = sum(weights_raw)
        if total_weight_units <= 0:
            raise ValueError("Total allocation denominator must be greater than zero")

        total_facility_tco2e = total_scope1_tco2e + total_scope2_tco2e + total_scope3_tco2e
        results = []
        lineage_subnodes = []

        # 2. Allocate proportionally to each order
        for idx, order in enumerate(orders):
            raw_w = weights_raw[idx]
            weight_fraction = raw_w / total_weight_units

            alloc_s1 = total_scope1_tco2e * weight_fraction
            alloc_s2 = total_scope2_tco2e * weight_fraction
            alloc_s3 = total_scope3_tco2e * weight_fraction
            alloc_total_tco2e = alloc_s1 + alloc_s2 + alloc_s3

            # Compute emissions per individual garment in kgCO2e
            pieces = order["pieces_produced"]
            kgco2e_per_garment = (alloc_total_tco2e * 1000.0) / pieces if pieces > 0 else 0.0

            # Lineage tracking
            node = CalculationLineage.create_node(
                formula_id=f"ALLOC_ORDER_{order['order_id']}",
                formula_version=cls.FORMULA_VERSION,
                inputs={
                    "order_id": order["order_id"],
                    "pieces": pieces,
                    "smv": order.get("smv_minutes", 0.0),
                    "raw_weight": raw_w,
                    "total_weights": total_weight_units,
                    "fraction": weight_fraction
                },
                factor_id="WEIGHT_FRACTION",
                factor_value=weight_fraction,
                result_value=alloc_total_tco2e,
                result_unit="tCO2e"
            )
            lineage_subnodes.append(node)

            # Per-piece metric with uncertainty bounds
            per_piece_metric = UncertaintyEngine.wrap_metric(
                value=kgco2e_per_garment,
                unit="kgCO2e/piece",
                activity_uncertainty_pct=2.5,
                factor_uncertainty_pct=4.0,
                data_quality=data_quality,
                lineage_id=node["lineage_id"]
            )

            target_thresh = order.get("target_threshold_kgco2_per_piece", 5.0)
            is_compliant = kgco2e_per_garment <= target_thresh

            results.append({
                "order_id": order["order_id"],
                "buyer": order.get("buyer", "Unknown"),
                "style_ref": order.get("style_ref", "STYLE-DEFAULT"),
                "garment_type": order.get("garment_type", "Garment"),
                "pieces_produced": pieces,
                "smv_minutes": order.get("smv_minutes", 0.0),
                "allocation_weight": round(weight_fraction, 6),
                "allocated_scope1_tco2e": round(alloc_s1, 4),
                "allocated_scope2_tco2e": round(alloc_s2, 4),
                "allocated_scope3_tco2e": round(alloc_s3, 4),
                "total_allocated_tco2e": round(alloc_total_tco2e, 4),
                "emissions_per_garment_kgco2e": per_piece_metric,
                "target_threshold_kgco2_per_piece": target_thresh,
                "is_compliant": is_compliant,
                "lineage_id": node["lineage_id"],
                "data_quality": data_quality,
                "simulated_watermark": "SIMULATED DATA"
            })

        master_lineage = CalculationLineage.create_node(
            formula_id="SMV_ALLOCATION_RUN",
            formula_version=cls.FORMULA_VERSION,
            inputs={"orders_count": len(orders), "total_facility_tco2e": total_facility_tco2e},
            factor_id="FACILITY_TOTAL",
            factor_value=total_facility_tco2e,
            result_value=sum(r["total_allocated_tco2e"] for r in results),
            result_unit="tCO2e",
            parent_lineage_ids=[n["lineage_id"] for n in lineage_subnodes]
        )

        return {
            "allocation_method": allocation_method,
            "facility_totals_tco2e": {
                "scope1": round(total_scope1_tco2e, 4),
                "scope2": round(total_scope2_tco2e, 4),
                "scope3": round(total_scope3_tco2e, 4),
                "total": round(total_facility_tco2e, 4)
            },
            "total_allocation_denominator": total_weight_units,
            "allocated_orders": results,
            "lineage": master_lineage,
            "data_quality": data_quality,
            "simulated_watermark": "SIMULATED DATA"
        }
