// «Остались только кирики и газява» — зимний дизайн эталона.
const GUY = { shirt: '#3b4a5c', hair: '#3a2a1e', hairD: '#24180f', beard: '#4a3a2a', browCol: '#2a1a10', tired: .6 };
function kpack(x, y, s, rot = 0) {
  return `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)}) scale(${s})"><path d="M-120,-170 Q-140,0 -120,170 L120,170 Q140,0 120,-170Z" fill="#ff8a1f" stroke="${OL}" stroke-width="8"/><ellipse cx="0" cy="-60" rx="95" ry="46" fill="#ffd23a" stroke="${OL}" stroke-width="5"/>${txt(0, -60, 'КИРИКИ', 30, '#c2410c')}${[[-50, 50], [0, 80], [50, 45], [-20, 120], [40, 115]].map(([cx, cy]) => `<rect x="${cx - 22}" y="${cy - 22}" width="44" height="44" rx="8" fill="#e8b45a" stroke="${OL}" stroke-width="5"/>`).join('')}</g>`;
}
function gbottle(x, y, s, rot = 0, lvl = .6) {
  const body = `M-34,-250 L34,-250 L34,-210 Q90,-170 90,-110 L90,180 Q90,210 60,210 L-60,210 Q-90,210 -90,180 L-90,-110 Q-90,-170 -34,-210Z`;
  return `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)}) scale(${s})"><path d="${body}" fill="#e8f4ff" fill-opacity=".45"/><path d="M-90,${f(200 - 390 * lvl)} Q0,${f(190 - 390 * lvl)} 90,${f(200 - 390 * lvl)} L90,180 Q90,210 60,210 L-60,210 Q-90,210 -90,180Z" fill="#5a2a12"/><rect x="-92" y="-40" width="184" height="110" fill="#e5222b"/><path d="${body}" fill="none" stroke="${OL}" stroke-width="8"/><rect x="-40" y="-290" width="80" height="46" rx="10" fill="#e5222b" stroke="${OL}" stroke-width="7"/></g>`;
}
function snow(t, n = 120, seed = 4) { return particles(n, seed, t, { col: '#ffffff', size: 4, speed: 140, op: .75, drift: 26 }); }
function winterBG(t, glow = 0) {
  let s = `<linearGradient id="wn${++uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c1830"/><stop offset="1" stop-color="#2b4066"/></linearGradient><rect x="-700" y="-700" width="2480" height="3300" fill="url(#wn${uid})"/>`;
  s += stars(40, 0, 0, 1080, 800, t, 11);
  s += `<path d="M-700,1180 L-100,1040 L200,1120 L520,1000 L860,1110 L1180,1020 L1780,1160 L1780,2600 L-700,2600Z" fill="#dfe8f2" opacity=".9"/>`;
  s += `<rect x="-700" y="1180" width="2480" height="1400" fill="#c9d6e4"/>`;
  return s + snow(t) + (glow ? `<circle cx="540" cy="700" r="520" fill="#ffb347" opacity="${f(glow)}" filter="url(#blur30)"/>` : '');
}
function scene(name, draw) { VIEWS[name] = { draw }; }

