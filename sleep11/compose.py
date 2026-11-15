"""Финальная сборка: кадры + звук + рекламный баннер (хромакей) → sleep11_demo.mp4."""
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent
tl = json.loads((ROOT / "build/timeline.json").read_text())
cfg = json.loads((ROOT / "script.json").read_text()).get("banner")
out = ROOT / "sleep11_demo.mp4"

cmd = ["ffmpeg", "-v", "error", "-y", "-framerate", "30", "-i", str(ROOT / "build/frames/%05d.jpg"),
       "-i", str(ROOT / "build/mix.wav")]
if cfg and tl.get("banner"):
    bs, dur = tl["banner"]["start"], tl["banner"]["dur"]
    sw, sh = map(int, subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v", "-show_entries",
                                      "stream=width,height", "-of", "csv=p=0", str(ROOT / cfg["file"])],
                                     capture_output=True, text=True, check=True).stdout.strip().split(","))
    y0, y1 = cfg["src_card_y"]
    k = cfg["card_h"] / (y1 - y0 + 1)                    # масштаб: карточка = card_h пикселей по высоте
    bw, bh = round(sw * k / 2) * 2, round(sh * k / 2) * 2
    y = cfg["card_top"] - round(y0 * k)
    crop_w = min(bw, 1080)
    share = cfg["card_h"] * crop_w / (1080 * 1920)
    print(f"баннер {bw}x{bh} (видно {crop_w}), карточка {cfg['card_h']} px = {share:.1%} экрана, y={y}, {bs:.2f}–{bs + dur:.2f} c")
    cmd += ["-i", str(ROOT / cfg["file"])]
    fc = (f"[2:v]fps=30,chromakey={cfg['key_color']}:0.16:0.06,despill=type=green:mix=0.6:expand=0.1,"
          f"scale={bw}:{bh}:flags=lanczos,crop={crop_w}:{bh}:(iw-{crop_w})/2:0,"
          f"setpts=PTS-STARTPTS+{bs}/TB[b];"
          f"[0:v][b]overlay=x={(1080 - crop_w) // 2}:y={y}:eof_action=pass:enable='between(t,{bs},{bs + dur})'[v]")
    cmd += ["-filter_complex", fc, "-map", "[v]", "-map", "1:a"]
cmd += ["-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p", "-profile:v", "high",
        "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", str(out)]
subprocess.run(cmd, check=True)
print(f"✔ {out}")
