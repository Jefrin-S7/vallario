import { https } from "firebase-functions/v1";
import * as crypto from "crypto";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { grantEntitlementsForOrder } from "./entitlements";
import { writeAuditLog } from "./audit";

// ---------------------------------------------------------------------------
// Shared idempotency guard. Payment providers retry webhooks on any non-2xx
// or timeout, so every handler must tolerate — and short-circuit on — the
// same event arriving more than once. `webhookEvents/{eventId}` is that guard
// and is the only Firestore doc these functions rely on for dedup.
// ---------------------------------------------------------------------------
async function alreadyProcessed(eventId: string): Promise<boolean> {
  const db = getFirestore();
  const ref = db.collection("webhookEvents").doc(eventId);
  const snap = await ref.get();
  if (snap.exists) return true;
  await ref.set({ receivedAt: FieldValue.serverTimestamp() });
  return false;
}

// ---------------------------------------------------------------------------
// Cashfree
// ---------------------------------------------------------------------------
export const cashfreeWebhook = https.onRequest(async (req, res) => {
  const signature = req.header("x-webhook-signature") ?? "";
  const timestamp = req.header("x-webhook-timestamp") ?? "";
  const rawBody = req.rawBody;

  const secret = process.env.CASHFREE_WEBHOOK_SECRET;
  if (!secret) {
    res.status(501).json({ message: "Cashfree webhook secret not configured." });
    return;
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(timestamp + rawBody.toString())
    .digest("base64");

  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
    res.status(401).json({ message: "Invalid signature." });
    return;
  }

  const payload = JSON.parse(rawBody.toString());
  const eventId: string = payload.event_time + ":" + payload.data?.payment?.cf_payment_id;

  if (await alreadyProcessed(eventId)) {
    res.status(200).json({ received: true, duplicate: true });
    return;
  }

  await writeAuditLog({ action: "webhook_received", actorUid: "system", metadata: { provider: "cashfree", eventId } });

  if (payload.type === "PAYMENT_SUCCESS_WEBHOOK") {
    const orderId = payload.data.order.order_id;
    const db = getFirestore();
    const orderSnap = await db.collection("orders").doc(orderId).get();
    if (orderSnap.exists) {
      const order = orderSnap.data()!;
      await db.collection("payments").add({
        orderId,
        provider: "cashfree",
        providerPaymentId: payload.data.payment.cf_payment_id,
        status: "verified",
        amount: payload.data.payment.payment_amount,
        currency: payload.data.payment.payment_currency,
        verifiedAt: FieldValue.serverTimestamp(),
      });
      await grantEntitlementsForOrder({
        orderId,
        uid: order.userId,
        userEmail: order.userEmail,
        items: order.items,
      });
    }
  }

  res.status(200).json({ received: true });
});

// ---------------------------------------------------------------------------
// PayPal
// ---------------------------------------------------------------------------
export const paypalWebhook = https.onRequest(async (req, res) => {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    res.status(501).json({ message: "PayPal webhook ID not configured." });
    return;
  }

  // PayPal verification requires calling their /v1/notifications/verify-webhook-signature
  // endpoint with the transmission headers + this webhook ID + your app's
  // PayPal access token. Stubbed here as `verifyPaypalSignature` — see
  // src/lib/payments/PaypalProvider.ts in the Next.js app for the matching
  // client-side reference implementation.
  const verified = await verifyPaypalSignature(req, webhookId);
  if (!verified) {
    res.status(401).json({ message: "Invalid PayPal signature." });
    return;
  }

  const payload = req.body;
  const eventId: string = payload.id;

  if (await alreadyProcessed(eventId)) {
    res.status(200).json({ received: true, duplicate: true });
    return;
  }

  await writeAuditLog({ action: "webhook_received", actorUid: "system", metadata: { provider: "paypal", eventId } });

  if (payload.event_type === "PAYMENT.CAPTURE.COMPLETED") {
    const orderId = payload.resource.custom_id; // set to our internal orderId at capture time
    const db = getFirestore();
    const orderSnap = await db.collection("orders").doc(orderId).get();
    if (orderSnap.exists) {
      const order = orderSnap.data()!;
      await db.collection("payments").add({
        orderId,
        provider: "paypal",
        providerPaymentId: payload.resource.id,
        status: "verified",
        amount: Number(payload.resource.amount.value),
        currency: payload.resource.amount.currency_code,
        verifiedAt: FieldValue.serverTimestamp(),
      });
      await grantEntitlementsForOrder({
        orderId,
        uid: order.userId,
        userEmail: order.userEmail,
        items: order.items,
      });
    }
  }

  res.status(200).json({ received: true });
});

async function verifyPaypalSignature(req: https.Request, webhookId: string): Promise<boolean> {
  // Reference stub. Production implementation:
  //   1. Get an OAuth2 access token from PayPal using PAYPAL_CLIENT_ID/SECRET.
  //   2. POST to /v1/notifications/verify-webhook-signature with the
  //      transmission_id, transmission_time, cert_url, auth_algo,
  //      transmission_sig headers + webhookId + the raw event body.
  //   3. Return true only if verification_status === "SUCCESS".
  console.warn("[paypalWebhook] verifyPaypalSignature is a stub — wire up real verification before going live.");
  return Boolean(req.header("paypal-transmission-sig")) && Boolean(webhookId);
}
