// «Миллион на газяву и кирики» — картинки сцен.
const ME = { shirt: '#2fd27a', hair: '#3a2414', hairD: '#24160b' };
function bottle(x, y, s, rot = 0, lvl = 1) {
  const id = ++uid, top = 200 - 400 * lvl;
  return `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)}) scale(${s})"><clipPath id="bt${id}"><path d="M-34,-250 L34,-250 L34,-210 Q90,-170 90,-110 L90,180 Q90,210 60,210 L-60,210 Q-90,210 -90,180 L-90,-110 Q-90,-170 -34,-210Z"/></clipPath>` +
    `<path d="M-34,-250 L34,-250 L34,-210 Q90,-170 90,-110 L90,180 Q90,210 60,210 L-60,210 Q-90,210 -90,180 L-90,-110 Q-90,-170 -34,-210Z" fill="#e8f4ff" fill-opacity=".5"/>` +
    `<g clip-path="url(#bt${id})"><rect x="-100" y="${f(top)}" width="200" height="500" fill="#5a2a12"/>${[0, 1, 2, 3, 4].map(i => `<circle cx="${-40 + i * 20}" cy="${150 - i * 60}" r="${5 + i % 3 * 2}" fill="#c98a5a" opacity=".7"/>`).join('')}</g>` +
    `<rect x="-92" y="-40" width="184" height="110" fill="#e5222b"/><path d="M-92,30 Q-30,-10 20,20 T92,0" fill="none" stroke="#fff" stroke-width="12"/>` +
    `<path d="M-34,-250 L34,-250 L34,-210 Q90,-170 90,-110 L90,180 Q90,210 60,210 L-60,210 Q-90,210 -90,180 L-90,-110 Q-90,-170 -34,-210Z" fill="none" stroke="${OL}" stroke-width="8"/>` +
    `<rect x="-40" y="-290" width="80" height="46" rx="10" fill="#e5222b" stroke="${OL}" stroke-width="7"/><path d="M-60,-150 L-60,150" stroke="#fff" stroke-width="12" stroke-linecap="round" opacity=".5"/></g>`;
}
function pack(x, y, s, rot = 0) {
  let crimp = 'M-120,-170'; for (let i = 0; i <= 12; i++) crimp += ` L${-120 + i * 20},${i % 2 ? -185 : -170}`;
  let crimp2 = 'M-120,170'; for (let i = 0; i <= 12; i++) crimp2 += ` L${-120 + i * 20},${i % 2 ? 185 : 170}`;
  return `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)}) scale(${s})"><path d="M-120,-170 Q-140,0 -120,170 L120,170 Q140,0 120,-170Z" fill="#ff8a1f" stroke="${OL}" stroke-width="8"/>` +
    `<path d="${crimp}" fill="#ff8a1f" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/><path d="${crimp2}" fill="#ff8a1f" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>` +
    `<ellipse cx="0" cy="-60" rx="95" ry="46" fill="#ffd23a" stroke="${OL}" stroke-width="5"/>${txt(0, -60, 'СУХАРИКИ', 30, '#c2410c')}` +
    `${[[-50, 50], [0, 80], [50, 45], [-20, 120], [40, 115]].map(([cx, cy]) => `<rect x="${cx - 22}" y="${cy - 22}" width="44" height="44" rx="8" fill="#e8b45a" stroke="${OL}" stroke-width="5" transform="rotate(${cx},${cx},${cy})"/>`).join('')}</g>`;
}
function bills(t, n = 30) { let s = ''; const r = rng(4); for (let i = 0; i < n; i++) { const x = r() * 1180 - 50, y = ((r() * 2200 + t * (300 + 200 * r())) % 2200) - 200, rot = t * 90 * (r() - .5) + r() * 360; s += `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)})"><rect x="-50" y="-26" width="100" height="52" rx="6" fill="#7bd389" stroke="${OL}" stroke-width="4"/>${txt(0, 2, '$', 34, '#1d7a3a')}</g>`; } return s; }
function stack(x, y, n) { let s = ''; for (let i = 0; i < n; i++) s += `<rect x="${x - 90}" y="${y - i * 22}" width="180" height="26" rx="6" fill="${i % 2 ? '#6cc47c' : '#7bd389'}" stroke="${OL}" stroke-width="5"/>`; return s + txt(x, y - n * 22 + 6, '$', 40, '#1d7a3a'); }
function elephant(x, y, s) {
  return `<g transform="translate(${f(x)},${f(y)}) scale(${s})"><rect x="-70" y="10" width="34" height="70" rx="12" fill="#9aa3b2" stroke="${OL}" stroke-width="6"/><rect x="40" y="10" width="34" height="70" rx="12" fill="#9aa3b2" stroke="${OL}" stroke-width="6"/><ellipse cx="0" cy="0" rx="100" ry="66" fill="#9aa3b2" stroke="${OL}" stroke-width="7"/><circle cx="90" cy="-30" r="50" fill="#9aa3b2" stroke="${OL}" stroke-width="7"/><path d="M130,-20 Q160,40 130,80" fill="none" stroke="${OL}" stroke-width="26" stroke-linecap="round"/><path d="M130,-20 Q160,40 130,80" fill="none" stroke="#9aa3b2" stroke-width="14" stroke-linecap="round"/><ellipse cx="62" cy="-30" rx="34" ry="44" fill="#b9c0cc" stroke="${OL}" stroke-width="6"/><circle cx="104" cy="-44" r="6" fill="${OL}"/></g>`;
}
function truck(x, y, s) {
  return `<g transform="translate(${f(x)},${f(y)}) scale(${s})"><rect x="-260" y="-160" width="360" height="170" rx="10" fill="#f4f6fa" stroke="${OL}" stroke-width="8"/>${bottle(-170, -78, .28)}${pack(-60, -78, .34)}<path d="M100,-110 L190,-110 L240,-50 L240,10 L100,10Z" fill="#2fd27a" stroke="${OL}" stroke-width="8" stroke-linejoin="round"/><path d="M120,-96 L180,-96 L214,-56 L120,-56Z" fill="#9fe0ff" stroke="${OL}" stroke-width="5"/>${[-190, -100, 170].map(cx => `<circle cx="${cx}" cy="18" r="34" fill="#2a2e3a" stroke="${OL}" stroke-width="6"/><circle cx="${cx}" cy="18" r="12" fill="#9aa3b2"/>`).join('')}</g>`;
}

