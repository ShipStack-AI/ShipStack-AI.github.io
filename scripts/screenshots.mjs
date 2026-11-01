// Full-page screenshots of the built site: desktop 1440 and mobile 390, light and dark.
// Usage: pnpm build && pnpm screenshots [path]   -> screenshots/*.png
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';

// Playwright is not a project dependency; use a globally installed copy (resolved via NODE_PATH).
const { chromium } = createRequire(import.meta.url)('playwright');

const path = process.argv[2] ?? '/';
const port = 4329;
const server = spawn('npx', ['astro', 'preview', '--port', String(port)], { stdio: 'ignore' });
const base = (process.env.BASE_PATH || (process.env.SITE_URL ? '/' : '/website')).replace(/\/$/, '');
const url = `http://localhost:${port}${base}${path}`;
for (let i = 0; ; i++) {
  if (await fetch(url).then((r) => r.ok, () => false)) break;
  if (i > 100) throw new Error(`preview server did not answer at ${url}`);
  await new Promise((r) => setTimeout(r, 100));
}
const name = path.replace(/\W+/g, '-').replace(/^-|-$/g, '') || 'home';

await mkdir('screenshots', { recursive: true });
const browser = await chromium.launch();
try {
  for (const [label, width, height] of [['desktop', 1440, 900], ['mobile', 390, 844]]) {
    for (const scheme of ['light', 'dark']) {
      const ctx = await browser.newContext({ viewport: { width, height }, colorScheme: scheme, deviceScaleFactor: 1 });
      const page = await ctx.newPage();
      const external = [];
      page.on('request', (r) => !r.url().startsWith(`http://localhost:${port}`) && external.push(r.url()));
      await page.goto(url, { waitUntil: 'networkidle' });
      // Scroll through so scroll-triggered drawings run, then wait for them to finish.
      for (let y = 0; y < (await page.evaluate(() => document.body.scrollHeight)); y += height / 2) {
        await page.evaluate((top) => window.scrollTo(0, top), y);
        await page.waitForTimeout(60);
      }
      await page.waitForTimeout(2200);
      await page.evaluate(() => window.scrollTo(0, 0));
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      const file = `screenshots/${name}-${label}-${scheme}.png`;
      await page.screenshot({ path: file, fullPage: true });
      console.log(file, `h-overflow=${overflow}px`, `external-requests=${external.length}`, external.slice(0, 3).join(' '));
      await ctx.close();
    }
  }
} finally {
  await browser.close();
  server.kill();
}
