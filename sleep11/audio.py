"""Звук: синтез музыки и эффектов + сведение с голосом.

Читает build/timeline.json и build/voice.wav, пишет build/mix.wav (44.1 кГц, стерео).
Все тайминги эффектов совпадают с анимацией в scene.html.
"""
import json
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent
BUILD = ROOT / "build"
SR = 44100
rng = np.random.default_rng(7)


# ───────────── примитивы ─────────────
def T(d):
    return np.arange(int(d * SR)) / SR


def sweep(f0, f1, d):
    t = T(d)
    fr = f0 * (f1 / f0) ** (t / d)
    return np.sin(2 * np.pi * np.cumsum(fr) / SR)


def noise(d):
    return rng.uniform(-1, 1, int(d * SR))


def band(x, lo=0, hi=SR / 2):
    """Полосовой фильтр через FFT с мягкими краями."""
    X = np.fft.rfft(x)
    fr = np.fft.rfftfreq(len(x), 1 / SR)
    m = np.ones_like(fr)
    if lo > 0:
        m *= 1 / (1 + (lo / np.maximum(fr, 1)) ** 4)
    if hi < SR / 2:
        m *= 1 / (1 + (fr / hi) ** 4)
    return np.fft.irfft(X * m, len(x))


def env(d, attack=.004, decay=10.0):
    t = T(d)
    a = np.clip(t / attack, 0, 1)
    return a * np.exp(-t * decay)


def norm(x, peak=1.0):
    m = np.max(np.abs(x)) or 1
    return x / m * peak


def place(bus, x, at, gain=1.0):
    i = int(at * SR)
    if i < 0:
        x, i = x[-i:], 0
    j = min(len(bus), i + len(x))
    if j > i:
        bus[i:j] += x[: j - i] * gain


# ───────────── эффекты ─────────────
def whoosh(d=.42, f0=300, f1=5000):
    """Свист: шум с полосой, которая едет по частоте (STFT overlap-add)."""
    n = noise(d + .05)
    N, hop = 1024, 256
    out = np.zeros(len(n) + N)
    win = np.hanning(N)
    fr = np.fft.rfftfreq(N, 1 / SR)
    frames = (len(n) - N) // hop
    for k in range(max(1, frames)):
        q = k / max(1, frames - 1)
        fc = f0 * (f1 / f0) ** (np.sin(q * np.pi / 2))
        seg = n[k * hop: k * hop + N]
        if len(seg) < N:
            break
        X = np.fft.rfft(seg * win) * np.exp(-((np.log2(np.maximum(fr, 1) / fc)) ** 2) / .5)
        out[k * hop: k * hop + N] += np.fft.irfft(X, N) * win
    out = out[: int(d * SR)]
    t = T(d)
    return norm(out * np.sin(np.pi * t / d) ** 1.5)


def pop():
    return sweep(1100, 260, .07) * env(.07, .001, 45)


def boom():
    d = 1.1
    return norm(sweep(110, 32, d) * env(d, .002, 3.2) + band(noise(d), 0, 400) * env(d, .001, 9) * .8)


def thump(f=62, d=.22):
    return sweep(f * 1.8, f, d) * env(d, .002, 18)


def tick(f=3200):
    return norm(np.sin(2 * np.pi * f * T(.035)) * env(.035, .0005, 160) + band(noise(.035), 4000) * env(.035, .0003, 300) * .6)


def power_down():
    d = .5
    return sweep(950, 70, d) * env(d, .003, 4) * .9


def glitch(d=.13):
    t = T(d)
    sq = np.sign(np.sin(2 * np.pi * rng.uniform(180, 900) * t))
    x = (sq * .6 + noise(d) * .5) * (np.sin(2 * np.pi * 37 * t) > 0)
    x = np.round(x * 4) / 4  # «битовое» дробление
    return x * env(d, .001, 4)


