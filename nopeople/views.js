// «Что, если все люди исчезнут» — картинки сцен.
const GROUND = 1250;
const BLD = [[-80, 230, 560, '#7a86a8'], [140, 180, 720, '#8e9ac0'], [310, 200, 470, '#6d7898'], [495, 160, 830, '#9aa6c8'], [645, 210, 600, '#7f8bad'], [845, 165, 750, '#8a96b8'], [1000, 210, 520, '#6d7898']];

function skyG(c1, c2) { const id = ++uid; return `<linearGradient id="np${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient><rect x="-700" y="-700" width="2480" height="3300" fill="url(#np${id})"/>`; }
function city(t, o = {}) {
  const p = Object.assign({ night: 0, lit: 0, vines: 0, ruin: 0, litFn: null, y: GROUND, sc: 1 }, o);
  let s = '';
  BLD.forEach(([x, w, h, col], i) => {
    const top = p.y - h, c = mix(col, '#1a1f3a', p.night * .7);
    let shape;
    if (p.ruin > 0 && i % 2 === 0) {
      const d = h * .25 * p.ruin; shape = `M${x},${p.y} L${x},${top + d * .3} L${x + w * .3},${top + d} L${x + w * .5},${top + d * .5} L${x + w * .75},${top + d * 1.2} L${x + w},${top + d * .6} L${x + w},${p.y}Z`;
    } else shape = `M${x},${p.y} L${x},${top} L${x + w},${top} L${x + w},${p.y}Z`;
    s += `<path d="${shape}" fill="${c}" stroke="${OL}" stroke-width="7" stroke-linejoin="round"/>`;
    const r = rng(i * 13 + 5);
    for (let wy = top + 40 + (p.ruin > 0 && i % 2 === 0 ? h * .3 * p.ruin : 0); wy < p.y - 60; wy += 72) for (let wx = x + 24; wx < x + w - 40; wx += 50) {
      const on = p.litFn ? p.litFn(wx, wy, r()) : r() < p.lit;
      const wc = on ? '#ffe28a' : (p.night > .5 ? '#232845' : mix('#c8e2f7', '#4a5578', p.ruin + p.vines * .3));
      s += `<rect x="${wx}" y="${f(wy)}" width="26" height="38" rx="3" fill="${wc}"/>`;
    }
    if (p.vines > 0) {
      const vr = rng(i * 7 + 1);
      for (let k = 0; k < 3; k++) {
        const vx = x + 20 + vr() * (w - 40), vh = h * p.vines * (.5 + vr() * .5);
        let d = `M${f(vx)},${p.y}`; for (let yy = 0; yy < vh; yy += 40) d += ` Q${f(vx + (yy / 40 % 2 ? 22 : -22))},${f(p.y - yy - 20)} ${f(vx)},${f(p.y - yy - 40)}`;
        s += `<path d="${d}" fill="none" stroke="#2f7a34" stroke-width="10" stroke-linecap="round"/>`;
        for (let yy = 30; yy < vh; yy += 55) s += `<ellipse cx="${f(vx + (yy % 110 ? 18 : -18))}" cy="${f(p.y - yy)}" rx="18" ry="11" fill="#45a84a" stroke="${OL}" stroke-width="3"/>`;
      }
      if (p.vines > .4) s += `<path d="${blob(i + 40, w * .45, 9, .25)}" transform="translate(${x + w / 2},${top + (p.ruin > 0 && i % 2 === 0 ? h * .2 * p.ruin : 0)})" fill="#3aa84a" stroke="${OL}" stroke-width="5"/>`;
    }
  });
  return s;
}
function street(t, o = {}) {
  const p = Object.assign({ cracks: 0, grass: 0, night: 0 }, o);
  let s = `<rect x="-700" y="${GROUND}" width="2480" height="60" fill="${mix('#b9b9c4', '#3a3d4c', p.night)}" stroke="${OL}" stroke-width="6"/><rect x="-700" y="${GROUND + 60}" width="2480" height="1400" fill="${mix('#4a4f5c', '#1d2030', p.night)}"/>`;
  for (let x = -100; x < 1200; x += 200) s += `<rect x="${x}" y="${GROUND + 180}" width="110" height="18" rx="6" fill="${mix('#f2f2f2', '#555', p.night)}" opacity="${f(1 - p.cracks * .5)}"/>`;
  if (p.cracks > 0) {
    const r = rng(77); let d = '';
    for (let k = 0; k < 9 * p.cracks; k++) { let x = r() * 1080, y = GROUND + 80 + r() * 600; d += `M${f(x)},${f(y)}`; for (let j = 0; j < 4; j++) { x += 30 + r() * 50; y += (r() - .5) * 60; d += ` L${f(x)},${f(y)}`; } }
    s += `<path d="${d}" fill="none" stroke="#1b1d26" stroke-width="7" stroke-linejoin="round"/>`;
  }
  if (p.grass > 0) {
    const r = rng(31);
    for (let k = 0; k < 40 * p.grass; k++) { const x = r() * 1100 - 10, y = GROUND + 50 + r() * 650, h = 20 + r() * 40 * p.grass; s += `<path d="M${f(x - 14)},${f(y)} L${f(x - 6)},${f(y - h)} L${f(x)},${f(y - 4)} L${f(x + 8)},${f(y - h * 1.1)} L${f(x + 14)},${f(y)}Z" fill="#4fbf4a" stroke="${OL}" stroke-width="3"/>`; }
  }
  return s;
}
function deer(x, y, s, t, flip = 1) {
  const st = Math.sin(t * 8) * 18;
  let d = '';
  for (const [lx, ph] of [[-70, 0], [-40, Math.PI], [60, Math.PI], [90, 0]]) d += `<path d="M${lx},40 L${f(lx + Math.sin(t * 8 + ph) * 14)},150" stroke="${OL}" stroke-width="20" stroke-linecap="round"/><path d="M${lx},40 L${f(lx + Math.sin(t * 8 + ph) * 14)},150" stroke="#a8683a" stroke-width="10" stroke-linecap="round"/>`;
  d += `<ellipse cx="0" cy="20" rx="130" ry="60" fill="#b8743c" stroke="${OL}" stroke-width="7"/><path d="M-130,10 q-20,-10 -20,-30" stroke="#fff" stroke-width="16" stroke-linecap="round"/>`;
  d += `<path d="M90,-10 L130,-110" stroke="${OL}" stroke-width="44" stroke-linecap="round"/><path d="M90,-10 L130,-110" stroke="#b8743c" stroke-width="30" stroke-linecap="round"/>`;
  d += `<ellipse cx="150" cy="-130" rx="50" ry="34" fill="#b8743c" stroke="${OL}" stroke-width="7" transform="rotate(20,150,-130)"/><circle cx="160" cy="-142" r="6" fill="${OL}"/><circle cx="196" cy="-118" r="8" fill="${OL}"/>`;
  d += `<path d="M130,-160 L110,-240 M118,-205 L80,-225 M145,-162 L170,-245 M162,-215 L200,-232" stroke="#6b4a2a" stroke-width="10" stroke-linecap="round"/>`;
  return `<g transform="translate(${f(x)},${f(y + Math.abs(st) * .2)}) scale(${f(s * flip * 100) / 100},${f(s * 100) / 100})">${d}</g>`;
}
function tree(x, y, s, sway = 0) {
  return `<g transform="translate(${f(x)},${f(y)}) scale(${s}) rotate(${f(sway)})"><rect x="-22" y="-200" width="44" height="210" fill="#7a4a26" stroke="${OL}" stroke-width="7"/><path d="${blob(Math.round(x), 150, 10, .2)}" transform="translate(0,-290)" fill="#2f8a44" stroke="${OL}" stroke-width="7"/><path d="${blob(Math.round(x) + 1, 90, 8, .2)}" transform="translate(-40,-330)" fill="#45a84a"/></g>`;
}
const vanishFX = (x, y, k) => k <= 0 || k >= 1 ? '' : [...Array(10)].map((_, i) => { const a = i / 10 * 6.28; return `<circle cx="${f(x + Math.cos(a) * 140 * k)}" cy="${f(y + Math.sin(a) * 140 * k)}" r="${f(14 * (1 - k))}" fill="#fff6c8"/>`; }).join('');

