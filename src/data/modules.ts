// Single source of truth for the parts bin, the datasheet pages and every status label.
// To ship a module: set `status: 'built'`, add it to snippet-sources.json, run
// `pnpm sync:snippets`, and set `published: true` once it is on npm.
import rateLimitBasic from './snippets/rate-limit.basic.ts.txt?raw';

export type Status = 'built' | 'in-progress';

export interface Module {
  slug: string;
  part: string;
  name: string;
  pkg: string;
  /** GitHub repo name under ShipStack-AI (current name; renames redirect). */
  repo: string;
  purpose: string;
  referenceAdapter: string;
  adapters: string[];
  status: Status;
  /** True once `npm publish` has happened. Nothing is published yet. */
  published: boolean;
  /** Spec rows shown on the datasheet. Only facts from the v0.1 scope. */
  spec: [string, string][];
  deferred: string[];
  snippet: { kind: 'source'; code: string; excerpt: [number, number]; ref: string } | { kind: 'placeholder'; code: string };
}

/** Rewrites example-relative imports (`../src/stores/memory.js`) to the published subpaths. */
function asPackageImports(code: string, pkg: string): string {
  return code
    .replace(/'\.\.\/src\/index\.js'/g, `'${pkg}'`)
    .replace(/'\.\.\/src\/(?:stores|adapters)\/([\w-]+)\.js'/g, `'${pkg}/$1'`);
}

const PLACEHOLDER =
  '// PLACEHOLDER: planned v0.1 API from the design contract.\n// Replaced by examples/basic.ts when this module ships.\n';

