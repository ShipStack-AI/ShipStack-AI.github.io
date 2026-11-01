// Refreshes the vendored examples/basic.ts snapshots at the refs pinned in
// src/data/snippet-sources.json. The site build itself never fetches anything.
//
//   pnpm sync:snippets                      # from GitHub raw (set GITHUB_TOKEN while repos are private)
//   pnpm sync:snippets -- --local ../       # from sibling clones via `git show <ref>:<path>`
import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const root = new URL('../src/data/', import.meta.url);
const { sources } = JSON.parse(await readFile(new URL('snippet-sources.json', root), 'utf8'));
const localIdx = process.argv.indexOf('--local');
const localRoot = localIdx > -1 ? resolve(process.argv[localIdx + 1] ?? '..') : null;

for (const s of sources) {
  let text;
  if (localRoot) {
    const dir = join(localRoot, s.repo.split('/')[1]);
    text = execFileSync('git', ['-C', dir, 'show', `${s.ref}:${s.path}`], { encoding: 'utf8' });
  } else {
    const url = `https://raw.githubusercontent.com/${s.repo}/${s.ref}/${s.path}`;
    const headers = process.env.GITHUB_TOKEN ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {};
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
    text = await res.text();
  }
  await writeFile(new URL(`snippets/${s.module}.basic.ts.txt`, root), text);
  console.log(`synced ${s.module} from ${s.repo}@${s.ref.slice(0, 7)}`);
}
