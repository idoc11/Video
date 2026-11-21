"""Звук «Дед и сом»: озвучка + вода, птицы, всплески, мотор-шум погони, банджо-музыка → build/audio.wav"""
import json, wave
from pathlib import Path
import numpy as np
ROOT = Path(__file__).resolve().parent; M = json.loads((ROOT / "data/meta.json").read_text())
SR = 44100; DUR = M["duration"]; n = int(DUR * SR); rng = np.random.default_rng(4)
L = np.zeros(n); R = np.zeros(n); T = lambda d: np.arange(int(max(d, .002) * SR)) / SR
def place(x, at, g=1.0, pan=0.0, buf=None):
    i = int(at * SR)
    if i < 0 or i >= n: return
    j = min(n, i + len(x)); L[i:j] += x[:j - i] * g * (1 - max(0, pan)); R[i:j] += x[:j - i] * g * (1 + min(0, pan))
def bandn(d, f, w=.8):
    nz = rng.uniform(-1, 1, int(d * SR)); X = np.fft.rfft(nz); fr = np.fft.rfftfreq(len(nz), 1 / SR); X *= np.exp(-((np.log2(np.maximum(fr, 1) / f)) ** 2) / w); return np.fft.irfft(X, len(nz))
def thump(f=70, d=.2, g=1): t = T(d); return np.sin(2 * np.pi * (f - 30 * t / d) * t) * np.exp(-t * 20) * g + bandn(d, 500, 1.5) * np.exp(-t * 40) * .3 * g
def splash(d=.7, g=1): t = T(d); return (bandn(d, 1400, 1.4) * np.exp(-t * 6) + bandn(d, 400, 1.0) * np.exp(-t * 9) * .8) * g
def pluck(f, d=.45):
    t = T(d); return (np.sin(2 * np.pi * f * t) + .5 * np.sin(4 * np.pi * f * t) + .25 * np.sin(6 * np.pi * f * t)) * np.exp(-t * 9) * np.clip(t / .003, 0, 1)
def boing(f0, d=.4): t = T(d); fr = f0 * (1 + .5 * np.sin(2 * np.pi * 8 * t) * np.exp(-t * 5)); return np.sin(np.cumsum(fr) / SR * 2 * np.pi) * np.exp(-t * 6)
def chirp(f0, f1, d=.12): t = T(d); fr = f0 + (f1 - f0) * t / d; return np.sin(np.cumsum(fr) / SR * 2 * np.pi) * np.sin(np.pi * t / d) ** 1.5
S = lambda i: M["lines"][i]["start"]; E = lambda i: M["lines"][i]["end"]
with wave.open(str(ROOT / "build/voice.wav")) as w: v = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float) / 32768
voice = np.zeros(n); voice[:min(n, len(v))] = v[:n]
# вода: тихий плеск
wat = bandn(DUR, 380, 2.0) * (.6 + .4 * np.sin(2 * np.pi * np.arange(n) / SR * .23)); L += wat * .025; R += np.roll(wat, 4000) * .025
# птицы (редко, и не на баннере)
for tt in np.arange(1.0, DUR - 1, 3.1):
    if M["banner_start"] - .2 < tt < M["banner_start"] + 5.3: continue
    f = rng.uniform(2400, 3800)
    for k in range(rng.integers(2, 4)): place(chirp(f, f * rng.uniform(.8, 1.3)), tt + k * .16, .05, pan=rng.uniform(-.7, .7))
# ТЮК / ПЛЮХ на трофеях
for a, b in M["slots"]:
    place(thump(160, .16, 1), a + .1, .5); place(boing(260), a + .12, .12); place(splash(.8, 1), b - .22, .5)
