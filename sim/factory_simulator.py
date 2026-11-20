"""
CarbonLoom Digital Twin Factory Simulator — Core Engine
Simulates a mid-size Bangladeshi export apparel factory with ground-truth faults.
"""
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import random
import math

from sim.config import (
    FactoryProfile, EquipmentItem, EmissionFactors,
    get_default_equipment, DHAKA_WEATHER
)
from sim.fault_injector import FaultManager, InjectedFault
from sim.bill_generator import BilingualBillGenerator

class FactorySimulator:
    """Simulates realistic factory operations, telemetry, and emissions."""

    def __init__(
        self,
        factory_profile: Optional[FactoryProfile] = None,
        start_date: Optional[datetime] = None,
        duration_days: int = 90,
        random_seed: int = 42
    ):
        random.seed(random_seed)
        self.profile = factory_profile or FactoryProfile()
        self.start_date = start_date or datetime(2026, 1, 1, 0, 0, 0)
        self.duration_days = duration_days
        self.equipment = get_default_equipment()
        self.fault_manager = FaultManager(self.start_date)
        self.bill_generator = BilingualBillGenerator(factory_id=self.profile.factory_id)

    def _get_shift_factor(self, dt: datetime) -> float:
        """Returns the activity multiplier based on time and day of week."""
        # 4 is Friday in Python datetime.weekday() (0=Monday, 6=Sunday)
        is_friday = dt.weekday() == 4
        hour = dt.hour

        if is_friday:
            # Friday is weekend / half maintenance shift in Bangladesh
            return 0.15 if 8 <= hour <= 14 else 0.05

        # Normal working days (Sat-Thu):
        # Shift 1 (Morning): 06:00 - 14:00 (100% capacity)
        if 6 <= hour < 14:
            return 1.00
        # Shift 2 (Evening): 14:00 - 22:00 (90% capacity)
        elif 14 <= hour < 22:
            return 0.90
        # Shift 3 (Night): 22:00 - 06:00 (Baseload maintenance & washing)
        else:
            return 0.20

    def _get_weather(self, dt: datetime) -> tuple[float, float]:
        """Returns ambient temperature (C) and humidity (%) for Dhaka."""
        month = dt.month
        base_temp, base_rh = DHAKA_WEATHER.get(month, (26.0, 75.0))
        # Diurnal temperature cycle: coolest at 5am, warmest at 2pm
        diurnal_shift = 4.5 * math.sin((dt.hour - 8) * math.pi / 12)
        temp = base_temp + diurnal_shift + random.uniform(-0.5, 0.5)
        # Inverse humidity cycle
        rh = max(40.0, min(95.0, base_rh - (diurnal_shift * 1.5) + random.uniform(-2.0, 2.0)))
        return round(temp, 2), round(rh, 1)

    def simulate_telemetry_step(self, current_time: datetime, interval_minutes: int = 15) -> List[Dict[str, Any]]:
        """Simulate one time step for all equipment meters."""
        shift_factor = self._get_shift_factor(current_time)
        temp_c, rh_pct = self._get_weather(current_time)
        readings = []

        for eq in self.equipment:
            # Base electrical or thermal power
            base_kw = eq.rated_power_kw * shift_factor * random.uniform(0.92, 1.05)
            
            # Weather adjustment for chillers and air compressors
            if eq.category == "chiller":
                # High ambient temperature increases chiller heat lift
                temp_factor = 1.0 + max(0.0, (temp_c - 25.0) * 0.02)
                base_kw *= temp_factor
            elif eq.category == "compressor":
                # High ambient humidity increases moisture load and unloader runtime
                rh_factor = 1.0 + max(0.0, (rh_pct - 65.0) * 0.003)
                base_kw *= rh_factor

            # Apply ground-truth fault multipliers if any
            multiplier = self.fault_manager.get_active_multiplier(eq.equipment_id, current_time)
            effective_kw = base_kw * multiplier

            # Convert kW to energy (kWh or equivalent) in this time step
            kwh = effective_kw * (interval_minutes / 60.0)

            # Check if this reading contains a ground-truth fault
            active_fault = self.fault_manager.check_active_fault(eq.equipment_id, current_time)

            readings.append({
                "timestamp": current_time.isoformat(),
                "meter_id": eq.meter_id,
                "equipment_id": eq.equipment_id,
                "equipment_name": eq.name,
                "category": eq.category,
                "fuel_type": eq.fuel_type,
                "interval_minutes": interval_minutes,
                "active_power_kw": round(effective_kw, 3),
                "energy_consumed": round(kwh, 4),
                "ambient_temp_c": temp_c,
                "ambient_rh_pct": rh_pct,
                "power_factor": round(random.uniform(0.88, 0.94), 3),
                "fault_injected": active_fault is not None,
                "fault_type": active_fault.fault_type if active_fault else None,
                "data_quality": "simulated",
                "simulated_watermark": "SIMULATED DATA"
            })

        return readings

    def generate_orders_and_production(self) -> List[Dict[str, Any]]:
        """Generates realistic export Purchase Orders and SMV specifications."""
        orders = [
            {
                "order_id": "PO-EU-HM-2026-01",
                "buyer": "H&M Group Sweden",
                "style_ref": "STYLE-TSHIRT-CREW-100COTTON",
                "garment_type": "Crewneck T-Shirt (Single Jersey)",
                "pieces_ordered": 25000,
                "pieces_produced": 25240,
                "smv_minutes": 4.25,
                "fabric_weight_kg_per_piece": 0.165,
                "target_threshold_kgco2_per_piece": 2.10,
                "data_quality": "simulated",
                "simulated_watermark": "SIMULATED DATA"
            },
            {
                "order_id": "PO-EU-ZARA-2026-04",
                "buyer": "Inditex (Zara) Spain",
                "style_ref": "STYLE-HOODIE-FLEECE-BLEND",
                "garment_type": "Brushed Fleece Pullover Hoodie",
                "pieces_ordered": 12000,
                "pieces_produced": 12080,
                "smv_minutes": 11.50,
                "fabric_weight_kg_per_piece": 0.480,
                "target_threshold_kgco2_per_piece": 5.80,
                "data_quality": "simulated",
                "simulated_watermark": "SIMULATED DATA"
            },
            {
                "order_id": "PO-EU-MS-2026-09",
                "buyer": "Marks & Spencer UK",
                "style_ref": "STYLE-POLO-PIQUE-REGULAR",
                "garment_type": "Cotton Pique Short-sleeve Polo",
                "pieces_ordered": 18000,
                "pieces_produced": 18150,
                "smv_minutes": 7.80,
                "fabric_weight_kg_per_piece": 0.240,
                "target_threshold_kgco2_per_piece": 3.40,
                "data_quality": "simulated",
                "simulated_watermark": "SIMULATED DATA"
            },
            {
                "order_id": "PO-EU-PVH-2026-11",
                "buyer": "PVH (Tommy Hilfiger)",
                "style_ref": "STYLE-DENIM-CHINO-STRETCH",
                "garment_type": "Stretch Twill Chino Trouser",
                "pieces_ordered": 8000,
                "pieces_produced": 8020,
                "smv_minutes": 14.20,
                "fabric_weight_kg_per_piece": 0.550,
                "target_threshold_kgco2_per_piece": 6.90,
                "data_quality": "simulated",
                "simulated_watermark": "SIMULATED DATA"
            }
        ]
        return orders
