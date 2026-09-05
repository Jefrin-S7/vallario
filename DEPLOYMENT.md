# Deploying VALLARIO for $0

This stack deploys entirely on free tiers, no credit card required anywhere:

| Piece | Where | Free tier |
|---|---|---|
| Next.js app (storefront + admin + API routes) | Vercel Hobby plan | Free forever for personal/non-commercial use |
| Auth, Firestore | Firebase **Spark** plan | Free forever, generous daily quotas, **no card required** |
| Digital product files (the actual purchasable zips) | Firebase Storage (default) or Cloudflare R2 (optional upgrade) | Both free — see the note below on which to pick |
| Payments | Cashfree + PayPal **sandbox** | Free, unlimited test transactions |
| Transactional email | Resend or Postmark free tier | 100–3,000 emails/month free |

Cloud Functions are intentionally **not** used — Firebase requires the paid
Blaze plan to deploy any Cloud Function at all, even if you'd stay at $0
usage. All of that logic (webhooks, entitlements, downloads, role changes)
runs as Next.js API routes instead, which are free Vercel serverless
functions. See `README.md` for exactly which files that logic lives in.

### Which storage should I use — Firebase Storage or Cloudflare R2?

The app auto-detects this (`src/lib/storage/index.ts`) — you don't set a
flag, you just configure one or the other:

- **No S3_* env vars set → Firebase Storage automatically.** Uses the same
  service account you already created for Auth/Firestore in step 1 below.
  **No extra signup, no card, ever**, on the free Spark plan. Free quota is
  smaller (5GB storage, ~1GB/day downloaded) and its paid Blaze tier bills
  per GB served if you ever outgrow that — but that's a problem for a
  successful store to have later, not a launch blocker. **This is the
  right default if you don't have a card Cloudflare will accept** — several
  providers, including Cloudflare, ask for one even on their free tier, and
  in practice this rejects some debit/ATM-only cards (common outside the
  US). If that's you, skip straight to step 2 and never look at R2.
- **S3_* env vars set → Cloudflare R2 (or Backblaze B2, or Supabase
  Storage).** Zero egress fees, which matters once you have real sales
  volume and are serving a lot of downloads. Worth moving to later; not
  required to launch.

