# CarbonLoom — Digital Twin Factory Simulator

**Status:** `[Implemented]`  
**Purpose:** Generates high-fidelity, reproducible synthetic industrial telemetry, bilingual utility bills, and ERP production runs with 4 labeled ground-truth faults.

## Features
- **Equipment Inventory**: Boilers (gas/diesel), screw air compressors, centrifugal chillers, 12 sewing lines (720 machines), dyeing vessels, and facility lighting.
- **Operating Shifts**: 3 industrial shifts (Morning, Evening, Night) with Friday reduced maintenance schedules.
- **Weather Climatology**: Dhaka diurnal temperature and humidity cycles affecting chiller/compressor loads.
- **Ground-Truth Fault Injection**:
  1. *Steam-trap leak*: Gradual excess steam consumption on BOILER-01 (+12%).
  2. *Compressed-air leak*: Continuous compressor runtime on COMP-01 (+18%).
  3. *Night idle-load drift*: Unauthorized night equipment operation (+8%).
  4. *Falsified diesel challan*: Invoice claims 25% less fuel than live machine output proves.
- **Strict Radical Honesty**: Every single generated output contains `data_quality: "simulated"` and the `SIMULATED DATA` watermark.

## Quickstart
```bash
# Run simulator for 3 days and generate sample files
python -m sim.data_generator

# Run test suite
pytest sim/tests/ -v
```
