"""Монтаж: кадры + звук + рекламный баннер с хромакея → mp4.   python3 engine/compose.py <папка ролика>"""
import json
import subprocess
import sys
from pathlib import Path

vdir = Path(sys.argv[1]).resolve()
script = json.loads((vdir / "script.json").read_text())
tl = json.loads((vdir / "build/timeline.json").read_text())
cfg = script.get("banner")
out = vdir / script.get("output", vdir.name + ".mp4")
cmd = ["ffmpeg", "-v", "error", "-y", "-framerate", "30", "-i", str(vdir / "build/frames/%05d.jpg"), "-i", str(vdir / "build/mix.wav")]
if cfg and tl.get("banner"):
    bs, dur = tl["banner"]["start"], tl["banner"]["dur"]
    src = (vdir / cfg["file"]).resolve()
    sw, sh = map(int, subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v", "-show_entries", "stream=width,height",
                                      "-of", "csv=p=0", str(src)], capture_output=True, text=True, check=True).stdout.strip().split(","))
    y0, y1 = cfg["src_card_y"]
    k = cfg["card_h"] / (y1 - y0 + 1)
    bw, bh = round(sw * k / 2) * 2, round(sh * k / 2) * 2
    cw = min(bw, 1080)
    y = cfg["card_top"] - round(y0 * k)
    print(f"  баннер: карточка {cw}x{cfg['card_h']} = {cfg['card_h'] * cw / (1080 * 1920):.1%} экрана, {bs:.2f}–{bs + dur:.2f} c")
    cmd += ["-i", str(src), "-filter_complex",
            f"[2:v]fps=30,chromakey={cfg['key_color']}:0.16:0.06,despill=type=green:mix=0.6:expand=0.1,"
            f"scale={bw}:{bh}:flags=lanczos,crop={cw}:{bh}:(iw-{cw})/2:0,setpts=PTS-STARTPTS+{bs}/TB[b];"
            f"[0:v][b]overlay=x={(1080 - cw) // 2}:y={y}:eof_action=pass:enable='between(t,{bs},{bs + dur})'[v]",
            "-map", "[v]", "-map", "1:a"]
cmd += ["-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p", "-profile:v", "high",
        "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", str(out)]
subprocess.run(cmd, check=True)
print(f"  ✔ {out}")
