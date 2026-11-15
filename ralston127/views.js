// «127 часов» — картинки сцен.
const ARON = { shirt: '#e4d2b5', hair: '#5a3a1e', hairD: '#3c2512', backpack: false };

function canyon(t, o = {}) {
  const p = Object.assign({ sky1: '#4fb8ff', sky2: '#d4f2ff', w1: '#df7d3b', w2: '#b9592a', floor: '#d9a066', tint: null, rays: true, stars: 0 }, o);
  const id = ++uid;
  let s = `<linearGradient id="cs${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.sky1}"/><stop offset="1" stop-color="${p.sky2}"/></linearGradient>`;
  s += `<rect x="-700" y="-700" width="2480" height="3300" fill="url(#cs${id})"/>`;
  if (p.stars) s += stars(p.stars, 250, -200, 600, 900, t, 21);
  if (p.rays) s += `<path d="M420,-200 L560,-200 L760,1500 L300,1500 Z M600,-200 L660,-200 L940,1500 L760,1500 Z" fill="url(#rayG)" opacity=".7"/>`;
  s += `<rect x="-700" y="1330" width="2480" height="1400" fill="${p.floor}"/>`;
  const r = rng(9); for (let k = 0; k < 26; k++) s += `<ellipse cx="${f(250 + r() * 600)}" cy="${f(1350 + r() * 560)}" rx="${f(8 + r() * 22)}" ry="${f(5 + r() * 10)}" fill="#a8743f" opacity=".7"/>`;
  const L = y => 300 + 70 * Math.sin(y / 170 + 1) + 35 * Math.sin(y / 61), R = y => 780 + 60 * Math.sin(y / 150 + 2) + 30 * Math.sin(y / 73);
  let el = '', er = '';
  for (let y = -700; y <= 2700; y += 40) { el += `${y === -700 ? 'M' : 'L'}${f(L(y))},${y}`; er += `${y === -700 ? 'M' : 'L'}${f(R(y))},${y}`; }
  const wl = `M-700,-700 ${el.replace('M', 'L')} L-700,2700Z`, wr = `M1780,-700 ${er.replace('M', 'L')} L1780,2700Z`;
  s += `<clipPath id="cw${id}"><path d="${wl}"/><path d="${wr}"/></clipPath>`;
  s += `<path d="${wl}" fill="${p.w1}"/><path d="${wr}" fill="${p.w1}"/>`;
  let bands = ''; for (let y = -700; y < 2700; y += 92) bands += `M-700,${y} Q0,${y - 40} 540,${y + 10} T1780,${y - 30} L1780,${y + 38} Q1000,${y + 70} 540,${y + 48} T-700,${y + 40}Z`;
  s += `<g clip-path="url(#cw${id})"><path d="${bands}" fill="${p.w2}" opacity=".55"/></g>`;
  s += `<path d="${el}" fill="none" stroke="#000" stroke-width="44" opacity=".16"/><path d="${er}" fill="none" stroke="#000" stroke-width="44" opacity=".16"/>`;
  s += `<path d="${el}" fill="none" stroke="${OL}" stroke-width="8"/><path d="${er}" fill="none" stroke="${OL}" stroke-width="8"/>`;
  if (p.tint) s += `<rect x="-700" y="-700" width="2480" height="3300" fill="${p.tint[0]}" opacity="${f(p.tint[1])}"/>`;
  return s;
}
function boulder(x, y, s, rot = 0, dark = 0) {
  return `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)}) scale(${s})"><path d="${blob(5, 200, 11, .14)}" fill="${mix('#8f7e70', '#2d2a40', dark)}" stroke="${OL}" stroke-width="10"/><path d="${blob(6, 150, 9, .2)}" transform="translate(40,50)" fill="#5d4f45" opacity=".5"/><path d="${blob(7, 80, 8, .2)}" transform="translate(-70,-80)" fill="#c7b6a6" opacity="${f(.7 * (1 - dark))}"/><path d="M-60,-20 l40,30 l-10,40 M80,-90 l-20,50 l30,30" fill="none" stroke="${OL}" stroke-width="6" stroke-linecap="round" opacity=".6"/></g>`;
}
function knife(x, y, rot, s = 1) {
  return `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)}) scale(${s})"><path d="M-16,0 L-16,-210 Q0,-250 18,-210 L18,0 Z" fill="#d9e0e8" stroke="${OL}" stroke-width="7"/><path d="M-4,-30 L-4,-190" stroke="#fff" stroke-width="6" opacity=".8"/><rect x="-30" y="-6" width="60" height="170" rx="18" fill="#d42a2a" stroke="${OL}" stroke-width="7"/><circle cx="0" cy="40" r="9" fill="#fff"/></g>`;
}
const glint = (x, y, k) => k <= 0 ? '' : at(x, y, k, `<path d="M0,-70 L12,-12 L70,0 L12,12 L0,70 L-12,12 L-70,0 L-12,-12Z" fill="#fff"/>`, 0);

