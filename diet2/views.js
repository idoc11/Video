// «Первый день диеты» — смешная история с матами.
const ME = { shirt: '#4aa3ff', hair: '#2a1a10', hairD: '#1a0f08', beard: '#4a3a2a', browCol: '#2a1a10' };
function kitchen(dark = 0) {
  return BG(dark ? '#0d1226' : '#e9d8b8') + `<rect x="-700" y="1230" width="2480" height="1400" fill="${dark ? '#1a1f3a' : '#a98a64'}"/><rect x="-700" y="1220" width="2480" height="22" fill="${dark ? '#10152c' : '#7a5f40'}"/>` + (dark ? `<circle cx="880" cy="360" r="50" fill="#f4f1d8"/>` : `<rect x="80" y="260" width="280" height="320" fill="#9fd0ff" stroke="#2a1c10" stroke-width="12"/>`);
}
function fridge(x, y, s, open = 0, face = 0, t = 0) {
  let g = `<g transform="translate(${f(x)},${f(y)}) scale(${s})"><rect x="-190" y="-620" width="380" height="620" rx="26" fill="#e8eef5" stroke="${OL}" stroke-width="10"/><path d="M-190,-380 L190,-380" stroke="${OL}" stroke-width="8"/><rect x="130" y="-560" width="16" height="130" rx="8" fill="#8a93a3" stroke="${OL}" stroke-width="5"/><rect x="130" y="-350" width="16" height="130" rx="8" fill="#8a93a3" stroke="${OL}" stroke-width="5"/>`;
  if (open) g += `<rect x="-150" y="-570" width="${f(300 * open)}" height="560" fill="#fff6c8"/><circle cx="0" cy="-290" r="${f(260 * open)}" fill="url(#whiteGlow)" opacity=".55"/>`;
  if (face) g += `<g opacity="${f(face)}"><circle cx="-60" cy="-500" r="32" fill="#fff" stroke="${OL}" stroke-width="6"/><circle cx="60" cy="-500" r="32" fill="#fff" stroke="${OL}" stroke-width="6"/><circle cx="${f(-60 + Math.sin(t * 3) * 8)}" cy="-496" r="12" fill="${OL}"/><circle cx="${f(60 + Math.sin(t * 3) * 8)}" cy="-496" r="12" fill="${OL}"/><path d="M-70,-430 Q0,${f(-390 + 14 * Math.sin(t * 6))} 70,-430" fill="none" stroke="${OL}" stroke-width="9" stroke-linecap="round"/><path d="M-110,-540 L-30,-526 M110,-540 L30,-526" stroke="${OL}" stroke-width="8" stroke-linecap="round"/></g>`;
  return g + '</g>';
}
function sausage(x, y, s, rot = 0) { return `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)}) scale(${s})"><rect x="-110" y="-34" width="220" height="68" rx="34" fill="#d8644e" stroke="${OL}" stroke-width="8"/><path d="M-70,-20 L-70,20 M-20,-24 L-20,24 M30,-24 L30,24 M78,-18 L78,18" stroke="#f3a08a" stroke-width="6" stroke-linecap="round"/></g>`; }
function plate(x, y, s, leaves = 3) { let g = `<g transform="translate(${f(x)},${f(y)}) scale(${s})"><ellipse cx="0" cy="20" rx="260" ry="60" fill="#fff" stroke="${OL}" stroke-width="9"/><ellipse cx="0" cy="12" rx="190" ry="38" fill="#f1f3f6" stroke="${OL}" stroke-width="5"/>`; for (let i = 0; i < leaves; i++) g += `<path d="M${-80 + i * 80},10 q30,-70 70,-10 q-30,40 -70,10z" fill="#58c26a" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>`; return g + '</g>'; }
function scale_(x, y, s, kg, shake = 0) { return `<g transform="translate(${f(x)},${f(y)}) rotate(${f(shake)}) scale(${s})"><rect x="-260" y="-70" width="520" height="140" rx="36" fill="#cfd6df" stroke="${OL}" stroke-width="10"/><rect x="-120" y="-44" width="240" height="70" rx="12" fill="#111427" stroke="${OL}" stroke-width="6"/>${txt(0, 8, kg, 54, '#ff4d4d')}</g>`; }
VIEWS.hook = { draw(lv, vd, t) {
  let s = kitchen() + guy({ ...ME, x: 540, y: 740, s: 1.0, legs: false, mouth: 'smile', brow: 'raised', pose: 'out', t });
  s += at(540, 1150, pop(lv, .2), `<rect x="-310" y="-110" width="620" height="220" rx="20" fill="#2fd27a" stroke="${OL}" stroke-width="9"/>` + txt(0, 22, 'ДИЕТА', 110, '#fff', { stroke: OL, sw: 12 }), -4);
  if (lv > 3.2) s += comic(850, 470, 'ХВАТИТ!', eBack((lv - 3.2) / .25), '#ffe14a', 64);
  return s;
} };
VIEWS.salad = { draw(lv, vd, t, ctx) {
  let s = kitchen() + plate(540, 1130, 1.3, 3);
  s += guy({ ...ME, x: 540, y: 700, s: .85, legs: false, mouth: lv > 2.4 ? 'open' : 'flat', mouthOpen: .5, brow: lv > 2.4 ? 'angry' : 'worried', look: [0, 10], t });
  s += at(840, 420, pop(lv, .5), pill('3 ЛИСТИКА', '#2fd27a', '#fff', 44, 80), 6);
  if (lv > 2.4) s += comic(220, 470, 'СУКА!', eBack((lv - 2.4) / .2), '#ff6b6b', 76);
  return s;
} };
VIEWS.night = { draw(lv, vd, t) {
  let s = kitchen(1) + fridge(540, 1300, 1.25, 0, 0, t);
  s += guy({ ...ME, x: 210, y: 1000, s: .5, legs: false, mouth: 'flat', brow: 'tired', tired: 1, lid: .5, look: [14, 0], t });
  s += at(840, 420, pop(lv, .3), pill('03:00', '#111427', '#ffd23a', 56, 96), 4);
  return s + `<rect x="-700" y="-700" width="2480" height="3300" fill="url(#vigDark)"/>`;
} };
VIEWS.talk = { draw(lv, vd, t, ctx) {
  const op = eOut(clamp(lv / .5));
  let s = kitchen(1) + fridge(540, 1300, 1.25, op, 1, t);
  s += sausage(540 + Math.sin(t * 3) * 20, 1030 - 20 * op, 1.1, Math.sin(t * 4) * 10);
  s += guy({ ...ME, x: 170, y: 1010, s: .52, legs: false, mouth: 'open', mouthOpen: .3, brow: 'raised', sweat: 2, look: [14, 0], t });
  if (lv > 1.0) s += at(800, 480, pop(lv, 1.0), txt(0, 0, '🌭', 130, '#fff'), 8);
  return s;
} };
VIEWS.rage = { shakes: () => [[.05, 18, .5]], draw(lv, vd, t) {
  let s = sunburst('#ff4136', '#b8141b', t * .25);
  s += guy({ ...ME, x: 540, y: 740, s: 1.25, legs: false, mouth: 'scream', mouthOpen: .8 + .2 * Math.sin(t * 18), brow: 'angry', red: 1, sweat: 3, pose: 'hold', t, headRot: Math.sin(t * 26) * 3 });
  s += sausage(540, 1160, 1.4, Math.sin(t * 8) * 8);
  s += comic(210, 440, '#@!%', eBack(lv / .2), '#ffe14a', 80) + comic(870, 520, 'ЖРАТЬ!', eBack((lv - .3) / .2), '#fff', 64);
  return s;
} };
VIEWS.scale = { draw(lv, vd, t) {
  let s = BG('#cfe6f5') + `<rect x="-700" y="1230" width="2480" height="1400" fill="#e8e8ee"/>`;
  const kg = lv < 1.5 ? '78.0' : '80.4';
  s += scale_(540, 1280, 1.2, kg, lv > 1.5 ? Math.sin(t * 30) * 2 : 0);
  s += guy({ ...ME, x: 540, y: 760, s: .8, legs: false, mouth: lv > 1.5 ? 'scream' : 'smile', mouthOpen: .7, brow: lv > 1.5 ? 'raised' : 'neutral', lid: 0, pupil: lv > 1.5 ? 'tiny' : undefined, sweat: lv > 1.5 ? 3 : 0, t });
  if (lv > 1.5) s += at(840, 480, pop(lv, 1.5), pill('+2,4 КГ', '#ff3b3b', '#fff', 56, 100), 6);
  return s;
} };
VIEWS.end = { draw(lv, vd, t) {
  let s = sunburst('#2fd27a', '#14905a', t * .12) + guy({ ...ME, x: 540, y: 800, s: 1.05, legs: false, mouth: 'smile', brow: 'raised', pose: 'out', t });
  s += sausage(540, 1180, 1.3, -6 + Math.sin(t * 3) * 3);
  s += at(540, 400, pop(lv, .3), `<rect x="-330" y="-80" width="660" height="160" rx="30" fill="#111427" stroke="#ffd23a" stroke-width="8"/>` + txt(0, 14, 'ДИЕТА ПРОВАЛЕНА', 52, '#ffd23a'), -3);
  s += particles(30, 4, t, { y0: -100, y1: 1400, speed: 260, size: 9, col: ['#ffd23a', '#fff', '#ff6b6b'], op: .9 });
  return s;
} };
function padlock(x, y, s) { return `<g transform="translate(${f(x)},${f(y)}) scale(${s})"><path d="M-40,-10 L-40,-60 Q0,-110 40,-60 L40,-10" fill="none" stroke="#8a93a3" stroke-width="16"/><rect x="-60" y="-14" width="120" height="100" rx="14" fill="#ffd23a" stroke="${OL}" stroke-width="8"/><circle cx="0" cy="26" r="12" fill="${OL}"/></g>`; }
function barbell(x, y, s, tilt = 0) { return `<g transform="translate(${f(x)},${f(y)}) rotate(${f(tilt)}) scale(${s})"><rect x="-420" y="-12" width="840" height="24" fill="#aeb6c4" stroke="${OL}" stroke-width="6"/>${[-1, 1].map(k => `<rect x="${k * 300 - 28}" y="-120" width="56" height="240" rx="10" fill="#2a2f45" stroke="${OL}" stroke-width="6"/><rect x="${k * 360 - 20}" y="-90" width="40" height="180" rx="8" fill="#e5484d" stroke="${OL}" stroke-width="6"/>`).join('')}</g>`; }
VIEWS.lock = { draw(lv, vd, t) {
  let s = kitchen() + fridge(540, 1300, 1.25, 0, 0, t) + padlock(540, 1000, 1.3);
  s += `<path d="M360,880 L720,1060 M720,880 L360,1060" stroke="#8a93a3" stroke-width="14" stroke-linecap="round"/>`;
  s += guy({ ...ME, x: 200, y: 900, s: .5, legs: false, mouth: 'smile', brow: 'raised', pose: 'out', t });
  s += at(840, 400, pop(lv, .4), pill('ДЕНЬ 2', '#2fd27a', '#fff', 56, 96), 5);
  if (lv > 3.0) s += comic(840, 560, 'НАХУЙ!', eBack((lv - 3.0) / .2), '#ffe14a', 64);
  return s;
} };
VIEWS.run = { draw(lv, vd, t) {
  let s = BG('#8fd0ff') + `<rect x="-700" y="1230" width="2480" height="1400" fill="#5a5f6e"/>`;
  s += [0, 1, 2, 3].map(i => `<rect x="${((i * 340 - t * 700) % 1500 + 1500) % 1500 - 200}" y="1400" width="170" height="16" fill="#fff"/>`).join('');
  const bob = Math.abs(Math.sin(t * 11)) * 26, tired = clamp((lv - 1.5) / 2);
  s += guy({ ...ME, x: 540, y: 740 - bob, s: .85, legs: false, mouth: tired > .5 ? 'wavy' : 'scream', mouthOpen: .6, brow: 'worried', sweat: 3, tired: tired, pose: 'out', hairWind: 1, t, headRot: Math.sin(t * 11) * 4 });
  s += at(840, 400, pop(lv, .3), pill('200 МЕТРОВ', '#ffd23a', '#111427', 48, 90), 6);
  if (lv > 3.0) s += comic(220, 460, 'ПИЗДЕЦ', eBack((lv - 3.0) / .2), '#ff6b6b', 70);
  return s;
} };
VIEWS.gym = { draw(lv, vd, t) {
  let s = BG('#3a3f55') + `<rect x="-700" y="1240" width="2480" height="1400" fill="#22263a"/>`;
  s += barbell(540, 1100, .9, Math.sin(t * 3) * 1.5);
  s += guy({ ...ME, x: 540, y: 700, s: .85, legs: false, mouth: 'flat', brow: 'tired', tired: 1, lid: .5, look: [0, 8], t });
  s += at(840, 400, pop(lv, .3), pill('100 КГ', '#e5484d', '#fff', 52, 92), 6);
  if (lv > 2.4) s += comic(230, 470, '«Я ТУТ ЗА ИНСТОЙ»', eBack((lv - 2.4) / .25), '#fff', 36, -4);
  return s;
} };
VIEWS.dark = { draw(lv, vd, t) {
  let s = kitchen(1) + fridge(540, 1300, 1.25, 0, 0, t) + padlock(540, 1050, 1.1);
  s += guy({ ...ME, x: 210, y: 1000, s: .5, legs: false, mouth: 'flat', brow: 'worried', sweat: 2, lid: .4, look: [14, 0], t });
  s += at(840, 420, pop(lv, .3), pill('ТИШИНА', '#111427', '#ffd23a', 52, 92), 4);
  return s + `<rect x="-700" y="-700" width="2480" height="3300" fill="url(#vigDark)"/>`;
} };
VIEWS.key = { draw(lv, vd, t) {
  let s = kitchen(1) + `<rect x="-700" y="-700" width="2480" height="3300" fill="#000" opacity=".15"/>`;
  s += sausage(540, 1050, 1.7, Math.sin(t * 3) * 3) + at(540, 1040, 1, `<g transform="translate(40,0)"><circle cx="0" cy="0" r="30" fill="#ffd23a" stroke="${OL}" stroke-width="7"/><rect x="26" y="-8" width="90" height="16" fill="#ffd23a" stroke="${OL}" stroke-width="6"/></g>`);
  s += guy({ ...ME, x: 540, y: 650, s: .7, legs: false, mouth: 'open', mouthOpen: .8, brow: 'raised', pupil: 'tiny', sweat: 3, t });
  if (lv > 1.4) s += comic(850, 420, 'КЛЮЧ!', eBack((lv - 1.4) / .2), '#ffe14a', 76);
  return s;
} };
VIEWS.end2 = { draw(lv, vd, t) {
  let s = kitchen() + fridge(540, 1300, 1.25, 0, 1, t) + `<path d="M470,1000 l-60,40 M610,1000 l60,40" stroke="${OL}" stroke-width="0"/>`;
  s += guy({ ...ME, x: 210, y: 1000, s: .5, legs: false, mouth: 'smile', brow: 'raised', pose: 'out', blush: .8, t });
  s += `<g transform="translate(870,1330) rotate(25)">${padlock(0, 0, 1)}</g>`;
  s += at(540, 380, pop(lv, .6), pill('ХОЛОДИЛЬНИК СМОТРИТ С УКОРОМ', '#ff4d6d', '#fff', 34, 76), -3);
  return s;
} };
