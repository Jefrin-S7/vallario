import { NextRequest, NextResponse } from "next/server";
import { getPaymentProvider, PaymentConfigurationError } from "@/lib/payments";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { grantEntitlementsForOrder } from "@/lib/server/entitlements";
import { writeAuditLog } from "@/lib/server/audit";

// POST /api/payments/cashfree/webhook
//
// This is the ONLY place a Cashfree payment is allowed to flip an order to
// "paid" and create entitlements. The checkout page's client-side redirect
// is a convenience for the user, never a trust signal.
//
// Point Cashfree's webhook URL (Merchant Dashboard → Developers → Webhooks)
// at this route's deployed URL once live.
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-webhook-signature");
  const timestamp = req.headers.get("x-webhook-timestamp");

  try {
    const provider = getPaymentProvider("cashfree");
    const result = await provider.handleWebhook(rawBody, signature, {
      "x-webhook-timestamp": timestamp,
    });

    if (!result.valid) {
      return NextResponse.json({ message: "Invalid signature." }, { status: 401 });
    }

    const db = adminDb();

    // Idempotency: Cashfree retries on any non-2xx or timeout, so the same
    // event can arrive more than once. Short-circuit on a repeat.
    const eventRef = db.collection("webhookEvents").doc(result.eventId);
    const eventSnap = await eventRef.get();
    if (eventSnap.exists) {
      return NextResponse.json({ received: true, duplicate: true });
    }
    await eventRef.set({ receivedAt: FieldValue.serverTimestamp(), provider: "cashfree" });

    await writeAuditLog({
      action: "webhook_received",
      actorUid: "system",
      metadata: { provider: "cashfree", eventId: result.eventId },
    });

    if (result.status === "paid" && result.orderId) {
      const orderSnap = await db.collection("orders").doc(result.orderId).get();
      if (orderSnap.exists) {
        const order = orderSnap.data()!;
        await db.collection("payments").add({
          orderId: result.orderId,
          provider: "cashfree",
          providerPaymentId: result.providerPaymentId,
          status: "verified",
          amount: result.amount,
          currency: result.currency,
          verifiedAt: FieldValue.serverTimestamp(),
        });
        await grantEntitlementsForOrder({
          orderId: result.orderId,
          uid: order.userId,
          userEmail: order.userEmail,
          items: order.items,
        });
      } else {
        console.error(`[cashfree webhook] order ${result.orderId} not found`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    if (err instanceof PaymentConfigurationError) {
      return NextResponse.json({ message: err.message }, { status: 501 });
    }
    console.error(err);
    return NextResponse.json({ message: "Webhook processing failed." }, { status: 500 });
  }
}
