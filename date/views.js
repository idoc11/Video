// «Свидание с омаром» — история на полторы минуты.
const MAX = { shirt: '#4aa3ff', hair: '#2a1a10', hairD: '#1a0f08', beard: '#4a3a2a', browCol: '#2a1a10' };
const LENA = { shirt: '#ff5d8f', hair: '#7a3b1e', hairD: '#5a2a14', hairStyle: 'long', lashes: true, browCol: '#3a1f10', blush: .5 };
const WAIT = { shirt: '#f4f4f4', hair: '#bbb', hairD: '#999', glasses: true, browCol: '#aaa' };
function rest(dark = 0) {
  return BG(dark ? '#2a1428' : '#7a2e3a') + `<rect x="-700" y="1240" width="2480" height="1400" fill="#3a2418"/><rect x="-700" y="1230" width="2480" height="20" fill="#241409"/>` +
    [140, 540, 940].map(x => `<circle cx="${x}" cy="330" r="46" fill="#ffe9a8" opacity=".9"/><circle cx="${x}" cy="330" r="130" fill="url(#whiteGlow)" opacity=".25"/>`).join('');
}
function table(y = 1180) { return `<rect x="-100" y="${y}" width="1280" height="46" rx="10" fill="#f4eee0" stroke="${OL}" stroke-width="8"/><rect x="520" y="${y + 40}" width="40" height="400" fill="#c9bfa8" stroke="${OL}" stroke-width="6"/><rect x="505" y="${y - 52}" width="24" height="52" rx="6" fill="#fff" stroke="${OL}" stroke-width="5"/><path d="M517,${y - 52} q-10,-26 0,-44 q10,18 0,44z" fill="#ffb02a" stroke="${OL}" stroke-width="3"/>`; }
function hearts(t, n = 5, x0 = 300, y0 = 700) { let s = ''; for (let i = 0; i < n; i++) { const q = ((t * .5 + i / n) % 1); s += txt(x0 + i * 110 + Math.sin(t * 3 + i) * 20, y0 - q * 360, '❤', 56 + i * 6, '#ff4d6d', { op: f(1 - q) }); } return s; }
function lobster(x, y, s, claw = 0, rot = 0, eyes = 1) {
  return `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)}) scale(${s})"><ellipse cx="0" cy="0" rx="170" ry="80" fill="#e5402a" stroke="${OL}" stroke-width="9"/><path d="M-60,-70 L-60,70 M0,-78 L0,78 M60,-70 L60,70" stroke="#b02a18" stroke-width="7"/><path d="M160,-10 L260,-40 L250,40 L160,30Z" fill="#e5402a" stroke="${OL}" stroke-width="8" stroke-linejoin="round"/><g transform="rotate(${f(-claw * 25)},-150,-30)"><path d="M-150,-30 L-250,-120 Q-330,-130 -300,-200 Q-210,-220 -190,-120Z" fill="#e5402a" stroke="${OL}" stroke-width="8" stroke-linejoin="round"/></g><g transform="rotate(${f(claw * 25)},-150,30)"><path d="M-150,30 L-250,120 Q-330,130 -300,200 Q-210,220 -190,120Z" fill="#e5402a" stroke="${OL}" stroke-width="8" stroke-linejoin="round"/></g><path d="M-130,-60 L-160,-120 M-110,-66 L-110,-130" stroke="${OL}" stroke-width="7"/><circle cx="-160" cy="-126" r="${f(16 * eyes)}" fill="#fff" stroke="${OL}" stroke-width="5"/><circle cx="-110" cy="-136" r="${f(16 * eyes)}" fill="#fff" stroke="${OL}" stroke-width="5"/><circle cx="-164" cy="-124" r="6" fill="${OL}"/><circle cx="-112" cy="-134" r="6" fill="${OL}"/></g>`;
}
function dish(x, y, s = 1, col = '#d9a96a') { return `<g transform="translate(${f(x)},${f(y)}) scale(${s})"><ellipse cx="0" cy="14" rx="110" ry="26" fill="#fff" stroke="${OL}" stroke-width="6"/><ellipse cx="0" cy="0" rx="62" ry="22" fill="${col}" stroke="${OL}" stroke-width="5"/></g>`; }
VIEWS.hook = { draw(lv, vd, t) {
  let s = BG('#ffc8d8') + `<rect x="-700" y="1240" width="2480" height="1400" fill="#e89ab0"/>` + hearts(t, 6, 200, 900);
  s += guy({ ...MAX, x: 540, y: 740, s: 1.0, legs: false, mouth: 'smile', brow: 'raised', pose: 'out', blush: .7, t });
  s += at(540, 1140, pop(lv, .2), `<rect x="-320" y="-100" width="640" height="200" rx="26" fill="#ff4d6d" stroke="${OL}" stroke-width="9"/>` + txt(0, 20, 'СВИДАНИЕ', 96, '#fff', { stroke: OL, sw: 12 }), -4);
  return s;
} };
VIEWS.mirror = { draw(lv, vd, t) {
  let s = BG('#cfe0ee') + `<rect x="-700" y="1240" width="2480" height="1400" fill="#b9a68a"/>`;
  s += guy({ ...MAX, x: 540, y: 740, s: 1.0, legs: false, mouth: 'smile', brow: 'raised', pose: 'hold', t });
  const k = clamp((lv - 1.2) / 2);
  for (let i = 0; i < 12; i++) { const a = i * 1.7, r = 120 + 360 * k + 40 * Math.sin(t * 3 + i); s += `<circle cx="${f(540 + Math.cos(a) * r)}" cy="${f(800 + Math.sin(a) * r * .8)}" r="${f(60 + 90 * k)}" fill="#7fe08a" opacity="${f(.14 + .12 * k)}"/>`; }
  s += `<g transform="translate(850,1000) rotate(${f(-20)})"><rect x="-50" y="-20" width="100" height="140" rx="18" fill="#9fd6ff" stroke="${OL}" stroke-width="8"/><rect x="-20" y="-60" width="40" height="44" fill="#d9a96a" stroke="${OL}" stroke-width="6"/></g>`;
  if (lv > 2.6) s += comic(210, 470, 'СУКА!', eBack((lv - 2.6) / .2), '#ff6b6b', 70);
  return s;
} };
VIEWS.meet = { draw(lv, vd, t) {
  let s = rest() + guy({ ...LENA, x: 800, y: 760, s: .72, legs: false, mouth: 'smile', brow: 'raised', t }) + guy({ ...MAX, x: 280, y: 800, s: .72, legs: false, mouth: 'open', mouthOpen: .3, brow: 'worried', sweat: 2, look: [14, 0], t }) + table() + hearts(t, 4, 400, 700);
  s += at(540, 420, pop(lv, .4), pill('19:00', '#111427', '#ffd23a', 56, 96), -3);
  return s;
} };
VIEWS.menu = { draw(lv, vd, t) {
  let s = rest() + guy({ ...MAX, x: 540, y: 760, s: .85, legs: false, mouth: 'open', mouthOpen: .5, brow: 'worried', sweat: 3, pose: 'face', t });
  s += at(540, 1030, pop(lv, .3), `<rect x="-300" y="-190" width="600" height="380" rx="14" fill="#f4eee0" stroke="${OL}" stroke-width="9"/>` + txt(0, -90, 'САЛАТ', 64, '#2a1a10') + txt(0, 40, '2000 ₽', 110, '#e5484d', { stroke: OL, sw: 10 }), -3);
  if (lv > 1.6) s += comic(190, 440, 'ЗОЛОТОЙ?!', eBack((lv - 1.6) / .2), '#ffe14a', 56);
  return s;
} };
VIEWS.order = { draw(lv, vd, t) {
  let s = rest() + guy({ ...LENA, x: 800, y: 760, s: .72, legs: false, mouth: 'open', mouthOpen: .4, brow: 'raised', t }) + guy({ ...MAX, x: 280, y: 800, s: .72, legs: false, mouth: 'smile', brow: 'raised', pose: 'out', t }) + table();
  s += at(280, 380, pop(lv, .5), pill('«МНЕ ТО ЖЕ»', '#2fd27a', '#fff', 40, 80), -4);
  return s;
} };
VIEWS.feast = { draw(lv, vd, t) {
  let s = rest() + guy({ ...LENA, x: 800, y: 760, s: .72, legs: false, mouth: 'open', mouthOpen: .5 + .3 * Math.abs(Math.sin(t * 8)), brow: 'neutral', t }) + guy({ ...MAX, x: 250, y: 800, s: .7, legs: false, mouth: 'wavy', brow: 'worried', sweat: 3, tired: 1, look: [14, 8], t }) + table();
  for (let i = 0; i < 6; i++) if (lv > .3 + i * .6) s += at(80 + i * 190, 1150 - (i % 2) * 20, pop(lv, .3 + i * .6, .25), dish(0, 0, .9, ['#d9a96a', '#7fc86a', '#e5805a'][i % 3]));
  return s;
} };
VIEWS.lobster = { draw(lv, vd, t) {
  let s = rest(1) + `<ellipse cx="540" cy="1100" rx="420" ry="90" fill="#fff" stroke="${OL}" stroke-width="10"/>` + lobster(540, 980 + Math.sin(t * 3) * 6, 1.5, .5 + .4 * Math.sin(t * 5), Math.sin(t * 2) * 3);
  s += guy({ ...MAX, x: 200, y: 1010, s: .45, legs: false, mouth: 'open', mouthOpen: .3, brow: 'worried', sweat: 2, look: [14, 0], t });
  s += at(840, 420, pop(lv, .4), pill('ЖИВОЙ ОМАР', '#e5402a', '#fff', 46, 84), 5);
  return s;
} };
VIEWS.pinch = { shakes: () => [[.6, 22, .6]], draw(lv, vd, t) {
  let s = sunburst('#ff4136', '#b8141b', t * .3);
  s += guy({ ...MAX, x: 540, y: 700, s: 1.15, legs: false, mouth: 'scream', mouthOpen: .9, brow: 'raised', pupil: 'tiny', sweat: 3, tears: 1, red: 1, pose: 'reach', t, headRot: Math.sin(t * 30) * 4 });
  s += lobster(760, 1140, 1.0, .9, 8 * Math.sin(t * 12));
  s += comic(220, 420, 'АААА!', eBack(lv / .15), '#ffe14a', 100);
  if (lv > 1.4) s += comic(850, 520, 'ПАЛЕЦ!', eBack((lv - 1.4) / .2), '#fff', 64);
  return s;
} };
VIEWS.waiter = { draw(lv, vd, t) {
  let s = rest() + guy({ ...WAIT, x: 540, y: 760, s: .95, legs: false, mouth: 'open', mouthOpen: .4, brow: 'angry', t });
  s += at(540, 1150, pop(lv, .5), `<rect x="-380" y="-120" width="760" height="240" rx="22" fill="#fff" stroke="${OL}" stroke-width="9"/>` + txt(0, -20, 'ОМАРА', 80, '#e5402a') + txt(0, 60, 'НЕ ТРОГАТЬ', 80, '#e5402a'), -3);
  return s;
} };
VIEWS.bill = { draw(lv, vd, t) {
  let s = rest(1) + `<g transform="translate(540,760) rotate(${f(-3 + Math.sin(t * 2))})"><rect x="-300" y="-330" width="600" height="660" fill="#fff" stroke="${OL}" stroke-width="9"/>${txt(0, -230, 'СЧЁТ', 70, '#2a1a10')}<path d="M-240,-170 L240,-170" stroke="${OL}" stroke-width="5" stroke-dasharray="14 10"/>${txt(0, -20, '47 000 ₽', 100, '#e5484d', { stroke: OL, sw: 8 })}</g>`;
  s += at(280, 1250, pop(lv, 1.2), `<rect x="-200" y="-70" width="400" height="140" rx="16" fill="#2f61b8" stroke="${OL}" stroke-width="8"/>` + txt(0, 18, 'КАРТА: 3 000', 44, '#fff'), -6);
  s += guy({ ...MAX, x: 820, y: 1060, s: .48, legs: false, mouth: 'wavy', brow: 'worried', sweat: 3, tired: 1, look: [-14, 0], t });
  return s;
} };
VIEWS.window = { draw(lv, vd, t) {
  let s = BG('#1b2340') + `<rect x="-700" y="1240" width="2480" height="1400" fill="#e8f0f8"/>`;
  s += `<rect x="240" y="300" width="600" height="760" fill="#9fd0ff" stroke="#2a1c10" stroke-width="16"/><rect x="540" y="300" width="300" height="760" fill="#fff" opacity=".0"/>`;
  const k = eOut(clamp(lv / 2));
  s += guy({ ...MAX, x: 540, y: 800 + 120 * k, s: .55, legs: false, mouth: 'flat', brow: 'worried', sweat: 3, look: [0, 10], pose: 'out', t });
  s += `<rect x="240" y="${f(840 + 120 * k)}" width="600" height="${f(220 - 120 * k)}" fill="#7a4a2a" stroke="#2a1c10" stroke-width="12"/>`;
  s += at(840, 1360, pop(lv, 1.0), txt(0, 0, 'ТУАЛЕТ', 64, '#2a1a10', { stroke: '#fff', sw: 10 }), 8);
  return s;
} };
VIEWS.run = { draw(lv, vd, t) {
  let s = BG('#142040') + `<rect x="-700" y="1230" width="2480" height="1400" fill="#e8f0fa"/>`;
  s += particles(60, 6, t, { y0: -100, y1: 1900, speed: 700, size: 8, col: ['#fff'], op: .9 });
  const bob = Math.abs(Math.sin(t * 11)) * 26;
  s += guy({ ...MAX, x: 540, y: 740 - bob, s: .85, legs: false, mouth: 'scream', mouthOpen: .6, brow: 'worried', sweat: 3, pose: 'out', hairWind: 1, t, headRot: Math.sin(t * 11) * 4 });
  for (let i = 0; i < 7; i++) { const q = ((t * .8 + i / 7) % 1); s += `<circle cx="${f(380 + 300 * Math.sin(i * 2.1 + t))}" cy="${f(820 + q * 260)}" r="${f(40 + q * 80)}" fill="#7fe08a" opacity="${f(.28 * (1 - q))}"/>`; }
  s += at(840, 360, pop(lv, 1.5), pill('ДУХИ -50%', '#7fe08a', '#143a1a', 40, 76), 6);
  return s;
} };
VIEWS.call = { draw(lv, vd, t) {
  let s = BG('#142040') + `<rect x="-700" y="1230" width="2480" height="1400" fill="#cfd8e6"/>`;
  s += guy({ ...MAX, x: 300, y: 920, s: .62, legs: false, mouth: 'open', mouthOpen: .4, brow: 'raised', sweat: 2, tired: 1, look: [14, 0], t });
  s += at(780, 760, 1, `<g transform="rotate(${f(Math.sin(t * 20) * 3)})"><rect x="-190" y="-340" width="380" height="680" rx="44" fill="#111427" stroke="#8a93a3" stroke-width="10"/><rect x="-166" y="-310" width="332" height="620" rx="26" fill="#1c2a55"/>${txt(0, -100, 'ЛЕНА ❤', 56, '#fff')}<circle cx="0" cy="130" r="70" fill="#2fd27a"/>${txt(0, 150, '✆', 80, '#fff')}</g>`);
  if (lv > 2.4) s += comic(440, 420, 'Я ВСЁ ОПЛАТИЛА', eBack((lv - 2.4) / .25), '#fff', 46, -4);
  return s;
} };
VIEWS.twist = { draw(lv, vd, t) {
  let s = BG('#ffd9ec') + `<rect x="-700" y="1240" width="2480" height="1400" fill="#e89ab0"/>` + hearts(t, 5, 250, 800);
  s += guy({ ...LENA, x: 540, y: 740, s: .95, legs: false, mouth: 'smile', brow: 'raised', pose: 'hold', t });
  s += lobster(540, 1180, .8, .2 * Math.sin(t * 3), Math.sin(t * 2) * 3);
  s += at(540, 380, pop(lv, .6), pill('ОМАР — ЕЁ', '#ff4d6d', '#fff', 56, 100), -3);
  return s;
} };
VIEWS.end = { draw(lv, vd, t) {
  let s = sunburst('#ffb3cf', '#ff6b9a', t * .12) + hearts(t, 6, 150, 1000);
  s += guy({ ...LENA, x: 800, y: 780, s: .7, legs: false, mouth: 'smile', brow: 'raised', pose: 'out', t }) + guy({ ...MAX, x: 280, y: 800, s: .7, legs: false, mouth: 'smile', brow: 'worried', pose: 'down', bandage: true, t });
  s += lobster(540, 1260, .55, .5 + .4 * Math.sin(t * 4), 0) + `<path d="M500,1315 l-30,26 l60,0z M580,1315 l30,26 l-60,0z" fill="#111427"/>`;
  s += at(540, 380, pop(lv, .3), `<rect x="-340" y="-80" width="680" height="160" rx="30" fill="#111427" stroke="#ffd23a" stroke-width="8"/>` + txt(0, 14, 'СВИДЕТЕЛЬ: ОМАР', 52, '#ffd23a'), -3);
  return s;
} };