def flip():
    return band(noise(.06), 1500, 7000) * env(.06, .002, 55)


def bell(f=1046.5, d=2.0):
    t = T(d)
    x = sum(a * np.sin(2 * np.pi * f * m * t) * np.exp(-t * dk) for m, a, dk in
            [(1, 1, 2.2), (2.01, .5, 3.5), (3.02, .3, 5), (4.1, .2, 7), (5.4, .12, 9)])
    return norm(x * np.clip(t / .002, 0, 1))


def drone(d):
    t = T(d)
    x = sum(np.sin(2 * np.pi * f * t + np.sin(2 * np.pi * .3 * t) * 2) for f in (55, 55.8, 82.6, 110.9))
    x *= .6 + .4 * np.sin(2 * np.pi * 6 * t)  # тремоло
    fade = np.minimum(1, np.minimum(t / .3, (d - t) / .3))
    return norm(x) * fade


# ───────────── музыка ─────────────
def music(dur):
    bpm = 120
    beat = 60 / bpm
    bus = np.zeros(int((dur + 2) * SR))
    roots = [110.0, 87.31, 73.42, 82.41]  # Am F Dm E
    arps = [[440, 523.25, 659.25, 880], [349.23, 440, 523.25, 698.46],
            [293.66, 349.23, 440, 587.33], [329.63, 415.3, 493.88, 659.25]]
    kick = sweep(150, 45, .32) * env(.32, .001, 10)
    snare = band(noise(.2), 1200) * env(.2, .001, 20) * .7 + np.sin(2 * np.pi * 190 * T(.2)) * env(.2, .001, 30) * .5
    tk, tc = tick(3300), tick(2350)
    bass_bus = np.zeros_like(bus)
    arp_bus = np.zeros_like(bus)
    n_beats = int(dur / beat) + 2
    for b in range(n_beats):
        t0 = b * beat
        bar = (b // 4) % 4
        place(bus, kick, t0, .9)
        if b % 4 in (1, 3):
            place(bus, snare, t0, .45)
        for e in range(2):
            place(bus, tk if e == 0 else tc, t0 + e * beat / 2, .22)
            # бас восьмыми
            f = roots[bar] * (2 if (b % 2 == 1 and e == 1) else 1)
            d = beat / 2
            tt = T(d)
            saw = 2 * ((tt * f) % 1) - 1
            place(bass_bus, saw * env(d, .003, 7), t0 + e * d, .5)
        for s in range(4):  # арпеджио шестнадцатыми
            f = arps[bar][(b * 4 + s) % 4]
            d = .22
            tt = T(d)
            tri = 2 * np.abs(2 * ((tt * f) % 1) - 1) - 1
            place(arp_bus, tri * env(d, .002, 14), t0 + s * beat / 4, .16)
    bus += band(bass_bus, 0, 900) + band(arp_bus, 300, 6000)
    return bus[: int(dur * SR)]


# ───────────── сведение ─────────────
def views_of(sc):
    vs = []
    for i, (name, seg) in enumerate(sc["views"]):
        vs.append({"name": name, "start": sc["start"] if i == 0 else sc["segments"][seg]["start"] - .06})
    for i, v in enumerate(vs):
        v["end"] = vs[i + 1]["start"] if i < len(vs) - 1 else sc["end"]
    return vs


def main():
    tl = json.loads((BUILD / "timeline.json").read_text())
    dur = tl["duration"]
    n = int(dur * SR)
    with wave.open(str(BUILD / "voice.wav")) as w:
        voice = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    voice = np.pad(voice, (0, max(0, n - len(voice))))[:n]

    sfx = np.zeros(n)
    duck_extra = np.ones(n)  # доп. приглушение музыки (моргания)
    W = whoosh()
    for k, sc in enumerate(tl["scenes"]):
        if k > 0:
            place(sfx, W, sc["start"] - .26, .32)
        for gi, g in enumerate(sc["segments"]):
            place(sfx, pop(), sc["start"] if gi == 0 else g["start"] - .06, .22)
        vs = views_of(sc)
        for vi, v in enumerate(vs):
            v0, vd = v["start"], v["end"] - v["start"]
            seg_rel = [g["start"] - v0 for g in sc["segments"]]
            s1 = seg_rel[1] if len(seg_rel) > 1 else .7
            if vi > 0:
                place(sfx, whoosh(.25, 900, 6000), v0 - .1, .18)
            name = v["name"]
            if name == "hook":
                place(sfx, boom(), v0, .55)
            elif name == "brain":
                k0 = int(np.ceil(v0 * 1.6 - .25))
                while (k0 + .25) / 1.6 < v["end"]:
                    tb = (k0 + .25) / 1.6
                    place(sfx, thump(58), tb - .03, .5)
                    place(sfx, thump(52), tb + .2, .35)
                    k0 += 1
            elif name == "clock":
                t = 0.0
                while t < vd * .85:
                    place(sfx, tick(4200 if int(t / .055) % 2 else 3000), v0 + t, .3)
                    t += .055
                place(sfx, bell(1318.5, 1.0), v0 + vd * .85, .18)
            elif name == "drunk":
                place(sfx, sweep(420, 260, .45) * env(.45, .01, 4) * np.sin(2 * np.pi * 9 * T(.45)), v0 + .1, .2)
            elif name == "brainOff":
                for i in range(6):
                    place(sfx, power_down(), v0 + s1 + .05 + i * .14, .16 if i else .3)
                for b in (s1 + .55, s1 + 1.3):
                    place(sfx, thump(70, .3), v0 + b + .12, .55)
                    a, e = int((v0 + b) * SR), int((v0 + b + .36) * SR)
                    duck_extra[a:e] = np.minimum(duck_extra[a:e], .25 + .75 * np.abs(np.linspace(-1, 1, e - a)))
            elif name == "sleepwalk":
                place(sfx, whoosh(.18, 2000, 400), v0 + .7, .25)
            elif name == "street":
                place(sfx, drone(vd - s1 + .2), v0 + s1 - .1, .2)
                for g in (.25, s1 + .45, s1 + 1.25):
                    place(sfx, glitch(), v0 + g, .35)
            elif name == "calendar":
                for k2 in range(1, 11):
                    place(sfx, flip(), v0 + k2 * .07, .4)
                place(sfx, boom()[: int(.6 * SR)], v0 + .72, .4)
            elif name == "trophy":
                t, last = 0.0, -1
                while t < 1.0:
                    val = int(264 * (1 - (1 - t) ** 3))
                    if val // 12 != last:
                        place(sfx, tick(2600), v0 + t, .22)
                        last = val // 12
                    t += .01
                place(sfx, bell(1046.5, 2.2), v0 + 1.0, .35)
                place(sfx, bell(1568, 1.8), v0 + 1.0, .2)
                place(sfx, band(noise(.3), 2000) * env(.3, .001, 12), v0 + 1.0, .25)

    # музыка с приглушением под голос
    mus = music(dur)
    win = int(.06 * SR)
    venv = np.sqrt(np.convolve(voice ** 2, np.ones(win) / win, mode="same"))
    venv = np.convolve(venv, np.ones(win * 3) / (win * 3), mode="same")
    duck = 1 - .5 * np.clip(venv / .08, 0, 1)
    fade = np.clip((dur - np.arange(n) / SR) / 1.0, 0, 1)
    mus = norm(mus, .2) * duck * duck_extra * fade

    mix = voice + mus + sfx * .9
    mix = norm(mix, .95)
    st = np.stack([mix, mix], axis=1)
    with wave.open(str(BUILD / "mix.wav"), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((st * 32767).astype(np.int16).tobytes())
    print(f"mix.wav: {dur:.2f} c")


if __name__ == "__main__":
    main()
