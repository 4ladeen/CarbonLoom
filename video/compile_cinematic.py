#!/usr/bin/env python3
"""
CarbonLoom Cinematic Video Compiler
====================================
Builds a 174-second broadcast-quality demo video from 13 master frames with:
  - Ken Burns zoompan effects (varying per shot: zoom-in, pan-left, pan-right)
  - 0.6s crossfade dissolve transitions between shots
  - Permanent visible closed captions baked into each frame
  - Mixed with the 174s audio drone/rhythm track
  - Output: 1920x1080, H.264 High, 30fps, AAC 192kbps

Usage:
    python video/compile_cinematic.py
"""

from __future__ import annotations

import os
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Final

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
FFMPEG: Final[str] = (
    r"C:\Users\maftu\AppData\Local\Microsoft\WinGet\Packages"
    r"\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe"
    r"\ffmpeg-9.1-full_build\bin\ffmpeg.exe"
)
FFPROBE: Final[str] = FFMPEG.replace("ffmpeg.exe", "ffprobe.exe")

PROJECT_ROOT: Final[Path] = Path(__file__).resolve().parent.parent
VIDEO_DIR: Final[Path] = PROJECT_ROOT / "video"
FRAMES_DIR: Final[Path] = VIDEO_DIR / "frames"
AUDIO_PATH: Final[Path] = VIDEO_DIR / "audio_track.wav"
OUTPUT_PATH: Final[Path] = VIDEO_DIR / "carbonloom_demo_180s.mp4"
TEMP_DIR: Final[Path] = VIDEO_DIR / "tmp_clips"

TARGET_DURATION: Final[float] = 174.0
FPS: Final[int] = 30
WIDTH: Final[int] = 1920
HEIGHT: Final[int] = 1080
XFADE_DUR: Final[float] = 0.6  # crossfade duration in seconds


# ---------------------------------------------------------------------------
# Shot definitions
# ---------------------------------------------------------------------------
@dataclass(frozen=True)
class Shot:
    filename: str
    duration: float  # seconds (before transitions eat into it)
    zoom_style: str  # "zoom_in", "zoom_out", "pan_left", "pan_right", "pan_up"


SHOTS: list[Shot] = [
    Shot("shot_01a.png", 10.0, "zoom_in"),
    Shot("shot_01b.png", 10.0, "pan_right"),
    Shot("shot_02a.png", 12.0, "zoom_in"),
    Shot("shot_02b.png", 13.0, "pan_left"),
    Shot("shot_03a.png", 15.0, "zoom_in"),
    Shot("shot_03b.png", 15.0, "pan_right"),
    Shot("shot_04a.png", 12.0, "zoom_in"),
    Shot("shot_04b.png", 13.0, "pan_left"),
    Shot("shot_05a.png", 15.0, "zoom_in"),
    Shot("shot_05b.png", 15.0, "pan_right"),
    Shot("shot_05c.png", 15.0, "zoom_in"),
    Shot("shot_06a.png", 15.0, "pan_left"),
    Shot("shot_06b.png", 14.0, "zoom_in"),
]


def _build_zoompan_filter(shot: Shot) -> str:
    """Build zoompan filter string for a single shot.

    We upscale the source to 2x (3840x2160) so there's room to zoom/pan,
    then zoompan outputs at 1920x1080.
    """
    n_frames: int = int(shot.duration * FPS)
    # Zoom factor range: 1.0 → 1.12 (subtle, not jarring)
    # We express zoom on the upscaled canvas, so zoom=1.0 means full 3840→1920
    if shot.zoom_style == "zoom_in":
        # Slow zoom into center
        z = f"min(zoom+0.0004,1.12)"
        x = "iw/2-(iw/zoom/2)"
        y = "ih/2-(ih/zoom/2)"
    elif shot.zoom_style == "zoom_out":
        # Start zoomed in, pull out
        z = f"if(eq(on,1),1.12,max(zoom-0.0004,1.0))"
        x = "iw/2-(iw/zoom/2)"
        y = "ih/2-(ih/zoom/2)"
    elif shot.zoom_style == "pan_right":
        # Slight zoom + drift right
        z = f"min(zoom+0.0002,1.08)"
        x = f"if(eq(on,1),0,min(x+0.4,iw/2-(iw/zoom/2)*2))"
        y = "ih/2-(ih/zoom/2)"
    elif shot.zoom_style == "pan_left":
        # Slight zoom + drift left
        z = f"min(zoom+0.0002,1.08)"
        x = f"if(eq(on,1),iw/zoom/4,max(x-0.4,0))"
        y = "ih/2-(ih/zoom/2)"
    elif shot.zoom_style == "pan_up":
        z = f"min(zoom+0.0002,1.08)"
        x = "iw/2-(iw/zoom/2)"
        y = f"if(eq(on,1),ih/zoom/4,max(y-0.4,0))"
    else:
        # Fallback: gentle zoom in
        z = f"min(zoom+0.0003,1.10)"
        x = "iw/2-(iw/zoom/2)"
        y = "ih/2-(ih/zoom/2)"

    return (
        f"scale=3840:2160,"
        f"zoompan=z='{z}':x='{x}':y='{y}'"
        f":d={n_frames}:s={WIDTH}x{HEIGHT}:fps={FPS}"
    )


