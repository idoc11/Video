'use strict';
// Общий движок роликов: утилиты, персонаж, HUD, подписи, переходы, камера, баннер.
// Картинки конкретного ролика — в <ролик>/views.js (заполняют объект VIEWS).

// ───────────────────────── утилиты ─────────────────────────
const W = 1080, H = 1920, OL = '#1d1530', FPS = 30;
let TL = null, uid = 0;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const eOut = t => 1 - Math.pow(1 - clamp(t), 3);
const eIn = t => Math.pow(clamp(t), 3);
const eBack = t => { t = clamp(t); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const eInOut = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const f = n => Math.round(n * 10) / 10;
const sc100 = k => f(k * 100) / 100;
function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function mix(a, b, t) {
  const pa = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16));
  return '#' + pa.map((v, i) => Math.round(lerp(v, pb[i], clamp(t))).toString(16).padStart(2, '0')).join('');
}
function smooth(pts, closed = false) { // Catmull-Rom → Безье
  const n = pts.length, P = i => closed ? pts[(i + n) % n] : pts[clamp(i, 0, n - 1)];
  let d = `M${pts[0].map(f)}`;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)},${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)},${f(p2[1] - (p3[1] - p1[1]) / 6)} ${p2.map(f)}`;
  }
  return closed ? d + 'Z' : d;
}
function blob(seed, r, n = 10, wob = .18) { // неровный круг (камень, куст, облако)
  const R = rng(seed), pts = [];
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, rr = r * (1 - wob + 2 * wob * R()); pts.push([Math.cos(a) * rr, Math.sin(a) * rr]); }
  return smooth(pts, true);
}
const txt = (x, y, s, size, fill, o = {}) =>
  `<text x="${f(x)}" y="${f(y)}" font-family="${o.font || 'Rub'}" font-weight="${o.w || 900}" font-size="${size}" fill="${fill}" text-anchor="${o.anchor || 'middle'}" dominant-baseline="central"${o.stroke ? ` stroke="${o.stroke}" stroke-width="${o.sw || 10}" paint-order="stroke" stroke-linejoin="round"` : ''}${o.op != null ? ` opacity="${o.op}"` : ''}${o.ls != null ? ` letter-spacing="${o.ls}"` : ''}>${s}</text>`;
const dbl = (d, w, col, extra = '') =>
  `<path d="${d}" fill="none" stroke="${OL}" stroke-width="${w + 14}" stroke-linecap="round" stroke-linejoin="round"${extra}/><path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${extra}/>`;
const BG = (fill) => `<rect x="-700" y="-700" width="${W + 1400}" height="${H + 1400}" fill="${fill}"/>`;
const pop = (lv, t0, d = .3) => eBack((lv - t0) / d);
const at = (x, y, k, inner, rot = 0) => k <= 0 ? '' : `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)}) scale(${sc100(k)})">${inner}</g>`;

const DEFS = `<defs>
<radialGradient id="vig" cx="50%" cy="43%" r="72%"><stop offset="0" stop-color="#fff" stop-opacity=".32"/><stop offset=".42" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></radialGradient>
<radialGradient id="vigDark" cx="50%" cy="45%" r="70%"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".75"/></radialGradient>
<radialGradient id="redGlow"><stop offset="0" stop-color="#ff2a55" stop-opacity=".95"/><stop offset=".55" stop-color="#ff2a55" stop-opacity=".35"/><stop offset="1" stop-color="#ff2a55" stop-opacity="0"/></radialGradient>
<radialGradient id="whiteGlow"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<radialGradient id="ghostGlow"><stop offset="0" stop-color="#d9f6ff" stop-opacity=".95"/><stop offset=".5" stop-color="#7fd8ff" stop-opacity=".35"/><stop offset="1" stop-color="#7fd8ff" stop-opacity="0"/></radialGradient>
<radialGradient id="sunGlow"><stop offset="0" stop-color="#fff6c8" stop-opacity="1"/><stop offset=".35" stop-color="#ffd36b" stop-opacity=".6"/><stop offset="1" stop-color="#ff9a3c" stop-opacity="0"/></radialGradient>
<linearGradient id="rayG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff8d0" stop-opacity=".55"/><stop offset="1" stop-color="#fff8d0" stop-opacity="0"/></linearGradient>
<filter id="blur6" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
<filter id="blur10" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"/></filter>
<filter id="blur30" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="30"/></filter>
<filter id="sepia"><feColorMatrix type="matrix" values=".39 .77 .19 0 0  .35 .69 .17 0 0  .27 .53 .13 0 0  0 0 0 1 0"/></filter>
</defs>`;

