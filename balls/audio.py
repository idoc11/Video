"""Звук ролика по событиям физики: data/audio.json → build/audio.wav (стерео, 44.1 кГц)."""
import json
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent
SR = 44100
rng = np.random.default_rng(11)
A = json.loads((ROOT / "data/audio.json").read_text())
DUR = A["duration"] + .6
L = np.zeros(int(DUR * SR)); Rr = np.zeros(int(DUR * SR))
T = lambda d: np.arange(int(d * SR)) / SR


def place(x, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i < 0 or i >= len(L): return
    j = min(len(L), i + len(x))
    L[i:j] += x[: j - i] * gain * (1 - max(0, pan)); Rr[i:j] += x[: j - i] * gain * (1 + min(0, pan))


def bell(f, d=.9, bright=1.0):
    t = T(d)
    x = sum(a * np.sin(2 * np.pi * f * m * t) * np.exp(-t * k) for m, a, k in [(1, 1, 5.5), (2.76, .5 * bright, 9), (5.4, .25 * bright, 14), (8.93, .12 * bright, 20)])
    return x * np.clip(t / .002, 0, 1)


def tick(v):
    d = .05; t = T(d); n = rng.uniform(-1, 1, len(t))
    X = np.fft.rfft(n); fr = np.fft.rfftfreq(len(t), 1 / SR); X *= np.exp(-((np.log2(np.maximum(fr, 1) / 2800)) ** 2) / .6)
    return np.fft.irfft(X, len(t)) * np.exp(-t * 90) * 3 + np.sin(2 * np.pi * rng.uniform(1400, 2100) * t) * np.exp(-t * 70) * .35


def whoosh(d, f0, f1):
    n = rng.uniform(-1, 1, int(d * SR)); N, hop = 1024, 256; out = np.zeros(len(n) + N); win = np.hanning(N); fr = np.fft.rfftfreq(N, 1 / SR)
    frames = (len(n) - N) // hop
    for k in range(max(1, frames)):
        q = k / max(1, frames - 1); fc = f0 * (f1 / f0) ** q
        seg = n[k * hop: k * hop + N]
        if len(seg) < N: break
        out[k * hop: k * hop + N] += np.fft.irfft(np.fft.rfft(seg * win) * np.exp(-((np.log2(np.maximum(fr, 1) / fc)) ** 2) / .7), N) * win
    t = T(d); return out[: len(t)] * np.sin(np.pi * t / d) ** 1.4


# пентатоника: ступень → нота
NOTES = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.7, 1318.5, 1568.0]
# деления: группируем по ступени, ограничиваем число звонов, чтобы не превращалось в кашу
by_tier = {}
for s in A["splits"]: by_tier.setdefault(s["tier"], []).append(s)
for tier, evs in by_tier.items():
    evs.sort(key=lambda e: e["t"]); f = NOTES[min(tier - 1, 8)]
    keep = evs if len(evs) <= 6 else [evs[int(i)] for i in np.linspace(0, len(evs) - 1, 6 + int(np.log2(len(evs))) * 3)]
    for i, e in enumerate(keep):
        g = (0.55 if i == 0 else .28) * (1 + .12 * tier * 0)
        place(bell(f * (1 + rng.uniform(-.004, .004)), 1.1), e["t"], g, pan=np.clip(e["x"] / 12, -.6, .6))
    # мягкий «пуф» на первое деление ступени
    t0 = evs[0]["t"]; tt = T(.3); place(np.sin(2 * np.pi * (70 - 25 * tt / .3) * tt) * np.exp(-tt * 12), t0, .55)
    place(np.sin(2 * np.pi * (f / 2) * T(.5)) * np.exp(-T(.5) * 6), t0, .18)

# удары о конструкции: самые сильные, не чаще ~35 в секунду
hits = sorted(A["hits"], key=lambda h: h["t"]); last = -1; cnt = {}
for h in hits:
    sec = int(h["t"] * 10)
    cnt[sec] = cnt.get(sec, 0) + 1
    if cnt[sec] > 4 or h["v"] < 3.0: continue
    place(tick(h["v"]), h["t"], min(.5, .05 + .03 * h["v"]), pan=np.clip(h["x"] / 12, -.7, .7))

# шум стеклянной россыпи: огибающая по энергии столкновений шар-шар
n_ = len(L); env = np.zeros(n_)
for p in A["pairs"]:
    i = int(p["t"] * SR); env[max(0, i - 600): i + 600] = np.maximum(env[max(0, i - 600): i + 600], np.log1p(p["e"]))
k_ = np.hanning(int(.06 * SR)); env = np.convolve(env, k_ / k_.sum(), mode="same")
nz = rng.uniform(-1, 1, n_); X = np.fft.rfft(nz); fr = np.fft.rfftfreq(n_, 1 / SR); X *= np.exp(-((np.log2(np.maximum(fr, 1) / 4200)) ** 2) / .9); nz = np.fft.irfft(X, n_)
bed = nz * env / (env.max() + 1e-9) * .22; L += bed; Rr += np.roll(bed, 37)

# фоновый пад: медленный аккорд, нарастает с количеством шариков
t = np.arange(n_) / SR; swell = np.clip(t / (A["duration"] * .7), 0, 1) ** 1.3
pad = sum(np.sin(2 * np.pi * f * t + .5 * np.sin(2 * np.pi * .13 * t + f)) * a for f, a in [(65.4, 1), (98.0, .6), (130.8, .5), (196.0, .35)])
pad *= (.025 + .06 * swell); L += pad; Rr += pad

# повороты: антигравитация и открытие пола
if A.get("flip"):
    f0 = A["flip"]; place(whoosh(1.1, 300, 5200), f0 - .05, .5); place(np.sin(2 * np.pi * np.cumsum(np.linspace(220, 880, int(1.0 * SR))) / SR) * np.sin(np.pi * T(1.0) / 1.0) * .12, f0, 1)
    tt = T(.9); place(np.sin(2 * np.pi * np.cumsum(90 - 55 * tt / .9) / SR) * np.exp(-tt * 3.5), f0 + 1.1, .6)
if A.get("trap"):
    f1 = A["trap"]; tt = T(1.6); place(np.sin(2 * np.pi * np.cumsum(140 * np.exp(-tt * 1.2) + 30) / SR) * np.exp(-tt * 1.4), f1, .75)
    place(whoosh(1.6, 2500, 220), f1 + .05, .5)
# финальный «звон» на последнем кадре
place(bell(1046.5, 2.0) + bell(1568, 2.0) * .6, A["duration"] - 1.9, .3)

x = np.stack([L, Rr], 1); x = x / (np.max(np.abs(x)) + 1e-9) * .9
(ROOT / "build").mkdir(exist_ok=True)
with wave.open(str(ROOT / "build/audio.wav"), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes())
print(f"✔ audio.wav {DUR:.1f} с")
