"""
CarbonLoom Deterministic Carbon Accounting — Uncertainty Quantification (FR-B6)
Computes [low, mid, high] uncertainty intervals and enforces data-quality provenance tags.
"""
from typing import Dict, Any, Tuple
import math

class UncertaintyEngine:
    """Propagates uncertainty using analytical Gaussian / Taylor expansion error propagation."""

    @staticmethod
    def calculate_bounds(
        value: float,
        activity_data_uncertainty_pct: float,
        emission_factor_uncertainty_pct: float
    ) -> Tuple[float, float, float]:
        """
        Calculates 95% confidence interval [low, mid, high] for a product of independent variables:
        Total uncertainty = sqrt(u_activity^2 + u_factor^2)
        """
        combined_uncertainty_pct = math.sqrt(
            (activity_data_uncertainty_pct ** 2) + (emission_factor_uncertainty_pct ** 2)
        )
        half_width = value * (combined_uncertainty_pct / 100.0)
        low = max(0.0, value - half_width)
        mid = value
        high = value + half_width
        return round(low, 4), round(mid, 4), round(high, 4)

    @staticmethod
    def wrap_metric(
        value: float,
        unit: str,
        activity_uncertainty_pct: float = 3.0,
        factor_uncertainty_pct: float = 3.5,
        data_quality: str = "simulated",
        lineage_id: str = ""
    ) -> Dict[str, Any]:
        """Packages a numeric value into a verified MetricWithUncertainty dict."""
        low, mid, high = UncertaintyEngine.calculate_bounds(
            value, activity_uncertainty_pct, factor_uncertainty_pct
        )
        return {
            "value": round(value, 4),
            "low": low,
            "mid": mid,
            "high": high,
            "unit": unit,
            "uncertainty_pct": round(math.sqrt(activity_uncertainty_pct**2 + factor_uncertainty_pct**2), 2),
            "data_quality": data_quality,
            "simulated_watermark": "SIMULATED DATA",
            "lineage_id": lineage_id
        }
