"""Compile CarbonLoom Broadcast Master 174s Demo Video.
Follows PRD Section 7.5:
- 13 dynamic, high-fidelity live demo shots across 6 core scenes:
  Scene 1 (20s): Shot 1a (10s) -> Shot 1b (10s)
  Scene 2 (25s): Shot 2a (12s) -> Shot 2b (13s)
  Scene 3 (30s): Shot 3a (15s) -> Shot 3b (15s)
  Scene 4 (25s): Shot 4a (12s) -> Shot 4b (13s)
  Scene 5 (45s): Shot 5a (15s) -> Shot 5b (15s) -> Shot 5c (15s)
  Scene 6 (29s): Shot 6a (15s) -> Shot 6b (14s)
- Audio: Synchronized 174.0s soundtrack (video/audio_track.wav)
- Output: video/carbonloom_demo_180s.mp4 (strict 174.0s, < 180s)
"""

import os
import shutil
import subprocess
from pathlib import Path

SHOT_DURATIONS = [
    ("shot_01a.png", 10.0),
    ("shot_01b.png", 10.0),
    ("shot_02a.png", 12.0),
    ("shot_02b.png", 13.0),
    ("shot_03a.png", 15.0),
    ("shot_03b.png", 15.0),
    ("shot_04a.png", 12.0),
    ("shot_04b.png", 13.0),
    ("shot_05a.png", 15.0),
    ("shot_05b.png", 15.0),
    ("shot_05c.png", 15.0),
    ("shot_06a.png", 15.0),
    ("shot_06b.png", 14.0),
]

TOTAL_DURATION = sum(d for _, d in SHOT_DURATIONS)  # 174.0s

KNOWN_FFMPEG = r"C:\Users\maftu\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.1-full_build\bin\ffmpeg.exe"


def get_ffmpeg() -> str:
    if os.path.exists(KNOWN_FFMPEG):
        return KNOWN_FFMPEG
    which = shutil.which("ffmpeg")
    if which:
        return which
    raise FileNotFoundError("FFmpeg executable not found")


def compile_video():
    ffmpeg = get_ffmpeg()
    print(f"Using FFmpeg: {ffmpeg}")

    video_dir = Path("video").resolve()
    concat_txt = video_dir / "concat_list.txt"

    with open(concat_txt, "w", encoding="utf-8") as f:
        for filename, dur in SHOT_DURATIONS:
            frame_abs = (video_dir / "frames" / filename).as_posix()
            f.write(f"file '{frame_abs}'\n")
            f.write(f"duration {dur}\n")
        # Demuxer requires repeating the last file
        last_frame = (video_dir / "frames" / SHOT_DURATIONS[-1][0]).as_posix()
        f.write(f"file '{last_frame}'\n")

    audio_wav = (video_dir / "audio_track.wav").resolve()
    output_mp4 = (video_dir / "carbonloom_demo_180s.mp4").resolve()

    cmd = [
        ffmpeg,
        "-y",
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        str(concat_txt),
        "-i",
        str(audio_wav),
        "-c:v",
        "libx264",
        "-tune",
        "stillimage",
        "-pix_fmt",
        "yuv420p",
        "-r",
        "30",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-t",
        "174.0",
        str(output_mp4),
    ]

    print("Running FFmpeg command:")
    print(" ".join(cmd))
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode == 0:
        file_size_mb = output_mp4.stat().st_size / (1024 * 1024)
        print(f"SUCCESS: Generated {output_mp4} ({file_size_mb:.2f} MB)")
        return str(output_mp4)
    else:
        print(f"ERROR ({res.returncode}):\n{res.stderr}")
        return None


if __name__ == "__main__":
    compile_video()
