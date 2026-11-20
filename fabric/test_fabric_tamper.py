"""
Tests for Hyperledger Fabric & Groth16 Live Tamper Demo Engine (FR-F6).
"""
import pytest
from fabric.tamper_demo import TamperDemoEngine

def test_genuine_record_verification():
    """Verify that an untampered record passes both Fabric and Groth16 checks (Green)."""
    genuine = TamperDemoEngine.create_anchored_batch()
    res = TamperDemoEngine.verify_record_dual_layer(genuine)
    assert res["fabric_merkle_check"]["passed"] is True
    assert res["groth16_zk_check"]["passed"] is True
    assert res["overall_verdict"] == "VERIFIED_GENUINE_COMPLIANT"
    assert res["tamper_detected"] is False

def test_tampered_digit_fails_red():
    """Verify that mutating 1 digit immediately triggers Red failure on both layers."""
    genuine = TamperDemoEngine.create_anchored_batch()
    tampered = TamperDemoEngine.apply_tampering(genuine, tampered_component_index=3, tampered_value=0.95)
    
    res = TamperDemoEngine.verify_record_dual_layer(tampered)
    assert res["fabric_merkle_check"]["passed"] is False
    assert "RED" in res["fabric_merkle_check"]["status"]
    assert res["groth16_zk_check"]["passed"] is False
    assert "RED" in res["groth16_zk_check"]["status"]
    assert res["overall_verdict"] == "VERIFICATION_FAILED_RED"
    assert res["tamper_detected"] is True
