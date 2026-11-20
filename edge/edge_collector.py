"""
CarbonLoom Edge Collector & Local SQLite Buffer (PRD §1.3 item 7 & NFR-2)
Runs on factory mini-PC. Buffers >= 72 hours of telemetry during ISP outages.
Synchronizes idempotently to central TimescaleDB when internet connectivity resumes.
"""
import sqlite3
import json
import time
from datetime import datetime, timezone
from typing import Dict, Any, List

class LocalEdgeBuffer:
    """Manages on-premise SQLite ring buffer during network outages."""

    def __init__(self, db_path: str = "edge/local_buffer.db"):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS buffered_readings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                meter_id TEXT NOT NULL,
                payload_json TEXT NOT NULL,
                synced_to_cloud INTEGER DEFAULT 0
            )
        """)
        conn.commit()
        conn.close()

    def store_reading(self, meter_id: str, payload: Dict[str, Any]):
        """Stores reading in local SQLite database."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        now_str = datetime.now(timezone.utc).isoformat()
        cursor.execute("""
            INSERT INTO buffered_readings (timestamp, meter_id, payload_json, synced_to_cloud)
            VALUES (?, ?, ?, 0)
        """, (now_str, meter_id, json.dumps(payload)))
        conn.commit()
        conn.close()

    def get_unsynced_readings(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Retrieves unsynced readings for backfill."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, timestamp, meter_id, payload_json FROM buffered_readings
            WHERE synced_to_cloud = 0 ORDER BY id ASC LIMIT ?
        """, (limit,))
        rows = cursor.fetchall()
        conn.close()
        return [
            {"id": r[0], "timestamp": r[1], "meter_id": r[2], "payload": json.loads(r[3])}
            for r in rows
        ]

    def mark_synced(self, reading_ids: List[int]):
        """Marks records as synchronized to cloud TimescaleDB."""
        if not reading_ids:
            return
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        placeholders = ",".join("?" for _ in reading_ids)
        cursor.execute(f"""
            UPDATE buffered_readings SET synced_to_cloud = 1 WHERE id IN ({placeholders})
        """, reading_ids)
        conn.commit()
        conn.close()
