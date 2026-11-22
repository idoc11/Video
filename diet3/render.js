// Рендер кадров: node render.js   (ONLY=0,100 — только эти кадры в build/stills)
const { chromium } = require('playwright'); const http = require('http'); const fs = require('fs'); const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); r.end(); return; }
  const ext = path.extname(p); r.writeHead(200, { 'Content-Type': { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.woff2': 'font/woff2' }[ext] || 'application/octet-stream' }); fs.createReadStream(p).pipe(r); });
(async () => {
  await new Promise(r => srv.listen(0, r)); const port = srv.address().port;
  const meta = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/meta.json'), 'utf8'));
  const only = process.env.ONLY ? process.env.ONLY.split(',').map(Number) : null;
  const outDir = path.join(__dirname, only ? 'build/stills' : 'build/frames'); fs.rmSync(outDir, { recursive: true, force: true }); fs.mkdirSync(outDir, { recursive: true });
  const frames = only || [...Array(Math.ceil(meta.duration*30)).keys()]; const workers = Math.min(+(process.env.WORKERS || 4), frames.length);
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  let done = 0; const t0 = Date.now();
  await Promise.all([...Array(workers).keys()].map(async w => {
    const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
    page.on('pageerror', e => { console.error('ошибка страницы:', e.message); process.exitCode = 1; });
    await page.goto(`http://localhost:${port}/diet3/scene.html`); await page.evaluate(() => window.init());
    for (let k = w; k < frames.length; k += workers) {
      const i = frames[k]; await page.evaluate(i => window.renderFrame(i), i);
      await page.screenshot({ path: path.join(outDir, `${String(i).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 95 });
      if (++done % 100 === 0) console.log(`  ${done}/${frames.length} кадров, ${((Date.now() - t0) / 1000).toFixed(0)} c`);
    }
  }));
  await browser.close(); srv.close(); console.log(`  ${frames.length} кадров за ${((Date.now() - t0) / 1000).toFixed(1)} c`);
})();
