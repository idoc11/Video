"""Нарезка лучших фрагментов песни по тактам + спектр под визуализатор.
Выход: build/mix.wav (44.1 кГц, стерео), data/feat.bin (кадры×полосы), data/meta.json."""
import json, subprocess
from pathlib import Path
import numpy as np, librosa

ROOT = Path(__file__).resolve().parent; (ROOT / "build").mkdir(exist_ok=True); (ROOT / "data").mkdir(exist_ok=True)
A = json.loads((ROOT / "analysis.json").read_text()); W = A["windows"]; DB = np.array(A["downbeats"]); BEATS = np.array(A["beats"])
PICK = [8.6, 49.5, 147.1]          # крюк → главный дроп → финальная кульминация
segs = []
for p in PICK:
    w = min(W, key=lambda x: abs(x["a"] - p)); segs.append((w["a"], w["b"]))
print("фрагменты:", [(round(a, 2), round(b, 2)) for a, b in segs])
XF = 0.02; FPS = 30
parts = "".join(f"[0:a]atrim={a:.4f}:{b:.4f},asetpts=PTS-STARTPTS[a{i}];" for i, (a, b) in enumerate(segs))
chain = "[a0]"
for i in range(1, len(segs)): chain += f"[a{i}]acrossfade=d={XF}:c1=tri:c2=tri[x{i}];[x{i}]"
dur = sum(b - a for a, b in segs) - XF * (len(segs) - 1)
fc = parts + chain.rstrip("[") + f"afade=t=out:st={dur - 1.6:.3f}:d=1.6,loudnorm=I=-14:TP=-1.5:LRA=11[out]"
fc = fc.replace(f"[x{len(segs)-1}]afade", f"[x{len(segs)-1}]afade")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(ROOT / "song.mp3"), "-filter_complex", fc, "-map", "[out]", "-ar", "44100", "-ac", "2", str(ROOT / "build/mix.wav")], check=True)
print(f"длительность: {dur:.2f} c")

# биты в времени нарезки
beats, offs = [], 0.0
for (a, b) in segs:
    beats += [float(t - a + offs) for t in BEATS if a <= t < b]; offs += (b - a) - XF
beats = np.array(beats)

# спектр по кадрам видео
y, sr = librosa.load(ROOT / "build/mix.wav", sr=22050, mono=True)
NB = 96; hop = sr // FPS
S = librosa.feature.melspectrogram(y=y, sr=sr, n_fft=2048, hop_length=hop, n_mels=NB, fmin=40, fmax=11000, power=2.0)
S = librosa.power_to_db(S + 1e-10, ref=np.max(S)); S = np.clip((S + 52) / 52, 0, 1)   # 0..1
F = int(dur * FPS); S = S[:, :F].T
# огибающая: быстрая атака, медленное затухание
env = np.zeros_like(S)
for f in range(F): env[f] = np.maximum(S[f], env[f - 1] * .84) if f else S[f]
low = env[:, :10].mean(1); low = (low - low.min()) / (low.max() - low.min() + 1e-9)
beat_env = np.zeros(F)
for t in beats:
    f0 = int(t * FPS)
    for k in range(10):
        if f0 + k < F: beat_env[f0 + k] = max(beat_env[f0 + k], np.exp(-k / 3.0))
total_beats = int((beats < dur).sum())
cnt = np.array([int((beats >= f / FPS).sum()) for f in range(F)])   # сколько битов осталось
out = np.concatenate([env, low[:, None], beat_env[:, None], cnt[:, None].astype(float)], 1).astype(np.float32)
out.tofile(ROOT / "data/feat.bin")
(ROOT / "data/meta.json").write_text(json.dumps(dict(frames=F, fps=FPS, bands=NB, per=NB + 3, duration=dur, total_beats=total_beats, segs=segs, beats=[float(b) for b in beats])))
print(f"✔ кадров {F}, битов {total_beats}")
