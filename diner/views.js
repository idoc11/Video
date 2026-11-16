// «Харчевня на 600к» — картинки сцен (мультяшный стиль).
const ME = { shirt: '#ff7a3a', hair: '#3a2414', hairD: '#24160b' };
const GENA = { shirt: '#f4f6fa', hair: '#c9a06a', hairD: '#9a7a4a', messy: .8, blush: .6 };
const OLDMAN = { shirt: '#6a7a5a', hair: '#e8e8e8', hairD: '#c9c9c9', beard: '#eeeeee', glasses: true, browCol: '#d0d0d0' };
const INSP = { shirt: '#ffffff', hair: '#2a2a2a', hairD: '#111', glasses: true };
function sign(x, y, s, broken = 0) {
  return `<g transform="translate(${x},${y}) scale(${s}) rotate(${f(broken * 8)})"><rect x="-260" y="-70" width="520" height="140" rx="16" fill="#7a3a1e" stroke="${OL}" stroke-width="8"/><rect x="-240" y="-52" width="480" height="104" rx="10" fill="#a0522d"/>` + txt(0, 4, 'ХАРЧЕВНЯ', 78, '#ffd23a', { stroke: OL, sw: 8 }) + `<path d="M-200,-70 L-220,-160 M200,-70 L220,-160" stroke="${OL}" stroke-width="8"/></g>`;
}
function bowl(x, y, s, soup = '#c0392b', flies = 0, t = 0, roach = false) {
  let g = `<ellipse cx="0" cy="-10" rx="150" ry="40" fill="${soup}" stroke="${OL}" stroke-width="7"/><path d="M-150,-10 Q-140,90 0,95 Q140,90 150,-10Z" fill="#f4f1ea" stroke="${OL}" stroke-width="8"/><path d="M-100,40 Q0,70 100,40" fill="none" stroke="#3b82c4" stroke-width="10"/>`;
  for (let i = 0; i < 3; i++) g += `<path d="M${-50 + i * 50},-50 q-20,-40 0,-80 q20,-40 0,-80" fill="none" stroke="#fff" stroke-width="8" opacity=".5"/>`;
  if (roach) g += `<g transform="translate(30,-14) rotate(-20)"><ellipse rx="34" ry="18" fill="#5a2e14" stroke="${OL}" stroke-width="5"/><path d="M28,-6 Q60,-30 80,-24 M28,6 Q60,30 80,24" fill="none" stroke="${OL}" stroke-width="4"/>${[-16, 0, 16].map(x => `<path d="M${x},-14 l-8,-20 M${x},14 l-8,20" stroke="${OL}" stroke-width="4"/>`).join('')}</g>`;
  for (let i = 0; i < flies; i++) { const a = t * 4 + i * 2.1; g += `<g transform="translate(${f(Math.cos(a) * 160)},${f(-140 + Math.sin(a * 1.3) * 60)})"><circle r="10" fill="#111"/><ellipse cx="-8" cy="-10" rx="10" ry="6" fill="#cfe8ff" opacity=".8"/><ellipse cx="8" cy="-10" rx="10" ry="6" fill="#cfe8ff" opacity=".8"/></g>`; }
  return `<g transform="translate(${f(x)},${f(y)}) scale(${s})">${g}</g>`;
}
const money = (x, y, label, col = '#ff3b3b') => pill(label, '#111427', col, 54, 92);
VIEWS.hook = { draw(lv, vd, t, ctx) {
  let s = sunburst('#ffb02e', '#e07a0a', t * .12);
  s += sign(540, 420, 1.1);
  s += guy({ ...ME, x: 540, y: 760, s: 1.0, legs: false, mouth: 'smile', brow: 'raised', pose: 'out', t });
  const s1 = ctx.segRel[1] ?? 9;
  for (let i = 0; i < 14; i++) { const r = rng(i + 3), q = ((t * .6 + r()) % 1); s += `<g transform="translate(${f(540 + (r() - .5) * 900 * q)},${f(1150 - q * 900)}) rotate(${f(t * 120 + i * 40)})" opacity="${f(1 - q)}"><rect x="-50" y="-26" width="100" height="52" rx="6" fill="#7bd389" stroke="${OL}" stroke-width="4"/>${txt(0, 2, '₽', 30, '#1d7a3a')}</g>`; }
  s += at(540, 1170, pop(lv, .3), money(0, 0, '600 000 ₽', '#ffe14a'));
  if (lv > s1) s += comic(830, 640, 'ГЕНИЙ', eBack((lv - s1 - .4) / .25), '#fff', 60);
  return s;
} };
VIEWS.rent = { draw(lv, vd, t) {
  let s = sunburst('#ff6a3a', '#c8341a', t * .1);
  const v = lv < .5 ? 600 : lv < 1.8 ? 400 : 200;
  s += at(540, 520, 1, `<rect x="-260" y="-80" width="520" height="160" rx="30" fill="#111427" stroke="${OL}" stroke-width="8"/>` + txt(0, 4, v + ' 000 ₽', 96, v > 300 ? '#ffe14a' : '#ff6b6b'));
  s += at(300, 860, pop(lv, .6), money(0, 0, 'АРЕНДА −200К'), -6) + at(780, 1010, pop(lv, 1.9), money(0, 0, 'РЕМОНТ −200К'), 6);
  return s;
} };
VIEWS.gena = { draw(lv, vd, t) {
  let s = sunburst('#ffd23a', '#e0a800', t * .1);
  s += guy({ ...GENA, x: 540, y: 700, s: 1.0, legs: false, mouth: 'wavy', brow: 'worried', pose: 'hold', sweat: 2, t });
  s += `<g transform="translate(540,1120)"><ellipse cx="0" cy="0" rx="170" ry="40" fill="#2a2e3a" stroke="${OL}" stroke-width="8"/><rect x="160" y="-12" width="160" height="24" rx="10" fill="#2a2e3a" stroke="${OL}" stroke-width="6"/></g>`;
  for (let i = 0; i < 5; i++) { const q = ((t * .8 + i * .2) % 1); s += `<circle cx="${f(500 + Math.sin(i * 3 + t) * 60)}" cy="${f(1080 - q * 400)}" r="${f(30 + 50 * q)}" fill="#333" opacity="${f(.6 * (1 - q))}"/>`; }
  s += `<path d="M480,1090 l30,-50 l30,50 Z" fill="#ff8a1a"/>`;
  s += at(860, 470, pop(lv, .3), pill('ГЕНА', '#111427', '#fff', 48, 80), 8);
  return s;
} };
VIEWS.customer = { draw(lv, vd, t, ctx) {
  let s = BG('#f3e3c3') + `<rect x="-700" y="1050" width="2480" height="1400" fill="#a0683a"/><rect x="-700" y="1040" width="2480" height="30" fill="#7a4a26"/>`;
  const s1 = ctx.segRel[1] ?? 9, mad = lv > s1;
  s += guy({ ...OLDMAN, x: 540, y: 640, s: .95, legs: false, mouth: mad ? (Math.floor(t * 7) % 2 ? 'scream' : 'open') : 'flat', mouthOpen: .7, brow: mad ? 'angry' : 'neutral', pose: mad ? 'point' : 'down', t });
  s += bowl(540, 1130, 1.05, mad ? '#6b5a2a' : '#c0392b', mad ? 4 : 0, t);
  if (mad) s += comic(830, 450, 'ФУУУ!', eBack((lv - s1) / .25), '#7bd389', 64);
  return s;
} };
VIEWS.inspector = { shakes: ctx => { const s2 = ctx.segRel[2]; return s2 ? [[s2, 18, .5]] : []; },
  draw(lv, vd, t, ctx) {
  const s1 = ctx.segRel[1] ?? 9, s2 = ctx.segRel[2] ?? 99;
  let s = BG('#d9e6ee') + `<rect x="-700" y="1050" width="2480" height="1400" fill="#a0683a"/>`;
  if (lv < s2) {
    s += guy({ ...INSP, x: 330, y: 640, s: .85, legs: false, mouth: 'flat', brow: 'angry', pose: 'point', t });
    s += bowl(720, 1060, .9, '#c0392b', 0, t, lv > s1 + .2);
    s += `<g transform="translate(${f(760 + Math.sin(t * 3) * 20)},990)"><circle r="90" fill="#cfefff" fill-opacity=".35" stroke="${OL}" stroke-width="10"/><rect x="60" y="60" width="26" height="110" rx="10" fill="#7a4a26" stroke="${OL}" stroke-width="6" transform="rotate(-45,60,60)"/></g>`;
    if (lv > s1 + .3) s += at(540, 420, pop(lv, s1 + .3), money(0, 0, 'ШТРАФ −50 000 ₽'), -4);
  } else {
    s = sunburst('#ff4136', '#b8141b', t * .2) + guy({ ...ME, x: 540, y: 760, s: 1.3, legs: false, mouth: 'scream', brow: 'angry', red: 1, sweat: 3, t, headRot: Math.sin(t * 30) * 3 });
    s += comic(540, 420, '#@!%', eBack((lv - s2) / .2), '#ffe14a', 80);
  }
  return s;
} };
VIEWS.app = { draw(lv, vd, t) {
  let s = sunburst('#8b5cff', '#4a1fb8', t * .1);
  s += `<g transform="translate(540,800)"><rect x="-200" y="-380" width="400" height="760" rx="50" fill="#14161f" stroke="${OL}" stroke-width="10"/><rect x="-176" y="-350" width="352" height="700" rx="30" fill="#fff"/>`;
  s += txt(0, -260, 'ЗАКАЗ #1', 40, OL) + txt(0, -170, '1 000 ₽', 70, OL);
  const k = clamp((lv - .4) / 1.2);
  s += `<rect x="-140" y="-80" width="280" height="40" rx="20" fill="#e8ecf5"/><rect x="-140" y="-80" width="${f(280 * .3 * k)}" height="40" rx="20" fill="#ff3b3b"/>` + txt(0, 30, '−' + Math.round(30 * k) + '%', 80, '#ff3b3b') + txt(0, 140, 'КОМИССИЯ', 34, '#888') + '</g>';
  s += at(230, 440, pop(lv, 1.5), `<circle r="90" fill="#fff" stroke="${OL}" stroke-width="8"/><path d="M-30,10 L-18,50 L-6,10 M6,10 L18,50 L30,10" fill="#fff" stroke="${OL}" stroke-width="5" stroke-linejoin="round"/><circle cx="-30" cy="-20" r="10" fill="#c81a1a"/><circle cx="30" cy="-20" r="10" fill="#c81a1a"/>${txt(0, 130, 'УПЫРИ', 36, '#fff', { stroke: OL, sw: 8 })}`, -8);
  return s;
} };
VIEWS.sausage = { draw(lv, vd, t, ctx) {
  const s1 = ctx.segRel[1] ?? 9;
  let s = lv < s1 ? BG('#141a33') + `<rect x="-700" y="1050" width="2480" height="1400" fill="#1d2140"/>` : sunburst('#ff4136', '#b8141b', t * .2);
  if (lv < s1) {
    s += `<rect x="120" y="760" width="840" height="300" fill="#e8ecf5" stroke="${OL}" stroke-width="8"/><rect x="140" y="780" width="800" height="260" fill="#bfe6ff" opacity=".4"/>`;
    for (let i = 0; i < 8; i++) s += `<rect x="${170 + i * 95}" y="900" width="80" height="30" rx="15" fill="#e88a6a" stroke="${OL}" stroke-width="4"/>`;
    s += guy({ ...GENA, x: 540, y: 560, s: .8, legs: false, mouth: 'open', mouthOpen: .5 + .5 * Math.abs(Math.sin(t * 8)), eyes: 'squeeze', t, pose: 'hold' });
    s += `<rect x="470" y="600" width="140" height="40" rx="20" fill="#e88a6a" stroke="${OL}" stroke-width="5" transform="rotate(${f(Math.sin(t * 8) * 10)},540,620)"/>`;
  } else {
    s += guy({ ...ME, x: 350, y: 760, s: .9, legs: false, mouth: 'scream', brow: 'angry', pose: 'point', red: .8, t });
    s += guy({ ...GENA, x: 820, y: 820, s: .75, legs: false, mouth: 'wavy', brow: 'worried', sweat: 3, t });
    s += at(820, 450, pop(lv, s1 + .2), pill('КРЫСА', '#111427', '#ff6b6b', 48, 80), 6);
  }
  return s;
} };
VIEWS.zero = { draw(lv, vd, t) {
  let s = BG('#2a2f45') + `<rect x="-700" y="1050" width="2480" height="1400" fill="#1d2236"/>`;
  s += guy({ ...ME, x: 540, y: 700, s: 1.0, legs: false, mouth: 'smile', brow: 'worried', tired: .7, t, pose: 'hold' });
  s += `<g transform="translate(540,1130)"><ellipse rx="190" ry="44" fill="#f4f1ea" stroke="${OL}" stroke-width="8"/>${[-90, -30, 30, 90, -60, 0, 60].map((x, i) => `<path d="M${x - 30},${i > 3 ? -24 : 0} Q${x},${(i > 3 ? -24 : 0) - 40} ${x + 30},${i > 3 ? -24 : 0}Z" fill="#fff6e0" stroke="${OL}" stroke-width="5"/>`).join('')}</g>`;
  s += at(540, 420, 1, `<rect x="-220" y="-70" width="440" height="140" rx="30" fill="#111427" stroke="#ff3b3b" stroke-width="8"/>` + txt(0, 4, '0 ₽', 96, '#ff3b3b'));
  return s;
} };
VIEWS.viral = { draw(lv, vd, t, ctx) {
  const s1 = ctx.segRel[1] ?? 9;
  let s = sunburst('#2fd27a', '#14905a', t * .12);
  if (lv < s1) {
    s += `<g transform="translate(540,780)"><rect x="-220" y="-400" width="440" height="800" rx="50" fill="#14161f" stroke="${OL}" stroke-width="10"/><rect x="-196" y="-370" width="392" height="740" rx="30" fill="#fff"/>`;
    s += txt(0, -250, 'ОТЗЫВ БЛОГЕРА', 34, '#888') + [...Array(5)].map((_, i) => txt(-120 + i * 60, -170, '★', 60, i === 0 ? '#ffb02e' : '#ddd')).join('') + txt(0, -60, 'ХУДШИЕ', 60, OL) + txt(0, 10, 'ПЕЛЬМЕНИ', 60, OL) + txt(0, 80, 'В ГОРОДЕ', 60, OL) + `<rect x="-150" y="170" width="300" height="70" rx="35" fill="#ff3b3b"/>` + txt(0, 206, '2,1 МЛН', 40, '#fff') + '</g>';
  } else {
    s += sign(540, 400, .9);
    for (let i = 0; i < 9; i++) { const z = .35 + i * .07, x = 980 - i * 110 + Math.sin(t * 3 + i) * 4; s += guy({ shirt: ['#e5484d', '#2f9bff', '#ffd23a', '#8b5cff', '#7bd389'][i % 5], hair: ['#3a2414', '#111', '#c9a06a'][i % 3], hairD: '#111', x, y: 700 + i * 22, s: z, legs: false, mouth: i % 2 ? 'smile' : 'open', mouthOpen: .4, look: [16, 0], t }); }
    s += at(540, 560, pop(lv, s1 + .2), pill('ОЧЕРЕДЬ ДО УГЛА', '#111427', '#ffe14a', 46, 84), -3);
  }
  return s;
} };
VIEWS.cta = { draw(lv, vd, t) {
  let s = sunburst('#ff9a1f', '#e2600a', t * .12);
  s += sign(540, 430, 1.0).replace('ХАРЧЕВНЯ', '«???»');
  s += guy({ ...ME, x: 540, y: 820, s: 1.0, legs: false, mouth: 'smile', brow: 'raised', pose: 'hold', t });
  [[180, 760], [900, 760]].forEach(([x, y], i) => { s += at(x, y + Math.sin(t * 4 + i) * 12, pop(lv, .3 + i * .15), txt(0, 0, '?', 130, '#fff', { stroke: OL, sw: 16 }), 12 * Math.sin(t * 3 + i)); });
  return s;
} };
