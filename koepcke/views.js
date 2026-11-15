// «Она упала с неба» — картинки сцен.
const JUL = { hairStyle: 'long', hair: '#a8652d', hairD: '#6e3c17', lashes: true, shirt: '#8fd0ff', lower: 'skirt', lips: '#c2405a', blush: .5, irisCol: '#3d7a3a', browCol: '#5a3214' };
const MOM = { hairStyle: 'long', hair: '#4a2a15', hairD: '#2e180b', lashes: true, glasses: true, shirt: '#ff9ab8', lips: '#b0304a', blush: .4 };
const DAD = { hair: '#8a7a6a', hairD: '#5a4a3a', beard: '#9a8a7a', glasses: true, shirt: '#c8b27a', browCol: '#5a4a3a' };

function sky(c1, c2) { const id = ++uid; return `<linearGradient id="sk${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient><rect x="-700" y="-700" width="2480" height="3300" fill="url(#sk${id})"/>`; }
function cloud(x, y, s, col = '#fff', op = 1) {
  return `<g transform="translate(${f(x)},${f(y)}) scale(${f(s * 100) / 100})" opacity="${op}"><path d="M-200,40 Q-230,-40 -140,-50 Q-120,-130 -30,-110 Q20,-170 100,-110 Q190,-120 190,-30 Q250,0 210,50 Z" fill="${col}"/></g>`;
}
function canopy(y, t, s = 1, dark = 0) {
  let g = '';
  const cols = ['#1f6b34', '#2a8a3e', '#3aa84a', '#4fc25a'].map(c => mix(c, '#0a1f12', dark));
  for (let row = 0; row < 4; row++) {
    const r = rng(row * 17 + 3);
    for (let i = -2; i < 9; i++) {
      const x = i * 170 + (row % 2) * 85 + r() * 40, yy = y + row * 90 * s + r() * 30;
      g += `<path d="${blob(row * 50 + i + 100, 130 * s * (.8 + r() * .4), 9, .2)}" transform="translate(${f(x)},${f(yy)})" fill="${cols[row]}" stroke="${OL}" stroke-width="6"/>`;
    }
  }
  return g + `<rect x="-700" y="${f(y + 380 * s)}" width="2480" height="3000" fill="${cols[3]}"/>`;
}
function leaf(x, y, s, rot, col) {
  return `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)}) scale(${s})"><path d="M0,0 Q120,-90 300,0 Q120,90 0,0Z" fill="${col}" stroke="${OL}" stroke-width="6"/><path d="M0,0 L290,0 M80,0 l50,-30 M150,0 l50,-30 M80,0 l50,30 M150,0 l50,30" fill="none" stroke="#000" stroke-width="5" opacity=".25"/></g>`;
}
function jungle(t, blur = 0) {
  let s = sky('#0f3b22', '#2e7a3a');
  let back = '';
  for (let i = 0; i < 8; i++) back += `<rect x="${60 + i * 140}" y="-700" width="${40 + (i % 3) * 18}" height="3000" fill="#173d22" opacity=".8"/>`;
  back += `<path d="M300,-200 L460,-200 L700,1500 L260,1500Z" fill="url(#rayG)" opacity=".5"/>`;
  const r = rng(77); for (let i = 0; i < 26; i++) back += leaf(r() * 1300 - 150, r() * 1700, .8 + r() * .9, r() * 360, ['#1d5a2c', '#26733a', '#2f8a44', '#163f20'][i % 4]);
  s += blur ? `<g filter="url(#jb${++uid})"><filter id="jb${uid}" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="${f(blur)}"/></filter>${back}</g>` : back;
  return s;
}
function seat(inner, o = {}) {
  let s = `<rect x="-300" y="-330" width="600" height="1150" rx="90" fill="#2f4fa8" stroke="${OL}" stroke-width="9"/><rect x="-190" y="-320" width="380" height="170" rx="40" fill="#f2f2f2" stroke="${OL}" stroke-width="6"/>`;
  s += `<rect x="-320" y="740" width="640" height="150" rx="40" fill="#28418c" stroke="${OL}" stroke-width="9"/>`;
  s += inner;
  for (const sx of [-1, 1]) s += `<rect x="${sx > 0 ? 300 : -380}" y="640" width="80" height="60" rx="20" fill="#9aa3b2" stroke="${OL}" stroke-width="7"/>`;
  s += `<rect x="-230" y="700" width="460" height="56" rx="12" fill="#d9b25a" stroke="${OL}" stroke-width="7"/><rect x="-46" y="690" width="92" height="76" rx="12" fill="#cfd6df" stroke="${OL}" stroke-width="7"/>`;
  return s;
}
function plane(x, y, s, o = {}) {
  const p = Object.assign({ split: 0, lit: 1, flick: 1, t: 0 }, o);
  let b = `<path d="M-470,-40 L-500,-200 L-420,-200 L-340,-40Z" fill="#e8ecf2" stroke="${OL}" stroke-width="8" stroke-linejoin="round"/><path d="M-480,-150 L-430,-150" stroke="#2f61b8" stroke-width="14"/>`;
  b += `<path d="M-470,-40 L330,-40 Q440,-40 470,10 Q440,58 330,58 L-470,58 Q-510,40 -510,10 Q-510,-40 -470,-40Z" fill="#f4f6fa" stroke="${OL}" stroke-width="8"/>`;
  b += `<path d="M-500,26 L460,26" stroke="#2f61b8" stroke-width="14"/><path d="M400,-28 Q440,-20 455,0 L410,0Z" fill="#2b3550"/>`;
  for (let i = 0; i < 16; i++) b += `<circle cx="${-400 + i * 46}" cy="-8" r="11" fill="${p.lit ? '#ffe28a' : '#9fb8d8'}" opacity="${p.flick}" stroke="${OL}" stroke-width="3"/>`;
  b += `<ellipse cx="-470" cy="30" rx="90" ry="16" fill="#cfd6df" stroke="${OL}" stroke-width="6"/>`;
  const wing = `<path d="M-60,30 L-220,190 L-140,190 L70,40Z" fill="#cfd6df" stroke="${OL}" stroke-width="8" stroke-linejoin="round"/>`;
  const eng = [-120, -10].map(ex => `<ellipse cx="${ex}" cy="90" rx="40" ry="22" fill="#9aa3b2" stroke="${OL}" stroke-width="6"/><ellipse cx="${ex + 44}" cy="90" rx="6" ry="${f(40 + 10 * Math.sin(p.t * 50))}" fill="#fff" opacity=".6"/>`).join('');
  const body = b + wing + eng;
  if (p.split <= 0) return `<g transform="translate(${f(x)},${f(y)}) scale(${s})">${body}</g>`;
  const id = ++uid, q = p.split;
  let g = `<clipPath id="pf${id}"><rect x="-60" y="-400" width="800" height="800"/></clipPath><clipPath id="pb${id}"><rect x="-800" y="-400" width="740" height="800"/></clipPath>`;
  g += `<g transform="translate(${f(60 * q)},${f(90 * q)}) rotate(${f(22 * q)})"><g clip-path="url(#pf${id})">${body}</g></g>`;
  g += `<g transform="translate(${f(-80 * q)},${f(160 * q)}) rotate(${f(-30 * q)})"><g clip-path="url(#pb${id})">${body}</g></g>`;
  for (let i = 0; i < 6; i++) { const a = i * 1.1 + p.t * 3; g += `<circle cx="${f(-40 + Math.cos(a) * 60 * q)}" cy="${f(60 * q + Math.sin(a) * 50 * q)}" r="${f(50 + 20 * Math.sin(p.t * 9 + i))}" fill="${i % 2 ? '#ff7a1a' : '#ffd23a'}" opacity=".85"/>`; }
  g += particles(16, 3, p.t, { x0: -300, x1: 300, y0: -100, y1: 600, speed: 300, size: 10, col: '#2b2b2b', op: .7 });
  return `<g transform="translate(${f(x)},${f(y)}) scale(${s})">${g}</g>`;
}
function bolt(x0, y0, x1, y1, seed) {
  const r = rng(seed); let d = `M${x0},${y0}`;
  for (let k = 1; k <= 8; k++) d += `L${f(lerp(x0, x1, k / 8) + (k < 8 ? (r() - .5) * 120 : 0))},${f(lerp(y0, y1, k / 8))}`;
  return `<path d="${d}" fill="none" stroke="#9fd8ff" stroke-width="40" opacity=".5" filter="url(#blur10)"/><path d="${d}" fill="none" stroke="#fff" stroke-width="14" stroke-linejoin="round"/>`;
}

