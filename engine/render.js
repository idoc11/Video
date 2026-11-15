// Рендер кадров ролика: node engine/render.js <папка ролика>   (ONLY=0,30,60 — только эти кадры в build/stills)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const vdir = path.resolve(process.argv[2]);
  const script = JSON.parse(fs.readFileSync(path.join(vdir, 'script.json'), 'utf8'));
  const tl = JSON.parse(fs.readFileSync(path.join(vdir, 'build/timeline.json'), 'utf8'));
  tl.bannerCfg = script.banner || null;
  const fps = 30, total = Math.ceil(tl.duration * fps);
  const only = process.env.ONLY ? process.env.ONLY.split(',').map(Number) : null;
  const outDir = path.join(vdir, only ? 'build/stills' : 'build/frames');
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  const frames = only || [...Array(total).keys()];
  const workers = Math.min(+(process.env.WORKERS || 4), frames.length);
  const browser = await chromium.launch();
  let done = 0; const t0 = Date.now();
  await Promise.all([...Array(workers).keys()].map(async w => {
    const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
    page.on('pageerror', e => { console.error('ошибка на странице:', e.message); process.exitCode = 1; });
    await page.goto('file://' + path.join(__dirname, 'scene.html'));
    await page.addScriptTag({ path: path.join(vdir, 'views.js') });
    await page.evaluate(tl => window.init(tl), tl);
    for (let k = w; k < frames.length; k += workers) {
      const i = frames[k];
      await page.evaluate(t => window.renderFrame(t), i / fps);
      await page.screenshot({ path: path.join(outDir, `${String(i).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 94 });
      if (++done % 150 === 0) console.log(`  ${done}/${frames.length} кадров`);
    }
  }));
  await browser.close();
  console.log(`  ${frames.length} кадров за ${((Date.now() - t0) / 1000).toFixed(1)} c`);
})();