VIEWS.hook = {
  shakes: () => [[0, 20, .4]],
  draw(lv, vd, t, ctx) {
    let s = canyon(t, { tint: ['#ff1a1a', .2 + .08 * Math.sin(t * 6)], rays: false });
    const tr = Math.sin(t * 60) * 2;
    s += guy({ ...ARON, x: 420 + tr, y: 690, s: .95, pose: 'reach', item: 'knife', tired: .9, red: .7, pupil: 'tiny', brow: 'worried', mouth: 'grit', sweat: 3, messy: .8, dirt: .8, look: [10, -6], t });
    s += boulder(955, 925, 1.15, 10);
    s += particles(20, 4, t, { x0: 600, x1: 1100, y0: 600, y1: 1500, speed: 90, size: 4, col: '#e9c39a', op: .7 });
    const s1 = ctx.segRel[1] ?? 9;
    if (lv > s1) s += glint(214, 1112, eBack((lv - s1) / .25) * (.8 + .2 * Math.sin(t * 30)));
    return s + `<rect x="-700" y="-700" width="2480" height="3300" fill="url(#vigDark)"/>`;
  }
};
VIEWS.walk = {
  draw(lv, vd, t, ctx) {
    let s = canyon(t);
    const bob = Math.abs(Math.sin(lv * 7)) * 14;
    s += guy({ ...ARON, backpack: true, x: 540, y: 770 - bob, s: .76, mouth: 'smile', brow: 'neutral', t, headRot: Math.sin(lv * 3.5) * 3 });
    const k = pop(lv, .1);
    s += at(250, 430, k, `<path d="M0,40 C-60,-20 -50,-110 0,-110 C50,-110 60,-20 0,40Z" fill="#ff3b3b" stroke="${OL}" stroke-width="8"/><circle cx="0" cy="-62" r="20" fill="#fff" stroke="${OL}" stroke-width="5"/>` + `<g transform="translate(0,90)">${pill('ЮТА, США', '#111427', '#fff', 40, 70)}</g>`);
    const s1 = ctx.segRel[1] ?? 9, k2 = pop(lv, s1 + .3);
    s += at(840, 470, k2, `<rect x="-62" y="-110" width="124" height="220" rx="22" fill="#2b2f45" stroke="${OL}" stroke-width="8"/><rect x="-48" y="-90" width="96" height="160" rx="8" fill="#8fd3ff"/>${txt(0, -10, '?', 80, '#fff', { stroke: OL, sw: 10 })}<circle cx="60" cy="-100" r="40" fill="#ff3b3b" stroke="${OL}" stroke-width="6"/><path d="M42,-118 L78,-82 M78,-118 L42,-82" stroke="#fff" stroke-width="10" stroke-linecap="round"/>`, 8 * Math.sin(t * 3));
    return s;
  }
};
VIEWS.fall = {
  draw(lv, vd, t) {
    let s = canyon(t, { tint: ['#000', .1] });
    const q = lv / vd, drop = eIn((lv - (vd - .45)) / .45);
    s += particles(14, 8, t, { x0: 560, x1: 760, y0: 380, y1: 1400, speed: 520, size: 7, col: '#8f7e70', op: .9 });
    const shock = clamp(q * 1.5);
    s += guy({ ...ARON, backpack: true, x: 540, y: 1000, s: .55, look: [0, -16], brow: shock > .5 ? 'raised' : 'neutral', mouth: shock > .4 ? 'open' : 'flat', mouthOpen: .4 + .6 * shock, pupil: shock > .6 ? 'tiny' : 'normal', lid: 0, sweat: shock > .7 ? 2 : 0, t });
    const by = lerp(330, 980, drop), bs = lerp(.75, 1.5, drop), rot = Math.sin(t * 22) * (2 + 7 * q) + drop * 40;
    s += boulder(650, by, bs, rot);
    if (drop > 0) s += `<path d="M560,${f(by - 260)} l-30,-200 M650,${f(by - 280)} l0,-240 M740,${f(by - 260)} l30,-200" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".7"/>`;
    return s;
  }
};
VIEWS.pinned = {
  shakes: () => [[0, 28, .5]],
  draw(lv, vd, t) {
    let s = canyon(t, { tint: ['#ff5a1a', .16], rays: false });
    s += guy({ ...ARON, x: 350, y: 760, s: 1.2, pose: 'reach', mouth: 'scream', mouthOpen: .8 + .2 * Math.sin(t * 9), eyes: 'squeeze', brow: 'worried', sweat: 3, messy: .7, tears: lv > 1 ? 1 : 0, t });
    s += boulder(1000, 1000, 1.3, 14);
    for (let i = 0; i < 6; i++) { const q = clamp(lv / .8), a = i * 1.05; s += `<circle cx="${f(860 + Math.cos(a) * 260 * q)}" cy="${f(1000 + Math.sin(a) * 200 * q)}" r="${f(90 * (1 - q * .4))}" fill="#e9d2b8" opacity="${f(.65 * (1 - q))}"/>`; }
    s += sparks(860, 960, t, 170, 6, '#fff3a0');
    s += comic(700, 470, 'БАХ!', eBack(lv / .25) * (lv < 1.3 ? 1 : 0), '#ffe14a', 100);
    return s;
  }
};
VIEWS.inventory = {
  draw(lv, vd, t) {
    let s = sunburst('#ff9a2f', '#e2600a', t * .12);
    const lvl = .12 + .02 * Math.sin(t * 5);
    const bottle = `<path d="M-30,-190 L30,-190 L30,-150 Q80,-120 80,-70 L80,170 Q80,200 50,200 L-50,200 Q-80,200 -80,170 L-80,-70 Q-80,-120 -30,-150Z" fill="#d8f3ff" fill-opacity=".55" stroke="${OL}" stroke-width="8"/><path d="M-76,${f(200 - 390 * lvl)} Q0,${f(190 - 390 * lvl + 10 * Math.sin(t * 6))} 76,${f(200 - 390 * lvl)} L76,170 Q76,196 50,196 L-50,196 Q-76,196 -76,170Z" fill="#2f9bff"/><rect x="-38" y="-226" width="76" height="44" rx="10" fill="#2f61b8" stroke="${OL}" stroke-width="7"/><path d="M-50,-60 L-50,120" stroke="#fff" stroke-width="12" stroke-linecap="round" opacity=".6"/>`;
    const burr = `<g transform="rotate(-18)"><rect x="-130" y="-48" width="260" height="96" rx="48" fill="#eac47c" stroke="${OL}" stroke-width="8"/><path d="M40,-48 L130,-48 Q178,0 130,48 L40,48Z" fill="#cfd6df" stroke="${OL}" stroke-width="8"/><path d="M-70,-40 q20,40 0,80 M-20,-44 q20,44 0,88" fill="none" stroke="#b98f45" stroke-width="6"/></g>`;
    s += at(240, 760, pop(lv, .05), bottle) + at(240, 1050, pop(lv, .1), pill('ГЛОТОК', '#2f61b8', '#fff', 40, 70));
    s += at(540, 740, pop(lv, .25), `<g transform="translate(0,-60)">${burr}</g><g transform="translate(0,70)">${burr}</g>`) + at(540, 1050, pop(lv, .3), pill('×2', '#111427', '#fff', 44, 70));
    s += at(840, 760, pop(lv, .45), knife(0, 60, -30, 1)) + at(840, 1050, pop(lv, .5), pill('НОЖ', '#d42a2a', '#fff', 40, 70));
    return s;
  }
};
VIEWS.chip = {
  draw(lv, vd, t) {
    let s = BG('#8a796b');
    const r = rng(3); for (let k = 0; k < 40; k++) s += `<path d="${blob(k + 30, 40 + r() * 120, 8, .3)}" transform="translate(${f(r() * 1200 - 60)},${f(r() * 2000 - 40)})" fill="${r() < .5 ? '#6f5f53' : '#a8968a'}" opacity="${f(.35 + r() * .4)}"/>`;
    s += `<path d="M100,300 l120,140 l-40,160 l90,200 M900,500 l-80,180 l60,220 M300,1300 l200,-80 l120,60" fill="none" stroke="${OL}" stroke-width="8" stroke-linecap="round" opacity=".5"/>`;
    const period = .38, k = (lv - .12) / period, ph = k - Math.floor(k), hit = lv > .12 ? Math.exp(-ph * 9) : 0;
    const cx = 560, cy = 780, d = 60 + 140 * (1 - Math.min(1, ph * 3));
    s += knife(cx + 200 + d * .5, cy + 260 + d * .7, -34, 1.5);
    if (hit > .3) s += sparks(cx, cy, t, 60, 7, '#fff3a0');
    const n = lv > .12 ? Math.floor(k) + 1 : 0;
    for (let i = 0; i < Math.min(n, 4); i++) s += txt(260 + (i % 2) * 520, 460 + i * 120, 'ТУК', 80, '#fff', { stroke: OL, sw: 14, op: f(clamp(1.2 - (lv - .12 - i * period) * 1.5)) });
    s += `<path d="M${cx - 20},${cy + 10} l18,-8 l14,10" fill="none" stroke="#fff" stroke-width="5" opacity="${f(clamp(n / 4))}"/>`;
    return s + `<rect x="-700" y="-700" width="2480" height="3300" fill="url(#vigDark)"/>`;
  }
};
VIEWS.empty = {
  draw(lv, vd, t) {
    let s = sunburst('#c4231c', '#8a0f0f', t * .1);
    const shake = Math.sin(t * 40) * 6;
    const bottle = `<path d="M-30,-190 L30,-190 L30,-150 Q80,-120 80,-70 L80,170 Q80,200 50,200 L-50,200 Q-80,200 -80,170 L-80,-70 Q-80,-120 -30,-150Z" fill="#d8f3ff" fill-opacity=".35" stroke="${OL}" stroke-width="8"/><rect x="-38" y="-226" width="76" height="44" rx="10" fill="#2f61b8" stroke="${OL}" stroke-width="7"/>`;
    s += at(540 + shake, 640, 1.5, bottle, 180 + shake);
    const dy = ((lv * 1.4) % 1);
    s += `<path transform="translate(540,${f(1000 + dy * 300)}) scale(1.6)" d="M0,-24 C13,-6 17,5 17,13 A17,17 0 0 1 -17,13 C-17,5 -13,-6 0,-24 Z" fill="#7fd3ff" stroke="${OL}" stroke-width="5" opacity="${f(1 - dy)}"/>`;
    s += at(830, 420, pop(lv, .4), pill('0%', '#111427', '#ff4a4a', 70, 110));
    return s;
  }
};
VIEWS.carve = {
  draw(lv, vd, t, ctx) {
    let s = BG('#c9733a');
    s += `<rect x="-700" y="-700" width="2480" height="3300" fill="#e08a4a" opacity=".5"/>`;
    let bands = ''; for (let y = -700; y < 2700; y += 110) bands += `M-700,${y} Q300,${y - 30} 540,${y + 12} T1780,${y - 20} L1780,${y + 44} Q1000,${y + 70} 540,${y + 54} T-700,${y + 46}Z`;
    s += `<path d="${bands}" fill="#a9572a" opacity=".45"/>`;
    const r = rng(12); for (let k = 0; k < 60; k++) s += `<circle cx="${f(r() * 1080)}" cy="${f(r() * 1920)}" r="${f(2 + r() * 5)}" fill="#7a3d1c" opacity=".5"/>`;
    const L = [['АРОН', 150, 470], ['ОКТ 1975', 120, 640], ['АПР 2003', 120, 790], ['R.I.P.', 150, 950]];
    const a1 = ctx.segRel[0] ?? 0, b1 = ctx.segEndRel[0] ?? 1, a2 = ctx.segRel[1] ?? 2, b2 = ctx.segEndRel[1] ?? 3;
    const prog = [clamp((lv - a1) / ((b1 - a1) * .55)), clamp((lv - a1 - (b1 - a1) * .45) / ((b1 - a1) * .55)), clamp((lv - a2) / ((b2 - a2) * .55)), clamp((lv - a2 - (b2 - a2) * .45) / ((b2 - a2) * .55))];
    let tip = null;
    L.forEach(([str, size, y], i) => {
      const n = Math.round(str.length * prog[i]); if (n <= 0) return;
      const sub = str.slice(0, n), w = str.length * size * .66, x0 = 540 - w / 2;
      const red = i >= 2;
      if (red) s += `<g filter="url(#blur10)" opacity="${f(.55 + .3 * Math.sin(t * 5))}">${txt(x0, y, sub, size, '#ff2a2a', { anchor: 'start', ls: 4 })}</g>`;
      s += txt(x0, y + 6, sub, size, '#f6c08c', { anchor: 'start', ls: 4, op: .8 }) + txt(x0, y, sub, size, red ? '#5a0a0a' : '#4a200c', { anchor: 'start', ls: 4 });
      if (prog[i] < 1) tip = [x0 + n * size * .66, y];
    });
    if (tip) s += knife(tip[0] + 10 + Math.sin(t * 40) * 6, tip[1] + 20, 35, .9) + particles(8, Math.floor(t * 3), t, { x0: tip[0] - 20, x1: tip[0] + 20, y0: tip[1], y1: tip[1] + 300, speed: 300, size: 4, col: '#f2c79a', op: .9, drift: 6 });
    return s + `<rect x="-700" y="-700" width="2480" height="3300" fill="url(#vigDark)"/>`;
  }
};
VIEWS.vision = {
  draw(lv, vd, t, ctx) {
    let s = canyon(t, { sky1: '#050a2a', sky2: '#1c2466', w1: '#3a2a5e', w2: '#291d47', floor: '#2a2342', rays: false, stars: 40 });
    s += `<circle cx="540" cy="80" r="300" fill="url(#whiteGlow)" opacity=".25"/>`;
    s += guy({ ...ARON, x: 330, y: 900, s: .72, pose: 'reach', lid: .62, tired: 1, red: .7, brow: 'tired', mouth: 'flat', dirt: 1, messy: .8, look: [14, -4], t, headRot: -6 });
    s += boulder(720, 1060, .8, 8, .55);
    const k = clamp((lv - .2) / .8) * (.75 + .25 * Math.sin(t * 13) * Math.sin(t * 5));
    const s1 = ctx.segRel[1] ?? 9, warm = clamp((lv - s1) / .5);
    s += `<g opacity="${f(k)}"><circle cx="840" cy="740" r="${f(260 + 20 * Math.sin(t * 3))}" fill="url(#ghostGlow)"/>`;
    s += `<g transform="translate(840,${f(720 + Math.sin(t * 2) * 10)})"><path d="M-70,40 Q-80,-20 0,-20 Q80,-20 70,40 L90,220 L-90,220Z" fill="#eafcff" stroke="#bdefff" stroke-width="6"/><circle cx="0" cy="-90" r="64" fill="#eafcff" stroke="#bdefff" stroke-width="6"/><circle cx="-22" cy="-92" r="7" fill="#4a7a99"/><circle cx="22" cy="-92" r="7" fill="#4a7a99"/><path d="M-20,-60 Q0,${f(-44 + 8 * warm)} 20,-60" fill="none" stroke="#4a7a99" stroke-width="5" stroke-linecap="round"/><path d="M70,40 Q130,${f(-10 - 30 * Math.sin(t * 4))} 150,${f(-60 - 40 * Math.sin(t * 4))}" fill="none" stroke="#eafcff" stroke-width="30" stroke-linecap="round"/></g></g>`;
    s += particles(24, 31, t, { x0: 640, x1: 1040, y0: 400, y1: 1100, speed: 70, size: 4, col: '#d9f6ff', op: f(.8 * k), up: true });
    return s;
  }
};
VIEWS.cut = {
  shakes: ctx => { const c = (ctx.segEndRel[0] ?? 2) + .05; return [[c, 26, .4], [c + .25, 18, .3]]; },
  flash: (lv, ctx) => { const c = (ctx.segEndRel[0] ?? 2) + .05; return lv > c && lv < c + .15 ? .85 * (1 - (lv - c) / .15) : lv > c + .25 && lv < c + .35 ? .5 * (1 - (lv - c - .25) / .1) : 0; },
  draw(lv, vd, t, ctx) {
    const beat = Math.pow(Math.max(0, Math.sin(t * Math.PI * 2 / .8)), 10);
    let s = BG('#2a0606') + `<circle cx="540" cy="820" r="${f(700 + 60 * beat)}" fill="url(#redGlow)" opacity="${f(.45 + .4 * beat)}"/>`;
    const c = (ctx.segEndRel[0] ?? 2) + .05, broke = lv > c;
    s += guy({ ...ARON, x: 540, y: 820, s: 2.0 * (1 + .015 * beat), mouth: 'grit', eyes: broke ? 'squeeze' : 'open', pupil: 'tiny', lid: .1, red: 1, tired: 1, brow: 'worried', sweat: 3, tears: broke ? 1 : 0, messy: .8, dirt: 1, legs: false, t });
    if (broke) s += `<g opacity="${f(clamp(1.6 - (lv - c)))}">${crack(4, 380, 900, 1100)}${lv > c + .25 ? crack(9, 720, 700, 900) : ''}</g>`;
    const s1 = ctx.segRel[1] ?? 9;
    if (lv > s1) {
      const k = pop(lv, s1), a = clamp((lv - s1) / Math.max(.5, vd - s1 - .2)) * 360;
      s += at(870, 450, k, `<circle r="110" fill="#fff" stroke="${OL}" stroke-width="10"/><path d="M0,0 L0,-80 A80,80 0 ${a > 180 ? 1 : 0} 1 ${f(80 * Math.sin(a * Math.PI / 180))},${f(-80 * Math.cos(a * Math.PI / 180))} Z" fill="#ff3b3b" opacity=".85"/><path d="M0,0 L${f(80 * Math.sin(a * Math.PI / 180))},${f(-80 * Math.cos(a * Math.PI / 180))}" stroke="${OL}" stroke-width="10" stroke-linecap="round"/><rect x="-20" y="-150" width="40" height="34" rx="8" fill="${OL}"/>${txt(0, 150, '1 ЧАС', 48, '#fff', { stroke: OL, sw: 10 })}`);
    }
    return s + `<rect x="-700" y="-700" width="2480" height="3300" fill="url(#vigDark)"/>`;
  }
};
VIEWS.rappel = {
  draw(lv, vd, t) {
    let s = `<linearGradient id="rs${++uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#58b6ff"/><stop offset="1" stop-color="#ffe0a8"/></linearGradient>`;
    s += `<rect x="-700" y="-700" width="2480" height="3300" fill="url(#rs${uid})"/>`;
    s += `<path d="M560,1500 L640,1180 L760,1160 L820,1220 L900,1150 L1000,1170 L1200,1500Z" fill="#b65a2a" opacity=".6"/>`;
    let e = 'M-700,-700'; for (let y = -700; y <= 2600; y += 50) e += `L${f(460 + 30 * Math.sin(y / 90) + 20 * Math.sin(y / 37))},${y}`;
    s += `<path d="${e} L-700,2600Z" fill="#d0763a" stroke="${OL}" stroke-width="8"/>`;
    let bands = ''; for (let y = -700; y < 2600; y += 90) bands += `M-700,${y} L520,${y + 20} L520,${y + 50} L-700,${y + 30}Z`;
    s += `<path d="${bands}" fill="#a9532a" opacity=".5"/>`;
    const gy = lerp(360, 760, lv / vd), s0 = .62, gx = 640;
    const ropeX = gx - 30 * s0;
    s += `<path d="M${f(ropeX)},-300 L${f(ropeX)},2200" stroke="${OL}" stroke-width="16"/><path d="M${f(ropeX)},-300 L${f(ropeX)},2200" stroke="#f2e2b0" stroke-width="8" stroke-dasharray="16 10"/>`;
    s += guy({ ...ARON, x: gx, y: gy, s: s0, pose: 'rope', stump: true, tired: .8, brow: 'angry', mouth: 'grit', dirt: 1, messy: .8, sweat: 2, look: [0, 14], t });
    s += `<path d="M960,300 L960,1220" stroke="#fff" stroke-width="8"/>`; for (let k = 0; k <= 10; k++) s += `<path d="M940,${300 + k * 92} L980,${300 + k * 92}" stroke="#fff" stroke-width="6"/>`;
    s += at(960, 760, pop(lv, .2), pill('20 М', '#111427', '#ffe14a', 52, 86), -90);
    return s;
  }
};
VIEWS.heli = {
  draw(lv, vd, t) {
    let s = `<linearGradient id="hs${++uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3fa9ff"/><stop offset="1" stop-color="#ffe0a8"/></linearGradient>`;
    s += `<rect x="-700" y="-700" width="2480" height="3300" fill="url(#hs${uid})"/><circle cx="220" cy="420" r="260" fill="url(#sunGlow)"/>`;
    s += `<path d="M-700,1050 L-100,1050 L-60,900 L200,880 L240,1050 L600,1050 L640,960 L900,950 L940,1050 L1780,1050 L1780,2600 L-700,2600Z" fill="#b8562a"/><rect x="-700" y="1040" width="2480" height="1600" fill="#e2b072"/>`;
    const hx = lerp(1350, 690, eOut(lv / (vd * .7))), hy = 560 + Math.sin(t * 3) * 14;
    let h = `<path d="M-60,40 L-330,10 L-330,-20 L-60,-10Z" fill="#ff5a2a" stroke="${OL}" stroke-width="8"/><path d="M-320,-60 L-300,-60 L-290,40 L-330,40Z" fill="#ff5a2a" stroke="${OL}" stroke-width="7"/>`;
    h += `<ellipse cx="40" cy="20" rx="160" ry="100" fill="#ff5a2a" stroke="${OL}" stroke-width="9"/><path d="M80,-40 Q190,-30 190,40 L60,40Z" fill="#9fe0ff" stroke="${OL}" stroke-width="7"/>`;
    h += `<path d="M-60,130 L160,130 M-20,110 L-30,130 M120,110 L130,130" stroke="${OL}" stroke-width="12" stroke-linecap="round"/><rect x="30" y="-104" width="20" height="30" fill="${OL}"/>`;
    h += `<ellipse cx="40" cy="-104" rx="300" ry="22" fill="#fff" opacity=".35"/><path d="M${f(40 - 290 * Math.cos(t * 40))},-104 L${f(40 + 290 * Math.cos(t * 40))},-104" stroke="${OL}" stroke-width="10" stroke-linecap="round"/>`;
    s += `<g transform="translate(${f(hx)},${f(hy)}) rotate(${f(-4 + 2 * Math.sin(t * 2))})">${h}</g>`;
    s += particles(26, 44, t, { x0: hx - 250, x1: hx + 250, y0: 980, y1: 1100, speed: 40, size: 14, col: '#f2d6a8', op: .5, drift: 60 });
    s += guy({ ...ARON, x: 300, y: 1000, s: .5, pose: 'wave', stump: true, mouth: 'smile', tired: .6, dirt: 1, messy: .8, look: [12, -10], t, headRot: 4 });
    return s;
  }
};
VIEWS.cta = {
  draw(lv, vd, t, ctx) {
    let s = sunburst('#ff6a1f', '#d33a0a', t * .12);
    s += guy({ ...ARON, x: 540, y: 740, s: 1.3, stump: true, mouth: 'smile', tired: .4, brow: 'neutral', dirt: .5, messy: .6, legs: false, t });
    s += at(230, 450, pop(lv, .1), pill('127 Ч', '#111427', '#ffe14a', 64, 104), -6);
    const s1 = ctx.segRel[1] ?? 9;
    [[860, 430, 0], [930, 640, .15]].forEach(([x, y, d], i) => { s += at(x, y + Math.sin(t * 4 + i) * 12, pop(lv, s1 + d), txt(0, 0, '?', 130, '#fff', { stroke: OL, sw: 16 }), 12 * Math.sin(t * 3 + i)); });
    return s;
  }
};
