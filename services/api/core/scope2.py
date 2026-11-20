"""
CarbonLoom Deterministic Carbon Accounting — Scope 2 Engine (FR-B3)
Computes Location-Based and Market-Based indirect emissions for grid electricity & solar PV.
Dual reporting strictly aligned with GHG Protocol Scope 2 Guidance.
"""
from typing import Dict, Any, Optional
from services.api.core.emission_factors import get_emission_factor
from services.api.core.lineage import CalculationLineage
from services.api.core.uncertainty import UncertaintyEngine

class Scope2Engine:
    """Deterministic calculation of indirect Scope 2 electricity emissions."""

    FORMULA_VERSION = "GHG-PROTOCOL-SCOPE-2-DUAL-V2"

    @classmethod
    def calculate(
        cls,
        grid_consumption_kwh: float,
        rooftop_solar_generated_kwh: float = 0.0,
        rooftop_solar_self_consumed_kwh: float = 0.0,
        factor_id: str = "DOE-GEF-2020-21",
        data_quality: str = "simulated"
    ) -> Dict[str, Any]:
        """
        Executes dual reporting for Scope 2:
        1. Location-based: Total grid import * DoE Grid Emission Factor
        2. Market-based: Net grid import (accounting for behind-the-meter solar) * contractual factor
        """
        grid_factor = get_emission_factor(factor_id)
        factor_val = grid_factor["co2e_factor"] # tCO2 / MWh

        # Location-based: grid_kwh / 1000 * factor_val
        grid_mwh = grid_consumption_kwh / 1000.0
        location_based_tco2e = grid_mwh * factor_val

        # Market-based: If solar is self-consumed behind the meter, grid draw is already net,
        # but if solar displaced grid, we calculate effective net market impact:
        # Solar self-consumption carries 0.000 tCO2e/MWh Scope 2 emissions
        solar_displaced_mwh = rooftop_solar_self_consumed_kwh / 1000.0
        solar_avoided_tco2e = solar_displaced_mwh * factor_val
        market_based_tco2e = location_based_tco2e # Net grid import remains at location factor unless REC/PPA

        # Lineages
        lineage_loc = CalculationLineage.create_node(
            formula_id="S2_LOCATION_BASED",
            formula_version=cls.FORMULA_VERSION,
            inputs={"grid_kwh": grid_consumption_kwh, "grid_mwh": grid_mwh},
            factor_id=grid_factor["factor_id"],
            factor_value=factor_val,
            result_value=location_based_tco2e,
            result_unit="tCO2e"
        )

        lineage_solar = CalculationLineage.create_node(
            formula_id="S2_SOLAR_AVOIDED",
            formula_version=cls.FORMULA_VERSION,
            inputs={"solar_self_consumed_kwh": rooftop_solar_self_consumed_kwh},
            factor_id=grid_factor["factor_id"],
            factor_value=factor_val,
            result_value=solar_avoided_tco2e,
            result_unit="tCO2e"
        )

        # Wrap metrics with uncertainty
        loc_metric = UncertaintyEngine.wrap_metric(
            value=location_based_tco2e,
            unit="tCO2e",
            activity_uncertainty_pct=2.0,
            factor_uncertainty_pct=grid_factor["uncertainty_pct"],
            data_quality=data_quality,
            lineage_id=lineage_loc["lineage_id"]
        )

        mkt_metric = UncertaintyEngine.wrap_metric(
            value=market_based_tco2e,
            unit="tCO2e",
            activity_uncertainty_pct=2.0,
            factor_uncertainty_pct=grid_factor["uncertainty_pct"],
            data_quality=data_quality,
            lineage_id=lineage_loc["lineage_id"]
        )

        avoided_metric = UncertaintyEngine.wrap_metric(
            value=solar_avoided_tco2e,
            unit="tCO2e",
            activity_uncertainty_pct=3.0,
            factor_uncertainty_pct=grid_factor["uncertainty_pct"],
            data_quality=data_quality,
            lineage_id=lineage_solar["lineage_id"]
        )

        return {
            "scope": "Scope 2",
            "reporting_method": "Dual Reporting (GHG Protocol)",
            "location_based_tco2e": loc_metric,
            "market_based_tco2e": mkt_metric,
            "solar_avoided_tco2e": avoided_metric,
            "grid_consumption_kwh": grid_consumption_kwh,
            "rooftop_solar_self_consumed_kwh": rooftop_solar_self_consumed_kwh,
            "lineage": lineage_loc,
            "data_quality": data_quality,
            "simulated_watermark": "SIMULATED DATA"
        }
