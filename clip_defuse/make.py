"""Баннер поверх готового ролика: python3 make.py
Баннер RubUP (27% кадра) в правом верхнем углу, звук ролика под баннером приглушается,
озвучка баннера выравнивается по громкости ролика, итог нормализуется до -14 LUFS."""
import subprocess
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent
SRC, BANNER, OUT = ROOT / "source.mp4", ROOT.parent / "assets" / "banner_rubup.mp4", ROOT / "id0cs_rubup.mp4"
START, SHARE, MARGIN, DUCK = 3.0, 0.27, 20, 0.2   # начало, доля кадра, отступ, приглушение (0.2 = −14 дБ)


def probe(p, what):
    return subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v" if what != "dur" else "a", "-show_entries",
                           "stream=width,height" if what != "dur" else "format=duration", "-of", "csv=p=0", str(p)],
                          capture_output=True, text=True, check=True).stdout.strip()


def pcm(p):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(p), "-vn", "-ac", "1", "-ar", "44100", "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)


def active_rms(x):
    e = np.sqrt(np.convolve(x ** 2, np.ones(2205) / 2205, mode="same"))
    return np.sqrt(np.mean(x[e > .3 * e.max()] ** 2))


W, H = map(int, probe(SRC, "v").split(","))
bw0, bh0 = map(int, probe(BANNER, "v").split(","))
bdur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(BANNER)], capture_output=True, text=True).stdout)
bw = int(np.ceil((SHARE * W * H * bw0 / bh0) ** .5 / 2) * 2)
bh = int(round(bw * bh0 / bw0 / 2) * 2)
while bw * bh < SHARE * W * H:
    bw += 2; bh = int(round(bw * bh0 / bw0 / 2) * 2)
x, y = W - bw - 12, 0   # над полосой разминирования (она на y 292–352) — баннер прижат к верху
end = START + bdur
gain = active_rms(pcm(SRC)) / active_rms(pcm(BANNER))
mask = ROOT / "mask.png"
m = Image.new("L", (bw, bh), 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, bw - 1, bh - 1], radius=max(8, bh // 18), fill=255); m.save(mask)
print(f"баннер {bw}x{bh} = {bw * bh / (W * H):.1%} кадра, x={x} y={y}, {START:.2f}–{end:.2f} c, озвучка x{gain:.2f}")

duck = f"1-{1 - DUCK}*min(1,max(0,(t-{START - .2})/0.2))*min(1,max(0,({end + .1}-t)/0.15))"
fc = (f"[1:v]fps=30,scale={bw}:{bh}:flags=lanczos,format=yuva420p[bs];[2:v]format=gray,scale={bw}:{bh}[m];"
      f"[bs][m]alphamerge,setpts=PTS-STARTPTS+{START}/TB[b];"
      f"[0:v][b]overlay=x={x}:y={y}:eof_action=pass:enable='between(t,{START},{end})'[v];"
      f"[0:a]volume='{duck}':eval=frame[ga];[1:a]volume={gain:.3f},adelay={int(START * 1000)}|{int(START * 1000)}[ba];"
      f"[ga][ba]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11[a]")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(SRC), "-i", str(BANNER), "-loop", "1", "-framerate", "30", "-t", f"{bdur:.2f}", "-i", str(mask),
                "-filter_complex", fc, "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p",
                "-ar", "44100", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", str(OUT)], check=True)
mask.unlink()
print(f"✔ {OUT}")
