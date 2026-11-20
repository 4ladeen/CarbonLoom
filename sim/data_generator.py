"""
CarbonLoom Digital Twin Factory Simulator — Data Generator Runner
Runs simulation across configured time horizon, emits telemetry batches and monthly utility bills.
"""
from typing import Dict, List, Any
from datetime import datetime, timedelta
import json
import os

from sim.factory_simulator import FactorySimulator
from sim.config import FactoryProfile

def run_simulation(
    days: int = 14,
    interval_minutes: int = 15,
    output_dir: str = "sim/output"
) -> Dict[str, Any]:
    """Runs the factory simulation and writes outputs to disk."""
    os.makedirs(output_dir, exist_ok=True)
    sim = FactorySimulator(duration_days=days)
    
    current_time = sim.start_date
    end_time = sim.start_date + timedelta(days=days)
    all_readings: List[Dict[str, Any]] = []

    print(f"Starting simulation from {current_time} to {end_time} ({days} days)...")
    
    # Generate telemetry steps
    while current_time < end_time:
        step_readings = sim.simulate_telemetry_step(current_time, interval_minutes)
        all_readings.extend(step_readings)
        current_time += timedelta(minutes=interval_minutes)

    # Aggregate monthly totals for bills
    total_grid_kwh = sum(
        r["energy_consumed"] for r in all_readings
        if r["fuel_type"] == "electricity"
    )
    total_gas_kwh = sum(
        r["energy_consumed"] for r in all_readings
        if r["fuel_type"] == "natural_gas"
    )
    # Gas: approx 10.5 kWh per m3
    gas_m3 = total_gas_kwh / 10.5

    # Generate bills
    desco_bill = sim.bill_generator.generate_desco_bill(
        month=1,
        year=2026,
        peak_kwh=total_grid_kwh * 0.42,
        off_peak_kwh=total_grid_kwh * 0.58,
        total_kwh=total_grid_kwh
    )
    
    titas_bill = sim.bill_generator.generate_titas_bill(
        month=1,
        year=2026,
        consumption_m3=gas_m3
    )
    
    diesel_challan = sim.bill_generator.generate_diesel_challan(
        date_str="2026-01-15",
        liters_delivered=1600.0,
        falsified_ratio=0.25 # Demonstrates Fault 4
    )

    orders = sim.generate_orders_and_production()

    # Save summary files
    telemetry_path = os.path.join(output_dir, "telemetry_sample.json")
    with open(telemetry_path, "w", encoding="utf-8") as f:
        # Save first 1000 records as sample
        json.dump(all_readings[:1000], f, indent=2, ensure_ascii=False)

    bills_path = os.path.join(output_dir, "bills_sample.json")
    with open(bills_path, "w", encoding="utf-8") as f:
        json.dump({
            "desco_bill": desco_bill,
            "titas_bill": titas_bill,
            "diesel_challan": diesel_challan
        }, f, indent=2, ensure_ascii=False)

    orders_path = os.path.join(output_dir, "orders.json")
    with open(orders_path, "w", encoding="utf-8") as f:
        json.dump(orders, f, indent=2, ensure_ascii=False)

    print(f"Generated {len(all_readings)} telemetry readings, 3 utility documents, and {len(orders)} orders.")
    return {
        "total_readings": len(all_readings),
        "total_grid_kwh": total_grid_kwh,
        "total_gas_m3": gas_m3,
        "telemetry_file": telemetry_path,
        "bills_file": bills_path,
        "orders_file": orders_path
    }

if __name__ == "__main__":
    run_simulation(days=3)
