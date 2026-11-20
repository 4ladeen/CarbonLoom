-- =============================================================================
-- CarbonLoom – TimescaleDB Hypertable Migration for Readings
-- =============================================================================
-- Prerequisites:
--   1. PostgreSQL 16 with TimescaleDB extension installed.
--   2. The base schema (schema.sql) has already been applied.
--   3. The 'readings' table exists but is a regular PostgreSQL table.
--
-- This migration:
--   - Enables the TimescaleDB extension
--   - Converts the readings table into a hypertable (1-day chunk interval)
--   - Creates continuous aggregates for 15-minute and 1-hour rollups
--   - Adds a compression policy (compress chunks older than 7 days)
--   - Adds a retention policy (drop chunks older than 2 years)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Enable TimescaleDB extension
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- ---------------------------------------------------------------------------
-- 2. Convert readings to a hypertable
-- ---------------------------------------------------------------------------
-- TimescaleDB requires dropping the default PK and unique constraints that
-- don't include the partitioning column. We re-add a composite PK.
-- ---------------------------------------------------------------------------

-- Drop the existing primary key (id alone) so we can partition by timestamp
ALTER TABLE readings DROP CONSTRAINT readings_pkey;

-- Re-create primary key including the partitioning column
ALTER TABLE readings ADD PRIMARY KEY (id, timestamp);

-- Convert to hypertable with 1-day chunk interval
SELECT create_hypertable(
    'readings',
    'timestamp',
    chunk_time_interval => INTERVAL '1 day',
    migrate_data        => true      -- migrate any existing rows
);

-- ---------------------------------------------------------------------------
-- 3. Continuous Aggregate: 15-minute rollups
-- ---------------------------------------------------------------------------
-- Materialised real-time aggregate for dashboard widgets and anomaly detection.
-- WITH (timescaledb.materialized_only = false) enables real-time aggregation
-- that merges materialised data with recent un-materialised data.
-- ---------------------------------------------------------------------------
CREATE MATERIALIZED VIEW readings_15min
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('15 minutes', timestamp)    AS bucket,
    meter_id,
    tenant_id,
    COUNT(*)                                AS reading_count,
    AVG(value_kwh)                          AS avg_kwh,
    SUM(value_kwh)                          AS sum_kwh,
    MIN(value_kwh)                          AS min_kwh,
    MAX(value_kwh)                          AS max_kwh,
    AVG(power_factor)                       AS avg_power_factor,
    AVG(voltage)                            AS avg_voltage,
    AVG(current_amp)                        AS avg_current_amp
FROM readings
GROUP BY bucket, meter_id, tenant_id
WITH NO DATA;

-- Refresh policy: materialise every 15 minutes, covering the last 1 hour
-- to handle late-arriving data.
SELECT add_continuous_aggregate_policy('readings_15min',
    start_offset    => INTERVAL '1 hour',
    end_offset      => INTERVAL '15 minutes',
    schedule_interval => INTERVAL '15 minutes'
);

COMMENT ON MATERIALIZED VIEW readings_15min IS
    'Continuous aggregate: 15-minute rollups of meter readings for dashboards and anomaly detection.';

-- ---------------------------------------------------------------------------
-- 4. Continuous Aggregate: 1-hour rollups
-- ---------------------------------------------------------------------------
-- Hourly summaries for reporting, billing reconciliation, and emission calcs.
-- ---------------------------------------------------------------------------
CREATE MATERIALIZED VIEW readings_1hr
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('1 hour', timestamp)        AS bucket,
    meter_id,
    tenant_id,
    COUNT(*)                                AS reading_count,
    AVG(value_kwh)                          AS avg_kwh,
    SUM(value_kwh)                          AS sum_kwh,
    MIN(value_kwh)                          AS min_kwh,
    MAX(value_kwh)                          AS max_kwh,
    AVG(power_factor)                       AS avg_power_factor,
    AVG(voltage)                            AS avg_voltage,
    AVG(current_amp)                        AS avg_current_amp
FROM readings
GROUP BY bucket, meter_id, tenant_id
WITH NO DATA;

-- Refresh policy: materialise every hour, covering the last 3 hours
-- for late-arriving or reprocessed data.
SELECT add_continuous_aggregate_policy('readings_1hr',
    start_offset    => INTERVAL '3 hours',
    end_offset      => INTERVAL '1 hour',
    schedule_interval => INTERVAL '1 hour'
);

COMMENT ON MATERIALIZED VIEW readings_1hr IS
    'Continuous aggregate: 1-hour rollups of meter readings for reports and emission calculations.';

-- ---------------------------------------------------------------------------
-- 5. Compression Policy
-- ---------------------------------------------------------------------------
-- Enable compression on the readings hypertable.
-- Compress chunks older than 7 days to save storage and speed up queries.
-- Segment by meter_id so each meter's data is compressed together.
-- Order by timestamp within segments for optimal time-range scans.
-- ---------------------------------------------------------------------------
ALTER TABLE readings SET (
    timescaledb.compress,
    timescaledb.compress_segmentby   = 'meter_id, tenant_id',
    timescaledb.compress_orderby     = 'timestamp DESC'
);

SELECT add_compression_policy('readings',
    compress_after => INTERVAL '7 days'
);

-- ---------------------------------------------------------------------------
-- 6. Retention Policy
-- ---------------------------------------------------------------------------
-- Automatically drop chunks older than 2 years.
-- Raw high-frequency data beyond 2 years can be reconstructed from the
-- continuous aggregates if needed; this balances storage cost and compliance.
-- ---------------------------------------------------------------------------
SELECT add_retention_policy('readings',
    drop_after => INTERVAL '2 years'
);

-- ---------------------------------------------------------------------------
-- 7. Additional indexes optimised for the hypertable
-- ---------------------------------------------------------------------------
-- TimescaleDB automatically creates chunk-level indexes on the partition key.
-- We add a composite index for the most common query pattern: by meter + time.
-- (The original idx_readings_meter_timestamp from schema.sql is preserved.)
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_readings_tenant_meter_time
    ON readings (tenant_id, meter_id, timestamp DESC);

-- =============================================================================
-- End of TimescaleDB Migration
-- =============================================================================
