// «Шкаф за пять минут» — смешная история со сборкой мебели.
const ME = { shirt: '#ff7a3a', hair: '#3a2414', hairD: '#24160b', beard: '#4a3a2a', browCol: '#2a1a10' };
function room(t, warm = '#3a2f44') { return BG(warm) + `<rect x="-700" y="1180" width="2480" height="1400" fill="#5a4636"/><rect x="-700" y="1170" width="2480" height="24" fill="#3a2c20"/>` + `<rect x="80" y="260" width="300" height="360" fill="#9fd0ff" stroke="#2a1c10" stroke-width="14"/><path d="M230,260 L230,620 M80,440 L380,440" stroke="#2a1c10" stroke-width="10"/>`; }
function plank(x, y, w, h, rot = 0, col = '#d9a96a') { return `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)})"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="6" fill="${col}" stroke="${OL}" stroke-width="6"/>${[-1, 0, 1].map(k => `<circle cx="${k * w * .3}" cy="0" r="6" fill="#8a6a3a"/>`).join('')}</g>`; }
function bolt(x, y, s, rot = 0) { return `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)}) scale(${s})"><rect x="-14" y="-70" width="28" height="110" fill="#aeb6c4" stroke="${OL}" stroke-width="6"/><path d="M-14,-50 L14,-44 M-14,-30 L14,-24 M-14,-10 L14,-4 M-14,10 L14,16" stroke="${OL}" stroke-width="4"/><path d="M-40,-70 L40,-70 L30,-110 L-30,-110Z" fill="#8a93a3" stroke="${OL}" stroke-width="6"/></g>`; }
function cabinet(x, y, s, tilt = 0, door = 0) {
  return `<g transform="translate(${f(x)},${f(y)}) rotate(${f(tilt)}) scale(${s})"><rect x="-190" y="-520" width="380" height="520" fill="#d9a96a" stroke="${OL}" stroke-width="10"/><rect x="-170" y="-500" width="160" height="480" fill="#c4915a" stroke="${OL}" stroke-width="6"/><g transform="translate(170,-500) rotate(${f(door)})"><rect x="-340" y="0" width="340" height="480" fill="#c4915a" stroke="${OL}" stroke-width="6"/><circle cx="-40" cy="240" r="14" fill="#6a4a2a"/></g><rect x="-200" y="-540" width="400" height="26" fill="#e8c58a" stroke="${OL}" stroke-width="8"/><rect x="-170" y="0" width="34" height="40" fill="#8a6a3a" stroke="${OL}" stroke-width="6"/><rect x="136" y="0" width="34" height="40" fill="#8a6a3a" stroke="${OL}" stroke-width="6"/><path d="M-170,-260 L-10,-260" stroke="${OL}" stroke-width="6"/></g>`;
}
function cat(x, y, s, shock = 0, rot = 0) {
  return `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)}) scale(${s})"><ellipse cx="0" cy="0" rx="90" ry="64" fill="#8a8f9e" stroke="${OL}" stroke-width="7"/><circle cx="-70" cy="-30" r="52" fill="#8a8f9e" stroke="${OL}" stroke-width="7"/><path d="M-110,-70 L-100,-120 L-76,-76 M-60,-76 L-40,-116 L-30,-60" fill="#8a8f9e" stroke="${OL}" stroke-width="7" stroke-linejoin="round"/><circle cx="-88" cy="-34" r="${f(10 + 8 * shock)}" fill="#fff" stroke="${OL}" stroke-width="4"/><circle cx="-56" cy="-34" r="${f(10 + 8 * shock)}" fill="#fff" stroke="${OL}" stroke-width="4"/><circle cx="-88" cy="-34" r="${f(3 + 2 * shock)}" fill="${OL}"/><circle cx="-56" cy="-34" r="${f(3 + 2 * shock)}" fill="${OL}"/><path d="M90,10 Q150,-40 140,-90" fill="none" stroke="${OL}" stroke-width="22" stroke-linecap="round"/><path d="M90,10 Q150,-40 140,-90" fill="none" stroke="#8a8f9e" stroke-width="12" stroke-linecap="round"/></g>`;
}
VIEWS.hook = { draw(lv, vd, t) {
  let s = room(t) + guy({ ...ME, x: 540, y: 740, s: 1.0, legs: false, mouth: 'smile', brow: 'raised', pose: 'out', t });
  s += at(540, 1130, pop(lv, .2), `<rect x="-300" y="-110" width="600" height="220" rx="12" fill="#c9a06a" stroke="${OL}" stroke-width="9"/><path d="M-300,-30 L300,-30" stroke="${OL}" stroke-width="5"/>${txt(0, 20, 'ШКАФ', 100, '#7a2a1a')}`);
  const s1 = 2.6; if (lv > s1) s += comic(840, 480, 'СУКА', eBack((lv - s1) / .25), '#ff6b6b', 60);
  return s;
} };
VIEWS.manual = { draw(lv, vd, t, ctx) {
  let s = room(t);
  s += `<g transform="translate(540,640) rotate(${f(-2 + Math.sin(t * 2))})"><rect x="-340" y="-300" width="680" height="560" fill="#fff" stroke="${OL}" stroke-width="9"/><rect x="-340" y="-300" width="680" height="70" fill="#2f61b8"/>${txt(0, -264, 'ИНСТРУКЦИЯ', 40, '#fff')}`;
  s += `<g transform="translate(-170,0)">${plank(0, 0, 200, 60, 0, '#d9a96a')}${txt(0, -60, 'А', 70, '#e5484d')}</g><path d="M-30,0 L60,0 M40,-20 L70,0 L40,20" fill="none" stroke="${OL}" stroke-width="8" stroke-linecap="round"/><g transform="translate(180,0)">${plank(0, 0, 60, 200, 0, '#c4915a')}${txt(0, -130, 'Б', 70, '#e5484d')}</g></g>`;
  const s1 = ctx.segRel[1] ?? 9;
  s += guy({ ...ME, x: 540, y: 1310, s: .5, legs: false, mouth: lv > s1 ? 'open' : 'flat', mouthOpen: .5, brow: lv > s1 ? 'worried' : 'neutral', look: [0, -8], t });
  if (lv > s1) s += at(850, 1060, pop(lv, s1 + .2), txt(0, 0, '?!', 160, '#ffe14a', { stroke: OL, sw: 16 }), 8);
  return s;
} };
VIEWS.bolt = { draw(lv, vd, t) {
  let s = room(t) + `<rect x="-700" y="-700" width="2480" height="3300" fill="#000" opacity=".25"/>`;
  s += plank(300, 1260, 300, 70, -4) + plank(760, 1290, 260, 60, 7) + plank(520, 1330, 340, 64, 2) + plank(180, 1380, 220, 60, -12, '#c4915a');
  s += `<circle cx="540" cy="900" r="${f(300 + 14 * Math.sin(t * 4))}" fill="url(#whiteGlow)" opacity=".35"/>` + bolt(540, 960, 2.2, Math.sin(t * 2) * 8);
  const h = Math.min(2, 1 + lv * .4), m = Math.floor((lv / vd) * 120);
  s += at(840, 420, pop(lv, .3), `<circle r="110" fill="#fff" stroke="${OL}" stroke-width="9"/><path d="M0,0 L0,-70 M0,0 L${f(60 * Math.sin(lv * 6))},${f(-60 * Math.cos(lv * 6))}" stroke="${OL}" stroke-width="10" stroke-linecap="round"/>${txt(0, 150, '2 ЧАСА', 44, '#fff', { stroke: OL, sw: 9 })}`, 6);
  s += guy({ ...ME, x: 230, y: 980, s: .5, legs: false, mouth: 'wavy', brow: 'worried', tired: 1, sweat: 3, look: [14, 8], t });
  return s;
} };
VIEWS.rage = { shakes: () => [[.05, 20, .5]], draw(lv, vd, t) {
  let s = sunburst('#ff4136', '#b8141b', t * .25);
  s += guy({ ...ME, x: 540, y: 760, s: 1.25, legs: false, mouth: 'scream', mouthOpen: .9 + .1 * Math.sin(t * 20), brow: 'angry', red: 1, sweat: 3, pose: 'hold', t, headRot: Math.sin(t * 30) * 3 });
  s += bolt(540, 1160, 1.2, Math.sin(t * 8) * 10);
  s += comic(210, 460, '#@!%', eBack(lv / .2), '#ffe14a', 80) + comic(870, 520, 'БЛЯ!', eBack((lv - .3) / .2), '#fff', 64);
  return s;
} };
VIEWS.done = { draw(lv, vd, t) {
  let s = room(t) + cabinet(540, 1180, 1.25, 4 + Math.sin(t * 5) * .6, 6);
  s += `<path d="M540,1170 l0,-150" stroke="#ff3b3b" stroke-width="0"/>`;
  s += guy({ ...ME, x: 200, y: 1010, s: .5, legs: false, mouth: 'smile', brow: 'worried', pose: 'out', sweat: 2, look: [14, 0], t });
  s += at(840, 470, pop(lv, .8), pill('99% ГОТОВО', '#111427', '#ffd23a', 46, 84), 6);
  const s1 = 2.8; if (lv > s1) s += at(540, 1180, 1, `<g transform="translate(150,-410)"><rect x="-30" y="-14" width="60" height="28" fill="#aeb6c4" stroke="${OL}" stroke-width="5"/></g>`);
  return s;
} };
VIEWS.fall = { shakes: () => [[1.0, 26, .5], [2.0, 20, .5]], draw(lv, vd, t) {
  let s = room(t);
  const fall = eIn(clamp((lv - .9) / .6)), door = eIn(clamp((lv - .2) / .6)) * 85;
  s += cabinet(560, 1180, 1.1, fall * 78, door);
  s += cat(230, 1110 + (lv > 1.0 ? -Math.abs(Math.sin((lv - 1.0) * 14)) * 40 * Math.exp(-(lv - 1.0) * 2) : 0), .7, clamp((lv - .6) * 2), 0);
  if (lv > 1.0) s += comic(540, 520, 'БАБАХ!', eBack((lv - 1.0) / .2), '#ffe14a', 90);
  if (lv > 2.0) s += at(820, 800, pop(lv, 2.0), txt(0, 0, '😱', 140, '#fff'));
  return s;
} };
VIEWS.end = { draw(lv, vd, t) {
  let s = sunburst('#ff9a1f', '#e2600a', t * .12) + guy({ ...ME, x: 540, y: 820, s: 1.05, legs: false, mouth: 'smile', brow: 'raised', pose: 'hold', t });
  s += cat(860, 1190, .55, 0) + plank(200, 1220, 240, 60, 8);
  [[200, 560], [900, 520]].forEach(([x, y], i) => { s += at(x, y + Math.sin(t * 4 + i) * 12, pop(lv, .3 + i * .15), txt(0, 0, '?', 130, '#fff', { stroke: OL, sw: 16 }), 12 * Math.sin(t * 3 + i)); });
  return s;
} };
