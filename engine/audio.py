"""Звук ролика: python3 engine/audio.py <папка ролика>

Музыка (параметры в script.json → music), звуковые эффекты (у каждой картинки в views → sfx),
звук рекламного баннера, сведение с голосом → build/mix.wav.

Эффект: [тип, когда, громкость, длительность?, повтор_каждые?, до_когда?]
  когда/до_когда: число (сек от начала картинки), "end", "end-0.3", "s1" / "s1+0.2" (начало реплики 1),
                  "e0-0.3" (конец реплики 0)
  длительность: число или момент окончания в том же формате (для фоновых звуков)
"""
import json
import re
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

SR = 44100
rng = np.random.default_rng(7)


def T(d): return np.arange(int(max(d, .001) * SR)) / SR
def noise(d): return rng.uniform(-1, 1, len(T(d)))


def sweep(f0, f1, d):
    t = T(d)
    return np.sin(2 * np.pi * np.cumsum(f0 * (f1 / f0) ** (t / d)) / SR)


def band(x, lo=0, hi=SR / 2):
    X = np.fft.rfft(x); fr = np.fft.rfftfreq(len(x), 1 / SR); m = np.ones_like(fr)
    if lo > 0: m *= 1 / (1 + (lo / np.maximum(fr, 1)) ** 4)
    if hi < SR / 2: m *= 1 / (1 + (fr / hi) ** 4)
    return np.fft.irfft(X * m, len(x))


def env(d, a=.004, k=10.0):
    t = T(d); return np.clip(t / a, 0, 1) * np.exp(-t * k)


def fade(x, a=.05, b=.2):
    n = len(x); t = np.arange(n) / SR
    return x * np.clip(t / a, 0, 1) * np.clip((n / SR - t) / b, 0, 1)


def norm(x, peak=1.0):
    m = np.max(np.abs(x)) or 1; return x / m * peak


def place(bus, x, at, gain=1.0):
    i = int(at * SR)
    if i < 0: x, i = x[-i:], 0
    j = min(len(bus), i + len(x))
    if j > i: bus[i:j] += x[: j - i] * gain


# ───────────── библиотека эффектов ─────────────
def whoosh(d=.42, f0=300, f1=5000):
    n = noise(d + .05); N, hop = 1024, 256; out = np.zeros(len(n) + N); win = np.hanning(N); fr = np.fft.rfftfreq(N, 1 / SR)
    frames = (len(n) - N) // hop
    for k in range(max(1, frames)):
        q = k / max(1, frames - 1); fc = f0 * (f1 / f0) ** np.sin(q * np.pi / 2)
        seg = n[k * hop: k * hop + N]
        if len(seg) < N: break
        X = np.fft.rfft(seg * win) * np.exp(-((np.log2(np.maximum(fr, 1) / fc)) ** 2) / .5)
        out[k * hop: k * hop + N] += np.fft.irfft(X, N) * win
    t = T(d); return norm(out[: len(t)] * np.sin(np.pi * t / d) ** 1.5)


