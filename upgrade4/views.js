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

// ── серия 2 ──
const RICH = { ...VANYA, shirt: '#111427', hair: '#6a5a4a', hairD: '#4a3a2a', tired: .5 };
VIEWS.recap = {
  draw(lv, vd, t) {
    let a = BG('#1d2236') + `<rect x="190" y="320" width="700" height="900" rx="350" fill="#9fb8d6" stroke="#8a6a4a" stroke-width="30"/>` + guy({ ...VANYA, x: 540, y: 780, s: 1.1, legs: false, mouth: 'open', mouthOpen: .5, brow: 'raised', lid: 0, t });
    a += `<path d="M-60,-200 Q-10,-215 40,-196 L30,-120 Q0,-130 -40,-118Z" transform="translate(540,780) scale(1.1)" fill="#e8e8e8" stroke="${OL}" stroke-width="6"/>`;
    let s = `<g filter="url(#sepia)">${a}</g>` + `<rect x="-700" y="-700" width="2480" height="3300" fill="url(#vigDark)"/>`;
    return s + at(540, 380, pop(lv, .2), pill('РАНЕЕ В «АПГРЕЙДЕ»', '#8b5cff', '#fff', 38, 70), -3);
  }
};
VIEWS.buzz = {
  draw(lv, vd, t, ctx) {
    let s = BG('#0b0d18');
    const s1 = ctx.segRel[1] ?? 9, sh = lv < s1 ? Math.sin(t * 60) * 10 : 0;
    const inner = lv < s1 ? txt(0, 0, '23:59:59 → 00:00:00', 26, '#ffd23a') : txt(0, -150, 'ХОЧЕШЬ', 40, '#fff') + txt(0, -100, 'СТАТЬ', 40, '#fff') + txt(0, -50, 'БОГАТЫМ?', 44, '#2fd27a') + at(0, 120, eBack((lv - s1 - .6) / .3), UPBTN());
    s += phoneUI(540 + sh, 780, 1.25, inner, false, 1.3);
    if (lv < s1) s += `<path d="M300,620 l-60,-20 M300,780 l-70,0 M300,940 l-60,20 M780,620 l60,-20 M780,780 l70,0 M780,940 l60,20" stroke="#ffd23a" stroke-width="10" stroke-linecap="round" opacity="${f(.5 + .5 * Math.sin(t * 30))}"/>`;
    return s;
  }
};
VIEWS.rich = {
  draw(lv, vd, t, ctx) {
    let s = sunburst('#2fd27a', '#14905a', t * .12);
    const v = Math.round(1e6 * eOut(lv / 1.7));
    s += phoneUI(540, 700, 1.0, txt(0, -150, 'БАЛАНС', 34, '#aab') + txt(0, -80, '+' + v.toLocaleString('ru-RU') + ' ₽', 44, '#2fd27a'), false, 1.2);
    const s1 = ctx.segRel[1] ?? 9;
    if (lv > s1) s += guy({ ...VANYA, x: 540, y: 1180, s: .55, legs: false, mouth: 'open', mouthOpen: 1, brow: 'raised', lid: 0, t, pose: 'out' });
    for (let i = 0; i < 10; i++) { const r = rng(i + 3), y = ((r() * 2000 + t * 400) % 2000) - 100; s += `<g transform="translate(${f(r() * 1080)},${f(y)}) rotate(${f(t * 80 + i * 40)})"><rect x="-50" y="-26" width="100" height="52" rx="6" fill="#7bd389" stroke="${OL}" stroke-width="4"/>${txt(0, 2, '₽', 30, '#1d7a3a')}</g>`; }
    return s;
  }
};
VIEWS.greed = {
  draw(lv, vd, t) {
    let s = sunburst('#ffd23a', '#e0a800', t * .14);
    const items = [
      `<path d="M-90,-80 L-40,-110 Q0,-80 40,-110 L90,-80 L120,-20 L80,0 L80,110 L-80,110 L-80,0 L-120,-20Z" fill="#111427" stroke="${OL}" stroke-width="8"/><path d="M-20,-100 L0,-60 L20,-100" fill="none" stroke="#ffd23a" stroke-width="8"/>`,
      `<path d="M-160,30 Q-150,-40 -80,-50 L-40,-100 L60,-100 L110,-50 Q160,-40 160,30Z" fill="#e5484d" stroke="${OL}" stroke-width="8"/><circle cx="-90" cy="40" r="34" fill="#2a2e3a" stroke="${OL}" stroke-width="7"/><circle cx="90" cy="40" r="34" fill="#2a2e3a" stroke="${OL}" stroke-width="7"/><path d="M-30,-90 L40,-90 L80,-50 L-60,-50Z" fill="#9fe0ff"/>`,
      `<rect x="-110" y="-60" width="220" height="170" fill="#e8ecf5" stroke="${OL}" stroke-width="8"/><path d="M-140,-60 L0,-160 L140,-60Z" fill="#8b5cff" stroke="${OL}" stroke-width="8" stroke-linejoin="round"/>${[-60, 0, 60].map(x => `<rect x="${x - 20}" y="-30" width="40" height="40" fill="#ffe28a" stroke="${OL}" stroke-width="4"/>`).join('')}<rect x="-25" y="40" width="50" height="70" fill="#7a4a26"/>`];
    const T = [1.2, 2.0, 2.7];
    items.forEach((it, i) => { s += at(200 + i * 340, 560 + (i % 2) * 120, pop(lv, T[i]), it + `<g transform="translate(0,160)">${pill('УЛУЧШЕНО', '#2fd27a', '#111427', 26, 48)}</g>`, (i - 1) * 6); });
    const g = clamp((lv - .5) / 3);
    s += guy({ ...RICH, x: 540, y: 1080, s: .62, legs: false, mouth: 'smile', eyes: lv > 3 ? 'squeeze' : 'open', t, hair: mix('#4a2a15', '#9a9a9a', g), hairD: mix('#2e180b', '#6a6a6a', g) });
    return s;
  }
};
VIEWS.hands = {
  shakes: () => [[.1, 16, .4]],
  draw(lv, vd, t, ctx) {
    let s = BG('#1a0608') + `<circle cx="540" cy="820" r="700" fill="url(#redGlow)" opacity=".35"/>`;
    const s1 = ctx.segRel[1] ?? 9, age = clamp((lv - s1) / 1.5);
    if (lv < s1) return s + phoneUI(540, 780, 1.25, `<rect x="-140" y="-90" width="280" height="190" rx="24" fill="#2a2e45" stroke="#fff" stroke-width="4"/>` + txt(0, -30, 'СПИСАНО:', 30, '#ff6b6b') + txt(0, 30, '5 ЛЕТ ЖИЗНИ', 36, '#ff3b3b'), false, 1.3);
    const skin = mix('#f7c6a0', '#d9b090', age);
    for (const sx of [-1, 1]) {
      let h = `<path d="M-90,200 L-90,0 Q-90,-30 -60,-30 L-60,-150 Q-60,-180 -35,-180 Q-10,-180 -10,-150 L-10,-60 L-10,-190 Q-10,-220 15,-220 Q40,-220 40,-190 L40,-60 L40,-170 Q40,-200 65,-200 Q90,-200 90,-170 L90,0 Q100,60 80,200Z" fill="${skin}" stroke="${OL}" stroke-width="8" stroke-linejoin="round"/>`;
      for (let k = 0; k < 6; k++) h += `<path d="M${-70 + k * 25},${40 + (k % 2) * 30} q12,-8 24,0" fill="none" stroke="#8a5a3a" stroke-width="4" opacity="${f(age)}"/>`;
      h += `<circle cx="20" cy="80" r="12" fill="#8a5a3a" opacity="${f(age * .6)}"/><circle cx="-40" cy="120" r="8" fill="#8a5a3a" opacity="${f(age * .6)}"/>`;
      s += `<g transform="translate(${540 + sx * 220},${f(900 + Math.sin(t * 20) * 4 * age)}) scale(${sx * 1.2},1.2)">${h}</g>`;
    }
    return s;
  }
};
VIEWS.delete = {
  draw(lv, vd, t, ctx) {
    let s = BG('#0b0d18');
    const s1 = ctx.segRel[1] ?? 9, m = clamp((lv - s1 - 1.0) / .5), gl = m > 0 && m < 1;
    const btn = m < .5 ? `<rect x="-120" y="-40" width="240" height="80" rx="40" fill="#ff3b3b" stroke="${OL}" stroke-width="6"/>` + txt(0, 2, 'УДАЛИТЬ', 34, '#fff') : UPBTN();
    s += phoneUI(540 + (gl ? (Math.random() - .5) * 0 + Math.sin(t * 90) * 14 : 0), 780, 1.25, txt(0, -120, 'УДАЛИТЬ', 36, '#fff') + txt(0, -75, 'ПРИЛОЖЕНИЕ?', 36, '#fff') + at(0, 100, 1, btn), false, 1.3);
    if (gl) s += `<rect x="-700" y="${f(700 + Math.sin(t * 50) * 200)}" width="2480" height="60" fill="#ff00aa" opacity=".25"/>`;
    if (lv < s1) s += guy({ ...RICH, x: 170, y: 900, s: .48, legs: false, mouth: 'scream', brow: 'angry', look: [16, 0], t, pose: 'out' });
    return s;
  }
};
VIEWS.door = {
  draw(lv, vd, t, ctx) {
    const s1 = ctx.segRel[1] ?? 9, open = clamp((lv - 1.4) / .8);
    let s = BG('#14121c') + `<rect x="250" y="330" width="580" height="920" fill="#0a0910"/>`;
    s += `<rect x="250" y="330" width="580" height="920" fill="#ffe8b0" opacity="${f(.25 * open)}"/>`;
    if (open > 0) s += guy({ x: 540, y: 700, s: .95, legs: false, hair: '#e8e8e8', hairD: '#c9c9c9', beard: '#f0f0f0', glasses: true, browCol: '#d0d0d0', tired: 1, lid: .4, mouth: lv > s1 ? 'flat' : 'sad', shirt: '#3b5aa8', t, opacity: f(open) });
    s += `<g transform="translate(250,330) scale(${f(1 - .85 * open)},1)"><rect x="0" y="0" width="580" height="920" fill="#7a4a26" stroke="${OL}" stroke-width="10"/><rect x="60" y="60" width="460" height="340" fill="none" stroke="#5a3418" stroke-width="10"/><rect x="60" y="480" width="460" height="380" fill="none" stroke="#5a3418" stroke-width="10"/><circle cx="500" cy="470" r="20" fill="#ffd23a" stroke="${OL}" stroke-width="5"/></g>`;
    s += `<rect x="250" y="330" width="580" height="920" fill="none" stroke="#3a2a1e" stroke-width="24"/>`;
    if (lv < 1.2) s += comic(540, 500, 'ТУК-ТУК', eBack(lv / .2), '#fff', 64);
    if (lv > s1 + 1.0) s += at(830, 450, pop(lv, s1 + 1.0), pill('ВОЗРАСТ: 23', '#ff3b3b', '#fff', 36, 66), 6);
    return s + `<rect x="-700" y="-700" width="2480" height="3300" fill="url(#vigDark)"/>`;
  }
};
VIEWS.cliff2 = {
  draw(lv, vd, t) {
    let s = BG('#0b0d18');
    s += guy({ x: 330, y: 760, s: .85, legs: false, hair: '#e8e8e8', hairD: '#c9c9c9', beard: '#f0f0f0', glasses: true, browCol: '#d0d0d0', tired: 1, lid: .4, mouth: 'flat', shirt: '#3b5aa8', t });
    s += guy({ ...RICH, x: 770, y: 760, s: .85, legs: false, mouth: 'open', mouthOpen: .5, brow: 'worried', t, hair: '#8a8a8a', hairD: '#5a5a5a', look: [-14, 0] });
    s += at(540, 420, pop(lv, .4), pill('СЕРИЯ 3 — СКОРО', '#8b5cff', '#fff', 42, 78), -3);
    return s + `<rect x="-700" y="-700" width="2480" height="3300" fill="url(#vigDark)"/>`;
  }
};

