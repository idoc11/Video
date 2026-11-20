"""Гонка 8 шариков по зигзагу из ступеней. Подбирает самую напряжённую гонку (смены лидера, фотофиниш).
Выход: data/frames.bin, data/meta.json, data/audio.json"""
import json, math
from pathlib import Path
import numpy as np
from scipy.spatial import cKDTree

ROOT = Path(__file__).resolve().parent; OUT = ROOT / "data"; OUT.mkdir(exist_ok=True)
FPS = 30; R = 0.45; G = -24.0; E_B, E_S, MU = 0.62, 0.5, 0.3; SUB = 1 / 360; REC = 1 / 240; NB = 8; PRE = 3.6
NAMES = ["КРАСНЫЙ", "ОРАНЖЕВЫЙ", "ЖЁЛТЫЙ", "ЗЕЛЁНЫЙ", "ГОЛУБОЙ", "СИНИЙ", "ФИОЛЕТОВЫЙ", "РОЗОВЫЙ"]
FIN_Y = -62.0; FLOOR_Y = -67.0
def build():
    segs = []
    for i in range(1, 10):
        y = -6.0 * i
        a, b = ((-5.0, y + .9), (0.9, y - 1.1)) if i % 2 else ((5.0, y + .9), (-0.9, y - 1.1))
        segs.append(dict(a=a, b=b, th=.24, kind="ramp"))
    segs += [dict(a=(-5, 4.5), b=(-5, FLOOR_Y), th=.3, kind="wall"), dict(a=(5, 4.5), b=(5, FLOOR_Y), th=.3, kind="wall"),
             dict(a=(-5, FLOOR_Y), b=(5, FLOOR_Y), th=.3, kind="floor"), dict(a=(-5, 3.0), b=(5, 3.0), th=.3, kind="gate")]
    pegs = [((3.0 if i % 2 else -3.0), -6.0 * i - 3.2) for i in range(1, 10)] + [((1.2 if i % 2 else -1.2), -6.0 * i - 1.3) for i in (1, 3, 5, 7)]
    return segs, pegs
SEGS, PEGS = build()