SFX = {
    "pop": lambda d: sweep(1100, 260, .07) * env(.07, .001, 45),
    "boom": lambda d: norm(sweep(110, 32, 1.1) * env(1.1, .002, 3.2) + band(noise(1.1), 0, 400) * env(1.1, .001, 9) * .8),
    "thump": lambda d: sweep(110, 60, .25) * env(.25, .002, 16),
    "tick": lambda d: norm(np.sin(2 * np.pi * 3200 * T(.035)) * env(.035, .0005, 160) + band(noise(.035), 4000) * env(.035, .0003, 300) * .6),
    "whoosh": lambda d: whoosh(d or .42),
    "swish": lambda d: whoosh(.25, 900, 6000),
    "rise_whoosh": lambda d: whoosh(d or .6, 200, 4000),
    "crack": lambda d: norm(band(noise(.14), 1200, 9000) * env(.14, .0005, 38) + np.pad(sweep(300, 80, .1) * env(.1, .001, 30), (0, len(T(.14)) - len(T(.1)))) * .7),
    "clink": lambda d: norm(sum(a * np.sin(2 * np.pi * fq * T(.25)) * env(.25, .0005, k) for fq, a, k in [(2400, 1, 18), (3720, .7, 25), (5230, .5, 32)]) + band(noise(.25), 3000) * env(.25, .0003, 120) * .5),
    "rockhit": lambda d: norm(sweep(90, 38, .6) * env(.6, .002, 6) + band(noise(.6), 80, 1800) * env(.6, .001, 9) * .9),
    "stinger": lambda d: norm(sum(np.sin(2 * np.pi * fq * T(1.8) + .3 * np.sin(2 * np.pi * 5 * T(1.8))) for fq in (73.4, 77.8, 155.6, 220, 233.1)) * env(1.8, .005, 2.2) + band(noise(1.8), 0, 2000) * env(1.8, .001, 14) * .6),
    "glitch": lambda d: np.round((np.sign(np.sin(2 * np.pi * 420 * T(.13))) * .6 + noise(.13) * .5) * (np.sin(2 * np.pi * 37 * T(.13)) > 0) * 4) / 4 * env(.13, .001, 4),
    "thunder": lambda d: norm(sweep(70, 30, 2.4) * env(2.4, .01, 1.6) + band(noise(2.4), 30, 900) * (env(2.4, .002, 1.4) + .6 * env(2.4, .3, 2.5)) * (0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 3.1 * T(2.4))))),
    "bell": lambda d: norm(sum(a * np.sin(2 * np.pi * 1046.5 * m * T(2)) * np.exp(-T(2) * k) for m, a, k in [(1, 1, 2.2), (2.01, .5, 3.5), (3.02, .3, 5), (4.1, .2, 7)])),
    "crash": lambda d: norm(band(noise(1.0), 200, 6000) * env(1.0, .002, 4) + np.pad(sweep(80, 35, .6) * env(.6, .002, 7), (0, len(T(1.0)) - len(T(.6)))) * 1.2),
    "splash": lambda d: norm(band(noise(.5), 400, 5000) * env(.5, .01, 7) * (1 + .5 * np.sin(2 * np.pi * 23 * T(.5)))),
    "heartbeat": lambda d: _loop(lambda: np.pad(sweep(95, 55, .16) * env(.16, .002, 20), (0, int(.12 * SR))) + 0, d or 2, .8, second=.22),
    "wind": lambda d: fade(norm(band(noise(d), 150, 900) * (.6 + .4 * np.sin(2 * np.pi * .35 * T(d))) + band(noise(d), 900, 2400) * .25), .4, .4),
    "rumble": lambda d: fade(norm(band(noise(d), 20, 160) * (1 + .3 * np.sin(2 * np.pi * 7 * T(d)))), .2, .3),
    "drone": lambda d: fade(norm(sum(np.sin(2 * np.pi * fq * T(d) + np.sin(2 * np.pi * .3 * T(d)) * 2) for fq in (55, 55.8, 82.6, 110.9)) * (.7 + .3 * np.sin(2 * np.pi * 5 * T(d)))), .3, .3),
    "plane": lambda d: fade(norm(sum(np.sin(2 * np.pi * fq * T(d)) for fq in (92, 184, 276)) * .4 + band(noise(d), 60, 500)), .4, .4),
    "scratch": lambda d: fade(norm(band(noise(d), 1800, 7000) * (np.sin(2 * np.pi * 9 * T(d)) > .2) * (.5 + .5 * np.abs(np.sin(2 * np.pi * 2.3 * T(d))))), .02, .05),
    "heli": lambda d: fade(norm(band(noise(d), 40, 700) * (.35 + .65 * (np.sin(2 * np.pi * 12 * T(d)) > .4)) + np.sin(2 * np.pi * 48 * T(d)) * .3), .6, .3),
    "water": lambda d: fade(norm(band(noise(d), 250, 2500) * (.5 + .5 * np.abs(np.sin(2 * np.pi * 1.7 * T(d)) * np.sin(2 * np.pi * 3.1 * T(d))))), .3, .3),
    "jungle": lambda d: fade(norm(sum(.3 * np.sin(2 * np.pi * fq * T(d)) * (np.sin(2 * np.pi * am * T(d)) > 0) for fq, am in [(4300, 31), (5600, 23), (6900, 41)]) + _chirps(d)), .3, .3),
    "riser": lambda d: norm(band(noise(d), 300, 6000) * (T(d) / d) ** 2 + sweep(150, 900, d) * (T(d) / d) ** 2 * .5),
    "pour": lambda d: fade(norm(band(noise(d), 700, 3500) * (.6 + .4 * np.sin(2 * np.pi * 13 * T(d)))), .05, .2),
    "sizzle": lambda d: fade(norm(band(noise(d), 3000) * (.5 + .5 * np.sin(2 * np.pi * 17 * T(d)))), .05, .3),
    "shimmer": lambda d: fade(norm(sum(np.sin(2 * np.pi * fq * T(d)) * (.5 + .5 * np.sin(2 * np.pi * (.7 + i * .3) * T(d) + i)) for i, fq in enumerate((1318.5, 1567.98, 1975.5, 2637)))), .4, .5),
    "birds": lambda d: _chirps(d, 3),
}


