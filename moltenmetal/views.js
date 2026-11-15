// «Что, если выпить жидкий металл» — картинки сцен.
const HOT = '#ff8a1a', HOT2 = '#ffd23a';
function heatDefs() {
  const id = ++uid;
  return [id, `<linearGradient id="hm${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3a0"/><stop offset=".4" stop-color="${HOT2}"/><stop offset="1" stop-color="${HOT}"/></linearGradient><radialGradient id="hg${id}"><stop offset="0" stop-color="#ffb347" stop-opacity=".9"/><stop offset="1" stop-color="#ff4a1a" stop-opacity="0"/></radialGradient>`];
}
const ESO = 'M0,150 C0,210 4,260 6,330 C8,420 10,480 18,540 C26,590 60,610 96,606';
const STOM = 'M80,560 C150,530 220,580 210,640 C200,700 120,720 70,690 C40,670 40,600 80,560Z';
function xray(o) {
  const p = Object.assign({ x: 540, y: 620, s: 1, flow: 0, belly: 0, steam: 0, cast: false, t: 0, face: {} }, o);
  const [id, defs] = heatDefs();
  let g = defs;
  g += `<path d="M-75,212 C-45,252 45,252 75,212 L185,236 C238,250 262,288 272,336 L312,470 Q270,500 226,498 L214,770 L-214,770 L-226,498 Q-270,500 -312,470 L-272,336 C-262,288 -238,250 -185,236 Z" fill="#1b2a4a" opacity=".82"/>`;
  g += `<path d="M-48,150 L-48,240 Q0,262 48,240 L48,150 Z" fill="#1b2a4a" opacity=".6"/>`;
  g += `<ellipse cx="-105" cy="420" rx="88" ry="140" fill="#ff9fb4" opacity=".55" stroke="#ffd0dc" stroke-width="4"/><ellipse cx="110" cy="410" rx="78" ry="130" fill="#ff9fb4" opacity=".55" stroke="#ffd0dc" stroke-width="4"/>`;
  g += `<path d="M30,440 C30,410 70,410 70,440 C70,410 110,410 110,440 C110,480 70,500 70,520 C70,500 30,480 30,440Z" fill="#e5484d" stroke="#ffd0dc" stroke-width="3"/>`;
  g += `<path d="${STOM}" fill="${p.cast ? '#9aa3b2' : mix('#ffb3a0', '#ff6a1a', p.belly)}" opacity="${p.cast ? 1 : .8}" stroke="#ffd0dc" stroke-width="4"/>`;
  g += `<path d="${ESO}" fill="none" stroke="#ffb3c0" stroke-width="30" stroke-linecap="round" opacity=".6"/>`;
  if (p.flow > 0) {
    const col = p.cast ? '#b7bfcc' : `url(#hm${id})`;
    if (!p.cast) g += `<path d="${ESO}" fill="none" stroke="#ff6a1a" stroke-width="70" stroke-linecap="round" pathLength="1000" stroke-dasharray="1000" stroke-dashoffset="${f(1000 * (1 - p.flow))}" opacity=".45" filter="url(#blur10)"/>`;
    g += `<path d="${ESO}" fill="none" stroke="${col}" stroke-width="24" stroke-linecap="round" pathLength="1000" stroke-dasharray="1000" stroke-dashoffset="${f(1000 * (1 - p.flow))}"/>`;
  }
  if (p.belly > 0 && !p.cast) g += `<circle cx="140" cy="630" r="${f(160 + 30 * Math.sin(p.t * 9))}" fill="url(#hg${id})" opacity="${f(p.belly)}"/>`;
  if (p.steam > 0) for (let i = 0; i < 7; i++) { const q = ((p.t * .9 + i / 7) % 1); s2 = 0; g += `<circle cx="${f(140 + Math.cos(i * 2.1) * 260 * q)}" cy="${f(630 + Math.sin(i * 2.1) * 200 * q - 80 * q)}" r="${f(30 + 70 * q)}" fill="#fff" opacity="${f(p.steam * .7 * (1 - q))}"/>`; }
  return `<g transform="translate(${f(p.x)},${f(p.y)}) scale(${p.s})">${g}</g>`;
}
var s2 = 0;
function body(o) { // персонаж + рентген поверх туловища
  const p = Object.assign({ x: 540, y: 620, s: 1 }, o);
  return guy({ x: p.x, y: p.y, s: p.s, legs: false, shirt: '#3b5aa8', ...p.face, t: p.t }) + xray(p) +
    (p.flow > 0 && !p.cast ? `<ellipse cx="${f(p.x)}" cy="${f(p.y + 140 * p.s)}" rx="${f(30 * p.s)}" ry="${f(26 * p.s)}" fill="${HOT2}" opacity=".9"/>` : '');
}
function crucible(x, y, s, tilt) {
  const [id, defs] = heatDefs();
  return `<g transform="translate(${f(x)},${f(y)}) rotate(${f(tilt)}) scale(${s})">${defs}<path d="M-120,-80 L120,-80 L90,90 Q0,120 -90,90Z" fill="#7a7f8e" stroke="${OL}" stroke-width="9"/><ellipse cx="0" cy="-80" rx="120" ry="30" fill="url(#hm${id})" stroke="${OL}" stroke-width="7"/><path d="M-100,-40 L-80,70" stroke="#fff" stroke-width="10" opacity=".25"/></g>`;
}

