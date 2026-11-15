// «438 дней в океане» — картинки сцен.
const SAL = { skin: '#d9a273', skinD: '#c08758', hair: '#1d1612', hairD: '#120c09', beard: '#2a201a', shirt: '#ffd166', browCol: '#120c09', blush: .2, irisCol: '#3a2412' };
const SAL_LATE = { ...SAL, hairStyle: 'long', shirt: '#c9a24a', messy: 1, dirt: .7, tired: .8 };
const EZE = { skin: '#c98e5e', skinD: '#b07848', hair: '#16100c', hairD: '#0e0906', shirt: '#e5484d', browCol: '#16100c', blush: .2 };

function skyG(c1, c2) { const id = ++uid; return `<linearGradient id="og${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient><rect x="-700" y="-700" width="2480" height="3300" fill="url(#og${id})"/>`; }
function sea(hy, t, o = {}) {
  const p = Object.assign({ c1: '#1f8fd6', c2: '#0b4f8a', line: '#bfe9ff', speed: 40 }, o);
  const id = ++uid;
  let s = `<linearGradient id="sea${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.c1}"/><stop offset="1" stop-color="${p.c2}"/></linearGradient><rect x="-700" y="${hy}" width="2480" height="3000" fill="url(#sea${id})"/>`;
  const r = rng(hy | 0);
  for (let i = 0; i < 26; i++) {
    const z = i / 26, y = hy + 12 + z * z * 1100, w = 20 + z * 90, x = ((r() * 1400 + t * p.speed * (1 + z * 2)) % 1400) - 160;
    s += `<path d="M${f(x)},${f(y)} q${f(w / 2)},${f(-6 - z * 12)} ${f(w)},0" fill="none" stroke="${p.line}" stroke-width="${f(2 + z * 6)}" stroke-linecap="round" opacity="${f(.35 + z * .4)}"/>`;
  }
  return s;
}
function waveFront(y, amp, t, col, speed = 1.5, len = 260) {
  let d = `M-700,${y + 600} L-700,${y}`;
  for (let x = -700; x <= 1800; x += 20) d += ` L${x},${f(y + Math.sin(x / len * Math.PI * 2 + t * speed) * amp)}`;
  return `<path d="${d} L1800,${y + 600}Z" fill="${col}" stroke="${OL}" stroke-width="7"/>`;
}
function boat(x, y, s, rot = 0, inner = '') { // inner — то, что сидит в лодке (рисуется до борта)
  const hull = `<path d="M-430,0 L430,0 Q410,90 350,170 L-320,170 Q-400,110 -430,0Z" fill="#f4f6f8" stroke="${OL}" stroke-width="9" stroke-linejoin="round"/><path d="M-418,46 L414,46 L400,82 L-404,82Z" fill="#2f7fd6"/><path d="M-430,0 L430,0" stroke="${OL}" stroke-width="14" stroke-linecap="round"/>`;
  const motor = `<rect x="-520" y="-80" width="90" height="120" rx="18" fill="#3a3f4f" stroke="${OL}" stroke-width="8"/><rect x="-490" y="40" width="30" height="120" fill="#2a2e3a" stroke="${OL}" stroke-width="6"/>`;
  return `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)}) scale(${s})">${inner}${motor}${hull}</g>`;
}
function fish(x, y, s, rot, t) {
  const w = Math.sin(t * 18) * 14;
  return `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot + w * .3)}) scale(${s})"><path d="M-120,0 Q-40,-70 80,0 Q-40,70 -120,0Z" fill="#7fc7d9" stroke="${OL}" stroke-width="7"/><path d="M70,0 L140,${f(-50 + w)} L140,${f(50 + w)}Z" fill="#5aa9c0" stroke="${OL}" stroke-width="7" stroke-linejoin="round"/><circle cx="-70" cy="-10" r="10" fill="#fff" stroke="${OL}" stroke-width="4"/><circle cx="-68" cy="-10" r="4" fill="${OL}"/><path d="M-20,-30 Q0,0 -20,30" fill="none" stroke="${OL}" stroke-width="4" opacity=".5"/></g>`;
}
function bezier(p0, p1, p2, p3, q) {
  const u = 1 - q; return [0, 1].map(i => u * u * u * p0[i] + 3 * u * u * q * p1[i] + 3 * u * q * q * p2[i] + q * q * q * p3[i]);
}
const ROUTE = [[870, 760], [640, 640], [420, 940], [150, 820]];
function mapBase(t) {
  let s = BG('#1a6fb5');
  let grid = ''; for (let x = -100; x < 1200; x += 120) grid += `M${x},-200 L${x},2200 `; for (let y = -100; y < 2200; y += 120) grid += `M-200,${y} L1300,${y} `;
  s += `<path d="${grid}" stroke="#6fb6ef" stroke-width="3" opacity=".35"/>`;
  for (let i = 0; i < 6; i++) { const y = 420 + i * 120, x = ((t * 60 + i * 170) % 1300) - 100; s += `<path d="M${f(1100 - x)},${y} l-80,0 m14,-14 l-14,14 l14,14" fill="none" stroke="#bfe9ff" stroke-width="6" stroke-linecap="round" opacity=".45"/>`; }
  s += `<path d="M880,300 Q840,420 900,520 Q860,620 900,700 Q880,760 980,820 Q1060,900 1200,880 L1300,1300 L1300,200 Z" fill="#c9a36a" stroke="${OL}" stroke-width="8"/><path d="M960,380 Q1000,480 980,600" fill="none" stroke="#9b7a46" stroke-width="10" opacity=".5"/>`;
  s += at(1010, 600, 1, pill('МЕКСИКА', '#111427', '#fff', 30, 56), -80);
  return s;
}

