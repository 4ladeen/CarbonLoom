#!/usr/bin/env python3
"""
CarbonLoom Demo Video Assembler (Clean & Simple)
================================================
- Strictly NO zoom effects / NO zoompan
- Strictly NO sound effects / NO alarms / NO beeps
- Clear, well-paced spoken voiceover
- Crisp captions baked into bottom HUD + embedded mov_text subtitle stream
- Native 1920x1080 @ 30fps H.264 High Profile, AAC stereo 192kbps
- Exact duration: 174.000 seconds
"""

from __future__ import annotations

import json
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
FRAMES_DIR: Final[Path] = VIDEO_DIR / "frames"
VOICEOVER_WAV: Final[Path] = VIDEO_DIR / "voiceover_master.wav"
SRT_PATH: Final[Path] = VIDEO_DIR / "carbonloom_demo_180s.srt"
OUTPUT_MP4: Final[Path] = VIDEO_DIR / "carbonloom_demo_180s.mp4"

SHOT_SPECS: list[dict[str, str | float]] = [
    {"id": "1a", "file": "shot_01a.png", "dur": 15.0},
    {"id": "1b", "file": "shot_01b.png", "dur": 12.5},
    {"id": "2a", "file": "shot_02a.png", "dur": 11.5},
    {"id": "2b", "file": "shot_02b.png", "dur": 14.7},
    {"id": "3a", "file": "shot_03a.png", "dur": 13.8},
    {"id": "3b", "file": "shot_03b.png", "dur": 12.5},
    {"id": "4a", "file": "shot_04a.png", "dur": 12.5},
    {"id": "4b", "file": "shot_04b.png", "dur": 12.5},
    {"id": "5a", "file": "shot_05a.png", "dur": 16.1},
    {"id": "5b", "file": "shot_05b.png", "dur": 13.4},
    {"id": "5c", "file": "shot_05c.png", "dur": 13.3},
    {"id": "6a", "file": "shot_06a.png", "dur": 12.5},
    {"id": "6b", "file": "shot_06b.png", "dur": 13.7},
]


def assemble_video() -> Path:
    assert VOICEOVER_WAV.exists(), f"Missing audio: {VOICEOVER_WAV}"
    assert SRT_PATH.exists(), f"Missing srt: {SRT_PATH}"

    # Build concat file for FFmpeg
    concat_file = VIDEO_DIR / "frames_concat.txt"
    concat_lines: list[str] = []
    
    total_dur = 0.0
    for shot in SHOT_SPECS:
        fpath = (FRAMES_DIR / str(shot["file"])).resolve().as_posix()
        dur = float(shot["dur"])
        total_dur += dur
        concat_lines.append(f"file '{fpath}'")
        concat_lines.append(f"duration {dur:.4f}")

    # FFmpeg concat demuxer requires repeating last file without duration
    last_file = (FRAMES_DIR / str(SHOT_SPECS[-1]["file"])).resolve().as_posix()
    concat_lines.append(f"file '{last_file}'")

    concat_file.write_text("\n".join(concat_lines), encoding="utf-8")
    print(f"Total calculated duration: {total_dur:.2f}s")

    if OUTPUT_MP4.exists():
        OUTPUT_MP4.unlink()

    # Encode video + voiceover + mov_text subtitle stream
    cmd = [
        FFMPEG,
        "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", str(concat_file),
        "-i", str(VOICEOVER_WAV),
        "-i", str(SRT_PATH),
        "-map", "0:v:0",
        "-map", "1:a:0",
        "-map", "2:s:0?",
        "-c:v", "libx264",
        "-profile:v", "high",
        "-level:v", "4.1",
        "-pix_fmt", "yuv420p",
        "-preset", "medium",
        "-crf", "19",
        "-r", "30",
        "-c:a", "aac",
        "-b:a", "192k",
        "-ar", "44100",
        "-c:s", "mov_text",
        "-metadata:s:s:0", "language=eng",
        "-metadata:s:s:0", "title=English Captions",
        "-t", "174.0",
        "-movflags", "+faststart",
        str(OUTPUT_MP4),
    ]

    print("Running FFmpeg encoding...")
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print("FFmpeg failed:\n", res.stderr[-2000:])
        raise RuntimeError("Video assembly failed")

    print(f"Video created: {OUTPUT_MP4}")

    # Clean up concat file
    if concat_file.exists():
        concat_file.unlink()

    # Verification
    verify_video(OUTPUT_MP4)
    return OUTPUT_MP4


def verify_video(video_path: Path) -> None:
    probe_cmd = [
        FFPROBE,
        "-v", "error",
        "-show_entries", "format=duration,size,bit_rate",
        "-show_entries", "stream=codec_name,codec_type,width,height,r_frame_rate",
        "-of", "json",
        str(video_path),
    ]
    res = subprocess.run(probe_cmd, capture_output=True, text=True, check=True)
    data = json.loads(res.stdout)
    
    print("\n" + "=" * 60)
    print("  FINAL VIDEO VERIFICATION")
    print("=" * 60)
    dur = float(data["format"]["duration"])
    size_mb = float(data["format"]["size"]) / (1024 * 1024)
    print(f"  Path: {video_path}")
    print(f"  Duration: {dur:.3f}s (target: 174.000s)")
    print(f"  Size: {size_mb:.2f} MB")
    
    for s in data["streams"]:
        print(f"  Stream ({s['codec_type']}): codec={s['codec_name']}, details={s.get('width', '')}x{s.get('height', '')} @ {s.get('r_frame_rate', '')}")
    print("=" * 60)


if __name__ == "__main__":
    assemble_video()
