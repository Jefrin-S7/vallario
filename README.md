# VALLARIO

Premium digital-product e-commerce platform — storefront, customer dashboard,
and admin/ERP console — built with Next.js (App Router), Tailwind, and a
Firebase backend architecture.

## What this is, honestly

This repo is a **complete, working frontend** plus a **production-ready
backend written as real code** — Firestore/Storage security rules, a
payment-provider abstraction (Cashfree + PayPal), and the actual server
logic (webhooks, entitlement granting, download signing, role management)
running as Next.js API routes so the whole thing deploys for free. It is
**not** wired to a live Firebase project or live Cashfree/PayPal accounts —
that requires credentials only you can create. Everything needed to go live
is here in code form; connecting it is a config step, documented in
[DEPLOYMENT.md](./DEPLOYMENT.md).

Run `npm run dev` right now and the entire storefront, customer dashboard,
and admin console work end-to-end against local seed data — no setup
required. Auth forms detect the missing Firebase config and run in a labeled
"demo mode" instead of crashing.

## What's real vs. demo, precisely

| Area | Status |
|---|---|
| Storefront UI (home, shop, product pages, cart, checkout UI) | **Real**, renders from `src/lib/data/products.ts` |
| The 6 product images + logo | **Your real uploaded assets**, in `public/products` and `public/brand` |
| Product catalog data (names, prices, what's included) | **Real**, matches your spec exactly — no fabricated review counts or sales figures |
| Firestore security rules | **Real**, deploy-ready (`firebase/firestore.rules`) |
| Digital product file storage | **Real**, via `src/lib/storage/index.ts` — auto-picks Cloudflare R2/S3-compatible if configured, otherwise Firebase Storage (no card needed) |
| Payment webhooks, entitlement granting, download signing, role changes | **Real logic**, live at `src/app/api/**` — runs as free Vercel serverless functions, no Blaze plan needed |
| Cloud Functions (`firebase/functions/`) | **Optional alternative** — same logic, only needed if you move to Firebase's paid Blaze plan later |
| Admin/ERP: products, orders, customers, finance, coupons, reviews, support, audit logs | **Real**, live-Firestore-backed via `/api/admin/*` routes, with a graceful "not connected yet" fallback (shown via a real connection badge, not a hardcoded one) until you run Firebase setup |
| Admin/ERP: analytics charts | **Demo data still** (`src/lib/data/admin-demo.ts`, clearly badged) — not yet wired to a real aggregation query |
| Payments (Cashfree/PayPal) | **Real integration** in `src/lib/payments/` — signature verification and webhook handling are implemented correctly; needs your real API keys to process a live payment |
| Auth (email/password, Google) | Real Firebase Auth calls, but falls back to demo mode with no project connected |

### Which storage backend do I actually need?

Neither is required to get the rest of the app working — this only matters
once you want real file downloads to work. `src/lib/storage/index.ts` picks
automatically:

- **If `S3_ENDPOINT`/`S3_ACCESS_KEY_ID`/etc. are set**: uses that
  S3-compatible provider (Cloudflare R2, Backblaze B2, Supabase Storage).
  R2 specifically has zero egress fees, which matters most once you have
  real sales volume — but several providers, including Cloudflare, ask for
  a card on file even for their free tier, which is a real blocker if you
  don't have one that works internationally.
- **Otherwise**: falls back to Firebase Storage automatically, using the
  same service account you already set up for Auth/Firestore — **no extra
  signup, no card, ever**, on the free Spark plan. The quota is smaller
  (5GB storage, ~1GB/day downloaded) and its paid Blaze tier bills per GB —
  but that's a "deal with it once you outgrow it" problem, not a launch
  blocker.

Marketing images (thumbnails, gallery shots) always stay in `public/` and
are served free by Vercel regardless of which backend you pick — they never
touch either storage system.

## Getting it running locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` for the storefront, `http://localhost:3000/admin`
for the ERP console. Everything renders and browses freely with zero setup.
Actions that require a real backend — completing checkout, downloading a
purchased file, editing a product, changing a user's role — will return a
clear "sign in required" or "not configured" message rather than crashing,
until you connect a real Firebase project per DEPLOYMENT.md. The admin
panel shows a red "Not connected" badge in this state instead of silently
pretending to be live.

## Going to production, for free

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for a full step-by-step, $0-cost
deployment guide (Vercel + Firebase Spark plan + Cloudflare R2, no credit
card required for Vercel or Firebase). Short version:

1. Create a Firebase project (Spark/free plan) — Auth, Firestore.
2. `firebase deploy --only firestore:rules` (free on Spark).
3. Set up Cloudflare R2 (or another S3-compatible provider) for product files.
4. Get free Cashfree + PayPal sandbox credentials.
5. Push to GitHub, import into Vercel, add the env vars, deploy.
6. Click "Sync Catalog to Firestore" in `/admin`, then upload each product's
   real deliverable file to R2.

Cloud Functions (`firebase/functions/`) are **not** required for this path —
Firebase only lets you deploy Cloud Functions on the paid Blaze plan, so all
of that logic (webhooks, entitlements, downloads, role changes) has been
built as Next.js API routes instead, which run free on Vercel. The
`firebase/functions` folder is kept as a reference/optional upgrade path if
you later move to Blaze for other reasons — nothing in the free deployment
path depends on it.

## Where things live

```
src/app/                    storefront + admin routes (App Router)
src/app/admin/(dashboard)/  admin/ERP pages (live-Firestore-backed), sidebar shell
src/app/admin/login/        admin sign-in, deliberately outside the shell
src/app/api/admin/          admin CRUD routes — staff-only (requireStaff),
                             graceful "not connected" responses, real audit logging
src/app/api/                payment create/webhook routes, download signing,
                             auth/role routes, cron
src/components/             storefront UI components
src/components/admin/       admin UI components (ProductionBadge = real
                             connection status, DemoBadge = illustrative data)
src/lib/data/products.ts    the real 6-product seed catalog
src/lib/data/admin-demo.ts  demo data still used by the analytics page only
src/lib/firebase/           client SDK (browser) + Admin SDK (server-only,
                             env-vars only — never reads a key file from disk)
src/lib/server/             free-tier backend logic: auth verification
                             (requireUser / requireStaff), audit log,
                             entitlement granting, email
src/lib/storage/s3.ts       S3-compatible file storage (R2/B2/Supabase) —
                             NOT Firebase Storage
src/lib/payments/           PaymentProvider abstraction (Cashfree, PayPal)
firebase/firestore.rules    deny-by-default Firestore security rules
firebase/storage.rules      Storage security rules — used automatically as
                             the download-signing fallback when no S3/R2
                             credentials are set (no card required, unlike
                             most S3-compatible providers' free tiers)
firebase/functions/src/     OPTIONAL: Cloud Functions equivalents of the
                             src/app/api/ logic above — only needed on Blaze
```

## Security posture already built in

- Firestore rules deny everything by default; customers can never write
  price, order status, entitlements, or their own role from the browser.
- Every order-creating, download-signing, and role-changing API route
  verifies a real Firebase ID token server-side (`src/lib/server/auth.ts`)
  — nothing trusts a uid/email/role the client claims in a request body.
- Every `/api/admin/*` route requires a real, verified staff role
  (`requireStaff()` — checks the ID token, then the caller's role in
  Firestore) with **no bypass for missing credentials**. An earlier
  iteration of this admin panel had a `requireUserOrBypass` helper that let
  unauthenticated requests through when no token was present, so the panel
  would "just work" without wiring up auth — that meant anyone who found an
  admin API route could edit prices or change roles with zero credentials.
  If you're extending the admin API, use `requireStaff()`, never a shortcut
  like that.
- Checkout requires a signed-in account (entitlements are keyed by uid), and
  every line item is re-priced from the trusted server-side catalog, never
  from a client-submitted price.
- Digital product files are never in a public path — every download goes
  through `/api/downloads/sign`, which checks auth + a live, non-revoked
  entitlement + remaining download count before minting a 15-minute signed
  URL, and logs the issuance.
- Cashfree webhook signatures are verified with the correct HMAC input
  (`timestamp + rawBody`, matching what Cashfree actually signs) using a
  constant-time, length-checked comparison. PayPal webhooks are verified via
  PayPal's own `verify-webhook-signature` endpoint.
- Payment webhooks dedupe via `webhookEvents/{eventId}` before ever
  touching an order or granting access, so a provider's automatic retry
  can't double-grant a purchase.
- Every sensitive admin action funnels through `writeAuditLog`
  (`src/lib/server/audit.ts`), which is append-only and unreachable from the
  normal admin UI.
- Firebase Admin credentials come **only** from environment variables —
  there is no fallback to reading a service-account JSON file from disk.
  A key file sitting in the repo is a matter of "when," not "if," it ends
  up committed or shared somewhere it shouldn't; env vars set directly in
  Vercel's dashboard don't have that failure mode. `serviceaccountkey.json`
  is explicitly gitignored as a backstop, but don't rely on that — don't
  create the file in the first place.
- HTTP responses carry `X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`, and `Permissions-Policy` headers (`next.config.ts`);
  the `X-Powered-By` header is disabled. A strict Content-Security-Policy is
  intentionally not included yet — several components use inline `style`
  attributes for dynamic colors, which a strict `style-src` would block.
  Adding one is worth doing before launch; budget time to audit those
  inline styles first.

## Known gaps in the free-tier (Vercel + Spark) path

- **Analytics charts** on `/admin/analytics` are still illustrative demo
  data — everything else in the admin panel reads live Firestore data via
  `/api/admin/*`, but analytics aggregation hasn't been wired up yet. The
  `dailyAnalyticsRollup` scheduled function exists as a reference in
  `firebase/functions/src/analytics.ts` and there's a Vercel Cron
  equivalent stubbed at `/api/cron/analytics-rollup` — connecting the
  analytics page to read from wherever that writes is the remaining step.
- **Review verified-purchase enforcement** currently only exists in the
  optional `firebase/functions/src/reviews.ts` (a Firestore trigger, which
  needs Blaze). There's no review-submission UI yet either — reviews are
  currently moderated through `/admin/reviews` but not customer-submitted.
  If you build a submission flow before adding Blaze, route it through an
  API route that checks the entitlement server-side first (mirror the
  pattern in `/api/downloads/sign`), rather than trusting a client-set
  `verifiedPurchase` flag.
- **Role changes and new-user provisioning** are implemented as API routes
  (`/api/admin/users/[uid]/role`, `/api/auth/register`, plus the role-patch
  path inside `/api/admin/customers`) rather than Firestore triggers —
  functionally equivalent, but they only run when someone hits those
  routes. Fine as long as all role/user-creation writes go through them,
  which is the only path the admin UI and auth forms actually use.
- **Transactional email** logs to the console until you wire in a real
  provider in `src/lib/server/email.ts` (see DEPLOYMENT.md).

## Quality checks passing

- `npm run lint` — zero errors, zero warnings (strict `@typescript-eslint`
  rules, no `any` types, no unescaped JSX entities).
- `npm run build` — full production build succeeds, all 55 routes compile
  and prerender (or correctly render dynamically for the API routes).
- `firebase/functions` — separate TypeScript project, compiles clean with
  `npm run build` inside that folder.
- Every `/api/admin/*` route verified directly: unauthenticated requests
  are rejected with a clear message, and requests are never silently
  let through.
- Branded `not-found.tsx` (real 404 status) and `error.tsx` (client error
  boundary) replace Next.js's default pages.
- `robots.txt` and `sitemap.xml` are generated from the real product catalog
  (`src/app/robots.ts`, `src/app/sitemap.ts`) — set `NEXT_PUBLIC_SITE_URL`
  once you have a real domain.
- Shop search is live (filters by name/description/category/tags).
