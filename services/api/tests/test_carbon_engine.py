"""
CarbonLoom Deterministic Carbon Accounting — Unit Test Suite
Evaluates calculations against hand-verified benchmarks with 0.00% tolerance.
"""
import pytest
from services.api.core.emission_factors import get_emission_factor
from services.api.core.scope1 import Scope1Engine
from services.api.core.scope2 import Scope2Engine
from services.api.core.scope3 import Scope3Engine
from services.api.core.smv_allocator import SMVAllocationEngine
from services.api.core.lineage import CalculationLineage
from services.api.core.optimizer import OptimizationEngine
from services.api.core.solar import SolarEngine

def test_scope1_exact_math():
    """Verify Scope 1 gas and diesel combustion against known hand-calculated values."""
    # Inputs:
    # 10,000 m3 natural gas * 1.9840 kgCO2e/m3 = 19,840.0 kgCO2e
    # 2,000 L diesel * 2.6820 kgCO2e/L = 5,364.0 kgCO2e
    # Total = 25,204.0 kgCO2e = 25.204 tCO2e
    result = Scope1Engine.calculate(
        natural_gas_m3=10000.0,
        diesel_liters=2000.0,
        furnace_oil_liters=0.0
    )
    
    assert result["components_kgco2e"]["natural_gas"] == 19840.0
    assert result["components_kgco2e"]["diesel"] == 5364.0
    assert result["total_tco2e"]["value"] == 25.204
    assert result["total_tco2e"]["data_quality"] == "simulated"
    assert result["total_tco2e"]["simulated_watermark"] == "SIMULATED DATA"
    
    # Lineage must be present and valid
    assert CalculationLineage.verify_node(result["lineage"]) is True

def test_scope2_exact_math():
    """Verify Scope 2 location-based electricity against Bangladesh DoE factor."""
    # 50,000 kWh = 50 MWh * 0.6200 tCO2/MWh = 31.000 tCO2e
    result = Scope2Engine.calculate(
        grid_consumption_kwh=50000.0,
        rooftop_solar_self_consumed_kwh=10000.0, # 10 MWh displaced = 6.2 tCO2 avoided
        factor_id="DOE-GEF-2020-21"
    )
    
    assert result["location_based_tco2e"]["value"] == 31.0
    assert result["solar_avoided_tco2e"]["value"] == 6.2
    assert CalculationLineage.verify_node(result["lineage"]) is True

def test_smv_allocator_hierarchy_and_conservation():
    """Verify that per-order allocated emissions sum exactly to total facility emissions."""
    orders = [
        {
            "order_id": "ORD-01",
            "pieces_produced": 10000,
            "smv_minutes": 5.0, # 50,000 SMV-min
            "target_threshold_kgco2_per_piece": 2.50
        },
        {
            "order_id": "ORD-02",
            "pieces_produced": 5000,
            "smv_minutes": 10.0, # 50,000 SMV-min
            "target_threshold_kgco2_per_piece": 5.00
        }
    ]
    # Total SMV-min = 100,000. Each order has exactly 50% allocation weight.
    s1 = 20.0
    s2 = 30.0
    total_fac = s1 + s2 # 50.0 tCO2e
    
    alloc_res = SMVAllocationEngine.allocate(
        total_scope1_tco2e=s1,
        total_scope2_tco2e=s2,
        total_scope3_tco2e=0.0,
        orders=orders
    )
    
    allocated_orders = alloc_res["allocated_orders"]
    assert len(allocated_orders) == 2
    
    # Check 50% split
    assert allocated_orders[0]["allocation_weight"] == 0.5
    assert allocated_orders[1]["allocation_weight"] == 0.5
    
    # Check exact sum conservation
    sum_allocated = sum(o["total_allocated_tco2e"] for o in allocated_orders)
    assert abs(sum_allocated - total_fac) < 1e-9
    
    # Check per-garment emissions:
    # ORD-01: 25 tCO2e / 10,000 pieces = 2.5 kgCO2e / piece (compliant with 2.50 threshold)
    assert allocated_orders[0]["emissions_per_garment_kgco2e"]["value"] == 2.5
    assert allocated_orders[0]["is_compliant"] is True

def test_cbam_liability_simulation():
    """Verify EU CBAM tariff savings calculation."""
    # 100 tonnes export
    # Actual verified: 0.85 tCO2e / t
    # Default benchmark: 2.15 tCO2e / t
    # EU ETS price: 75.0 EUR/t
    res = OptimizationEngine.calculate_cbam_liability(
        export_tonnage=100.0,
        actual_embedded_tco2e_per_tonne=0.85,
        default_benchmark_tco2e_per_tonne=2.15,
        eu_ets_price_eur_per_tco2e=75.0
    )
    
    # Default liability = 100 * 2.15 * 75 = 16,125 EUR
    # Actual liability = 100 * 0.85 * 75 = 6,375 EUR
    # Savings = 9,750 EUR
    assert res["default_benchmark_pathway"]["cbam_liability_eur"] == 16125.0
    assert res["actual_pathway"]["cbam_liability_eur"] == 6375.0
    assert res["cbam_tariff_avoidance_savings_eur"] == 9750.0

def test_solar_sizing_engine():
    """Verify rooftop solar sizing produces non-zero physically consistent generation."""
    solar = SolarEngine.size_rooftop_system(usable_roof_area_m2=2000.0)
    assert solar["system_capacity_kwp"] > 0
    assert solar["estimated_annual_generation_kwh"] > 0
    assert solar["annual_avoided_scope2_tco2e"] > 0
    assert solar["data_quality"] == "simulated"
