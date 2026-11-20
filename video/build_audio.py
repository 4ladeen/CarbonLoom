"""Audio generation for CarbonLoom 180s project video.
Generates a synchronized 172-second ambient techno-industrial audio track with cues.
Standard library only (wave, struct, math).
"""

import math
import struct
import wave
from pathlib import Path

SAMPLE_RATE = 44100
DURATION_SEC = 172  # strictly within 168-178s per PRD 7.5


def generate_audio_track(output_path: str = "video/audio_track.wav") -> str:
    total_samples = int(SAMPLE_RATE * DURATION_SEC)
    output_file = Path(output_path)
    output_file.parent.mkdir(parents=True, exist_ok=True)

    with wave.open(str(output_file), "w") as wav:
        wav.setnchannels(2)  # Stereo
        wav.setsampwidth(2)  # 16-bit
        wav.setframerate(SAMPLE_RATE)

        # Precompute key scene timestamps
        # Scene 1: 0 - 20s
        # Scene 2: 20 - 45s
        # Scene 3: 45 - 75s (TreeSHAP anomaly at 60s)
        # Scene 4: 75 - 100s (Refusal at 90s)
        # Scene 5: 100 - 145s (Tamper test at 130s-140s)
        # Scene 6: 145 - 172s (Enterprise wrapup)

        frames = bytearray()
        batch_size = 4096

        for i in range(0, total_samples, batch_size):
            chunk_frames = bytearray()
            current_batch = min(batch_size, total_samples - i)

            for j in range(current_batch):
                idx = i + j
                t = idx / SAMPLE_RATE

                # Base ambient drone: dual frequency 110Hz (A2) + 164.8Hz (E3) + 220Hz
                drone = (
                    0.15 * math.sin(2 * math.pi * 110 * t)
                    + 0.10 * math.sin(2 * math.pi * 164.8 * t)
                    + 0.05 * math.sin(2 * math.pi * 220 * t)
                )

                # Slow rhythmic pulse every 2 seconds
                pulse = 0.08 * math.sin(math.pi * t) ** 4 * math.sin(2 * math.pi * 55 * t)

                # Transition / alert cues
                cue = 0.0

                # Scene cues (gentle synth chime: 880Hz decay)
                cues_t = [0.1, 20.0, 45.0, 75.0, 100.0, 145.0]
                for ct in cues_t:
                    dt = t - ct
                    if 0 <= dt < 1.2:
                        # Bell chime 880Hz + 1320Hz with exponential decay
                        env = math.exp(-3.5 * dt)
                        cue += 0.25 * env * (math.sin(2 * math.pi * 880 * dt) + 0.5 * math.sin(2 * math.pi * 1320 * dt))

                # Anomaly warning ping at 60.0s (Isolation Forest detection)
                dt_anom = t - 60.0
                if 0 <= dt_anom < 1.5:
                    env = math.exp(-2.5 * dt_anom)
                    cue += 0.3 * env * math.sin(2 * math.pi * 587.33 * dt_anom)  # D5

                # Cryptographic verification success chime at 120.0s (Groth16 <200ms)
                dt_zk = t - 120.0
                if 0 <= dt_zk < 1.5:
                    env = math.exp(-3.0 * dt_zk)
                    cue += 0.35 * env * (math.sin(2 * math.pi * 1046.5 * dt_zk) + math.sin(2 * math.pi * 1318.5 * dt_zk))  # C6 + E6

                # LIVE TAMPER ALERT at 135.0s (Adversarial mutation -> Double Red Alert)
                dt_tamper = t - 135.0
                if 0 <= dt_tamper < 3.0:
                    # Pulsing dissonance 440Hz + 466Hz (tritone/minor second clash)
                    pulse_t = math.sin(2 * math.pi * 6 * dt_tamper)
                    if pulse_t > 0:
                        cue += 0.4 * (math.sin(2 * math.pi * 440 * dt_tamper) + math.sin(2 * math.pi * 466 * dt_tamper))

                # Final crescendo & fade out (last 5 seconds)
                fade = 1.0
                if t > (DURATION_SEC - 4.0):
                    fade = max(0.0, (DURATION_SEC - t) / 4.0)

                sample_val = (drone + pulse + cue) * fade
                # Clamp to [-1.0, 1.0]
                sample_val = max(-1.0, min(1.0, sample_val))
                sample_int = int(sample_val * 32767)

                # Stereo packing (left, right)
                chunk_frames.extend(struct.pack("<hh", sample_int, sample_int))

            wav.writeframes(chunk_frames)

    print(f"Generated {output_path} ({DURATION_SEC}s, {SAMPLE_RATE}Hz, stereo)")
    return output_path


if __name__ == "__main__":
    generate_audio_track()