def _run(cmd: list[str], desc: str) -> None:
    """Run a subprocess, raise on failure."""
    print(f"\n{'='*60}")
    print(f"  {desc}")
    print(f"{'='*60}")
    print(f"  CMD: {' '.join(cmd[:6])}...")
    result = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        timeout=600,
    )
    if result.returncode != 0:
        print(f"STDERR:\n{result.stderr[-2000:]}")
        raise RuntimeError(f"FFmpeg failed for: {desc}")
    print(f"  OK")


def step1_generate_clips() -> list[Path]:
    """Generate individual MP4 clips with Ken Burns zoompan for each shot."""
    TEMP_DIR.mkdir(parents=True, exist_ok=True)
    clip_paths: list[Path] = []

    for i, shot in enumerate(SHOTS):
        clip_path = TEMP_DIR / f"clip_{i:02d}.mp4"
        clip_paths.append(clip_path)

        if clip_path.exists():
            clip_path.unlink()

        zp_filter = _build_zoompan_filter(shot)
        src = FRAMES_DIR / shot.filename

        cmd = [
            FFMPEG,
            "-y",
            "-loop", "1",
            "-i", str(src),
            "-vf", zp_filter,
            "-t", str(shot.duration),
            "-c:v", "libx264",
            "-preset", "medium",
            "-crf", "18",
            "-pix_fmt", "yuv420p",
            "-r", str(FPS),
            str(clip_path),
        ]
        _run(cmd, f"Clip {i+1}/{len(SHOTS)}: {shot.filename} ({shot.duration}s, {shot.zoom_style})")

    return clip_paths


def step2_concatenate_with_crossfades(clip_paths: list[Path]) -> Path:
    """Chain all clips with xfade crossfade transitions.

    Uses FFmpeg complex filtergraph with sequential xfade filters.
    Each transition is 0.6s dissolve, which eats XFADE_DUR from each clip.
    """
    concat_output = TEMP_DIR / "concat_xfade.mp4"
    if concat_output.exists():
        concat_output.unlink()

    n = len(clip_paths)

    # Build the complex filter
    # Input labels: [0:v], [1:v], ..., [12:v]
    # We chain xfade filters:
    #   [0:v][1:v] xfade=... [v01]
    #   [v01][2:v] xfade=... [v02]
    #   ...
    filter_parts: list[str] = []
    offsets: list[float] = []

    # Calculate offsets: each clip starts at previous_offset + previous_duration - XFADE_DUR
    cumulative: float = 0.0
    for i in range(n):
        if i == 0:
            offsets.append(0.0)
        else:
            offsets.append(cumulative - XFADE_DUR)
        cumulative = offsets[i] + SHOTS[i].duration

    # Build xfade chain
    prev_label = "[0:v]"
    for i in range(1, n):
        # Offset for xfade is when the transition starts (from start of output timeline)
        xfade_offset = offsets[i]
        out_label = f"[v{i:02d}]"
        # Use different transition effects for variety
        transitions = ["fade", "fadeblack", "slideleft", "smoothleft", "fade",
                       "fadeblack", "slideright", "smoothright", "fade",
                       "fadeblack", "slideleft", "smoothleft"]
        t_type = transitions[(i - 1) % len(transitions)]

        filter_parts.append(
            f"{prev_label}[{i}:v]xfade=transition={t_type}"
            f":duration={XFADE_DUR}:offset={xfade_offset:.3f}{out_label}"
        )
        prev_label = out_label

    # Final: set pixel format
    final_label = prev_label.strip("[]")
    filter_parts.append(f"[{final_label}]format=yuv420p[vout]")

    filter_str = ";\n".join(filter_parts)

    # Build command
    cmd = [FFMPEG, "-y"]
    for cp in clip_paths:
        cmd.extend(["-i", str(cp)])

    cmd.extend([
        "-filter_complex", filter_str,
        "-map", "[vout]",
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "18",
        "-r", str(FPS),
        "-t", str(TARGET_DURATION),
        str(concat_output),
    ])

    _run(cmd, "Concatenate with crossfade transitions")
    return concat_output


