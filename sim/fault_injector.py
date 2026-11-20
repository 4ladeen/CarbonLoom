"""
CarbonLoom Digital Twin Factory Simulator — Fault Injector
Injects 4 labeled ground-truth faults into simulation data.
"""
from dataclasses import dataclass
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta

@dataclass
class InjectedFault:
    fault_id: str
    fault_type: str  # steam_trap_leak, compressed_air_leak, night_idle_drift, falsified_diesel_challan
    equipment_id: str
    start_time: datetime
    end_time: datetime
    severity: float  # Fraction increase or discrepancy (e.g. 0.15 for +15%)
    ground_truth_label: bool = True
    description: str = ""

class FaultManager:
    """Manages scheduling and evaluation of ground-truth faults during simulation."""

    def __init__(self, base_start: datetime):
        self.base_start = base_start
        self.faults: List[InjectedFault] = self._init_standard_faults()

    def _init_standard_faults(self) -> List[InjectedFault]:
        return [
            # Fault 1: Steam-trap leak on BOILER-01 starting on Day 14 for 5 days (+12% steam fuel consumption)
            InjectedFault(
                fault_id="FAULT-STM-001",
                fault_type="steam_trap_leak",
                equipment_id="BOILER-01",
                start_time=self.base_start + timedelta(days=14),
                end_time=self.base_start + timedelta(days=19),
                severity=0.12,
                description="Failed-open thermodynamic steam trap on Line 3 header causing continuous steam loss"
            ),
            # Fault 2: Compressed-air leak on COMP-01 starting on Day 25 for 7 days (+18% compressor runtime)
            InjectedFault(
                fault_id="FAULT-AIR-001",
                fault_type="compressed_air_leak",
                equipment_id="COMP-01",
                start_time=self.base_start + timedelta(days=25),
                end_time=self.base_start + timedelta(days=32),
                severity=0.18,
                description="Ruptured pneumatic fitting on finishing line causing 18% continuous unloader bypass"
            ),
            # Fault 3: Night idle-load drift on Facility Lighting & Line Motors starting Day 40 for 10 days (+8% night baseload)
            InjectedFault(
                fault_id="FAULT-IDL-001",
                fault_type="night_idle_drift",
                equipment_id="LIGHT-01",
                start_time=self.base_start + timedelta(days=40),
                end_time=self.base_start + timedelta(days=50),
                severity=0.08,
                description="Exhaust fans and sewing line lighting left energized throughout 10pm-6am maintenance shift"
            ),
            # Fault 4: Falsified Diesel Challan on BOILER-02/Genset at Day 60 (reported 25% less fuel than telemetry proves)
            InjectedFault(
                fault_id="FAULT-DSL-001",
                fault_type="falsified_diesel_challan",
                equipment_id="BOILER-02",
                start_time=self.base_start + timedelta(days=60),
                end_time=self.base_start + timedelta(days=65),
                severity=0.25,
                description="Vendor delivery challan recorded 1,200L delivered but genset kWh output proved 1,600L consumed"
            ),
        ]

    def get_active_multiplier(self, equipment_id: str, current_time: datetime, fault_type: Optional[str] = None) -> float:
        """Returns the multiplier to apply to equipment consumption. 1.0 = normal operation."""
        multiplier = 1.0
        for f in self.faults:
            if f.equipment_id == equipment_id and f.start_time <= current_time <= f.end_time:
                if fault_type is None or f.fault_type == fault_type:
                    # In case of multiple faults, compound severity
                    multiplier += f.severity
        return multiplier

    def check_active_fault(self, equipment_id: str, current_time: datetime) -> Optional[InjectedFault]:
        """Returns the active fault if any for ground truth annotation."""
        for f in self.faults:
            if f.equipment_id == equipment_id and f.start_time <= current_time <= f.end_time:
                return f
        return None