// ── серия 3 ──
const MISHA = { hair: '#e8e8e8', hairD: '#c9c9c9', beard: '#f0f0f0', glasses: true, browCol: '#d0d0d0', tired: 1, lid: .3, shirt: '#3b5aa8' };
const VAN3 = { ...RICH, hair: '#8a8a8a', hairD: '#5a5a5a' };
const CREATOR = { shirt: '#14161f', hair: '#111', hairD: '#000', skin: '#f2d2b6', browCol: '#111', irisCol: '#c81a1a', blush: 0 };
VIEWS.recap3 = {
  draw(lv, vd, t) {
    const a = BG('#14121c') + guy({ ...MISHA, x: 330, y: 760, s: .85, legs: false, mouth: 'flat', t }) + guy({ ...VAN3, x: 770, y: 760, s: .85, legs: false, mouth: 'open', mouthOpen: .5, brow: 'worried', look: [-14, 0], t });
    return `<g filter="url(#sepia)">${a}</g><rect x="-700" y="-700" width="2480" height="3300" fill="url(#vigDark)"/>` + at(540, 380, pop(lv, .2), pill('РАНЕЕ В «АПГРЕЙДЕ»', '#8b5cff', '#fff', 38, 70), -3);
  }
};
VIEWS.misha = {
  draw(lv, vd, t, ctx) {
    let s = BG('#1d2236') + `<rect x="-700" y="1150" width="2480" height="1400" fill="#2a2f45"/>`;
    const talk = lv < (ctx.segEndRel[0] ?? 3) && Math.floor(t * 7) % 2;
    s += guy({ ...MISHA, x: 400, y: 760, s: 1.0, legs: false, pose: 'hold', mouth: talk ? 'open' : 'flat', mouthOpen: .4, t });
    const s1 = ctx.segRel[1] ?? 9;
    if (lv > s1) { const n = Math.min(47, Math.round(47 * eOut((lv - s1 - .3) / 1.3))); s += at(800, 640, pop(lv, s1), phoneUI(0, 0, .7, txt(0, -160, 'УЛУЧШЕНИЙ', 30, '#aab') + txt(0, -40, String(n), 140, '#ffd23a') + at(0, 160, 1, UPBTN(.9)), true, 1)); }
    return s + `<rect x="-700" y="-700" width="2480" height="3300" fill="url(#vigDark)"/>`;
  }
};
VIEWS.vortex = {
  draw(lv, vd, t) {
    let s = BG('#05030c');
    for (let i = 0; i < 80; i++) { const r = rng(i + 3), a0 = r() * 6.28, q = ((t * .25 + r()) % 1), rad = 650 * (1 - q), a = a0 + q * 6; s += txt(540 + Math.cos(a) * rad, 760 + Math.sin(a) * rad * .8, String(2000 + Math.floor(r() * 30)), 24 + 20 * (1 - q), '#ffd23a', { op: f(.2 + .7 * q) }); }
    s += `<circle cx="540" cy="760" r="${f(120 + 20 * Math.sin(t * 6))}" fill="#000" stroke="#8b5cff" stroke-width="12"/><circle cx="540" cy="760" r="260" fill="url(#ghostGlow)" opacity=".3"/>`;
    return s + at(540, 400, pop(lv, .5), pill('ГОДЫ ЖИЗНИ → ???', '#111427', '#ffd23a', 40, 74));
  }
};
VIEWS.trace = {
  draw(lv, vd, t) {
    let s = BG('#14213d');
    let grid = ''; for (let x = -100; x < 1200; x += 90) grid += `M${x},-200 L${x + 200},2200 `; for (let y = -100; y < 2200; y += 90) grid += `M-200,${y} L1300,${y - 120} `;
    s += `<path d="${grid}" stroke="#2a3a66" stroke-width="10"/>`;
    for (let i = 0; i < 18; i++) { const r = rng(i); s += `<rect x="${f(r() * 1000)}" y="${f(300 + r() * 900)}" width="${f(50 + r() * 80)}" height="${f(40 + r() * 60)}" fill="#22305a" stroke="#0b1020" stroke-width="4"/>`; }
    const q = eInOut(lv / 1.2);
    s += `<path d="M200,1150 Q400,${f(900)} ${f(lerp(200, 820, q))},${f(lerp(1150, 520, q))}" fill="none" stroke="#ffd23a" stroke-width="10" stroke-dasharray="20 14"/>`;
    s += at(820, 520, pop(lv, 1.2), `<path d="M0,40 C-60,-20 -50,-110 0,-110 C50,-110 60,-20 0,40Z" fill="#ff3b3b" stroke="${OL}" stroke-width="8"/><circle cx="0" cy="-62" r="20" fill="#fff"/><g transform="translate(-120,90)">${pill('ДАТА-ЦЕНТР', '#111427', '#fff', 34, 62)}</g>`);
    return s;
  }
};
VIEWS.tempt = {
  draw(lv, vd, t, ctx) {
    let s = BG('#0b0d18') + `<rect x="-700" y="1150" width="2480" height="1400" fill="#1a1d2c"/>`;
    for (let i = 0; i < 6; i++) { const x = ((i * 260 - t * 900) % 1560 + 1560) % 1560 - 240; s += `<rect x="${f(x)}" y="1230" width="140" height="14" fill="#ffe28a" opacity=".6"/><circle cx="${f(x + 60)}" cy="420" r="10" fill="#ffe28a" opacity=".5"/>`; }
    s += `<path d="M-100,1150 L-100,560 Q540,460 1180,560 L1180,1150Z" fill="#232840" stroke="${OL}" stroke-width="8"/><path d="M60,620 Q540,540 1020,620 L1020,900 L60,900Z" fill="#0f1426"/>`;
    s += guy({ ...MISHA, x: 300, y: 820, s: .6, legs: false, mouth: 'flat', t, look: [10, 0] }) + guy({ ...VAN3, x: 740, y: 820, s: .6, legs: false, mouth: 'flat', brow: 'worried', t, look: [0, 12], light: (ctx.segRel[0] ?? 0) < lv ? .12 : 0 });
    const s1 = ctx.segRel[1] ?? 9;
    if (lv > .6) s += at(800, 1080, pop(lv, .6), phoneUI(0, 0, .5, lv > s1 ? txt(0, -60, 'УЛУЧШИТЬ', 40, '#ffd23a') + txt(0, -10, 'СКОРОСТЬ?', 40, '#fff') + at(0, 120, 1, UPBTN()) : '', false, 1.4));
    return s;
  }
};
VIEWS.dc = {
  draw(lv, vd, t) {
    let s = BG('#05070f');
    for (let row = 0; row < 3; row++) for (let i = -1; i < 7; i++) {
      const z = .55 + row * .25, x = 540 + (i - 3) * 200 * z, y = 760 + row * 60, w = 160 * z, h = 700 * z;
      s += `<rect x="${f(x - w / 2)}" y="${f(y - h / 2)}" width="${f(w)}" height="${f(h)}" fill="#141a2c" stroke="#0a0d18" stroke-width="5"/>`;
      for (let k = 0; k < 12; k++) s += `<circle cx="${f(x - w / 3 + (k % 3) * w / 3)}" cy="${f(y - h / 2 + 30 + Math.floor(k / 3) * h / 4.5)}" r="${f(5 * z)}" fill="${Math.sin(t * 9 + i * 3 + k + row) > .3 ? '#2fd27a' : '#1d3a2a'}"/>`;
    }
    s += `<path d="M540,1300 L340,1920 L740,1920Z" fill="#fff" opacity=".04"/>`;
    s += `<g opacity="${f(clamp((lv - 1.2) / .8))}"><ellipse cx="540" cy="1050" rx="60" ry="14" fill="#000" opacity=".6"/><path d="M500,1050 L500,920 Q540,860 580,920 L580,1050Z" fill="#000"/><circle cx="540" cy="860" r="34" fill="#000"/><circle cx="528" cy="858" r="4" fill="#ff2a2a"/><circle cx="552" cy="858" r="4" fill="#ff2a2a"/></g>`;
    return s + `<rect x="-700" y="-700" width="2480" height="3300" fill="url(#vigDark)"/>`;
  }
};
VIEWS.creator = {
  draw(lv, vd, t) {
    let s = BG('#0b0d18') + `<rect x="-700" y="1100" width="2480" height="1400" fill="#3a2418"/><rect x="60" y="1080" width="960" height="40" fill="#5a3a26" stroke="${OL}" stroke-width="6"/>`;
    s += guy({ ...CREATOR, x: 360, y: 720, s: .95, legs: false, mouth: 'smile', brow: 'angry', lid: .2, t });
    const k = pop(lv, 1.6);
    if (k > 0) s += at(800, 860, k, `<rect x="-150" y="-190" width="300" height="380" rx="10" fill="#6b4a2a" stroke="${OL}" stroke-width="9"/><rect x="-120" y="-160" width="240" height="300" fill="#e9d6a8"/><g filter="url(#sepia)"><clipPath id="ph${uid}"><rect x="-120" y="-160" width="240" height="300"/></clipPath><g clip-path="url(#ph${uid})">${guy({ ...CREATOR, x: 0, y: -40, s: .5, legs: false, mouth: 'flat', t })}</g></g>${txt(0, 165, '1890', 38, '#ffd23a', { stroke: OL, sw: 8 })}`, 6);
    return s + `<rect x="-700" y="-700" width="2480" height="3300" fill="url(#vigDark)"/>`;
  }
};
VIEWS.offer = {
  draw(lv, vd, t) {
    let s = BG('#14060a') + `<circle cx="540" cy="760" r="700" fill="url(#redGlow)" opacity="${f(.25 + .15 * Math.sin(t * 4))}"/>`;
    s += guy({ ...CREATOR, x: 540, y: 620, s: .85, legs: false, mouth: Math.floor(t * 7) % 2 && lv < vd - 1 ? 'open' : 'smile', mouthOpen: .4, brow: 'angry', pose: 'point', t });
    s += at(300, 1080, pop(lv, 1.5), phoneUI(0, 0, .42, txt(0, -40, 'МИША', 44, '#fff') + at(0, 100, 1, UPBTN()), true, 1), -6);
    s += at(820, 1080, pop(lv, 2.2), `<circle r="100" fill="#111427" stroke="#2fd27a" stroke-width="8"/>${txt(0, -10, '+6', 64, '#2fd27a')}${txt(0, 46, 'ЛЕТ ТЕБЕ', 22, '#fff')}`, 6);
    return s;
  }
};
VIEWS.cliff3 = {
  draw(lv, vd, t) {
    let s = BG('#0b0d18');
    s += guy({ ...VAN3, x: 540, y: 760, s: 1.0, legs: false, mouth: 'flat', brow: 'worried', sweat: 2, look: [Math.sin(t * 2) * 18, 6], t });
    s += at(220, 1140, 1, UPBTN(1.1), -6) + at(860, 1140, 1, `<rect x="-120" y="-44" width="240" height="88" rx="44" fill="#4a4f66" stroke="${OL}" stroke-width="6"/>` + txt(0, 2, 'ОТКАЗАТЬСЯ', 30, '#fff'), 6);
    return s + at(540, 380, pop(lv, .3), pill('СЕРИЯ 4 — СКОРО', '#8b5cff', '#fff', 42, 78), -3);
  }
};

