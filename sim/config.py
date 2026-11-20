"""
CarbonLoom Digital Twin Factory Simulator — Configuration
"""
from dataclasses import dataclass, field
from typing import Dict, List, Any
from datetime import datetime, date

@dataclass
class EmissionFactors:
    # Official Bangladesh DoE Grid Emission Factor (tCO2/MWh)
    DOE_GEF_2020_21: float = 0.62
    DOE_GEF_2019_20: float = 0.61
    
    # Joint Crediting Mechanism (JCM) Bangladesh conservative captive factors (tCO2/MWh or tCO2/GJ)
    JCM_NATURAL_GAS_CAPTIVE: float = 0.376  # tCO2/MWh equivalent
    JCM_DIESEL_GENSET: float = 0.533       # tCO2/MWh equivalent
    
    # Fuel specific factors (kgCO2e per unit)
    NATURAL_GAS_KG_PER_M3: float = 1.98     # approx kgCO2e / m3
    DIESEL_KG_PER_LITER: float = 2.68       # approx kgCO2e / L
    FURNACE_OIL_KG_PER_LITER: float = 3.12

@dataclass
class FactoryProfile:
    factory_id: str = "FAC-BD-DHK-001"
    name: str = "Apex Padma Textile & Apparels Ltd."
    location: str = "Gazipur Industrial Zone, Dhaka, Bangladesh"
    coordinates: tuple = (23.9999, 90.4203)
    sewing_lines: int = 12
    total_sewing_machines: int = 720
    daily_capacity_pieces: int = 35000
    grid_connection_kva: int = 2500
    contracted_peak_kw: float = 1800.0
    contracted_off_peak_kw: float = 1400.0

@dataclass
class EquipmentItem:
    equipment_id: str
    name: str
    category: str  # boiler, compressor, chiller, sewing_motor, dyeing, lighting
    rated_power_kw: float
    fuel_type: str  # electricity, natural_gas, diesel
    efficiency: float = 0.85
    meter_id: str = ""

def get_default_equipment() -> List[EquipmentItem]:
    items = [
        # Boilers
        EquipmentItem("BOILER-01", "Primary Fire-tube Steam Boiler (Gas)", "boiler", 1200.0, "natural_gas", 0.82, "MTR-STM-001"),
        EquipmentItem("BOILER-02", "Auxiliary Standby Steam Boiler (Diesel)", "boiler", 800.0, "diesel", 0.78, "MTR-STM-002"),
        
        # Air Compressors
        EquipmentItem("COMP-01", "Rotary Screw Air Compressor 1", "compressor", 110.0, "electricity", 0.90, "MTR-AIR-001"),
        EquipmentItem("COMP-02", "Rotary Screw Air Compressor 2", "compressor", 75.0, "electricity", 0.88, "MTR-AIR-002"),
        
        # Chillers / HVAC
        EquipmentItem("CHILL-01", "Water-Cooled Centrifugal Chiller 1", "chiller", 250.0, "electricity", 0.92, "MTR-HVAC-001"),
        EquipmentItem("CHILL-02", "Water-Cooled Centrifugal Chiller 2", "chiller", 250.0, "electricity", 0.92, "MTR-HVAC-002"),
        
        # Dyeing & Washing
        EquipmentItem("DYE-01", "High-Temperature High-Pressure Dyeing Vessel", "dyeing", 350.0, "natural_gas", 0.80, "MTR-DYE-001"),
        EquipmentItem("WASH-01", "Continuous Washing & Rinsing Range", "dyeing", 180.0, "electricity", 0.85, "MTR-WASH-001"),
        
        # Facility Lighting & General Power
        EquipmentItem("LIGHT-01", "Sewing Floor Lighting & Ventilation (LED)", "lighting", 65.0, "electricity", 0.95, "MTR-LGT-001"),
        EquipmentItem("LIGHT-02", "Warehouse & Perimeter Lighting", "lighting", 25.0, "electricity", 0.95, "MTR-LGT-002"),
    ]
    
    # 12 Sewing lines (grouped meters)
    for line_idx in range(1, 13):
        items.append(
            EquipmentItem(
                f"LINE-{line_idx:02d}",
                f"Sewing Line #{line_idx} (60 Servo Motor Stations)",
                "sewing_motor",
                45.0,
                "electricity",
                0.91,
                f"MTR-LINE-{line_idx:02d}"
            )
        )
    return items

# Monthly Dhaka Weather Climatology (Avg Temp C, Avg RH %)
DHAKA_WEATHER = {
    1: (18.5, 68),
    2: (22.3, 62),
    3: (27.4, 58),
    4: (30.1, 68),
    5: (30.5, 75),
    6: (29.8, 83),
    7: (29.3, 85),
    8: (29.4, 84),
    9: (29.1, 82),
    10: (27.8, 77),
    11: (24.1, 72),
    12: (19.8, 70),
}
