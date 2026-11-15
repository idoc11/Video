// «За 30 секунд я покажу, насколько ты маленький» — картинки сцен.
const ME = { shirt: '#ff7a3a', hair: '#3a2414', hairD: '#24160b' };
const zoomOut = (lv, inner, cx = 540, cy = 760, from = 1.8) => { const k = lerp(from, 1, eOut(lv / .7)); return `<g transform="translate(${cx},${cy}) scale(${f(k * 100) / 100}) translate(${-cx},${-cy})">${inner}</g>`; };
function space(t, seed = 1, n = 90) { return BG('#05061a') + `<rect x="-700" y="-700" width="2480" height="3300" fill="url(#vigDark)"/>` + stars(n, -100, -100, 1300, 2100, t, seed); }
function globe(cx, cy, r, t) {
  const id = ++uid; let land = '';
  for (let i = 0; i < 7; i++) { const x = ((i * 0.55 * r + t * r * .12) % (r * 3.6)) - r * 1.8; land += `<path d="${blob(i + 11, r * (.25 + (i % 3) * .1), 9, .35)}" transform="translate(${f(cx + x)},${f(cy - r * .5 + (i % 4) * r * .33)})" fill="#4fbf4a" stroke="${OL}" stroke-width="5"/>`; }
  return `<clipPath id="gb${id}"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath><circle cx="${cx}" cy="${cy}" r="${f(r * 1.15)}" fill="#7fd0ff" opacity=".18"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="#2f8fe0"/><g clip-path="url(#gb${id})">${land}<circle cx="${cx + r * .4}" cy="${cy + r * .3}" r="${r}" fill="#000" opacity=".22"/></g><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${OL}" stroke-width="8"/>`;
}
function pin(x, y, label, k) {
  return at(x, y, k, `<path d="M0,0 C-40,-50 -36,-110 0,-110 C36,-110 40,-50 0,0Z" fill="#ff3b3b" stroke="${OL}" stroke-width="6"/><circle cx="0" cy="-74" r="14" fill="#fff"/><g transform="translate(0,-160)">${pill(label, '#111427', '#fff', 34, 62)}</g>`);
}

