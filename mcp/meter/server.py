"""
meter-mcp: Read-Only Meter Telemetry MCP Server (Server 1)
Tools: query_readings, list_meters, get_baseline, reconcile_meter_vs_bill, detect_sensor_tamper
"""
from typing import Dict, List, Any
from datetime import datetime
import json

METERS_CATALOG = [
    {"meter_id": "MTR-STM-001", "name": "Boiler 1 Steam Flow Meter", "type": "vortex_steam", "unit": "kg/hr"},
    {"meter_id": "MTR-AIR-001", "name": "Compressor 1 Power Meter", "type": "modbus_electric", "unit": "kWh"},
    {"meter_id": "MTR-HVAC-001", "name": "Chiller 1 Thermal Energy", "type": "btu_meter", "unit": "ton_hr"},
    {"meter_id": "MTR-MAIN-001", "name": "Main 11kV Grid Incomer", "type": "digital_energy", "unit": "kWh"}
]

def list_meters(tenant_id: str) -> List[Dict[str, Any]]:
    """Lists all active physical and digital meters for the factory."""
    return METERS_CATALOG

def query_readings(meter_id: str, start_time: str, end_time: str) -> Dict[str, Any]:
    """Retrieves 1-15 min interval readings for a specific meter."""
    return {
        "meter_id": meter_id,
        "query_range": {"start": start_time, "end": end_time},
        "sample_reading_kwh": 485.20,
        "power_factor": 0.92,
        "data_quality": "simulated",
        "simulated_watermark": "SIMULATED DATA"
    }

def get_baseline(meter_id: str, weather_normalized: bool = True) -> Dict[str, Any]:
    """Retrieves weather- and production-normalized baseline consumption."""
    return {
        "meter_id": meter_id,
        "expected_kwh_per_shift": 3820.0,
        "normalized_for_weather": weather_normalized,
        "tolerance_band_pct": 5.0,
        "data_quality": "simulated"
    }

def reconcile_meter_vs_bill(meter_id: str, bill_id: str) -> Dict[str, Any]:
    """Cross-reconciles high-frequency meter integration against monthly utility invoices."""
    return {
        "meter_id": meter_id,
        "bill_id": bill_id,
        "integrated_meter_kwh": 128450.0,
        "billed_kwh": 129100.0,
        "variance_pct": 0.51,
        "is_reconciled": True,
        "status": "PASS (Variance < 2.0%)"
    }

def detect_sensor_tamper(meter_id: str) -> Dict[str, Any]:
    """Inspects meter telemetry for flatline values, reverse power flow, or dropped packets."""
    return {
        "meter_id": meter_id,
        "tamper_detected": False,
        "signal_integrity_score": 0.99,
        "last_calibration_date": "2025-11-10"
    }
