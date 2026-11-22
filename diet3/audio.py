"""Звук «Диета 3»: озвучка + гулкий холодильник, удар, дзынь, чавканье, музыка → build/audio.wav"""
import json, wave
from pathlib import Path
import numpy as np
ROOT = Path(__file__).resolve().parent; M = json.loads((ROOT / "data/meta.json").read_text())
SR = 44100; DUR = M["duration"]; n = int(DUR * SR); rng = np.random.default_rng(7)
L = np.zeros(n); R = np.zeros(n); T = lambda d: np.arange(int(max(d, .002) * SR)) / SR
def place(x, at, g=1.0, pan=0.0):
    i = int(at * SR)
    if i < 0 or i >= n: return
    j = min(n, i + len(x)); L[i:j] += x[:j - i] * g * (1 - max(0, pan)); R[i:j] += x[:j - i] * g * (1 + min(0, pan))
def bandn(d, f, w=.8):
    nz = rng.uniform(-1, 1, int(d * SR)); X = np.fft.rfft(nz); fr = np.fft.rfftfreq(len(nz), 1 / SR); X *= np.exp(-((np.log2(np.maximum(fr, 1) / f)) ** 2) / w); return np.fft.irfft(X, len(nz))
def thump(f=70, d=.2, g=1): t = T(d); return np.sin(2 * np.pi * (f - 30 * t / d) * t) * np.exp(-t * 20) * g + bandn(d, 500, 1.5) * np.exp(-t * 40) * .3 * g
def bell(f, d=1.2): t = T(d); return sum(a * np.sin(2 * np.pi * f * m * t) * np.exp(-t * k) for m, a, k in [(1, 1, 3.0), (2.0, .5, 4.5), (3.01, .3, 6)]) * np.clip(t / .002, 0, 1)
def boing(f0, d=.4): t = T(d); fr = f0 * (1 + .5 * np.sin(2 * np.pi * 8 * t) * np.exp(-t * 5)); return np.sin(np.cumsum(fr) / SR * 2 * np.pi) * np.exp(-t * 6)
def pluck(f, d=.4): t = T(d); return (np.sin(2 * np.pi * f * t) + .5 * np.sin(4 * np.pi * f * t)) * np.exp(-t * 8) * np.clip(t / .003, 0, 1)
S = lambda i: M["lines"][i]["start"]; E = lambda i: M["lines"][i]["end"]
with wave.open(str(ROOT / "build/voice.wav")) as w: v = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float) / 32768
voice = np.zeros(n); voice[:min(n, len(v))] = v[:n]
hum = np.sin(2 * np.pi * 50 * np.arange(n) / SR) * .015 + bandn(DUR, 120, 1.5) * .01; L += hum; R += hum          # гул холодильника
for k in range(5): place(thump(120 - 8 * k, .12, .8), S(3) + 3.0 + k * .32, .35)                                  # разбег
place(thump(60, .5, 1.6), S(4) + .95, .9); place(bandn(.4, 1500, .6) * np.exp(-T(.4) * 14), S(4) + .95, .5); place(boing(210, .5), S(4) + 1.05, .25)   # удар скалкой
place(bell(1320, 1.4), S(5) + 1.0, .25); place(bandn(.9, 5000, .8) * np.exp(-T(.9) * 3), S(5) + .8, .1)            # дверца, дзынь
for k in range(8): place(bandn(.16, 700, 1) * np.exp(-T(.16) * 18) * (1 + .5 * (k % 2)), S(10) + 1.0 + k * .33, .22, pan=.3 * (-1) ** k)   # чавкает
place(thump(70, .35, 1), S(7) + .1, .4)                                                                            # падает на колени
for k in range(7): place(thump(130, .08, .6), S(12) + .2 + k * .27, .22, pan=-.5 + k * .08)                          # шаги мамы
place(bell(880, 1.0), S(15) + 2.6, .2); place(boing(150, .7), S(15) + 3.3, .15)                                    # молчаливая дуэль
for k in range(4): place(bell(660 + 110 * k, .5), S(17) + 2.0 + k * .35, .12)                                      # звон ложек
bpm = 100; beat = 60 / bpm; mus = np.zeros(n); sc = [196, 220, 261.6, 293.7, 329.6, 392]; pat = [0, 2, 4, 2, 5, 4, 2, 3]
for b in range(int(DUR / beat)):
    tt = b * beat
    if tt > E(17) + .3: break
    i = int(tt * SR); y = pluck(sc[pat[b % 8]], .45); mus[i:i + len(y)] += y[:max(0, min(len(y), n - i))]
    if b % 2 == 0: y2 = pluck(sc[0] / 2, .6); mus[i:i + len(y2)] += y2[:max(0, min(len(y2), n - i))] * .7
mus = mus / (np.abs(mus).max() + 1e-9) * .16
ve = np.sqrt(np.convolve(voice ** 2, np.ones(2646) / 2646, mode="same")); env = np.clip(ve / .08, 0, 1)
bg = np.stack([L, R], 1) + np.stack([mus, mus], 1); bg *= (1 - .55 * env)[:, None]
out = bg + np.stack([voice, voice], 1) * 1.15; out = out / (np.abs(out).max() + 1e-9) * .92
with wave.open(str(ROOT / "build/audio.wav"), "wb") as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype(np.int16).tobytes())
print(f"✔ audio.wav {DUR:.1f} с")
