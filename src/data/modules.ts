// Single source of truth for the parts bin, the datasheet pages and every status label.
// Snippets come from src/data/snippets/<module>.json, written by `pnpm sync:snippets`
// (the real examples/basic.ts of each repo, pinned to the commit it was read at).
// Facts in `spec` and `deferred` are taken from each module's README at that commit.
import auth from './snippets/auth.json';
import billing from './snippets/billing.json';
import fileStorage from './snippets/file-storage.json';
import jobs from './snippets/jobs.json';
import notifications from './snippets/notifications.json';
import rateLimit from './snippets/rate-limit.json';
import rbac from './snippets/rbac.json';
import webhooks from './snippets/webhooks.json';

export type Status = 'built' | 'in-progress';

export interface Snapshot {
  module: string;
  package: string;
  repo: string;
  path: string;
  ref: string;
  imports: Record<string, string>;
  code: string;
}

export interface Module {
  slug: string;
  part: string;
  name: string;
  pkg: string;
  /** Final repo name under ShipStack-AI. Pending renames redirect on GitHub. */
  repo: string;
  purpose: string;
  referenceAdapter: string;
  adapters: string[];
  status: Status;
  /** True once `npm publish` has happened. Nothing is published yet. */
  published: boolean;
  spec: [string, string][];
  deferred: string[];
  snapshot: Snapshot;
  /** 1-based inclusive line range of basic.ts shown on the card. */
  excerpt: [number, number];
  /** Optional note shown under the code, e.g. for demo-only helpers. */
  note?: string;
}

