"""Физика удвоения шариков → data/frames.bin + data/meta.json (камера, события, тайминги).
Запуск: python3 physics.py
2D-физика (круги, гравитация, отскоки, трение с вращением) на фиксированном шаге 1/360 с.
Удар о ступень №k впервые → шар делится на два одинаковых: 1→2→4→…→512 (8 ступеней + пол).
"""
import json
import math
from pathlib import Path

import numpy as np
from scipy.spatial import cKDTree

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "data"; OUT.mkdir(exist_ok=True)
FPS = 30
R = 0.34                       # радиус шарика
G = -24.0
E_BALL, E_STATIC, MU = 0.62, 0.45, 0.35
SUB = 1.0 / 360                # шаг физики
REC = 1.0 / 240                # шаг записи
NMAX = 520
TIERS = 8
HOVER = 0.7                    # шарик «висит» до падения

# ───────── геометрия ─────────
def ramps():
    segs = []
    for i in range(1, TIERS + 1):
        y = -5.5 * i
        if i % 2: a, b = (-5.0, y + .8), (0.6, y - 1.1)
        else: a, b = (5.0, y + .8), (-0.6, y - 1.1)
        segs.append(dict(a=a, b=b, th=.22, kind="ramp", tier=i))
    return segs
RAMPS = ramps()
WALLS = [
    dict(a=(-5, 7), b=(-5, -49), th=.25, kind="wall"), dict(a=(5, 7), b=(5, -49), th=.25, kind="wall"),
    dict(a=(-5, -49), b=(-9.5, -52.5), th=.25, kind="wall"), dict(a=(5, -49), b=(9.5, -52.5), th=.25, kind="wall"),
    dict(a=(-9.5, -52.5), b=(-9.5, -65), th=.25, kind="wall"), dict(a=(9.5, -52.5), b=(9.5, -65), th=.25, kind="wall"),
]
FLOOR = dict(a=(-9.5, -64), b=(9.5, -64), th=.3, kind="floor", tier=9)
BUMPERS = [dict(c=(-6.6, -57.5), r=1.0), dict(c=(6.6, -57.5), r=1.0)]
PADDLE = dict(c=(0.0, -56.0), L=2.7, th=.24, w=1.25)
STATIC = RAMPS + WALLS + [FLOOR]

