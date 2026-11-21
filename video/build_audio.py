"""Audio track generator for CarbonLoom 174s Project Video.
Synthesizes a 44.1kHz stereo tech soundtrack with atmospheric synth drone,
tempo pulses, scene transition bell chimes, and alert cues.
Standard library only (wave, struct, math).
"""

import math
import struct
import wave
from pathlib import Path

SAMPLE_RATE = 44100
DURATION_SEC = 174.0  # strictly within 168-178s limit (max 181s) per PRD 7.5


def generate_soundtrack(output_path: str = "video/audio_track.wav") -> str:
    total_samples = int(SAMPLE_RATE * DURATION_SEC)
    output_file = Path(output_path)
    output_file.parent.mkdir(parents=True, exist_ok=True)

    with wave.open(str(output_file), "w") as wav:
        wav.setnchannels(2)  # Stereo
        wav.setsampwidth(2)  # 16-bit
        wav.setframerate(SAMPLE_RATE)

        # Precompute key scene timestamps
        # Scene 1: 0.0 - 20.0s (The Double Squeeze)
        # Scene 2: 20.0 - 45.0s (Bilingual Ingestion & MCP Gateway)
        # Scene 3: 45.0 - 75.0s (Forensic XAI Waste Detection, ping at 58.0s)
        # Scene 4: 75.0 - 100.0s (Bangla GraphRAG & Refusal)
        # Scene 5: 100.0 - 145.0s (SMV & Tamper Demo, ZK chime at 118.0s, Alarm at 134.0s)
        # Scene 6: 145.0 - 174.0s (Business Model & Provenance)

        batch_size = 4096

        for i in range(0, total_samples, batch_size):
            chunk_frames = bytearray()
            current_batch = min(batch_size, total_samples - i)

            for j in range(current_batch):
                idx = i + j
                t = idx / SAMPLE_RATE

                # 1. Warm ambient synth drone: 110Hz (A2) + 164.8Hz (E3) + 220Hz (A3)
                drone = (
                    0.14 * math.sin(2 * math.pi * 110 * t)
                    + 0.09 * math.sin(2 * math.pi * 164.81 * t)
                    + 0.05 * math.sin(2 * math.pi * 220 * t)
                )

                # 2. Slow hypnotic industrial heartbeat rhythm (0.5 Hz / every 2s)
                pulse = 0.07 * (math.sin(math.pi * t) ** 6) * math.sin(2 * math.pi * 55 * t)

                # 3. Transition chimes at scene boundaries
                cue = 0.0
                scene_cues = [0.1, 20.0, 45.0, 75.0, 100.0, 145.0]
                for ct in scene_cues:
                    dt = t - ct
                    if 0 <= dt < 1.4:
                        env = math.exp(-3.0 * dt)
                        # Bell chime: 880Hz (A5) + 1320Hz (E6)
                        cue += 0.22 * env * (math.sin(2 * math.pi * 880 * dt) + 0.5 * math.sin(2 * math.pi * 1320 * dt))

                # 4. Anomaly ping at 58.0s (Isolation Forest steam-trap detection)
                dt_anom = t - 58.0
                if 0 <= dt_anom < 1.6:
                    env = math.exp(-2.2 * dt_anom)
                    cue += 0.28 * env * math.sin(2 * math.pi * 587.33 * dt_anom)  # D5 ping

                # 5. Cryptographic verification success chime at 118.0s (Groth16 <142ms)
                dt_zk = t - 118.0
                if 0 <= dt_zk < 1.6:
                    env = math.exp(-2.8 * dt_zk)
                    cue += 0.32 * env * (math.sin(2 * math.pi * 1046.5 * dt_zk) + math.sin(2 * math.pi * 1318.5 * dt_zk))  # C6 + E6

                # 6. LIVE TAMPER ALERT at 134.0s (Adversarial mutation -> Dual-layer red alert buzzer)
                dt_tamper = t - 134.0
                if 0 <= dt_tamper < 3.5:
                    # Staccato harsh alert pulse (6Hz rate, dissonance 440Hz + 466Hz)
                    pulse_t = math.sin(2 * math.pi * 6 * dt_tamper)
                    if pulse_t > 0:
                        cue += 0.45 * (math.sin(2 * math.pi * 440 * dt_tamper) + math.sin(2 * math.pi * 466.16 * dt_tamper))

                # 7. Final smooth fade out in last 4 seconds
                fade = 1.0
                if t > (DURATION_SEC - 4.0):
                    fade = max(0.0, (DURATION_SEC - t) / 4.0)

                sample_val = (drone + pulse + cue) * fade
                sample_val = max(-1.0, min(1.0, sample_val))
                sample_int = int(sample_val * 32767)

                # Stereo packing (L, R)
                chunk_frames.extend(struct.pack("<hh", sample_int, sample_int))

            wav.writeframes(chunk_frames)

    print(f"Generated soundtrack {output_path} ({DURATION_SEC}s, {SAMPLE_RATE}Hz stereo)")
    return output_path


if __name__ == "__main__":
    generate_soundtrack()
