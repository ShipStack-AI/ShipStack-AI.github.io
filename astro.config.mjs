// @ts-check
import mdx from '@astrojs/mdx';
import { defineConfig } from 'astro/config';
import { inkDark, inkLight } from './src/data/shiki-themes.mjs';

// GitHub Pages project site by default. When the custom domain from the
// phase-0 human tasks (H4) is live, set SITE_URL and BASE_PATH=/ in the deploy workflow.
const site = process.env.SITE_URL ?? 'https://shipstack-ai.github.io';
const base = process.env.BASE_PATH ?? '/website';

export default defineConfig({
  site,
  base,
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [mdx()],
  markdown: {
    shikiConfig: {
      themes: { light: inkLight, dark: inkDark },
      defaultColor: false,
    },
  },
  build: { inlineStylesheets: 'auto' },
});
