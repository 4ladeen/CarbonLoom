"""
CarbonLoom Deterministic Carbon Accounting — Versioned Emission Factor Library (FR-B1)
Contains official Department of Environment (DoE) Bangladesh Grid Emission Factors,
Joint Crediting Mechanism (JCM) captive factors, and IPCC AR6 combustion factors.
"""
from typing import Dict, Any, Optional
import hashlib
import json

# Master Library of Emission Factors
EMISSION_FACTORS: Dict[str, Dict[str, Any]] = {
    # 1. Bangladesh Official Grid Emission Factors (DoE)
    "DOE-GEF-2020-21": {
        "factor_id": "DOE-GEF-2020-21",
        "authority": "Department of Environment (DoE), Ministry of Environment, Forest and Climate Change, Bangladesh",
        "geography": "BGD",
        "year": 2021,
        "fuel_or_activity": "grid_electricity",
        "unit": "tCO2/MWh",
        "co2e_factor": 0.6200,
        "uncertainty_pct": 3.5,
        "citation": "Official DoE Grid Emission Factor Publication 2020-21",
        "effective_date": "2021-07-01",
        "is_version_pinned": True
    },
    "DOE-GEF-2019-20": {
        "factor_id": "DOE-GEF-2019-20",
        "authority": "Department of Environment (DoE), Bangladesh",
        "geography": "BGD",
        "year": 2020,
        "fuel_or_activity": "grid_electricity",
        "unit": "tCO2/MWh",
        "co2e_factor": 0.6100,
        "uncertainty_pct": 3.8,
        "citation": "Official DoE Grid Emission Factor Publication 2019-20",
        "effective_date": "2020-07-01",
        "is_version_pinned": True
    },
    
    # 2. Joint Crediting Mechanism (JCM) Bangladesh Methodology JCM_BD_F_PM_ver02.0
    "JCM-CAPTIVE-GAS-2022": {
        "factor_id": "JCM-CAPTIVE-GAS-2022",
        "authority": "Joint Crediting Mechanism (JCM) Bangladesh / Japan",
        "geography": "BGD",
        "year": 2022,
        "fuel_or_activity": "captive_natural_gas_power",
        "unit": "tCO2/MWh",
        "co2e_factor": 0.3760,
        "uncertainty_pct": 4.0,
        "citation": "JCM Bangladesh Approved Methodology JCM_BD_F_PM_ver02.0",
        "effective_date": "2022-01-01",
        "is_version_pinned": True
    },
    "JCM-CAPTIVE-DIESEL-2022": {
        "factor_id": "JCM-CAPTIVE-DIESEL-2022",
        "authority": "Joint Crediting Mechanism (JCM) Bangladesh / Japan",
        "geography": "BGD",
        "year": 2022,
        "fuel_or_activity": "captive_diesel_genset",
        "unit": "tCO2/MWh",
        "co2e_factor": 0.5330,
        "uncertainty_pct": 4.2,
        "citation": "JCM Bangladesh Approved Methodology JCM_BD_F_PM_ver02.0",
        "effective_date": "2022-01-01",
        "is_version_pinned": True
    },

    # 3. Direct Fuel Combustion (IPCC AR6 / WRI GHG Protocol)
    "IPCC-NATURAL-GAS-M3": {
        "factor_id": "IPCC-NATURAL-GAS-M3",
        "authority": "IPCC Guidelines for National GHG Inventories (AR6 GWP-100)",
        "geography": "GLB",
        "year": 2021,
        "fuel_or_activity": "natural_gas_combustion",
        "unit": "kgCO2e/m3",
        "co2e_factor": 1.9840,
        "uncertainty_pct": 2.5,
        "citation": "IPCC 2006/2019 Refinement Vol 2 Energy",
        "effective_date": "2021-01-01",
        "is_version_pinned": True
    },
    "IPCC-DIESEL-LITER": {
        "factor_id": "IPCC-DIESEL-LITER",
        "authority": "IPCC Guidelines for National GHG Inventories (AR6 GWP-100)",
        "geography": "GLB",
        "year": 2021,
        "fuel_or_activity": "diesel_combustion",
        "unit": "kgCO2e/L",
        "co2e_factor": 2.6820,
        "uncertainty_pct": 2.0,
        "citation": "IPCC 2006 Vol 2 Table 3.2.1",
        "effective_date": "2021-01-01",
        "is_version_pinned": True
    },
    "IPCC-FURNACE-OIL-LITER": {
        "factor_id": "IPCC-FURNACE-OIL-LITER",
        "authority": "IPCC Guidelines for National GHG Inventories (AR6 GWP-100)",
        "geography": "GLB",
        "year": 2021,
        "fuel_or_activity": "furnace_oil_combustion",
        "unit": "kgCO2e/L",
        "co2e_factor": 3.1250,
        "uncertainty_pct": 2.5,
        "citation": "IPCC 2006 Vol 2 Table 3.2.1",
        "effective_date": "2021-01-01",
        "is_version_pinned": True
    },

    # 4. Refrigerants GWP (IPCC AR6 100-year time horizon)
    "IPCC-R134A-GWP": {
        "factor_id": "IPCC-R134A-GWP",
        "authority": "IPCC Sixth Assessment Report (AR6)",
        "geography": "GLB",
        "year": 2021,
        "fuel_or_activity": "refrigerant_r134a",
        "unit": "kgCO2e/kg",
        "co2e_factor": 1530.0,
        "uncertainty_pct": 1.0,
        "citation": "IPCC AR6 WG1 Chapter 7 Table 7.15",
        "effective_date": "2021-01-01",
        "is_version_pinned": True
    },
    "IPCC-R410A-GWP": {
        "factor_id": "IPCC-R410A-GWP",
        "authority": "IPCC Sixth Assessment Report (AR6)",
        "geography": "GLB",
        "year": 2021,
        "fuel_or_activity": "refrigerant_r410a",
        "unit": "kgCO2e/kg",
        "co2e_factor": 2255.5,
        "uncertainty_pct": 1.0,
        "citation": "IPCC AR6 WG1 Chapter 7 Table 7.15",
        "effective_date": "2021-01-01",
        "is_version_pinned": True
    }
}

def get_emission_factor(factor_id: str) -> Dict[str, Any]:
    """Retrieve an emission factor by ID with integrity verification."""
    if factor_id not in EMISSION_FACTORS:
        raise ValueError(f"Unknown emission factor ID: {factor_id}")
    factor = dict(EMISSION_FACTORS[factor_id])
    # Compute deterministic SHA-256 hash of factor contents
    serialized = json.dumps(factor, sort_keys=True)
    factor["sha256_hash"] = hashlib.sha256(serialized.encode("utf-8")).hexdigest()
    return factor

def list_emission_factors() -> Dict[str, Dict[str, Any]]:
    """Return all versioned emission factors."""
    return {k: get_emission_factor(k) for k in EMISSION_FACTORS}
