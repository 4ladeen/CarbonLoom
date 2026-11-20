"""
CarbonLoom Deterministic Carbon Accounting — Scope 3 Starter & Cascade (FR-B4)
Computes Category 1 (Purchased Goods: yarn, fabric, trims) and Category 4 (Upstream Freight).
Supports blending Tier-2/3 supplier actuals with conservative fallbacks.
"""
from typing import Dict, List, Any, Optional
from services.api.core.lineage import CalculationLineage
from services.api.core.uncertainty import UncertaintyEngine

# Benchmark Tier-2 textile emission factors (kgCO2e per kg of material)
MATERIAL_EMISSION_FACTORS: Dict[str, Dict[str, Any]] = {
    "conventional_cotton_fabric": {
        "factor_id": "MAT-COTTON-CONV-2024",
        "name": "Conventional Ring-spun Cotton Fabric",
        "kgco2e_per_kg": 8.45,
        "uncertainty_pct": 12.0,
        "source": "Higg MSI / Textile Exchange benchmark"
    },
    "organic_cotton_fabric": {
        "factor_id": "MAT-COTTON-ORG-2024",
        "name": "GOTS Certified Organic Cotton Fabric",
        "kgco2e_per_kg": 4.15,
        "uncertainty_pct": 10.0,
        "source": "Textile Exchange 2024 Report"
    },
    "recycled_polyester_fabric": {
        "factor_id": "MAT-POLY-REC-2024",
        "name": "GRS Certified Recycled Polyester",
        "kgco2e_per_kg": 3.80,
        "uncertainty_pct": 14.0,
        "source": "Higg MSI 2024"
    },
    "virgin_polyester_fabric": {
        "factor_id": "MAT-POLY-VIRG-2024",
        "name": "Virgin Polyester Filament Fabric",
        "kgco2e_per_kg": 9.20,
        "uncertainty_pct": 8.0,
        "source": "EcoInvent 3.9"
    }
}

class Scope3Engine:
    """Deterministic calculation of Scope 3 upstream emissions."""

    FORMULA_VERSION = "GHG-PROTOCOL-SCOPE-3-CAT1-CAT4-V2"

    @classmethod
    def calculate_purchased_goods(
        cls,
        materials: List[Dict[str, Any]],
        data_quality: str = "simulated"
    ) -> Dict[str, Any]:
        """
        Calculates Scope 3 Category 1 emissions:
        materials list format: [{'material_type': str, 'weight_kg': float, 'supplier_actual_kgco2_per_kg': Optional[float]}]
        """
        total_kgco2e = 0.0
        lineage_subnodes = []

        for item in materials:
            m_type = item["material_type"]
            weight_kg = item["weight_kg"]
            
            # Check if Tier-2 supplier provided verified actual factor
            if item.get("supplier_actual_kgco2_per_kg") is not None:
                factor_val = item["supplier_actual_kgco2_per_kg"]
                factor_id = "TIER2-SUPPLIER-ACTUAL"
                unc_pct = 5.0 # Supplier verified actual has tighter uncertainty
                item_quality = "measured"
            else:
                default_factor = MATERIAL_EMISSION_FACTORS.get(
                    m_type, MATERIAL_EMISSION_FACTORS["conventional_cotton_fabric"]
                )
                factor_val = default_factor["kgco2e_per_kg"]
                factor_id = default_factor["factor_id"]
                unc_pct = default_factor["uncertainty_pct"]
                item_quality = "estimated"

            item_emissions = weight_kg * factor_val
            total_kgco2e += item_emissions

            subnode = CalculationLineage.create_node(
                formula_id="S3_CAT1_ITEM",
                formula_version=cls.FORMULA_VERSION,
                inputs={"material_type": m_type, "weight_kg": weight_kg},
                factor_id=factor_id,
                factor_value=factor_val,
                result_value=item_emissions,
                result_unit="kgCO2e"
            )
            lineage_subnodes.append(subnode)

        total_tco2e = total_kgco2e / 1000.0

        master_lineage = CalculationLineage.create_node(
            formula_id="S3_CAT1_TOTAL_TCO2E",
            formula_version=cls.FORMULA_VERSION,
            inputs={"items_count": len(materials), "total_kgco2e": total_kgco2e},
            factor_id="SUMMATION",
            factor_value=1.0,
            result_value=total_tco2e,
            result_unit="tCO2e",
            parent_lineage_ids=[n["lineage_id"] for n in lineage_subnodes]
        )

        metric = UncertaintyEngine.wrap_metric(
            value=total_tco2e,
            unit="tCO2e",
            activity_uncertainty_pct=4.0,
            factor_uncertainty_pct=10.0,
            data_quality=data_quality,
            lineage_id=master_lineage["lineage_id"]
        )

        return {
            "scope": "Scope 3 Category 1 (Purchased Goods)",
            "total_tco2e": metric,
            "total_kgco2e": round(total_kgco2e, 2),
            "lineage": master_lineage,
            "sub_lineages": lineage_subnodes,
            "data_quality": data_quality,
            "simulated_watermark": "SIMULATED DATA"
        }
