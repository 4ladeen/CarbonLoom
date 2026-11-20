"""
CarbonLoom Canonical Pydantic v2 Data Models & Request Schemas
Conforms to PRD §5.5 (26 Canonical Entities) and strict type enforcement.
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any, Literal
from datetime import datetime, timezone
from uuid import UUID, uuid4

# ---------------------------------------------------------------------------
# Enums and Types
# ---------------------------------------------------------------------------
DataQualityTag = Literal["measured", "billed", "estimated", "simulated"]
ScopeCategory = Literal["scope1", "scope2_location", "scope2_market", "scope3_cat1", "scope3_cat4"]
VerificationStatus = Literal["draft", "pending_review", "attested", "anchored", "revoked"]

# ---------------------------------------------------------------------------
# Base Schema with common fields
# ---------------------------------------------------------------------------
class CarbonLoomBaseModel(BaseModel):
    model_config = ConfigDict(extra="ignore", from_attributes=True)

# ---------------------------------------------------------------------------
# Core Entities
# ---------------------------------------------------------------------------
class Tenant(CarbonLoomBaseModel):
    id: UUID = Field(default_factory=uuid4)
    name: str
    slug: str
    settings: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Factory(CarbonLoomBaseModel):
    id: UUID = Field(default_factory=uuid4)
    tenant_id: UUID
    name: str
    code: str
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    grid_connection_kva: float = 2500.0
    sewing_lines_count: int = 12
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EmissionFactor(CarbonLoomBaseModel):
    id: UUID = Field(default_factory=uuid4)
    tenant_id: Optional[UUID] = None
    authority: str # e.g. "Department of Environment, Bangladesh", "JCM", "IPCC"
    geography: str # e.g. "BGD", "GLB"
    year: int
    fuel_or_activity: str
    unit: str # e.g. "tCO2/MWh", "kgCO2e/m3", "kgCO2e/L"
    co2e_factor: float
    uncertainty_pct: float = 5.0
    data_quality: DataQualityTag = "measured"
    is_version_pinned: bool = True

class LineageNode(CarbonLoomBaseModel):
    lineage_id: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    formula_version: str
    factor_id: str
    factor_value: float
    raw_slice_hash: str
    sha256_hash: str
    parent_lineage_ids: List[str] = Field(default_factory=list)

class MetricWithUncertainty(CarbonLoomBaseModel):
    value: float
    low: float
    mid: float
    high: float
    unit: str
    data_quality: DataQualityTag = "simulated"
    simulated_watermark: str = "SIMULATED DATA"
    lineage_id: str

class Scope1Input(CarbonLoomBaseModel):
    tenant_id: UUID
    factory_id: UUID
    reporting_period: str
    natural_gas_m3: float = 0.0
    diesel_liters: float = 0.0
    furnace_oil_liters: float = 0.0
    refrigerant_r134a_kg: float = 0.0
    refrigerant_r410a_kg: float = 0.0
    data_quality: DataQualityTag = "simulated"

class Scope2Input(CarbonLoomBaseModel):
    tenant_id: UUID
    factory_id: UUID
    reporting_period: str
    grid_consumption_kwh: float
    rooftop_solar_generated_kwh: float = 0.0
    rooftop_solar_self_consumed_kwh: float = 0.0
    grid_emission_factor_tco2_mwh: float = 0.62 # Bangladesh DoE standard
    data_quality: DataQualityTag = "simulated"

class OrderItemInput(CarbonLoomBaseModel):
    order_id: str
    buyer_name: str
    style_code: str
    garment_type: str
    pieces_produced: int
    smv_minutes: float
    fabric_weight_kg_per_piece: float
    target_threshold_kgco2_per_piece: float

class SMVAllocationInput(CarbonLoomBaseModel):
    tenant_id: UUID
    factory_id: UUID
    period_name: str
    total_factory_scope1_tco2e: float
    total_factory_scope2_tco2e: float
    total_factory_scope3_tco2e: float = 0.0
    orders: List[OrderItemInput]

class GarmentAllocationResult(CarbonLoomBaseModel):
    order_id: str
    style_code: str
    pieces: int
    smv_minutes: float
    total_smv_minutes: float
    allocation_weight: float
    allocated_scope1_tco2e: float
    allocated_scope2_tco2e: float
    allocated_scope3_tco2e: float
    total_allocated_tco2e: float
    emissions_per_garment_kgco2e: MetricWithUncertainty
    target_threshold_kgco2e: float
    is_compliant: bool
    data_quality: DataQualityTag = "simulated"
    simulated_watermark: str = "SIMULATED DATA"
