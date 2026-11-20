"""
CarbonLoom Deterministic Carbon Accounting — Solar PV & Storage Sizing Engine (FR-D3)
Models rooftop solar PV generation and battery storage using NASA POWER irradiance data.
Deterministic physics calculations.
"""
from typing import Dict, Any, Optional

# Average monthly Global Horizontal Irradiance (GHI) in kWh/m2/day for Dhaka, Bangladesh (NASA POWER)
DHAKA_MONTHLY_GHI_KWH_M2_DAY = {
    1: 4.12,  # Jan
    2: 4.85,  # Feb
    3: 5.62,  # Mar
    4: 6.05,  # Apr
    5: 5.75,  # May
    6: 4.52,  # Jun (monsoon cloud cover)
    7: 4.20,  # Jul (monsoon cloud cover)
    8: 4.35,  # Aug
    9: 4.40,  # Sep
    10: 4.65, # Oct
    11: 4.45, # Nov
    12: 4.05  # Dec
}

class SolarEngine:
    """Physics-based estimation of rooftop solar generation and battery storage sizing."""

    @staticmethod
    def size_rooftop_system(
        usable_roof_area_m2: float,
        panel_efficiency: float = 0.21, # 21% monocrystalline PERC module
        system_derate_factor: float = 0.82 # Inverter losses, soiling, thermal derating
    ) -> Dict[str, Any]:
        """Sizes maximum viable rooftop PV array based on usable unshaded area."""
        # Standard test condition: 1 kWp requires ~ 1 / (1000 W/m2 * efficiency) m2 ≈ 4.76 m2 per kWp
        area_per_kwp = 1.0 / panel_efficiency
        max_capacity_kwp = usable_roof_area_m2 / area_per_kwp

        # Annual average daily GHI (kWh/m2/day)
        avg_daily_ghi = sum(DHAKA_MONTHLY_GHI_KWH_M2_DAY.values()) / 12.0
        
        # Daily specific yield (kWh / kWp / day) = GHI * derate
        daily_yield_kwh_per_kwp = avg_daily_ghi * system_derate_factor
        annual_generation_kwh = max_capacity_kwp * daily_yield_kwh_per_kwp * 365.0

        # Capacity Utilization Factor (CUF) %
        cuf_pct = (annual_generation_kwh / (max_capacity_kwp * 8760.0)) * 100.0

        # Displaced Scope 2 emissions (tCO2e/year) using Bangladesh DoE GEF 0.62 tCO2/MWh
        avoided_tco2e_per_year = (annual_generation_kwh / 1000.0) * 0.620

        # Annual tariff savings in BDT (using average blended industrial rate ~ 11.50 BDT/kWh)
        annual_tariff_savings_bdt = annual_generation_kwh * 11.50
        estimated_capex_bdt = max_capacity_kwp * 75000.0 # ~75k BDT per kWp installed

        payback_years = estimated_capex_bdt / annual_tariff_savings_bdt if annual_tariff_savings_bdt > 0 else 0.0

        return {
            "usable_roof_area_m2": usable_roof_area_m2,
            "system_capacity_kwp": round(max_capacity_kwp, 1),
            "panel_technology": "High-Efficiency Monocrystalline PERC",
            "panel_efficiency_pct": round(panel_efficiency * 100.0, 1),
            "system_performance_ratio_pct": round(system_derate_factor * 100.0, 1),
            "estimated_annual_generation_kwh": round(annual_generation_kwh, 0),
            "capacity_utilization_factor_pct": round(cuf_pct, 2),
            "annual_avoided_scope2_tco2e": round(avoided_tco2e_per_year, 2),
            "financials": {
                "estimated_turnkey_capex_bdt": round(estimated_capex_bdt, 0),
                "estimated_annual_savings_bdt": round(annual_tariff_savings_bdt, 0),
                "simple_payback_years": round(payback_years, 2)
            },
            "data_quality": "simulated",
            "simulated_watermark": "SIMULATED DATA"
        }
