# VALLARIO Firestore Schema

This is the collection layout the app is built against. `src/lib/data/products.ts`
mirrors the `products` shape so the storefront renders correctly before a real
Firebase project exists — swap that file's data source for Firestore reads once
the project is connected.

## Top-level collections

```
users/{uid}
  email, displayName, role, createdAt, disabled, emailVerified

products/{productId}
  slug, name, description, shortDescription, price, compareAtPrice, currency,
  category, subcategory, tags[], productType, image, gallery[], features[],
  whatsIncluded[], fileFormat, fileSize, license, version, status,
  featured, bestseller, newArrival, salesCount, rating, reviewCount,
  createdAt, updatedAt
  -- storageRef points at /products/{productId}/original.* in Storage

categories/{categoryId}
  name, slug, parentId?, order

orders/{orderId}
  userId, items: [{productId, quantity, unitPrice}], subtotal, discount,
  tax, total, currency, status: pending|paid|failed|refunded|cancelled,
  couponCode?, createdAt, updatedAt

orderItems/{orderItemId}          -- denormalized line items for reporting
  orderId, userId, productId, unitPrice, quantity

payments/{paymentId}
  orderId, provider: cashfree|paypal, providerPaymentId, status,
  amount, currency, verifiedAt, rawProviderPayload (redacted of secrets)

entitlements/{uid_productId}
  uid, productId, orderId, grantedAt, revoked, downloadLimit,
  downloadsUsed, downloadExpiresAt, lastDownloadedAt

downloads/{downloadId}
  uid, productId, entitlementId, issuedAt, ip, userAgent

licenses/{licenseId}
  uid, productId, licenseKey, seats, issuedAt, revoked

coupons/{code}
  type: percentage|fixed, value, appliesToProductIds?[], appliesToCategory?,
  minOrderAmount?, maxDiscount?, usageLimit, perUserLimit, startsAt, expiresAt,
  timesUsed

reviews/{reviewId}
  uid, productId, rating, body, verifiedPurchase, status: pending|published|rejected,
  createdAt

wishlists/{uid}
  productIds: string[]

cart/{uid}                         -- server-mirrored cart for signed-in users
  lines: [{productId, quantity}], updatedAt

notifications/{notificationId}
  uid, type, title, body, read, createdAt

supportTickets/{ticketId}
  uid, subject, status: open|in_progress|waiting_for_customer|resolved|closed,
  messages: [{authorId, authorRole, body, createdAt}], createdAt, updatedAt

subscriptions/{subscriptionId}      -- reserved for subscription-type products
  uid, productId, status, renewsAt

inventory/{productId}               -- for license-seat / seat-limited products
  totalSeats, seatsIssued

employees/{uid}
  role, department, hiredAt

roles/{roleName}
  permissions: string[]

permissions/{permissionId}
  description

auditLogs/{logId}                    -- append-only; see security notes below
  actorUid, action, targetType, targetId, before?, after?, createdAt, ip

settings/{singleton}
  storeName, supportEmail, taxRules, featureFlags

analytics/{...}                      -- pre-aggregated rollups written by
                                      -- scheduled Cloud Functions, not written
                                      -- directly by clients

webhookEvents/{eventId}               -- idempotency ledger for payment webhooks
  provider, eventType, receivedAt, processed

refunds/{refundId}
  orderId, paymentId, amount, reason, status, createdAt

invoices/{invoiceId}
  orderId, uid, number, issuedAt, pdfStorageRef
```

## Storage layout

```
/products/{productId}/
    original.<ext>        -- the source file (private, entitlement-gated)
    thumbnail.webp
    small.webp
    medium.webp
    large.webp
/media/{mediaId}/...       -- media library assets (logo, promo graphics)
/invoices/{invoiceId}.pdf
```

Product thumbnails/gallery images are public-read (served on the storefront).
`original.*` files are **never** public — access only via a signed URL minted
after an entitlement check (see `functions/src/downloads/signDownloadUrl.ts`).

## Design notes

- **Deny by default.** `firestore.rules` and `storage.rules` start closed;
  every read/write is explicitly opened per collection.
- **Server-authoritative money and access fields.** `price`, `orderStatus`,
  `entitlement.*`, `role`, and `permissions` are only ever written by Cloud
  Functions using the Admin SDK — client rules for those fields are read-only
  or fully denied.
- **Audit logs are append-only.** Rules allow `create` from Cloud Functions
  only; no `update`/`delete` path exists for any role, including `admin`.