def seg_closest(px, py, a, b):
    ax, ay = a; bx, by = b; dx, dy = bx - ax, by - ay
    t = np.clip(((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy), 0, 1)
    return ax + t * dx, ay + t * dy

# ───────── состояние ─────────
x = np.full(NMAX, 1e9); y = np.full(NMAX, 1e9); vx = np.zeros(NMAX); vy = np.zeros(NMAX)
ang = np.zeros(NMAX); om = np.zeros(NMAX); gen = np.zeros(NMAX, int); stier = np.zeros(NMAX, int); tsplit = np.full(NMAX, -9.0)
alive = np.zeros(NMAX, bool)
x[0], y[0], alive[0] = -2.0, 2.2, True
N = 1
floor_open = False
events = []   # сплиты: t, x, y, gen
hits = []     # удары об статику: t, x, y, сила, вид
pair_energy = []  # на каждую запись: сумма сил шар-шар
snaps = []; cams = []; counts = []; flashes = []

def gscale(t):
    if t < HOVER: return 0.0
    return gscale.fn(t) if gscale.fn else 1.0
gscale.fn = None
flip = {"t0": None}

def spawn(i, t, tier, gx, gy):
    global N
    if N >= NMAX or not alive[i]: return None
    j = N; N += 1
    x[j], y[j] = x[i] + .35 * R, y[i]; x[i] -= .35 * R
    vx[j], vy[j] = vx[i] + .9, vy[i]; vx[i] -= .9
    om[j] = -om[i]; ang[j] = ang[i]; alive[j] = True
    for k in (i, j): gen[k] = tier; stier[k] = tier; tsplit[k] = t
    events.append((t, float(x[i]), float(y[i]), tier, N))
    return j

def split_to(i, t, tier):
    """Деление до нужной ступени; пропущенные ступени догоняются (счёт всегда степень двойки)."""
    members = [i]
    for _ in range(tier - stier[i]):
        new = []
        for m in members:
            j = spawn(m, t, tier, x[m], y[m])
            if j is not None: new.append(j)
        members += new

def step(t):
    global N
    dt = SUB
    g = G * gscale(t)
    idx = np.where(alive)[0]
    if len(idx) == 0: return 0.0
    vy[idx] += g * dt
    x[idx] += vx[idx] * dt; y[idx] += vy[idx] * dt; ang[idx] += om[idx] * dt
    om[idx] *= (1 - .15 * dt); vx[idx] *= (1 - .02 * dt)
    px, py = x[idx], y[idx]
    # ── статика
    segs = [s for s in STATIC if not (s["kind"] == "floor" and floor_open)]
    pad_a = PADDLE["w"] * t
    ca, sa = math.cos(pad_a), math.sin(pad_a)
    pa = (PADDLE["c"][0] - ca * PADDLE["L"], PADDLE["c"][1] - sa * PADDLE["L"]); pb = (PADDLE["c"][0] + ca * PADDLE["L"], PADDLE["c"][1] + sa * PADDLE["L"])
    cand = [(s["a"], s["b"], s["th"], s, None) for s in segs] + [(pa, pb, PADDLE["th"], None, "paddle")]
    for a, b, th, s, tag in cand:
        cx, cy = seg_closest(px, py, a, b)
        dx, dy = px - cx, py - cy; d = np.hypot(dx, dy) + 1e-9
        m = d < R + th / 2
        if not m.any(): continue
        ii = idx[m]; nx, ny = dx[m] / d[m], dy[m] / d[m]
        if tag == "paddle":   # скорость поверхности лопасти
            ux = -PADDLE["w"] * (cy[m] - PADDLE["c"][1]); uy = PADDLE["w"] * (cx[m] - PADDLE["c"][0])
        else: ux = uy = 0.0
        pen = R + th / 2 - d[m]
        x[ii] += nx * pen; y[ii] += ny * pen
        rvx, rvy = vx[ii] - ux, vy[ii] - uy
        vn = rvx * nx + rvy * ny
        mk = vn < 0
        if not mk.any(): continue
        ii2 = ii[mk]; nx2, ny2, vn2 = nx[mk], ny[mk], vn[mk]
        jn = -(1 + E_STATIC) * vn2
        vx[ii2] += jn * nx2; vy[ii2] += jn * ny2
        tx, ty = -ny2, nx2
        vt = (vx[ii2] - (ux[mk] if np.ndim(ux) else ux)) * tx + (vy[ii2] - (uy[mk] if np.ndim(uy) else uy)) * ty + om[ii2] * R
        jt = np.clip(-vt / 3.0, -MU * np.abs(jn), MU * np.abs(jn))
        vx[ii2] += jt * tx; vy[ii2] += jt * ty; om[ii2] += jt * R / (0.5 * R * R) * 0.5
        strong = np.abs(vn2) > 2.2
        for k in np.where(strong)[0]:
            hits.append((t, float(x[ii2[k]]), float(y[ii2[k]]), float(abs(vn2[k])), 0 if tag == "paddle" else (s["tier"] if s and s["kind"] in ("ramp", "floor") else -1)))
        if s is not None and s["kind"] in ("ramp", "floor"):
            for k in ii2:
                if stier[k] < s["tier"]: split_to(int(k), t, s["tier"])
    # ── триггеры деления: шарик достиг уровня ступени (в давке — с запасом на два слоя)
    idx = np.where(alive)[0]
    if len(idx):
        thr = 0.5 if N < 40 else 1.9
        for rp in RAMPS:
            (ax_, ay_), (bx_, by_) = rp["a"], rp["b"]
            lo, hi = min(ax_, bx_) - .1, max(ax_, bx_) + .1
            xs_, ys_ = x[idx], y[idx]
            yr = ay_ + (xs_ - ax_) * (by_ - ay_) / (bx_ - ax_)
            m = (stier[idx] < rp["tier"]) & (xs_ > lo) & (xs_ < hi) & (ys_ < yr + R + thr) & (ys_ > yr - 3) & (vy[idx] < 0.5)
            for k in idx[m]:
                if stier[k] < rp["tier"]: split_to(int(k), t, rp["tier"])
        m = (stier[idx] < 9) & (y[idx] < -52.0)
        for k in idx[m]:
            if stier[k] < 9: split_to(int(k), t, 9)
    # ── бамперы-шары
    idx = np.where(alive)[0]; px, py = x[idx], y[idx]
    for bmp in BUMPERS:
        dx, dy = px - bmp["c"][0], py - bmp["c"][1]; d = np.hypot(dx, dy) + 1e-9; m = d < R + bmp["r"]
        if not m.any(): continue
        ii = idx[m]; nx, ny = dx[m] / d[m], dy[m] / d[m]; pen = R + bmp["r"] - d[m]
        x[ii] += nx * pen; y[ii] += ny * pen
        vn = vx[ii] * nx + vy[ii] * ny; mk = vn < 0
        vx[ii[mk]] -= 1.9 * vn[mk] * nx[mk]; vy[ii[mk]] -= 1.9 * vn[mk] * ny[mk]
        for k in np.where(mk & (np.abs(vn) > 2.5))[0]: hits.append((t, float(x[ii[k]]), float(y[ii[k]]), float(abs(vn[k])), -2))
    # ── шар-шар
    idx = np.where(alive)[0]
    if len(idx) > 1:
        pts = np.stack([x[idx], y[idx]], 1)
        pr = cKDTree(pts).query_pairs(2 * R, output_type="ndarray")
        if len(pr):
            a, b = idx[pr[:, 0]], idx[pr[:, 1]]
            dx, dy = x[b] - x[a], y[b] - y[a]; d = np.hypot(dx, dy) + 1e-9; nx, ny = dx / d, dy / d
            pen = 2 * R - d
            cx = np.zeros(NMAX); cy = np.zeros(NMAX)
            np.add.at(cx, a, -nx * pen * .5); np.add.at(cy, a, -ny * pen * .5); np.add.at(cx, b, nx * pen * .5); np.add.at(cy, b, ny * pen * .5)
            x[:] += cx * .8; y[:] += cy * .8
            rvx, rvy = vx[b] - vx[a], vy[b] - vy[a]; vn = rvx * nx + rvy * ny; mk = vn < 0
            if mk.any():
                jn = -(1 + E_BALL) * vn[mk] * .5
                dvx = np.zeros(NMAX); dvy = np.zeros(NMAX); dom = np.zeros(NMAX)
                aa, bb, nxx, nyy = a[mk], b[mk], nx[mk], ny[mk]
                np.add.at(dvx, aa, -jn * nxx); np.add.at(dvy, aa, -jn * nyy); np.add.at(dvx, bb, jn * nxx); np.add.at(dvy, bb, jn * nyy)
                tx, ty = -nyy, nxx
                vt = (rvx[mk] * tx + rvy[mk] * ty) + (om[aa] + om[bb]) * R
                jt = np.clip(-vt / 6.0, -MU * jn, MU * jn)
                np.add.at(dvx, aa, -jt * tx); np.add.at(dvy, aa, -jt * ty); np.add.at(dvx, bb, jt * tx); np.add.at(dvy, bb, jt * ty)
                np.add.at(dom, aa, jt * R / (0.5 * R * R) * .35); np.add.at(dom, bb, jt * R / (0.5 * R * R) * .35)
                vx[:] += dvx; vy[:] += dvy; om[:] += dom
                step.pair += float(np.sum(-vn[mk][-vn[mk] > 3.0]))
    # ── стенки по X (запас) и вылет за мир
    gone = alive & (y < -80)
    alive[gone] = False
    return 0.0
step.pair = 0.0

def frontier():
    idx = np.where(alive)[0]
    if len(idx) == 0: return -60.0
    ys = np.sort(y[idx]); k = max(1, int(len(ys) * .12)); return float(ys[:k].mean())

# ───────── прогон ─────────
cam_cy, cam_wv = 0.5, 11.5
t = 0.0; t_end = None; rec_acc = 0.0; steps = 0
floor_t = None; flip_t0 = None; trap_t = None
cy_f, wv_f, cx_f = 2.4 + .17 * (5.4 / 0.5625), 5.4, -2.0
while True:
    step(t); t += SUB; steps += 1; rec_acc += SUB
    # сценарий второй половины
    if floor_t is None and (N >= NMAX - 8 or (events and any(e[3] == 9 for e in events) and t > min(e[0] for e in events if e[3] == 9) + 3.2)):
        floor_t = t
    if floor_t is not None:
        if flip_t0 is None and t > floor_t:
            for k_ in np.where(alive & (stier < 9))[0]:   # недоделённые удвоения завершаются взрывом деления
                if stier[k_] < 9: split_to(int(k_), t, 9)
            flip_t0 = t; gscale.fn = lambda tt, f=flip_t0: (-0.35 if tt < f + 1.0 else (1.6 if tt < f + 1.5 else 1.0))
        if flip_t0 is not None and trap_t is None and t > flip_t0 + 2.6:
            trap_t = t; floor_open = True
        if trap_t is not None and (alive.sum() == 0 or t > trap_t + 2.9):
            t_end = t; break
    if t > 45: t_end = t; break
    if rec_acc >= REC - 1e-9:
        rec_acc -= REC
        # камера
        fr = frontier(); ia = np.where(alive)[0]
        lowx = float(np.mean(x[ia][np.argsort(y[ia])[:max(1, int(len(ia) * .12))]])) if len(ia) else 0.0
        if trap_t is not None: tgt_cy, tgt_wv, tgt_cx = float(np.mean(y[ia])) + 3.0 if len(ia) else -80.0, 24.0, 0.0
        elif fr < -45: tgt_cy, tgt_wv, tgt_cx = -57.0, 22.0, 0.0
        else:
            u_ = min(1.0, math.log2(max(N, 1)) / 4.0); wv_t = 5.4 + 6.1 * u_ * u_ * (3 - 2 * u_)
            tgt_wv = wv_t; tgt_cy = fr + .17 * (wv_t / 0.5625); tgt_cx = float(np.clip(lowx, -max(0.0, 5.3 - wv_t / 2), max(0.0, 5.3 - wv_t / 2)))
        k = 1 - math.exp(-REC / .30); cy_f += (tgt_cy - cy_f) * k; wv_f += (tgt_wv - wv_f) * (1 - math.exp(-REC / .9)); cx_f += (tgt_cx - cx_f) * (1 - math.exp(-REC / .45))
        s = np.stack([x, y, ang, gen.astype(float), np.where(alive, tsplit, -9.0)], 1).astype(np.float32); snaps.append(s)
        cams.append((cy_f, wv_f, cx_f)); counts.append(N); pair_energy.append(step.pair); step.pair = 0.0
        if len(snaps) % 480 == 0: print(f"  t={t:5.1f} c  шариков {N}")
print(f"физика готова: {t_end:.2f} c, шариков {N}, ударов {len(hits)}")

S = np.array(snaps); T = np.arange(len(S)) * REC
tiers_t = {}
for ev in events: tiers_t.setdefault(ev[3], ev[0])
print("времена первых делений по ступеням:", {k: round(v, 2) for k, v in sorted(tiers_t.items())})

# ───────── соответствие времени показа и физики (замедления) ─────────
t1 = tiers_t[1]
slow = [(t1 - .13, t1 + .5, .22), (tiers_t[5] - .1, tiers_t[6] + 1.3, .5)]
if flip_t0: slow.append((flip_t0 - .2, flip_t0 + 1.4, .5))
if trap_t: slow.append((trap_t - .2, trap_t + .9, .55))
grid = np.arange(0, t_end + 0.5, .001); sp = np.ones_like(grid)
for a, b, f_ in slow: sp[(grid >= a) & (grid < b)] = f_
# плавные края
k = np.ones(300) / 300; sp = np.convolve(np.pad(sp, 150, mode="edge"), k, mode="same")[150:-150]
disp = np.concatenate([[0], np.cumsum(.001 / sp)[:-1]])
disp_total = float(disp[-1]); tail = 2.2
F = int(math.ceil((min(disp_total, disp[int(t_end * 1000)]) + tail) * FPS))
sim_of = lambda d: float(np.interp(d, disp, grid))
disp_of = lambda s_: float(np.interp(s_, grid, disp))
print(f"длительность показа: {F / FPS:.2f} c ({F} кадров)")

# ───────── кадры ─────────
SPARK = 900
rng = np.random.default_rng(5)
sp_ev = []
for (te, ex, ey, tr, n_) in events:
    m = 7 if n_ <= 64 else (4 if n_ <= 200 else 2)
    for _ in range(m):
        a_ = rng.uniform(0, 2 * math.pi); v_ = rng.uniform(2.5, 6.5)
        sp_ev.append((te, ex, ey, math.cos(a_) * v_, math.sin(a_) * v_ + 1.5, tr))
sp_ev = np.array(sp_ev)
HDR = 10; per = HDR + NMAX * 5 + SPARK * 3
buf = np.zeros((F, per), np.float32)
ev_t = np.array([e[0] for e in events]); last_change = []
roll_amp = math.radians(1.3)
for f in range(F):
    d = f / FPS; s_ = min(sim_of(d), t_end - 1e-3)
    i0 = min(int(s_ / REC), len(S) - 2); u = s_ / REC - i0
    a, b = S[i0], S[i0 + 1]
    st = a * (1 - u) + b * u
    st[:, 3] = np.where(u < .5, a[:, 3], b[:, 3]); st[:, 4] = np.where(u < .5, a[:, 4], b[:, 4])
    cy_, wv_, cx_ = [cams[i0][j] * (1 - u) + cams[i0 + 1][j] * u for j in range(3)]
    reached = [k_ for k_, v_ in tiers_t.items() if v_ <= s_]
    cnt = 2 ** max(reached) if reached else 1; cnt = min(cnt, 512)
    changes = [tiers_t[k_] for k_ in reached]
    since = (disp_of(s_) - disp_of(max(changes))) if changes else 99.0
    flash = np.exp(-np.maximum(s_ - st[:, 4], 0) / .22) * (st[:, 4] > -1)
    base = HDR
    buf[f, 0:HDR] = [cy_, wv_, roll_amp * math.sin(d * .55) + .006 * math.sin(d * 1.3), cnt, d, since, float(1 if (trap_t and s_ > trap_t) else 0), float(s_), cx_, 0.0]
    blk = np.stack([st[:, 0], st[:, 1], st[:, 2], st[:, 3], flash], 1)
    blk[st[:, 0] > 1e8] = [1e9, 1e9, 0, 0, 0]
    buf[f, base:base + NMAX * 5] = blk.reshape(-1)
    tau = s_ - sp_ev[:, 0]; ok = (tau >= 0) & (tau < .7)
    q = sp_ev[ok]; tt = tau[ok]
    sx = q[:, 1] + q[:, 3] * tt; sy = q[:, 2] + q[:, 4] * tt + .5 * G * .6 * tt * tt; al = 1 - tt / .7
    n_s = min(len(sx), SPARK); o = base + NMAX * 5
    buf[f, o:o + n_s * 3] = np.stack([sx[:n_s], sy[:n_s], al[:n_s]], 1).reshape(-1)
    if f % 200 == 0: print(f"  кадр {f}/{F}")
buf.tofile(OUT / "frames.bin")

# события для звука (в секундах показа)
audio = dict(
    splits=[dict(t=disp_of(e[0]), tier=e[3], n=e[4], x=e[1]) for e in events],
    hits=[dict(t=disp_of(h[0]), v=h[3], tier=h[4], x=h[1]) for h in hits[:: max(1, len(hits) // 4000)]],
    pairs=[dict(t=disp_of(T[i]), e=pair_energy[i]) for i in range(0, len(T), 4) if pair_energy[i] > 0],
    flip=disp_of(flip_t0) if flip_t0 else None, trap=disp_of(trap_t) if trap_t else None, duration=F / FPS)
banner_t = disp_of(tiers_t[5]) + .25
meta = dict(frames=F, fps=FPS, nmax=NMAX, spark=SPARK, hdr=HDR, per=per, duration=F / FPS, banner_start=round(banner_t, 2),
            tiers={str(k): round(disp_of(v), 2) for k, v in tiers_t.items()}, final=N,
            segs=[dict(a=s["a"], b=s["b"], th=s["th"], kind=s["kind"], tier=s.get("tier", 0)) for s in STATIC],
            bumpers=BUMPERS, paddle=PADDLE, trap=audio["trap"], flip=audio["flip"])
(OUT / "meta.json").write_text(json.dumps(meta)); (OUT / "audio.json").write_text(json.dumps(audio))
print(f"✔ frames.bin {buf.nbytes / 1e6:.1f} МБ; баннер рекомендуется с {banner_t:.2f} c")
