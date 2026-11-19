// «Проспал собеседование» — мультяшные сцены.
const ME = { shirt: '#3b82c4', hair: '#3a2414', hairD: '#24160b', beard: '#4a3a2a', browCol: '#2a1a10' };
const BOSS = { shirt: '#2a2f45', hair: '#d8d8d8', hairD: '#b0b0b0', glasses: true, browCol: '#c0c0c0' };
function clockFace(r, h, m, ring = '#e5484d') {
  let g = `<circle r="${r}" fill="#fff" stroke="${OL}" stroke-width="10"/><circle r="${r * .88}" fill="none" stroke="${ring}" stroke-width="6"/>`;
  for (let k = 0; k < 12; k++) g += `<path d="M0,${-r * .8} L0,${-r * (k % 3 ? .72 : .64)}" transform="rotate(${k * 30})" stroke="${OL}" stroke-width="${k % 3 ? 4 : 8}" stroke-linecap="round"/>`;
  g += `<path d="M0,0 L0,${-r * .45}" transform="rotate(${(h % 12) * 30 + m * .5})" stroke="${OL}" stroke-width="12" stroke-linecap="round"/><path d="M0,0 L0,${-r * .7}" transform="rotate(${m * 6})" stroke="${OL}" stroke-width="8" stroke-linecap="round"/><circle r="12" fill="${ring}"/>`;
  return g;
}
function room(t, dark = 0) {
  return BG(dark ? '#0e1430' : '#d8c3a5') + `<rect x="-700" y="1230" width="2480" height="1400" fill="${dark ? '#1a1f3a' : '#9a7a5a'}"/>` + `<rect x="760" y="260" width="240" height="320" fill="${dark ? '#0a1028' : '#9fd0ff'}" stroke="#2a1c10" stroke-width="12"/>` + (dark ? `<circle cx="880" cy="380" r="46" fill="#f4f1d8"/>` : '');
}
function bed(x, y, s) { return `<g transform="translate(${x},${y}) scale(${s})"><rect x="-340" y="-40" width="680" height="190" rx="24" fill="#5a4636" stroke="${OL}" stroke-width="9"/><rect x="-320" y="-110" width="640" height="110" rx="30" fill="#e8e0f0" stroke="${OL}" stroke-width="8"/><rect x="-310" y="-150" width="190" height="80" rx="30" fill="#fff" stroke="${OL}" stroke-width="7"/></g>`; }
VIEWS.night = { draw(lv, vd, t) {
  let s = room(t, 1) + stars(14, 780, 270, 220, 300, t, 3) + bed(480, 1200, 1.0);
  s += guy({ ...ME, x: 300, y: 1000, s: .55, legs: false, eyes: 'closed', mouth: 'open', mouthOpen: .3, headRot: -60, t });
  for (let i = 0; i < 3; i++) { const q = ((lv * .5 + i / 3) % 1); s += txt(420 + q * 90, 880 - q * 300, 'Z', 70 + i * 24, '#cfe0ff', { stroke: OL, sw: 10, op: f(1 - q) }); }
  s += at(300, 480, pop(lv, .3), `<g transform="scale(.9)">${clockFace(110, 3, 0, '#4a6aff')}</g>`);
  return s + `<rect x="-700" y="-700" width="2480" height="3300" fill="url(#vigDark)"/>`;
} };
VIEWS.alarm = { shakes: () => [[.05, 14, 3.5]], draw(lv, vd, t) {
  let s = sunburst('#ff4136', '#b8141b', t * .3);
  const sh = Math.sin(t * 70) * 8;
  s += `<g transform="translate(${540 + sh},760) rotate(${Math.sin(t * 60) * 5})"><circle cx="-190" cy="-250" r="70" fill="#ffd23a" stroke="${OL}" stroke-width="9"/><circle cx="190" cy="-250" r="70" fill="#ffd23a" stroke="${OL}" stroke-width="9"/><g transform="scale(1.7)">${clockFace(160, 9, 0)}</g></g>`;
  for (let i = 0; i < 5; i++) { const q = ((t * 2 + i / 5) % 1); s += `<circle cx="540" cy="760" r="${f(330 + q * 330)}" fill="none" stroke="#fff" stroke-width="8" opacity="${f(.6 * (1 - q))}"/>`; }
  s += comic(210, 380, 'ДЗЫНЬ!', eBack(lv / .15), '#ffe14a', 70) + comic(870, 1100, 'ДЗЫНЬ!', eBack((lv - .25) / .15), '#fff', 64);
  return s;
} };
VIEWS.wake = { shakes: ctx => [[1.4, 18, .5]], draw(lv, vd, t) {
  let s = room(t) + bed(540, 1250, 1.05);
  s += guy({ ...ME, x: 540, y: 880 - 20 * eOut(lv / .3), s: .85, legs: false, mouth: lv < 1.3 ? 'open' : 'scream', mouthOpen: .8, brow: 'raised', lid: 0, pupil: 'tiny', sweat: 3, headRot: lv < 1.3 ? 6 * Math.sin(t * 8) : 0, t });
  s += `<g transform="translate(240,420)">${clockFace(110, 9, 0)}</g>`;
  if (lv > 1.4) s += comic(840, 520, 'СОБЕС!', eBack((lv - 1.4) / .2), '#ffe14a', 76) + at(260, 700, pop(lv, 1.6), txt(0, 0, '!!!', 120, '#ff3b3b', { stroke: OL, sw: 14 }), -8);
  return s;
} };
VIEWS.run = { draw(lv, vd, t, ctx) {
  let s = BG('#8fd0ff') + `<rect x="-700" y="1230" width="2480" height="1400" fill="#5a5f6e"/>`;
  s += [0, 1, 2, 3].map(i => `<rect x="${((i * 340 - t * 700) % 1500 + 1500) % 1500 - 200}" y="1400" width="170" height="16" fill="#fff"/>`).join('');
  for (let i = 0; i < 4; i++) { const x = ((i * 480 - t * 220) % 1900 + 1900) % 1900 - 300, h = 360 + (i % 3) * 120; s += `<rect x="${f(x)}" y="${1230 - h}" width="220" height="${h}" fill="${['#c9d6e6', '#a8bbd0', '#dfe8f2'][i % 3]}" stroke="${OL}" stroke-width="6"/>`; }
  const bob = Math.abs(Math.sin(t * 11)) * 26, s1 = ctx.segRel[1] ?? 9;
  s += guy({ ...ME, x: 540, y: 760 - bob, s: .8, legs: false, mouth: 'scream', mouthOpen: .6, brow: 'worried', sweat: 3, pose: 'out', hairWind: 1, t, headRot: Math.sin(t * 11) * 4 });
  s += `<g transform="translate(${f(540 + Math.sin(t * 11) * 60)},${f(1190 - bob * .4)})"><rect x="-70" y="-6" width="60" height="150" rx="26" fill="#cfd6df" stroke="${OL}" stroke-width="8" transform="rotate(${f(Math.sin(t * 11) * 25)},-40,0)"/><rect x="20" y="-6" width="60" height="150" rx="26" fill="#cfd6df" stroke="${OL}" stroke-width="8" transform="rotate(${f(-Math.sin(t * 11) * 25)},50,0)"/></g>`;
  s += `<g transform="translate(${f(540 + Math.sin(t * 11) * 60)},1330)"><path d="M-90,0 L-10,0 Q20,0 30,24 L-90,24Z" fill="#e5484d" stroke="${OL}" stroke-width="6"/></g>`;
  if (lv > s1) s += at(840, 520, pop(lv, s1), txt(0, 0, '?', 160, '#fff', { stroke: OL, sw: 16 }), 10);
  return s;
} };
VIEWS.arrive = { draw(lv, vd, t) {
  let s = BG('#5a6a82') + `<rect x="-700" y="1230" width="2480" height="1400" fill="#3a4152"/><rect x="200" y="360" width="680" height="880" fill="#c9d6e6" stroke="${OL}" stroke-width="10"/><rect x="420" y="760" width="240" height="480" fill="#2a2f45"/>` + txt(540, 540, 'ОФИС', 100, '#2a2f45', { stroke: '#fff', sw: 10 });
  s += `<g transform="translate(540,300)">${clockFace(90, 11, 0)}</g>`;
  let rain = ''; const r = rng(2); for (let i = 0; i < 70; i++) { const x = r() * 1300 - 100, y = ((r() * 2200 + t * 2400) % 2200) - 200; rain += `M${f(x)},${f(y)} l-22,76 `; }
  s += `<path d="${rain}" stroke="#cfe0ff" stroke-width="4" opacity=".6"/>`;
  s += guy({ ...ME, x: 540, y: 880, s: .85, legs: false, mouth: 'flat', brow: 'tired', tired: 1, lid: .5, sweat: 3, hair: '#24160b', t });
  return s + `<rect x="-700" y="-700" width="2480" height="3300" fill="url(#vigDark)"/>`;
} };
VIEWS.hr = { draw(lv, vd, t, ctx) {
  const s1 = ctx.segRel[1] ?? 9, talk = lv < s1 && Math.floor(t * 7) % 2;
  let s = BG('#d9e4ee') + `<rect x="-700" y="1180" width="2480" height="1400" fill="#7a5a3a"/><rect x="60" y="1100" width="960" height="60" fill="#5a3f26" stroke="${OL}" stroke-width="8"/>`;
  s += guy({ ...BOSS, x: 330, y: 740, s: .85, legs: false, mouth: talk ? 'open' : 'flat', mouthOpen: .4, brow: 'neutral', t });
  s += guy({ ...ME, x: 780, y: 800, s: .8, legs: false, mouth: lv > s1 ? 'open' : 'smile', mouthOpen: .5, brow: lv > s1 ? 'raised' : 'worried', sweat: 2, look: [-14, 0], t });
  s += at(540, 1100, 1, `<rect x="-120" y="-14" width="240" height="14" fill="#fff"/><rect x="-100" y="-34" width="200" height="20" fill="#ffe28a" stroke="${OL}" stroke-width="4"/>`);
  if (lv > .8) s += at(540, 380, pop(lv, .8), pill('ОПОЗДАНИЕ: 2 ЧАСА', '#ff3b3b', '#fff', 40, 76), -3);
  if (lv > s1 + .4) s += comic(560, 520, 'ПРИНЯТ!', eBack((lv - s1 - .4) / .2), '#7bd389', 80);
  return s;
} };
VIEWS.end = { draw(lv, vd, t) {
  let s = sunburst('#2fd27a', '#14905a', t * .12) + guy({ ...ME, x: 540, y: 820, s: 1.05, legs: false, mouth: 'smile', brow: 'raised', pose: 'out', t });
  s += at(540, 1150, pop(lv, .3), `<rect x="-300" y="-110" width="600" height="220" rx="14" fill="#fff" stroke="#e5484d" stroke-width="14" transform="rotate(-6)"/>` + txt(0, 6, 'ПРИНЯТ', 130, '#e5484d'), -6);
  s += particles(40, 5, t, { y0: -100, y1: 1400, speed: 280, size: 9, col: ['#ffd23a', '#fff', '#e5484d'], op: .9, shape: 'leaf' });
  return s;
} };