VIEWS.vanish = {
  draw(lv, vd, t) {
    let s = skyG('#7fc9ff', '#e6f6ff') + `<circle cx="860" cy="330" r="200" fill="url(#sunGlow)"/>`;
    s += city(t, { lit: .1 }) + street(t);
    const P = [[180, '#e5484d', {}], [430, '#2f9bff', { hairStyle: 'long', lashes: true, hair: '#a8652d', hairD: '#6e3c17', lower: 'skirt' }], [680, '#ffd166', {}], [900, '#7bd389', { hair: '#2a1a10', hairD: '#1a0f08' }]];
    P.forEach(([x, col, extra], i) => {
      const tv = .9 + i * .35, k = clamp((lv - tv) / .25);
      const walk = Math.sin(t * 6 + i) * 6;
      if (k < 1) s += guy({ x, y: 960 + walk, s: .32, shirt: col, mouth: lv > tv - .3 ? 'open' : 'smile', look: [0, 0], t, opacity: f(1 - k), ...extra });
      s += vanishFX(x, 1080, (lv - tv) / .5);
    });
    s += comic(540, 520, 'ПУФ!', eBack((lv - .9) / .25) * (lv < 2.6 ? 1 : 0), '#ffe14a', 90);
    return s;
  }
};
VIEWS.lights = {
  draw(lv, vd, t, ctx) {
    const s1 = ctx.segRel[1] ?? 9, wave = (lv - s1 - .2) * 900;
    let s = skyG('#05081f', '#1e2552') + stars(Math.round(10 + 40 * clamp((lv - s1) / 1.5)), 0, 0, 1080, 800, t, 3);
    s += `<circle cx="820" cy="330" r="60" fill="#f4f1d8"/>`;
    s += city(t, { night: 1, litFn: (wx, wy, r) => r < .75 && (lv < s1 + .2 || wx > wave) && !(Math.floor(t * 10 + wx) % 37 === 0 && lv > .5) });
    s += street(t, { night: 1 });
    for (const x of [120, 540, 960]) { const on = lv < s1 + .2 || x > wave; s += `<path d="M${x},${GROUND + 60} L${x},${GROUND - 260} L${x + 50},${GROUND - 260}" fill="none" stroke="${OL}" stroke-width="14"/><circle cx="${x + 50}" cy="${GROUND - 250}" r="18" fill="${on ? '#ffe28a' : '#3a3f55'}"/>` + (on ? `<path d="M${x + 50},${GROUND - 240} L${x - 40},${GROUND + 60} L${x + 140},${GROUND + 60}Z" fill="#ffe28a" opacity=".18"/>` : ''); }
    const k = pop(lv, s1 + .1);
    s += at(830, 480, k, `<rect x="-120" y="-60" width="240" height="140" rx="12" fill="#5a6278" stroke="${OL}" stroke-width="8"/><rect x="50" y="-170" width="46" height="120" fill="#5a6278" stroke="${OL}" stroke-width="8"/><path d="M-10,-30 L-40,20 L-6,20 L-26,70 L30,0 L-4,0 L16,-30Z" fill="${lv > s1 + .4 ? '#555b70' : '#ffe14a'}" stroke="${OL}" stroke-width="5"/><g transform="translate(0,130)">${pill('ВЫКЛ', '#ff3b3b', '#fff', 40, 70)}</g>`);
    return s;
  }
};
VIEWS.subway = {
  draw(lv, vd, t, ctx) {
    let s = BG('#14161f');
    s += `<path d="M-100,1500 L-100,700 Q540,180 1180,700 L1180,1500Z" fill="#2c3040" stroke="${OL}" stroke-width="10"/>`;
    let tiles = ''; for (let y = 520; y < 1400; y += 60) tiles += `M-100,${y} L1180,${y} `; s += `<path d="${tiles}" stroke="#3a3f52" stroke-width="3"/>`;
    s += `<rect x="-100" y="1250" width="1300" height="300" fill="#22252f"/><path d="M-100,1290 L1180,1290 M-100,1330 L1180,1330" stroke="#8a8f9e" stroke-width="10"/>`;
    s += `<g transform="translate(540,1080)"><rect x="-560" y="-260" width="1120" height="300" rx="40" fill="#c9d0dc" stroke="${OL}" stroke-width="9"/>${[-420, -220, 20, 220].map(x => `<rect x="${x}" y="-210" width="150" height="110" rx="14" fill="#2b3550" stroke="${OL}" stroke-width="6"/>`).join('')}<rect x="-560" y="-40" width="1120" height="30" fill="#e5484d"/>${[-380, 380].map(x => `<circle cx="${x}" cy="50" r="42" fill="#3a3f4f" stroke="${OL}" stroke-width="7"/>`).join('')}</g>`;
    for (const x of [200, 540, 880]) s += `<circle cx="${x}" cy="560" r="16" fill="#ffe28a" opacity="${f(.3 + .3 * Math.sin(t * 9 + x))}"/>`;
    const wl = lerp(1500, 930, eOut(lv / (vd * .95)));
    let w = `M-200,2000 L-200,${f(wl)}`; for (let x = -200; x <= 1300; x += 30) w += ` L${x},${f(wl + Math.sin(x / 70 + t * 3) * 10)}`;
    s += `<path d="${w} L1300,2000Z" fill="#2f7fd6" opacity=".72"/><path d="${w.replace(/L1300,2000Z/, '')}" fill="none" stroke="#bfe9ff" stroke-width="6" opacity=".8"/>`;
    s += particles(14, 6, t, { x0: 0, x1: 1080, y0: wl + 30, y1: 1500, speed: 90, size: 7, col: '#bfe9ff', op: .7, up: true });
    for (let i = 0; i < 4; i++) { const dy = ((t * 400 + i * 130) % 500); s += `<circle cx="${180 + i * 230}" cy="${f(520 + dy)}" r="7" fill="#9fd8ff" opacity="${f(1 - dy / 500)}"/>`; }
    const s1 = ctx.segRel[1] ?? 9;
    s += at(830, 400, pop(lv, s1 + .1), `<circle r="90" fill="#9aa3b2" stroke="${OL}" stroke-width="8"/>${[0, 120, 240].map(a => `<path d="M0,0 Q40,-30 20,-70" fill="none" stroke="${OL}" stroke-width="12" stroke-linecap="round" transform="rotate(${a})"/>`).join('')}<circle cx="62" cy="-62" r="40" fill="#ff3b3b" stroke="${OL}" stroke-width="6"/><path d="M45,-79 L79,-45 M79,-79 L45,-45" stroke="#fff" stroke-width="10" stroke-linecap="round"/>`);
    return s + `<rect x="-700" y="-700" width="2480" height="3300" fill="url(#vigDark)"/>`;
  }
};
VIEWS.nuclear = {
  draw(lv, vd, t, ctx) {
    const s1 = ctx.segRel[1] ?? 9, alarm = clamp((lv - s1) / 1.5);
    let s = skyG(mix('#9fb3c8', '#4a2a2a', alarm), mix('#dfe8ee', '#8a4a3a', alarm));
    s += `<rect x="-700" y="960" width="2480" height="1400" fill="#7a8a5a"/>`;
    for (let i = 0; i < 5; i++) { const q = ((t * .25 + i * .2) % 1); s += `<path d="${blob(i + 9, 90 + q * 120, 9, .2)}" transform="translate(${f(330 + Math.sin(i) * 30)},${f(430 - q * 360)})" fill="#f2f4f6" opacity="${f((1 - q) * .9)}"/>`; }
    s += `<path d="M190,960 Q250,700 210,450 L450,450 Q410,700 470,960Z" fill="#c9ced6" stroke="${OL}" stroke-width="9"/><path d="M215,500 L445,500" stroke="#a9aeb8" stroke-width="10"/>`;
    s += `<rect x="560" y="740" width="420" height="220" fill="#b9c0cc" stroke="${OL}" stroke-width="9"/><path d="M600,740 A170,170 0 0 1 940,740Z" fill="#dfe3ea" stroke="${OL}" stroke-width="9"/>`;
    const blink = Math.sin(t * 10) > 0;
    s += `<circle cx="770" cy="560" r="${blink ? 34 : 26}" fill="${blink ? '#ff2a2a' : '#7a1a1a'}" stroke="${OL}" stroke-width="6"/>` + (blink ? `<circle cx="770" cy="560" r="120" fill="url(#redGlow)" opacity=".6"/>` : '');
    if (lv > s1) {
      let tre = `<circle r="110" fill="#ffd23a" stroke="${OL}" stroke-width="9"/><circle r="18" fill="${OL}"/>`;
      for (const a of [0, 120, 240]) tre += `<path d="M0,0 L${f(90 * Math.cos((a - 90 - 30) * Math.PI / 180))},${f(90 * Math.sin((a - 90 - 30) * Math.PI / 180))} A90,90 0 0 1 ${f(90 * Math.cos((a - 90 + 30) * Math.PI / 180))},${f(90 * Math.sin((a - 90 + 30) * Math.PI / 180))}Z" fill="${OL}" transform="scale(.9)"/>`;
      s += at(230, 450, pop(lv, s1 + .1), tre, Math.sin(t * 2) * 8);
      const a = lerp(-80, 70, alarm);
      s += at(860, 420, pop(lv, s1 + .3), `<path d="M-110,40 A110,110 0 0 1 110,40Z" fill="#fff" stroke="${OL}" stroke-width="8"/><path d="M50,40 A110,110 0 0 1 110,40 L60,40Z" fill="#ff3b3b"/><path d="M0,40 L${f(95 * Math.sin(a * Math.PI / 180))},${f(40 - 95 * Math.cos(a * Math.PI / 180))}" stroke="${OL}" stroke-width="10" stroke-linecap="round"/><circle cx="0" cy="40" r="14" fill="${OL}"/>${txt(0, 90, 'T°', 44, '#fff', { stroke: OL, sw: 10 })}`);
      s += `<rect x="-700" y="-700" width="2480" height="3300" fill="#ff0000" opacity="${f(.12 * alarm * (.6 + .4 * Math.sin(t * 8)))}"/>`;
    }
    return s;
  }
};
VIEWS.year1 = {
  draw(lv, vd, t, ctx) {
    let s = skyG('#86ceff', '#eaf7ff') + `<circle cx="200" cy="330" r="180" fill="url(#sunGlow)"/>`;
    s += city(t, { lit: 0, vines: .18 }) + street(t, { cracks: .7, grass: .6 });
    s += `<g transform="translate(760,1420) rotate(-4)"><rect x="-160" y="-70" width="320" height="90" rx="30" fill="#a05a3a" stroke="${OL}" stroke-width="7"/><path d="M-100,-70 L-60,-130 L60,-130 L100,-70Z" fill="#7a3a26" stroke="${OL}" stroke-width="7"/>${[-95, 95].map(x => `<circle cx="${x}" cy="30" r="34" fill="#2a2e3a" stroke="${OL}" stroke-width="6"/>`).join('')}<path d="M-140,-40 l60,-10 M30,-50 l70,10" stroke="#6b3a20" stroke-width="10" opacity=".6"/></g>`;
    const s1 = ctx.segRel[1] ?? 9;
    if (lv > s1 - .3) s += deer(lerp(1300, 380, clamp((lv - s1 + .3) / 2.6)), 1300, .8, t, -1);
    for (let i = 0; i < 3; i++) { const x = ((t * 120 + i * 300) % 1400) - 150, y = 420 + i * 60 + Math.sin(t * 3 + i) * 20, w = 20 * Math.sin(t * 12 + i); s += `<path d="M${f(x - 30)},${f(y - w)} Q${f(x - 12)},${f(y - 20)} ${f(x)},${f(y)} Q${f(x + 12)},${f(y - 20)} ${f(x + 30)},${f(y - w)}" fill="none" stroke="${OL}" stroke-width="7" stroke-linecap="round"/>`; }
    return s;
  }
};
VIEWS.year20 = {
  draw(lv, vd, t, ctx) {
    let s = skyG('#8fd3ff', '#eef9ff');
    s += city(t, { lit: 0, vines: .75, ruin: .3 }) + street(t, { cracks: 1, grass: 1 });
    s += tree(120, 1420, 1.1, Math.sin(t * 1.5) * 2) + tree(560, 1480, 1.25, Math.sin(t * 1.3 + 1) * 2) + tree(980, 1400, 1.05, Math.sin(t * 1.6 + 2) * 2);
    const s1 = ctx.segRel[1] ?? 9, fall = eIn(clamp((lv - s1 - .3) / .6));
    let house = `<rect x="-170" y="-220" width="340" height="220" fill="#a8743f" stroke="${OL}" stroke-width="8"/>`;
    for (let y = -190; y < 0; y += 34) house += `<path d="M-170,${y} L170,${y}" stroke="#7a4a26" stroke-width="5"/>`;
    house += `<path d="M-200,-220 L0,-380 L200,-220Z" fill="#7a3a26" stroke="${OL}" stroke-width="8"/><rect x="-40" y="-120" width="80" height="120" fill="#3a2414"/><rect x="80" y="-170" width="60" height="60" fill="#2b3550" stroke="${OL}" stroke-width="5"/>`;
    s += `<g transform="translate(800,${f(1160 + fall * 80)}) rotate(${f(fall * 24)},170,0) scale(.9)">${house}</g>`;
    if (fall > .9) for (let i = 0; i < 6; i++) { const q = clamp((lv - s1 - .9) / .8), a = i * 1.05; s += `<circle cx="${f(820 + Math.cos(a) * 220 * q)}" cy="${f(1180 + Math.sin(a) * 60 * q)}" r="${f(70 * (1 - q * .5))}" fill="#d9c7a8" opacity="${f(.7 * (1 - q))}"/>`; }
    return s;
  }
};
VIEWS.year300 = {
  shakes: ctx => [[ctx.vd - 2.2, 8, 1.2], [ctx.vd - 1.1, 22, .5]],
  draw(lv, vd, t) {
    let s = skyG('#7fc4ef', '#e9f6ff');
    s += `<g transform="translate(540,760) scale(.55) translate(-540,-1250)">${city(t, { lit: 0, vines: 1, ruin: .8 })}</g>`;
    s += `<path d="M-700,770 Q200,720 540,760 T1780,750 L1780,1000 L-700,1000Z" fill="#3aa84a" stroke="${OL}" stroke-width="6"/>`;
    s += `<rect x="-700" y="1000" width="2480" height="1400" fill="#2f7fbf"/>`;
    for (let i = 0; i < 8; i++) s += `<path d="M${f(((t * 50 + i * 170) % 1300) - 100)},${1060 + i * 45} q40,-12 80,0" fill="none" stroke="#bfe9ff" stroke-width="5" opacity=".6"/>`;
    const truss = (x0, x1) => { let d = `M${x0},940 L${x1},940 M${x0},860 L${x1},860`; for (let x = x0; x < x1; x += 80) d += ` M${x},940 L${x + 40},860 L${x + 80},940`; return `<path d="${d}" fill="none" stroke="${OL}" stroke-width="22" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#a0522d" stroke-width="12" stroke-linejoin="round"/>`; };
    const c = eIn(clamp((lv - (vd - 1.15)) / .5));
    s += truss(-120, 380) + truss(700, 1200);
    s += `<g transform="translate(${f(c * 20)},${f(c * 380)}) rotate(${f(c * 28)},540,900)">${truss(380, 700)}</g>`;
    s += `<rect x="350" y="940" width="60" height="200" fill="#8a7a6a" stroke="${OL}" stroke-width="7"/><rect x="670" y="940" width="60" height="200" fill="#8a7a6a" stroke="${OL}" stroke-width="7"/>`;
    if (c >= 1) for (let i = 0; i < 8; i++) { const q = clamp((lv - (vd - .65)) / .6), a = -Math.PI + i * .45; s += `<circle cx="${f(560 + Math.cos(a) * 260 * q)}" cy="${f(1180 + Math.sin(a) * 200 * q)}" r="${f(26 * (1 - q))}" fill="#e6f6ff"/>`; }
    s += particles(10, 4, t, { x0: 380, x1: 700, y0: 860, y1: 1100, speed: 60, size: 5, col: '#8a4a2a', op: .7 });
    return s;
  }
};
VIEWS.year10k = {
  draw(lv, vd, t, ctx) {
    let s = skyG('#ffb36b', '#ffe9c4') + `<circle cx="760" cy="420" r="260" fill="url(#sunGlow)"/>`;
    s += `<path d="M-700,980 Q100,900 540,960 T1780,940 L1780,2600 L-700,2600Z" fill="#e8c27a" stroke="${OL}" stroke-width="6"/>`;
    s += `<path d="M60,980 L260,640 L460,980Z" fill="#d9a85a" stroke="${OL}" stroke-width="9" stroke-linejoin="round"/><path d="M260,640 L460,980 L330,980Z" fill="#000" opacity=".15"/><path d="M360,980 L500,740 L640,980Z" fill="#cf9c50" stroke="${OL}" stroke-width="9" stroke-linejoin="round"/>`;
    s += `<g transform="translate(860,1000)"><path d="M-130,40 Q-140,-160 0,-180 Q140,-160 130,40Z" fill="#4f9a86" stroke="${OL}" stroke-width="9"/><path d="M-60,-90 Q-40,-104 -20,-90 M20,-90 Q40,-104 60,-90 M-10,-60 L-16,-20 L10,-20 M-40,10 Q0,26 40,10" fill="none" stroke="#2c6b5a" stroke-width="8" stroke-linecap="round"/><path d="M-200,40 Q0,0 200,40 L200,90 L-200,90Z" fill="#e8c27a"/></g>`;
    s += `<g transform="translate(540,1170) rotate(-24)"><rect x="-60" y="-120" width="120" height="200" rx="40" fill="#bfe6ff" fill-opacity=".8" stroke="${OL}" stroke-width="8"/><rect x="-26" y="-160" width="52" height="46" rx="8" fill="#2f9bff" stroke="${OL}" stroke-width="6"/><rect x="-56" y="-40" width="112" height="50" fill="#ff5a5a"/></g><path d="M380,1210 Q540,1170 700,1210 L700,1260 L380,1260Z" fill="#e8c27a"/>`;
    const s1 = ctx.segRel[1] ?? 9;
    const ring = (x, y, r, t0, label, col) => { const k = pop(lv, s1 + t0); return k > 0 ? at(x, y, k, `<circle r="${r}" fill="none" stroke="${col}" stroke-width="10"/>`) + at(x, y - r - 50, k, pill(label, '#111427', '#fff', 34, 62)) : ''; };
    if (lv > s1 + 1.9) s += sparks(540, 1170, t, 150, 6, '#fff');
    s += ring(330, 830, 230, .1, 'ПИРАМИДЫ', '#ffe14a') + ring(860, 920, 170, .9, 'БРОНЗА', '#ffe14a') + ring(540, 1150, 150, 1.9, 'ПЛАСТИК', '#ff3b3b');
    return s;
  }
};
VIEWS.cta = {
  draw(lv, vd, t) {
    let s = sunburst('#3fd17a', '#14905a', t * .1);
    const id = ++uid, rot = t * 40;
    s += `<circle cx="540" cy="760" r="350" fill="url(#whiteGlow)" opacity=".5"/><clipPath id="gl${id}"><circle cx="540" cy="760" r="270"/></clipPath><circle cx="540" cy="760" r="270" fill="#2f8fe0"/>`;
    let land = ''; for (let i = 0; i < 6; i++) { const x = ((i * 220 + rot) % 1320) - 120; land += `<path d="${blob(i + 70, 70 + (i % 3) * 30, 9, .35)}" transform="translate(${f(270 + x)},${f(600 + (i % 3) * 120)})" fill="#4fbf4a" stroke="${OL}" stroke-width="5"/>`; }
    s += `<g clip-path="url(#gl${id})">${land}<ellipse cx="460" cy="640" rx="120" ry="70" fill="#fff" opacity=".25"/></g><circle cx="540" cy="760" r="270" fill="none" stroke="${OL}" stroke-width="10"/>`;
    [[190, 470, 0], [900, 480, .15], [930, 1000, .3], [170, 980, .45]].forEach(([x, y, d], i) => { s += at(x, y + Math.sin(t * 4 + i) * 12, pop(lv, .2 + d), txt(0, 0, '?', 120, '#fff', { stroke: OL, sw: 16 }), 12 * Math.sin(t * 3 + i)); });
    s += particles(16, 12, t, { x0: 100, x1: 1000, y0: 300, y1: 1250, speed: 70, size: 9, col: ['#45a84a', '#7bd389'], op: .8, shape: 'leaf' });
    return s;
  }
};