VIEWS.hook = {
  draw(lv, vd, t) {
    const [id, defs] = heatDefs();
    let s = defs + BG('#1d1210') + `<circle cx="640" cy="760" r="520" fill="url(#hg${id})" opacity=".5"/>`;
    s += `<rect x="-700" y="1080" width="2480" height="1400" fill="#3a2418" stroke="${OL}" stroke-width="8"/>`;
    const pour = clamp((lv - .2) / .3), lvl = clamp((lv - .3) / 2);
    s += crucible(800, 470, 1, lerp(10, 58, eOut(lv / .5)));
    if (pour > 0) s += `<path d="M700,560 Q650,700 ${f(640 + Math.sin(t * 20) * 4)},${f(lerp(560, 960, pour))}" fill="none" stroke="url(#hm${id})" stroke-width="26" stroke-linecap="round"/>`;
    s += `<g transform="translate(640,1080)"><path d="M-90,-200 L90,-200 L70,0 L-70,0Z" fill="#cfefff" fill-opacity=".35" stroke="${OL}" stroke-width="8"/><path d="M${f(-70 - 20 * lvl)},${f(-200 * lvl)} L${f(70 + 20 * lvl)},${f(-200 * lvl)} L70,0 L-70,0Z" fill="url(#hm${id})" opacity=".95"/></g>`;
    s += sparks(640, 900, t, 120, 6, HOT2);
    s += guy({ x: 270, y: 740, s: .9, legs: false, look: [16, 8], brow: 'raised', mouth: 'open', mouthOpen: .5, t, shirt: '#3b5aa8' });
    s += at(270, 400, pop(lv, .6), `<circle r="80" fill="#fff" stroke="${OL}" stroke-width="8"/>${txt(0, 4, '?', 100, OL)}`, 10 * Math.sin(t * 3));
    return s;
  }
};
VIEWS.lead = {
  draw(lv, vd, t) {
    const [id, defs] = heatDefs();
    let s = defs + sunburst('#4a5a7a', '#2a3350', t * .1);
    const q = eInOut(lv / (vd * .8)), temp = Math.round(20 + 307 * q);
    s += `<g transform="translate(260,760)"><rect x="-50" y="-380" width="100" height="660" rx="50" fill="#fff" stroke="${OL}" stroke-width="9"/><circle cx="0" cy="300" r="90" fill="#ff3b3b" stroke="${OL}" stroke-width="9"/><rect x="-26" y="${f(260 - 600 * q)}" width="52" height="${f(600 * q + 40)}" rx="20" fill="#ff3b3b"/>`;
    for (let k = 0; k < 8; k++) s += `<path d="M50,${-330 + k * 75} l30,0" stroke="${OL}" stroke-width="6"/>`;
    s += `</g>` + at(260, 300, 1, pill(temp + ' °C', '#111427', q > .95 ? '#ff6b6b' : '#fff', 54, 92));
    const melt = clamp((q - .5) / .5);
    s += `<g transform="translate(730,980)"><ellipse cx="0" cy="40" rx="${f(150 + 130 * melt)}" ry="${f(26 + 18 * melt)}" fill="url(#hm${id})" opacity="${f(melt)}"/>`;
    s += `<path d="M-130,40 L-100,${f(-160 + 170 * melt)} L100,${f(-160 + 170 * melt)} L130,40Z" fill="${mix('#8a93a6', HOT, melt * .6)}" stroke="${OL}" stroke-width="8"/>`;
    s += txt(0, -60 + 85 * melt, 'Pb', 90 * (1 - melt * .7), '#fff', { stroke: OL, sw: 10, op: f(1 - melt) }) + `</g>`;
    s += at(760, 500, pop(lv, .2), `<rect x="-110" y="-110" width="220" height="220" rx="20" fill="#e8ecf5" stroke="${OL}" stroke-width="8"/>${txt(-60, -70, '82', 34, OL, { anchor: 'start', w: 700 })}${txt(0, 0, 'Pb', 96, OL)}${txt(0, 70, 'СВИНЕЦ', 30, OL, { w: 700 })}`);
    return s;
  }
};
VIEWS.mouth = {
  shakes: () => [[.2, 14, .4]],
  draw(lv, vd, t) {
    const [id, defs] = heatDefs();
    let s = defs + BG('#2a0c06') + `<circle cx="540" cy="900" r="700" fill="url(#hg${id})" opacity=".6"/>`;
    s += guy({ x: 540, y: 760, s: 2.0, legs: false, mouth: 'scream', mouthOpen: 1, eyes: 'squeeze', brow: 'worried', sweat: 3, red: 1, t, shirt: '#3b5aa8' });
    s += `<ellipse cx="540" cy="${f(760 + 176 * 2)}" rx="62" ry="80" fill="url(#hm${id})" opacity=".95"/>`;
    for (let i = 0; i < 8; i++) { const q = ((lv * 1.4 + i / 8) % 1); s += `<circle cx="${f(540 + Math.sin(i * 2.4) * 260 * q)}" cy="${f(1110 - 620 * q)}" r="${f(40 + 110 * q)}" fill="#fff" opacity="${f(.75 * (1 - q) * clamp(lv / .2))}"/>`; }
    return s;
  }
};
VIEWS.steam = {
  draw(lv, vd, t) {
    let s = sunburst('#2f9bff', '#1660d9', t * .1);
    s += at(230, 760, pop(lv, .05), `<path d="M0,-90 C40,-30 60,10 60,40 A60,60 0 0 1 -60,40 C-60,10 -40,-30 0,-90Z" fill="#7fd3ff" stroke="${OL}" stroke-width="8"/>` + txt(0, 160, '1 КАПЛЯ', 34, '#fff', { stroke: OL, sw: 8 }));
    s += at(400, 760, pop(lv, .3), `<path d="M-50,0 L40,0 M10,-30 L44,0 L10,30" fill="none" stroke="#fff" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>`);
    const k = eOut((lv - .4) / 1.2);
    if (k > 0) s += at(740, 740, .3 + .9 * k, `<path d="${blob(4, 210, 12, .22)}" fill="#fff" stroke="${OL}" stroke-width="8"/>` + txt(0, 0, '×1700', 96, '#1660d9'));
    return s;
  }
};
VIEWS.leiden = {
  shakes: ctx => [[(ctx.segRel[1] ?? 9) + .1, 16, .5]],
  draw(lv, vd, t, ctx) {
    const [id, defs] = heatDefs();
    let s = defs + BG('#2a2d3a');
    for (let i = 0; i < 6; i++) s += `<path d="M${300 + i * 90},1180 Q${f(320 + i * 90 + Math.sin(t * 9 + i) * 20)},1080 ${300 + i * 90},${f(1010 + Math.sin(t * 7 + i) * 20)}" fill="none" stroke="${i % 2 ? '#ff8a1a' : '#2f9bff'}" stroke-width="20" stroke-linecap="round" opacity=".8"/>`;
    s += `<path d="M180,940 L900,940 L860,1010 L220,1010Z" fill="#3a3f4f" stroke="${OL}" stroke-width="9"/><rect x="900" y="950" width="200" height="34" rx="16" fill="#1d1f28" stroke="${OL}" stroke-width="7"/>`;
    s += `<rect x="200" y="910" width="680" height="30" fill="#ff4a1a" opacity="${f(.4 + .2 * Math.sin(t * 6))}"/>`;
    const s1 = ctx.segRel[1] ?? 9, flood = clamp((lv - s1 - .1) / .7);
    const dx = Math.sin(t * 7) * 60, hop = Math.abs(Math.sin(t * 11)) * 16;
    if (flood < 1) s += `<g transform="translate(${f(540 + dx)},${f(860 - hop)})"><ellipse cx="0" cy="0" rx="70" ry="50" fill="#7fd3ff" stroke="${OL}" stroke-width="8" opacity="${f(1 - flood)}"/><ellipse cx="-20" cy="-16" rx="18" ry="10" fill="#fff" opacity=".8"/></g><path d="M${f(470 + dx)},${f(905 - hop / 2)} L${f(610 + dx)},${f(905 - hop / 2)}" stroke="#fff" stroke-width="8" stroke-dasharray="10 8" opacity="${f(.7 * (1 - flood))}"/>`;
    if (lv < s1) s += at(540, 620, pop(lv, .3), pill('ПОДУШКА ИЗ ПАРА', '#111427', '#bfe9ff', 36, 66));
    if (flood > 0) { let w = `M-200,1300 L-200,${f(lerp(1300, 720, flood))}`; for (let x = -200; x <= 1300; x += 40) w += ` L${x},${f(lerp(1300, 720, flood) + Math.sin(x / 90 + t * 5) * 30)}`; s += `<path d="${w} L1300,1300Z" fill="url(#hm${id})" stroke="${OL}" stroke-width="8"/>`; }
    return s;
  }
};
VIEWS.throat = {
  draw(lv, vd, t) {
    let s = BG('#0f1020') + `<rect x="-700" y="-700" width="2480" height="3300" fill="url(#vigDark)"/>`;
    s += body({ x: 540, y: 520, s: 1.05, flow: eInOut(lv / (vd * .9)) * .92, t, face: { mouth: 'scream', eyes: 'squeeze', brow: 'worried', sweat: 3 } });
    return s + `<rect x="-700" y="-700" width="2480" height="3300" fill="#ff3b1a" opacity="${f(.08 + .06 * Math.sin(t * 7))}"/>`;
  }
};
VIEWS.stomach = {
  shakes: ctx => [[(ctx.segRel[1] ?? 9) + .1, 22, .6]],
  draw(lv, vd, t, ctx) {
    const s1 = ctx.segRel[1] ?? 9;
    let s = BG('#0f1020');
    s += body({ x: 540, y: 520, s: 1.05, flow: 1, belly: clamp(lv / .6), steam: lv > s1 ? 1 : .3, t, face: { mouth: 'scream', eyes: 'squeeze', brow: 'worried', sweat: 3, tears: 1 } });
    if (lv > s1) s += comic(780, 1000, 'ПШШ!', eBack((lv - s1) / .25), '#fff', 80);
    return s + `<rect x="-700" y="-700" width="2480" height="3300" fill="#ff0000" opacity="${f(.1 * clamp(lv - s1) * (.6 + .4 * Math.sin(t * 9)))}"/>`;
  }
};
VIEWS.cast = {
  draw(lv, vd, t, ctx) {
    let s = BG('#14161f') + `<circle cx="540" cy="760" r="420" fill="url(#whiteGlow)" opacity=".15"/>`;
    const id = ++uid, ang = Math.sin(t * .8) * 18;
    s += `<linearGradient id="mt${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eef1f6"/><stop offset=".5" stop-color="#8a93a6"/><stop offset="1" stop-color="#4a5266"/></linearGradient>`;
    const ghost = `<circle cx="0" cy="10" r="185" fill="#9fd8ff" fill-opacity=".06" stroke="#9fd8ff" stroke-width="5" stroke-dasharray="14 10" opacity=".6"/><path d="M-75,212 C-45,252 45,252 75,212 L185,236 C238,250 262,288 272,336 L312,470 Q270,500 226,498 L214,770 L-214,770 L-226,498 Q-270,500 -312,470 L-272,336 C-262,288 -238,250 -185,236 Z" fill="#9fd8ff" fill-opacity=".06" stroke="#9fd8ff" stroke-width="5" stroke-dasharray="14 10" opacity=".6"/>`;
    s += `<g transform="translate(490,420) rotate(${f(ang * .3)},60,420) scale(1.15)">${ghost}<path d="${ESO}" fill="none" stroke="${OL}" stroke-width="40" stroke-linecap="round"/><path d="${ESO}" fill="none" stroke="url(#mt${id})" stroke-width="28" stroke-linecap="round"/><path d="${STOM}" fill="url(#mt${id})" stroke="${OL}" stroke-width="7"/><path d="M-6,200 L-2,420" stroke="#fff" stroke-width="6" opacity="${f(.4 + .4 * Math.sin(t * 3))}"/></g>`;
    const s1 = ctx.segRel[1] ?? 9;
    if (lv > s1) s += at(540, 470, pop(lv, s1), pill('ШАНС 0%', '#ff3b3b', '#fff', 60, 100), -4);
    return s + `<rect x="-700" y="-700" width="2480" height="3300" fill="url(#vigDark)"/>`;
  }
};
VIEWS.history = {
  draw(lv, vd, t, ctx) {
    const [id, defs] = heatDefs();
    let s = defs + sunburst('#e0a92a', '#a8740a', t * .1);
    s += at(300, 740, pop(lv, .05), `<path d="M-150,60 Q-160,-150 0,-170 Q160,-150 150,60 L110,60 L100,-40 L-100,-40 L-110,60Z" fill="#c9a24a" stroke="${OL}" stroke-width="9"/><path d="M-20,-170 Q0,-300 20,-170" fill="#d42a2a" stroke="${OL}" stroke-width="7"/><path d="M-120,-260 Q0,-330 120,-260 L100,-230 Q0,-280 -100,-230Z" fill="#d42a2a" stroke="${OL}" stroke-width="7"/><rect x="-100" y="-40" width="200" height="40" fill="#8a6a2a" stroke="${OL}" stroke-width="6"/>`);
    s += at(780, 760, pop(lv, .3), `<path d="M-110,-150 L110,-150 Q100,0 20,30 L20,120 L80,150 L-80,150 L-20,120 L-20,30 Q-100,0 -110,-150Z" fill="#ffd23a" stroke="${OL}" stroke-width="9"/><ellipse cx="0" cy="-150" rx="110" ry="24" fill="url(#hm${id})" stroke="${OL}" stroke-width="6"/>`);
    s += at(540, 450, pop(lv, .5), pill('ЛЕГЕНДА', '#111427', '#ffe14a', 48, 84), -3);
    const s1 = ctx.segRel[1] ?? 9;
    if (lv > s1) s += particles(18, 5, t, { x0: 100, x1: 1000, y0: 300, y1: 1250, speed: 260, size: 14, col: ['#ffd23a', '#ffe680'], op: .9 });
    return s;
  }
};
VIEWS.cta = {
  draw(lv, vd, t, ctx) {
    let s = sunburst('#ff4136', '#b8141b', t * .12);
    const k = pop(lv, .05) * (1 + .05 * Math.sin(t * 8));
    s += at(540, 560, k, `<path d="M0,-230 L240,170 L-240,170Z" fill="#ffd23a" stroke="${OL}" stroke-width="14" stroke-linejoin="round"/>` + txt(0, 40, '!', 260, OL));
    s += guy({ x: 540, y: 1000, s: .7, legs: false, mouth: 'flat', brow: 'angry', headRot: Math.sin(t * 9) * 10 * clamp(1.5 - lv), t, shirt: '#3b5aa8' });
    const s1 = ctx.segRel[1] ?? 9;
    [[180, 900, 0], [900, 880, .15]].forEach(([x, y, d], i) => { s += at(x, y + Math.sin(t * 4 + i) * 12, pop(lv, s1 + d), txt(0, 0, '?', 120, '#fff', { stroke: OL, sw: 16 }), 12 * Math.sin(t * 3 + i)); });
    return s;
  }
};