function sunburst(c1, c2, rot, cx = 540, cy = 820, n = 22) {
  let d = ''; const R = 2800;
  for (let i = 0; i < n; i += 2) {
    const a0 = i / n * Math.PI * 2 + rot, a1 = (i + 1) / n * Math.PI * 2 + rot;
    d += `M${cx},${cy}L${f(cx + R * Math.cos(a0))},${f(cy + R * Math.sin(a0))}L${f(cx + R * Math.cos(a1))},${f(cy + R * Math.sin(a1))}Z`;
  }
  return BG(c2) + `<path d="${d}" fill="${c1}"/><rect x="-700" y="-700" width="${W + 1400}" height="${H + 1400}" fill="url(#vig)"/>`;
}
function pill(label, bg, fg = '#fff', size = 34, h = 62) {
  const w = label.length * size * 0.66 + 54;
  return `<rect x="${f(-w / 2)}" y="${-h / 2}" width="${f(w)}" height="${h}" rx="${h / 2}" fill="${bg}" stroke="${OL}" stroke-width="6"/>` + txt(0, 2, label, size, fg);
}
function stars(n, x0, y0, w, h, t, seed) {
  const r = rng(seed); let s = '';
  for (let i = 0; i < n; i++) { const x = x0 + r() * w, y = y0 + r() * h, rr = 2 + r() * 4, ph = r() * 6; s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rr)}" fill="#fff" opacity="${f(.45 + .45 * Math.sin(t * 4 + ph))}"/>`; }
  return s;
}
function sparks(cx, cy, t, R = 430, n = 6, col = '#ffe14a') {
  const r = rng(Math.floor(t * 12) * 7 + 3); let s = '';
  for (let i = 0; i < n; i++) {
    if (r() < .4) continue;
    const a = r() * Math.PI * 2; let x = cx + Math.cos(a) * R * (.85 + r() * .2), y = cy + Math.sin(a) * R * .8 * (.85 + r() * .2);
    let d = `M${f(x)},${f(y)}`;
    for (let k = 0; k < 4; k++) { x += Math.cos(a) * 32 + (r() - .5) * 56; y += Math.sin(a) * 32 + (r() - .5) * 56; d += `L${f(x)},${f(y)}`; }
    s += dbl(d, 9, col);
  }
  return s;
}
function particles(n, seed, t, o = {}) { // пыль/листья/конфетти: падают или летят вверх
  const p = Object.assign({ x0: 0, x1: W, y0: -100, y1: H + 100, speed: 120, size: 6, col: '#fff', op: .6, up: false, drift: 30, shape: 'circle' }, o);
  const r = rng(seed); let s = '';
  for (let i = 0; i < n; i++) {
    const x = lerp(p.x0, p.x1, r()), ph = r(), sp = p.speed * (.6 + .8 * r()), sz = p.size * (.5 + r());
    const span = p.y1 - p.y0; let y = ((ph * span + t * sp) % span); y = p.up ? p.y1 - y : p.y0 + y;
    const xx = x + Math.sin(t * 1.3 + i) * p.drift;
    const col = Array.isArray(p.col) ? p.col[i % p.col.length] : p.col;
    s += p.shape === 'leaf'
      ? `<ellipse cx="${f(xx)}" cy="${f(y)}" rx="${f(sz * 2)}" ry="${f(sz)}" fill="${col}" opacity="${p.op}" transform="rotate(${f(t * 120 + i * 47)},${f(xx)},${f(y)})"/>`
      : `<circle cx="${f(xx)}" cy="${f(y)}" r="${f(sz)}" fill="${col}" opacity="${p.op}"/>`;
  }
  return s;
}
function lids(c) { // кадр «моргает»: веки сверху и снизу
  if (c <= 0) return '';
  const yt = lerp(-260, 985, c), yb = lerp(2180, 935, c), k = 380 * (1 - c);
  return `<path d="M-250,-300 L1330,-300 L1330,${f(yt)} Q540,${f(yt + k)} -250,${f(yt)} Z M-250,2220 L1330,2220 L1330,${f(yb)} Q540,${f(yb - k)} -250,${f(yb)} Z" fill="#000"/>`;
}
function crack(seed, cx, cy, len = 900) { // трещина через экран
  const r = rng(seed); let d = `M${cx},${cy}`, x = cx, y = cy, a = r() * 6.28;
  const main = [];
  for (let k = 0; k < 9; k++) { x += Math.cos(a) * len / 9; y += Math.sin(a) * len / 9; a += (r() - .5) * 1.2; d += `L${f(x)},${f(y)}`; main.push([x, y]); }
  x = cx; y = cy; a += Math.PI; d += `M${cx},${cy}`;
  for (let k = 0; k < 7; k++) { x += Math.cos(a) * len / 9; y += Math.sin(a) * len / 9; a += (r() - .5) * 1.2; d += `L${f(x)},${f(y)}`; }
  main.forEach(([mx, my], i) => { if (i % 2) { const b = r() * 6.28; d += `M${f(mx)},${f(my)}l${f(Math.cos(b) * 120)},${f(Math.sin(b) * 120)}`; } });
  return `<path d="${d}" fill="none" stroke="#000" stroke-width="16" stroke-linejoin="round" opacity=".5"/><path d="${d}" fill="none" stroke="#fff" stroke-width="7" stroke-linejoin="round"/>`;
}
function comic(x, y, word, k, col = '#ffe14a', size = 110, rot = -8) {
  if (k <= 0) return '';
  let star = ''; const n = 14;
  for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * Math.PI * 2, r = i % 2 ? size * 1.05 : size * 1.6; star += (i ? 'L' : 'M') + f(Math.cos(a) * r * 1.3) + ',' + f(Math.sin(a) * r * .8); }
  return at(x, y, k, `<path d="${star}Z" fill="#fff" stroke="${OL}" stroke-width="8" stroke-linejoin="round"/>` + txt(0, 4, word, size, col, { stroke: OL, sw: 14 }), rot);
}

