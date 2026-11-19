// «Лахта-центр» — факт-ролик, кинематографичный стиль.
function cloud(x, y, s, col = '#fff', op = 1) {
  return `<g transform="translate(${f(x)},${f(y)}) scale(${s})" opacity="${op}"><path d="M-200,40 Q-230,-40 -140,-50 Q-120,-130 -30,-110 Q20,-170 100,-110 Q190,-120 190,-30 Q250,0 210,50 Z" fill="${col}"/></g>`;
}
function tower(x, base, h, wTop = 70, wBase = 230) {
  // силуэт башни: сужается к верху, с ярусами и светящимися окнами
  const top = base - h;
  let g = `<path d="M${x - wBase / 2},${base} L${x - wTop / 2},${top} L${x + wTop / 2},${top} L${x + wBase / 2},${base}Z" fill="#c9d8e8" stroke="${OL}" stroke-width="8" stroke-linejoin="round"/>`;
  for (let y = base - 40; y > top + 30; y -= 36) {
    const k = (base - y) / h, half = (wBase / 2) * (1 - k) + (wTop / 2) * k;
    g += `<path d="M${x - half},${y} L${x + half},${y}" stroke="#8fa6bf" stroke-width="4"/>`;
  }
  return g;
}
function sea(t, y = 1150) {
  let s = `<rect x="-700" y="${y}" width="2480" height="2000" fill="#2b6a9a"/>`;
  for (let i = 0; i < 9; i++) s += `<path d="M${f(((t * 40 + i * 180) % 1300) - 150)},${y + 40 + i * 60} q50,-12 100,0" fill="none" stroke="#9fd0ef" stroke-width="5" opacity=".6"/>`;
  return s;
}
function sky(t) {
  let s = `<linearGradient id="lk${++uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fb8f0"/><stop offset="1" stop-color="#dff3ff"/></linearGradient><rect x="-700" y="-700" width="2480" height="3300" fill="url(#lk${uid})"/>`;
  for (let i = 0; i < 4; i++) s += cloud(((t * 30 + i * 300) % 1400) - 200, 260 + i * 110, 1.1, '#ffffff', .9);
  return s;
}
VIEWS.hook = { draw(lv, vd, t) {
  let s = sky(t) + sea(t);
  const k = eOut(lv / 1.2);
  s += `<g transform="translate(540,1150) scale(${f((.55 + .45 * k) * 100) / 100}) translate(-540,-1150)">${tower(540, 1150, 900)}</g>`;
  return s + `<rect x="-700" y="-700" width="2480" height="3300" fill="url(#vigDark)"/>`;
} };
VIEWS.height = { draw(lv, vd, t, ctx) {
  let s = BG('#101a2e') + stars(30, 0, 0, 1080, 900, t, 2);
  const h = Math.round(462 * eOut(lv / 1.1) * 10) / 10;
  s += `<rect x="-700" y="1150" width="2480" height="2000" fill="#1d2a40"/>` + tower(540, 1150, 820, 80, 240);
  s += `<path d="M160,${1150 - 820 * eOut(lv / 1.1)} L920,${1150 - 820 * eOut(lv / 1.1)}" stroke="#ffd23a" stroke-width="5" stroke-dasharray="18 12"/>`;
  s += at(540, 380, pop(lv, .2), `<rect x="-300" y="-80" width="600" height="160" rx="30" fill="#111427" stroke="${OL}" stroke-width="8"/>` + txt(0, 4, h.toFixed(0) + ' М', 110, '#ffd23a'));
  s += at(540, 600, pop(lv, .8), pill('87 ЭТАЖЕЙ', '#2fd27a', '#111427', 48, 88));
  return s;
} };
VIEWS.history = { draw(lv, vd, t) {
  let s = BG('#2a3550') + `<rect x="-700" y="1180" width="2480" height="2000" fill="#3a4560"/>`;
  s += `<g opacity="${f(clamp(lv / .4))}">${[0, 1, 2].map(i => `<rect x="${120 + i * 300}" y="${760 - (i % 2) * 90}" width="180" height="${420 + (i % 2) * 90}" fill="#6b7a95" stroke="${OL}" stroke-width="6"/>`).join('')}</g>`;
  for (let i = 0; i < 9; i++) s += guy({ shirt: ['#e5484d', '#2f9bff', '#ffd23a'][i % 3], hair: '#222', hairD: '#111', x: 160 + (i % 5) * 180, y: 1150 + Math.floor(i / 5) * 80, s: .34, legs: false, mouth: 'open', mouthOpen: .3 + .3 * Math.abs(Math.sin(t * 5 + i)), pose: 'up', t });
  s += at(540, 420, pop(lv, .3), pill('ПРОТЕСТ', '#ff3b3b', '#fff', 54, 92), -3);
  return s + `<rect x="-700" y="-700" width="2480" height="3300" fill="url(#vigDark)"/>`;
} };
VIEWS.move = { draw(lv, vd, t) {
  let s = sky(t) + sea(t);
  const k = eInOut(lv / 1.2);
  s += `<g transform="translate(${f(lerp(200, 720, k))},0)">${tower(0, 1150, 760, 70, 210)}</g>`;
  s += at(540, 300, pop(lv, .4), pill('ЛАХТА', '#111427', '#ffd23a', 58, 100));
  return s + `<rect x="-700" y="-700" width="2480" height="3300" fill="url(#vigDark)"/>`;
} };
VIEWS.build = { draw(lv, vd, t) {
  let s = BG('#3a2e1e') + `<rect x="-700" y="1150" width="2480" height="2000" fill="#6a5238"/>`;
  const n = Math.min(14, 1 + Math.floor(lv / vd * 14));
  for (let i = 0; i < n; i++) s += `<rect x="${f(270 + (i % 2) * 14)}" y="${f(1150 - (i + 1) * 62)}" width="${f(540 - (i % 2) * 28)}" height="54" fill="#c9d8e8" stroke="${OL}" stroke-width="5"/>`;
  s += `<path d="M180,1150 L180,${1150 - 14 * 62 - 40} M900,1150 L900,${1150 - 14 * 62 - 40}" stroke="#8a6a3a" stroke-width="10"/><path d="M160,${1150 - 14 * 62 - 40} L920,${1150 - 14 * 62 - 40}" stroke="#ffd23a" stroke-width="8"/>`;
  s += at(540, 380, 1, `<rect x="-260" y="-70" width="520" height="140" rx="30" fill="#111427" stroke="${OL}" stroke-width="8"/>` + txt(0, 4, Math.round(n / 14 * 10) + ' ЛЕТ', 80, '#ffd23a'));
  return s + `<rect x="-700" y="-700" width="2480" height="3300" fill="url(#vigDark)"/>`;
} };
VIEWS.view = { draw(lv, vd, t) {
  let s = sky(t) + sea(t);
  s += tower(540, 1150, 560, 100, 240);
  s += `<rect x="462" y="${1150 - 560 + 40}" width="156" height="34" rx="8" fill="#ffd23a" stroke="${OL}" stroke-width="5"/>`;
  s += at(540, 380, pop(lv, .3), pill('ОБЗОР — 360°', '#111427', '#fff', 50, 90));
  return s + `<rect x="-700" y="-700" width="2480" height="3300" fill="url(#vigDark)"/>`;
} };
VIEWS.cta = { draw(lv, vd, t) {
  let s = sunburst('#3fd17a', '#14905a', t * .12);
  s += guy({ shirt: '#2f9bff', hair: '#3a2414', hairD: '#24160b', x: 540, y: 820, s: 1.05, legs: false, mouth: 'smile', brow: 'raised', t });
  [[200, 560, 0], [880, 560, .15]].forEach(([x, y, d], i) => { s += at(x, y + Math.sin(t * 4 + i) * 12, pop(lv, .3 + d), txt(0, 0, '?', 130, '#fff', { stroke: OL, sw: 16 }), 12 * Math.sin(t * 3 + i)); });
  return s;
} };
