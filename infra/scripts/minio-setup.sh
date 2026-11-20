#!/usr/bin/env bash
# =============================================================================
# CarbonLoom – MinIO Bucket Setup Script
# =============================================================================
# Creates and configures the four canonical MinIO buckets with:
#   - AES-256 server-side encryption (SSE-S3)
#   - Versioning enabled
#   - Lifecycle rules for automatic cleanup of old versions
#
# Prerequisites:
#   - MinIO server running (typically via docker-compose)
#   - MinIO Client (mc) installed and on PATH
#
# Environment variables (with defaults for local dev):
#   MINIO_ENDPOINT   – MinIO server URL          (default: http://localhost:9000)
#   MINIO_ACCESS_KEY – Access key / root user     (default: minioadmin)
#   MINIO_SECRET_KEY – Secret key / root password  (default: minioadmin)
#   MINIO_ALIAS      – mc alias name               (default: carbonloom)
# =============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
MINIO_ENDPOINT="${MINIO_ENDPOINT:-http://localhost:9000}"
MINIO_ACCESS_KEY="${MINIO_ACCESS_KEY:-minioadmin}"
MINIO_SECRET_KEY="${MINIO_SECRET_KEY:-minioadmin}"
MINIO_ALIAS="${MINIO_ALIAS:-carbonloom}"

BUCKETS=(
    "evidence-packs"    # Assembled evidence packs for auditors / verifiers
    "bills-certs"       # Scanned utility bills and sustainability certificates
    "reports"           # Generated emission reports, DPPs, analytics exports
    "dpp-jsonld"        # Digital Product Passport JSON-LD documents
)

# How long to keep non-current (old) versions before expiry (days)
NONCURRENT_VERSION_EXPIRY_DAYS=90

# Maximum retries when waiting for MinIO readiness
MAX_RETRIES=30
RETRY_INTERVAL=2   # seconds

# ---------------------------------------------------------------------------
# Logging helpers
# ---------------------------------------------------------------------------
log()  { echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] [INFO]  $*"; }
warn() { echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] [WARN]  $*" >&2; }
die()  { echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] [ERROR] $*" >&2; exit 1; }

# ---------------------------------------------------------------------------
# 1. Wait for MinIO to be ready
# ---------------------------------------------------------------------------
log "Waiting for MinIO at ${MINIO_ENDPOINT} ..."
attempt=0
until mc alias set "${MINIO_ALIAS}" "${MINIO_ENDPOINT}" "${MINIO_ACCESS_KEY}" "${MINIO_SECRET_KEY}" --api S3v4 > /dev/null 2>&1; do
    attempt=$((attempt + 1))
    if [ "${attempt}" -ge "${MAX_RETRIES}" ]; then
        die "MinIO not reachable at ${MINIO_ENDPOINT} after ${MAX_RETRIES} attempts. Aborting."
    fi
    warn "MinIO not ready yet (attempt ${attempt}/${MAX_RETRIES}). Retrying in ${RETRY_INTERVAL}s ..."
    sleep "${RETRY_INTERVAL}"
done
log "MinIO is ready. Alias '${MINIO_ALIAS}' configured."

# ---------------------------------------------------------------------------
# 2. Create buckets, enable encryption + versioning + lifecycle
# ---------------------------------------------------------------------------
for BUCKET in "${BUCKETS[@]}"; do
    BUCKET_PATH="${MINIO_ALIAS}/${BUCKET}"

    # -- Create bucket (idempotent) ----------------------------------------
    if mc ls "${BUCKET_PATH}" > /dev/null 2>&1; then
        log "Bucket '${BUCKET}' already exists. Skipping creation."
    else
        log "Creating bucket '${BUCKET}' ..."
        mc mb "${BUCKET_PATH}"
    fi

    # -- Enable AES-256 server-side encryption (SSE-S3) --------------------
    log "Enabling SSE-S3 (AES-256) encryption on '${BUCKET}' ..."
    mc encrypt set sse-s3 "${BUCKET_PATH}"

    # -- Enable versioning -------------------------------------------------
    log "Enabling versioning on '${BUCKET}' ..."
    mc version enable "${BUCKET_PATH}"

    # -- Add lifecycle rule: expire non-current versions after N days ------
    # This keeps storage costs in check while preserving current versions.
    log "Adding lifecycle rule on '${BUCKET}': expire non-current versions after ${NONCURRENT_VERSION_EXPIRY_DAYS} days ..."
    mc ilm rule add "${BUCKET_PATH}" \
        --noncurrent-expire-days "${NONCURRENT_VERSION_EXPIRY_DAYS}" \
        --prefix "" \
        --tags ""

    log "Bucket '${BUCKET}' fully configured. ✓"
done

# ---------------------------------------------------------------------------
# 3. Summary
# ---------------------------------------------------------------------------
log ""
log "=== MinIO Setup Complete ==="
log "Endpoint:   ${MINIO_ENDPOINT}"
log "Alias:      ${MINIO_ALIAS}"
log "Buckets:"
for BUCKET in "${BUCKETS[@]}"; do
    log "  • ${BUCKET}  (SSE-S3, versioning, lifecycle)"
done
log ""
log "Verify with:  mc admin info ${MINIO_ALIAS}"
log "              mc ls ${MINIO_ALIAS}"
