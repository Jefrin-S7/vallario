"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.paypalWebhook = exports.cashfreeWebhook = void 0;
const v1_1 = require("firebase-functions/v1");
const crypto = __importStar(require("crypto"));
const firestore_1 = require("firebase-admin/firestore");
const entitlements_1 = require("./entitlements");
const audit_1 = require("./audit");
// ---------------------------------------------------------------------------
// Shared idempotency guard. Payment providers retry webhooks on any non-2xx
// or timeout, so every handler must tolerate — and short-circuit on — the
// same event arriving more than once. `webhookEvents/{eventId}` is that guard
// and is the only Firestore doc these functions rely on for dedup.
// ---------------------------------------------------------------------------
async function alreadyProcessed(eventId) {
    const db = (0, firestore_1.getFirestore)();
    const ref = db.collection("webhookEvents").doc(eventId);
    const snap = await ref.get();
    if (snap.exists)
        return true;
    await ref.set({ receivedAt: firestore_1.FieldValue.serverTimestamp() });
    return false;
}
// ---------------------------------------------------------------------------
// Cashfree
// ---------------------------------------------------------------------------
exports.cashfreeWebhook = v1_1.https.onRequest(async (req, res) => {
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
    const eventId = payload.event_time + ":" + payload.data?.payment?.cf_payment_id;
    if (await alreadyProcessed(eventId)) {
        res.status(200).json({ received: true, duplicate: true });
        return;
    }
    await (0, audit_1.writeAuditLog)({ action: "webhook_received", actorUid: "system", metadata: { provider: "cashfree", eventId } });
    if (payload.type === "PAYMENT_SUCCESS_WEBHOOK") {
        const orderId = payload.data.order.order_id;
        const db = (0, firestore_1.getFirestore)();
        const orderSnap = await db.collection("orders").doc(orderId).get();
        if (orderSnap.exists) {
            const order = orderSnap.data();
            await db.collection("payments").add({
                orderId,
                provider: "cashfree",
                providerPaymentId: payload.data.payment.cf_payment_id,
                status: "verified",
                amount: payload.data.payment.payment_amount,
                currency: payload.data.payment.payment_currency,
                verifiedAt: firestore_1.FieldValue.serverTimestamp(),
            });
            await (0, entitlements_1.grantEntitlementsForOrder)({
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
exports.paypalWebhook = v1_1.https.onRequest(async (req, res) => {
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
    const eventId = payload.id;
    if (await alreadyProcessed(eventId)) {
        res.status(200).json({ received: true, duplicate: true });
        return;
    }
    await (0, audit_1.writeAuditLog)({ action: "webhook_received", actorUid: "system", metadata: { provider: "paypal", eventId } });
    if (payload.event_type === "PAYMENT.CAPTURE.COMPLETED") {
        const orderId = payload.resource.custom_id; // set to our internal orderId at capture time
        const db = (0, firestore_1.getFirestore)();
        const orderSnap = await db.collection("orders").doc(orderId).get();
        if (orderSnap.exists) {
            const order = orderSnap.data();
            await db.collection("payments").add({
                orderId,
                provider: "paypal",
                providerPaymentId: payload.resource.id,
                status: "verified",
                amount: Number(payload.resource.amount.value),
                currency: payload.resource.amount.currency_code,
                verifiedAt: firestore_1.FieldValue.serverTimestamp(),
            });
            await (0, entitlements_1.grantEntitlementsForOrder)({
                orderId,
                uid: order.userId,
                userEmail: order.userEmail,
                items: order.items,
            });
        }
    }
    res.status(200).json({ received: true });
});
async function verifyPaypalSignature(req, webhookId) {
    // Reference stub. Production implementation:
    //   1. Get an OAuth2 access token from PayPal using PAYPAL_CLIENT_ID/SECRET.
    //   2. POST to /v1/notifications/verify-webhook-signature with the
    //      transmission_id, transmission_time, cert_url, auth_algo,
    //      transmission_sig headers + webhookId + the raw event body.
    //   3. Return true only if verification_status === "SUCCESS".
    console.warn("[paypalWebhook] verifyPaypalSignature is a stub — wire up real verification before going live.");
    return Boolean(req.header("paypal-transmission-sig")) && Boolean(webhookId);
}
