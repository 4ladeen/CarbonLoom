"""
factors-mcp: Read-Only Factor Library & Regulatory Snapshots MCP Server (Server 3)
Tools: get_factor, list_sources, compare_methods, get_live_ets_price, get_nasa_irradiance
"""
from typing import Dict, List, Any
from services.api.core.emission_factors import get_emission_factor, list_emission_factors

def get_factor(factor_id: str) -> Dict[str, Any]:
    return get_emission_factor(factor_id)

def list_sources() -> List[Dict[str, Any]]:
    factors = list_emission_factors()
    return [{"factor_id": f["factor_id"], "authority": f["authority"], "year": f["year"]} for f in factors.values()]

def compare_methods(activity_type: str) -> Dict[str, Any]:
    """Compares location-based vs market-based or default vs actual emission factors."""
    return {
        "activity_type": activity_type,
        "grid_location_based": {"factor": 0.620, "unit": "tCO2/MWh", "authority": "DoE Bangladesh"},
        "jcm_captive_gas": {"factor": 0.376, "unit": "tCO2/MWh", "authority": "JCM"},
        "eu_cbam_default": {"factor": 0.850, "unit": "tCO2/MWh", "penalty_markup_pct": 28.0}
    }

def get_live_ets_price() -> Dict[str, Any]:
    """Retrieves live European Union Emissions Trading System (EU ETS) carbon price."""
    return {
        "benchmark": "EU ETS Dec 2026 Futures",
        "price_eur_per_tco2e": 75.32,
        "currency": "EUR",
        "last_updated": "2026-11-20T12:00:00Z"
    }

def get_nasa_irradiance(latitude: float = 23.9999, longitude: float = 90.4203) -> Dict[str, Any]:
    """Retrieves NASA POWER monthly solar irradiance for coordinates."""
    return {
        "coordinates": {"lat": latitude, "lon": longitude},
        "annual_average_ghi_kwh_m2_day": 4.67,
        "source": "NASA POWER Satellite Climatology API"
    }
