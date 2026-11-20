"""Звук гонки: озвучка (3 фразы), отсчёт, удары по событиям физики, толпа, финал → build/audio.wav"""
import json, sys, wave
from pathlib import Path
import numpy as np
ROOT = Path(__file__).resolve().parent; sys.path.insert(0, str(ROOT.parent / "engine"))
import tts
A = json.loads((ROOT / "data/audio.json").read_text()); M = json.loads((ROOT / "data/meta.json").read_text())
SR = 44100; DUR = A["duration"] + .3; n = int(DUR * SR); L = np.zeros(n); R = np.zeros(n); rng = np.random.default_rng(4)
T = lambda d: np.arange(int(d * SR)) / SR
def place(x, at, g=1.0, pan=0.0):
    i = int(at * SR)
    if i < 0 or i >= n: return
    j = min(n, i + len(x)); L[i:j] += x[:j - i] * g * (1 - max(0, pan)); R[i:j] += x[:j - i] * g * (1 + min(0, pan))
def beep(f, d, g=1): t = T(d); return np.sin(2 * np.pi * f * t) * np.exp(-t * 6) * np.clip(t / .003, 0, 1) * g
def tick(v):
    d = .05; t = T(d); nz = rng.uniform(-1, 1, len(t)); X = np.fft.rfft(nz); fr = np.fft.rfftfreq(len(t), 1 / SR); X *= np.exp(-((np.log2(np.maximum(fr, 1) / 2800)) ** 2) / .6)
    return np.fft.irfft(X, len(t)) * np.exp(-t * 90) * 3
def thump(f=120, d=.14): t = T(d); return np.sin(2 * np.pi * (f - 60 * t / d) * t) * np.exp(-t * 28)
def bandn(d, f, w=.8): nz = rng.uniform(-1, 1, int(d * SR)); X = np.fft.rfft(nz); fr = np.fft.rfftfreq(len(nz), 1 / SR); X *= np.exp(-((np.log2(np.maximum(fr, 1) / f)) ** 2) / w); return np.fft.irfft(X, len(nz))
# --- озвучка
dflt = {"speaker": "dmitri", "ls": .9, "pitch": 1.0, "range": 1.0, "fx": None, "provider": "elevenlabs", "voice_id": "nPczCjzI2devNBz1zQrb", "model": "eleven_v3", "stability": 0.15, "tempo": 1.06}
cache = ROOT / "build/tts"; cache.mkdir(parents=True, exist_ok=True)
win = M["names"][M["winner"]].lower()
lines = [(.12, "[excited] Выбери цвет шарика!"), (6.2, "[excited] Кто вырвется вперёд?!"), (A["t_first"] + .15, f"[excited] Победил {win}! Угадал? Пиши в комментариях!")]
voice = np.zeros(n)
for at, txt in lines:
    a_ = tts.synth({"voice": txt}, dflt, cache, False); i = int(at * SR); voice[i:i + len(a_)] += a_[:n - i]; print(f"  голос @{at:.2f}: {txt} ({len(a_) / SR:.2f} c)")
voice = voice / (np.abs(voice).max() + 1e-9) * .9
# --- отсчёт 3-2-1-старт
for k, t0 in enumerate([1.8, 2.4, 3.0]): place(beep(660, .25), t0, .5)
place(beep(1320, .6), 3.6, .55); place(thump(70, .5), 3.6, .6)
# --- удары по физике
last = {}
for h in A["hits"]:
    key = int(h["t"] * 12)
    last[key] = last.get(key, 0) + 1
    if last[key] > 3 or h["v"] < 2.4: continue
    pan = float(np.clip(h["x"] / 7, -.7, .7))
    if h["kind"] == 2: place(beep(1400 + 600 * rng.random(), .12) * .6, h["t"], min(.5, .06 + .03 * h["v"]), pan)
    elif h["kind"] == 1: place(beep(520 + 120 * rng.random(), .2), h["t"], min(.45, .08 + .03 * h["v"]), pan)
    else: place(tick(h["v"]), h["t"], min(.4, .05 + .025 * h["v"]), pan)
# --- толпа и конфетти на финише
tf = A["t_first"]; crowd = bandn(3.4, 1200, 1.2); env = np.clip(T(3.4) / .3, 0, 1) * np.exp(-T(3.4) / 1.6); place(crowd * env, tf - .05, .6)
for k in range(5): place(bell := (np.sin(2 * np.pi * [523, 659, 784, 1047, 1319][k] * T(1.2)) * np.exp(-T(1.2) * 3.5)), tf + .05 + k * .09, .22)
t0 = tf - 1.3; sw = bandn(1.4, 900, .5) * np.sin(np.pi * T(1.4) / 1.4) ** 2; place(sw, t0, .28)
# --- музыка: ритмичный бит 128 BPM
bpm = 128; beat = 60 / bpm; mus = np.zeros(n); kick = np.sin(2 * np.pi * (150 - 100 * T(.3) / .3) * T(.3)) * np.exp(-T(.3) * 11); hat = bandn(.05, 8000, .6) * np.exp(-T(.05) * 60)
for b in range(int(DUR / beat)):
    t0 = b * beat + 3.6 - int(3.6 / beat + 1) * beat + beat * 0
    if t0 < 0: continue
    i = int(t0 * SR); mus[i:i + len(kick)] += kick[:max(0, min(len(kick), n - i))] * .8
    j = int((t0 + beat / 2) * SR); mus[j:j + len(hat)] += hat[:max(0, min(len(hat), n - j))] * .35
    f = [196, 233, 262, 311][(b // 4) % 4]; t_ = T(beat * .9); bass = (2 * ((t_ * f / 2) % 1) - 1) * np.exp(-t_ * 6); mus[i:i + len(bass)] += bass[:max(0, min(len(bass), n - i))] * .35
swell = np.clip(np.arange(n) / SR / 8, 0, 1) * .8 + .2; mus *= swell
# приглушение музыки и эффектов под голосом; баннер — отдельно в compose
ve = np.sqrt(np.convolve(voice ** 2, np.ones(2646) / 2646, mode="same")); duck = 1 - .6 * np.clip(ve / .1, 0, 1)
mus = mus / (np.abs(mus).max() + 1e-9) * .22 * duck; L += mus; R += mus
bg = np.stack([L, R], 1) * (1 - .45 * np.clip(ve / .1, 0, 1))[:, None]
out = bg + np.stack([voice, voice], 1) * 1.0; out = out / (np.abs(out).max() + 1e-9) * .92
(ROOT / "build").mkdir(exist_ok=True)
with wave.open(str(ROOT / "build/audio.wav"), "wb") as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype(np.int16).tobytes())
print(f"✔ audio.wav {DUR:.1f} с")
