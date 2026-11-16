// «100 млн сейчас или 0,5 ₽ +1% в день» — картинки сцен.
const ME = { shirt: '#ffd23a', hair: '#3a2414', hairD: '#24160b' };
const TOT = n => 50 * (Math.pow(1.01, n) - 1);        // сумма за n дней (день 1 = 0,5 ₽)
const DAILY = n => .5 * Math.pow(1.01, Math.max(0, n - 1));
const rub = v => Math.round(v).toLocaleString('ru-RU') + ' ₽';
function suitcase(x, y, s) {
  let b = `<rect x="-200" y="-40" width="400" height="230" rx="24" fill="#3a2a1e" stroke="${OL}" stroke-width="9"/><path d="M-60,-40 L-60,-80 Q-60,-100 -40,-100 L40,-100 Q60,-100 60,-80 L60,-40" fill="none" stroke="${OL}" stroke-width="16"/>`;
  b += `<path d="M-200,-40 L-170,-200 L170,-200 L200,-40Z" fill="#4a3626" stroke="${OL}" stroke-width="9"/>`;
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) b += `<rect x="${-180 + c * 92}" y="${-30 + r * 60}" width="84" height="52" rx="6" fill="#7bd389" stroke="${OL}" stroke-width="4"/>` + txt(-138 + c * 92, -4 + r * 60, '₽', 30, '#1d7a3a');
  return `<g transform="translate(${f(x)},${f(y)}) scale(${s})">${b}</g>`;
}
const coin = (x, y, s, label = '0,5 ₽') => `<g transform="translate(${f(x)},${f(y)}) scale(${s})"><circle r="130" fill="#ffd23a" stroke="${OL}" stroke-width="10"/><circle r="100" fill="none" stroke="#e0a800" stroke-width="8"/>${txt(0, 4, label, 64, '#8a5a00')}</g>`;
const counter = (x, y, text, col = '#ffe14a', size = 74, w = null) => { const ww = w || text.length * size * .62 + 80; return at(x, y, 1, `<rect x="${f(-ww / 2)}" y="-62" width="${f(ww)}" height="124" rx="30" fill="#111427" stroke="${OL}" stroke-width="8"/>` + txt(0, 2, text, size, col)); };

function chartView(d0, d1, extra, reach) { // reach(ctx): к какой секунде картинки график доходит до d1
  return {
    draw(lv, vd, t, ctx) {
      let s = sunburst('#2f9bff', '#1660d9', t * .08);
      const X0 = 150, X1 = 990, Y0 = 1140, Y1 = 420, xm = 1500, ym = 150e6;
      const X = n => X0 + (X1 - X0) * n / xm, Y = v => Y0 - (Y0 - Y1) * Math.min(v, ym * 1.08) / ym;
      s += `<rect x="60" y="340" width="960" height="900" rx="34" fill="#fff" stroke="${OL}" stroke-width="10"/>`;
      s += `<path d="M${X0},${Y1 - 20} L${X0},${Y0} L${X1 + 10},${Y0}" fill="none" stroke="${OL}" stroke-width="7"/>`;
      for (let y = 1; y <= 4; y++) s += `<path d="M${f(X(365 * y))},${Y0} L${f(X(365 * y))},${Y0 + 14}" stroke="${OL}" stroke-width="6"/>` + txt(X(365 * y), Y0 + 44, 'ГОД ' + y, 28, OL, { w: 700 });
      s += `<path d="M${X0},${f(Y(1e8))} L${X1},${f(Y(1e8))}" stroke="#ff3b3b" stroke-width="7" stroke-dasharray="22 14"/>` + txt(X0 + 12, Y(1e8) - 30, '100 МЛН ₽', 34, '#ff3b3b', { anchor: 'start' });
      const T = reach ? reach(ctx) : (ctx.segEndRel[ctx.segEndRel.length - 1] ?? vd) * .85;
      const d = lerp(d0, d1, eInOut(lv / T)) + (reach && lv > T ? Math.min(3, (lv - T) * 2) : 0);
      let p = `M${X0},${Y0}`; for (let n = 0; n <= d; n += 8) p += ` L${f(X(n))},${f(Y(TOT(n)))}`; p += ` L${f(X(d))},${f(Y(TOT(d)))}`;
      s += `<path d="${p}" fill="none" stroke="#2fd27a" stroke-width="12" stroke-linejoin="round" stroke-linecap="round"/>`;
      const px = X(d), py = Y(TOT(d));
      s += `<circle cx="${f(px)}" cy="${f(py)}" r="18" fill="#2fd27a" stroke="${OL}" stroke-width="6"/>`;
      s += counter(540, 430, 'ВСЕГО: ' + rub(TOT(d)), '#ffe14a', 50, 820);
      s += at(330, 1030, 1, `<rect x="-220" y="-40" width="440" height="80" rx="20" fill="#f2f4fa" stroke="${OL}" stroke-width="5"/>` + txt(0, 2, 'В ДЕНЬ: ' + rub(DAILY(d)), 34, OL));
      return s + (extra ? extra(lv, vd, t, ctx, d, px, py) : '');
    }
  };
}

