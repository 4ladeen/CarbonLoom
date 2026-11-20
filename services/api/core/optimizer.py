"""
CarbonLoom Optimization & Financial ROI Engine (Module D)
Tariff-aware load shifting, Retrofit interventions, MACC curves, and EU CBAM tariff simulator.
Deterministic Python mathematical optimization.
"""
from typing import Dict, List, Any, Optional
import math

class OptimizationEngine:
    """Solves tariff scheduling, evaluates retrofits, and models EU CBAM liabilities."""

    @staticmethod
    def calculate_cbam_liability(
        export_tonnage: float,
        actual_embedded_tco2e_per_tonne: float,
        default_benchmark_tco2e_per_tonne: float = 2.15,
        eu_ets_price_eur_per_tco2e: float = 75.32,
        origin_carbon_price_paid_eur: float = 0.0 # Bangladesh does not yet have a national ETS
    ) -> Dict[str, Any]:
        """
        Simulates EU CBAM financial liability under 2026 definitive rules.
        Compares:
        1. Verified Actual Primary Data (using CarbonLoom Fabric + ZK proofs)
        2. Punitive Marked-Up EU Default Benchmark
        """
        # 1. Total embedded emissions
        actual_total_tco2e = export_tonnage * actual_embedded_tco2e_per_tonne
        default_total_tco2e = export_tonnage * default_benchmark_tco2e_per_tonne

        # 2. Financial liabilities in EUR
        effective_actual_rate = max(0.0, eu_ets_price_eur_per_tco2e - origin_carbon_price_paid_eur)
        actual_liability_eur = actual_total_tco2e * effective_actual_rate
        default_liability_eur = default_total_tco2e * eu_ets_price_eur_per_tco2e

        # 3. Direct financial savings from primary data verification
        cbam_savings_eur = default_liability_eur - actual_liability_eur
        savings_pct = (cbam_savings_eur / default_liability_eur * 100.0) if default_liability_eur > 0 else 0.0

        return {
            "export_tonnage": export_tonnage,
            "eu_ets_reference_price_eur": eu_ets_price_eur_per_tco2e,
            "actual_pathway": {
                "specific_emissions_tco2e_per_tonne": round(actual_embedded_tco2e_per_tonne, 3),
                "total_embedded_tco2e": round(actual_total_tco2e, 2),
                "cbam_liability_eur": round(actual_liability_eur, 2)
            },
            "default_benchmark_pathway": {
                "specific_emissions_tco2e_per_tonne": round(default_benchmark_tco2e_per_tonne, 3),
                "total_embedded_tco2e": round(default_total_tco2e, 2),
                "cbam_liability_eur": round(default_liability_eur, 2)
            },
            "cbam_tariff_avoidance_savings_eur": round(cbam_savings_eur, 2),
            "tariff_reduction_pct": round(savings_pct, 1),
            "data_quality": "simulated",
            "simulated_watermark": "SIMULATED DATA"
        }

    @staticmethod
    def get_retrofit_interventions() -> List[Dict[str, Any]]:
        """Standard catalog of factory energy retrofits for RMG facilities."""
        return [
            {
                "id": "RET-01-VFD",
                "name": "Variable Frequency Drives (VFDs) on Air Compressors",
                "capex_bdt": 850000.0,
                "annual_kwh_saved": 95000.0,
                "annual_cost_savings_bdt": 95000.0 * 11.20,
                "co2e_avoided_tco2e_per_year": 95.0 * 0.62, # Grid GEF
                "lifespan_years": 8
            },
            {
                "id": "RET-02-ECON",
                "name": "Boiler Flue-Gas Economizer & Condensate Recovery",
                "capex_bdt": 2400000.0,
                "annual_kwh_saved": 0.0,
                "annual_gas_saved_m3": 48000.0,
                "annual_cost_savings_bdt": 48000.0 * 30.75,
                "co2e_avoided_tco2e_per_year": (48000.0 * 1.984) / 1000.0,
                "lifespan_years": 10
            },
            {
                "id": "RET-03-INSUL",
                "name": "Aerogel Thermal Insulation on Steam Headers & Valves",
                "capex_bdt": 450000.0,
                "annual_kwh_saved": 0.0,
                "annual_gas_saved_m3": 22000.0,
                "annual_cost_savings_bdt": 22000.0 * 30.75,
                "co2e_avoided_tco2e_per_year": (22000.0 * 1.984) / 1000.0,
                "lifespan_years": 5
            },
            {
                "id": "RET-04-SOLAR",
                "name": "500 kWp Rooftop Grid-Tied Solar PV System",
                "capex_bdt": 38000000.0,
                "annual_kwh_saved": 680000.0,
                "annual_cost_savings_bdt": 680000.0 * 12.50,
                "co2e_avoided_tco2e_per_year": 680.0 * 0.62,
                "lifespan_years": 25
            },
            {
                "id": "RET-05-SERVO",
                "name": "Brushless Servo Motors on 200 Sewing Machines",
                "capex_bdt": 1200000.0,
                "annual_kwh_saved": 62000.0,
                "annual_cost_savings_bdt": 62000.0 * 11.20,
                "co2e_avoided_tco2e_per_year": 62.0 * 0.62,
                "lifespan_years": 7
            }
        ]

    @staticmethod
    def calculate_macc(
        discount_rate_pct: float = 10.0,
        interventions: Optional[List[Dict[str, Any]]] = None
    ) -> List[Dict[str, Any]]:
        """
        Computes Marginal Abatement Cost Curve (MACC) ranking.
        Net Present Cost per tCO2e Abated = (CAPEX - NPV(Annual OPEX Savings)) / Lifetime CO2e Avoided
        Negative MAC = Highly profitable investment (cost negative).
        """
        items = interventions or OptimizationEngine.get_retrofit_interventions()
        r = discount_rate_pct / 100.0
        macc_results = []

        for item in items:
            capex = item["capex_bdt"]
            annual_savings = item["annual_cost_savings_bdt"]
            years = item["lifespan_years"]
            annual_co2e = item["co2e_avoided_tco2e_per_year"]
            lifetime_co2e = annual_co2e * years

            # NPV of operational savings over lifespan
            # PV factor = (1 - (1+r)^(-n)) / r
            pv_factor = (1.0 - (1.0 + r)**(-years)) / r if r > 0 else years
            npv_savings = annual_savings * pv_factor
            net_cost_bdt = capex - npv_savings

            # Net cost per tonne CO2e avoided in BDT and USD (approx 1 USD = 120 BDT)
            mac_bdt_per_tco2e = net_cost_bdt / lifetime_co2e if lifetime_co2e > 0 else 0.0
            mac_usd_per_tco2e = mac_bdt_per_tco2e / 120.0

            # Simple payback in months
            payback_months = (capex / annual_savings * 12.0) if annual_savings > 0 else 999.0

            macc_results.append({
                "intervention_id": item["id"],
                "name": item["name"],
                "capex_bdt": capex,
                "annual_savings_bdt": annual_savings,
                "payback_months": round(payback_months, 1),
                "lifetime_years": years,
                "annual_tco2e_avoided": round(annual_co2e, 2),
                "lifetime_tco2e_avoided": round(lifetime_co2e, 2),
                "mac_usd_per_tco2e": round(mac_usd_per_tco2e, 2),
                "is_cost_negative": mac_usd_per_tco2e < 0.0,
                "data_quality": "simulated",
                "simulated_watermark": "SIMULATED DATA"
            })

        # Rank by MAC from lowest (most negative / profitable) to highest
        macc_results.sort(key=lambda x: x["mac_usd_per_tco2e"])
        return macc_results