// ───────────────────────── персонаж ─────────────────────────
// Позы рук: точки от плеча (рукава) к кисти, в координатах персонажа (центр головы = 0,0).
const POSES = {
  down: { r: [[262, 470], [270, 712]], l: [[-262, 470], [-270, 712]] },
  hold: { r: [[262, 478], [300, 650], [96, 612]], l: [[-262, 478], [-300, 650], [-96, 612]] },
  reach: { r: [[262, 470], [400, 360], [520, 250]], l: [[-262, 478], [-330, 650], [-130, 560]] },
  out: { r: [[262, 470], [420, 420], [500, 230]], l: [[-262, 470], [-420, 420], [-500, 230]] },
  rope: { r: [[262, 470], [300, 330]], l: [[-262, 470], [-280, 160], [-30, -300]] },
  wave: { r: [[262, 470], [300, 600]], l: [[-262, 470], [-430, 270], [-450, 40]] },
  point: { r: [[262, 470], [430, 420], [600, 380]], l: [[-262, 470], [-270, 712]] },
  armrest: { r: [[262, 470], [330, 640], [360, 700]], l: [[-262, 470], [-330, 640], [-360, 700]] },
  face: { r: [[262, 478], [330, 400], [150, 150]], l: [[-262, 478], [-330, 400], [-150, 150]] },
};
function guy(o) {
  const id = ++uid;
  const p = Object.assign({
    x: 540, y: 640, s: 1, rot: 0, tired: 0, red: 0, lid: .12, lidL: null, lidR: null, eyes: 'open', pupil: 'normal', ps: 1,
    look: [0, 0], brow: 'neutral', mouth: 'smile', mouthOpen: 1, messy: 0, sweat: 0, tears: 0, pose: 'down', hold: null,
    legs: true, shirt: '#ece7dc', t: 0, headRot: 0, headDy: 0, light: 0, opacity: 1, blush: .35,
    hairStyle: 'short', hair: '#6a3f22', hairD: '#4a2a15', lashes: false, beard: null, glasses: false, lower: 'jeans', pants: '#2f61b8',
    backpack: false, stump: false, item: null, dirt: 0, skin: '#f7c6a0', skinD: '#e2a67e', bandage: false, hairWind: 0,
  }, o);
  const { skin, skinD, hair, hairD } = p;
  const arms = POSES[p.pose] || POSES.down;
  let g = '';
  // рюкзак виден над плечами
  if (p.backpack) g += `<rect x="-205" y="150" width="410" height="230" rx="60" fill="#d9572b" stroke="${OL}" stroke-width="8"/><rect x="-150" y="168" width="300" height="40" rx="20" fill="#b8431d"/>`;
  // ноги / юбка
  if (p.legs) {
    if (p.lower === 'skirt') {
      for (const sx of [-1, 1]) g += `<rect x="${sx > 0 ? 40 : -130}" y="900" width="90" height="220" rx="30" fill="${skin}" stroke="${OL}" stroke-width="7"/>`;
      g += `<path d="M-205,740 L205,740 L262,930 Q0,970 -262,930 Z" fill="${p.shirt}" stroke="${OL}" stroke-width="8" stroke-linejoin="round"/><path d="M-120,760 L-150,930 M0,760 L0,950 M120,760 L150,930" stroke="${OL}" stroke-width="4" opacity=".25"/>`;
    } else {
      g += `<path d="M-200,740 L200,740 L196,1120 L28,1120 L14,880 L-14,880 L-28,1120 L-196,1120 Z" fill="${p.pants}" stroke="${OL}" stroke-width="8" stroke-linejoin="round"/>`;
      g += `<path d="M0,770 L0,875 M-120,1000 l40,0 M120,1000 l-40,0" stroke="#000" stroke-width="6" stroke-linecap="round" opacity=".2"/>`;
    }
    const shoe = `<path d="M-205,1112 L-22,1112 Q-8,1166 -60,1172 L-218,1172 Q-250,1140 -205,1112Z" fill="#f4f4f4" stroke="${OL}" stroke-width="8" stroke-linejoin="round"/><path d="M-226,1152 L-30,1152" stroke="#c9c9c9" stroke-width="6"/>`;
    g += shoe + (p.oneShoe ? '' : `<g transform="scale(-1,1)">${shoe}</g>`);
  }
  // руки: висящие — под футболкой, остальные — поверх
  const hanging = pts => pts.length === 2 && pts[1][1] > 600;
  const drawArm = (pts, side) => {
    let a = '';
    if (side > 0 && p.stump) {
      const e = [lerp(pts[0][0], pts[1][0], .55), lerp(pts[0][1], pts[1][1], .55)];
      a += dbl(`M${pts[0]} L${e.map(f)}`, 70, skin);
      a += `<g transform="translate(${e.map(f)})"><circle r="46" fill="#fff" stroke="${OL}" stroke-width="7"/><path d="M-40,-14 L40,-14 M-42,10 L42,10" stroke="#d9d4cc" stroke-width="6"/><circle cx="8" cy="0" r="10" fill="#e8706f" opacity=".6"/></g>`;
      return a;
    }
    a += dbl(`M${pts.map(q => q.join(',')).join(' L')}`, 70, skin);
    const h = pts[pts.length - 1];
    if (p.item === 'knife' && side < 0) {
      a += `<g transform="translate(${h}) rotate(-35)"><path d="M-12,-20 L-12,-150 Q0,-178 14,-150 L14,-20 Z" fill="#d9e0e8" stroke="${OL}" stroke-width="6"/><path d="M-4,-40 L-4,-140" stroke="#fff" stroke-width="5" opacity=".8"/><rect x="-24" y="-24" width="48" height="110" rx="14" fill="#d42a2a" stroke="${OL}" stroke-width="6"/></g>`;
    }
    a += `<circle cx="${h[0]}" cy="${h[1]}" r="42" fill="${skin}" stroke="${OL}" stroke-width="7"/>`;
    return a;
  };
  if (hanging(arms.l)) g += drawArm(arms.l, -1);
  if (hanging(arms.r)) g += drawArm(arms.r, 1);
  // шея и футболка
  g += `<path d="M-48,150 L-48,240 Q0,262 48,240 L48,150 Z" fill="${skinD}" stroke="${OL}" stroke-width="7"/>`;
  g += `<path d="M-75,212 C-45,252 45,252 75,212 L185,236 C238,250 262,288 272,336 L312,470 Q270,500 226,498 L214,770 L-214,770 L-226,498 Q-270,500 -312,470 L-272,336 C-262,288 -238,250 -185,236 Z" fill="${p.shirt}" stroke="${OL}" stroke-width="8" stroke-linejoin="round"/>`;
  g += `<path d="M150,300 L214,770 L168,770 Z M-230,330 L-250,480 L-226,490Z" fill="#000" opacity=".08"/>`;
  g += `<path d="M-150,560 q22,50 0,110 M120,600 q-16,40 6,90 M226,498 L250,345 M-226,498 L-250,345" fill="none" stroke="${OL}" stroke-width="5" stroke-linecap="round" opacity=".28"/>`;
  g += `<path d="M-75,212 C-45,262 45,262 75,212" fill="none" stroke="#000" stroke-width="12" opacity=".12"/><path d="M-75,212 C-45,262 45,262 75,212" fill="none" stroke="${OL}" stroke-width="6"/>`;
  if (p.backpack) g += `<path d="M-150,236 L-140,640 M150,236 L140,640" stroke="${OL}" stroke-width="44" stroke-linecap="round"/><path d="M-150,236 L-140,640 M150,236 L140,640" stroke="#b8431d" stroke-width="30" stroke-linecap="round"/>`;
  if (p.dirt > 0) { const r = rng(id * 3 + 1); for (let k = 0; k < 7; k++) g += `<ellipse cx="${f(-170 + r() * 340)}" cy="${f(320 + r() * 400)}" rx="${f(16 + r() * 26)}" ry="${f(10 + r() * 14)}" fill="#6b4a2a" opacity="${f(.35 * p.dirt)}"/>`; }
  if (!hanging(arms.l)) g += drawArm(arms.l, -1);
  if (!hanging(arms.r)) g += drawArm(arms.r, 1);
  // голова
  let h = `<g transform="translate(0,${f(p.headDy)}) rotate(${f(p.headRot)},0,170)">`;
  if (p.hairStyle === 'long') {
    const wv = p.hairWind;
    h += `<path d="M-190,40 C-215,-160 -115,-242 0,-244 C115,-242 215,-160 190,40 L${f(212 + 30 * wv)},${f(270 - 260 * wv)} Q120,${f(300 - 200 * wv)} 90,230 L-90,230 Q-120,${f(300 - 200 * wv)} ${f(-212 - 30 * wv)},${f(270 - 260 * wv)} Z" fill="${hairD}" stroke="${OL}" stroke-width="8" stroke-linejoin="round"/>`;
  } else {
    h += `<path d="M-182,40 C-204,-150 -112,-232 0,-234 C112,-232 204,-150 182,40 Z" fill="${hairD}" stroke="${OL}" stroke-width="8"/>`;
  }
  for (const sx of [-1, 1]) h += `<ellipse cx="${sx * 166}" cy="25" rx="30" ry="44" fill="${skin}" stroke="${OL}" stroke-width="7"/><path d="M${sx * 166},5 q${sx * 12},20 0,40" fill="none" stroke="${skinD}" stroke-width="6"/>`;
  const face = 'M-168,0 C-168,-120 -95,-175 0,-175 C95,-175 168,-120 168,0 C168,110 100,195 0,195 C-100,195 -168,110 -168,0 Z';
  h += `<clipPath id="fc${id}"><path d="${face}"/></clipPath>`;
  h += `<path d="${face}" fill="${skin}" stroke="${OL}" stroke-width="8"/>`;
  h += `<path d="M90,150 C130,110 160,60 166,0 C170,90 120,170 40,192 Z" fill="#000" opacity=".06"/>`;
  for (const sx of [-1, 1]) h += `<ellipse cx="${sx * 108}" cy="98" rx="34" ry="18" fill="#ff6b80" opacity="${p.blush}"/>`;
  if (p.dirt > 0) h += `<g clip-path="url(#fc${id})"><ellipse cx="-110" cy="140" rx="40" ry="22" fill="#6b4a2a" opacity="${f(.35 * p.dirt)}"/><ellipse cx="90" cy="-90" rx="30" ry="14" fill="#6b4a2a" opacity="${f(.3 * p.dirt)}"/><path d="M60,40 l60,30" stroke="#b33" stroke-width="5" opacity="${f(.6 * p.dirt)}"/></g>`;
  // глаза
  const scl = mix('#ffffff', '#ffc4c4', p.red);
  const eye = (cx, cy, side, lid) => {
    if (p.eyes === 'closed' || lid >= .95) return `<path d="M${cx - 46},${cy + 6} Q${cx},${cy + 40} ${cx + 46},${cy + 6}" fill="none" stroke="${OL}" stroke-width="8" stroke-linecap="round"/>`;
    if (p.eyes === 'squeeze') return `<path d="M${cx - 38 * side},${cy - 24} L${cx + 30 * side},${cy + 6} L${cx - 38 * side},${cy + 32}" fill="none" stroke="${OL}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`;
    const cid = `ec${id}${side}`;
    let e = `<clipPath id="${cid}"><ellipse cx="${cx}" cy="${cy}" rx="52" ry="58"/></clipPath>`;
    e += `<ellipse cx="${cx}" cy="${cy}" rx="52" ry="58" fill="${scl}"/><g clip-path="url(#${cid})">`;
    if (p.red > 0) {
      const r = rng(id * 10 + side + 5); let d = '';
      for (let k = 0; k < 7; k++) {
        const a = (k / 7) * Math.PI * 2 + r(), x1 = cx + Math.cos(a) * 58, y1 = cy + Math.sin(a) * 62;
        const x2 = cx + Math.cos(a + .25) * 34, y2 = cy + Math.sin(a + .25) * 36, x3 = cx + Math.cos(a - .1) * 22, y3 = cy + Math.sin(a - .1) * 24;
        d += `M${f(x1)},${f(y1)} Q${f(x2)},${f(y2)} ${f(x3)},${f(y3)}`;
      }
      e += `<path d="${d}" fill="none" stroke="#e0283a" stroke-width="3.5" stroke-linecap="round" opacity="${f(p.red)}"/>`;
    }
    const ix = cx + p.look[0], iy = cy + p.look[1];
    const ir = p.pupil === 'tiny' ? 17 : 27, pr = (p.pupil === 'tiny' ? 5.5 : 13) * p.ps;
    const iris = p.irisCol || '#7a4a28';
    e += `<circle cx="${ix}" cy="${iy}" r="${ir}" fill="${iris}"/><circle cx="${ix}" cy="${iy}" r="${f(ir * .66)}" fill="#000" opacity=".3"/><circle cx="${ix}" cy="${iy}" r="${f(pr)}" fill="#120c08"/>`;
    e += `<circle cx="${f(ix + ir * .38)}" cy="${f(iy - ir * .42)}" r="${f(ir * .3)}" fill="#fff"/><circle cx="${f(ix - ir * .35)}" cy="${f(iy + ir * .38)}" r="${f(ir * .13)}" fill="#fff"/>`;
    const ly = cy - 58 + 116 * clamp(lid), cv = 16 * (1 - lid) + 4;
    e += `<path d="M${cx - 60},${cy - 70} L${cx + 60},${cy - 70} L${cx + 60},${f(ly)} Q${cx},${f(ly + cv)} ${cx - 60},${f(ly)} Z" fill="${skin}"/>`;
    e += `<path d="M${cx - 60},${f(ly)} Q${cx},${f(ly + cv)} ${cx + 60},${f(ly)}" fill="none" stroke="${OL}" stroke-width="6"/></g>`;
    e += `<ellipse cx="${cx}" cy="${cy}" rx="52" ry="58" fill="none" stroke="${OL}" stroke-width="7"/>`;
    if (p.lashes) e += `<path d="M${cx + side * 40},${cy - 40} l${side * 22},-18 M${cx + side * 50},${cy - 22} l${side * 26},-8 M${cx + side * 22},${cy - 52} l${side * 12},-22" stroke="${OL}" stroke-width="7" stroke-linecap="round"/>`;
    return e;
  };
  h += eye(-68, 10, -1, p.lidL ?? p.lid) + eye(68, 10, 1, p.lidR ?? p.lid);
  if (p.tired > 0) for (const cx of [-68, 68]) {
    h += `<path d="M${cx - 48},64 Q${cx},106 ${cx + 48},64 Q${cx},86 ${cx - 48},64Z" fill="#7d4a96" opacity="${f(.6 * p.tired)}"/>`;
    h += `<path d="M${cx - 40},78 Q${cx},108 ${cx + 40},78" fill="none" stroke="#5b2f73" stroke-width="5" stroke-linecap="round" opacity="${f(.8 * p.tired)}"/>`;
  }
  if (p.glasses) h += `<g fill="#bfe6ff" fill-opacity=".18" stroke="${OL}" stroke-width="8"><circle cx="-70" cy="10" r="66"/><circle cx="70" cy="10" r="66"/></g><path d="M-6,4 Q0,-6 6,4 M-136,0 L-166,-10 M136,0 L166,-10" stroke="${OL}" stroke-width="8" fill="none"/>`;
  h += `<path d="M-6,52 Q-2,82 16,74" fill="none" stroke="${OL}" stroke-width="6" stroke-linecap="round"/>`;
  if (p.beard) h += `<path d="M-166,40 C-160,170 -90,236 0,238 C90,236 160,170 166,40 C150,110 110,150 60,160 Q0,140 -60,160 C-110,150 -150,110 -166,40 Z" fill="${p.beard}" stroke="${OL}" stroke-width="7" stroke-linejoin="round"/>`;
  // рот
  const mo = p.mouthOpen, lip = p.lips || '#7a1d2b';
  const MOUTH = {
    smile: `<path d="M-52,-6 Q0,48 52,-6 Q0,10 -52,-6Z" fill="${lip}" stroke="${OL}" stroke-width="7" stroke-linejoin="round"/><path d="M-42,0 Q0,12 42,0 L38,9 Q0,19 -38,9Z" fill="#fff"/>`,
    flat: `<path d="M-42,6 Q-14,-4 0,4 T42,2" fill="none" stroke="${OL}" stroke-width="8" stroke-linecap="round"/>`,
    sad: `<path d="M-46,18 Q0,-18 46,18" fill="none" stroke="${OL}" stroke-width="8" stroke-linecap="round"/>`,
    wavy: `<path d="M-56,4 q14,-16 28,0 t28,0 t28,0 t28,0" fill="none" stroke="${OL}" stroke-width="8" stroke-linecap="round"/>`,
    open: `<ellipse cx="0" cy="12" rx="32" ry="${f(44 * mo)}" fill="#5a1220" stroke="${OL}" stroke-width="7"/><ellipse cx="0" cy="${f(12 + 28 * mo)}" rx="20" ry="${f(11 * mo)}" fill="#e25a6e"/>`,
    scream: `<ellipse cx="0" cy="24" rx="${f(40 + 10 * mo)}" ry="${f(64 * mo)}" fill="#5a1220" stroke="${OL}" stroke-width="8"/><ellipse cx="0" cy="${f(24 + 44 * mo)}" rx="26" ry="${f(16 * mo)}" fill="#e25a6e"/>`,
    grit: `<rect x="-58" y="-20" width="116" height="44" rx="18" fill="#fff" stroke="${OL}" stroke-width="7"/><path d="M-52,2 L52,2 M-29,-18 L-29,22 M0,-20 L0,24 M29,-18 L29,22" stroke="${OL}" stroke-width="4"/>`,
    yawn: `<ellipse cx="0" cy="30" rx="${f(48 + 18 * mo)}" ry="${f(92 * mo)}" fill="#5a1220" stroke="${OL}" stroke-width="8"/><ellipse cx="0" cy="${f(30 + 62 * mo)}" rx="${f(30 + 12 * mo)}" ry="${f(24 * mo)}" fill="#e25a6e"/>`,
  };
  h += `<g transform="translate(0,128)">${MOUTH[p.mouth]}</g>`;
  if (p.beard) h += `<path d="M-70,112 Q-30,92 0,104 Q30,92 70,112 Q40,124 0,116 Q-40,124 -70,112Z" fill="${p.beard}" stroke="${OL}" stroke-width="6"/>`;
  if (p.light > 0) h += `<g clip-path="url(#fc${id})"><ellipse cx="0" cy="80" rx="190" ry="170" fill="#69e6ff" opacity="${f(p.light)}"/></g>`;
  // волосы
  const m = p.messy;
  if (p.hairStyle === 'long') {
    h += `<path d="M-180,30 C-200,-140 -110,-222 0,-224 C110,-222 200,-140 180,30 L170,-10 C150,-90 90,-120 20,-118 C-40,-116 -90,-96 -130,-50 C-150,-26 -164,0 -180,30 Z" fill="${hair}" stroke="${OL}" stroke-width="8" stroke-linejoin="round"/>`;
    for (const sx of [-1, 1]) h += `<path d="M${sx * 178},0 Q${sx * 205},140 ${sx * 192},${f(250 - 230 * p.hairWind)} L${sx * 150},${f(236 - 200 * p.hairWind)} Q${sx * 160},120 ${sx * 150},10 Z" fill="${hair}" stroke="${OL}" stroke-width="7" stroke-linejoin="round"/>`;
    h += `<path d="M-60,-180 Q20,-206 100,-176" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".25"/>`;
  } else {
    if (m > 0) {
      const tuft = (x, y, a, len) => { const sx = Math.sin(a), cy = Math.cos(a); return `M${x - 15},${y} Q${f(x + sx * len * .55 - 12)},${f(y - cy * len * .6)} ${f(x + sx * len)},${f(y - cy * len)} Q${f(x + sx * len * .4 + 10)},${f(y - cy * len * .42)} ${x + 15},${y} Z`; };
      const sway = Math.sin(p.t * 3) * .08;
      h += `<path d="${tuft(-78, -192, -.7 + sway, 62 * m)}${tuft(-22, -206, -.2 + sway, 78 * m)}${tuft(34, -204, .3 + sway, 66 * m)}${tuft(92, -186, .85 + sway, 52 * m)}" fill="${hair}" stroke="${OL}" stroke-width="7" stroke-linejoin="round"/>`;
    }
    h += `<path d="M-176,30 C-196,-130 -118,-214 0,-218 C118,-214 196,-130 176,30 L160,-20 Q150,-60 128,-78 Q116,-62 100,-70 Q94,-104 70,-118 Q60,-84 30,-80 Q22,-118 -8,-126 Q-18,-86 -48,-84 Q-60,-118 -92,-118 Q-92,-82 -118,-74 Q-136,-100 -152,-82 Q-162,-40 -176,30 Z" fill="${hair}" stroke="${OL}" stroke-width="8" stroke-linejoin="round"/>`;
    h += `<path d="M-100,-168 Q-30,-200 50,-186" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" opacity=".18"/>`;
  }
  const BROW = { neutral: 'M-112,-66 Q-72,-84 -30,-70', worried: 'M-114,-62 Q-74,-74 -30,-96', raised: 'M-114,-90 Q-72,-118 -28,-96', tired: 'M-112,-60 Q-72,-70 -30,-64', angry: 'M-114,-94 Q-72,-86 -30,-64' };
  const bc = p.browCol || '#3b2212';
  h += `<path d="${BROW[p.brow]}" fill="none" stroke="${bc}" stroke-width="18" stroke-linecap="round"/><path d="${BROW[p.brow]}" transform="scale(-1,1)" fill="none" stroke="${bc}" stroke-width="18" stroke-linecap="round"/>`;
  if (p.bandage) h += `<g transform="translate(-60,-150) rotate(-20)"><rect x="-70" y="-26" width="140" height="52" rx="16" fill="#fff" stroke="${OL}" stroke-width="6"/><circle cx="10" cy="0" r="14" fill="#e8706f" opacity=".6"/></g>`;
  if (p.tears > 0) for (const sx of [-1, 1]) {
    h += `<path d="M${sx * 112},40 q${sx * 14},70 ${sx * 4},150" fill="none" stroke="#7fd3ff" stroke-width="18" stroke-linecap="round" opacity=".9"/>`;
    const dy = (p.t * 260 + (sx > 0 ? 60 : 0)) % 140;
    h += `<path d="M${sx * 118},${f(170 + dy)} c8,10 12,18 12,24 a12,12 0 0 1 -24,0 c0,-6 4,-14 12,-24Z" fill="#7fd3ff" stroke="${OL}" stroke-width="4"/>`;
  }
  const SW = [[152, -112], [-160, -70], [176, 26]];
  for (let k = 0; k < p.sweat; k++) {
    const [sx, sy] = SW[k], dy = ((p.t * 70 + k * 23) % 36);
    h += `<path transform="translate(${sx},${f(sy + dy)})" d="M0,-24 C13,-6 17,5 17,13 A17,17 0 0 1 -17,13 C-17,5 -13,-6 0,-24 Z" fill="#9fe1ff" stroke="${OL}" stroke-width="5"/>`;
  }
  h += '</g>';
  g += h;
  return `<g transform="translate(${f(p.x)},${f(p.y)}) scale(${p.s}) rotate(${f(p.rot)},0,${p.pivotY ?? 1170})" opacity="${p.opacity}">${g}</g>`;
}

