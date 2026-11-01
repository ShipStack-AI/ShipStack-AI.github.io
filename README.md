# ShipStack AI website

The marketing site for [ShipStack AI](https://github.com/ShipStack-AI): backend building blocks for TypeScript that you install, read and own. **Parts, not platforms.**

It is a single long landing page plus one datasheet page per module (`/modules/<name>/`), styled as an industrial parts catalog.

## Stack

- [Astro 5](https://astro.build) static output, MDX for long-form content, Shiki for highlighting (two custom themes in `src/data/shiki-themes.mjs`).
- Hand-written CSS with custom properties. No Tailwind, no UI framework.
- Fonts (Space Grotesk, JetBrains Mono) are self-hosted from `@fontsource-variable`, latin subset only. The site makes no third-party requests and sets no cookies.
- About 2 KB of inline JS: theme toggle, tab switcher, copy buttons and the wiring diagram draw-in. Everything works without JS.

## Develop

Requires Node 22+ and pnpm 10.

```sh
pnpm install
pnpm dev            # http://localhost:4321/website/
pnpm check          # astro check (TypeScript + .astro diagnostics)
pnpm build          # static site in dist/
pnpm screenshots    # after build: full-page PNGs, 1440 and 390 wide, light and dark (needs Playwright)
```

## Content and honesty

Everything the site says about modules comes from one file: **`src/data/modules.ts`**. Each module has a `status` (`built` or `in-progress`) and a `published` flag (npm). Nothing is on npm yet, so no card links to npm.

Code snippets:

- **Built modules** show their real `examples/basic.ts`. The file is vendored in `src/data/snippets/<module>.basic.ts.txt` at the commit pinned in `src/data/snippet-sources.json`, and relative imports (`../src/index.js`) are rewritten to package paths at build time. The build never fetches anything.
- **Modules not yet pushed** show a placeholder from `modules.ts`, labelled as a placeholder in the code itself and on the page. It sketches the planned v0.1 API from the design contract.

To ship a module on the site:

1. Add it to `src/data/snippet-sources.json` with the commit to pin.
2. Run `pnpm sync:snippets` (from GitHub raw; set `GITHUB_TOKEN` while the repos are private) or `pnpm sync:snippets -- --local ..` (from sibling clones).
3. In `modules.ts`, set `status: 'built'` and change `snippet` to `{ kind: 'source', ... }`. Set `published: true` once it is on npm.

Counts in the hero, the section titles, the comparison table and the footer all come from that data, so they update on their own.

The quickstart middleware (`src/content/quickstart.mdx`) was checked against the real `@shipstack-ai/rate-limit` build with Hono's `app.request()`: requests 1 to 10 returned 200 and requests 11 and 12 returned 429 with `Retry-After`.

Rules for copy: no invented users, testimonials, benchmarks, logos or prices. The comparison table compares categories and says where we lose.

## Design system

| Token      | Paper (light) | Blueprint (dark) | Use                                        |
| ---------- | ------------- | ---------------- | ------------------------------------------ |
| `--paper`  | `#F4F1EA`     | `#0B1E38`        | background                                 |
| `--ink`    | `#141414`     | `#E8F0F8`        | text, rules                                |
| `--signal` | `#FF5B1F`     | `#FF6A33`        | fills and strokes only, never small text   |
| `--signal-ink` | `#A8380C` | `#FF9466`        | orange text (meets 4.5:1 on paper)         |
| `--blue`   | `#2B4C7E`     | `#6FD3FF`        | hairlines (30%), dimension lines, the grid |

Spacing is an 8px scale (`--s1` = 8px to `--s16` = 128px) and the page background is a visible 8px/64px grid. Motion is limited to cards lifting 4px on hover and the wiring diagram drawing in once on scroll; both are off under `prefers-reduced-motion`. The theme follows the OS and can be toggled; the choice is kept in `localStorage`.

## Deploy

`.github/workflows/deploy.yml` builds and deploys to GitHub Pages on every push to `main`. In the repo settings, set Pages source to **GitHub Actions**. The default URL is `https://shipstack-ai.github.io/website/`. For a custom domain, set `SITE_URL` and `BASE_PATH=/` in the workflow and add the domain in the Pages settings.

`.github/workflows/ci.yml` runs `astro check` and the build on every PR, and Lighthouse CI (`lighthouserc.json`) with a 95 minimum on performance, accessibility, best practices and SEO.

## Layout

```
src/
  components/   Hero, PartsBin, OneShape, Wiring, Quickstart, Compare, Principles, Header, Footer, CodeBlock
  content/      quickstart.mdx
  data/         modules.ts (single source of truth), snippet-sources.json, snippets/, shiki-themes.mjs
  layouts/      Base.astro
  pages/        index.astro, modules/[slug].astro
  styles/       global.css (tokens, primitives)
scripts/        sync-snippets.mjs, screenshots.mjs
```

## License

[MIT](LICENSE)
