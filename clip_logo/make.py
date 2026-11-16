"""Замена вращающегося логотипа в шаблоне «Сотворение Адама».   python3 make.py"""
import math, subprocess, shutil
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

ROOT = Path(__file__).resolve().parent
SRC, OUT, B = ROOT / "source.mp4", ROOT / "logo_spin.mp4", ROOT / "build"
CX, CY, SIZE = 521, 334, 216          # центр и размер логотипа (как у исходного)
HALF = 70                             # кадров на полуоборот (замерено по исходнику)
COVER = (392, 226, 652, 444)          # зона старого логотипа, закрываем чёрным

# 1) вырезаем логотип со скриншота: ищем белую рамку наклейки
sh = np.asarray(Image.open(ROOT / "logo_screenshot.jpg").convert("RGB")).astype(int)
H, W, _ = sh.shape
col = (np.abs(sh[..., 0] - 255) + np.abs(sh[..., 2] - 0)) # не используем — ищем жёлто-синюю часть
sat = sh.max(2) - sh.min(2)
ys, xs = np.where(sat > 90)
x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
pad = int((x1 - x0) * .03)
logo = Image.fromarray(sh[y0 - pad:y1 + pad + 1, x0 - pad:x1 + pad + 1].astype('uint8'))
logo = logo.resize((SIZE, SIZE), Image.LANCZOS)
mask = Image.new("L", logo.size, 0); ImageDraw.Draw(mask).rounded_rectangle([0, 0, SIZE - 1, SIZE - 1], radius=int(SIZE * .07), fill=255)
logo.putalpha(mask)
print(f"логотип: {x1 - x0}×{y1 - y0} px со скриншота → {SIZE}×{SIZE}")

# 2) кадры вращения
shutil.rmtree(B, ignore_errors=True); B.mkdir()
n = int(float(subprocess.run(["ffprobe", "-v", "error", "-count_frames", "-select_streams", "v", "-show_entries", "stream=nb_read_frames",
                              "-of", "csv=p=0", str(SRC)], capture_output=True, text=True).stdout))
CW, CH = COVER[2] - COVER[0], COVER[3] - COVER[1]
for i in range(n):
    a = math.pi * i / HALF                     # угол поворота
    c = math.cos(a); w = max(2, int(round(SIZE * abs(c))))
    face = logo if c >= 0 else logo.transpose(Image.FLIP_LEFT_RIGHT)
    img = face.resize((w, SIZE), Image.LANCZOS)
    # объём: затемнение к ребру + блик, проходящий по лицевой стороне
    shade = .55 + .45 * abs(c)
    rgb = ImageEnhance.Brightness(img.convert("RGB")).enhance(shade)
    gl = Image.new("L", (w, SIZE), 0); d = ImageDraw.Draw(gl)
    gx = int((math.sin(a) * .5 + .5) * w)
    d.polygon([(gx - 18, 0), (gx + 10, 0), (gx - 30, SIZE), (gx - 58, SIZE)], fill=int(90 * abs(c)))
    rgb = Image.composite(Image.new("RGB", (w, SIZE), "white"), rgb, gl.filter(ImageFilter.GaussianBlur(6)))
    rgb.putalpha(img.getchannel("A"))
    canvas = Image.new("RGBA", (CW, CH), (0, 0, 0, 255))
    glow = Image.new("RGBA", (CW, CH), (0, 0, 0, 0)); ImageDraw.Draw(glow).ellipse([CW / 2 - w / 2 - 18, CH / 2 - SIZE / 2 - 18, CW / 2 + w / 2 + 18, CH / 2 + SIZE / 2 + 18], fill=(255, 200, 80, 55))
    canvas.alpha_composite(glow.filter(ImageFilter.GaussianBlur(16)))
    canvas.alpha_composite(rgb, ((CW - w) // 2, (CH - SIZE) // 2 + (CY - (COVER[1] + COVER[3]) // 2)))
    canvas.convert("RGB").save(B / f"{i:04d}.png")

# 3) наложение на исходник (зона перекрывается целиком, края растушёваны)
fm = Image.new("L", (CW, CH), 0); ImageDraw.Draw(fm).rectangle([3, 3, CW - 4, CH - 4], fill=255); fm = fm.filter(ImageFilter.GaussianBlur(1.5)); fm.save(B / "edge.png")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(SRC), "-framerate", "30", "-i", str(B / "%04d.png"), "-loop", "1", "-i", str(B / "edge.png"),
                "-filter_complex", f"[1:v]format=rgba[l];[2:v]format=gray[m];[l][m]alphamerge[lm];[0:v][lm]overlay={COVER[0]}:{COVER[1]}:shortest=1,format=yuv420p[v];"
                f"[0:a]loudnorm=I=-14:TP=-1.5:LRA=11[a]",
                "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-profile:v", "high", "-r", "30",
                "-c:a", "aac", "-b:a", "192k", "-ar", "44100", "-movflags", "+faststart", str(OUT)], check=True)
print("✔", OUT)
