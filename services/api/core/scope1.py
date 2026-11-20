"""
CarbonLoom Deterministic Carbon Accounting — Scope 1 Engine (FR-B2)
Accounts for steam boilers, captive gas generators, diesel gensets, and fugitive refrigerants.
Strict ISO 14064-1:2018 and GHG Protocol compliant. Zero-LLM math.
"""
from typing import Dict, Any
from services.api.core.emission_factors import get_emission_factor
from services.api.core.lineage import CalculationLineage
from services.api.core.uncertainty import UncertaintyEngine

class Scope1Engine:
    """Deterministic calculation of direct Scope 1 greenhouse gas emissions."""

    FORMULA_VERSION = "ISO-14064-1:2018-EQ-S1-V2"

    @classmethod
    def calculate(
        cls,
        natural_gas_m3: float = 0.0,
        diesel_liters: float = 0.0,
        furnace_oil_liters: float = 0.0,
        refrigerant_r134a_kg: float = 0.0,
        refrigerant_r410a_kg: float = 0.0,
        data_quality: str = "simulated"
    ) -> Dict[str, Any]:
        """Calculates total Scope 1 emissions in tCO2e and individual component contributions."""
        # 1. Fetch pinned factors
        gas_factor = get_emission_factor("IPCC-NATURAL-GAS-M3")
        diesel_factor = get_emission_factor("IPCC-DIESEL-LITER")
        oil_factor = get_emission_factor("IPCC-FURNACE-OIL-LITER")
        r134a_factor = get_emission_factor("IPCC-R134A-GWP")
        r410a_factor = get_emission_factor("IPCC-R410A-GWP")

        # 2. Compute individual emissions in kgCO2e
        gas_kgco2e = natural_gas_m3 * gas_factor["co2e_factor"]
        diesel_kgco2e = diesel_liters * diesel_factor["co2e_factor"]
        oil_kgco2e = furnace_oil_liters * oil_factor["co2e_factor"]
        r134a_kgco2e = refrigerant_r134a_kg * r134a_factor["co2e_factor"]
        r410a_kgco2e = refrigerant_r410a_kg * r410a_factor["co2e_factor"]

        total_kgco2e = gas_kgco2e + diesel_kgco2e + oil_kgco2e + r134a_kgco2e + r410a_kgco2e
        total_tco2e = total_kgco2e / 1000.0

        # 3. Build lineage nodes
        lineage_gas = CalculationLineage.create_node(
            formula_id="S1_NATURAL_GAS",
            formula_version=cls.FORMULA_VERSION,
            inputs={"natural_gas_m3": natural_gas_m3},
            factor_id=gas_factor["factor_id"],
            factor_value=gas_factor["co2e_factor"],
            result_value=gas_kgco2e,
            result_unit="kgCO2e"
        )
        lineage_diesel = CalculationLineage.create_node(
            formula_id="S1_DIESEL",
            formula_version=cls.FORMULA_VERSION,
            inputs={"diesel_liters": diesel_liters},
            factor_id=diesel_factor["factor_id"],
            factor_value=diesel_factor["co2e_factor"],
            result_value=diesel_kgco2e,
            result_unit="kgCO2e"
        )
        lineage_refrig = CalculationLineage.create_node(
            formula_id="S1_REFRIGERANTS",
            formula_version=cls.FORMULA_VERSION,
            inputs={"r134a_kg": refrigerant_r134a_kg, "r410a_kg": refrigerant_r410a_kg},
            factor_id="IPCC-REFRIGERANTS-COMBINED",
            factor_value=r134a_factor["co2e_factor"],
            result_value=r134a_kgco2e + r410a_kgco2e,
            result_unit="kgCO2e"
        )

        master_lineage = CalculationLineage.create_node(
            formula_id="S1_TOTAL_TCO2E",
            formula_version=cls.FORMULA_VERSION,
            inputs={
                "gas_kgco2e": gas_kgco2e,
                "diesel_kgco2e": diesel_kgco2e,
                "oil_kgco2e": oil_kgco2e,
                "refrigerant_kgco2e": r134a_kgco2e + r410a_kgco2e
            },
            factor_id="SUMMATION",
            factor_value=1.0,
            result_value=total_tco2e,
            result_unit="tCO2e",
            parent_lineage_ids=[lineage_gas["lineage_id"], lineage_diesel["lineage_id"], lineage_refrig["lineage_id"]]
        )

        # 4. Wrap with uncertainty bounds
        total_metric = UncertaintyEngine.wrap_metric(
            value=total_tco2e,
            unit="tCO2e",
            activity_uncertainty_pct=2.5,
            factor_uncertainty_pct=2.8,
            data_quality=data_quality,
            lineage_id=master_lineage["lineage_id"]
        )

        return {
            "scope": "Scope 1",
            "total_tco2e": total_metric,
            "components_kgco2e": {
                "natural_gas": round(gas_kgco2e, 2),
                "diesel": round(diesel_kgco2e, 2),
                "furnace_oil": round(oil_kgco2e, 2),
                "refrigerants": round(r134a_kgco2e + r410a_kgco2e, 2)
            },
            "lineage": master_lineage,
            "sub_lineages": [lineage_gas, lineage_diesel, lineage_refrig],
            "data_quality": data_quality,
            "simulated_watermark": "SIMULATED DATA"
        }
