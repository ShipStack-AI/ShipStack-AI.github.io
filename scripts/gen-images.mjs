// Renders the static social card and touch icons into public/ with Playwright.
// Run after changing the brand or the catalog: `pnpm gen:images` (outputs are committed).
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const { chromium } = createRequire(import.meta.url)('playwright'); // global install, via NODE_PATH
const root = fileURLToPath(new URL('..', import.meta.url));
const font = (p) => pathToFileURL(join(root, 'node_modules', p)).href;
const { sources } = JSON.parse(readFileSync(join(root, 'src/data/snippet-sources.json'), 'utf8'));
const parts = sources.map((s, i) => [`SS-0${i + 1}`, s.module]);

const css = `
@font-face { font-family: G; src: url(${font('@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2')}); font-weight: 300 700; }
@font-face { font-family: M; src: url(${font('@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2')}); font-weight: 100 800; }
* { box-sizing: border-box; margin: 0; }
body { width: var(--w); height: var(--h); background: #F4F1EA; color: #141414; font-family: G; overflow: hidden;
  background-image: linear-gradient(rgb(43 76 126 / .12) 1px, transparent 1px), linear-gradient(90deg, rgb(43 76 126 / .12) 1px, transparent 1px),
  linear-gradient(rgb(43 76 126 / .06) 1px, transparent 1px), linear-gradient(90deg, rgb(43 76 126 / .06) 1px, transparent 1px);
  background-size: 64px 64px, 64px 64px, 8px 8px, 8px 8px; }
.mono { font-family: M; letter-spacing: .08em; text-transform: uppercase; }
`;

const og = `<!doctype html><style>${css}
.f { position: absolute; inset: 40px; border: 1.5px solid #141414; padding: 48px 56px; display: flex; flex-direction: column; background: rgb(244 241 234 / .6); }
.k { font-size: 18px; color: #3f3c36; display: flex; justify-content: space-between; }
h1 { margin-top: 36px; font-size: 132px; line-height: .86; letter-spacing: -.055em; font-weight: 700; }
h1 b { color: #FF5B1F; }
p { margin-top: 28px; font-size: 30px; color: #3f3c36; letter-spacing: -.01em; }
.bin { margin-top: auto; display: grid; grid-template-columns: repeat(8, minmax(0, 1fr)); gap: 8px; }
.c { border: 1.5px solid #141414; padding: 10px 10px 12px; font-size: 12px; letter-spacing: .02em; white-space: nowrap; overflow: hidden; }
.c b { display: block; color: #A8380C; font-size: 14px; margin-bottom: 6px; }
.tab { position: absolute; top: 40px; left: 40px; right: 40px; height: 8px; background: #FF5B1F; }
</style><body style="--w:1200px;--h:630px"><div class="f">
<div class="k mono"><span><b style="color:#141414">ShipStack AI</b> / Catalog of backend parts for TypeScript</span><span>MIT</span></div>
<h1>Parts, not<br>platforms<b>.</b></h1>
<p>Install one. Swap any adapter. Own your tables.</p>
<div class="bin">${parts.map(([n, m]) => `<div class="c mono"><b>${n}</b>${m}</div>`).join('')}</div>
</div><div class="tab"></div></body>`;

const icon = (size) => `<!doctype html><style>${css} body{background:#F4F1EA;background-image:none;display:grid;place-items:center}</style>
<body style="--w:${size}px;--h:${size}px"><svg viewBox="0 0 32 32" width="${size * 0.78}" height="${size * 0.78}">
<rect x="1" y="1" width="30" height="30" fill="none" stroke="#141414" stroke-width="2"/><rect x="7" y="7" width="18" height="5" fill="#141414"/>
<rect x="7" y="14" width="18" height="5" fill="#FF5B1F"/><rect x="7" y="21" width="18" height="4" fill="#141414"/></svg></body>`;

const dir = mkdtempSync(join(tmpdir(), 'og-'));
const browser = await chromium.launch();
try {
  for (const [name, html, w, h] of [
    ['og.png', og, 1200, 630],
    ['apple-touch-icon.png', icon(180), 180, 180],
    ['icon-192.png', icon(192), 192, 192],
    ['icon-512.png', icon(512), 512, 512],
    ['favicon-32.png', icon(32), 32, 32],
  ]) {
    const file = join(dir, `${name}.html`);
    writeFileSync(file, html);
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    await page.goto(pathToFileURL(file).href);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: join(root, 'public', name) });
    await page.close();
    console.log(`public/${name}`);
  }
} finally {
  await browser.close();
  rmSync(dir, { recursive: true, force: true });
}
