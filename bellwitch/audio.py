"""Звук «Ведьма Белл»: дрон, ветер, сверчки, царапины, шёпот-подложка, сердцебиение, удары, реверб → build/audio.wav"""
import json, wave
from pathlib import Path
import numpy as np
from scipy.signal import fftconvolve
ROOT = Path(__file__).resolve().parent; M = json.loads((ROOT / "data/meta.json").read_text())
SR = 44100; DUR = M["duration"]; n = int(DUR * SR); rng = np.random.default_rng(13)
L = np.zeros(n); R = np.zeros(n); T = lambda d: np.arange(int(max(d, .002) * SR)) / SR
def place(x, at, g=1.0, pan=0.0, bus=None):
    i = int(at * SR)
    if i < 0 or i >= n: return
    j = min(n, i + len(x)); L[i:j] += x[:j - i] * g * (1 - max(0, pan)); R[i:j] += x[:j - i] * g * (1 + min(0, pan))
def bandn(d, f, w=.8):
    nz = rng.uniform(-1, 1, len(T(d))); X = np.fft.rfft(nz); fr = np.fft.rfftfreq(len(nz), 1 / SR); X *= np.exp(-((np.log2(np.maximum(fr, 1) / f)) ** 2) / w); return np.fft.irfft(X, len(nz))
def thump(f=60, d=.4, g=1): t = T(d); return np.sin(2 * np.pi * (f - 25 * t / d) * t) * np.exp(-t * 12) * g + bandn(d, 400, 1.5)[:len(t)] * np.exp(-t * 30) * .25 * g
def scratch(d=.4):
    t = T(d); x = bandn(d, 4200, .5) * (.5 + .5 * np.sin(2 * np.pi * rng.uniform(14, 26) * t)) ; return x * np.sin(np.pi * np.clip(t / d, 0, 1)) ** .6
def beat(g=1): return thump(52, .22, g) + np.concatenate([np.zeros(int(.17 * SR)), thump(46, .2, g * .7)])[:int(.4 * SR)] if False else thump(52, .3, g)
def add(*a):
    m = max(len(x) for x in a); o = np.zeros(m)
    for x in a: o[:len(x)] += x
    return o
S = lambda i: M["lines"][i]["start"]; E = lambda i: M["lines"][i]["end"]
def wordT(i, pre):
    for w in M["lines"][i]["words"]:
        if "".join(ch for ch in w[0].lower() if "а" <= ch <= "я" or ch == "ё").startswith(pre): return w[1]
    return S(i)
with wave.open(str(ROOT / "build/voice.wav")) as w: v = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float) / 32768
voice = np.zeros(n); voice[:min(n, len(v))] = v[:n]
tt = np.arange(n) / SR
# напряжение 0..1 по ходу рассказа
tens = np.interp(tt, [0, 14, 22, 45, 60, 66, 85, 93, 99, DUR], [.15, .3, .45, .8, .75, .5, .7, .9, 1.0, .6])
# дрон и диссонансный «смычковый» пад
drone = (np.sin(2 * np.pi * 55 * tt) + .8 * np.sin(2 * np.pi * 58.3 * tt + np.sin(tt * .3)) + .4 * np.sin(2 * np.pi * 110.4 * tt) + .25 * np.sin(2 * np.pi * 164.8 * tt * (1 + .004 * np.sin(tt * .7)))) * (.35 + .65 * tens) * .06
pad = sum(np.sin(2 * np.pi * f * tt + k + np.sin(tt * (.2 + .05 * k))) for k, f in enumerate([220, 233.1, 311.1, 349.2])) * np.clip(tens - .35, 0, 1) * .014
L += drone + pad; R += drone * .9 + pad * 1.1
wind = bandn(DUR, 280, 2.0) * (.5 + .5 * np.sin(tt * .35 + 1)) * (.04 + .05 * tens); L += wind; R += np.roll(wind, 3000)
# сверчки на ферме
for k in range(int(12 * 6)):
    a = .3 + k * .17; 
    if a < 13.5: place(np.sin(2 * np.pi * 4300 * T(.045)) * np.sin(np.pi * T(.045) / .045), a, .012 * (1 - a / 14), pan=.4)
# выстрел
g0 = wordT(1, "выстрел"); place(add(bandn(.5, 900, .9) * np.exp(-T(.5) * 9) * 2, thump(70, .4, 1.4)), g0, .9)
# царапины (нарастают); непрерывное скрежетание на «Тихие. В стенах»
sc_n = 28; r = np.random.default_rng(2)
for i in range(sc_n): ts = S(2) + 2 + i * (S(5) - S(2) - 2) / sc_n; place(scratch(.35 + .1 * r.random()), ts, .05 + .16 * (i / sc_n) ** 1.2, pan=-.5 + .3 * r.random())
place(scratch(2.4) * 1.0, S(3) + .2, .12, pan=-.4); place(scratch(1.6), S(4) + .2, .1, pan=-.3)
for i in range(18): place(scratch(.3), S(17) + .4 + i * .22, .10 + .06 * i / 18, pan=.1)
for i in range(6): place(scratch(.5) * 1.1, S(17) + 3.2 + i * .5, .15)    # царапается «VII»
# одеяло, стул, дверь
place(bandn(1.2, 1200, 1.2) * np.sin(np.pi * T(1.2) / 1.2), S(5) + .9, .2, pan=.3)
place(bandn(1.8, 160, 1.4) * np.sin(np.pi * T(1.8) / 1.8) ** .5, S(6) + .4, .25, pan=.5)
dT = S(6) + 1.9; place(add(thump(45, .9, 1.8), bandn(.5, 1200, .8) * np.exp(-T(.5) * 12)), dT, .9)
# шёпот-подложка: развёрнутые реплики ведьмы
for i, l in enumerate(M["lines"]):
    if l["who"] != "wit": continue
    a, b = int(l["start"] * SR), int(l["end"] * SR); seg = voice[a:b][::-1]
    place(seg * .10, l["start"] - .25, 1.0, pan=-.6)