// ── финал (кино-стиль) ──
const MISHA_Y = { hair: '#5a3a1e', hairD: '#3a2410', shirt: '#3b5aa8', browCol: '#3b2212' };
const VAN_Y = { ...VANYA };
function serverRoom(t, glow = '#2fd27a', blur = 6, dark = 0) {
  let g = BG('#05070f');
  for (let row = 0; row < 2; row++) for (let i = -1; i < 7; i++) {
    const z = .7 + row * .35, x = 540 + (i - 3) * 230 * z, y = 760 + row * 80, w = 170 * z, h = 760 * z;
    g += `<rect x="${f(x - w / 2)}" y="${f(y - h / 2)}" width="${f(w)}" height="${f(h)}" fill="#11162a" stroke="#070a14" stroke-width="5"/>`;
    for (let k = 0; k < 12; k++) g += `<circle cx="${f(x - w / 3 + (k % 3) * w / 3)}" cy="${f(y - h / 2 + 30 + Math.floor(k / 3) * h / 4.5)}" r="${f(5 * z)}" fill="${Math.sin(t * 9 + i * 3 + k + row) > .3 - dark * 2 ? glow : '#152018'}"/>`;
  }
  const id = ++uid;
  return `<filter id="sb${id}" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="${blur}"/></filter><g filter="url(#sb${id})">${g}</g>`;
}
const rimLight = (x, y, col = '#7fd0ff', r = 520, op = .35) => { const id = ++uid; return `<radialGradient id="rl${id}"><stop offset="0" stop-color="${col}" stop-opacity="${op}"/><stop offset=".55" stop-color="${col}" stop-opacity="${f(op * .35)}"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></radialGradient><circle cx="${x}" cy="${y}" r="${r * 1.3}" fill="url(#rl${id})"/>`; };
VIEWS.count = {
  draw(lv, vd, t) {
    let s = serverRoom(t, '#ff3b3b', 8) + rimLight(540, 700, '#ff2a2a', 480, .25);
    s += guy({ ...CREATOR, x: 540, y: 760, s: 1.15, legs: false, mouth: 'smile', brow: 'angry', lid: .2, pose: 'hold', t });
    const secs = Math.max(0, 10 - Math.floor(lv));
    s += at(540, 1140, 1, phoneUI(0, 0, .5, txt(0, 0, '0:' + String(secs).padStart(2, '0'), 90, '#ff3b3b'), false, 1.4));
    return s;
  }
};
VIEWS.plea = {
  draw(lv, vd, t) {
    let s = serverRoom(t, '#2fd27a', 10) + rimLight(300, 600, '#7fd0ff', 420, .3);
    s += guy({ ...MISHA, x: 540, y: 820, s: 1.55, legs: false, mouth: Math.floor(t * 6) % 2 && lv < vd - .6 ? 'open' : 'sad', mouthOpen: .35, brow: 'worried', tears: 1, t });
    return s;
  }
};
VIEWS.refuse = {
  shakes: () => [[.05, 12, .35]],
  draw(lv, vd, t) {
    let s = serverRoom(t, '#2fd27a', 12) + rimLight(800, 600, '#ffb347', 460, .3);
    s += guy({ ...VAN3, x: 540, y: 860, s: 1.7, legs: false, mouth: 'flat', brow: 'angry', lid: .15, t });
    return s;
  }
};
VIEWS.notice = {
  draw(lv, vd, t) {
    const k = eInOut(lv / vd);
    let s = serverRoom(t, '#2fd27a', 6 + 6 * k) + `<rect x="-700" y="1100" width="2480" height="1400" fill="#2a1a12"/>`;
    s += `<g transform="translate(540,900) scale(${f(lerp(1, 1.8, k) * 100) / 100}) translate(-540,-900)">`;
    s += `<rect x="40" y="1080" width="1000" height="40" fill="#4a2e1e"/>` + guy({ ...CREATOR, x: 240, y: 760, s: .7, legs: false, mouth: 'smile', brow: 'angry', t, opacity: f(1 - k) });
    s += phoneUI(700, 940, .32, txt(0, -40, 'СОЗДАТЕЛЬ', 34, '#aab') + at(0, 90, 1 + .06 * Math.sin(t * 6), UPBTN()), false, 1 + .6 * k);
    s += '</g>';
    return s + rimLight(700, 900, '#ffd23a', 300, .2 * k);
  }
};
VIEWS.grab = {
  flash: (lv, ctx) => { const c = (ctx.segEndRel[0] ?? 2) - .3, q = (lv - c) / .35; return q > 0 && q < 1 ? .9 * (1 - q) : 0; },
  draw(lv, vd, t, ctx) {
    const c = (ctx.segEndRel[0] ?? 2) - .3, press = clamp((lv - c + .15) / .15);
    let s = BG('#0b0d18') + rimLight(540, 800, '#6a5cff', 520, .35);
    s += phoneUI(540, 800, 1.3, at(0, 110, 1 - .1 * press, UPBTN()), false, 1.4);
    const hx = lerp(1300, 600, eOut(lv / .5));
    s += `<g transform="translate(${f(hx)},${f(1250 - 260 * eOut(clamp((lv - .5) / (c - .5))) + 20 * press)}) rotate(-20)"><path d="M-45,40 L-45,-90 Q-45,-130 0,-130 Q45,-130 45,-90 L45,40 L90,320 L-90,320Z" fill="#d9b090" stroke="${OL}" stroke-width="8"/></g>`;
    return s;
  }
};
VIEWS.release = {
  draw(lv, vd, t) {
    let s = serverRoom(t, '#ffd23a', 8) + rimLight(540, 760, '#fff3a0', 600, .3 + .1 * Math.sin(t * 4));
    for (let i = 0; i < 90; i++) { const r = rng(i + 9), a = r() * 6.28, q = ((t * .35 + r()) % 1), rad = 80 + 900 * q; s += txt(540 + Math.cos(a) * rad, 760 + Math.sin(a) * rad * .85, String(1890 + Math.floor(r() * 135)), 22 + 26 * q, '#ffe680', { op: f(1 - q) }); }
    s += `<circle cx="540" cy="760" r="${f(90 + 20 * Math.sin(t * 8))}" fill="#fff" opacity=".9" filter="url(#blur10)"/>`;
    return s;
  }
};
VIEWS.decay = {
  draw(lv, vd, t, ctx) {
    const s1 = ctx.segRel[1] ?? 1, age = clamp((lv - s1 + .2) / 1.4), dust = clamp((lv - s1 - 1.3) / 1.2);
    let s = serverRoom(t, '#2fd27a', 10, age) + rimLight(540, 700, '#ff2a2a', 480, .2 * (1 - dust));
    const shake = Math.sin(t * 50) * 6 * (1 - dust);
    s += guy({ ...CREATOR, x: 540 + shake, y: 780, s: 1.25, legs: false, mouth: 'scream', mouthOpen: 1, brow: 'worried', t, hair: mix('#111111', '#f2f2f2', age), hairD: mix('#000000', '#cfcfcf', age), beard: age > .4 ? mix('#555555', '#f0f0f0', age) : null, tired: age, skin: mix('#f2d2b6', '#c9b49a', age), opacity: f(1 - dust) });
    if (dust > 0) s += particles(120, 7, t, { x0: 280, x1: 800, y0: 400, y1: 1300, speed: 260, size: 6, col: ['#c9b49a', '#8a7a6a'], op: f(.9 * dust), up: true, drift: 80 });
    return s;
  }
};
VIEWS.young = {
  draw(lv, vd, t) {
    let s = serverRoom(t, '#2fd27a', 12, 1) + rimLight(540, 600, '#ffe8b0', 520, .4);
    s += guy({ ...MISHA_Y, x: 540, y: 760 - Math.abs(Math.sin(t * 5)) * 30, s: 1.05, legs: false, mouth: 'smile', brow: 'raised', pose: 'out', t });
    s += particles(30, 3, t, { col: ['#ffd23a', '#fff'], size: 7, speed: 200, op: .8, shape: 'leaf' });
    return s;
  }
};
VIEWS.morning = {
  draw(lv, vd, t, ctx) {
    let s = `<linearGradient id="mo${++uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb36b"/><stop offset="1" stop-color="#ffe9c4"/></linearGradient><rect x="-700" y="-700" width="2480" height="3300" fill="url(#mo${uid})"/>`;
    s += `<rect x="120" y="300" width="840" height="700" fill="#ffe9c4" stroke="#8a5a36" stroke-width="24"/><circle cx="700" cy="620" r="120" fill="#fff6d0"/><circle cx="700" cy="620" r="300" fill="url(#sunGlow)"/><path d="M540,300 L540,1000 M120,650 L960,650" stroke="#8a5a36" stroke-width="16"/>`;
    s += `<rect x="-700" y="1000" width="2480" height="1400" fill="#c98a5a"/>`;
    s += guy({ ...VAN_Y, x: 540, y: 820, s: 1.0, legs: false, mouth: 'smile', brow: 'neutral', t, pose: 'hold' });
    s += at(820, 470, pop(lv, .3), `<rect x="-200" y="-70" width="400" height="140" rx="26" fill="#111427" opacity=".92" stroke="#2fd27a" stroke-width="5"/>` + txt(0, -22, 'ПРИЛОЖЕНИЕ', 34, '#fff') + txt(0, 26, 'УДАЛЕНО ✓', 40, '#2fd27a'), 4);
    return s + `<path d="M120,300 L-200,1400 L400,1400Z" fill="#fff6d0" opacity=".15"/>`;
  }
};
VIEWS.twist = {
  draw(lv, vd, t, ctx) {
    const s1 = ctx.segRel[1] ?? 9, on = clamp((lv - 1.0) / .3);
    let s = BG('#05060f') + `<rect x="80" y="300" width="300" height="360" fill="#0d1226" stroke="#1a2040" stroke-width="16"/>` + stars(10, 100, 320, 260, 320, t, 8);
    s += rimLight(560, 900, '#6a5cff', 380, .35 * on);
    s += guy({ shirt: '#2fd27a', hair: '#e8c46a', hairD: '#b8943a', x: 560, y: 700, s: 1.0, legs: false, mouth: 'open', mouthOpen: .4, brow: 'raised', lid: 0, light: .12 * on, look: [0, 14], t });
    if (on > 0) s += at(560, 1150, 1, phoneUI(0, 0, .45, lv > s1 ? txt(0, -40, 'ХОЧЕШЬ', 36, '#fff') + txt(0, 5, 'УЛУЧШИТЬ', 36, '#ffd23a') + at(0, 110, 1, UPBTN(.9)) : '', false, 1.2));
    return s + `<rect x="-700" y="-700" width="2480" height="3300" fill="url(#vigDark)"/>`;
  }
};
VIEWS.endcard = {
  draw(lv, vd, t) {
    let s = BG('#05060f') + rimLight(540, 760, '#6a5cff', 600, .3);
    const k = eOut(lv / .8);
    s += `<g opacity="${f(k)}" transform="translate(540,${f(760 - 30 * (1 - k))})">${txt(0, -40, 'АПГРЕЙД', 150, '#fff', { ls: 10 })}<rect x="-300" y="50" width="600" height="6" fill="#ff3b3b"/>${txt(0, 110, 'К О Н Е Ц', 44, '#ff3b3b', { w: 700, ls: 8 })}</g>`;
    s += at(540, 1130, pop(lv, 1.6) * (1 + .04 * Math.sin(t * 5)), `<rect x="-230" y="-50" width="460" height="100" rx="50" fill="#ff3b3b" stroke="${OL}" stroke-width="6"/>` + txt(0, 2, 'ПОДПИСАТЬСЯ', 44, '#fff'));
    return s;
  }
};