// ───────────────────────── HUD, подписи, переходы, камера ─────────────────────────
const VIEWS = {};
const TONES = { green: '#38e07b', yellow: '#ffc21a', red: '#ff3b3b' };
function hud(t, sc, prev) {
  const HC = TL.hud || { label: 'УСТАЛОСТЬ', invert: false };
  const ls = t - sc.start, tone = TONES[sc.hudTone];
  const changed = !prev || prev.day !== sc.day;
  const k = changed ? lerp(1.45, 1, eBack(ls / .32)) : 1;
  const mv = prev ? lerp(prev.meter, sc.meter, eOut(ls / .6)) : sc.meter;
  const bad = HC.invert ? 100 - mv : mv;
  let s = `<g transform="translate(540,150) scale(${sc100(k)})"><rect x="-150" y="-44" width="300" height="88" rx="44" fill="#111427" stroke="${tone}" stroke-width="7"/>${txt(0, 3, (HC.prefix || 'ДЕНЬ') + ' ' + sc.day, 56, tone)}</g>`;
  const bw = 500, fillC = bad < 50 ? mix('#38e07b', '#ffc21a', bad / 50) : mix('#ffc21a', '#ff3b3b', (bad - 50) / 50);
  const blink = bad >= 99 ? f(.7 + .3 * Math.sin(t * 18)) : 1;
  s += `<rect x="${540 - bw / 2}" y="212" width="${bw}" height="50" rx="25" fill="#111427" stroke="#000" stroke-width="4"/>`;
  if (mv > .5) s += `<rect x="${540 - bw / 2 + 6}" y="218" width="${f(Math.max(38, (bw - 12) * mv / 100))}" height="38" rx="19" fill="${fillC}" opacity="${blink}"/>`;
  s += txt(540, 238, `${HC.label}: ${Math.round(mv)}%`, 28, bad >= 99 && Math.sin(t * 18) > 0 ? '#ff6b6b' : '#fff', { w: 700, stroke: '#111427', sw: 7 });
  return s;
}
function capHTML(c) { return c.replace(/\[(.+?)\]/g, '<span class="y">$1</span>').replace(/\{(.+?)\}/g, '<span class="r">$1</span>'); }