# поклёвка: поплавок
place(splash(.4, 1), S(3) + 1.0, .3)
# рывок и погоня
d0, d1 = M["t_d0"], M["t_d1"]
place(thump(55, .6, 1.5), d0, .8); place(bandn(.8, 2200, .6) * np.exp(-T(.8) * 7), d0, .35)
for tt in np.arange(S(7) + .6, d0, .5): place(bandn(.2, 150, 1) * np.exp(-T(.2) * 12), tt, .5)   # трещит леска
dl = d1 - d0; mot = bandn(dl + 1, 700, 1.4) * np.sin(np.pi * np.clip(T(dl + 1) / (dl + 1), 0, 1)) ** .8
eng = np.sin(np.cumsum(60 + 28 * np.abs(np.sin(2 * np.pi * np.arange(len(mot)) / SR * .13))) / SR * 2 * np.pi)   # гул
place(mot, d0, .16); place(eng * (mot != 0), d0, .0)
for a, b in M["breach"]: place(splash(1.1, 1), a, .6, pan=.3); place(splash(1.3, 1), b, .8, pan=-.3); place(boing(180, .5), a + .3, .1)
for tt in np.arange(d0 + 1, d1 - 1, .12): place(bandn(.09, 3000, 1) * np.exp(-T(.09) * 40), tt, .045 * (1 - abs((tt - (d0 + d1) / 2) / (dl / 2)) ** 2 * .5))  # брызги кильватера
# пляж: звон упавших стаканов
for i in range(4): place(boing(520 + 60 * i, .25) * .6, S(13) + .9 + i * .15, .12, pan=.4)
# сом уплывает, кошелёк
place(splash(1.4, 1), S(19) + 1.7, .7, pan=.5); place(splash(1.0, 1), S(19) + 3.3, .4)
for k in range(10): place(np.sin(2 * np.pi * rng.uniform(2800, 4600) * T(.2)) * np.exp(-T(.2) * 18), S(19) + 3.9 + k * .09, .05, pan=rng.uniform(-.4, .4))
# грустный тромбон после «Нахуй мне пятьсот»
def trombone(f0, f1, d):
    t = T(d); fr = f0 + (f1 - f0) * (t / d) ** 1.4 + 5 * np.sin(2 * np.pi * 5.5 * t); ph = np.cumsum(fr) / SR * 2 * np.pi; s = np.sin(ph) + .5 * np.sin(2 * ph) + .3 * np.sin(3 * ph)
    return s * np.clip(t / .04, 0, 1) * np.clip((d - t) / .15, 0, 1)
tb = E(21) + .1
for (a, b, d, at) in [(233, 220, .4, tb), (220, 208, .4, tb + .45), (208, 196, .4, tb + .9)]: place(trombone(a, b, d), at, .09)
# музыка: банджо-подобная пентатоника, 112 BPM; в погоне плотнее, на баннере отдельно приглушается
bpm = 112; beat = 60 / bpm; mus = np.zeros(n)
scale = [196, 220, 261.6, 293.7, 329.6, 392, 440, 523.3]; pat = [0, 2, 4, 2, 5, 4, 2, 3, 0, 2, 4, 6, 5, 4, 2, 1]
for b in range(int(DUR / beat * 2)):
    tt = b * beat / 2; chase = d0 <= tt < d1
    if not chase and b % 2: continue
    if tt > E(22) + .2: break
    f = scale[pat[(b // 1) % 16]] * (1 if not chase else 1.0); y = pluck(f, .4) * (.7 if chase else .5); i = int(tt * SR); mus[i:i + len(y)] += y[:max(0, min(len(y), n - i))]
    if chase and b % 4 == 0: k = thump(70, .18, .8); mus[i:i + len(k)] += k[:max(0, min(len(k), n - i))] * .6
    if b % 4 == 0 and not chase: bs_ = pluck(scale[0] / 2, .6); mus[i:i + len(bs_)] += bs_[:max(0, min(len(bs_), n - i))] * .7
mus = mus / (np.abs(mus).max() + 1e-9) * .17
ve = np.sqrt(np.convolve(voice ** 2, np.ones(2646) / 2646, mode="same")); env = np.clip(ve / .08, 0, 1)
bg = np.stack([L, R], 1) + np.stack([mus, mus], 1); bg *= (1 - .55 * env)[:, None]
out = bg + np.stack([voice, voice], 1) * 1.15; out = out / (np.abs(out).max() + 1e-9) * .92
with wave.open(str(ROOT / "build/audio.wav"), "wb") as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype(np.int16).tobytes())
print(f"✔ audio.wav {DUR:.1f} с")
