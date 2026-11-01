# ShipStack AI website

The marketing site for [ShipStack AI](https://github.com/ShipStack-AI): backend building blocks for TypeScript that you install, read and own. **Parts, not platforms.**

It is a single long landing page plus one datasheet page per module (`/modules/<name>/`), styled as an industrial parts catalog.

## Stack

- [Astro 5](https://astro.build) static output, MDX for long-form content, Shiki for highlighting (two custom themes in `src/data/shiki-themes.mjs`).
- Hand-written CSS with custom properties. No Tailwind, no UI framework.
- Fonts (Space Grotesk, JetBrains Mono) are self-hosted from `@fontsource-variable`, latin subset only. The site makes no third-party requests and sets no cookies.
- About 2.5 KB of inline JS: theme toggle, tab switcher, copy buttons, closing the mobile menu and the wiring diagram draw-in. Everything works without JS (the mobile menu is a native `<details>`).

## Develop

Requires Node 22+ and pnpm 10.

```sh
pnpm install
pnpm dev            # http://localhost:4321/website/
pnpm check          # astro check (TypeScript + .astro diagnostics)
pnpm build          # static site in dist/
pnpm screenshots    # after build: full-page PNGs, 1440 and 390 wide, light and dark (needs Playwright)
pnpm sync:snippets  # re-pull every module's examples/basic.ts and re-pin it (see below)
pnpm gen:images     # re-render the OG image and icons (needs Playwright)
```

## Content and honesty

Everything the site says about modules comes from **`src/data/modules.ts`**: status (`built` / `in-progress`), the `published` flag for npm, spec rows and the deferred list (taken from each module's README), and the card excerpt range. All eight parts are at v0.1 and none is on npm yet, so no page links to npm and the hero says "Not on npm yet". Hero counts, section titles, the comparison table and the footer are derived from the same data.

### Snippets

Every card and datasheet shows the module's real `examples/basic.ts`, pinned to a commit:

- `src/data/snippet-sources.json` lists where each example comes from.
- `src/data/snippets/<module>.json` holds the code, the commit SHA it was read at, and an import map built from that commit's `package.json` `exports`, so `'../src/stores/memory.js'` renders as `'@shipstack-ai/auth/memory'`.
- The build never fetches anything.

Refresh them (and re-pin) with:

```sh
pnpm sync:snippets                          # shallow-clones each repo's default branch with your git credentials
pnpm sync:snippets -- --local /path/to/dir  # reads committed HEAD of sibling clones instead
pnpm sync:snippets -- --only auth,webhooks  # just some modules
```

Then review the diff: if an example changed length, adjust its `excerpt` range in `modules.ts`.

### Verified code

The quickstart (`src/content/quickstart.mdx`) was run as written against the auth and rate-limit commits named on the page, with Hono's `app.request()`: anonymous `/api/me` returns 401, sign-up 202, and `/api/me` with the session cookie 200. The "One shape" constructors were type-checked and run against the jobs, file-storage and rbac commits. Rules for copy: no invented users, testimonials, benchmarks, logos or prices; the comparison table compares categories and says where we lose.

### Images

`public/og.png` (1200x630), `apple-touch-icon.png`, `icon-192.png`, `icon-512.png` and `favicon-32.png` are rendered from HTML by `pnpm gen:images` (Playwright) and committed. `favicon.svg` follows the OS color scheme.

## Design system

| Token      | Paper (light) | Blueprint (dark) | Use                                        |
| ---------- | ------------- | ---------------- | ------------------------------------------ |
| `--paper`  | `#F4F1EA`     | `#0B1E38`        | background                                 |
| `--ink`    | `#141414`     | `#E8F0F8`        | text, rules                                |
| `--signal` | `#FF5B1F`     | `#FF6A33`        | fills and strokes only, never small text   |
| `--signal-ink` | `#A8380C` | `#FF9466`        | orange text (meets 4.5:1 on paper)         |
| `--blue`   | `#2B4C7E`     | `#6FD3FF`        | hairlines (30%), dimension lines, the grid |

On screens up to 860px the wiring diagram becomes one straight run per connection, readable without scrolling, and code wraps below 560px. Wider code blocks scroll with a soft edge showing hidden content.

Spacing is an 8px scale (`--s1` = 8px to `--s16` = 128px) and the page background is a visible 8px/64px grid. Motion is limited to cards lifting 4px on hover and the wiring diagram drawing in once on scroll; both are off under `prefers-reduced-motion`. The theme follows the OS and can be toggled; the choice is kept in `localStorage`.

## Deploy and base path

`.github/workflows/deploy.yml` builds and deploys to GitHub Pages on every push to `main`. In the repo settings, set Pages source to **GitHub Actions**.

The serving location is one setting:

| Repository variable | Unset (default)                              | Custom domain                     |
| ------------------- | -------------------------------------------- | --------------------------------- |
| `SITE_URL`          | `https://shipstack-ai.github.io` at `/website/` | `https://<domain>`, served at `/` |
| `BASE_PATH`         | derived                                      | optional override                 |

Set `SITE_URL` under Settings > Secrets and variables > Actions > Variables and add the domain in the Pages settings. Locally: `SITE_URL=https://example.dev pnpm build`. There is a styled `404.html` for Pages.

`.github/workflows/ci.yml` runs `astro check` and the build on every PR, and Lighthouse CI (`lighthouserc.json`) with a 95 minimum on performance, accessibility, best practices and SEO.

## Layout

```
src/
  components/   Hero, PartsBin, OneShape, Wiring, Quickstart, Compare, Principles, Header, Footer, CodeBlock, SectionHead
  content/      quickstart.mdx
  data/         modules.ts (single source of truth), snippet-sources.json, snippets/, shiki-themes.mjs
  layouts/      Base.astro
  pages/        index.astro, modules/[slug].astro, 404.astro
  styles/       global.css (tokens, primitives)
scripts/        sync-snippets.mjs, screenshots.mjs, gen-images.mjs
```

## License

[MIT](LICENSE)