export const modules: Module[] = [
  {
    slug: 'auth',
    part: 'SS-01',
    name: 'auth',
    pkg: '@shipstack-ai/auth',
    repo: 'Auth',
    purpose: 'Email and password sign-in with database sessions. Small, auditable, your tables.',
    referenceAdapter: 'Postgres store',
    adapters: ['memory', 'postgres'],
    status: 'in-progress',
    published: false,
    spec: [
      ['Passwords', 'argon2id (OWASP params)'],
      ['Sessions', 'opaque 256-bit token, SHA-256 stored'],
      ['Cookie', '__Host- prefixed'],
      ['Handler', 'Fetch: (req) => Response'],
    ],
    deferred: ['OAuth / social login', 'magic links', 'passkeys', 'MFA', 'organizations'],
    snippet: {
      kind: 'placeholder',
      code: `${PLACEHOLDER}import { createAuth } from '@shipstack-ai/auth';
import { postgresStore } from '@shipstack-ai/auth/postgres';

const auth = createAuth({ store: postgresStore({ client: pool }), rateLimiter });

export const handler = (req: Request) => auth.handler(req); // mount at /auth/*
const session = await auth.getSession(req); // Session | null`,
    },
  },
  {
    slug: 'rbac',
    part: 'SS-02',
    name: 'rbac',
    pkg: '@shipstack-ai/rbac',
    repo: 'rbac',
    purpose: 'Roles and permissions defined in code, with inheritance, wildcards and tenants.',
    referenceAdapter: 'Postgres store',
    adapters: ['memory', 'postgres'],
    status: 'in-progress',
    published: false,
    spec: [
      ['Model', 'roles -> permissions, in code'],
      ['Wildcards', 'resource:* and *'],
      ['Scope', 'tenant-scoped assignments'],
      ['Errors', 'assert() throws rbac/forbidden (403)'],
    ],
    deferred: ['ABAC / conditions', 'ownership rules', 'policy files', 'ReBAC'],
    snippet: {
      kind: 'placeholder',
      code: `${PLACEHOLDER}import { createRbac, defineRoles } from '@shipstack-ai/rbac';

const roles = defineRoles({ admin: ['*'], member: ['invoice:read', 'invoice:create'] });
const rbac = createRbac({ roles });

await rbac.can(session.user, 'invoice:read', { tenantId }); // boolean
await rbac.assert(session.user, 'invoice:delete'); // throws rbac/forbidden`,
    },
  },
  {
    slug: 'rate-limit',
    part: 'SS-03',
    name: 'rate-limit',
    pkg: '@shipstack-ai/rate-limit',
    repo: 'rate-limit',
    purpose: 'Sliding-window and token-bucket limits with standard RateLimit headers.',
    referenceAdapter: 'Redis store (atomic Lua)',
    adapters: ['memory', 'redis'],
    status: 'built',
    published: false,
    spec: [
      ['Algorithms', 'slidingWindow, tokenBucket'],
      ['Headers', 'RateLimit-*, Retry-After'],
      ['Runtime deps', '0'],
      ['Peer (optional)', 'ioredis ^5 || ^6'],
    ],
    deferred: ['fixed window', 'Postgres store', 'Upstash REST', 'multi-region'],
    snippet: {
      kind: 'source',
      code: asPackageImports(rateLimitBasic, '@shipstack-ai/rate-limit'),
      excerpt: [1, 9],
      ref: '465883b',
    },
  },
  {
    slug: 'notifications',
    part: 'SS-04',
    name: 'notifications',
    pkg: '@shipstack-ai/notifications',
    repo: 'Notification-Service',
    purpose: 'Templated email as plain TypeScript functions, delivered inline or through a queue.',
    referenceAdapter: 'SMTP (nodemailer)',
    adapters: ['console', 'smtp'],
    status: 'in-progress',
    published: false,
    spec: [
      ['Templates', 'TS functions -> { subject, html, text }'],
      ['Channels', 'email'],
      ['Idempotency', 'per-notification key'],
      ['Queue', 'optional QueueLike'],
    ],
    deferred: ['SMS', 'push', 'in-app inbox', 'preferences', 'digests'],
    snippet: {
      kind: 'placeholder',
      code: `${PLACEHOLDER}import { createNotifications } from '@shipstack-ai/notifications';
import { smtpAdapter } from '@shipstack-ai/notifications/smtp';

const notifications = createNotifications({ email: smtpAdapter({ url: SMTP_URL }), templates });

await notifications.notify({ to: user.email, template: 'welcome', data: { name }, channels: ['email'] });`,
    },
  },
  {
    slug: 'jobs',
    part: 'SS-05',
    name: 'jobs',
    pkg: '@shipstack-ai/jobs',
    repo: 'jobs',
    purpose: 'Background jobs with retries, backoff and cron, on the Postgres you already run.',
    referenceAdapter: 'Postgres (pg-boss)',
    adapters: ['memory', 'pg-boss'],
    status: 'in-progress',
    published: false,
    spec: [
      ['Retries', 'exponential backoff + jitter'],
      ['Scheduling', 'cron via schedule()'],
      ['Shutdown', 'graceful stop()'],
      ['Contract', 'satisfies QueueLike'],
    ],
    deferred: ['BullMQ / Redis', 'dashboards', 'workflows', 'fan-out'],
    snippet: {
      kind: 'placeholder',
      code: `${PLACEHOLDER}import { createJobs } from '@shipstack-ai/jobs';
import { pgBossAdapter } from '@shipstack-ai/jobs/pg-boss';

const jobs = createJobs({ adapter: pgBossAdapter({ connectionString: DATABASE_URL }) });

jobs.worker('email.send', async (payload) => { /* ... */ }, { concurrency: 5 });
await jobs.enqueue('email.send', { to }, { delayMs: 60_000, idempotencyKey });`,
    },
  },
  {
    slug: 'file-storage',
    part: 'SS-06',
    name: 'file-storage',
    pkg: '@shipstack-ai/file-storage',
    repo: 'file-storage',
    purpose: 'Put, get, list and signed URLs over any S3-compatible bucket.',
    referenceAdapter: 'S3-compatible (S3, R2, B2, MinIO)',
    adapters: ['memory', 's3'],
    status: 'in-progress',
    published: false,
    spec: [
      ['Streams', 'Web ReadableStream'],
      ['Signed URLs', 'upload + download, 15 min default'],
      ['Keys', 'rejects .., leading /, control chars'],
      ['Peer (optional)', '@aws-sdk/client-s3'],
    ],
    deferred: ['GCS', 'Azure Blob', 'multipart uploads', 'image transforms'],
    snippet: {
      kind: 'placeholder',
      code: `${PLACEHOLDER}import { createFileStorage } from '@shipstack-ai/file-storage';
import { s3Adapter } from '@shipstack-ai/file-storage/s3';

const storage = createFileStorage({ adapter: s3Adapter({ bucket, region, endpoint, credentials }) });

await storage.put('avatars/42.png', body, { contentType: 'image/png' });
const url = await storage.signedDownloadUrl('avatars/42.png', { expiresIn: 900 });`,
    },
  },
  {
    slug: 'webhooks',
    part: 'SS-07',
    name: 'webhooks',
    pkg: '@shipstack-ai/webhooks',
    repo: 'webhooks',
    purpose: 'Outbound delivery and inbound verification on the Standard Webhooks spec.',
    referenceAdapter: 'Postgres store',
    adapters: ['memory', 'postgres'],
    status: 'in-progress',
    published: false,
    spec: [
      ['Spec', 'Standard Webhooks (HMAC-SHA256)'],
      ['Retries', '5 attempts, 5s -> 5h'],
      ['SSRF guard', 'blocks private and loopback IPs'],
      ['Timeout', '10s per attempt'],
    ],
    deferred: ['customer portal UI', 'dual-secret rotation', 'replay UI'],
    snippet: {
      kind: 'placeholder',
      code: `${PLACEHOLDER}import { createWebhooks } from '@shipstack-ai/webhooks';

const webhooks = createWebhooks({ store, queue: jobs });

await webhooks.createEndpoint({ url: 'https://example.com/hook', events: ['invoice.paid'] });
await webhooks.send({ type: 'invoice.paid', data: { id: 'inv_123' } });`,
    },
  },
  {
    slug: 'billing',
    part: 'SS-08',
    name: 'billing',
    pkg: '@shipstack-ai/billing',
    repo: 'billing',
    purpose: 'Stripe checkout, portal and webhooks, normalized into plans and entitlements.',
    referenceAdapter: 'Stripe',
    adapters: ['fake', 'stripe'],
    status: 'in-progress',
    published: false,
    spec: [
      ['Plans', 'defined in code'],
      ['Webhooks', 'verified via Stripe SDK, idempotent'],
      ['Model', 'normalized Subscription'],
      ['Store', 'memory, Postgres'],
    ],
    deferred: ['metered billing', 'Paddle / Lemon Squeezy / Polar', 'tax', 'coupons'],
    snippet: {
      kind: 'placeholder',
      code: `${PLACEHOLDER}import { createBilling, definePlans } from '@shipstack-ai/billing';
import { stripeProvider } from '@shipstack-ai/billing/stripe';

const plans = definePlans({ pro: { stripePriceId: 'price_123', features: { seats: 5, api: true } } });
const billing = createBilling({ provider: stripeProvider({ secretKey }), plans, store });

const { features } = await billing.getEntitlements(customerRef);`,
    },
  },
];

export const STATUS_LABEL: Record<Status, string> = {
  built: 'v0.1 built',
  'in-progress': 'v0.1 in progress',
};

export const GITHUB_ORG = 'https://github.com/ShipStack-AI';
export const repoUrl = (m: Module) => `${GITHUB_ORG}/${m.repo}`;
export const npmUrl = (m: Module) => `https://www.npmjs.com/package/${m.pkg}`;

export function excerpt(m: Module): string {
  if (m.snippet.kind === 'placeholder') return m.snippet.code;
  const [from, to] = m.snippet.excerpt;
  return m.snippet.code.split('\n').slice(from - 1, to).join('\n');
}
