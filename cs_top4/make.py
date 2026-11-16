"""ТОП-4 момента CS2: вертикальная нарезка из клипов + баннер RubUP.   python3 cs_top4/make.py"""
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent
V = ROOT.parent
B = ROOT / "build"; B.mkdir(exist_ok=True)
FONT = "/usr/share/fonts/opentype/inter/Inter-Black.otf"
# (файл, обрезка чёрных полей w:h:x:y или None, подпись, номер)
CLIPS = [
    ("clip_madorik/source.mp4", "576:456:0:284", "КЛАТЧ С КАЛАША", 4),
    ("clip_defuse/source.mp4", None, "РАЗМИНИРОВАЛ ПОД ОГНЁМ", 3),
    ("clip_wetsiz/source.mp4", "1080:1280:0:320", "КОГДА ПОДКЛЮЧИЛСЯ ДРУГ", 2),
    ("clip_fieeband/source.mp4", None, "«Я В ШКОЛЕ БОКСОМ ЗАНИМАЛСЯ»", 1),
]
BANNER_CLIP, BANNER_AT = 1, 2.9   # баннер на моменте №3, с 2.9 с клипа
XF = .3


def dur(p):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)], capture_output=True, text=True).stdout)


def esc(s):
    return s.replace("\\", "\\\\").replace(":", "\\:").replace("'", "’").replace("%", "\\%")


parts = []
for i, (src, crop, title, num) in enumerate(CLIPS):
    out = B / f"part{i}.mp4"
    c = f"crop={crop}," if crop else ""
    d = dur(V / src)
    fg_w = 1080
    fc = (f"[0:v]{c}fps=30,setsar=1,split[a][b];"
          f"[a]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=28:2,eq=brightness=-0.18:saturation=1.1[bg];"
          f"[b]scale=1080:960:force_original_aspect_ratio=decrease:flags=lanczos,unsharp=5:5:0.6,pad=ceil(iw/2)*2:ceil(ih/2)*2[fg];"
          f"[bg][fg]overlay=(W-w)/2:370+(960-h)/2,"
          f"eq=contrast=1.06:saturation=1.12,"
          f"drawbox=x=0:y=0:w=1080:h=330:color=black@0.55:t=fill,"
          f"drawtext=fontfile={FONT}:text='ТОП-4 МОМЕНТА CS2':fontsize=58:fontcolor=white:x=(w-tw)/2:y=90,"
          f"drawtext=fontfile={FONT}:text='#{num}':fontsize=120:fontcolor=0xFFD23A:borderw=6:bordercolor=black:x=(w-tw)/2:y=170:"
          f"alpha='min(1,t/0.25)',"
          f"drawtext=fontfile={FONT}:text='{esc(title)}':fontsize=50:fontcolor=white:borderw=8:bordercolor=black:x=(w-tw)/2:y=1400:"
          f"enable='lt(t,{d - .2})':alpha='min(1,t/0.3)',"
          f"drawtext=fontfile={FONT}:text='@id0cs':fontsize=30:fontcolor=white@0.6:x=48:y=1840[v];"
          f"[0:a]aresample=44100,aformat=channel_layouts=stereo,loudnorm=I=-16:TP=-2:LRA=9[a]")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(V / src), "-filter_complex", fc, "-map", "[v]", "-map", "[a]",
                    "-c:v", "libx264", "-preset", "fast", "-crf", "14", "-pix_fmt", "yuv420p", "-ar", "44100", "-c:a", "pcm_s16le", str(out).replace(".mp4", ".mkv")], check=True)
    parts.append((Path(str(out).replace(".mp4", ".mkv")), d))
    print(f"  #{num} {title}: {d:.1f} c")

# склейка со сдвигом вверх
inputs, fc, prev_v, prev_a, off = [], "", "[0:v]", "[0:a]", 0.0
for p, _ in parts: inputs += ["-i", str(p)]
for i in range(1, len(parts)):
    off += parts[i - 1][1] - XF
    fc += f"{prev_v}[{i}:v]xfade=transition=slideup:duration={XF}:offset={off:.3f}[v{i}];{prev_a}[{i}:a]acrossfade=d={XF}[a{i}];"
    prev_v, prev_a = f"[v{i}]", f"[a{i}]"
starts = [0.0]
for i in range(1, len(parts)): starts.append(starts[-1] + parts[i - 1][1] - XF)
bs = starts[BANNER_CLIP] + BANNER_AT
bdur = dur(V / "assets/banner_rubup.mp4"); be = bs + bdur
# баннер: в нижнюю зону (под геймплеем), 27% кадра
bw, bh, by = 1032, 542, 1360
mask = B / "mask.png"
subprocess.run(["python3", "-c", f"from PIL import Image,ImageDraw;m=Image.new('L',({bw},{bh}),0);ImageDraw.Draw(m).rounded_rectangle([0,0,{bw-1},{bh-1}],radius=26,fill=255);m.save('{mask}')"], check=True)
n = len(parts)
duck = f"1-0.8*min(1,max(0,(t-{bs - .2:.2f})/0.2))*min(1,max(0,({be + .1:.2f}-t)/0.15))"
gain = 1.0
fc += (f"[{n}:v]fps=30,scale={bw}:{bh}:flags=lanczos,format=yuva420p[bs];[{n+1}:v]format=gray,scale={bw}:{bh}[m];[bs][m]alphamerge,setpts=PTS-STARTPTS+{bs:.3f}/TB[bb];"
       f"{prev_v}[bb]overlay=x=(W-w)/2:y={by}:eof_action=pass:enable='between(t,{bs:.3f},{be:.3f})'[vout];"
       f"{prev_a}volume='{duck}':eval=frame[ga];[{n}:a]aresample=44100,aformat=channel_layouts=stereo,loudnorm=I=-14:TP=-2,adelay={int(bs*1000)}|{int(bs*1000)}[ba];"
       f"[ga][ba]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11[aout]")
out = ROOT / "cs_top4.mp4"
subprocess.run(["ffmpeg", "-v", "error", "-y", *inputs, "-i", str(V / "assets/banner_rubup.mp4"), "-loop", "1", "-framerate", "30", "-t", f"{bdur:.2f}", "-i", str(mask),
                "-filter_complex", fc, "-map", "[vout]", "-map", "[aout]", "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-profile:v", "high",
                "-pix_fmt", "yuv420p", "-r", "30", "-c:a", "aac", "-b:a", "192k", "-ar", "44100", "-movflags", "+faststart", str(out)], check=True)
print(f"  баннер {bs:.2f}–{be:.2f} c; ✔ {out} ({dur(out):.2f} c)")