def _chirps(d, n=None):
    out = np.zeros(len(T(d))); k = n or int(d * 1.2)
    for _ in range(k):
        f0 = rng.uniform(2200, 3600); c = sweep(f0, f0 * rng.uniform(1.2, 1.6), .09) * env(.09, .005, 20)
        for j in range(rng.integers(2, 4)):
            place(out, c, rng.uniform(0, max(.01, d - .3)) + j * .11, .5)
    return out


def _loop(fn, d, period, second=None):
    out = np.zeros(len(T(d))); t = 0.0
    while t < d:
        x = fn(); place(out, x, t, 1.0)
        if second: place(out, x * .7, t + second, 1.0)
        t += period
    return out


# ───────────── музыка ─────────────
def music(dur, cfg):
    bpm = cfg.get("bpm", 100); beat = 60 / bpm
    roots = cfg.get("roots", [146.83, 116.54, 98.0, 110.0])           # Dm Bb Gm A
    arps = cfg.get("arps", [[293.66, 349.23, 440, 587.33], [233.08, 293.66, 349.23, 466.16],
                            [196.0, 233.08, 293.66, 392.0], [220.0, 277.18, 329.63, 440.0]])
    bus = np.zeros(int((dur + 2) * SR)); bass = np.zeros_like(bus); arp = np.zeros_like(bus); pad = np.zeros_like(bus)
    kick = sweep(140, 42, .4) * env(.4, .001, 8)
    tom = sweep(180, 90, .3) * env(.3, .001, 10)
    tk = SFX["tick"](0)
    for b in range(int(dur / beat) + 2):
        t0 = b * beat; bar = (b // 4) % len(roots)
        if b % 4 in (0, 2) or (cfg.get("pulse") and b % 2): place(bus, kick, t0, .9)
        if b % 4 == 3: place(bus, tom, t0 + beat / 2, .35)
        place(bus, tk, t0 + beat / 2, .12)
        for e in range(2):
            d = beat / 2; tt = T(d); fq = roots[bar] / 2 * (2 if e == 1 and b % 2 else 1)
            place(bass, (2 * ((tt * fq) % 1) - 1) * env(d, .003, 6), t0 + e * d, .55)
        for s in range(2):
            fq = arps[bar][(b * 2 + s) % 4]; d = .3; tt = T(d)
            place(arp, (2 * np.abs(2 * ((tt * fq) % 1) - 1) - 1) * env(d, .002, 9), t0 + s * beat / 2, .14)
        if b % 4 == 0:
            d = beat * 4; tt = T(d)
            chord = sum(2 * ((tt * fq * k) % 1) - 1 for fq in arps[bar][:3] for k in (.5, .503))
            place(pad, chord * np.clip(tt / .4, 0, 1) * np.clip((d - tt) / .4, 0, 1), t0, .05)
    bus += band(bass, 0, 700) + band(arp, 250, 5000) + band(pad, 100, 1400)
    return bus[: int(dur * SR)]


# ───────────── тайминги ─────────────
def views_of(sc):
    vs = []
    for i, v in enumerate(sc["views"]):
        name, seg = (v["name"], v.get("seg", 0)) if isinstance(v, dict) else (v[0], v[1])
        vs.append({"name": name, "sfx": v.get("sfx", []) if isinstance(v, dict) else [],
                   "start": sc["start"] if i == 0 else sc["segments"][seg]["start"] - .06})
    for i, v in enumerate(vs):
        v["end"] = vs[i + 1]["start"] if i < len(vs) - 1 else sc["end"]
    return vs


def tspec(x, v, sc):
    if isinstance(x, (int, float)): return v["start"] + x
    m = re.fullmatch(r"(end|[se]\d+)([+-][\d.]+)?", x)
    base, off = m.group(1), float(m.group(2) or 0)
    if base == "end": return v["end"] + off
    g = sc["segments"][int(base[1:])]
    return (g["start"] if base[0] == "s" else g["end"]) + off


def main():
    vdir = Path(sys.argv[1]).resolve(); build = vdir / "build"
    script = json.loads((vdir / "script.json").read_text())
    tl = json.loads((build / "timeline.json").read_text())
    dur = tl["duration"]; n = int(dur * SR)
    voice = load_wav(build / "voice.wav"); voice = np.pad(voice, (0, max(0, n - len(voice))))[:n]
    sfx = np.zeros(n); duck_extra = np.ones(n)
    W = SFX["whoosh"](0)
    for k, sc in enumerate(tl["scenes"]):
        if k > 0: place(sfx, W, sc["start"] - .26, .3)
        for gi, g in enumerate(sc["segments"]):
            place(sfx, SFX["pop"](0), sc["start"] if gi == 0 else g["start"] - .06, .2)
        for vi, v in enumerate(views_of(sc)):
            if vi > 0: place(sfx, SFX["swish"](0), v["start"] - .1, .16)
            for cue in v["sfx"]:
                kind, t0, gain = cue[0], tspec(cue[1], v, sc), cue[2]
                d = cue[3] if len(cue) > 3 else None
                if isinstance(d, str): d = tspec(d, v, sc) - t0
                every = cue[4] if len(cue) > 4 else None
                until = tspec(cue[5], v, sc) if len(cue) > 5 else t0
                x = SFX[kind](d)
                t = t0
                while True:
                    place(sfx, x, t, gain)
                    if not every: break
                    t += every
                    if t > until: break
    mus = music(dur, script.get("music", {}))
    win = int(.06 * SR)
    venv = np.sqrt(np.convolve(voice ** 2, np.ones(win) / win, mode="same"))
    venv = np.convolve(venv, np.ones(win * 3) / (win * 3), mode="same")
    duck = 1 - .5 * np.clip(venv / .08, 0, 1)
    tail = np.clip((dur - np.arange(n) / SR) / 1.0, 0, 1)
    mus = norm(mus, script.get("music", {}).get("level", .2)) * duck * tail

    bn, cfg = tl.get("banner"), script.get("banner")
    if bn and cfg:
        raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str((vdir / cfg["file"]).resolve()), "-vn", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                             capture_output=True, check=True).stdout
        ba = np.frombuffer(raw, dtype=np.float32).astype(np.float64)[: int(bn["dur"] * SR)]
        def active_rms(x):
            e = np.sqrt(np.convolve(x ** 2, np.ones(2205) / 2205, mode="same")); return np.sqrt(np.mean(x[e > .3 * e.max()] ** 2))
        gain = active_rms(voice) / active_rms(ba)
        a, e = int(bn["start"] * SR), int((bn["start"] + bn["dur"]) * SR)
        sfx[a:e] *= 0  # свои эффекты под баннером не звучат
        place(sfx, ba * gain / .9, bn["start"], 1.0)
        ramp = np.clip(np.minimum(np.arange(e - a) / (.25 * SR), (e - a - np.arange(e - a)) / (.25 * SR)), 0, 1)
        mus[a:e] *= 1 - .8 * ramp
        print(f"  баннер {bn['start']:.2f}–{bn['start'] + bn['dur']:.2f} c, звук x{gain:.2f}")

    mix = norm(voice + mus + sfx * .9, .95)
    with wave.open(str(build / "mix.wav"), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.stack([mix, mix], 1) * 32767).astype(np.int16).tobytes())
    print(f"  mix.wav {dur:.2f} c")


def load_wav(p):
    with wave.open(str(p)) as w:
        return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768


if __name__ == "__main__":
    main()