VIEWS.hookSea = {
  draw(lv, vd, t, ctx) {
    let s = skyG('#7fd0ff', '#e8f7ff') + `<circle cx="820" cy="300" r="240" fill="url(#sunGlow)"/><circle cx="820" cy="300" r="70" fill="#fff6d0"/>`;
    const zoom = lerp(1.5, .95, eOut(lv / vd));
    let inner = sea(700, t) + boat(540, 860, .32, Math.sin(t * 1.6) * 4, guy({ ...SAL_LATE, x: 0, y: -417, s: .62, mouth: 'flat', look: [0, 6], legs: false, t }));
    s += `<g transform="translate(540,860) scale(${f(zoom * 100) / 100}) translate(-540,-860)">${inner}</g>`;
    const s1 = ctx.segRel[1] ?? 9;
    if (lv > s1) { const k = eBack((lv - s1) / .3), pulse = 1 + .06 * Math.sin(t * 8); s += `<circle cx="540" cy="820" r="${f(190 * k * pulse)}" fill="none" stroke="#ff3b3b" stroke-width="12"/>` + at(540, 1080, pop(lv, s1 + .15), pill('ОДИН', '#ff3b3b', '#fff', 48, 80)); }
    return s;
  }
};
VIEWS.dock = {
  draw(lv, vd, t, ctx) {
    let s = skyG('#5fc2ff', '#dff6ff') + `<circle cx="860" cy="330" r="220" fill="url(#sunGlow)"/>`;
    s += sea(820, t, { speed: 25 });
    s += `<path d="M-700,1150 Q-100,1060 300,1100 Q420,1110 460,1300 L-700,1300Z" fill="#f0d39a" stroke="${OL}" stroke-width="7"/>`;
    s += `<path d="M120,1110 Q90,800 170,560" fill="none" stroke="${OL}" stroke-width="40" stroke-linecap="round"/><path d="M120,1110 Q90,800 170,560" fill="none" stroke="#8a5a36" stroke-width="26" stroke-linecap="round"/>`;
    for (let i = 0; i < 6; i++) { const a = -2.6 + i * .7 + Math.sin(t * 1.5 + i) * .05; s += `<path d="M170,560 Q${f(170 + Math.cos(a) * 160)},${f(560 + Math.sin(a) * 160 - 60)} ${f(170 + Math.cos(a) * 300)},${f(560 + Math.sin(a) * 300 + 40)}" fill="none" stroke="${OL}" stroke-width="36" stroke-linecap="round"/><path d="M170,560 Q${f(170 + Math.cos(a) * 160)},${f(560 + Math.sin(a) * 160 - 60)} ${f(170 + Math.cos(a) * 300)},${f(560 + Math.sin(a) * 300 + 40)}" fill="none" stroke="#3aa84a" stroke-width="24" stroke-linecap="round"/>`; }
    const bob = Math.sin(t * 2) * 8;
    s += boat(640, 1000 + bob, .7, Math.sin(t * 1.4) * 2,
      guy({ ...SAL, x: -170, y: -417, s: .62, pose: 'wave', mouth: 'smile', look: [0, 0], legs: false, t }) + guy({ ...EZE, x: 190, y: -387, s: .58, mouth: 'smile', look: [-8, 0], legs: false, t }));
    s += at(250, 430, pop(lv, .15), `<path d="M0,40 C-60,-20 -50,-110 0,-110 C50,-110 60,-20 0,40Z" fill="#ff3b3b" stroke="${OL}" stroke-width="8"/><circle cx="0" cy="-62" r="20" fill="#fff" stroke="${OL}" stroke-width="5"/><g transform="translate(0,90)">${pill('МЕКСИКА', '#111427', '#fff', 40, 70)}</g>`);
    const s1 = ctx.segRel[1] ?? 9;
    s += at(830, 470, pop(lv, s1 + .3), `<circle r="100" fill="#fff" stroke="${OL}" stroke-width="9"/><path d="M0,0 L0,-66 M0,0 L46,30" stroke="${OL}" stroke-width="12" stroke-linecap="round"/><g transform="translate(0,150)">${pill('30 ЧАСОВ', '#2f61b8', '#fff', 40, 70)}</g>`);
    return s;
  }
};
VIEWS.storm = {
  shakes: () => [[.25, 16, .4]],
  flash: lv => { const q = (lv - .25) / .3; return q > 0 && q < 1 ? .85 * (1 - q) : 0; },
  draw(lv, vd, t, ctx) {
    let s = skyG('#0b1020', '#33405c');
    for (let i = 0; i < 6; i++) { const r = rng(i + 4); s += `<path d="${blob(i + 60, 220 + r() * 120, 10, .25)}" transform="translate(${f(r() * 1300 - 100)},${f(150 + r() * 500)})" fill="#1c2236" opacity=".95"/>`; }
    if (lv > .25 && lv < .55) { const r = rng(3); let d = 'M380,-100'; for (let k = 1; k <= 7; k++) d += `L${f(380 + k * 25 + (r() - .5) * 120)},${f(-100 + k * 110)}`; s += `<path d="${d}" fill="none" stroke="#fff" stroke-width="14"/>`; }
    s += sea(820, t, { c1: '#1d4f6e', c2: '#0b2236', line: '#8fb8d0', speed: 120 });
    const rot = Math.sin(t * 2.6) * 18, by = 900 + Math.sin(t * 2.6 + 1) * 50;
    s += boat(540, by, .62, rot, guy({ ...SAL, x: -170, y: -417, s: .62, mouth: 'scream', eyes: 'open', pupil: 'tiny', brow: 'raised', sweat: 2, legs: false, t }) + guy({ ...EZE, x: 190, y: -387, s: .58, mouth: 'open', pupil: 'tiny', brow: 'worried', sweat: 2, legs: false, t }));
    s += waveFront(1120, 70, t, '#1d4f6e', 2.4, 300) + waveFront(1220, 50, t + 1, '#163e58', 3, 220);
    let rain = ''; const r = rng(8); for (let i = 0; i < 70; i++) { const x = r() * 1300 - 100, y = ((r() * 2200 + t * 2600) % 2200) - 200; rain += `M${f(x)},${f(y)} l-36,100 `; }
    s += `<path d="${rain}" stroke="#a9c4e0" stroke-width="4" opacity=".5"/>`;
    const s1 = ctx.segRel[1] ?? 9;
    if (lv > s1) s += at(830, 470, pop(lv, s1 + .1), `<rect x="-60" y="-110" width="120" height="220" rx="20" fill="#2b2f45" stroke="${OL}" stroke-width="8"/><rect x="-20" y="-170" width="16" height="70" fill="${OL}"/><rect x="-42" y="-80" width="84" height="70" rx="8" fill="#5a6a5a"/><circle cx="0" cy="40" r="26" fill="#1a1d2c"/><circle cx="62" cy="-100" r="42" fill="#ff3b3b" stroke="${OL}" stroke-width="6"/><path d="M44,-118 L80,-82 M80,-118 L44,-82" stroke="#fff" stroke-width="10" stroke-linecap="round"/>`, 6 * Math.sin(t * 9));
    return s + `<rect x="-700" y="-700" width="2480" height="3300" fill="url(#vigDark)"/>`;
  }
};
VIEWS.map = {
  draw(lv, vd, t) {
    let s = mapBase(t);
    const q = eInOut(lv / vd) * .55, n = 40;
    let d = `M${ROUTE[0]}`; for (let i = 1; i <= n; i++) d += ` L${bezier(...ROUTE, q * i / n).map(f)}`;
    s += `<path d="${d}" fill="none" stroke="#fff" stroke-width="10" stroke-dasharray="4 18" stroke-linecap="round"/>`;
    const [bx, by] = bezier(...ROUTE, q);
    s += at(bx, by, 1, `<path d="M-40,0 L40,0 L30,22 L-30,22Z" fill="#fff" stroke="${OL}" stroke-width="6"/><circle r="70" fill="none" stroke="#ffe14a" stroke-width="6" opacity="${f(.5 + .5 * Math.sin(t * 8))}"/>`, Math.sin(t * 3) * 6);
    s += at(420, 470, pop(lv, .3), pill('ТИХИЙ ОКЕАН', '#111427', '#bfe9ff', 40, 72));
    return s;
  }
};
VIEWS.catch = {
  draw(lv, vd, t) {
    let s = skyG('#ffb36b', '#ffe6b8') + `<circle cx="760" cy="420" r="300" fill="url(#sunGlow)"/>`;
    s += sea(760, t, { c1: '#2a8fc4', c2: '#0e4f7a' });
    const grab = lv > .3;
    s += boat(520, 1120, .95, 0, guy({ ...SAL, beard: '#2a201a', messy: .6, tired: .5, dirt: .3, x: 0, y: -571, s: .82, pose: grab ? 'hold' : 'out', mouth: grab ? 'grit' : 'open', brow: 'angry', look: [0, 10], legs: false, t }));
    if (grab) s += fish(520, 1120 - 520 * .95 + 600 * .82 * .95 - 20, .9, -10, t) + particles(14, 5, t, { x0: 360, x1: 700, y0: 820, y1: 1120, speed: 300, size: 8, col: '#cfefff', op: .8, up: true });
    s += waveFront(1180, 18, t, '#2a8fc4', 1.5, 180);
    return s;
  }
};
VIEWS.turtle = {
  draw(lv, vd, t, ctx) {
    let s = sunburst('#d6402f', '#8f1d14', t * .1);
    let tur = `<ellipse cx="0" cy="0" rx="190" ry="150" fill="#5a8f3a" stroke="${OL}" stroke-width="9"/><path d="${blob(3, 110, 6, .1)}" fill="#7fb04a" stroke="${OL}" stroke-width="6"/><path d="M-60,-60 L60,60 M60,-60 L-60,60 M0,-110 L0,110 M-110,0 L110,0" stroke="${OL}" stroke-width="5" opacity=".35"/>`;
    for (const [x, y, r] of [[-190, -90, -30], [190, -90, 30], [-170, 110, 30], [170, 110, -30]]) tur = `<ellipse cx="${x}" cy="${y}" rx="70" ry="34" transform="rotate(${r},${x},${y})" fill="#8fc06a" stroke="${OL}" stroke-width="7"/>` + tur;
    tur += `<ellipse cx="0" cy="-185" rx="56" ry="64" fill="#8fc06a" stroke="${OL}" stroke-width="7"/><circle cx="-20" cy="-200" r="9" fill="${OL}"/><circle cx="20" cy="-200" r="9" fill="${OL}"/>`;
    s += at(540, 720, pop(lv, .05), tur, Math.sin(t * 2) * 5);
    s += at(820, 470, pop(lv, .4), `<path d="M0,-90 C40,-30 60,10 60,40 A60,60 0 0 1 -60,40 C-60,10 -40,-30 0,-90Z" fill="#c8102e" stroke="${OL}" stroke-width="8"/><path d="M-26,20 Q-30,50 -6,64" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".6"/>`);
    s += at(250, 470, pop(lv, .2), `<path d="${blob(9, 90, 8, .2)}" fill="#fff" stroke="${OL}" stroke-width="7"/>` + [-40, 0, 40].map((x, i) => `<path transform="translate(${x},${f(110 + ((t * 160 + i * 40) % 80))})" d="M0,-18 C10,-5 13,4 13,10 A13,13 0 0 1 -13,10 C-13,4 -10,-5 0,-18Z" fill="#7fd3ff" stroke="${OL}" stroke-width="4"/>`).join(''));
    return s;
  }
};
VIEWS.night = {
  draw(lv, vd, t, ctx) {
    let s = skyG('#03061a', '#16224a') + stars(50, 0, 0, 1080, 700, t, 7) + `<circle cx="780" cy="330" r="80" fill="#f4f1d8"/><circle cx="780" cy="330" r="260" fill="url(#whiteGlow)" opacity=".25"/>`;
    s += sea(760, t, { c1: '#12305a', c2: '#050d22', line: '#6f8fc0', speed: 20 });
    s += `<path d="M720,770 L840,770 L960,1400 L600,1400Z" fill="#f4f1d8" opacity=".12"/>`;
    const s1 = ctx.segRel[1] ?? 9, talking = lv > s1;
    const mouth = talking && Math.floor(t * 7) % 2 ? 'open' : 'flat';
    const body = `<path d="M40,-40 Q60,-150 200,-150 Q340,-150 380,-40 Z" fill="#8a8f9e" stroke="${OL}" stroke-width="8"/><path d="M90,-60 Q200,-110 330,-60" fill="none" stroke="#6a6f7e" stroke-width="8"/>`;
    s += boat(540, 1000 + Math.sin(t * 1.3) * 6, .78, Math.sin(t) * 2, guy({ ...SAL_LATE, x: -200, y: -433, s: .64, mouth, mouthOpen: .5, brow: 'worried', lid: .45, look: [16, 6], legs: false, t, headRot: 4 }) + body);
    if (talking) s += at(700, 560, pop(lv, s1 + .2), `<path d="M-110,-60 Q-110,-90 -80,-90 L80,-90 Q110,-90 110,-60 L110,10 Q110,40 80,40 L-30,40 L-80,90 L-60,40 L-80,40 Q-110,40 -110,10Z" fill="#fff" stroke="${OL}" stroke-width="7" opacity=".9"/>` + txt(0, -24, '...', 70, OL));
    return s + `<rect x="-700" y="-700" width="2480" height="3300" fill="url(#vigDark)"/>`;
  }
};
VIEWS.release = {
  draw(lv, vd, t) {
    let s = skyG('#03061a', '#1c2a58') + stars(50, 0, 0, 1080, 650, t, 7) + `<circle cx="780" cy="300" r="80" fill="#f4f1d8"/><circle cx="780" cy="300" r="300" fill="url(#whiteGlow)" opacity=".3"/>`;
    s += sea(700, t, { c1: '#16386a', c2: '#06102a', line: '#7f9fd0', speed: 15 });
    s += `<path d="M720,710 L840,710 L1000,1300 L560,1300Z" fill="#f4f1d8" opacity=".14"/>`;
    for (let i = 0; i < 4; i++) { const q = ((lv * .5 + i * .25) % 1); s += `<ellipse cx="760" cy="860" rx="${f(40 + 260 * q)}" ry="${f(10 + 60 * q)}" fill="none" stroke="#cfe0ff" stroke-width="6" opacity="${f(.7 * (1 - q))}"/>`; }
    s += boat(360, 820 + Math.sin(t * 1.3) * 6, .55, Math.sin(t) * 2, guy({ ...SAL_LATE, x: 0, y: -433, s: .64, mouth: 'sad', brow: 'worried', eyes: 'closed', tears: 1, legs: false, t, headRot: 8 }));
    s += particles(16, 3, t, { x0: 600, x1: 920, y0: 600, y1: 900, speed: 40, size: 4, col: '#e8f2ff', op: .7, up: true });
    return s + `<rect x="-700" y="-700" width="2480" height="3300" fill="url(#vigDark)"/>`;
  }
};
VIEWS.ship = {
  draw(lv, vd, t, ctx) {
    let s = skyG('#8fc6e8', '#e8f2f2');
    s += sea(820, t, { c1: '#3a8fc0', c2: '#145480', speed: 25 });
    const sx = lerp(1500, -700, lv / (vd + 1.5));
    let ship = `<path d="M-520,0 L520,0 L470,110 L-470,110Z" fill="#2b3550" stroke="${OL}" stroke-width="8"/><rect x="340" y="-150" width="130" height="150" fill="#e8ecf2" stroke="${OL}" stroke-width="7"/><rect x="380" y="-200" width="34" height="50" fill="#d42a2a" stroke="${OL}" stroke-width="6"/>`;
    const cc = ['#e5484d', '#2f9bff', '#ffd23a', '#3aa84a', '#ff8a1f'];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 9; c++) ship += `<rect x="${-470 + c * 88}" y="${-50 - r * 50}" width="84" height="48" fill="${cc[(r * 3 + c * 7) % 5]}" stroke="${OL}" stroke-width="4"/>`;
    s += `<g transform="translate(${f(sx)},790) scale(.62)">${ship}</g>`;
    const s1 = ctx.segRel[1] ?? 9, shouting = lv > s1 - .2;
    s += boat(330, 1120 + Math.sin(t * 1.6) * 6, .78, Math.sin(t * 1.2) * 3, guy({ ...SAL_LATE, x: 0, y: -448, s: .66, pose: shouting ? 'wave' : 'down', mouth: shouting ? 'scream' : 'open', mouthOpen: .8, brow: 'raised', look: [16, -6], sweat: 2, legs: false, t }));
    if (shouting) s += comic(640, 560, 'ЭЙ!', eBack((lv - s1 + .2) / .25) * (1 + .05 * Math.sin(t * 12)), '#ffe14a', 90);
    return s;
  }
};
VIEWS.island = {
  draw(lv, vd, t) {
    let s = skyG('#ff9a5a', '#ffe8b0') + `<circle cx="540" cy="520" r="340" fill="url(#sunGlow)"/><circle cx="540" cy="560" r="110" fill="#fff3c0"/>`;
    const k = lerp(.8, 1.15, eOut(lv / vd));
    let isl = `<path d="M-460,40 Q-200,-90 0,-80 Q240,-90 470,40Z" fill="#f2d39a" stroke="${OL}" stroke-width="8"/>`;
    for (const [x, h, lean] of [[-180, 300, -12], [20, 380, 6], [230, 280, 16]]) {
      isl += `<path d="M${x},-60 Q${x + lean * 3},${-60 - h / 2} ${x + lean * 6},${-60 - h}" fill="none" stroke="${OL}" stroke-width="30" stroke-linecap="round"/><path d="M${x},-60 Q${x + lean * 3},${-60 - h / 2} ${x + lean * 6},${-60 - h}" fill="none" stroke="#8a5a36" stroke-width="18" stroke-linecap="round"/>`;
      for (let i = 0; i < 5; i++) { const a = -2.8 + i * .65 + Math.sin(t * 2 + i) * .06, tx = x + lean * 6, ty = -60 - h; isl += `<path d="M${tx},${ty} Q${f(tx + Math.cos(a) * 90)},${f(ty + Math.sin(a) * 90 - 40)} ${f(tx + Math.cos(a) * 170)},${f(ty + Math.sin(a) * 170 + 30)}" fill="none" stroke="${OL}" stroke-width="30" stroke-linecap="round"/><path d="M${tx},${ty} Q${f(tx + Math.cos(a) * 90)},${f(ty + Math.sin(a) * 90 - 40)} ${f(tx + Math.cos(a) * 170)},${f(ty + Math.sin(a) * 170 + 30)}" fill="none" stroke="#3aa84a" stroke-width="20" stroke-linecap="round"/>`; }
    }
    s += sea(860, t, { c1: '#2fb3c9', c2: '#0e5f8a' });
    s += `<g transform="translate(540,880) scale(${f(k * 100) / 100})">${isl}</g>`;
    s += boat(540, 1180 + Math.sin(t * 1.5) * 8, .7, Math.sin(t) * 2, guy({ ...SAL_LATE, x: 0, y: -417, s: .62, pose: 'wave', mouth: 'smile', brow: 'raised', tears: 1, look: [0, -10], legs: false, t }));
    s += particles(16, 9, t, { x0: 200, x1: 900, y0: 400, y1: 1000, speed: 50, size: 5, col: '#fff6c8', op: .8, up: true });
    return s;
  }
};
VIEWS.mapEnd = {
  draw(lv, vd, t) {
    let s = mapBase(t);
    const q = lerp(.55, 1, eInOut(lv / (vd * .7))), n = 50;
    let d = `M${ROUTE[0]}`; for (let i = 1; i <= n; i++) d += ` L${bezier(...ROUTE, q * i / n).map(f)}`;
    s += `<path d="${d}" fill="none" stroke="#fff" stroke-width="10" stroke-dasharray="4 18" stroke-linecap="round"/>`;
    s += `<circle cx="150" cy="820" r="${f(30 + 8 * Math.sin(t * 6))}" fill="#3aa84a" stroke="${OL}" stroke-width="7"/>` + at(200, 700, pop(lv, .2), pill('МАРШАЛЛОВЫ О-ВА', '#111427', '#fff', 28, 54));
    const [bx, by] = bezier(...ROUTE, q);
    s += at(bx, by, 1, `<path d="M-40,0 L40,0 L30,22 L-30,22Z" fill="#fff" stroke="${OL}" stroke-width="6"/>`);
    const km = Math.round(10800 * eOut(lv / (vd * .8)) / 100) * 100;
    s += at(540, 470, pop(lv, .1), `<rect x="-230" y="-62" width="460" height="124" rx="30" fill="#111427" stroke="${OL}" stroke-width="8"/>` + txt(0, 2, km.toLocaleString('ru-RU') + ' КМ', 76, '#ffe14a'));
    return s;
  }
};
VIEWS.cta = {
  draw(lv, vd, t, ctx) {
    let s = sunburst('#1fb6ff', '#0b6fb0', t * .12);
    s += guy({ ...SAL_LATE, x: 540, y: 740, s: 1.3, mouth: 'smile', tired: .5, legs: false, t });
    s += at(230, 450, pop(lv, .1), pill('438 ДНЕЙ', '#111427', '#ffe14a', 50, 90), -6);
    const s1 = ctx.segRel[1] ?? 9;
    [[870, 440, 0], [930, 660, .15]].forEach(([x, y, d], i) => { s += at(x, y + Math.sin(t * 4 + i) * 12, pop(lv, s1 + d), txt(0, 0, '?', 130, '#fff', { stroke: OL, sw: 16 }), 12 * Math.sin(t * 3 + i)); });
    return s;
  }
};
