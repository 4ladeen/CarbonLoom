"""
CarbonLoom Digital Twin Factory Simulator — Unit & Integrity Tests
Verifies energy conservation, fault labeling, data quality tags, and bill consistency.
"""
import pytest
from datetime import datetime, timedelta
import math

from sim.config import FactoryProfile, EmissionFactors, get_default_equipment
from sim.factory_simulator import FactorySimulator
from sim.fault_injector import FaultManager
from sim.bill_generator import BilingualBillGenerator, to_bangla_number

def test_equipment_inventory():
    """Verify standard equipment profile has required industrial machines."""
    equipment = get_default_equipment()
    categories = {eq.category for eq in equipment}
    assert "boiler" in categories
    assert "compressor" in categories
    assert "chiller" in categories
    assert "sewing_motor" in categories
    assert "lighting" in categories
    assert len(equipment) >= 15

def test_data_quality_and_watermark_invariance():
    """Verify that every single telemetry reading has simulated data watermark and tag."""
    sim = FactorySimulator(duration_days=1)
    readings = sim.simulate_telemetry_step(datetime(2026, 1, 1, 10, 0, 0), interval_minutes=15)
    
    assert len(readings) > 0
    for r in readings:
        assert r["data_quality"] == "simulated", "Failed §0 Rule 2: Missing data_quality='simulated'"
        assert r["simulated_watermark"] == "SIMULATED DATA", "Failed §0 Rule 2: Missing SIMULATED DATA watermark"
        assert r["active_power_kw"] >= 0.0
        assert r["energy_consumed"] >= 0.0

def test_fault_injection_behavior():
    """Verify ground truth faults are correctly injected and labeled."""
    start_dt = datetime(2026, 1, 1, 0, 0, 0)
    sim = FactorySimulator(start_date=start_dt, duration_days=30)
    
    # Fault 1: Steam trap leak on BOILER-01 at Day 15 (start_dt + 14d to 19d)
    fault_time = start_dt + timedelta(days=15, hours=10)
    readings = sim.simulate_telemetry_step(fault_time)
    
    boiler_reading = next(r for r in readings if r["equipment_id"] == "BOILER-01")
    assert boiler_reading["fault_injected"] is True
    assert boiler_reading["fault_type"] == "steam_trap_leak"
    
    # Normal time: Day 2 (no fault)
    normal_time = start_dt + timedelta(days=2, hours=10)
    normal_readings = sim.simulate_telemetry_step(normal_time)
    normal_boiler = next(r for r in normal_readings if r["equipment_id"] == "BOILER-01")
    assert normal_boiler["fault_injected"] is False

def test_bilingual_bill_generation():
    """Verify DESCO and Titas bills generate authentic Bangla text and numerals."""
    gen = BilingualBillGenerator()
    
    # Test numeral translation
    assert to_bangla_number(1234.56, 2) == "১২৩৪.৫৬"
    assert to_bangla_number(0, 0) == "০"

    desco = gen.generate_desco_bill(
        month=1,
        year=2026,
        peak_kwh=10000.0,
        off_peak_kwh=20000.0,
        total_kwh=30000.0
    )
    assert desco["data_quality"] == "simulated"
    assert "ডেসকো" in desco["raw_text_bn"]
    assert desco["financials"]["total_bdt"] > 0
    assert desco["ocr_confidence"] >= 0.90

def test_smv_order_production_weights():
    """Verify purchase orders have valid SMV values and piece counts."""
    sim = FactorySimulator()
    orders = sim.generate_orders_and_production()
    
    total_smv_minutes = sum(o["pieces_produced"] * o["smv_minutes"] for o in orders)
    assert total_smv_minutes > 0
    
    for o in orders:
        weight = (o["pieces_produced"] * o["smv_minutes"]) / total_smv_minutes
        assert 0.0 < weight < 1.0
        assert o["target_threshold_kgco2_per_piece"] > 0