# шаги по листьям + шаги «невидимого»
rs = S(10) + .5; re_ = S(12) - .5
for k, ts in enumerate(np.arange(rs, re_, .24)): place(add(bandn(.12, 1800, 1.0) * np.exp(-T(.12) * 25) * 1.2, thump(110, .1, .4)), ts, .35, pan=.2 * (-1) ** k)
for k, ts in enumerate(np.arange(S(11) + .5, re_ + .8, .24)): place(bandn(.14, 1500, 1.0) * np.exp(-T(.14) * 20), ts + .12, .22, pan=-.3 * (-1) ** k)
# сердцебиение: быстрое в погоне и финале, медленное у постели
def heart(t0, t1, bpm, g):
    ts_ = t0
    while ts_ < t1: place(thump(55, .22, 1.0), ts_, g); place(thump(48, .2, .7), ts_ + .19, g * .8); ts_ += 60 / bpm
heart(S(9) + .6, S(12) + 1.5, 118, .5); heart(M["banner_start"], M["banner_start"] + 5.5, 92, .22); heart(S(13), E(15), 52, .35); heart(S(17) + 2, E(18) + .3, 100, .5)
# шлёпок и удар
sT = S(8) + 3.5; place(add(bandn(.12, 3000, .8) * np.exp(-T(.12) * 40) * 2.2, thump(90, .3, 1.0)), sT, .9, pan=-.3)
# пузырёк, свеча
place(add(np.sin(2 * np.pi * 2400 * T(.5)) * np.exp(-T(.5) * 8) * .2, np.sin(2 * np.pi * 3600 * T(.4)) * np.exp(-T(.4) * 10) * .1), S(14) + 1.6, .6, pan=-.4)
place(bandn(.5, 2500, 1) * np.exp(-T(.5) * 6) * .6, E(15) + .1, .3)
# песня о бренди: тихая блуждающая мелодия, плывущая высота
mel = [(392, .5), (349, .5), (392, .5), (440, .75), (392, .5), (349, .5), (330, 1.0), (294, .75), (330, .5), (349, .5), (330, .5), (294, 1.0)]
tcur = S(16) + 1.3; end = E(16) + 1.2
while tcur < end:
    for f, d in mel:
        if tcur >= end: break
        t_ = T(d + .25); fr = f * (1 + .012 * np.sin(2 * np.pi * 5.2 * t_) + .02 * np.sin(2 * np.pi * .7 * t_)); ph = np.cumsum(fr) / SR * 2 * np.pi
        y = (np.sin(ph) + .5 * np.sin(2 * ph) + .3 * np.sin(3 * ph + 1)) * np.sin(np.pi * np.clip(t_ / (d + .25), 0, 1)) ** .7
        place(y, tcur, .045, pan=.3 * np.sin(tcur)); tcur += d
# финальная пауза и удар
fT = E(18) + .8; mask = np.ones(n); a = int((fT - 1.0) * SR); mask[a:int(fT * SR)] = np.linspace(1, .05, int(fT * SR) - a)    # провал в тишину перед ударом
L *= mask; R *= mask; voice_m = voice.copy()
place(add(thump(38, 1.8, 2.6), bandn(1.2, 1500, .6) * np.exp(-T(1.2) * 3) * 1.6), fT, 1.0)
t_ = T(1.0); sh = np.sin(np.cumsum(1800 + 2200 * t_ / 1.0) / SR * 2 * np.pi) * np.exp(-t_ * 3); place(sh, fT, .35)
# реверб на всё, кроме голоса
ir = (rng.normal(0, 1, int(2.2 * SR)) * np.exp(-np.arange(int(2.2 * SR)) / SR * 2.4)); ir[:50] = 0
revL = fftconvolve(L, ir, "full")[:n] * .045; revR = fftconvolve(R, ir[::-1], "full")[:n] * .045
bg = np.stack([L + revL, R + revR], 1)
ve = np.sqrt(np.convolve(voice ** 2, np.ones(3000) / 3000, mode="same")); env = np.clip(ve / .08, 0, 1)
bg *= (1 - .45 * env)[:, None]
vr = np.zeros(n)
out = bg + np.stack([voice + vr, voice + vr], 1) * 1.2; out = out / (np.abs(out).max() + 1e-9) * .93
with wave.open(str(ROOT / "build/audio.wav"), "wb") as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype(np.int16).tobytes())
print(f"✔ audio.wav {DUR:.1f} с")