def step3_mix_audio(video_path: Path) -> Path:
    """Mix the audio track with the video."""
    if OUTPUT_PATH.exists():
        OUTPUT_PATH.unlink()

    cmd = [
        FFMPEG,
        "-y",
        "-i", str(video_path),
        "-i", str(AUDIO_PATH),
        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "192k",
        "-map", "0:v:0",
        "-map", "1:a:0",
        "-t", str(TARGET_DURATION),
        "-movflags", "+faststart",
        str(OUTPUT_PATH),
    ]
    _run(cmd, "Mix audio track")
    return OUTPUT_PATH


def step4_verify(output: Path) -> None:
    """Verify the final video meets specs."""
    result = subprocess.run(
        [FFPROBE, "-v", "error", "-show_entries",
         "format=duration,size", "-show_entries",
         "stream=width,height,codec_name,r_frame_rate",
         "-of", "json", str(output)],
        capture_output=True, text=True,
    )
    print(f"\n{'='*60}")
    print("  VERIFICATION")
    print(f"{'='*60}")
    print(result.stdout)

    # Quick duration check
    dur_result = subprocess.run(
        [FFPROBE, "-v", "error", "-show_entries", "format=duration",
         "-of", "csv=p=0", str(output)],
        capture_output=True, text=True,
    )
    duration = float(dur_result.stdout.strip())
    size_mb = output.stat().st_size / (1024 * 1024)

    print(f"  Duration: {duration:.3f}s (target: {TARGET_DURATION}s)")
    print(f"  File size: {size_mb:.2f} MB")
    print(f"  Path: {output}")

    if abs(duration - TARGET_DURATION) > 2.0:
        print(f"  WARNING: Duration {duration}s deviates from target {TARGET_DURATION}s")
    else:
        print(f"  OK: Duration within tolerance")


def step5_cleanup() -> None:
    """Remove temporary clips."""
    import shutil
    if TEMP_DIR.exists():
        shutil.rmtree(TEMP_DIR)
        print(f"\n  Cleaned up {TEMP_DIR}")


def main() -> None:
    print("=" * 60)
    print("  CarbonLoom Cinematic Video Compiler")
    print("=" * 60)

    # Verify prerequisites
    for path in [Path(FFMPEG), FRAMES_DIR, AUDIO_PATH]:
        if not path.exists():
            print(f"ERROR: Missing: {path}")
            sys.exit(1)

    for shot in SHOTS:
        src = FRAMES_DIR / shot.filename
        if not src.exists():
            print(f"ERROR: Missing frame: {src}")
            sys.exit(1)

    print(f"\n  Shots: {len(SHOTS)}")
    print(f"  Target duration: {TARGET_DURATION}s")
    print(f"  Resolution: {WIDTH}x{HEIGHT} @ {FPS}fps")
    print(f"  Crossfade: {XFADE_DUR}s dissolve")

    # Step 1: Generate individual clips with Ken Burns
    clip_paths = step1_generate_clips()

    # Step 2: Concatenate with crossfade transitions
    concat_path = step2_concatenate_with_crossfades(clip_paths)

    # Step 3: Mix audio
    final_path = step3_mix_audio(concat_path)

    # Step 4: Verify
    step4_verify(final_path)

    # Step 5: Cleanup temp files
    step5_cleanup()

    print(f"\n{'='*60}")
    print(f"  DONE: {final_path}")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