VIEWS.hook = { draw(lv, vd, t) {
  let s = winterBG(t);
  s += `<g opacity="${f(clamp(lv / .6))}">${txt(540, 330, 'ОСТАЛИСЬ', 120, '#fff', { stroke: OL, sw: 14 })}${txt(540, 460, 'ТОЛЬКО', 120, '#ffd23a', { stroke: OL, sw: 14 })}</g>`;
  s += at(540, 1080, pop(lv, .3), `<rect x="-260" y="-150" width="520" height="300" rx="30" fill="#111427" opacity=".85"/>` + kpack(-140, 0, .5, -6) + gbottle(140, 10, .42, 6));
  return s + `<rect x="-700" y="-700" width="2480" height="3300" fill="url(#vigDark)"/>`;
} };
VIEWS.shelf = { draw(lv, vd, t) {
  let s = BG('#1a1f2e') + `<rect x="-700" y="1150" width="2480" height="1400" fill="#2a2f3e"/>`;
  for (const y of [520, 820, 1120]) s += `<rect x="80" y="${y}" width="920" height="26" fill="#6b5a4a" stroke="${OL}" stroke-width="6"/><rect x="80" y="${y + 26}" width="920" height="16" fill="#3a3024"/>`;
  s += kpack(330, 480, .4) + gbottle(560, 470, .45, 0, .2) + kpack(700, 780, .4) + gbottle(330, 1100, .45, 0, .1) + gbottle(560, 1100, .45, 0, .1) + gbottle(790, 1100, .45, 0, .05);
  s += `<path d="M120,1000 L300,1100" stroke="#000" opacity=".1"/>`;
  s += at(540, 260, pop(lv, .5), `<rect x="-290" y="-60" width="580" height="120" rx="26" fill="#111427" stroke="${OL}" stroke-width="7"/>` + txt(0, 2, 'ПУСТО', 84, '#ff6b6b'));
  return s + snow(t, 40, 9) + `<rect x="-700" y="-700" width="2480" height="3300" fill="url(#vigDark)"/>`;
} };
VIEWS.eat = { draw(lv, vd, t) {
  let s = winterBG(t, .15);
  s += guy({ ...GUY, x: 540, y: 740, s: 1.05, legs: false, mouth: 'open', mouthOpen: .5 + .4 * Math.abs(Math.sin(t * 6)), brow: 'worried', pose: 'hold', t });
  s += at(540, 1020, 1, kpack(0, 0, .42, Math.sin(t * 4) * 8));
  s += at(860, 470, pop(lv, .6), pill('ДЕНЬ 14', '#111427', '#ffd23a', 40, 74));
  return s;
} };
VIEWS.soda = { draw(lv, vd, t) {
  let s = winterBG(t);
  s += guy({ ...GUY, x: 540, y: 740, s: 1.05, legs: false, mouth: 'flat', brow: 'angry', pose: 'hold', t });
  s += at(540, 1040, 1, gbottle(0, 0, .42, Math.sin(t * 5) * 6, .5));
  s += at(820, 470, pop(lv, .4), pill('ТЁПЛАЯ', '#ff6b6b', '#fff', 42, 78));
  return s + `<rect x="-700" y="-700" width="2480" height="3300" fill="url(#vigDark)"/>`;
} };
VIEWS.cold = { shakes: () => [[.1, 8, .3]], draw(lv, vd, t) {
  let s = BG('#070b18') + `<rect x="150" y="260" width="780" height="620" rx="16" fill="#1a2a4a" stroke="${OL}" stroke-width="12"/>`;
  s += `<rect x="170" y="280" width="740" height="580" fill="#0e1a30"/>` + snow(t, 80, 21);
  s += `<path d="M170,780 L300,600 L420,700 L560,540 L700,700 L910,640 L910,860 L170,860Z" fill="#dfe8f2" opacity=".85"/>`;
  s += `<text x="540" y="620" font-family="Rub" font-weight="900" font-size="200" fill="#8fb8ff" text-anchor="middle" opacity=".55">-30</text>`;
  s += guy({ ...GUY, x: 540, y: 1000, s: .75, legs: false, mouth: 'flat', brow: 'worried', tired: 1, sweat: 0, t });
  s += at(540, 1260, pop(lv, .3), pill('ОТОПЛЕНИЕ: 0%', '#111427', '#8fb8ff', 40, 74));
  return s + `<rect x="-700" y="-700" width="2480" height="3300" fill="url(#vigDark)"/>`;
} };
VIEWS.hall = { draw(lv, vd, t) {
  let s = BG('#0a0a12') + stars(30, 0, 0, 1080, 1200, t, 5);
  for (let i = 0; i < 6; i++) { const x = 180 + (i % 3) * 330, y = 380 + Math.floor(i / 3) * 520 + Math.sin(t * 2 + i) * 14; s += kpack(x, y, .42, Math.sin(t + i) * 10); }
  s += guy({ ...GUY, x: 540, y: 1150, s: .6, legs: false, mouth: 'open', mouthOpen: .8, brow: 'raised', t, pose: 'out' });
  s += `<rect x="-700" y="-700" width="2480" height="3300" fill="#6a2aff" opacity="${f(.08 + .05 * Math.sin(t * 6))}"/>`;
  return s + `<rect x="-700" y="-700" width="2480" height="3300" fill="url(#vigDark)"/>`;
} };
VIEWS.last = { draw(lv, vd, t) {
  let s = winterBG(t, .25);
  s += at(540, 800, pop(lv, .1), gbottle(0, 0, .95, Math.sin(t * 2) * 4, .05));
  s += at(860, 1000, pop(lv, .6), kpack(0, 0, .35, -12));
  s += at(540, 420, pop(lv, .4), pill('ПОСЛЕДНЯЯ', '#111427', '#ffd23a', 46, 84));
  return s + `<rect x="-700" y="-700" width="2480" height="3300" fill="url(#vigDark)"/>`;
} };
VIEWS.end = { draw(lv, vd, t) {
  let s = BG('#060912') + snow(t, 60, 31);
  s += guy({ ...GUY, x: 540, y: 820, s: 1.0, legs: false, mouth: 'flat', brow: 'raised', look: [Math.sin(t * 2) * 14, -6], t });
  s += at(230, 560, pop(lv, .2), kpack(0, 0, .35, -10)) + at(850, 560, pop(lv, .35), gbottle(0, 0, .4, 8, .3));
  s += at(540, 380, pop(lv, .6), txt(0, 0, '?', 130, '#fff', { stroke: OL, sw: 16 }));
  return s + `<rect x="-700" y="-700" width="2480" height="3300" fill="url(#vigDark)"/>`;
} };
VIEWS.hall2 = VIEWS.hall;
