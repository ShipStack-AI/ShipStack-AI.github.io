// @ts-check
import mdx from '@astrojs/mdx';
import { defineConfig } from 'astro/config';
import { inkDark, inkLight } from './src/data/shiki-themes.mjs';

// Where the site is served. Default: the GitHub Pages project site at
// https://shipstack-ai.github.io/website/. For a custom domain set only SITE_URL
// (e.g. https://shipstack.dev): the base path then defaults to "/".
// BASE_PATH overrides the base path in either case.
const site = process.env.SITE_URL || 'https://shipstack-ai.github.io';
const base = process.env.BASE_PATH || (process.env.SITE_URL ? '/' : '/website');

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