## 1. Create the Firebase project (Spark/free plan)

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project**. Decline Google Analytics if asked (optional, doesn't affect cost).
2. **Build → Authentication → Get started.** Enable **Email/Password** and **Google** sign-in methods.
3. **Build → Firestore Database → Create database.** Start in production mode (the rules file below replaces the defaults). Pick any region.
4. **Build → Storage → Get started.** Same region as Firestore. This is free on Spark and needs no card — skip this step only if you're deliberately using Cloudflare R2 instead (step 3).
5. **Project settings (gear icon) → General.** Scroll to "Your apps" → add a **Web app**. Copy the config object — these become your `NEXT_PUBLIC_FIREBASE_*` values.
6. **Project settings → Service accounts → Generate new private key.** This downloads a JSON file — its `project_id`, `client_email`, and `private_key` become `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`. **Never commit this file** — it's already in `.gitignore`, but double check before your first `git add`.

## 2. Deploy security rules (no Blaze needed — rules are free on Spark)

```bash
npm install -g firebase-tools
firebase login
firebase use --add        # pick the project you just created
firebase deploy --only firestore:rules,storage:rules
```

This deploys `firebase/firestore.rules` and `firebase/storage.rules` — both
free on Spark. Skip `firebase deploy --only functions`; `firebase/functions`
is left in only as a reference/optional path if you later move to Blaze.

## 3. (Optional) Set up Cloudflare R2 for product files instead

**Skip this entire section if you don't have a card Cloudflare will
accept** — leave the `S3_*` variables blank in `.env.example` and the app
automatically uses Firebase Storage from step 1 instead, at zero extra
setup. Come back to this later if you want R2's zero-egress-fee advantage
once you have real sales volume.

1. Sign up at [dash.cloudflare.com](https://dash.cloudflare.com).
2. **R2 Object Storage → Create bucket.** Name it anything, e.g. `vallario-products`.
3. **R2 → Manage API Tokens → Create API Token.** Give it Object Read & Write permissions scoped to that bucket. Copy the **Access Key ID** and **Secret Access Key** — you only see the secret once.
4. Your endpoint is `https://<account-id>.r2.cloudflarestorage.com` — the account ID is shown on the R2 overview page.
5. These become `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`, with `S3_REGION=auto`.
6. Upload each product's real deliverable file to `products/{productId}/original/{fileName}` in the bucket (via the R2 dashboard's upload button, or the `aws` CLI pointed at the R2 endpoint), and set that same `fileName` on the product's Firestore doc — `/api/downloads/sign` reads it from there to know what to sign a URL for.

Cloudflare does ask for a payment method on some account tiers before
enabling R2 — this has changed over time, so check current requirements at
signup. If you'd rather avoid that entirely, Backblaze B2 and Supabase
Storage's S3-compatible endpoint both work with the exact same
`S3_ENDPOINT`/`S3_ACCESS_KEY_ID`/`S3_SECRET_ACCESS_KEY`/`S3_BUCKET_NAME`
env vars (`src/lib/storage/s3.ts` is a generic S3-compatible client) —
just swap in whichever provider's credentials and endpoint.

## 4. Set up Cashfree (sandbox — free)

1. Sign up at [merchant.cashfree.com](https://merchant.cashfree.com).
2. Dashboard defaults to **Test Mode** — stay there for now. Go to **Developers → API Keys** and copy the test **Client ID** / **Client Secret**.
3. **Developers → Webhooks → Add webhook.** URL: `https://<your-vercel-domain>/api/payments/cashfree/webhook`. Copy the generated **webhook secret**.
4. These become `CASHFREE_CLIENT_ID`, `CASHFREE_CLIENT_SECRET`, `CASHFREE_WEBHOOK_SECRET`, with `CASHFREE_ENV=sandbox`.

## 5. Set up PayPal (sandbox — free)

1. Sign up at [developer.paypal.com](https://developer.paypal.com) → **Dashboard → Apps & Credentials**, Sandbox tab.
2. **Create App.** Copy the Client ID / Secret → `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`.
3. Under the app, add a webhook: `https://<your-vercel-domain>/api/payments/paypal/webhook`, subscribed to `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.DENIED`, `PAYMENT.CAPTURE.REFUNDED`. Copy the **Webhook ID** → `PAYPAL_WEBHOOK_ID`.
4. Set `PAYPAL_ENV=sandbox`.

## 6. (Optional) Email — Resend free tier

1. Sign up at [resend.com](https://resend.com) (3,000 emails/month free).
2. Create an API key → `EMAIL_PROVIDER_API_KEY`.
3. Implement the actual send in `src/lib/server/email.ts` (the fetch call is stubbed and commented in) — until then, emails just log to the server console, which is fine for testing.

## 7. Deploy to Vercel

1. Push this repo to GitHub.
2. [vercel.com](https://vercel.com) → **Add New → Project** → import the repo. Framework preset auto-detects Next.js.
3. Before the first deploy, add every variable from `.env.example` under **Settings → Environment Variables** (paste real values, not the placeholders). For `FIREBASE_PRIVATE_KEY`, paste the whole multi-line key — Vercel's env var editor handles the newlines correctly.
4. Deploy. Vercel gives you a `https://your-project.vercel.app` URL — set `NEXT_PUBLIC_SITE_URL` to that (or your custom domain, also free to attach on Hobby) and redeploy so `robots.txt`/`sitemap.xml` emit correct absolute URLs.
5. Go back and update the Cashfree/PayPal webhook URLs (steps 4–5 above) to point at your real deployed domain if you used a placeholder.

## 8. Seed the product catalog into Firestore

The six real products already live in `src/lib/data/products.ts` and render
correctly from local seed data with zero setup — the admin panel's
**"Sync Catalog to Firestore"** button (top of `/admin`) does this for you
in one click once Firebase Admin is configured (it calls `/api/admin/seed`).
To make the products actually purchasable, also:

1. Confirm the sync worked: `/admin/products` should show a green "Live
   Firestore" badge and list all 6 products with `source: "firestore"`.
2. Upload each product's real deliverable file to whichever storage backend
   you're using — Firebase Storage console (Storage → your bucket, if you
   skipped R2) or your R2 bucket dashboard (step 3, if you set that up) —
   at `products/{productId}/original/{fileName}`, and set that same
   `fileName` field on the product's Firestore doc — `/api/downloads/sign`
   reads it from there.
3. Marketing images (thumbnails, gallery) stay exactly where they are, in
   `public/products/` — no upload needed, Vercel serves them for free.

## 9. Test the full loop before going live

1. Register a test account at `/register`.
2. Add a product to cart, check out with **Cashfree test mode** — use their [published test card/UPI numbers](https://www.cashfree.com/docs/payments/online/resources/sandbox-environment).
3. Confirm the webhook fires (Cashfree dashboard → Developers → Webhooks → delivery log) and that `orders/{id}.status` flips to `paid` in Firestore, an `entitlements` doc appears, and the product shows up in `/dashboard`.
4. Repeat with a PayPal sandbox buyer account.
5. Only after that loop works end-to-end should you flip `CASHFREE_ENV`/`PAYPAL_ENV` to live and swap in production credentials — in a **separate** set of Vercel environment variables for a production deployment, never mixed with sandbox (per the original spec's environment-separation requirement).

## Staying free as you grow

- Vercel Hobby: fine for personal projects; commercial use technically
  requires a Pro plan ($20/mo) per Vercel's terms — worth checking current
  terms before launching a real business on it.
- Firebase Spark: no Cloud Functions, and Firestore has daily quota caps
  (50K reads, 20K writes/day as of this writing) — comfortable for early
  traffic, but check [firebase.google.com/pricing](https://firebase.google.com/pricing)
  for current numbers before you scale.
- Cloudflare R2: 10GB storage free, and — unlike Firebase Storage or S3 —
  **no egress fee ever**, on any tier, which is what actually matters for a
  download-heavy store once you outgrow the free storage quota.
- If you outgrow Spark, moving to Blaze doesn't require re-architecting:
  the `firebase/functions` folder in this repo already has equivalent
  Cloud Functions implementations ready to deploy alongside (or instead of)
  the Vercel API routes.

## If a secret ever leaks

If a `.env` file, service-account JSON, or API key ends up somewhere it
shouldn't (committed to git, pasted into a chat, uploaded somewhere) — treat
it as compromised immediately, not just "risky":

1. **Rotate it first, ask questions later.** Firebase: Project Settings →
   Service Accounts → delete the key, generate a new one. Cashfree/PayPal:
   regenerate the client secret from their dashboards. Update Vercel's
   environment variables with the new values and redeploy.
2. If it was committed to git, rotating the credential is what actually
   matters — scrubbing git history is good hygiene but doesn't undo the
   exposure on its own, since the old value is invalid the moment you
   rotate it.
3. Check `.gitignore` covers it going forward (`serviceaccountkey.json` and
   `.env*` are already excluded in this repo's `.gitignore`).