const $art = document.getElementById('art'), $fx = document.getElementById('fx'), $cap = document.getElementById('cap');
const $back = $cap.querySelector('.back'), $front = $cap.querySelector('.front');
let capKey = null;

function sceneAt(t) { let i = 0; TL.scenes.forEach((s, k) => { if (t >= s.start) i = k; }); return i; }
function viewsOf(sc) {
  const list = sc.views.map((v, i) => {
    const name = v.name ?? v[0], seg = v.seg ?? v[1] ?? 0;
    return { name, start: i === 0 ? sc.start : sc.segments[seg].start - .06 };
  });
  list.forEach((v, i) => v.end = i < list.length - 1 ? list[i + 1].start : sc.end);
  return list;
}

window.init = async function (tl) {
  TL = tl;
  TL.scenes.forEach(sc => { sc._views = viewsOf(sc); });
  await Promise.all(['900 92px Mont', '900 40px Rub', '700 22px Rub'].map(x => document.fonts.load(x, 'АБВ abc 0123')));
  await document.fonts.ready;
  const miss = [...new Set(TL.scenes.flatMap(s => s._views.map(v => v.name)))].filter(n => !VIEWS[n]);
  if (miss.length) throw new Error('нет картинок: ' + miss.join(', '));
  return true;
};

