#!/usr/bin/env python3
"""
Assemble the 174.0s master voiceover audio track from 13 spoken voice clips.
Strictly NO sound effects, NO synth beeps, NO alarm buzzers, NO transition chimes.
Pure, clean, well-leveled spoken voiceover narration.
"""

from __future__ import annotations

import subprocess
from pathlib import Path
from typing import Final

FFMPEG: Final[str] = (
    r"C:\Users\maftu\AppData\Local\Microsoft\WinGet\Packages"
    r"\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe"
    r"\ffmpeg-9.1-full_build\bin\ffmpeg.exe"
)
FFPROBE: Final[str] = FFMPEG.replace("ffmpeg.exe", "ffprobe.exe")

VIDEO_DIR: Final[Path] = Path(__file__).resolve().parent
VOICE_DIR: Final[Path] = VIDEO_DIR / "voice_clips"
OUTPUT_WAV: Final[Path] = VIDEO_DIR / "voiceover_master.wav"

# 13 shots with their exact target durations summing to 174.0s
SHOT_SPECS: list[dict[str, str | float]] = [
    {"id": "1a", "dur": 15.0, "lead_in": 0.30},
    {"id": "1b", "dur": 12.5, "lead_in": 0.25},
    {"id": "2a", "dur": 11.5, "lead_in": 0.30},
    {"id": "2b", "dur": 14.7, "lead_in": 0.30},
    {"id": "3a", "dur": 13.8, "lead_in": 0.20},
    {"id": "3b", "dur": 12.5, "lead_in": 0.30},
    {"id": "4a", "dur": 12.5, "lead_in": 0.25},
    {"id": "4b", "dur": 12.5, "lead_in": 0.25},
    {"id": "5a", "dur": 16.1, "lead_in": 0.30},
    {"id": "5b", "dur": 13.4, "lead_in": 0.20},
    {"id": "5c", "dur": 13.3, "lead_in": 0.20},
    {"id": "6a", "dur": 12.5, "lead_in": 0.25},
    {"id": "6b", "dur": 13.7, "lead_in": 0.30},
]

SAMPLE_RATE = 44100


def get_clip_duration(clip_path: Path) -> float:
    cmd = [
        FFPROBE,
        "-v", "error",
        "-show_entries", "format=duration",
        "-of", "csv=p=0",
        str(clip_path),
    ]
    res = subprocess.run(cmd, capture_output=True, text=True, check=True)
    return float(res.stdout.strip())


def build_master_voiceover() -> Path:
    total_target_dur = sum(float(s["dur"]) for s in SHOT_SPECS)
    print(f"Total target duration: {total_target_dur:.2f}s")
    assert abs(total_target_dur - 174.0) < 0.001, f"Expected 174.0s, got {total_target_dur}"

    padded_clips: list[Path] = []
    tmp_dir = VIDEO_DIR / "tmp_audio_padded"
    tmp_dir.mkdir(parents=True, exist_ok=True)

    for i, spec in enumerate(SHOT_SPECS):
        shot_id = str(spec["id"])
        target_dur = float(spec["dur"])
        lead_in = float(spec["lead_in"])
        raw_clip = VOICE_DIR / f"clip_{shot_id}.wav"

        actual_dur = get_clip_duration(raw_clip)
        print(f"Shot {shot_id}: raw voice {actual_dur:.2f}s, target shot {target_dur:.2f}s, lead_in {lead_in:.2f}s")

        lead_in_ms = int(lead_in * 1000)
        padded_wav = tmp_dir / f"padded_{i:02d}_{shot_id}.wav"

        # Apply adelay for lead_in, apad to extend to target duration, and clean leveling
        filter_str = (
            f"aresample={SAMPLE_RATE},"
            f"aformat=sample_fmts=s16:channel_layouts=stereo,"
            f"adelay={lead_in_ms}|{lead_in_ms},"
            f"apad,"
            f"volume=1.3,"
            f"highpass=f=80,lowpass=f=11000"
        )

        cmd = [
            FFMPEG,
            "-y",
            "-i", str(raw_clip),
            "-af", filter_str,
            "-t", f"{target_dur:.4f}",
            str(padded_wav),
        ]
        subprocess.run(cmd, capture_output=True, text=True, check=True)
        padded_clips.append(padded_wav)

    # Concat all padded clips
    concat_list_file = tmp_dir / "concat_list.txt"
    lines = [f"file '{p.resolve().as_posix()}'" for p in padded_clips]
    concat_list_file.write_text("\n".join(lines), encoding="utf-8")

    if OUTPUT_WAV.exists():
        OUTPUT_WAV.unlink()

    cmd = [
        FFMPEG,
        "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", str(concat_list_file),
        "-c:a", "pcm_s16le",
        "-t", "174.0",
        str(OUTPUT_WAV),
    ]
    subprocess.run(cmd, capture_output=True, text=True, check=True)

    # Verify duration
    res = subprocess.run(
        [FFPROBE, "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(OUTPUT_WAV)],
        capture_output=True, text=True, check=True
    )
    final_dur = float(res.stdout.strip())
    print(f"Master voiceover generated: {OUTPUT_WAV} ({final_dur:.3f}s)")

    # Cleanup temp
    import shutil
    shutil.rmtree(tmp_dir)

    return OUTPUT_WAV


if __name__ == "__main__":
    build_master_voiceover()