def seg_closest(px, py, a, b):
    ax, ay = a; bx, by = b; dx, dy = bx - ax, by - ay
    t = np.clip(((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy), 0, 1); return ax + t * dx, ay + t * dy

def simulate(seed, record=False):
    rng = np.random.default_rng(seed)
    x = np.linspace(-3.5, 3.5, NB) + rng.uniform(-.15, .15, NB); y = np.full(NB, 3.0 + R + .15) + rng.uniform(0, .1, NB)
    rng.shuffle(x)
    vx = rng.uniform(-.4, .4, NB); vy = np.zeros(NB); ang = np.zeros(NB); om = rng.uniform(-2, 2, NB)
    fin_t = np.full(NB, np.nan); t = 0.0; rec_acc = 0.0; snaps = []; hits = []; leaders = []; next_l = 0.25
    gate_open = False
    while True:
        if not gate_open and t >= 0: gate_open = True
        vy += G * SUB; x += vx * SUB; y += vy * SUB; ang += om * SUB; om *= (1 - .12 * SUB)
        for s in SEGS:
            if s["kind"] == "gate" and gate_open: continue
            cx, cy = seg_closest(x, y, s["a"], s["b"]); dx, dy = x - cx, y - cy; d = np.hypot(dx, dy) + 1e-9; m = d < R + s["th"] / 2
            if not m.any(): continue
            nx, ny = dx[m] / d[m], dy[m] / d[m]; pen = R + s["th"] / 2 - d[m]; x[m] += nx * pen; y[m] += ny * pen
            vn = vx[m] * nx + vy[m] * ny; k = vn < 0; ii = np.where(m)[0][k]
            if len(ii):
                jn = -(1 + E_S) * vn[k]; vx[ii] += jn * nx[k]; vy[ii] += jn * ny[k]
                tx, ty = -ny[k], nx[k]; vt = vx[ii] * tx + vy[ii] * ty + om[ii] * R; jt = np.clip(-vt / 3.0, -MU * np.abs(jn), MU * np.abs(jn))
                vx[ii] += jt * tx; vy[ii] += jt * ty; om[ii] += jt * 2.0 / R * .5
                for q, v_ in zip(ii, np.abs(vn[k])):
                    if v_ > 2.2: hits.append((t, float(x[q]), float(y[q]), float(v_), 0))
        for px_, py_ in PEGS:
            dx, dy = x - px_, y - py_; d = np.hypot(dx, dy) + 1e-9; m = d < R + .35
            if not m.any(): continue
            nx, ny = dx[m] / d[m], dy[m] / d[m]; pen = R + .35 - d[m]; x[m] += nx * pen; y[m] += ny * pen
            vn = vx[m] * nx + vy[m] * ny; k = vn < 0; ii = np.where(m)[0][k]
            if len(ii):
                vx[ii] -= 1.75 * vn[k] * nx[k]; vy[ii] -= 1.75 * vn[k] * ny[k]
                for q, v_ in zip(ii, np.abs(vn[k])):
                    if v_ > 2.0: hits.append((t, float(x[q]), float(y[q]), float(v_), 1))
        pr = cKDTree(np.stack([x, y], 1)).query_pairs(2 * R, output_type="ndarray")
        for a, b in pr:
            dx, dy = x[b] - x[a], y[b] - y[a]; d = math.hypot(dx, dy) + 1e-9; nx, ny = dx / d, dy / d; pen = 2 * R - d
            x[a] -= nx * pen * .5; y[a] -= ny * pen * .5; x[b] += nx * pen * .5; y[b] += ny * pen * .5
            vn = (vx[b] - vx[a]) * nx + (vy[b] - vy[a]) * ny
            if vn < 0:
                j = -(1 + E_B) * vn * .5; vx[a] -= j * nx; vy[a] -= j * ny; vx[b] += j * nx; vy[b] += j * ny
                if -vn > 2.5: hits.append((t, float(x[a]), float(y[a]), float(-vn), 2))
        done = np.isnan(fin_t) & (y < FIN_Y)
        fin_t[done] = t
        t += SUB
        if t >= next_l: leaders.append(int(np.argmin(np.where(np.isnan(fin_t), y, -99)))) if (np.isnan(fin_t).any()) else None; next_l += .25
        rec_acc += SUB
        if record and rec_acc >= REC - 1e-9:
            rec_acc -= REC; snaps.append(np.stack([x, y, ang], 1).astype(np.float32))
        first = np.nanmin(fin_t) if not np.isnan(fin_t).all() else None
        if (first is not None and (not np.isnan(fin_t).any() or t > first + 12.0)) and t > first + 4.0: break
        if t > 60: break
    return dict(fin=fin_t, leaders=leaders, snaps=snaps, hits=hits, t_end=t, y0=None)

def score(r):
    fin = r["fin"]
    if np.isnan(fin).any(): return -1
    o = np.sort(fin); margin = o[1] - o[0]; L = r["leaders"]; changes = sum(1 for a, b in zip(L, L[1:]) if a != b)
    winner = int(np.nanargmin(fin)); mid = L[int(len(L) * .4)] if L else -1
    return changes * 1.0 + (2.5 if winner != mid else 0) + (3 if .08 < margin < .5 else 0) - abs(o[0] - 14) * .25

best, bs = None, -9
for seed in range(80):
    r = simulate(seed); sc = score(r)
    if sc > bs: best, bs, bseed = r, sc, seed
print(f"лучший прогон: seed {bseed}, оценка {bs:.1f}; победитель {NAMES[int(np.nanargmin(best['fin']))]}, отрыв {np.sort(best['fin'])[1] - np.sort(best['fin'])[0]:.2f} c, смен лидера {sum(1 for a, b in zip(best['leaders'], best['leaders'][1:]) if a != b)}")
r = simulate(bseed, record=True); fin = r["fin"]; S = np.array(r["snaps"]); winner = int(np.nanargmin(fin)); t_first = float(np.nanmin(fin))
order_final = [int(i) for i in np.argsort(fin)]
# ───── время показа: предстарт PRE, замедление у финиша ─────
t_end = r["t_end"]; grid = np.arange(0, t_end + .5, .001); sp = np.ones_like(grid)
sp[(grid >= t_first - 1.3) & (grid < t_first + .9)] = .32
k = np.ones(300) / 300; sp = np.convolve(np.pad(sp, 150, mode="edge"), k, mode="same")[150:-150]
disp = np.concatenate([[0], np.cumsum(.001 / sp)[:-1]])
sim_of = lambda d: float(np.interp(d - PRE, disp, grid)) if d >= PRE else 0.0
disp_of = lambda s_: float(np.interp(s_, grid, disp)) + PRE
F = int(math.ceil((disp_of(t_end - .2)) * FPS)); dur = F / FPS
print(f"гонка {t_first:.1f} c физики, показ {dur:.1f} c, кадров {F}")
# ───── камера и кадры ─────
HDR = 24; SPARK = 300; per = HDR + NB * 5 + SPARK * 3
buf = np.zeros((F, per), np.float32); cy_f = None; wv = 11.5; Hv = wv / .5625
rng = np.random.default_rng(3)
conf = [(rng.uniform(-4, 4), rng.uniform(1.5, 5.5) * 1.0, rng.uniform(-3, 3), int(rng.integers(0, 10))) for _ in range(SPARK)]
for f in range(F):
    d = f / FPS; s_ = min(sim_of(d), t_end - 1e-3); i0 = min(int(s_ / REC), len(S) - 2); u = s_ / REC - i0
    st = S[i0] * (1 - u) + S[i0 + 1] * u
    alive_y = np.where(np.isnan(fin) | (fin > s_), st[:, 1], 99.0)
    li = int(alive_y.argmin()) if (alive_y < 98).any() else int(st[:, 1].argmin()); lead_y = float(st[li, 1])
    vyl = float((S[i0 + 1][li, 1] - S[i0][li, 1]) / REC)
    tgt = max(lead_y + max(-16.0, min(0.0, vyl)) * .36 - .12 * Hv, FLOOR_Y + Hv * .5 - 2.0) if d >= PRE else (3.0 - .15 * Hv + .2)
    cy_f = tgt if cy_f is None else cy_f + (tgt - cy_f) * (1 - math.exp(-1 / FPS / (.08 if d >= PRE else .25)))
    bob = 0.06 * np.sin(d * 5 + np.arange(NB)) if d < PRE else 0
    cd = 0 if d >= PRE else (3 if d < 1.8 else (3 if d < 2.4 else (2 if d < 3.0 else 1)))
    cdv = 4 if d < 1.8 else (3 if d < 2.4 else (2 if d < 3.0 else (1 if d < PRE else 0)))
    finished = (~np.isnan(fin)) & (fin <= s_); nfin = int(finished.sum())
    rank = sorted(range(NB), key=lambda i: (0, fin[i]) if finished[i] else (1, st[i, 1])); 
    hd = [cy_f, wv, .018 * math.sin(d * .7), d, 0 if d < PRE else (2 if nfin else 1), cdv, 1.0 if d >= PRE else 0.0, float(winner) if nfin else -1.0] + [float(i) for i in rank] + [float(nfin)]
    buf[f, :len(hd)] = hd
    blk = np.zeros((NB, 5), np.float32)
    for i in range(NB):
        fl = math.exp(-(s_ - fin[i]) / .35) if finished[i] else 0.0
        blk[i] = [st[i, 0], st[i, 1] + (bob[i] if np.ndim(bob) else 0), st[i, 2], i, fl]
    buf[f, HDR:HDR + NB * 5] = blk.reshape(-1)
    if nfin:
        tau = s_ - t_first; n_ = SPARK; o = HDR + NB * 5
        if 0 <= tau < 2.6:
            cx_ = np.array([c[0] for c in conf]); vy0 = np.array([c[1] * 2.2 for c in conf]); vx0 = np.array([c[2] for c in conf])
            px_ = vx0 * tau * 1.2 + cx_ * .4; py_ = FIN_Y + .5 + vy0 * tau - .5 * 9 * tau * tau; al = np.clip(1 - tau / 2.6, 0, 1)
            buf[f, o:o + n_ * 3] = np.stack([px_, py_, np.full(n_, al)], 1).reshape(-1)
banner_start = round(PRE + (disp_of(t_first - 1.3) - PRE) * .30 + 2.0, 2)
audio = dict(hits=[dict(t=disp_of(h[0]), x=h[1], v=h[3], kind=h[4]) for h in r["hits"][::2]], fin=[dict(t=disp_of(float(fin[i])), id=int(i)) for i in range(NB)], winner=winner,
             t_first=disp_of(t_first), duration=dur, pre=PRE)
meta = dict(frames=F, fps=FPS, nb=NB, hdr=HDR, spark=SPARK, per=per, duration=dur, names=NAMES, winner=winner, winner_name=NAMES[winner], pre=PRE, banner_start=banner_start,
            segs=[dict(a=s["a"], b=s["b"], th=s["th"], kind=s["kind"]) for s in SEGS], pegs=[dict(c=p, r=.35) for p in PEGS], fin_y=FIN_Y, order=order_final)
buf.tofile(OUT / "frames.bin"); (OUT / "meta.json").write_text(json.dumps(meta)); (OUT / "audio.json").write_text(json.dumps(audio))
print(f"✔ победитель: {NAMES[winner]}; финиш по порядку: {[NAMES[i] for i in order_final]}; баннер с {banner_start} c")