export const modules: Module[] = [
  {
    slug: 'auth',
    part: 'SS-01',
    name: 'auth',
    pkg: '@shipstack-ai/auth',
    repo: 'auth',
    purpose: 'Email and password, opaque database sessions, verification and reset. Deliberately small: not a Clerk or Better Auth replacement.',
    referenceAdapter: 'Postgres store',
    adapters: ['memory', 'postgres', 'argon2 hasher'],
    status: 'built',
    published: false,
    spec: [
      ['Passwords', 'argon2id, m=19456 t=2 p=1'],
      ['Sessions', '7d idle, 30d absolute'],
      ['Cookie', '__Host- prefixed, SameSite=Lax'],
      ['Tokens', 'single use, 1h default'],
    ],
    deferred: ['OAuth / social login (v0.2)', 'magic links', 'passkeys', 'MFA / TOTP', 'organizations', 'JWTs'],
    snapshot: auth,
    excerpt: [1, 13],
    note: 'Ships as 0.1.0-beta: internally security-reviewed, not independently audited.',
  },
  {
    slug: 'rbac',
    part: 'SS-02',
    name: 'rbac',
    pkg: '@shipstack-ai/rbac',
    repo: 'rbac',
    purpose: 'Roles and permissions in code, assignments in your database. Inheritance, wildcards, tenants.',
    referenceAdapter: 'Postgres store',
    adapters: ['memory', 'postgres'],
    status: 'built',
    published: false,
    spec: [
      ['Model', 'roles -> permissions, in code'],
      ['Matching', 'resource:* wildcards, inheritance'],
      ['Default', 'deny; no deny rules'],
      ['Scope', 'tenant-scoped assignments'],
    ],
    deferred: ['ABAC / conditions', 'ownership rules', 'deny rules', 'policy files', 'ReBAC'],
    snapshot: rbac,
    excerpt: [1, 12],
  },
  {
    slug: 'rate-limit',
    part: 'SS-03',
    name: 'rate-limit',
    pkg: '@shipstack-ai/rate-limit',
    repo: 'rate-limit',
    purpose: 'Sliding-window and token-bucket limits with standard RateLimit headers. Fails closed.',
    referenceAdapter: 'Redis store (atomic Lua)',
    adapters: ['memory', 'redis'],
    status: 'built',
    published: false,
    spec: [
      ['Algorithms', 'slidingWindow, tokenBucket'],
      ['Headers', 'RateLimit-*, Retry-After'],
      ['Store down', 'throws (fails closed)'],
      ['Peer (optional)', 'ioredis ^5 || ^6'],
    ],
    deferred: ['fixed window', 'Postgres store', 'Upstash REST', 'multi-region', 'fail-open option'],
    snapshot: rateLimit,
    excerpt: [1, 9],
  },
  {
    slug: 'notifications',
    part: 'SS-04',
    name: 'notifications',
    pkg: '@shipstack-ai/notifications',
    repo: 'notifications',
    purpose: 'Transactional email from plain TypeScript templates. Escaped, idempotent, inline or queued.',
    referenceAdapter: 'SMTP (nodemailer)',
    adapters: ['memory', 'console', 'smtp'],
    status: 'built',
    published: false,
    spec: [
      ['Templates', 'functions -> { subject, html, text }'],
      ['Escaping', 'html`` tag escapes ${} values'],
      ['Headers', 'injection refused'],
      ['Queue', 'optional QueueLike'],
    ],
    deferred: ['SMS', 'push', 'in-app inbox', 'preferences', 'digests', 'React Email'],
    snapshot: notifications,
    excerpt: [1, 15],
  },
  {
    slug: 'jobs',
    part: 'SS-05',
    name: 'jobs',
    pkg: '@shipstack-ai/jobs',
    repo: 'jobs',
    purpose: 'Background jobs with retries, idempotency keys, delays and cron, on the Postgres you already run.',
    referenceAdapter: 'Postgres (pg-boss)',
    adapters: ['memory', 'postgres'],
    status: 'built',
    published: false,
    spec: [
      ['Retries', 'exponential backoff + jitter'],
      ['Scheduling', 'five-field cron, UTC'],
      ['Shutdown', 'graceful stop()'],
      ['Contract', 'satisfies QueueLike'],
    ],
    deferred: ['BullMQ / Redis', 'dashboards', 'workflows', 'fan-out', 'priorities'],
    snapshot: jobs,
    excerpt: [1, 9],
  },
  {
    slug: 'file-storage',
    part: 'SS-06',
    name: 'file-storage',
    pkg: '@shipstack-ai/file-storage',
    repo: 'file-storage',
    purpose: 'Put, get, list and signed URLs over S3, R2, B2 or MinIO, with strict key validation.',
    referenceAdapter: 'S3-compatible',
    adapters: ['memory', 's3'],
    status: 'built',
    published: false,
    spec: [
      ['Targets', 'AWS S3, Cloudflare R2, Backblaze B2, MinIO'],
      ['Signed URLs', 'upload + download'],
      ['put()', 'buffered, 50 MiB default cap'],
      ['Peer (optional)', '@aws-sdk/client-s3'],
    ],
    deferred: ['Google Cloud Storage', 'Azure Blob', 'local filesystem', 'multipart uploads', 'image transforms'],
    snapshot: fileStorage,
    excerpt: [1, 10],
  },
  {
    slug: 'webhooks',
    part: 'SS-07',
    name: 'webhooks',
    pkg: '@shipstack-ai/webhooks',
    repo: 'webhooks',
    purpose: 'Outbound webhooks on the Standard Webhooks spec, with retries, verify() and an SSRF guard.',
    referenceAdapter: 'Postgres store',
    adapters: ['memory', 'postgres'],
    status: 'built',
    published: false,
    spec: [
      ['Signing', 'Standard Webhooks, HMAC-SHA256'],
      ['Retries', '5 attempts, 5s -> 5h'],
      ['SSRF guard', 'pins the checked IP'],
      ['Timeout', '10s per attempt'],
    ],
    deferred: ['customer portal UI', 'dual-secret signing', 'auto-disable', 'replay UI', 'Svix adapter'],
    snapshot: webhooks,
    excerpt: [5, 15],
    note: 'startReceiver() is a local demo helper from examples/receiver.ts.',
  },
  {
    slug: 'billing',
    part: 'SS-08',
    name: 'billing',
    pkg: '@shipstack-ai/billing',
    repo: 'billing',
    purpose: 'Stripe subscriptions: plans in code, verified idempotent webhooks, entitlements from your database.',
    referenceAdapter: 'Stripe',
    adapters: ['fake', 'stripe', 'memory', 'postgres'],
    status: 'built',
    published: false,
    spec: [
      ['Plans', 'defined in code'],
      ['Webhooks', 'verified, idempotent by event id'],
      ['Ordering', 'out-of-order safe'],
      ['Peer (optional)', 'stripe ^22 || ^23'],
    ],
    deferred: ['metered billing', 'Paddle / Lemon Squeezy / Polar', 'tax', 'coupons', 'invoices UI'],
    snapshot: billing,
    excerpt: [5, 18],
  },
];

export const STATUS_LABEL: Record<Status, string> = {
  built: 'v0.1 built',
  'in-progress': 'v0.1 in progress',
};

export const builtCount = modules.filter((m) => m.status === 'built').length;

export const GITHUB_ORG = 'https://github.com/ShipStack-AI';
export const repoUrl = (m: Module) => `${GITHUB_ORG}/${m.repo}`;
export const commitUrl = (m: Module) => `${GITHUB_ORG}/${m.repo}/blob/${m.snapshot.ref}/${m.snapshot.path}`;
export const npmUrl = (m: Module) => `https://www.npmjs.com/package/${m.pkg}`;
export const shortRef = (m: Module) => m.snapshot.ref.slice(0, 7);

/** The example with relative imports (`../src/stores/memory.js`) rewritten to published specifiers. */
export function code(m: Module): string {
  return m.snapshot.code
    .replace(/(['"])(\.\.\/src\/[\w/.-]+\.js)\1/g, (whole, q: string, path: string) => {
      const spec = m.snapshot.imports[path];
      return spec ? `${q}${spec}${q}` : whole;
    })
    .trimEnd();
}

export function excerpt(m: Module): string {
  const [from, to] = m.excerpt;
  return code(m).split('\n').slice(from - 1, to).join('\n');
}
