import { NextRequest, NextResponse } from "next/server";
import { getPaymentProvider, PaymentConfigurationError } from "@/lib/payments";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { grantEntitlementsForOrder } from "@/lib/server/entitlements";
import { writeAuditLog } from "@/lib/server/audit";

// POST /api/payments/paypal/webhook
//
// Point PayPal's webhook URL (Developer Dashboard → your app → Webhooks) at
// this route's deployed URL once live, subscribed to at least
// PAYMENT.CAPTURE.COMPLETED, PAYMENT.CAPTURE.DENIED, and
// PAYMENT.CAPTURE.REFUNDED.
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("paypal-transmission-sig");

  try {
    const provider = getPaymentProvider("paypal");
    const result = await provider.handleWebhook(rawBody, signature, {
      "paypal-transmission-id": req.headers.get("paypal-transmission-id"),
      "paypal-transmission-time": req.headers.get("paypal-transmission-time"),
      "paypal-cert-url": req.headers.get("paypal-cert-url"),
      "paypal-auth-algo": req.headers.get("paypal-auth-algo"),
      "paypal-transmission-sig": signature,
    });

    if (!result.valid) {
      return NextResponse.json({ message: "Invalid signature." }, { status: 401 });
    }

    const db = adminDb();

    const eventRef = db.collection("webhookEvents").doc(result.eventId);
    const eventSnap = await eventRef.get();
    if (eventSnap.exists) {
      return NextResponse.json({ received: true, duplicate: true });
    }
    await eventRef.set({ receivedAt: FieldValue.serverTimestamp(), provider: "paypal" });

    await writeAuditLog({
      action: "webhook_received",
      actorUid: "system",
      metadata: { provider: "paypal", eventId: result.eventId },
    });

    if (result.status === "paid" && result.orderId) {
      const orderSnap = await db.collection("orders").doc(result.orderId).get();
      if (orderSnap.exists) {
        const order = orderSnap.data()!;
        await db.collection("payments").add({
          orderId: result.orderId,
          provider: "paypal",
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
        console.error(`[paypal webhook] order ${result.orderId} not found`);
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