VIEWS.hookFall = {
  draw(lv, vd, t, ctx) {
    let s = sky('#2f8fff', '#bfe8ff');
    for (let i = 0; i < 7; i++) { const r = rng(i + 3), y = ((r() * 2600 - t * (600 + 300 * r())) % 2600 + 2600) % 2600 - 300; s += cloud(r() * 1100, y, .8 + r() * .8, '#fff', .85); }
    s += canopy(lerp(1700, 1420, lv / vd), t, .9);
    for (let i = 0; i < 14; i++) { const r = rng(i + 50), x = r() * 1080, y = ((r() * 2000 - t * 1800) % 2000 + 2000) % 2000; s += `<path d="M${f(x)},${f(y)} l0,${f(120 + r() * 160)}" stroke="#fff" stroke-width="6" opacity=".6" stroke-linecap="round"/>`; }
    const rot = Math.sin(t * 2.2) * 14;
    const girl = guy({ ...JUL, x: 0, y: 0, s: 1, pose: 'armrest', eyes: 'squeeze', mouth: 'scream', mouthOpen: .8 + .2 * Math.sin(t * 8), brow: 'worried', hairWind: 1, t });
    s += `<g transform="translate(540,640) rotate(${f(rot)}) scale(.62)">${seat(girl)}</g>`;
    const s1 = ctx.segRel[1] ?? 9;
    if (lv > s1) s += comic(820, 430, '!!!', eBack((lv - s1) / .25), '#ff3b3b', 90);
    return s;
  }
};
VIEWS.plane = {
  draw(lv, vd, t, ctx) {
    let s = sky('#0b1446', '#4a3a8a') + stars(40, 0, 0, 1080, 1200, t, 4) + `<circle cx="880" cy="380" r="70" fill="#fff6d0"/><circle cx="880" cy="380" r="200" fill="url(#whiteGlow)" opacity=".3"/>`;
    for (let i = 0; i < 5; i++) { const r = rng(i + 9); s += cloud((((r() * 1600 - t * (80 + 60 * r())) % 1600) + 1600) % 1600 - 260, 500 + r() * 900, .7 + r() * .8, '#6c5fa8', .6); }
    s += plane(540, 820 + Math.sin(t * 1.5) * 12, .95, { t });
    for (let i = 0; i < 3; i++) { const r = rng(i + 30); s += cloud((((r() * 1800 - t * 260) % 1800) + 1800) % 1800 - 300, 1100 + r() * 200, 1.2, '#8f84c8', .8); }
    s += at(250, 430, pop(lv, .15), pill('24.12.1971', '#111427', '#ffe14a', 46, 82), -4);
    const s1 = ctx.segRel[1] ?? 9, k = pop(lv, s1 + .1);
    if (k > 0) {
      const id = ++uid;
      let inner = `<clipPath id="ic${id}"><circle r="150"/></clipPath><circle r="150" fill="#ffe3b0"/><g clip-path="url(#ic${id})">`;
      inner += guy({ ...MOM, x: -60, y: 20, s: .38, mouth: 'smile', t, legs: false }) + guy({ ...JUL, x: 60, y: 40, s: .36, mouth: 'smile', t, legs: false }) + '</g>';
      inner += `<circle r="150" fill="none" stroke="#fff" stroke-width="14"/><circle r="157" fill="none" stroke="${OL}" stroke-width="6"/>`;
      s += at(830, 480, k, inner) + at(830, 660, pop(lv, s1 + .3), pill('17 ЛЕТ', '#ff3b8a', '#fff', 40, 70));
    }
    return s;
  }
};
VIEWS.storm = {
  shakes: ctx => [[.3, 18, .4], [(ctx.segRel[1] ?? 2) + .3, 26, .6]],
  flash: (lv, ctx) => { const q = (lv - .3) / .3; return q > 0 && q < 1 ? .9 * (1 - q) : 0; },
  draw(lv, vd, t, ctx) {
    let s = sky('#0d1024', '#3a3f5c');
    for (let i = 0; i < 6; i++) { const r = rng(i + 70); s += cloud(r() * 1300 - 100, 200 + r() * 900, 1.2 + r(), '#22263d', .9); }
    const s1 = ctx.segRel[1] ?? 9, split = clamp((lv - s1 - .3) / 1.2);
    s += plane(540, 820 + Math.sin(t * 6) * (6 + 20 * split), .9, { t, split: eOut(split), lit: lv < .3 || Math.floor(t * 12) % 3, flick: 1 });
    if (lv > .3 && lv < .7) s += bolt(420, -100, 560, 780, 7);
    if (lv > s1 + .3 && lv < s1 + .5) s += bolt(700, -100, 520, 800, 9);
    let rain = ''; const r = rng(5); for (let i = 0; i < 60; i++) { const x = r() * 1300 - 100, y = ((r() * 2200 + t * 2400) % 2200) - 200; rain += `M${f(x)},${f(y)} l-30,90 `; }
    s += `<path d="${rain}" stroke="#9fb3d8" stroke-width="4" opacity=".5"/>`;
    return s + `<rect x="-700" y="-700" width="2480" height="3300" fill="url(#vigDark)"/>`;
  }
};
VIEWS.fallSeat = {
  flash: (lv, ctx) => { const q = (lv - (ctx.vd - .18)) / .18; return q > 0 ? .9 * q : 0; },
  draw(lv, vd, t) {
    const q = lv / vd;
    let s = sky('#5fb6ff', '#d9f4ff');
    for (let i = 0; i < 6; i++) { const r = rng(i + 13), y = ((r() * 2600 - t * 900) % 2600 + 2600) % 2600 - 300; s += cloud(r() * 1100, y, .7 + r() * .6, '#fff', .8); }
    const cs = lerp(.8, 2.6, eIn(q));
    s += `<g transform="translate(540,1900) scale(${f(cs * 100) / 100}) translate(-540,-1900)">${canopy(1450, t, 1)}</g>`;
    for (let i = 0; i < 16; i++) { const r = rng(i + 90), x = r() * 1080, y = ((r() * 2000 - t * 2600) % 2000 + 2000) % 2000; s += `<path d="M${f(x)},${f(y)} l0,${f(160 + r() * 200)}" stroke="#fff" stroke-width="7" opacity=".55" stroke-linecap="round"/>`; }
    const girl = guy({ ...JUL, x: 0, y: 0, s: 1, pose: 'armrest', eyes: 'squeeze', mouth: 'scream', brow: 'worried', hairWind: 1, t });
    s += `<g transform="translate(540,${f(620 + 60 * q)}) rotate(${f(t * 160)}) scale(${f(lerp(.5, .42, q) * 100) / 100})">${seat(girl)}</g>`;
    return s;
  }
};
VIEWS.wake = {
  draw(lv, vd, t, ctx) {
    let s = jungle(t, 7 + 2 * Math.sin(t * 2));
    const s1 = ctx.segRel[1] ?? 9, s2 = ctx.segRel[2] ?? 9;
    const calling = lv > s1 && lv < s2;
    const look = calling ? [Math.sin((lv - s1) * 7) * 16, -4] : [0, 4];
    s += guy({ ...JUL, x: 540, y: 820, s: 1.0, pose: 'down', tired: .6, red: .5, brow: 'worried', mouth: calling ? 'open' : 'sad', mouthOpen: .7, dirt: .8, look, lidL: .1, lidR: .45, legs: false, bandage: true, t, headRot: calling ? Math.sin((lv - s1) * 4) * 6 : 0 });
    s += leaf(-120, 1500, 1.6, -20, '#1d5a2c') + leaf(1250, 1560, 1.7, 200, '#26733a') + leaf(-80, 1250, 1.2, 10, '#2f8a44');
    if (calling) s += at(820, 470, pop(lv, s1), `<path d="M-150,-70 Q-150,-110 -110,-110 L110,-110 Q150,-110 150,-70 L150,40 Q150,80 110,80 L-40,80 L-90,130 L-80,80 L-110,80 Q-150,80 -150,40Z" fill="#fff" stroke="${OL}" stroke-width="8"/>` + txt(0, -14, 'МАМА?', 60, OL));
    if (lv > s2) {
      s += at(230, 470, pop(lv, s2 + .2), `<circle r="105" fill="#fff" stroke="${OL}" stroke-width="8"/><path d="M-70,-20 Q-30,-40 0,-20 Q30,-40 70,-20 L70,20 Q30,0 0,20 Q-30,0 -70,20Z" fill="#f2efe6" stroke="${OL}" stroke-width="6"/><path d="M-6,-30 L8,0 L-8,6 L6,34" stroke="#ff3b3b" stroke-width="9" fill="none" stroke-linejoin="round"/>`);
      s += at(850, 470, pop(lv, s2 + .9), `<circle r="105" fill="#fff" stroke="${OL}" stroke-width="8"/><circle cx="-40" cy="0" r="32" fill="#bfe6ff" stroke="${OL}" stroke-width="7"/><circle cx="40" cy="0" r="32" fill="#bfe6ff" stroke="${OL}" stroke-width="7"/><path d="M-8,-2 L8,-2" stroke="${OL}" stroke-width="7"/><path d="M-70,-70 L70,70 M70,-70 L-70,70" stroke="#ff3b3b" stroke-width="14" stroke-linecap="round"/>`);
    }
    return s + `<rect x="-700" y="-700" width="2480" height="3300" fill="url(#vigDark)" opacity=".7"/>`;
  }
};
VIEWS.father = {
  draw(lv, vd, t, ctx) {
    let a = sunburst('#e9d6a8', '#cdb07a', t * .05);
    a += guy({ ...DAD, x: 340, y: 800, s: .9, pose: 'point', mouth: 'smile', brow: 'neutral', look: [16, 0], t });
    const s1 = ctx.segRel[1] ?? 9, k = clamp((lv - s1) / 1.2);
    const km = pop(lv, s1 - .05);
    if (km > 0) a += `<g transform="translate(820,780) scale(${sc100(km)})"><circle r="230" fill="#fff8e6" stroke="${OL}" stroke-width="8"/>`;
    if (km > 0) {
    let river = 'M-120,-200'; for (let i = 1; i <= 8; i++) river += ` L${f(-120 + i * 25 + Math.sin(i * 1.3) * 50)},${-200 + i * 50}`;
    a += `<path d="${river}" fill="none" stroke="#3a8fe0" stroke-width="34" stroke-linecap="round" stroke-dasharray="600" stroke-dashoffset="${f(600 * (1 - k))}"/>`;
    a += `<path d="M60,140 l40,40 l40,-40 Z" fill="#ff3b3b" stroke="${OL}" stroke-width="6" opacity="${f(k)}"/><g transform="translate(110,170)" opacity="${f(clamp(k * 2 - 1))}"><path d="M-50,0 L0,-46 L50,0 L50,50 L-50,50Z" fill="#ffd23a" stroke="${OL}" stroke-width="7"/></g></g>`;
    }
    let s = `<g filter="url(#sepia)">${a}</g>`;
    const r = rng(Math.floor(t * 24)); for (let i = 0; i < 60; i++) s += `<circle cx="${f(r() * 1080)}" cy="${f(r() * 1920)}" r="${f(1 + r() * 2.5)}" fill="#000" opacity=".25"/>`;
    s += `<rect x="-700" y="-700" width="2480" height="3300" fill="#3a2a10" opacity="${f(.08 + .05 * Math.sin(t * 17))}"/>`;
    return s + `<rect x="-700" y="-700" width="2480" height="3300" fill="url(#vigDark)"/>`;
  }
};
VIEWS.river = {
  draw(lv, vd, t, ctx) {
    let s = jungle(t, 0);
    const wy = 1060;
    s += `<rect x="-700" y="${wy}" width="2480" height="2000" fill="#2a7f86"/>`;
    for (let i = 0; i < 9; i++) { const y = wy + 30 + i * 90, ph = t * 1.5 + i; s += `<path d="M${f(-100 + (ph * 80) % 300)},${y} q60,-16 120,0 t120,0 M${f(500 + (ph * 60) % 300)},${y + 40} q60,-16 120,0" fill="none" stroke="#9fe6e0" stroke-width="5" opacity=".5"/>`; }
    const bob = Math.sin(t * 3) * 8;
    s += guy({ ...JUL, x: 520, y: 760 + bob, s: .78, pose: 'out', tired: .8, red: .4, brow: 'worried', mouth: 'grit', dirt: 1, bandage: true, look: [14, 4], t, legs: false });
    s += `<rect x="-700" y="${wy + 90}" width="2480" height="2000" fill="#2a7f86" opacity=".88"/><ellipse cx="520" cy="${f(wy + 92 + bob)}" rx="${f(240 + 20 * Math.sin(t * 4))}" ry="22" fill="none" stroke="#c9fbf5" stroke-width="7" opacity=".8"/>`;
    const s1 = ctx.segRel[1] ?? 9, cx = lerp(1100, 820, clamp((lv - s1 + .2) / 2.5));
    s += `<g transform="translate(${f(cx)},${wy + 150})"><path d="M-120,10 Q-60,-30 0,0 Q60,-34 140,4 L180,14 L-140,18Z" fill="#3d5a2a" stroke="${OL}" stroke-width="6"/>${[-60, 30].map(ex => `<ellipse cx="${ex}" cy="-14" rx="26" ry="20" fill="#3d5a2a" stroke="${OL}" stroke-width="6"/><ellipse cx="${ex}" cy="-16" rx="12" ry="9" fill="#ffd23a"/><rect x="${ex - 2}" y="-24" width="4" height="16" fill="#111"/>`).join('')}</g>`;
    for (let i = 0; i < 3; i++) {
      const a = t * .9 + i * 2.1, x = 540 + Math.cos(a) * 300, y = 430 + Math.sin(a) * 90, w = 50 + 26 * Math.sin(t * 9 + i);
      s += `<path d="M${f(x - 70)},${f(y - w * .4)} Q${f(x - 30)},${f(y - w)} ${f(x)},${f(y)} Q${f(x + 30)},${f(y - w)} ${f(x + 70)},${f(y - w * .4)}" fill="none" stroke="#111" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" opacity="${f(clamp((lv - s1) * 2))}"/>`;
    }
    return s;
  }
};
const ARM = (x, y) => `<path d="M-700,${y + 330} Q${x - 200},${y + 120} ${x + 700},${y - 260} L${x + 900},${y + 120} Q${x - 100},${y + 440} -700,${y + 760}Z" fill="#f7c6a0" stroke="${OL}" stroke-width="10"/>`;
function wormsAt(cx, cy, t, out = 0) {
  let s = '';
  for (let i = 0; i < 7; i++) {
    const a = i / 7 * Math.PI * 2, d = 40 * Math.sqrt((i % 3 + 1) / 3) + out * 260, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * .6;
    let p = `M${f(x)},${f(y)}`;
    for (let k = 1; k <= 6; k++) p += ` L${f(x + Math.cos(a + 1.2) * k * 9 + Math.sin(t * 9 + i + k) * 7)},${f(y + Math.sin(a + 1.2) * k * 9 + Math.cos(t * 9 + i + k) * 7)}`;
    s += `<path d="${p}" fill="none" stroke="${OL}" stroke-width="20" stroke-linecap="round" stroke-linejoin="round" opacity="${f(1 - out)}"/><path d="${p}" fill="none" stroke="#f5ecd2" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" opacity="${f(1 - out)}"/>`;
  }
  return s;
}
VIEWS.wound = {
  draw(lv, vd, t) {
    let s = jungle(t, 12) + `<rect x="-700" y="-700" width="2480" height="3300" fill="#000" opacity=".45"/>`;
    s += ARM(540, 820);
    s += `<ellipse cx="560" cy="790" rx="150" ry="95" fill="#9c2a2a" stroke="${OL}" stroke-width="8"/><ellipse cx="560" cy="790" rx="110" ry="64" fill="#6d1515"/>`;
    s += wormsAt(560, 790, t);
    s += at(560, 790, clamp(lv / .3), `<circle r="300" fill="none" stroke="#fff" stroke-width="14"/><circle r="306" fill="none" stroke="${OL}" stroke-width="6"/>`);
    return s + `<rect x="-700" y="-700" width="2480" height="3300" fill="url(#vigDark)"/>`;
  }
};
VIEWS.gas = {
  draw(lv, vd, t) {
    let s = jungle(t, 12) + `<rect x="-700" y="-700" width="2480" height="3300" fill="#000" opacity=".45"/>`;
    s += ARM(540, 900);
    const pour = clamp((lv - .4) / .3), out = clamp((lv - .8) / 1.4);
    s += `<ellipse cx="560" cy="870" rx="150" ry="95" fill="#9c2a2a" stroke="${OL}" stroke-width="8"/><ellipse cx="560" cy="870" rx="110" ry="64" fill="${mix('#6d1515', '#c9a23a', pour * .5)}"/>`;
    s += wormsAt(560, 870, t, out);
    if (pour > 0) s += `<path d="M700,${f(560)} Q640,700 ${f(580 + Math.sin(t * 20) * 8)},860" fill="none" stroke="#ffd84a" stroke-width="${f(26 * pour)}" opacity=".85" stroke-linecap="round"/>` + particles(12, 4, t, { x0: 480, x1: 660, y0: 700, y1: 860, speed: 200, size: 6, col: '#fff3b0', op: .8, up: true });
    s += at(760, 470, eOut(lv / .4), `<rect x="-120" y="-150" width="240" height="300" rx="30" fill="#d42a2a" stroke="${OL}" stroke-width="9"/><rect x="-60" y="-200" width="70" height="60" rx="10" fill="#9aa3b2" stroke="${OL}" stroke-width="7"/><path d="M-80,-80 L80,80 M80,-80 L-80,80" stroke="#a81d1d" stroke-width="14"/>${txt(0, 110, 'БЕНЗИН', 34, '#fff')}`, lerp(0, -55, eOut(lv / .5)));
    s += at(230, 450, pop(lv, .2), `<circle r="150" fill="#ffe3b0" stroke="#fff" stroke-width="14"/><clipPath id="gf${++uid}"><circle r="150"/></clipPath><g clip-path="url(#gf${uid})">${guy({ ...JUL, x: 0, y: 40, s: .55, eyes: 'squeeze', mouth: 'grit', brow: 'worried', dirt: 1, legs: false, t, sweat: 2 })}</g><circle r="157" fill="none" stroke="${OL}" stroke-width="6"/>`);
    return s + `<rect x="-700" y="-700" width="2480" height="3300" fill="url(#vigDark)"/>`;
  }
};
VIEWS.rescue = {
  draw(lv, vd, t) {
    let s = sky('#ff9a5a', '#ffe0a8') + `<circle cx="760" cy="620" r="320" fill="url(#sunGlow)"/><circle cx="760" cy="640" r="100" fill="#fff3c0"/>`;
    s += `<path d="M-700,900 Q200,820 540,880 T1780,860 L1780,1100 L-700,1100Z" fill="#2f6b34"/>`;
    s += `<rect x="-700" y="1080" width="2480" height="1600" fill="#4a8f8a"/>`;
    for (let i = 0; i < 6; i++) s += `<path d="M${f(-100 + i * 220 + (t * 30) % 220)},${1130 + i * 30} q60,-14 120,0" fill="none" stroke="#bff2ea" stroke-width="5" opacity=".6"/>`;
    s += `<g transform="translate(250,900)"><path d="M-200,0 L0,-170 L200,0Z" fill="#c9a05a" stroke="${OL}" stroke-width="8"/><path d="M-160,0 L160,0 L160,170 L-160,170Z" fill="#8a5a36" stroke="${OL}" stroke-width="8"/><rect x="-40" y="60" width="80" height="110" fill="#3a2414"/>${[-140, 0, 140].map(x => `<rect x="${x - 8}" y="170" width="16" height="120" fill="#5a3a26"/>`).join('')}</g>`;
    s += `<path d="M120,1150 Q300,1190 480,1150 L450,1185 Q300,1210 150,1185Z" fill="#7a4a26" stroke="${OL}" stroke-width="6"/>`;
    const walk = eOut(lv / (vd * .8));
    for (let i = 0; i < 3; i++) {
      const x = lerp(1200 + i * 140, 700 + i * 120, walk), y = 960 + Math.abs(Math.sin(t * 6 + i)) * -10;
      s += `<g transform="translate(${f(x)},${f(y)})"><circle cx="0" cy="-160" r="40" fill="#1a1a24"/><path d="M-60,-176 L60,-176 L40,-206 L-40,-206Z" fill="#1a1a24"/><path d="M-50,-110 L50,-110 L40,40 L-40,40Z" fill="#1a1a24"/><path d="M-30,40 L-40,140 M30,40 L40,140" stroke="#1a1a24" stroke-width="30" stroke-linecap="round"/></g>`;
    }
    s += guy({ ...JUL, x: 470, y: 1050, s: .42, pose: 'wave', mouth: 'smile', tired: .6, dirt: 1, bandage: true, look: [14, -6], t });
    s += particles(16, 8, t, { x0: 300, x1: 900, y0: 600, y1: 1100, speed: 60, size: 5, col: '#fff6c8', op: .8, up: true });
    return s;
  }
};
VIEWS.grid = {
  draw(lv, vd, t) {
    let s = sunburst('#1fb58f', '#0b7f68', t * .1);
    const cols = 10, w = 84, x0 = 540 - (cols - 1) * w / 2, y0 = 370;
    const shown = Math.min(92, Math.floor(clamp(lv / 1.4) * 92));
    for (let i = 0; i < 92; i++) {
      if (i >= shown) break;
      const cx = x0 + (i % cols) * w, cy = y0 + Math.floor(i / cols) * 92, me = i === 57, lit = me && lv > 1.5;
      const col = lit ? '#ffe14a' : '#16443a', k = lit ? 1 + .35 * (1 - eOut((lv - 1.5) / .3)) : 1;
      s += `<g transform="translate(${f(cx)},${f(cy)}) scale(${f(k * 100) / 100})"><circle cx="0" cy="-18" r="15" fill="${col}" stroke="${OL}" stroke-width="${lit ? 5 : 0}"/><path d="M-22,30 Q-22,0 0,0 Q22,0 22,30Z" fill="${col}" stroke="${OL}" stroke-width="${lit ? 5 : 0}"/></g>`;
    }
    if (lv > 1.5) s += at(540, 1190, pop(lv, 1.55), pill('1 ИЗ 92', '#111427', '#ffe14a', 60, 100));
    return s;
  }
};
VIEWS.ctaGirl = {
  draw(lv, vd, t) {
    let s = sunburst('#ff4f8a', '#c81a5a', t * .12);
    s += guy({ ...JUL, x: 540, y: 740, s: 1.35, mouth: 'smile', tired: .3, bandage: true, dirt: .4, legs: false, t });
    [[180, 470, 0], [900, 460, .12], [920, 700, .24]].forEach(([x, y, d], i) => { s += at(x, y + Math.sin(t * 4 + i) * 12, pop(lv, .1 + d), txt(0, 0, '?', 130 - i * 16, '#fff', { stroke: OL, sw: 16 }), 12 * Math.sin(t * 3 + i)); });
    return s;
  }
};
