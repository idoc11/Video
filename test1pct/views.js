// «Только 1% пройдёт» — интерактивный тест.
const GRID_Y = 470;
function phase(lv, ctx) { // 0 — задание, 1 — таймер, 2 — ответ
  const e0 = ctx.segEndRel[0] ?? 2, s1 = ctx.segRel[1] ?? 9;
  return lv < e0 ? [0, 0] : lv < s1 - .05 ? [1, (lv - e0) / (s1 - e0)] : [2, lv - s1];
}
function timerRing(k, x = 540, y = 335) {
  const a = k * 360, left = Math.max(1, 3 - Math.floor(k * 3));
  return `<circle cx="${x}" cy="${y}" r="62" fill="#111427" stroke="#2a2f45" stroke-width="12"/><path d="M${x},${y - 62} A62,62 0 ${a > 180 ? 1 : 0} 1 ${f(x + 62 * Math.sin(a * Math.PI / 180))},${f(y - 62 * Math.cos(a * Math.PI / 180))}" fill="none" stroke="#ff3b3b" stroke-width="12" stroke-linecap="round"/>` + txt(x, y + 4, String(left), 64, '#fff');
}
function mark(x, y, r, k) { return k <= 0 ? '' : `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r * (1 + .1 * Math.sin(k * 12)))}" fill="none" stroke="#ff3b3b" stroke-width="12" opacity="${f(clamp(k * 4))}"/><circle cx="${f(x)}" cy="${f(y)}" r="${f(r + 40 * clamp(k * 2))}" fill="none" stroke="#ff3b3b" stroke-width="4" opacity="${f(1 - clamp(k * 2))}"/>`; }
function shadeView(base, odd, n, oddIdx) {
  return { draw(lv, vd, t, ctx) {
    const [ph, k] = phase(lv, ctx);
    let s = BG('#0f1220') + `<rect x="60" y="${GRID_Y - 40}" width="960" height="960" rx="40" fill="#f4f1ea"/>`;
    const cell = 880 / n, ap = eOut(lv / .4);
    for (let i = 0; i < n * n; i++) { const cx = 100 + cell * (i % n + .5), cy = GRID_Y + cell * (Math.floor(i / n) + .5); s += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(cell * .4 * ap)}" fill="${i === oddIdx ? odd : base}"/>`; }
    const ox = 100 + cell * (oddIdx % n + .5), oy = GRID_Y + cell * (Math.floor(oddIdx / n) + .5);
    if (ph === 1) s += timerRing(k);
    if (ph === 2) s += mark(ox, oy, cell * .55, k);
    return s;
  } };
}
function letterView(base, odd, cols, rows, oddIdx) {
  return { draw(lv, vd, t, ctx) {
    const [ph, k] = phase(lv, ctx);
    let s = BG('#0f1220') + `<rect x="60" y="${GRID_Y - 40}" width="960" height="960" rx="40" fill="#f4f1ea"/>`;
    const cw = 880 / cols, ch = 880 / rows;
    for (let i = 0; i < cols * rows; i++) { const x = 100 + cw * (i % cols + .5), y = GRID_Y + ch * (Math.floor(i / cols) + .5); s += txt(x, y, i === oddIdx ? odd : base, ch * .78, '#1d1530', { op: f(clamp(lv / .4)) }); }
    const ox = 100 + cw * (oddIdx % cols + .5), oy = GRID_Y + ch * (Math.floor(oddIdx / cols) + .5);
    if (ph === 1) s += timerRing(k);
    if (ph === 2) s += mark(ox, oy, ch * .6, k);
    return s;
  } };
}
VIEWS.shade1 = shadeView('#2f9bff', '#7cc0ff', 5, 17);
VIEWS.letterShch = letterView('Ш', 'Щ', 8, 10, 53);
VIEWS.letterYo = letterView('Е', 'Ё', 9, 11, 40);
VIEWS.shade4 = shadeView('#e5484d', '#ec5a5f', 7, 31);
VIEWS.hook = { draw(lv, vd, t) {
  let s = BG('#0f1220');
  const k = eBack(lv / .4);
  s += at(540, 700, k, txt(0, 0, '1%', 360, '#fff', { stroke: '#ff3b3b', sw: 14 }));
  [1, 2, 3, 4].forEach((n, i) => { s += at(225 + i * 210, 1080, pop(lv, .8 + i * .2), `<rect x="-80" y="-80" width="160" height="160" rx="30" fill="#111427" stroke="#ffd23a" stroke-width="6"/>` + txt(0, 4, String(n), 90, '#ffd23a')); });
  return s;
} };
VIEWS.tease = { draw(lv, vd, t) {
  let s = BG('#0f1220');
  [1, 2].forEach((n, i) => { s += at(330 + i * 210, 760, 1, `<rect x="-80" y="-80" width="160" height="160" rx="30" fill="#2fd27a"/>` + txt(0, 4, '✓', 90, '#111427')); });
  [3, 4].forEach((n, i) => { s += at(750 + i * 0, 760 + i * 0, 0, ''); });
  s += at(750, 760, 1 + .05 * Math.sin(t * 6), `<rect x="-80" y="-80" width="160" height="160" rx="30" fill="#111427" stroke="#ff3b3b" stroke-width="6"/>` + txt(0, 4, '?', 90, '#ff3b3b'));
  return s;
} };
VIEWS.cta = { draw(lv, vd, t) {
  let s = BG('#0f1220');
  [0, 1, 2, 3, 4].forEach((n, i) => { s += at(150 + i * 195, 760 + Math.sin(t * 4 + i) * 14, pop(lv, .2 + i * .15), `<rect x="-80" y="-80" width="160" height="160" rx="30" fill="${n === 4 ? '#ffd23a' : '#111427'}" stroke="#ffd23a" stroke-width="6"/>` + txt(0, 4, String(n), 90, n === 4 ? '#111427' : '#ffd23a')); });
  s += at(540, 1020, pop(lv, 1.2), txt(0, 0, 'В КОММЕНТАРИИ', 52, '#fff') + [-300, 300].map(x => `<path d="M${x},${f(-20 + 10 * Math.sin(t * 8))} l0,40 m-18,-18 l18,18 l18,-18" fill="none" stroke="#ffd23a" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`).join(''));
  return s;
} };
