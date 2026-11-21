"""Compile CarbonLoom 180s Project Video ("Vibe to Production in 180 Seconds").
Follows PRD 7.5:
- Exact 6 scenes with durations matching:
  Scene 1: 20s (0:00 - 0:20)
  Scene 2: 25s (0:20 - 0:45)
  Scene 3: 30s (0:45 - 1:15)
  Scene 4: 25s (1:15 - 1:40)
  Scene 5: 45s (1:40 - 2:25)
  Scene 6: 27s (2:25 - 2:52)
  Total duration: 172s (strictly within 168-178s limit, max 181s)
- Audio: Synchronized 172s stereo soundtrack (video/audio_track.wav)
- Visual: 1080p master scene frames (frames/scene_01.png to scene_06.png)
- Output: video/carbonloom_demo_180s.mp4
"""

import os
import shutil
import subprocess
from pathlib import Path

SCENE_DURATIONS = [
    (1, 20),
    (2, 25),
    (3, 30),
    (4, 25),
    (5, 45),
    (6, 29),
]

TOTAL_DURATION = sum(d for _, d in SCENE_DURATIONS)  # 174s

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
        for num, dur in SCENE_DURATIONS:
            frame_abs = (video_dir / "frames" / f"scene_{num:02d}.png").as_posix()
            f.write(f"file '{frame_abs}'\n")
            f.write(f"duration {dur}\n")
        last_frame = (video_dir / "frames" / "scene_06.png").as_posix()
        f.write(f"file '{last_frame}'\n")

    audio_wav = (video_dir / "audio_track.wav").resolve()
    output_mp4 = (video_dir / "carbonloom_demo_180s.mp4").resolve()
    
    cmd = [
        ffmpeg, "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", str(concat_txt),
        "-i", str(audio_wav),
        "-c:v", "libx264",
        "-tune", "stillimage",
        "-pix_fmt", "yuv420p",
        "-r", "30",
        "-c:a", "aac",
        "-b:a", "192k",
        "-t", "174.0",
        str(output_mp4)
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