window.renderFrame = function (t) {
  uid = 0;
  const si = sceneAt(t), sc = TL.scenes[si], prev = TL.scenes[si - 1];
  let vi = 0; sc._views.forEach((v, k) => { if (t >= v.start) vi = k; });
  const v = sc._views[vi], lv = t - v.start, vd = v.end - v.start;
  const ctx = {
    sc, si, vi, vd,
    segRel: sc.segments.map(g => g.start - v.start),
    segEndRel: sc.segments.map(g => g.end - v.start),
  };
  const V = VIEWS[v.name];
  const art = V.draw(lv, vd, t, ctx);
  const z = (V.zoom === false ? 1 : 1 + .11 * (1 - eOut(lv / .3))) + .045 * (lv / vd);
  let sx = 0, sy = 0;
  for (const [t0, a, d] of (V.shakes ? V.shakes(ctx) : [])) {
    const q = (lv - t0) / d;
    if (q >= 0 && q < 1) { const r = rng(Math.floor(t * FPS) * 13 + 7); sx += (r() - .5) * 2 * a * (1 - q); sy += (r() - .5) * 2 * a * (1 - q); }
  }
  const B = TL.banner, bc = TL.bannerCfg;
  const bIn = B && bc && sc.id === bc.after_scene && t >= B.start - .2;
  const bshift = bIn ? (bc.cam_shift || 0) * eInOut((t - B.start + .2) / .5) : 0;
  const cam = `translate(${f(540 + sx)},${f(820 + sy - bshift)}) scale(${z.toFixed(4)}) translate(-540,-820)`;
  $art.innerHTML = DEFS + `<g transform="${cam}">${art}</g>` + (TL.hud?.hidden ? '' : hud(t, sc, prev)) +
    txt(48, 1580, TL.handle, 28, '#fff', { anchor: 'start', w: 700, op: .6, stroke: '#000', sw: 5 });

  let gi = 0; sc.segments.forEach((g, k) => { if (k === 0 || t >= g.start - .06) gi = k; });
  const seg = sc.segments[gi], cStart = gi === 0 ? sc.start : seg.start - .06;
  const key = si + ':' + gi;
  if (key !== capKey) { capKey = key; $back.innerHTML = $front.innerHTML = capHTML(seg.caption); }
  const dt = t - cStart;
  const cs = lerp(.55, 1, eBack(dt / .22)), cr = lerp(-5, 0, eOut(dt / .2));
  $cap.style.transform = `scale(${cs.toFixed(3)}) rotate(${cr.toFixed(2)}deg)`;
  const capHide = B ? clamp((t - B.start + .05) / .15) * (t < B.start + B.dur ? 1 : 0) : 0;
  $cap.style.opacity = (clamp(dt / .05) * (1 - capHide)).toFixed(2);

  let fx = '';
  TL.scenes.forEach((s2, k) => {
    if (k === 0) return;
    const q = (t - (s2.start - .1)) / .2;
    if (q > 0 && q < 1) {
      const x = -2300 + q * 4600, col = TL.wipe || '#19d3f3';
      fx += `<path d="M${f(x)},0 L${f(x + 1900)},0 L${f(x + 1300)},1920 L${f(x - 600)},1920 Z" fill="${col}"/><path d="M${f(x + 1900)},0 L${f(x + 1990)},0 L${f(x + 1390)},1920 L${f(x + 1300)},1920 Z" fill="#fff" opacity=".9"/>`;
    }
  });
  if (vi > 0 && lv < .12) fx += `<rect width="1080" height="1920" fill="#fff" opacity="${f(.45 * (1 - lv / .12))}"/>`;
  if (V.flash) { const fl = V.flash(lv, ctx); if (fl > 0) fx += `<rect width="1080" height="1920" fill="#fff" opacity="${f(fl)}"/>`; }
  $fx.innerHTML = fx;
  return true;
};
