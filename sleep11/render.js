// Рендер кадров: открывает scene.html в Chromium и снимает каждый кадр.
// Использование: node render.js            — все кадры в build/frames
//                ONLY=0,45,90 node render.js — только указанные кадры (для превью)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const root = __dirname;
  const tl = JSON.parse(fs.readFileSync(path.join(root, 'build/timeline.json'), 'utf8'));
  tl.bannerCfg = JSON.parse(fs.readFileSync(path.join(root, 'script.json'), 'utf8')).banner || null;
  const fps = 30, total = Math.ceil(tl.duration * fps);
  const only = process.env.ONLY ? process.env.ONLY.split(',').map(Number) : null;
  const outDir = path.join(root, only ? 'build/stills' : 'build/frames');
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  const frames = only || [...Array(total).keys()];
  const workers = Math.min(+(process.env.WORKERS || 4), frames.length);

  const browser = await chromium.launch();
  let done = 0;
  const t0 = Date.now();
  await Promise.all([...Array(workers).keys()].map(async w => {
    const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
    page.on('pageerror', e => { console.error('page error:', e.message); process.exitCode = 1; });
    await page.goto('file://' + path.join(root, 'scene.html'));
    await page.evaluate(tl => window.init(tl), tl);
    for (let k = w; k < frames.length; k += workers) {
      const i = frames[k];
      await page.evaluate(t => window.renderFrame(t), i / fps);
      await page.screenshot({ path: path.join(outDir, `${String(i).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 94 });
      if (++done % 90 === 0) console.log(`${done}/${frames.length} кадров, ${((Date.now() - t0) / 1000).toFixed(0)} c`);
    }
  }));
  await browser.close();
  console.log(`готово: ${frames.length} кадров за ${((Date.now() - t0) / 1000).toFixed(1)} c → ${outDir}`);
})();
