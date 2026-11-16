// «Тараканьи бега» — картинки сцен.
const R = [['УСАЧ', '#e5484d'], ['ШУСТРИК', '#2f9bff'], ['ТАПОК', '#2fd27a'], ['ГЕНЕРАЛ', '#ffd23a'], ['НОЧНИК', '#8b5cff']];
const LANE = i => 540 + i * 168;
function roach(x, y, s, i, t, moving = 1, rot = 0) {
  const col = R[i][1], ph = t * 26 + i;
  let g = '';
  for (const [lx, side] of [[-30, 1], [5, 1], [40, 1], [-30, -1], [5, -1], [40, -1]]) {
    const sw = moving ? Math.sin(ph + lx * .1 + (side > 0 ? 0 : Math.PI)) * 16 : 0;
    g += `<path d="M${lx},${side * 20} L${f(lx + sw - 10)},${side * 52} L${f(lx + sw - 26)},${side * 62}" fill="none" stroke="${OL}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  const aw = Math.sin(t * 7 + i) * 10;
  g += `<path d="M78,-8 Q130,${f(-40 + aw)} 170,${f(-30 + aw)} M78,8 Q130,${f(40 - aw)} 170,${f(30 - aw)}" fill="none" stroke="${OL}" stroke-width="5" stroke-linecap="round"/>`;
  g += `<ellipse cx="0" cy="0" rx="72" ry="36" fill="#6b3a1e" stroke="${OL}" stroke-width="6"/><path d="M-66,0 L40,0" stroke="#3e200e" stroke-width="5"/><ellipse cx="-14" cy="-14" rx="40" ry="8" fill="#a8683a" opacity=".6"/>`;
  g += `<ellipse cx="74" cy="0" rx="20" ry="24" fill="#4a2812" stroke="${OL}" stroke-width="6"/>`;
  g += `<circle cx="-10" cy="0" r="24" fill="${col}" stroke="${OL}" stroke-width="5"/>` + txt(-10, 2, String(i + 1), 30, '#111427');
  return `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)}) scale(${s})">${g}</g>`;
}
function track(cam) {
  let s = BG('#d9b98a');
  for (let i = 0; i < 5; i++) s += `<rect x="-200" y="${LANE(i) - 70}" width="1480" height="140" fill="${i % 2 ? '#e8cfa3' : '#dcc092'}"/>`;
  s += `<rect x="-200" y="${LANE(0) - 76}" width="1480" height="6" fill="#fff"/><rect x="-200" y="${LANE(4) + 70}" width="1480" height="6" fill="#fff"/>`;
  for (let i = 1; i < 5; i++) s += `<path d="M-200,${LANE(i) - 70} L1280,${LANE(i) - 70}" stroke="#fff" stroke-width="4" stroke-dasharray="30 20" opacity=".8"/>`;
  const X = p => 160 + (p - cam) * 14;
  for (let m = 0; m <= 100; m += 10) { const x = X(m); if (x > -100 && x < 1180) s += `<path d="M${f(x)},${LANE(0) - 70} L${f(x)},${LANE(4) + 70}" stroke="#fff" stroke-width="3" opacity=".5"/>` + txt(x, LANE(0) - 100, m + ' СМ', 26, '#7a5a30', { w: 700 }); }
  const fx = X(100);
  if (fx > -60 && fx < 1140) { let ch = ''; for (let k = 0; k < 26; k++) ch += `<rect x="${f(fx + (k % 2) * 20)}" y="${LANE(0) - 70 + k * 31}" width="20" height="31" fill="${k % 2 ? '#111' : '#fff'}"/><rect x="${f(fx + ((k + 1) % 2) * 20)}" y="${LANE(0) - 70 + k * 31}" width="20" height="31" fill="${(k + 1) % 2 ? '#111' : '#fff'}"/>`; s += ch + txt(fx + 20, LANE(0) - 100, 'ФИНИШ', 32, '#e5484d'); }
  const sx = X(0); if (sx > -40 && sx < 1120) s += `<rect x="${f(sx - 4)}" y="${LANE(0) - 70}" width="8" height="${LANE(4) - LANE(0) + 140}" fill="#fff"/>`;
  return [s, X];
}
VIEWS.lineup = {
  draw(lv, vd, t, ctx) {
    let [s] = track(-8);
    const s1 = ctx.segRel[1] ?? 9;
    R.forEach(([name, col], i) => {
      s += roach(160 + 8 * 14 - 40 + Math.sin(t * 3 + i) * 4, LANE(i), 1, i, t, 0);
      s += at(560, LANE(i), pop(lv, s1 + .2 + i * .25), pill('№' + (i + 1) + ' ' + name, col, '#111427', 36, 68), 0);
    });
    s += at(540, 380, pop(lv, .1), pill('ЗАБЕГ НА 1 МЕТР', '#111427', '#ffe14a', 36, 66));
    return s;
  }
};
VIEWS.race = {
  shakes: ctx => ctx.sc.fx === 'photo' ? [[(ctx.segEndRel[0] ?? 1) - .2, 14, .4]] : [],
  flash: (lv, ctx) => { if (ctx.sc.fx !== 'photo') return 0; const q = (lv - ((ctx.segEndRel[0] ?? 1) - .2)) / .35; return q > 0 && q < 1 ? .9 * (1 - q) : 0; },
  draw(lv, vd, t, ctx) {
    const [A, B] = ctx.sc.race, T = ctx.segEndRel[ctx.segEndRel.length - 1] ?? vd;
    const q = clamp(lv / T), e = ctx.sc.id === 'start' ? eIn(q) : q;
    const pos = A.map((a, i) => lerp(a, B[i], e) + (q < 1 && q > 0 ? Math.sin(t * 9 + i * 2) * .25 : 0));
    const lead = Math.max(...pos), cam = Math.min(Math.max(lead - 55, -8), 100 - 50);
    let [s, X] = track(cam);
    const moving = q < 1 && ctx.sc.id !== 'start' || (ctx.sc.id === 'start' && q > .7 && q < 1);
    pos.forEach((p, i) => {
      const stop = ctx.sc.fx === 'crumb' && i === 3;
      if (ctx.sc.fx === 'turbo' && i === 2 && moving) s += `<path d="M${f(X(p) - 70)},${LANE(i) - 20} L${f(X(p) - 200 - 30 * Math.sin(t * 30))},${LANE(i)} L${f(X(p) - 70)},${LANE(i) + 20}Z" fill="#ff8a1a"/><path d="M${f(X(p) - 70)},${LANE(i) - 10} L${f(X(p) - 140)},${LANE(i)} L${f(X(p) - 70)},${LANE(i) + 10}Z" fill="#fff3a0"/>`;
      if (moving && !stop) for (let k = 0; k < 3; k++) s += `<path d="M${f(X(p) - 90 - k * 40)},${LANE(i) - 30 + k * 30} l-50,0" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7"/>`;
      s += roach(X(p), LANE(i), 1, i, t, moving && !stop, stop ? Math.sin(t * 8) * 10 : 0);
      if (stop) s += `<path d="${blob(9, 28, 8, .3)}" transform="translate(${f(X(p) + 150)},${LANE(i) + 10})" fill="#f2c26a" stroke="${OL}" stroke-width="5"/>`;
    });
    const tagI = { lead: 1, crumb: 3, turbo: 2 }[ctx.sc.fx];
    if (tagI != null) { const p = pos[tagI]; s += at(Math.min(900, Math.max(180, X(p))), LANE(tagI) - 105, pop(lv, .2), pill(R[tagI][0], R[tagI][1], '#111427', 32, 58)); }
    if (ctx.sc.fx === 'crumb') s += comic(Math.min(880, X(pos[3]) + 160), LANE(3) + 150, 'КРОШКА!', eBack((lv - .5) / .25), '#ffe14a', 56);
    if (ctx.sc.fx === 'photo' && lv > (ctx.segEndRel[0] ?? 1) - .2) {
      s += `<rect x="40" y="${LANE(0) - 80}" width="1000" height="${LANE(4) - LANE(0) + 160}" fill="none" stroke="#fff" stroke-width="10" stroke-dasharray="60 30"/>`;
      s += at(540, LANE(2) - 120, 1, pill('ТАПОК +0,5 СМ', '#2fd27a', '#111427', 40, 74), -4);
    }
    if (ctx.sc.id === 'start') { const k = Math.floor(clamp(lv / (T * .75)) * 3); s += comic(540, 380, ['НА СТАРТ', 'ВНИМАНИЕ', 'МАРШ!'][Math.min(2, k)], 1, k === 2 ? '#2fd27a' : '#fff', 60); }
    return s;
  }
};
VIEWS.podium = {
  draw(lv, vd, t, ctx) {
    let s = sunburst('#ffd23a', '#e0a800', t * .12) + particles(40, 5, t, { y0: -100, y1: 1400, speed: 300, size: 9, col: ['#e5484d', '#2f9bff', '#2fd27a', '#fff'], op: .9, shape: 'leaf' });
    const k = eOut((lv - .9) / .5);
    s += `<rect x="390" y="900" width="300" height="320" fill="#ffe680" stroke="${OL}" stroke-width="9"/>${txt(540, 1060, '1', 140, '#c28a00')}`;
    s += `<rect x="90" y="1000" width="300" height="220" fill="#e6ebf2" stroke="${OL}" stroke-width="9"/>${txt(240, 1110, '2', 120, '#8a93a6')}`;
    s += `<rect x="690" y="1060" width="300" height="160" fill="#f2c8a0" stroke="${OL}" stroke-width="9"/>${txt(840, 1140, '3', 110, '#b8743c')}`;
    s += roach(240, 950, .9, 1, t, 0, -90) + roach(840, 1010, .9, 0, t, 0, -90);
    if (k > 0) {
      s += roach(540, lerp(700, 830, k), 1.2 * k, 2, t, 0, -90);
      s += at(540, lerp(560, 690, k), k, `<path d="M-70,30 L-80,-40 L-35,0 L0,-60 L35,0 L80,-40 L70,30Z" fill="#ffd23a" stroke="${OL}" stroke-width="7" stroke-linejoin="round"/>`);
    }
    s += at(540, 420, pop(lv, 1.0), pill('ТАПОК №3', '#2fd27a', '#111427', 54, 92), -3);
    return s;
  }
};
VIEWS.cta = {
  draw(lv, vd, t) {
    let s = sunburst('#8b5cff', '#4a1fb8', t * .12);
    R.forEach(([name, col], i) => {
      const x = 140 + i * 200, y = 760 + (i % 2) * 120;
      s += roach(x, y, .75, i, t, 0, -90) + at(x, y + 150, pop(lv, .1 + i * .1), pill(String(i + 1), col, '#111427', 40, 64));
    });
    [[220, 460, 0], [860, 470, .2]].forEach(([x, y, d], i) => { s += at(x, y + Math.sin(t * 4 + i) * 12, pop(lv, .3 + d), txt(0, 0, '?', 130, '#fff', { stroke: OL, sw: 16 }), 12 * Math.sin(t * 3 + i)); });
    return s;
  }
};
