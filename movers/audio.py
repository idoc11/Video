"""Звук: озвучка + шаги, скольжение, крушение, обломки, «грустная труба», музыка → build/audio.wav"""
import json, wave
from pathlib import Path
import numpy as np
ROOT = Path(__file__).resolve().parent; M = json.loads((ROOT / "data/meta.json").read_text())
SR = 44100; DUR = M["duration"]; n = int(DUR * SR); rng = np.random.default_rng(9)
L = np.zeros(n); R = np.zeros(n); T = lambda d: np.arange(int(max(d, .002) * SR)) / SR
def place(x, at, g=1.0, pan=0.0):
    i = int(at * SR)
    if i < 0 or i >= n: return
    j = min(n, i + len(x)); L[i:j] += x[:j - i] * g * (1 - max(0, pan)); R[i:j] += x[:j - i] * g * (1 + min(0, pan))
def bandn(d, f, w=.8):
    nz = rng.uniform(-1, 1, int(d * SR)); X = np.fft.rfft(nz); fr = np.fft.rfftfreq(len(nz), 1 / SR); X *= np.exp(-((np.log2(np.maximum(fr, 1) / f)) ** 2) / w); return np.fft.irfft(X, len(nz))
def thump(f=70, d=.18, g=1): t = T(d); return np.sin(2 * np.pi * (f - 30 * t / d) * t) * np.exp(-t * 22) * g + bandn(d, 500, 1.5) * np.exp(-t * 40) * .3 * g
def bell(f, d=1.4, bright=1): t = T(d); return sum(a * np.sin(2 * np.pi * f * m * t) * np.exp(-t * k) for m, a, k in [(1, 1, 3.0), (2.0, .5 * bright, 4.5), (3.01, .3 * bright, 6), (4.2, .15 * bright, 9)]) * np.clip(t / .002, 0, 1)
tc, tr = M["t_crash"], M["t_r"]
voice = np.zeros(n)
with wave.open(str(ROOT / "build/voice.wav")) as w: v = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float) / 32768
voice[:min(n, len(v))] = v[:n]
# шаги по лестнице (Витя и Геннадий поочерёдно), тяжело
t0 = .55; k = 0
while t0 < tr - .2: place(thump(60 + 10 * (k % 2), .2, .5), t0, .55, pan=-.3 + .6 * (k % 2)); t0 += .9 * .5; k += 1
# скольжение пианино по ступеням и удар в Витю
t_slide = np.arange(tr, tc, .115)
for i, tt in enumerate(t_slide): place(bandn(.07, 700 + 80 * i, 1.2) * np.exp(-T(.07) * 40) * 1.6, tt, .12 + .22 * (tt - tr) / (tc - tr), pan=.5 - 1.0 * (tt - tr) / (tc - tr))
sl = bandn(tc - tr + .2, 260, 1.0) * np.clip(T(tc - tr + .2) / (tc - tr), 0, 1) ** 1.6; place(sl, tr, .35)
place(thump(95, .3, 1.2), tr + .24, .5)
# крушение: удар, треск дерева, аккорд пианино, обломки
place(thump(48, .9, 1.6), tc, .9); place(bandn(.5, 1800, .5) * np.exp(-T(.5) * 14) * 2, tc, .5)
for i, f in enumerate([98, 110, 123.5, 146.8, 196, 233, 277, 311, 415, 554]): place(bell(f * (1 + .002 * rng.standard_normal()), 2.4, 1.2), tc + .02 + .008 * i, .16)
for i in range(40):
    dt_ = tc + .12 + abs(rng.normal(0, .55)) + i * .03; f = rng.choice([262, 330, 392, 523, 659, 880, 1046]); place(bell(f, .5, .6), dt_, .05 + .05 * rng.random(), pan=rng.uniform(-.6, .6)); place(thump(rng.uniform(120, 260), .09, .5), dt_ + .01, .18)
place(bandn(2.4, 900, 1.2) * np.exp(-T(2.4) * 1.6), tc + .1, .22)
# Геннадий бежит вниз
t0 = 14.9; k = 0
while t0 < 19.4: place(thump(85, .1, .7), t0, .4, pan=.4 - .8 * (t0 - 14.9) / 4.5); t0 += .26; k += 1
# финальные гэги: «плунк» клавиши и грустная труба
place(bell(440, 1.6, .6) * 1.0, 24.3, .35); place(bell(554, 1.2, .5), 24.34, .12)
def trombone(f0, f1, d):
    t = T(d); fr = f0 + (f1 - f0) * (t / d) ** 1.4 + 6 * np.sin(2 * np.pi * 5.5 * t); ph = np.cumsum(fr) / SR * 2 * np.pi; s = np.sin(ph) + .5 * np.sin(2 * ph) + .3 * np.sin(3 * ph)
    return s * np.clip(t / .04, 0, 1) * np.clip((d - t) / .15, 0, 1)
for (a, b, d, at) in [(233, 220, .5, 27.95), (220, 208, .5, 28.5), (208, 196, .5, 29.05), (196, 147, 1.1, 29.6)]: place(trombone(a, b, d), at, .13)
# лёгкая музыкальная подложка: щипковый бас и аккорды, 104 BPM; на крушении — пауза
bpm = 104; beat = 60 / bpm; mus = np.zeros(n); notes = [98, 98, 110, 110, 117, 117, 110, 98]
for b in range(int(DUR / beat)):
    tt = b * beat
    if tr - .1 < tt < tc + 1.2 or tt > 27.6: continue
    f = notes[b % 8]; t = T(beat * .8); y = (np.sin(2 * np.pi * f * t) + .4 * np.sin(2 * np.pi * 2 * f * t)) * np.exp(-t * 7); i = int(tt * SR); mus[i:i + len(y)] += y[:max(0, min(len(y), n - i))] * .5
    if b % 2: t2 = T(.1); h = bandn(.1, 6000, .6) * np.exp(-t2 * 60); j = int((tt + beat / 2) * SR); mus[j:j + len(h)] += h[:max(0, min(len(h), n - j))] * .25
mus = mus / (np.abs(mus).max() + 1e-9) * .16
ve = np.sqrt(np.convolve(voice ** 2, np.ones(2646) / 2646, mode="same")); duck = 1 - .6 * np.clip(ve / .08, 0, 1)
bg = np.stack([L, R], 1) + np.stack([mus, mus], 1)
bg *= (1 - .35 * np.clip(ve / .08, 0, 1))[:, None]
out = bg + np.stack([voice, voice], 1) * 1.15; out = out / (np.abs(out).max() + 1e-9) * .92
with wave.open(str(ROOT / "build/audio.wav"), "wb") as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype(np.int16).tobytes())
print(f"✔ audio.wav {DUR:.1f} с")
