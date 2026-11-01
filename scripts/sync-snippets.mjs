// Re-pulls every module's examples/basic.ts and pins it to the commit it was read at.
// The site build never fetches anything; it only reads src/data/snippets/*.json.
//
//   pnpm sync:snippets                       # shallow-clone each repo's default branch (uses your git credentials)
//   pnpm sync:snippets -- --local /home/me   # read committed HEAD of sibling clones (<root>/<localDir>)
//   pnpm sync:snippets -- --only auth,rbac   # limit to some modules
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const dataDir = new URL('../src/data/', import.meta.url);
const { sources } = JSON.parse(await readFile(new URL('snippet-sources.json', dataDir), 'utf8'));
const arg = (name) => {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : undefined;
};
const localRoot = arg('--local') ? resolve(arg('--local')) : null;
const only = arg('--only')?.split(',');
const git = (...a) => execFileSync('git', a, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

/** Maps `../src/<file>.js` (how examples import) to the published specifier, from package.json exports. */
function importMap(pkgJson) {
  const pkg = JSON.parse(pkgJson);
  const map = {};
  for (const [key, target] of Object.entries(pkg.exports ?? {})) {
    const file = typeof target === 'string' ? target : target.default ?? target.import;
    if (typeof file !== 'string' || !file.startsWith('./dist/') || !file.endsWith('.js')) continue;
    map[`../src/${file.slice('./dist/'.length)}`] = key === '.' ? pkg.name : `${pkg.name}/${key.slice(2)}`;
  }
  return { name: pkg.name, map };
}

for (const s of sources) {
  if (only && !only.includes(s.module)) continue;
  let dir;
  let tmp;
  if (localRoot) {
    dir = join(localRoot, s.localDir);
  } else {
    tmp = mkdtempSync(join(tmpdir(), `snip-${s.module}-`));
    git('clone', '--quiet', '--depth', '1', `https://github.com/${s.repo}.git`, tmp);
    dir = tmp;
  }
  try {
    const ref = git('-C', dir, 'rev-parse', 'HEAD').trim();
    const code = git('-C', dir, 'show', `${ref}:${s.path}`);
    const { name, map } = importMap(git('-C', dir, 'show', `${ref}:package.json`));
    const out = { module: s.module, package: name, repo: s.repo, path: s.path, ref, imports: map, code };
    await writeFile(new URL(`snippets/${s.module}.json`, dataDir), `${JSON.stringify(out, null, 2)}\n`);
    console.log(`synced ${s.module.padEnd(14)} ${s.repo}@${ref.slice(0, 7)}`);
  } finally {
    if (tmp) rmSync(tmp, { recursive: true, force: true });
  }
}
