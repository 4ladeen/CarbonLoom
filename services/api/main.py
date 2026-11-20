"""
CarbonLoom Deterministic Carbon Accounting & Compliance API
FastAPI backend enforcing zero-LLM math, ISO 14064-1 allocation, and cryptographic lineage.
"""
from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List, Any, Optional

from services.api.core.emission_factors import list_emission_factors, get_emission_factor
from services.api.core.scope1 import Scope1Engine
from services.api.core.scope2 import Scope2Engine
from services.api.core.scope3 import Scope3Engine
from services.api.core.smv_allocator import SMVAllocationEngine
from services.api.core.optimizer import OptimizationEngine
from services.api.core.solar import SolarEngine
from services.api.core.reports import ReportExporter

app = FastAPI(
    title="CarbonLoom Deterministic Carbon Accounting Engine",
    description="Zero-LLM math, ISO 14064-1 SMV per-garment allocation & compliance engine.",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "CarbonLoom API Backend",
        "version": "2.0.0",
        "zero_llm_math_enforced": True,
        "radical_honesty_notice": "Outputs derived from simulator bear data_quality='simulated'"
    }

@app.get("/api/v1/factors")
def get_all_factors():
    """Retrieve all versioned emission factors."""
    return list_emission_factors()

@app.post("/api/v1/carbon/scope1")
def calculate_scope1(
    natural_gas_m3: float = Body(0.0),
    diesel_liters: float = Body(0.0),
    furnace_oil_liters: float = Body(0.0),
    refrigerant_r134a_kg: float = Body(0.0),
    refrigerant_r410a_kg: float = Body(0.0),
    data_quality: str = Body("simulated")
):
    """Calculate direct Scope 1 emissions using deterministic ISO 14064-1 equations."""
    return Scope1Engine.calculate(
        natural_gas_m3=natural_gas_m3,
        diesel_liters=diesel_liters,
        furnace_oil_liters=furnace_oil_liters,
        refrigerant_r134a_kg=refrigerant_r134a_kg,
        refrigerant_r410a_kg=refrigerant_r410a_kg,
        data_quality=data_quality
    )

@app.post("/api/v1/carbon/scope2")
def calculate_scope2(
    grid_consumption_kwh: float = Body(...),
    rooftop_solar_self_consumed_kwh: float = Body(0.0),
    factor_id: str = Body("DOE-GEF-2020-21"),
    data_quality: str = Body("simulated")
):
    """Calculate Scope 2 emissions under location-based and market-based dual reporting."""
    return Scope2Engine.calculate(
        grid_consumption_kwh=grid_consumption_kwh,
        rooftop_solar_self_consumed_kwh=rooftop_solar_self_consumed_kwh,
        factor_id=factor_id,
        data_quality=data_quality
    )

@app.post("/api/v1/carbon/allocate-smv")
def allocate_smv(
    total_scope1_tco2e: float = Body(...),
    total_scope2_tco2e: float = Body(...),
    total_scope3_tco2e: float = Body(0.0),
    orders: List[Dict[str, Any]] = Body(...),
    allocation_method: str = Body("smv_weighted"),
    data_quality: str = Body("simulated")
):
    """Allocate facility emissions to product orders using SMV work-content weighting."""
    return SMVAllocationEngine.allocate(
        total_scope1_tco2e=total_scope1_tco2e,
        total_scope2_tco2e=total_scope2_tco2e,
        total_scope3_tco2e=total_scope3_tco2e,
        orders=orders,
        allocation_method=allocation_method,
        data_quality=data_quality
    )

@app.post("/api/v1/optimization/cbam-simulate")
def simulate_cbam(
    export_tonnage: float = Body(...),
    actual_embedded_tco2e_per_tonne: float = Body(...),
    default_benchmark_tco2e_per_tonne: float = Body(2.15),
    eu_ets_price_eur: float = Body(75.32)
):
    """Simulate EU CBAM tariff liability: Verified actual vs default marked-up values."""
    return OptimizationEngine.calculate_cbam_liability(
        export_tonnage=export_tonnage,
        actual_embedded_tco2e_per_tonne=actual_embedded_tco2e_per_tonne,
        default_benchmark_tco2e_per_tonne=default_benchmark_tco2e_per_tonne,
        eu_ets_price_eur_per_tco2e=eu_ets_price_eur
    )

@app.get("/api/v1/optimization/macc")
def get_macc_curve(discount_rate_pct: float = Query(10.0)):
    """Retrieve Marginal Abatement Cost Curve (MACC) ranked interventions."""
    return OptimizationEngine.calculate_macc(discount_rate_pct=discount_rate_pct)

@app.post("/api/v1/optimization/solar-size")
def size_solar(usable_roof_area_m2: float = Body(...)):
    """Estimate rooftop solar PV capacity and annual generation using NASA POWER irradiance."""
    return SolarEngine.size_rooftop_system(usable_roof_area_m2=usable_roof_area_m2)