VIEWS.hook = {
  draw(lv, vd, t, ctx) {
    let s = `<rect x="-700" y="-700" width="1240" height="3300" fill="#1d7a3a"/><rect x="540" y="-700" width="1240" height="3300" fill="#1660d9"/>`;
    s += at(280, 760, pop(lv, .05), suitcase(0, 0, .95)) + at(280, 1060, pop(lv, .2), pill('100 000 000 ₽', '#111427', '#ffe14a', 38, 74));
    const s1 = ctx.segRel[1] ?? 9, s2 = ctx.segRel[2] ?? 9;
    s += at(800, 740, pop(lv, s1 + .1), coin(0, 0, 1.1)) + at(800, 1060, pop(lv, s1 + .6), pill('+1% В ДЕНЬ', '#111427', '#7bd389', 40, 74)) + at(800, 520, pop(lv, s1 + 1.4), pill('10 ЛЕТ', '#ff3b3b', '#fff', 40, 70));
    s += at(540, 420, pop(lv, .1), `<circle r="80" fill="#111427" stroke="#fff" stroke-width="8"/>` + txt(0, 2, 'VS', 64, '#fff'));
    if (lv > s2) s += at(540, 760, eBack((lv - s2) / .3), `<circle r="120" fill="#fff" stroke="${OL}" stroke-width="10"/>` + txt(0, 8, '?', 160, '#ff3b3b'), 10 * Math.sin(t * 6));
    return s;
  }
};
VIEWS.month = {
  draw(lv, vd, t, ctx) {
    let s = sunburst('#ff9a1f', '#e2600a', t * .1);
    const s1 = ctx.segRel[1] ?? 9, laugh = lv > s1 + 1.4;
    s += guy({ ...ME, x: 540, y: 800, s: 1.05, legs: false, mouth: 'smile', eyes: laugh ? 'squeeze' : 'open', brow: laugh ? 'raised' : 'neutral', headRot: laugh ? Math.sin(t * 14) * 5 : 0, pose: laugh ? 'down' : 'point', t, tears: laugh ? 1 : 0 });
    if (!laugh) s += at(900, 520, pop(lv, .2), suitcase(0, 0, .45));
    if (laugh) {
      for (let i = 0; i < 6; i++) s += coin(200 + i * 30, 1140 - i * 14, .22, '');
      s += counter(540, 390, '17 ₽', '#ffe14a', 90);
      s += comic(850, 640, 'ХА-ХА', eBack((lv - s1 - 1.4) / .25), '#fff', 56);
    }
    return s;
  }
};
VIEWS.chart1 = chartView(30, 365);
VIEWS.chart3 = chartView(365, 1095);
VIEWS.chart4 = chartView(1095, 1459, (lv, vd, t, ctx, d, px, py) => {
  let s = '';
  if (d >= 1459) { const k = clamp((lv - (ctx.segEndRel[0] - .55)) * 4); s += sparks(px, py, t, 120, 6, '#ffd23a') + comic(420, 800, 'ОБГОН!', eBack(k), '#ffe14a', 70); }
  const s1 = ctx.segRel[1] ?? 9;
  if (lv > s1) s += at(600, 930, pop(lv, s1), pill('1 000 000 ₽ / ДЕНЬ', '#2fd27a', '#111427', 40, 84), -4);
  return s;
}, ctx => (ctx.segEndRel[0] ?? 3) - .5);
VIEWS.rocket = {
  draw(lv, vd, t, ctx) {
    let s = BG('#05061a') + stars(90, -100, -100, 1300, 2100, t, 3);
    for (let i = 0; i < 14; i++) { const r = rng(i + 7), x = r() * 1080, y = ((r() * 2000 + t * 1600) % 2000); s += `<path d="M${f(x)},${f(y)} l0,${f(80 + r() * 120)}" stroke="#bfd6ff" stroke-width="4" opacity=".5"/>`; }
    const ry = 980 + Math.sin(t * 9) * 8;
    let rk = `<path d="M0,-230 Q90,-120 80,120 L-80,120 Q-90,-120 0,-230Z" fill="#f4f6fa" stroke="${OL}" stroke-width="9"/><circle cx="0" cy="-60" r="44" fill="#7fd0ff" stroke="${OL}" stroke-width="8"/><path d="M-80,40 L-150,170 L-70,130Z M80,40 L150,170 L70,130Z" fill="#ff3b3b" stroke="${OL}" stroke-width="7" stroke-linejoin="round"/>${txt(0, 50, '₽', 60, '#ff3b3b')}`;
    rk = `<path d="M-50,120 Q0,${f(330 + 40 * Math.sin(t * 30))} 50,120Z" fill="#ffb02e"/><path d="M-28,120 Q0,${f(240 + 30 * Math.sin(t * 40))} 28,120Z" fill="#fff3a0"/>` + rk;
    s += `<g transform="translate(540,${f(ry)}) scale(1.1)">${rk}</g>`;
    const q = eOut(lv / (ctx.segEndRel[0] ?? vd)), v = Math.pow(10, lerp(8, Math.log10(2.9647e17), q));
    const str = Math.round(v / 1e3).toLocaleString('ru-RU') + ' 000 ₽';
    s += counter(540, 470, str, '#ffe14a', 46, 1000);
    const s1 = ctx.segRel[1] ?? 9;
    if (lv > s1) s += at(540, 640, pop(lv, s1 + .2), pill('≈ 3 КВАДРИЛЛИОНА / ДЕНЬ', '#ff3b3b', '#fff', 36, 76), -4);
    return s;
  }
};
VIEWS.gdp = {
  draw(lv, vd, t, ctx) {
    let s = sunburst('#c0392b', '#7b1d14', t * .08);
    const cols = 50, n = Math.min(1500, Math.floor(eOut(lv / ((ctx.segEndRel[0] ?? 2) * .9)) * 1500));
    let g = '';
    for (let i = 0; i < n; i++) { const c = i % cols, r = Math.floor(i / cols); g += `<rect x="${90 + c * 18}" y="${400 + r * 22}" width="14" height="18" rx="3" fill="${i === 0 ? '#ffe14a' : '#f4f6fa'}" opacity="${i === 0 ? 1 : .9}"/>`; }
    s += g;
    s += at(300, 1140, 1, `<rect x="-14" y="-18" width="28" height="36" rx="5" fill="#ffe14a"/>` + txt(30, 2, '= 1 ВВП РОССИИ', 34, '#fff', { anchor: 'start', stroke: OL, sw: 8 }));
    s += counter(820, 1140, '×' + n.toLocaleString('ru-RU'), '#ffe14a', 54, 300);
    const s1 = ctx.segRel[1] ?? 9;
    if (lv > s1) s += at(540, 760, eBack((lv - s1) / .3), `<rect x="-400" y="-90" width="800" height="180" rx="20" fill="none" stroke="#ff3b3b" stroke-width="16"/>` + txt(0, 4, 'НЕ СУЩЕСТВУЕТ', 84, '#ff3b3b', { stroke: '#fff', sw: 10 }), -10);
    return s;
  }
};
VIEWS.snowball = {
  draw(lv, vd, t) {
    let s = `<linearGradient id="sn${++uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd3ff"/><stop offset="1" stop-color="#eaf7ff"/></linearGradient><rect x="-700" y="-700" width="2480" height="3300" fill="url(#sn${uid})"/>`;
    s += `<path d="M-700,300 L1780,1500 L1780,2600 L-700,2600Z" fill="#fff" stroke="${OL}" stroke-width="8"/>`;
    for (const [x, y] of [[150, 520], [420, 650], [900, 900]]) s += `<path d="M${x},${y - 160} L${x - 70},${y} L${x + 70},${y}Z" fill="#2f8a44" stroke="${OL}" stroke-width="6"/><rect x="${x - 12}" y="${y}" width="24" height="40" fill="#7a4a26"/>`;
    const q = eInOut(lv / vd), bx = lerp(100, 760, q), r = lerp(40, 260, q * q), by = 300 + (bx + 700) * (1200 / 2480) * 1 - r + 30;
    s += `<g transform="translate(${f(bx)},${f(by)}) rotate(${f(lv * 300)})"><circle r="${f(r)}" fill="#fff" stroke="${OL}" stroke-width="8"/><path d="M${f(-r * .5)},${f(-r * .2)} q${f(r * .3)},${f(r * .2)} ${f(r * .6)},0 M${f(-r * .2)},${f(r * .4)} q${f(r * .2)},${f(-r * .2)} ${f(r * .5)},0" fill="none" stroke="#bcd2ff" stroke-width="6"/></g>`;
    for (let i = 0; i < 4; i++) { const k = ((lv * .8 + i * .25) % 1); s += txt(bx - 140 - i * 30, by - r - 40 - k * 200, '+1%', 50, '#2fd27a', { stroke: OL, sw: 10, op: f(1 - k) }); }
    return s;
  }
};
VIEWS.cta = {
  draw(lv, vd, t) {
    let s = sunburst('#ffd23a', '#e0a800', t * .12);
    s += at(270, 520, pop(lv, .05), `<rect x="-200" y="-190" width="400" height="380" rx="30" fill="#fff" stroke="${OL}" stroke-width="9"/>` + suitcase(0, 10, .55) + txt(0, 150, '100 МЛН', 44, OL), -5);
    s += at(810, 520, pop(lv, .2), `<rect x="-200" y="-190" width="400" height="380" rx="30" fill="#fff" stroke="${OL}" stroke-width="9"/>` + coin(0, -10, .7) + txt(0, 150, '+1% В ДЕНЬ', 40, OL), 5);
    s += guy({ ...ME, x: 540, y: 1010, s: .78, legs: false, mouth: 'flat', brow: 'raised', look: [Math.sin(t * 2.5) * 18, -10], t });
    s += at(830, 860, pop(lv, .5), txt(0, 0, '?', 120, '#fff', { stroke: OL, sw: 16 }), 12 * Math.sin(t * 3)) + at(250, 880, pop(lv, .65), txt(0, 0, '?', 100, '#fff', { stroke: OL, sw: 14 }), -10 * Math.sin(t * 3));
    return s;
  }
};
