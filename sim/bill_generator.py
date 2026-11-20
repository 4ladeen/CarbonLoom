"""
CarbonLoom Digital Twin Factory Simulator — Bilingual Bill Generator
Generates realistic DESCO electricity, Titas Gas, and Diesel fuel delivery challans
with authentic Bangla numerals, tariff codes, and confidence queues.
"""
from typing import Dict, Any, List
from datetime import datetime
import random

# Mapping Western Arabic numerals to Eastern Bangla numerals
BANGLA_DIGITS = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯', '.': '.'
}

def to_bangla_number(num: float, decimals: int = 2) -> str:
    """Convert a float/int to Bengali numerals."""
    s = f"{num:.{decimals}f}" if decimals > 0 else f"{int(num)}"
    return "".join(BANGLA_DIGITS.get(c, c) for c in s)

class BilingualBillGenerator:
    """Generates synthetic utility bills mimicking Dhaka distribution companies."""

    def __init__(self, tenant_id: str = "T-001", factory_id: str = "FAC-BD-DHK-001"):
        self.tenant_id = tenant_id
        self.factory_id = factory_id

    def generate_desco_bill(
        self,
        month: int,
        year: int,
        peak_kwh: float,
        off_peak_kwh: float,
        total_kwh: float,
        power_factor: float = 0.92
    ) -> Dict[str, Any]:
        """Generates a realistic DESCO (Dhaka Electric Supply Company) industrial bill."""
        # Commercial rate 2026 approx: Peak ~13.85 BDT/kWh, Off-Peak ~9.45 BDT/kWh, Demand Charge ~75 BDT/kW
        peak_rate_bdt = 13.85
        off_peak_rate_bdt = 9.45
        energy_charge_bdt = (peak_kwh * peak_rate_bdt) + (off_peak_kwh * off_peak_rate_bdt)
        demand_charge_bdt = 1800.0 * 75.0  # 1800 kW sanctioned
        vat_bdt = energy_charge_bdt * 0.05
        total_bill_bdt = energy_charge_bdt + demand_charge_bdt + vat_bdt

        account_no_en = "92048571"
        meter_no_en = "DS-HT-99214"

        return {
            "document_id": f"BILL-DESCO-{year}-{month:02d}",
            "tenant_id": self.tenant_id,
            "factory_id": self.factory_id,
            "utility_provider": "DESCO",
            "utility_type": "electricity",
            "billing_period": f"{year}-{month:02d}",
            "account_number": account_no_en,
            "account_number_bn": to_bangla_number(float(account_no_en), 0),
            "meter_number": meter_no_en,
            "tariff_category": "HT-3 (Industrial 11kV)",
            "tariff_category_bn": "এইচটি-৩ (শিল্প ১১কেভি)",
            "consumption": {
                "peak_kwh": peak_kwh,
                "off_peak_kwh": off_peak_kwh,
                "total_kwh": total_kwh,
                "total_kwh_bn": to_bangla_number(total_kwh, 2),
                "power_factor": power_factor,
            },
            "financials": {
                "energy_charge_bdt": round(energy_charge_bdt, 2),
                "demand_charge_bdt": round(demand_charge_bdt, 2),
                "vat_bdt": round(vat_bdt, 2),
                "total_bdt": round(total_bill_bdt, 2),
                "total_bdt_bn": to_bangla_number(total_bill_bdt, 2),
            },
            "data_quality": "simulated",
            "simulated_watermark": "SIMULATED DATA",
            "ocr_confidence": 0.96,
            "raw_text_bn": f"ঢাকা ইলেকট্রিক সাপ্লাই কোম্পানি লিমিটেড (ডেসকো)\nহিসাব নম্বর: {to_bangla_number(float(account_no_en), 0)}\nবিল মাস: {to_bangla_number(month, 0)}/{to_bangla_number(year, 0)}\nমোট বিদ্যুৎ ব্যবহার: {to_bangla_number(total_kwh, 2)} ইউনিট (kWh)\nমোট প্রদেয় টাকা: {to_bangla_number(total_bill_bdt, 2)}/= ৳"
        }

    def generate_titas_bill(
        self,
        month: int,
        year: int,
        consumption_m3: float
    ) -> Dict[str, Any]:
        """Generates a realistic Titas Gas Transmission and Distribution Co. Ltd. bill."""
        # Captive power / industrial gas rate 2026 ~ 30.75 BDT / m3
        rate_per_m3 = 30.75
        gas_charge_bdt = consumption_m3 * rate_per_m3
        meter_rent_bdt = 1500.0
        vat_bdt = gas_charge_bdt * 0.05
        total_bdt = gas_charge_bdt + meter_rent_bdt + vat_bdt

        cust_code_en = "8810423"
        return {
            "document_id": f"BILL-TITAS-{year}-{month:02d}",
            "tenant_id": self.tenant_id,
            "factory_id": self.factory_id,
            "utility_provider": "Titas Gas Transmission & Distribution Co. Ltd.",
            "utility_type": "natural_gas",
            "billing_period": f"{year}-{month:02d}",
            "customer_code": cust_code_en,
            "customer_code_bn": to_bangla_number(float(cust_code_en), 0),
            "meter_number": "TG-IND-4091",
            "consumption": {
                "volume_m3": consumption_m3,
                "volume_m3_bn": to_bangla_number(consumption_m3, 2),
                "rate_per_m3": rate_per_m3,
            },
            "financials": {
                "gas_charge_bdt": round(gas_charge_bdt, 2),
                "meter_rent_bdt": round(meter_rent_bdt, 2),
                "vat_bdt": round(vat_bdt, 2),
                "total_bdt": round(total_bdt, 2),
                "total_bdt_bn": to_bangla_number(total_bdt, 2),
            },
            "data_quality": "simulated",
            "simulated_watermark": "SIMULATED DATA",
            "ocr_confidence": 0.94,
            "raw_text_bn": f"তিতাস গ্যাস ট্রান্সমিশন অ্যান্ড ডিস্ট্রিবিউশন কোম্পানি লিমিটেড\nগ্রাহক কোড: {to_bangla_number(float(cust_code_en), 0)}\nব্যবহৃত গ্যাসের পরিমাণ: {to_bangla_number(consumption_m3, 2)} ঘনমিটার (m³)\nমোট প্রদেয় বিল: {to_bangla_number(total_bdt, 2)}/= টাকা"
        }

    def generate_diesel_challan(
        self,
        date_str: str,
        liters_delivered: float,
        rate_per_liter: float = 109.0,
        falsified_ratio: float = 0.0
    ) -> Dict[str, Any]:
        """Generates a diesel delivery challan from Meghna Petroleum or Jamuna Oil."""
        effective_liters = liters_delivered * (1.0 - falsified_ratio)
        total_amount_bdt = effective_liters * rate_per_liter
        challan_no = f"CHL-DSL-{random.randint(10000, 99999)}"

        return {
            "document_id": challan_no,
            "tenant_id": self.tenant_id,
            "factory_id": self.factory_id,
            "delivery_date": date_str,
            "supplier": "Meghna Petroleum Authorized Distributor (Joydebpur Depot)",
            "vehicle_no": "Dhaka Metro-Ta 11-4829",
            "fuel_type": "high_speed_diesel",
            "stated_liters": round(effective_liters, 2),
            "stated_liters_bn": to_bangla_number(effective_liters, 2),
            "actual_delivered_liters": round(liters_delivered, 2),
            "falsified_flag": falsified_ratio > 0.0,
            "unit_price_bdt": rate_per_liter,
            "total_bdt": round(total_amount_bdt, 2),
            "total_bdt_bn": to_bangla_number(total_amount_bdt, 2),
            "data_quality": "simulated",
            "simulated_watermark": "SIMULATED DATA",
            "ocr_confidence": 0.88 if falsified_ratio > 0.0 else 0.95,
            "raw_text_bn": f"জ্বালানি তেল সরবরাহের চালান ও গেট পাস\nচালান নং: {challan_no}\nতারিখ: {date_str}\nতেলের পরিমাণ: {to_bangla_number(effective_liters, 2)} লিটার (HSD)\nদর: {rate_per_liter}/= টাকা\nমোট মূল্য: {to_bangla_number(total_amount_bdt, 2)}/= টাকা"
        }
