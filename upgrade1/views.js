// «Апгрейд. Серия 1» — картинки сцен.
const VANYA = { shirt: '#3b5aa8', hair: '#4a2a15', hairD: '#2e180b' };
function phoneUI(x, y, s, inner, cracked = false, glow = 1) {
  let g = `<rect x="-170" y="-330" width="340" height="660" rx="44" fill="#14161f" stroke="${OL}" stroke-width="10"/><rect x="-150" y="-300" width="300" height="600" rx="28" fill="#0b0d18"/>`;
  g += `<g clip-path="none">${inner}</g>`;
  if (cracked) g += `<path d="M-120,-260 L-20,-120 L-90,20 L30,140 L-40,280 M-20,-120 L110,-60 M30,140 L130,90" fill="none" stroke="#e8f2ff" stroke-width="5" opacity=".8"/>`;
  return `<g transform="translate(${f(x)},${f(y)}) scale(${s})"><ellipse cx="0" cy="0" rx="${f(300 * glow)}" ry="${f(420 * glow)}" fill="#6a5cff" opacity=".18" filter="url(#blur30)"/>${g}</g>`;
}
const UPBTN = (k = 1) => `<rect x="-120" y="${f(-40 * k)}" width="240" height="${f(80 * k)}" rx="40" fill="#ffd23a" stroke="${OL}" stroke-width="6"/>` + txt(0, 2, 'УЛУЧШИТЬ', 34 * k, '#111427');
function bike(x, y, s, moto = 0) {
  if (!moto) return `<g transform="translate(${x},${y}) scale(${s})"><circle cx="-110" cy="40" r="70" fill="none" stroke="${OL}" stroke-width="12"/><circle cx="110" cy="40" r="70" fill="none" stroke="${OL}" stroke-width="12"/><path d="M-110,40 L-20,-50 L70,-50 L110,40 M-20,-50 L0,40 L70,-50 M70,-50 L60,-90 L100,-95" fill="none" stroke="#8a6a4a" stroke-width="12" stroke-linejoin="round"/><path d="M-40,-60 L10,-60" stroke="${OL}" stroke-width="14"/></g>`;
  return `<g transform="translate(${x},${y}) scale(${s})"><circle cx="-130" cy="40" r="76" fill="#2a2e3a" stroke="${OL}" stroke-width="10"/><circle cx="130" cy="40" r="76" fill="#2a2e3a" stroke="${OL}" stroke-width="10"/><circle cx="-130" cy="40" r="30" fill="#9aa3b2"/><circle cx="130" cy="40" r="30" fill="#9aa3b2"/><path d="M-170,-10 Q-60,-120 60,-80 L150,-20 Q120,30 40,30 L-80,30Z" fill="#e5484d" stroke="${OL}" stroke-width="9" stroke-linejoin="round"/><path d="M-60,-80 Q0,-110 40,-90" fill="none" stroke="#111" stroke-width="20" stroke-linecap="round"/><path d="M90,-60 L130,-120 L170,-118" fill="none" stroke="${OL}" stroke-width="12" stroke-linecap="round"/></g>`;
}
VIEWS.rain = {
  draw(lv, vd, t, ctx) {
    let s = BG('#141a33') + `<rect x="-700" y="1150" width="2480" height="1400" fill="#22273d"/>`;
    for (const [x, h] of [[60, 600], [300, 760], [760, 680], [980, 820]]) s += `<rect x="${x - 110}" y="${1150 - h}" width="220" height="${h}" fill="#1c2240"/>`;
    s += `<path d="M180,1150 L180,560 L240,560" fill="none" stroke="#0b0f1d" stroke-width="18"/><path d="M240,570 L90,1150 L390,1150Z" fill="#ffe28a" opacity=".12"/>`;
    s += guy({ ...VANYA, x: 560, y: 760, s: .95, mouth: 'sad', brow: 'worried', lid: .35, tired: .4, messy: .7, sweat: 0, tears: (ctx.segRel[1] ?? 9) < lv ? 1 : 0, look: [0, 10], t, legs: false });
    s += `<ellipse cx="560" cy="1250" rx="300" ry="30" fill="#3a4a7a" opacity=".6"/>`;
    let rain = ''; const r = rng(3); for (let i = 0; i < 90; i++) { const x = r() * 1300 - 100, y = ((r() * 2200 + t * 2200) % 2200) - 200; rain += `M${f(x)},${f(y)} l-24,80 `; }
    s += `<path d="${rain}" stroke="#9fb3d8" stroke-width="4" opacity=".55"/>`;
    return s + `<rect x="-700" y="-700" width="2480" height="3300" fill="url(#vigDark)"/>`;
  }
};
VIEWS.room = {
  draw(lv, vd, t, ctx) {
    let s = BG('#0a0c18') + `<rect x="80" y="320" width="300" height="360" fill="#141a33" stroke="#2a3050" stroke-width="16"/>` + stars(12, 100, 340, 260, 320, t, 4);
    s += `<rect x="-200" y="1000" width="1480" height="1200" fill="#1d2140"/><rect x="100" y="900" width="900" height="200" rx="30" fill="#2a2f55" stroke="${OL}" stroke-width="8"/>`;
    s += `<ellipse cx="230" cy="900" rx="110" ry="50" fill="#e8ecf5" stroke="${OL}" stroke-width="7"/><path d="M300,${f(930 - 6 * Math.sin(t * 1.5))} Q560,${f(860 - 10 * Math.sin(t * 1.5))} 980,930 L980,1010 L300,1010Z" fill="#5a6ab8" stroke="${OL}" stroke-width="7"/>` + txt(420, 760 - (t * 20 % 60), 'z', 50, '#9fb3d8', { op: .7 });
    const appear = clamp((lv - ((ctx.segEndRel[0] ?? 3) - 1.4)) / .4);
    const inner = appear > 0 ? `<rect x="-60" y="-60" width="120" height="120" rx="28" fill="#ffffff" opacity="${f(appear * (.6 + .4 * Math.sin(t * 6)))}"/>` : '';
    s += phoneUI(700, 860, .42, inner, true, 1 + appear);
    if (appear > 0) s += at(700, 620, appear, pill('?', '#111427', '#fff', 44, 70));
    return s;
  }
};
VIEWS.phone = {
  draw(lv, vd, t) {
    let s = BG('#0b0d18');
    const inner = txt(0, -170, 'ХОЧЕШЬ', 40, '#fff') + txt(0, -120, 'УЛУЧШИТЬ', 40, '#ffd23a') + txt(0, -70, 'СВОЮ ЖИЗНЬ?', 40, '#fff') + at(0, 120, eBack((lv - .8) / .3) * (1 + .05 * Math.sin(t * 6)), UPBTN());
    s += phoneUI(540, 780, 1.25, inner, true, 1.3);
    return s;
  }
};
VIEWS.tap = {
  draw(lv, vd, t, ctx) {
    let s = BG('#0b0d18');
    const s1 = ctx.segRel[1] ?? 9, press = clamp((lv - s1 - .3) / .15), rip = clamp((lv - s1 - .4) / .6);
    s += phoneUI(540, 780, 1.25, at(0, 120, 1 - .1 * press, UPBTN()) + (rip > 0 && rip < 1 ? `<circle cx="0" cy="120" r="${f(40 + 260 * rip)}" fill="none" stroke="#ffd23a" stroke-width="10" opacity="${f(1 - rip)}"/>` : ''), true, 1.3);
    const fy = lerp(1250, 940, eOut(clamp((lv - s1 + .3) / .6))) + 20 * press;
    s += `<g transform="translate(560,${f(fy)})"><path d="M-40,40 L-40,-80 Q-40,-120 0,-120 Q40,-120 40,-80 L40,40 L80,300 L-80,300Z" fill="#f7c6a0" stroke="${OL}" stroke-width="8"/></g>`;
    if (rip > 0) s += `<rect x="-700" y="-700" width="2480" height="3300" fill="#fff" opacity="${f(.6 * (1 - rip))}"/>`;
    return s;
  }
};
VIEWS.upgrade = {
  draw(lv, vd, t, ctx) {
    let s = sunburst('#ffd23a', '#e0a800', t * .1);
    const k1 = clamp((lv - .4) / .4), k2 = clamp((lv - 2.8) / .4);
    s += at(540, 560, 1, k1 < 1 ? bike(0, 0, 1.2) : bike(0, 0, 1.2, 1)) + (k1 > 0 && k1 < 1 ? `<circle cx="540" cy="560" r="${f(300 * k1)}" fill="#fff" opacity="${f(1 - k1)}"/>` : '');
    s += at(540, 1010, 1, phoneUI(0, 0, .45, k2 >= 1 ? `<rect x="-150" y="-300" width="300" height="600" rx="28" fill="#5a8cff"/><circle cx="0" cy="0" r="80" fill="#fff" opacity=".4"/>` : '', k2 < 1, 1));
    if (k2 >= 1) s += sparks(540, 1010, t, 200, 6, '#fff');
    return s;
  }
};
VIEWS.joy = {
  draw(lv, vd, t) {
    let s = sunburst('#2fd27a', '#14905a', t * .12) + particles(30, 4, t, { col: ['#ffd23a', '#fff', '#e5484d'], size: 9, speed: 300, op: .9, shape: 'leaf' });
    s += bike(540, 1180, 1.1, 1);
    s += guy({ ...VANYA, x: 540, y: 640 + Math.abs(Math.sin(t * 6)) * -30, s: .9, pose: 'out', mouth: 'smile', eyes: 'squeeze', brow: 'raised', legs: false, t });
    return s;
  }
};
VIEWS.notify = {
  draw(lv, vd, t, ctx) {
    let s = BG('#1a0608') + `<circle cx="540" cy="800" r="700" fill="url(#redGlow)" opacity="${f(.3 + .2 * Math.sin(t * 5))}"/>`;
    const s1 = ctx.segRel[1] ?? 9, k = pop(lv, .3);
    let card = `<rect x="-140" y="-90" width="280" height="190" rx="24" fill="#2a2e45" stroke="#fff" stroke-width="4"/>` + txt(0, -55, 'УЛУЧШЕНИЕ', 26, '#fff') + txt(0, -25, 'ОПЛАЧЕНО', 26, '#2fd27a');
    if (lv > s1 + 1) card += txt(0, 22, 'СПИСАНО:', 26, '#ff6b6b') + txt(0, 62, '1 ГОД ЖИЗНИ', 34, '#ff3b3b');
    s += phoneUI(540, 780, 1.25, at(0, -150, k, card), false, 1.3);
    return s;
  }
};
VIEWS.mirror = {
  draw(lv, vd, t) {
    let s = BG('#1d2236');
    s += `<rect x="190" y="320" width="700" height="900" rx="350" fill="#bcd2ea" stroke="#8a6a4a" stroke-width="30"/><clipPath id="mr${++uid}"><rect x="205" y="335" width="670" height="870" rx="335"/></clipPath>`;
    const g = clamp((lv - 1.2) / 1.5);
    s += `<g clip-path="url(#mr${uid})"><rect x="0" y="0" width="1080" height="1920" fill="#9fb8d6"/>${guy({ ...VANYA, x: 540, y: 780, s: 1.1, legs: false, mouth: 'open', mouthOpen: .5, brow: 'raised', lid: 0, t })}`;
    s += `<path d="M-60,-200 Q-10,-215 40,-196 L30,-120 Q0,-130 -40,-118Z" transform="translate(540,780) scale(1.1)" fill="#e8e8e8" stroke="${OL}" stroke-width="6" opacity="${f(g)}"/>`;
    s += `<path d="M260,400 L420,1100" stroke="#fff" stroke-width="30" opacity=".18"/></g>`;
    if (g > .5) s += at(540 + 40, 520, eBack((g - .5) * 2), `<circle r="80" fill="none" stroke="#ff3b3b" stroke-width="10"/>`);
    return s + `<rect x="-700" y="-700" width="2480" height="3300" fill="url(#vigDark)"/>`;
  }
};
VIEWS.cliff = {
  draw(lv, vd, t, ctx) {
    let s = BG('#0b0d18');
    const secs = Math.max(0, 86399 - Math.floor(lv)), hh = String(Math.floor(secs / 3600)).padStart(2, '0'), mm = String(Math.floor(secs / 60) % 60).padStart(2, '0'), ss = String(secs % 60).padStart(2, '0');
    s += phoneUI(540, 760, 1.25, txt(0, -120, 'СЛЕДУЮЩЕЕ', 30, '#aab') + txt(0, -80, 'УЛУЧШЕНИЕ', 30, '#aab') + txt(0, 20, `${hh}:${mm}:${ss}`, 64, '#ffd23a') + at(0, 160, 1, UPBTN(.9).replace('#ffd23a', '#4a4f66')), false, 1.2);
    const s1 = ctx.segRel[1] ?? 9;
    if (lv > s1) s += at(540, 1180, pop(lv, s1 + .2), pill('ПРОДОЛЖЕНИЕ СЛЕДУЕТ…', '#8b5cff', '#fff', 40, 76), -3);
    return s;
  }
};
