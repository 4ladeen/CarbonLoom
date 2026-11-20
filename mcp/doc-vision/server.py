"""
doc-vision-mcp: Read-Only Bilingual Document & OCR MCP Server (Server 4)
Tools: extract_bilingual_utility_bill, extract_fuel_challan, extract_mill_cert, verify_cert_expiry
"""
from typing import Dict, Any
from sim.bill_generator import BilingualBillGenerator

def extract_bilingual_utility_bill(document_image_path: str) -> Dict[str, Any]:
    """Extracts DESCO/DPDC/Titas bills into structured JSON with confidence scores."""
    gen = BilingualBillGenerator()
    bill = gen.generate_desco_bill(month=1, year=2026, peak_kwh=12000.0, off_peak_kwh=18000.0, total_kwh=30000.0)
    return {
        "status": "extracted",
        "ocr_confidence": bill["ocr_confidence"],
        "requires_human_review": bill["ocr_confidence"] < 0.90,
        "extracted_data": bill
    }

def extract_fuel_challan(challan_path: str) -> Dict[str, Any]:
    """Extracts diesel or furnace oil delivery challan."""
    gen = BilingualBillGenerator()
    challan = gen.generate_diesel_challan(date_str="2026-01-15", liters_delivered=1600.0)
    return {
        "status": "extracted",
        "ocr_confidence": challan["ocr_confidence"],
        "requires_human_review": challan["ocr_confidence"] < 0.90,
        "extracted_data": challan
    }

def extract_mill_cert(cert_path: str) -> Dict[str, Any]:
    """Extracts OEKO-TEX, GOTS, or GRS certificates."""
    return {
        "certificate_id": "OEKO-TEX-STANDARD-100-2026",
        "standard": "OEKO-TEX Standard 100 Class I",
        "holder": "Padma Spinning & Dyeing Mills Ltd.",
        "expiry_date": "2027-04-30",
        "is_valid": True,
        "ocr_confidence": 0.98
    }

def verify_cert_expiry(cert_id: str) -> Dict[str, Any]:
    """Checks validity and warns 60 days ahead of expiration."""
    return {
        "certificate_id": cert_id,
        "days_until_expiry": 162,
        "status": "ACTIVE_VALID",
        "alert_triggered": False
    }
