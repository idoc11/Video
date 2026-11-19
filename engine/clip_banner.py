"""Рекламный баннер в готовый ролик.

  python3 engine/clip_banner.py SRC OUT --start 6.2 --pos bottom            # поверх видео, звук ролика приглушается
  python3 engine/clip_banner.py SRC OUT --start 6.7 --pos center --pause    # «рекламная пауза»: кадр замирает, ролик ждёт

--pos: top-right | top-left | bottom | top | center | X,Y
--share: доля кадра под баннер (по площади), по умолчанию 0.27
Озвучка баннера выравнивается по громкости ролика, фон под ней приглушается на 14 дБ (или ролик стоит на паузе),
итог нормализуется до -14 LUFS.
"""
import argparse
import subprocess
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
ap = argparse.ArgumentParser()
ap.add_argument("src"); ap.add_argument("out")
ap.add_argument("--banner", default=str(ROOT / "assets" / "banner_rubup.mp4"))
ap.add_argument("--start", type=float, required=True)
ap.add_argument("--pos", default="top-right")
ap.add_argument("--share", type=float, default=0.27)
ap.add_argument("--pause", action="store_true")
ap.add_argument("--duck", type=float, default=0.2)
ap.add_argument("--fade", type=float, default=0.0, help="плавное появление баннера, сек")
ap.add_argument("--dim", type=float, default=0.0, help="затемнение основного видео на время баннера (0.1 = лёгкое)")
a = ap.parse_args()


def vsize(p):
    return map(int, subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v", "-show_entries", "stream=width,height", "-of", "csv=p=0", p],
                                   capture_output=True, text=True, check=True).stdout.strip().split(","))


def dur(p):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p], capture_output=True, text=True).stdout)


def pcm(p):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-vn", "-ac", "1", "-ar", "44100", "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)


def active_rms(x):
    e = np.sqrt(np.convolve(x ** 2, np.ones(2205) / 2205, mode="same"))
    return np.sqrt(np.mean(x[e > .3 * e.max()] ** 2))


W, H = vsize(a.src)
bw0, bh0 = vsize(a.banner)
D = dur(a.banner)
bw = int(np.ceil((a.share * W * H * bw0 / bh0) ** .5 / 2) * 2)
bh = int(round(bw * bh0 / bw0 / 2) * 2)
while bw * bh < a.share * W * H:
    bw += 2; bh = int(round(bw * bh0 / bw0 / 2) * 2)
m = 12
pos = {"top-right": (W - bw - m, m), "top-left": (m, m), "top": ((W - bw) // 2, 0), "bottom": ((W - bw) // 2, H - bh),
       "center": ((W - bw) // 2, (H - bh) // 2)}
x, y = pos[a.pos] if a.pos in pos else map(int, a.pos.split(","))
gain = active_rms(pcm(a.src)) / active_rms(pcm(a.banner))
mask = Path(a.out).with_suffix(".mask.png")
mk = Image.new("L", (bw, bh), 0); ImageDraw.Draw(mk).rounded_rectangle([0, 0, bw - 1, bh - 1], radius=max(8, bh // 18), fill=255); mk.save(mask)
T, E = a.start, a.start + D
print(f"  баннер {bw}x{bh} = {bw * bh / (W * H):.1%} кадра, x={x} y={y}, {T:.2f}–{E:.2f} c, {'пауза' if a.pause else 'поверх'}, озвучка x{gain:.2f}")

fade = f",fade=t=in:st=0:d={a.fade}:alpha=1" if a.fade else ""
ban = (f"[1:v]fps=30,scale={bw}:{bh}:flags=lanczos,format=yuva420p[bs];[2:v]format=gray,scale={bw}:{bh}[m];"
       f"[bs][m]alphamerge{fade},setpts=PTS-STARTPTS+{T}/TB[b];")
bau = f"[1:a]aresample=44100,aformat=channel_layouts=stereo,volume={gain:.3f},adelay={int(T * 1000)}|{int(T * 1000)}[ba];"
if a.pause:
    fc = (ban + bau +
          f"[0:v]split[v1][v2];[v1]trim=0:{T},setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration={D}[va];"
          f"[v2]trim=start={T},setpts=PTS-STARTPTS[vb];[va][vb]concat=n=2:v=1:a=0[vc];"
          f"[vc]eq=brightness=-0.12:saturation=0.6:enable='between(t,{T},{E})'[vd];"
          f"[vd][b]overlay=x={x}:y={y}:eof_action=pass:enable='between(t,{T},{E})'[v];"
          f"[0:a]aresample=44100,aformat=channel_layouts=stereo,asplit[a1][a2];[a1]atrim=0:{T},asetpts=PTS-STARTPTS,apad=pad_dur={D}[aa];"
          f"[a2]atrim=start={T},asetpts=PTS-STARTPTS[ab];[aa][ab]concat=n=2:v=0:a=1[ac];"
          f"[ac][ba]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11[a]")
else:
    dimf = f"eq=brightness=-{a.dim}:enable='between(t,{T},{E})'" if a.dim else "null"
    duck = f"1-{1 - a.duck}*min(1,max(0,(t-{T - .2})/0.2))*min(1,max(0,({E + .1}-t)/0.15))"
    fc = (ban + bau +
          f"[0:v]{dimf}[d0];[d0][b]overlay=x={x}:y={y}:eof_action=pass:enable='between(t,{T},{E})'[v];"
          f"[0:a]aresample=44100,aformat=channel_layouts=stereo,volume='{duck}':eval=frame[ga];"
          f"[ga][ba]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11[a]")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", a.src, "-i", a.banner, "-loop", "1", "-framerate", "30", "-t", f"{D:.2f}", "-i", str(mask),
                "-filter_complex", fc, "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p",
                "-ar", "44100", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", a.out], check=True)
mask.unlink()
print(f"  ✔ {a.out} ({dur(a.out):.2f} c)")