VIEWS.hook = {
  draw(lv, vd, t, ctx) {
    let s = sunburst('#2fd27a', '#14905a', t * .12) + bills(t);
    s += stack(250, 1180, 9) + stack(830, 1180, 11) + stack(540, 1230, 6);
    s += guy({ ...ME, x: 540, y: 700, s: 1.05, legs: false, mouth: 'smile', brow: 'raised', lid: 0, t });
    for (const sx of [-1, 1]) s += txt(540 + sx * 68 * 1.05, 700 + 10 * 1.05, '$', 64, '#14905a', { stroke: '#fff', sw: 8 });
    const s1 = ctx.segRel[1] ?? 9;
    s += at(190, 520, pop(lv, s1 + .3), bottle(0, 0, .55, -12)) + at(890, 520, pop(lv, s1 + .7), pack(0, 0, .6, 12));
    return s;
  }
};
VIEWS.split = {
  draw(lv, vd, t) {
    let s = `<rect x="-700" y="-700" width="1240" height="3300" fill="#ff5a3a"/><rect x="540" y="-700" width="1240" height="3300" fill="#ff9a1f"/><path d="M540,-100 L540,2100" stroke="#fff" stroke-width="12" stroke-dasharray="40 20"/>`;
    s += at(290, 760, pop(lv, .2), bottle(0, 0, 1.05, -6)) + at(800, 760, pop(lv, 1.5), pack(0, 0, 1.0, 6));
    const tag = (label) => `<path d="M-90,-50 L60,-50 L110,0 L60,50 L-90,50Z" fill="#fff" stroke="${OL}" stroke-width="8"/><circle cx="62" cy="0" r="10" fill="${OL}"/>` + txt(-20, 2, label, 52, OL);
    s += at(300, 1150, pop(lv, .4), tag('$1,5'), -8) + at(800, 1150, pop(lv, 1.7), tag('$0,5'), 8);
    s += at(540, 420, pop(lv, .05), `<circle r="90" fill="#111427" stroke="#fff" stroke-width="8"/>` + txt(0, 2, '50/50', 46, '#fff'));
    return s;
  }
};
VIEWS.bottles = {
  draw(lv, vd, t) {
    let s = BG('#ffd9c4');
    const n = Math.floor(clamp(lv / 1.6) * 60);
    for (let i = 0; i < n; i++) s += bottle(110 + (i % 8) * 123, 420 + Math.floor(i / 8) * 115 + (i % 2) * 10, .26, (i * 37) % 20 - 10);
    const cnt = Math.round(333333 * eOut(lv / 1.8));
    s += at(540, 340, 1, `<rect x="-250" y="-62" width="500" height="124" rx="30" fill="#111427" stroke="${OL}" stroke-width="8"/>` + txt(0, 2, cnt.toLocaleString('ru-RU'), 76, '#ffe14a'));
    return s;
  }
};
VIEWS.pool = {
  draw(lv, vd, t) {
    let s = `<linearGradient id="pl${++uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fd0ff"/><stop offset="1" stop-color="#e8f7ff"/></linearGradient><rect x="-700" y="-700" width="2480" height="3300" fill="url(#pl${uid})"/>`;
    s += `<rect x="-700" y="700" width="2480" height="1400" fill="#d9dee6"/>`;
    s += `<path d="M120,760 L960,760 L1080,1260 L0,1260Z" fill="#ffffff" stroke="${OL}" stroke-width="9"/><path d="M150,790 L930,790 L1030,1230 L50,1230Z" fill="#6b3416" stroke="${OL}" stroke-width="7"/>`;
    for (let i = 1; i < 6; i++) { const q = i / 6; s += `<path d="M${f(150 + 780 * q)},790 L${f(50 + 980 * q)},1230" stroke="#ff3b3b" stroke-width="8" stroke-dasharray="20 14"/>`; }
    s += particles(40, 3, t, { x0: 80, x1: 1000, y0: 800, y1: 1230, speed: 60, size: 7, col: '#c98a5a', op: .8, up: true, drift: 10 });
    s += `<g transform="translate(540,1000)"><ellipse cx="0" cy="30" rx="150" ry="50" fill="#ff5ab0" stroke="${OL}" stroke-width="8"/><ellipse cx="0" cy="30" rx="70" ry="22" fill="#6b3416"/></g>`;
    s += guy({ ...ME, x: 540, y: 850 + Math.sin(t * 2) * 6, s: .4, legs: false, mouth: 'smile', t, pose: 'out' });
    s += at(540, 440, pop(lv, .2), pill('1/5 БАССЕЙНА', '#111427', '#ffe14a', 54, 92), -3);
    return s;
  }
};
VIEWS.scale = {
  draw(lv, vd, t) {
    let s = sunburst('#ffb02e', '#e07a0a', t * .1);
    const tilt = Math.sin(t * 2) * 2 * clamp(lv - 1);
    s += `<path d="M540,1260 L470,1260 L540,620 L610,1260Z" fill="#8a93a6" stroke="${OL}" stroke-width="8"/><g transform="rotate(${f(tilt)},540,620)"><rect x="80" y="604" width="920" height="32" rx="12" fill="#cfd6df" stroke="${OL}" stroke-width="8"/>`;
    s += `<path d="M160,636 L120,900 M160,636 L200,900 M920,636 L880,900 M920,636 L960,900" stroke="${OL}" stroke-width="5"/><path d="M60,900 L300,900 Q180,960 60,900Z" fill="#9aa3b2" stroke="${OL}" stroke-width="7"/><path d="M780,900 L1020,900 Q900,960 780,900Z" fill="#9aa3b2" stroke="${OL}" stroke-width="7"/>`;
    for (let i = 0; i < 9; i++) if (lv > .2 + i * .05) s += pack(110 + (i % 3) * 70, 860 - Math.floor(i / 3) * 70, .22, (i * 23) % 30 - 15);
    for (let i = 0; i < 7; i++) if (lv > .6 + i * .12) s += elephant(820 + (i % 3) * 70, 870 - Math.floor(i / 3) * 55, .32);
    s += '</g>';
    s += at(180, 420, pop(lv, .3), pill('40 Т', '#111427', '#fff', 54, 90)) + at(900, 420, pop(lv, 1.5), pill('7 СЛОНОВ', '#111427', '#ffe14a', 40, 76));
    return s;
  }
};
VIEWS.trucks = {
  draw(lv, vd, t) {
    let s = `<linearGradient id="tr${++uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fc8ff"/><stop offset="1" stop-color="#e2f4ff"/></linearGradient><rect x="-700" y="-700" width="2480" height="3300" fill="url(#tr${uid})"/>`;
    s += `<rect x="-700" y="900" width="2480" height="1400" fill="#7bd389"/><rect x="-700" y="1000" width="2480" height="220" fill="#4a4f5c"/>`;
    for (let x = -100; x < 1200; x += 160) s += `<rect x="${f(((x - t * 400) % 1300 + 1300) % 1300 - 100)}" y="1100" width="90" height="16" fill="#fff"/>`;
    for (let i = 0; i < 5; i++) s += truck(((i * 520 - t * 260) % 2600 + 2600) % 2600 - 600, 1080, .9);
    for (let i = 0; i < 4; i++) s += truck(((i * 600 - t * 180 + 300) % 2400 + 2400) % 2400 - 600, 820, .55);
    const n = Math.min(30, Math.round(30 * eOut(lv / 1.6)));
    s += at(540, 470, 1, `<rect x="-170" y="-62" width="340" height="124" rx="30" fill="#111427" stroke="${OL}" stroke-width="8"/>` + txt(0, 2, '×' + n, 84, '#ffe14a'));
    return s;
  }
};
VIEWS.years = {
  draw(lv, vd, t) {
    let s = sunburst('#8b5cff', '#4a1fb8', t * .1);
    const age = eOut(lv / 1.5);
    s += guy({ ...ME, x: 540, y: 760, s: 1.1, legs: false, mouth: 'smile', t, hair: mix('#3a2414', '#e8e8e8', age), hairD: mix('#24160b', '#c9c9c9', age), beard: age > .3 ? mix('#3a2414', '#f0f0f0', age) : null, glasses: age > .6, browCol: mix('#3b2212', '#d0d0d0', age), tired: age * .4 });
    s += at(830, 1080, 1, bottle(0, 0, .55, -14));
    const yrs = Math.round(913 * eOut(lv / 1.6));
    s += at(260, 440, 1, `<rect x="-190" y="-62" width="380" height="124" rx="30" fill="#111427" stroke="${OL}" stroke-width="8"/>` + txt(0, 2, yrs + ' ЛЕТ', 70, '#ffe14a'), -4);
    return s;
  }
};
VIEWS.ancient = {
  draw(lv, vd, t) {
    let s = `<linearGradient id="an${++uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffcf8a"/><stop offset="1" stop-color="#fff1d6"/></linearGradient><rect x="-700" y="-700" width="2480" height="3300" fill="url(#an${uid})"/>`;
    s += `<path d="M60,420 L540,260 L1020,420Z" fill="#f2e6cc" stroke="${OL}" stroke-width="9"/><rect x="60" y="420" width="960" height="50" fill="#e6d8b8" stroke="${OL}" stroke-width="8"/>`;
    for (const x of [110, 290, 790, 970]) s += `<rect x="${x - 36}" y="470" width="72" height="720" fill="#f2e6cc" stroke="${OL}" stroke-width="8"/><path d="M${x - 16},490 L${x - 16},1170 M${x + 16},490 L${x + 16},1170" stroke="#d6c7a4" stroke-width="6"/>`;
    s += `<rect x="-700" y="1190" width="2480" height="1400" fill="#d9c9a4"/>`;
    s += guy({ ...ME, shirt: '#f6f2e8', x: 540, y: 760, s: 1.0, legs: false, pose: 'hold', mouth: 'smile', t });
    for (const sx of [-1, 1]) for (let k = 0; k <= 6; k++) { // лавровый венок по дуге вокруг головы
      const q = k / 6, P0 = [540 + sx * 176, 650], P1 = [540 + sx * 176, 548], P2 = [540 + sx * 26, 532];
      const px = (1 - q) ** 2 * P0[0] + 2 * (1 - q) * q * P1[0] + q * q * P2[0], py = (1 - q) ** 2 * P0[1] + 2 * (1 - q) * q * P1[1] + q * q * P2[1];
      const tx = 2 * (1 - q) * (P1[0] - P0[0]) + 2 * q * (P2[0] - P1[0]), ty = 2 * (1 - q) * (P1[1] - P0[1]) + 2 * q * (P2[1] - P1[1]);
      const ang = Math.atan2(ty, tx) * 180 / Math.PI;
      for (const off of [-1, 1]) s += `<ellipse cx="${f(px)}" cy="${f(py)}" rx="24" ry="11" fill="#3aa84a" stroke="${OL}" stroke-width="4" transform="rotate(${f(ang + off * 35)},${f(px)},${f(py)}) translate(${off * 14},0)"/>`;
    }
    s += pack(540, 1330, .5, 0);
    s += at(830, 440, 1, `<rect x="-200" y="-62" width="400" height="124" rx="30" fill="#111427" stroke="${OL}" stroke-width="8"/>` + txt(0, 2, '2 740 ЛЕТ', 64, '#ffe14a'), 4) + at(250, 560, pop(lv, .5), pill('ДО Н.Э.', '#c2410c', '#fff', 40, 72), -6);
    return s;
  }
};
VIEWS.sugar = {
  draw(lv, vd, t, ctx) {
    let s = sunburst('#ff5a7a', '#c81a4a', t * .1);
    s += bottle(250, 840, .95, -4);
    const n = Math.min(40, Math.floor(clamp((lv - .3) / 1.6) * 40));
    for (let i = 0; i < n; i++) { const row = Math.floor(i / 8), col = i % 8; s += `<rect x="${f(530 + col * 58 + (row % 2) * 29)}" y="${f(1050 - row * 56)}" width="54" height="52" rx="6" fill="#fff" stroke="${OL}" stroke-width="5"/>`; }
    const s1 = ctx.segRel[1] ?? 9;
    if (lv < s1) s += at(760, 470, pop(lv, .3), pill('160 Г САХАРА', '#111427', '#fff', 44, 80));
    if (lv > s1) {
      const k = eOut((lv - s1) / .6);
      s += at(600, 410, 1, `<rect x="-330" y="-120" width="660" height="280" rx="30" fill="#fff" stroke="${OL}" stroke-width="8"/><rect x="-250" y="${f(110 - 60 * k)}" width="160" height="${f(60 * k)}" fill="#2fd27a" stroke="${OL}" stroke-width="6"/><rect x="60" y="${f(110 - 200 * k)}" width="160" height="${f(200 * k)}" fill="#ff3b3b" stroke="${OL}" stroke-width="6"/>${txt(-170, 135, 'НОРМА 50 Г', 28, OL)}${txt(140, 135, '160 Г', 28, OL)}${txt(140, f(110 - 100 * k), '×3', 56, '#fff', { stroke: OL, sw: 8 })}`);
    }
    return s;
  }
};
VIEWS.cta = {
  draw(lv, vd, t) {
    let s = sunburst('#2fd27a', '#14905a', t * .12) + bills(t, 18);
    s += guy({ ...ME, x: 540, y: 740, s: 1.2, legs: false, pose: 'hold', mouth: 'smile', brow: 'raised', t });
    s += `<g transform="translate(540,1330)">${[-60, -30, 0, 30, 60].map(a => `<g transform="rotate(${a})"><rect x="-40" y="-170" width="80" height="150" rx="6" fill="#7bd389" stroke="${OL}" stroke-width="5"/>${txt(0, -95, '$', 40, '#1d7a3a')}</g>`).join('')}</g>`;
    [[180, 470, 0], [900, 460, .15], [930, 720, .3]].forEach(([x, y, d], i) => { s += at(x, y + Math.sin(t * 4 + i) * 12, pop(lv, .2 + d), txt(0, 0, '?', 130 - i * 14, '#fff', { stroke: OL, sw: 16 }), 12 * Math.sin(t * 3 + i)); });
    return s;
  }
};