VIEWS.hook = {
  draw(lv, vd, t) {
    let s = sunburst('#8b5cff', '#4a1fb8', t * .12);
    const a = (lv / vd) * 360;
    s += at(540, 620, pop(lv, .05), `<circle r="230" fill="#fff" stroke="${OL}" stroke-width="14"/><rect x="-36" y="-300" width="72" height="60" rx="14" fill="${OL}"/><path d="M0,0 L0,-200 A200,200 0 ${a > 180 ? 1 : 0} 1 ${f(200 * Math.sin(a * Math.PI / 180))},${f(-200 * Math.cos(a * Math.PI / 180))}Z" fill="#ff3b3b" opacity=".25"/>${txt(0, 10, '30', 190, OL)}<path d="M0,0 L${f(180 * Math.sin(a * Math.PI / 180))},${f(-180 * Math.cos(a * Math.PI / 180))}" stroke="#ff3b3b" stroke-width="12" stroke-linecap="round"/>`);
    s += guy({ ...ME, x: 540, y: 1060, s: .62, legs: false, mouth: 'smile', brow: 'raised', look: [0, -12], t });
    return s;
  }
};
VIEWS.you = {
  draw(lv, vd, t) {
    let s = BG('#f2f4fa');
    let grid = ''; for (let x = -100; x < 1200; x += 60) grid += `M${x},-200 L${x},2200 `; for (let y = -100; y < 2200; y += 60) grid += `M-200,${y} L1300,${y} `;
    s += `<path d="${grid}" stroke="#d6dcea" stroke-width="3"/>`;
    s += guy({ ...ME, x: 470, y: 470, s: .68, mouth: 'smile', pose: 'wave', look: [8, 0], t });
    s += `<path d="M820,300 L820,1265" stroke="${OL}" stroke-width="8"/><path d="M790,300 L850,300 M790,1265 L850,1265" stroke="${OL}" stroke-width="8"/>`;
    for (let y = 360; y < 1265; y += 60) s += `<path d="M805,${y} L835,${y}" stroke="${OL}" stroke-width="4"/>`;
    s += at(900, 780, pop(lv, .3), pill('1,7 М', '#ff7a3a', '#fff', 46, 80), -90);
    return s;
  }
};
VIEWS.tower = {
  draw(lv, vd, t) {
    let s = `<linearGradient id="ts${++uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f8fff"/><stop offset="1" stop-color="#cfeaff"/></linearGradient><rect x="-700" y="-700" width="2480" height="3300" fill="url(#ts${uid})"/>`;
    s += `<rect x="-700" y="1250" width="2480" height="1400" fill="#e8c98f"/>`;
    for (const [x, h] of [[120, 260], [300, 380], [760, 300], [930, 420]]) s += `<rect x="${x - 50}" y="${1250 - h}" width="100" height="${h}" fill="#9fb3c8" stroke="${OL}" stroke-width="6"/>`;
    const steps = [[150, 1250], [130, 1050], [110, 860], [90, 680], [70, 520], [50, 390], [32, 290], [14, 210], [4, 130]];
    let d = `M${540 - steps[0][0]},1250`; steps.forEach(([w, y], i) => { d += ` L${540 - w},${y}`; if (steps[i + 1]) d += ` L${540 - steps[i + 1][0]},${y}`; });
    d += ' L540,90'; [...steps].reverse().forEach(([w, y], i, arr) => { if (i > 0) d += ` L${540 + arr[i - 1][0]},${y}`; d += ` L${540 + w},${y}`; }); d += ` L${540 + steps[0][0]},1250Z`;
    s += zoomOut(lv, `<path d="${d}" fill="#c9d6e6" stroke="${OL}" stroke-width="8" stroke-linejoin="round"/><path d="M540,1250 L540,140" stroke="#fff" stroke-width="10" opacity=".4"/>`, 540, 1250, 1.4);
    s += `<g transform="translate(330,1236) scale(.9)"><circle cx="0" cy="-30" r="6" fill="${OL}"/><path d="M0,-24 L0,0" stroke="${OL}" stroke-width="5"/></g>`;
    s += at(330, 1160, pop(lv, .5), `<path d="M0,40 L0,0" stroke="#ff3b3b" stroke-width="8"/><path d="M-14,20 L0,44 L14,20" fill="none" stroke="#ff3b3b" stroke-width="8"/>${txt(0, -30, 'ТЫ', 44, '#ff3b3b', { stroke: '#fff', sw: 10 })}`);
    s += at(820, 500, pop(lv, .9), pill('×487', '#111427', '#ffe14a', 64, 104), -6);
    return s;
  }
};
VIEWS.earth = {
  draw(lv, vd, t) {
    let s = space(t, 2);
    s += zoomOut(lv, globe(540, 740, 330, t), 540, 740, 2.6);
    s += `<path d="M210,1120 L870,1120" stroke="#fff" stroke-width="6"/><path d="M230,1100 L210,1120 L230,1140 M850,1100 L870,1120 L850,1140" fill="none" stroke="#fff" stroke-width="6"/>`;
    s += pin(640, 470, 'ТЫ ЗДЕСЬ', pop(lv, .6));
    return s;
  }
};
VIEWS.sun = {
  draw(lv, vd, t) {
    let s = space(t, 3, 60);
    let sun = `<circle cx="-140" cy="760" r="${f(820 + 10 * Math.sin(t * 2))}" fill="url(#sunGlow)"/><circle cx="-140" cy="760" r="660" fill="#ffb02e" stroke="${OL}" stroke-width="10"/>`;
    const r = rng(8); for (let i = 0; i < 40; i++) { const a = r() * 6.28, d = r() * 600; sun += `<circle cx="${f(-140 + Math.cos(a) * d)}" cy="${f(760 + Math.sin(a) * d)}" r="${f(20 + r() * 40)}" fill="#ff8a1a" opacity="${f(.35 + .2 * Math.sin(t * 3 + i))}"/>`; }
    s += zoomOut(lv, sun, 900, 760, 1.6);
    s += `<circle cx="900" cy="760" r="9" fill="#2f8fe0" stroke="#fff" stroke-width="3"/>` + at(900, 690, pop(lv, .4), pill('ЗЕМЛЯ', '#111427', '#fff', 30, 56));
    const n = Math.round(1300000 * eOut((lv - .4) / 1.4));
    if (lv > .4) s += at(820, 1120, 1, `<rect x="-230" y="-60" width="460" height="120" rx="30" fill="#111427" stroke="${OL}" stroke-width="8"/>` + txt(0, 2, n.toLocaleString('ru-RU'), 68, '#ffe14a'));
    return s;
  }
};
VIEWS.galaxy = {
  draw(lv, vd, t) {
    let s = space(t, 4, 70);
    let g = `<circle cx="540" cy="760" r="420" fill="url(#ghostGlow)" opacity=".45"/>`;
    const r = rng(21), rot = t * .08;
    for (let i = 0; i < 520; i++) {
      const arm = i % 2, q = r(), a = q * 7 + arm * Math.PI + rot + (r() - .5) * .45, d = 40 + q * 400 + (r() - .5) * 40;
      g += `<circle cx="${f(540 + Math.cos(a) * d)}" cy="${f(760 + Math.sin(a) * d * .62)}" r="${f(1.5 + r() * 3.5)}" fill="${['#ffffff', '#cfe6ff', '#ffe9c4', '#e0d0ff'][i % 4]}" opacity="${f(.5 + r() * .5)}"/>`;
    }
    g += `<ellipse cx="540" cy="760" rx="90" ry="60" fill="#fff6d0" opacity=".9"/><ellipse cx="540" cy="760" rx="160" ry="100" fill="#ffe9a8" opacity=".35"/>`;
    s += zoomOut(lv, g, 540, 760, 2.2);
    const a0 = 3.85 + rot, d0 = 40 + .55 * 400;
    s += pin(f(540 + Math.cos(a0) * d0), f(760 + Math.sin(a0) * d0 * .62), 'МЫ ЗДЕСЬ', pop(lv, .7));
    return s;
  }
};
VIEWS.universe = {
  draw(lv, vd, t) {
    let s = space(t, 5, 40);
    let u = ''; const r = rng(33);
    for (let c = 0; c < 9; c++) {
      const cx = r() * 1200 - 60, cy = r() * 1500 + 100;
      for (let i = 0; i < 26; i++) { const x = cx + (r() - .5) * 380, y = cy + (r() - .5) * 200, rot = r() * 180, sz = 3 + r() * 9; u += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(sz * 1.8)}" ry="${f(sz)}" transform="rotate(${f(rot)},${f(x)},${f(y)})" fill="${['#cfe6ff', '#ffe9c4', '#e0d0ff'][i % 3]}" opacity="${f(.5 + r() * .5)}"/>`; }
    }
    for (let i = 0; i < 200; i++) u += `<circle cx="${f(r() * 1200 - 60)}" cy="${f(r() * 1800)}" r="${f(1 + r() * 2.5)}" fill="#bcd2ff" opacity="${f(.3 + r() * .4)}"/>`;
    s += zoomOut(lv, u, 540, 760, 2.4);
    s += at(560, 700, pop(lv, .6), `<circle r="${f(34 + 6 * Math.sin(t * 6))}" fill="none" stroke="#ff3b3b" stroke-width="6"/><g transform="translate(0,-90)">${pill('МЛЕЧНЫЙ ПУТЬ', '#111427', '#fff', 30, 56)}</g>`);
    return s;
  }
};
VIEWS.cta = {
  draw(lv, vd, t) {
    let s = space(t, 6, 120);
    const k = lerp(.4, 1, eOut(lv / .9));
    let inner = guy({ ...ME, x: 0, y: 0, s: 1, legs: false, pose: 'hold', mouth: 'smile', look: [0, 14], light: .14, t });
    inner += `<g transform="translate(0,560)"><rect x="-90" y="-160" width="180" height="320" rx="26" fill="#1d1f2c" stroke="${OL}" stroke-width="9"/><rect x="-74" y="-140" width="148" height="270" rx="14" fill="#69e6ff" opacity=".85"/></g>`;
    s += `<circle cx="540" cy="900" r="${f(420 * k)}" fill="url(#cyanGlow)" opacity=".35"/>`;
    s += `<g transform="translate(540,720) scale(${f(k * .95 * 100) / 100})">${inner}</g>`;
    s += pin(540, 460, 'ТЫ', pop(lv, 1.0));
    return s;
  }
};
