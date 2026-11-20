-- =============================================================================
-- CarbonLoom – PostgreSQL 16 Schema
-- All 26 canonical entities per PRD §5.5
-- =============================================================================
-- Prerequisites: PostgreSQL 16+ with pgvector extension installed.
-- Run as a superuser or a role with CREATE EXTENSION privilege.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- gen_random_uuid() fallback
CREATE EXTENSION IF NOT EXISTS "pgcrypto";        -- gen_random_uuid() native
CREATE EXTENSION IF NOT EXISTS "vector";          -- pgvector for BGE-M3 embeddings

-- ---------------------------------------------------------------------------
-- Helper: updated_at trigger function
-- Automatically sets updated_at = now() on every UPDATE.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 1. TENANTS
-- Root multi-tenancy table. Every other entity references this.
-- =============================================================================
CREATE TABLE tenants (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255)    NOT NULL,
    slug            VARCHAR(100)    NOT NULL UNIQUE,
    settings        JSONB           NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_tenants_updated_at
    BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE tenants IS 'Root tenant entity for multi-tenancy isolation.';

-- =============================================================================
-- 2. FACTORIES
-- Physical factory sites owned by a tenant.
-- =============================================================================
CREATE TABLE factories (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID            NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name            VARCHAR(255)    NOT NULL,
    address         TEXT,
    city            VARCHAR(100),
    country         VARCHAR(100)    NOT NULL DEFAULT 'Bangladesh',
    latitude        NUMERIC(10, 7),
    longitude       NUMERIC(10, 7),
    capacity_units  INTEGER,                      -- max monthly production units
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE INDEX idx_factories_tenant_id ON factories(tenant_id);

CREATE TRIGGER trg_factories_updated_at
    BEFORE UPDATE ON factories
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE factories IS 'Physical factory sites belonging to a tenant.';

-- =============================================================================
-- 3. METERS
-- Energy / utility meters installed at a factory.
-- =============================================================================
CREATE TABLE meters (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID            NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    factory_id      UUID            NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
    meter_type      VARCHAR(50)     NOT NULL,     -- electricity, gas, water, steam
    serial_number   VARCHAR(100),
    location_desc   TEXT,                         -- human-readable location within factory
    is_active       BOOLEAN         NOT NULL DEFAULT true,
    installed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE INDEX idx_meters_tenant_id ON meters(tenant_id);
CREATE INDEX idx_meters_factory_id ON meters(factory_id);

CREATE TRIGGER trg_meters_updated_at
    BEFORE UPDATE ON meters
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE meters IS 'Energy/utility meters installed at factory sites.';

-- =============================================================================
-- 4. CALIBRATION_RECORDS
-- Calibration history for meters.
-- =============================================================================
CREATE TABLE calibration_records (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID            NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    meter_id        UUID            NOT NULL REFERENCES meters(id) ON DELETE CASCADE,
    calibrated_at   TIMESTAMPTZ     NOT NULL,
    calibrated_by   TEXT,
    drift_pct       NUMERIC(6, 3),                -- measured drift percentage
    passed          BOOLEAN         NOT NULL DEFAULT true,
    notes           TEXT,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE INDEX idx_calibration_records_tenant_id ON calibration_records(tenant_id);
CREATE INDEX idx_calibration_records_meter_id ON calibration_records(meter_id);

CREATE TRIGGER trg_calibration_records_updated_at
    BEFORE UPDATE ON calibration_records
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE calibration_records IS 'Calibration history for energy meters.';

-- =============================================================================
-- 5. READINGS
-- High-frequency time-series energy readings from meters.
-- This table will be converted to a TimescaleDB hypertable (see migration).
-- =============================================================================
CREATE TABLE readings (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID            NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    meter_id        UUID            NOT NULL REFERENCES meters(id) ON DELETE CASCADE,
    timestamp       TIMESTAMPTZ     NOT NULL,
    value_kwh       NUMERIC         NOT NULL,
    power_factor    NUMERIC,
    voltage         NUMERIC,
    current_amp     NUMERIC,
    data_quality    VARCHAR(20)     CHECK (data_quality IN ('measured', 'billed', 'estimated', 'simulated')),
    raw_payload     JSONB,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE INDEX idx_readings_tenant_id ON readings(tenant_id);
CREATE INDEX idx_readings_meter_id ON readings(meter_id);
CREATE INDEX idx_readings_timestamp ON readings(timestamp DESC);
CREATE INDEX idx_readings_meter_timestamp ON readings(meter_id, timestamp DESC);

CREATE TRIGGER trg_readings_updated_at
    BEFORE UPDATE ON readings
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE readings IS 'High-frequency energy readings from meters. Converted to TimescaleDB hypertable in production.';

-- =============================================================================
-- 6. DOCUMENTS
-- Uploaded files: bills, certificates, evidence packs, etc.
-- =============================================================================
CREATE TABLE documents (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID            NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    filename        TEXT            NOT NULL,
    mime_type       VARCHAR(255),
    storage_path    TEXT            NOT NULL,      -- MinIO / S3 object path
    size_bytes      BIGINT,
    checksum_sha256 TEXT,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE INDEX idx_documents_tenant_id ON documents(tenant_id);

CREATE TRIGGER trg_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE documents IS 'Uploaded document metadata; actual files stored in MinIO.';

-- =============================================================================
-- 7. BILLS
-- Utility bills from Bangladeshi power distributors.
-- =============================================================================
CREATE TABLE bills (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID            NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    factory_id      UUID            NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
    source          VARCHAR(100),                  -- DESCO, DPDC, REB, Titas, etc.
    period_start    DATE            NOT NULL,
    period_end      DATE            NOT NULL,
    total_kwh       NUMERIC,
    total_amount    NUMERIC,
    currency        VARCHAR(3)      NOT NULL DEFAULT 'BDT',
    ocr_confidence  NUMERIC,                       -- 0.0–1.0 from doc-vision
    raw_document_id UUID            REFERENCES documents(id),
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE INDEX idx_bills_tenant_id ON bills(tenant_id);
CREATE INDEX idx_bills_factory_id ON bills(factory_id);
CREATE INDEX idx_bills_period ON bills(period_start, period_end);

CREATE TRIGGER trg_bills_updated_at
    BEFORE UPDATE ON bills
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE bills IS 'Utility bills from Bangladeshi distributors (DESCO, DPDC, REB, Titas, etc.).';

-- =============================================================================
-- 8. FUEL_LOGS
-- Fuel purchase/consumption records for Scope 1 calculations.
-- =============================================================================
CREATE TABLE fuel_logs (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID            NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    factory_id      UUID            NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
    fuel_type       VARCHAR(100)    NOT NULL,       -- diesel, natural_gas, lpg, furnace_oil
    quantity        NUMERIC         NOT NULL,
    unit            VARCHAR(20)     NOT NULL,       -- liters, kg, m3, etc.
    supplier        TEXT,
    purchase_date   DATE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE INDEX idx_fuel_logs_tenant_id ON fuel_logs(tenant_id);
CREATE INDEX idx_fuel_logs_factory_id ON fuel_logs(factory_id);

CREATE TRIGGER trg_fuel_logs_updated_at
    BEFORE UPDATE ON fuel_logs
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE fuel_logs IS 'Fuel purchase/consumption records for Scope 1 emission calculations.';

-- =============================================================================
-- 9. CERTIFICATES
-- Sustainability certifications (GOTS, OEKO-TEX, GRS, etc.)
-- =============================================================================
CREATE TABLE certificates (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID            NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    factory_id      UUID            NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
    cert_type       VARCHAR(100)    NOT NULL,       -- GOTS, OEKO-TEX, GRS, BSCI, etc.
    issuer          TEXT,
    valid_from      DATE,
    valid_until     DATE,
    document_id     UUID            REFERENCES documents(id),
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE INDEX idx_certificates_tenant_id ON certificates(tenant_id);
CREATE INDEX idx_certificates_factory_id ON certificates(factory_id);

CREATE TRIGGER trg_certificates_updated_at
    BEFORE UPDATE ON certificates
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE certificates IS 'Sustainability certifications: GOTS, OEKO-TEX, GRS, BSCI, etc.';

-- =============================================================================
-- 10. STYLES
-- Garment style definitions (a style is a product template).
-- =============================================================================
CREATE TABLE styles (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID            NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name            VARCHAR(255)    NOT NULL,
    description     TEXT,
    category        VARCHAR(100),                   -- knit, woven, denim, etc.
    base_smv        NUMERIC,                        -- standard minute value
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE INDEX idx_styles_tenant_id ON styles(tenant_id);

CREATE TRIGGER trg_styles_updated_at
    BEFORE UPDATE ON styles
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE styles IS 'Garment style definitions (product templates) with base SMV.';

-- =============================================================================
-- 11. ORDERS
-- Purchase orders from buyers. Table named "orders" to avoid SQL reserved word.
-- =============================================================================
CREATE TABLE orders (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID            NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    factory_id      UUID            NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
    buyer           TEXT            NOT NULL,
    style_id        UUID            NOT NULL REFERENCES styles(id) ON DELETE RESTRICT,
    pieces          INTEGER         NOT NULL,
    smv             NUMERIC,                        -- specific SMV override for this order
    due_date        DATE,
    status          VARCHAR(50)     NOT NULL DEFAULT 'open',
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_tenant_id ON orders(tenant_id);
CREATE INDEX idx_orders_factory_id ON orders(factory_id);
CREATE INDEX idx_orders_style_id ON orders(style_id);

CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE orders IS 'Purchase orders from buyers. Named "orders" to avoid SQL reserved word "order".';

-- =============================================================================
-- 12. PRODUCTION_RUNS
-- Actual production batches against an order.
-- =============================================================================
CREATE TABLE production_runs (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID            NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    factory_id      UUID            NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
    order_id        UUID            REFERENCES orders(id) ON DELETE SET NULL,
    line_number     INTEGER,
    shift           VARCHAR(20),                    -- day, evening, night
    started_at      TIMESTAMPTZ,
    ended_at        TIMESTAMPTZ,
    pieces_produced INTEGER,
    defect_count    INTEGER         DEFAULT 0,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE INDEX idx_production_runs_tenant_id ON production_runs(tenant_id);
CREATE INDEX idx_production_runs_factory_id ON production_runs(factory_id);
CREATE INDEX idx_production_runs_order_id ON production_runs(order_id);

CREATE TRIGGER trg_production_runs_updated_at
    BEFORE UPDATE ON production_runs
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE production_runs IS 'Production batches / runs linked to purchase orders.';

-- =============================================================================
-- 13. EMISSION_FACTORS
-- GHG emission factors from IPCC, local grids, supplier-specific, etc.
-- =============================================================================
CREATE TABLE emission_factors (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID            NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name            VARCHAR(255)    NOT NULL,
    source          VARCHAR(255),                   -- IPCC 2006, Bangladesh Grid 2024, etc.
    fuel_type       VARCHAR(100),
    unit            VARCHAR(50),                    -- kg CO2e per kWh, per liter, etc.
    factor_value    NUMERIC         NOT NULL,
    scope           VARCHAR(10),
    valid_from      DATE,
    valid_until     DATE,
    metadata        JSONB,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE INDEX idx_emission_factors_tenant_id ON emission_factors(tenant_id);

CREATE TRIGGER trg_emission_factors_updated_at
    BEFORE UPDATE ON emission_factors
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE emission_factors IS 'GHG emission factors from IPCC, national grids, and suppliers.';

-- =============================================================================
-- 14. EMISSION_RECORDS
-- Calculated emission entries (Scope 1, 2, 3).
-- =============================================================================
CREATE TABLE emission_records (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    factory_id              UUID        NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
    scope                   VARCHAR(10) NOT NULL CHECK (scope IN ('scope1', 'scope2', 'scope3')),
    value_kg_co2e           NUMERIC     NOT NULL,
    uncertainty_low         NUMERIC,
    uncertainty_mid         NUMERIC,
    uncertainty_high        NUMERIC,
    calculation_lineage_id  UUID,                   -- links to the pipeline run that produced this
    factor_id               UUID        REFERENCES emission_factors(id) ON DELETE SET NULL,
    period_start            DATE,
    period_end              DATE,
    source_type             VARCHAR(100),            -- electricity, diesel, gas, transport, etc.
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_emission_records_tenant_id ON emission_records(tenant_id);
CREATE INDEX idx_emission_records_factory_id ON emission_records(factory_id);
CREATE INDEX idx_emission_records_scope ON emission_records(scope);
CREATE INDEX idx_emission_records_factor_id ON emission_records(factor_id);

CREATE TRIGGER trg_emission_records_updated_at
    BEFORE UPDATE ON emission_records
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE emission_records IS 'Calculated GHG emission records per scope with uncertainty bands.';

-- =============================================================================
-- 15. ALLOCATION_RUNS
-- Carbon footprint allocation across products / orders.
-- =============================================================================
CREATE TABLE allocation_runs (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID            NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    factory_id      UUID            NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
    run_type        VARCHAR(20)     NOT NULL,       -- smv, mass, runtime
    parameters      JSONB,
    results         JSONB           NOT NULL,       -- per-order allocation breakdown
    executed_at     TIMESTAMPTZ     NOT NULL DEFAULT now(),
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE INDEX idx_allocation_runs_tenant_id ON allocation_runs(tenant_id);
CREATE INDEX idx_allocation_runs_factory_id ON allocation_runs(factory_id);

CREATE TRIGGER trg_allocation_runs_updated_at
    BEFORE UPDATE ON allocation_runs
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE allocation_runs IS 'Carbon allocation runs by method (SMV, mass, runtime).';

-- =============================================================================
-- 16. ANOMALIES
-- Detected anomalies with SHAP explainability values.
-- =============================================================================
CREATE TABLE anomalies (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    factory_id          UUID        NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
    meter_id            UUID        REFERENCES meters(id) ON DELETE SET NULL,
    reading_id          UUID        REFERENCES readings(id) ON DELETE SET NULL,
    anomaly_type        VARCHAR(50),                -- spike, drift, flatline, missing_data
    anomaly_score       NUMERIC,                    -- 0.0–1.0 severity
    shap_values         JSONB       NOT NULL,       -- SHAP feature-importance breakdown
    root_cause_brief    TEXT,                        -- English explanation
    root_cause_brief_bn TEXT,                        -- Bangla (বাংলা) explanation
    detected_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_anomalies_tenant_id ON anomalies(tenant_id);
CREATE INDEX idx_anomalies_factory_id ON anomalies(factory_id);
CREATE INDEX idx_anomalies_meter_id ON anomalies(meter_id);
CREATE INDEX idx_anomalies_detected_at ON anomalies(detected_at DESC);

CREATE TRIGGER trg_anomalies_updated_at
    BEFORE UPDATE ON anomalies
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE anomalies IS 'Detected anomalies with SHAP explainability and bilingual root-cause narratives.';

-- =============================================================================
-- 17. RECOMMENDATIONS
-- Actionable recommendations linked to anomalies.
-- =============================================================================
CREATE TABLE recommendations (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    anomaly_id          UUID        NOT NULL REFERENCES anomalies(id) ON DELETE CASCADE,
    action              TEXT        NOT NULL,
    estimated_savings   JSONB,                      -- { "kwh_per_month": N, "bdt_per_month": N, "kg_co2e_per_month": N }
    priority            VARCHAR(20),                -- critical, high, medium, low
    status              VARCHAR(20) NOT NULL DEFAULT 'open',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_recommendations_tenant_id ON recommendations(tenant_id);
CREATE INDEX idx_recommendations_anomaly_id ON recommendations(anomaly_id);

CREATE TRIGGER trg_recommendations_updated_at
    BEFORE UPDATE ON recommendations
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE recommendations IS 'Actionable recommendations linked to detected anomalies.';

-- =============================================================================
-- 18. SCENARIO_RUNS
-- What-if scenario simulation results.
-- =============================================================================
CREATE TABLE scenario_runs (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID            NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    factory_id      UUID            REFERENCES factories(id) ON DELETE SET NULL,
    scenario_type   VARCHAR(100),                   -- equipment_upgrade, solar_install, shift_change
    parameters      JSONB           NOT NULL,
    results         JSONB           NOT NULL,
    executed_at     TIMESTAMPTZ     NOT NULL DEFAULT now(),
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE INDEX idx_scenario_runs_tenant_id ON scenario_runs(tenant_id);

CREATE TRIGGER trg_scenario_runs_updated_at
    BEFORE UPDATE ON scenario_runs
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE scenario_runs IS 'What-if scenario simulation parameters and results.';

-- =============================================================================
-- 19. APPROVALS
-- Human-in-the-loop approval gates.
-- =============================================================================
CREATE TABLE approvals (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID            NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    approval_type   VARCHAR(100)    NOT NULL,       -- emission_report, dpp_publish, tier2_accept
    status          VARCHAR(20)     NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'rejected')),
    token_hash      TEXT,                           -- hashed one-time approval token
    approved_by     UUID,                           -- user who approved/rejected
    approved_at     TIMESTAMPTZ,
    subject_type    VARCHAR(100),                   -- entity type being approved
    subject_id      UUID,                           -- entity id being approved
    notes           TEXT,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE INDEX idx_approvals_tenant_id ON approvals(tenant_id);
CREATE INDEX idx_approvals_status ON approvals(status);

CREATE TRIGGER trg_approvals_updated_at
    BEFORE UPDATE ON approvals
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE approvals IS 'Human-in-the-loop approval gates for emission reports, DPPs, etc.';

-- =============================================================================
-- 20. TIER2_SUBMISSIONS
-- Energy/emission data submissions from Tier-2 suppliers.
-- =============================================================================
CREATE TABLE tier2_submissions (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID            NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    factory_id      UUID            REFERENCES factories(id) ON DELETE SET NULL,
    supplier_name   TEXT            NOT NULL,
    po_batch_id     TEXT,
    energy_data     JSONB           NOT NULL,
    token_hash      TEXT            NOT NULL,       -- verification token hash
    submitted_at    TIMESTAMPTZ     NOT NULL DEFAULT now(),
    verified        BOOLEAN         NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE INDEX idx_tier2_submissions_tenant_id ON tier2_submissions(tenant_id);

CREATE TRIGGER trg_tier2_submissions_updated_at
    BEFORE UPDATE ON tier2_submissions
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE tier2_submissions IS 'Energy/emission data from Tier-2 suppliers with token verification.';

-- =============================================================================
-- 21. CHUNKS
-- RAG document chunks with pgvector embeddings (BGE-M3, 1024-dim).
-- =============================================================================
CREATE TABLE chunks (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID            NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    document_id     UUID            NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    content         TEXT            NOT NULL,
    embedding       vector(1024)    NOT NULL,       -- BGE-M3 embedding dimension
    metadata        JSONB,
    chunk_index     INTEGER         NOT NULL,       -- position within the parent document
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE INDEX idx_chunks_tenant_id ON chunks(tenant_id);
CREATE INDEX idx_chunks_document_id ON chunks(document_id);

-- HNSW index for approximate nearest-neighbor search on embeddings.
-- ef_construction=128, m=16 are good defaults for high-recall RAG workloads.
CREATE INDEX idx_chunks_embedding_hnsw
    ON chunks USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 128);

CREATE TRIGGER trg_chunks_updated_at
    BEFORE UPDATE ON chunks
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE chunks IS 'RAG document chunks with BGE-M3 1024-dim pgvector embeddings.';

-- =============================================================================
-- 22. LEDGER_ANCHORS
-- Merkle root anchors written to Hyperledger Fabric.
-- =============================================================================
CREATE TABLE ledger_anchors (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID            NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    batch_id        UUID,                           -- the batch of records being anchored
    merkle_root     TEXT            NOT NULL,
    fabric_tx_id    TEXT,                           -- Hyperledger Fabric transaction ID
    schema_version  INTEGER         NOT NULL DEFAULT 1,
    anchored_at     TIMESTAMPTZ     NOT NULL DEFAULT now(),
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE INDEX idx_ledger_anchors_tenant_id ON ledger_anchors(tenant_id);
CREATE INDEX idx_ledger_anchors_batch_id ON ledger_anchors(batch_id);

CREATE TRIGGER trg_ledger_anchors_updated_at
    BEFORE UPDATE ON ledger_anchors
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE ledger_anchors IS 'Merkle root anchors committed to Hyperledger Fabric for tamper evidence.';

-- =============================================================================
-- 23. ZK_PASSPORTS
-- Zero-knowledge proof passports for privacy-preserving verification.
-- =============================================================================
CREATE TABLE zk_passports (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    factory_id              UUID        REFERENCES factories(id) ON DELETE SET NULL,
    proof_json              JSONB       NOT NULL,
    public_signals          JSONB       NOT NULL,
    verification_key_hash   TEXT        NOT NULL,
    is_valid                BOOLEAN     NOT NULL DEFAULT false,
    verified_at             TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_zk_passports_tenant_id ON zk_passports(tenant_id);
CREATE INDEX idx_zk_passports_factory_id ON zk_passports(factory_id);

CREATE TRIGGER trg_zk_passports_updated_at
    BEFORE UPDATE ON zk_passports
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE zk_passports IS 'ZK proof passports for privacy-preserving compliance verification.';

-- =============================================================================
-- 24. ATTESTATIONS
-- Third-party verifier attestations with Ed25519 signatures.
-- =============================================================================
CREATE TABLE attestations (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    zk_passport_id          UUID        REFERENCES zk_passports(id) ON DELETE SET NULL,
    verifier_public_key     TEXT        NOT NULL,
    ed25519_signature       TEXT        NOT NULL,
    fabric_tx_id            TEXT,                   -- on-chain anchor of this attestation
    attestation_type        VARCHAR(100),
    attested_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_attestations_tenant_id ON attestations(tenant_id);

CREATE TRIGGER trg_attestations_updated_at
    BEFORE UPDATE ON attestations
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE attestations IS 'Third-party verifier attestations with Ed25519 digital signatures.';

-- =============================================================================
-- 25. ACCESS_GRANTS
-- Field-level data sharing grants to external organisations.
-- =============================================================================
CREATE TABLE access_grants (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID            NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    grantee_org     VARCHAR(255)    NOT NULL,
    granted_fields  TEXT[]          NOT NULL,       -- array of field paths, e.g. {'emissions.scope1', 'factory.name'}
    purpose         TEXT,
    expires_at      TIMESTAMPTZ,
    revoked_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE INDEX idx_access_grants_tenant_id ON access_grants(tenant_id);
CREATE INDEX idx_access_grants_grantee ON access_grants(grantee_org);

CREATE TRIGGER trg_access_grants_updated_at
    BEFORE UPDATE ON access_grants
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE access_grants IS 'Field-level data sharing grants to external organisations (buyers, verifiers).';

-- =============================================================================
-- 26. AUDIT_EVENTS
-- Immutable, hash-chained audit log for every significant system event.
-- =============================================================================
CREATE TABLE audit_events (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID            NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    event_type      VARCHAR(50)     NOT NULL,       -- data.created, approval.granted, report.published
    actor_id        UUID,                           -- user or service principal
    payload         JSONB           NOT NULL DEFAULT '{}',
    hash            TEXT            NOT NULL,       -- SHA-256 hash of (previous_hash + event content)
    previous_hash   TEXT,                           -- hash of the preceding audit event (chain)
    ip_address      INET,
    user_agent      TEXT,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_events_tenant_id ON audit_events(tenant_id);
CREATE INDEX idx_audit_events_event_type ON audit_events(event_type);
CREATE INDEX idx_audit_events_actor_id ON audit_events(actor_id);
CREATE INDEX idx_audit_events_created_at ON audit_events(created_at DESC);

CREATE TRIGGER trg_audit_events_updated_at
    BEFORE UPDATE ON audit_events
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE audit_events IS 'Hash-chained, immutable audit log for all significant system events.';


-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- Every table is tenant-isolated using RLS. The application must SET
-- app.current_tenant = '<tenant-uuid>' on each connection/transaction.
-- =============================================================================

-- Tenants table: tenant can only see its own row
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tenants
    USING (id = current_setting('app.current_tenant')::uuid);

ALTER TABLE factories ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON factories
    USING (tenant_id = current_setting('app.current_tenant')::uuid);

ALTER TABLE meters ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON meters
    USING (tenant_id = current_setting('app.current_tenant')::uuid);

ALTER TABLE calibration_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON calibration_records
    USING (tenant_id = current_setting('app.current_tenant')::uuid);

ALTER TABLE readings ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON readings
    USING (tenant_id = current_setting('app.current_tenant')::uuid);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON documents
    USING (tenant_id = current_setting('app.current_tenant')::uuid);

ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON bills
    USING (tenant_id = current_setting('app.current_tenant')::uuid);

ALTER TABLE fuel_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON fuel_logs
    USING (tenant_id = current_setting('app.current_tenant')::uuid);

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON certificates
    USING (tenant_id = current_setting('app.current_tenant')::uuid);

ALTER TABLE styles ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON styles
    USING (tenant_id = current_setting('app.current_tenant')::uuid);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON orders
    USING (tenant_id = current_setting('app.current_tenant')::uuid);

ALTER TABLE production_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON production_runs
    USING (tenant_id = current_setting('app.current_tenant')::uuid);

ALTER TABLE emission_factors ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON emission_factors
    USING (tenant_id = current_setting('app.current_tenant')::uuid);

ALTER TABLE emission_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON emission_records
    USING (tenant_id = current_setting('app.current_tenant')::uuid);

ALTER TABLE allocation_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON allocation_runs
    USING (tenant_id = current_setting('app.current_tenant')::uuid);

ALTER TABLE anomalies ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON anomalies
    USING (tenant_id = current_setting('app.current_tenant')::uuid);

ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON recommendations
    USING (tenant_id = current_setting('app.current_tenant')::uuid);

ALTER TABLE scenario_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON scenario_runs
    USING (tenant_id = current_setting('app.current_tenant')::uuid);

ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON approvals
    USING (tenant_id = current_setting('app.current_tenant')::uuid);

ALTER TABLE tier2_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tier2_submissions
    USING (tenant_id = current_setting('app.current_tenant')::uuid);

ALTER TABLE chunks ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON chunks
    USING (tenant_id = current_setting('app.current_tenant')::uuid);

ALTER TABLE ledger_anchors ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON ledger_anchors
    USING (tenant_id = current_setting('app.current_tenant')::uuid);

ALTER TABLE zk_passports ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON zk_passports
    USING (tenant_id = current_setting('app.current_tenant')::uuid);

ALTER TABLE attestations ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON attestations
    USING (tenant_id = current_setting('app.current_tenant')::uuid);

ALTER TABLE access_grants ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON access_grants
    USING (tenant_id = current_setting('app.current_tenant')::uuid);

ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON audit_events
    USING (tenant_id = current_setting('app.current_tenant')::uuid);


-- =============================================================================
-- End of CarbonLoom PostgreSQL Schema
-- =============================================================================
