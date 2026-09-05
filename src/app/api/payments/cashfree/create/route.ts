import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getPaymentProvider, PaymentConfigurationError } from "@/lib/payments";
import { products } from "@/lib/data/products";
import { adminDb } from "@/lib/firebase/admin";
import { requireUser, UnauthenticatedError } from "@/lib/server/auth";

// POST /api/payments/cashfree/create
// Headers: Authorization: Bearer <Firebase ID token>
// Body: { items: {productId, quantity}[] }
//
// Flow:
//   1. Verify the caller's identity from their Firebase ID token — never
//      from anything the client claims in the request body.
//   2. Re-price every line server-side from the trusted catalog.
//   3. Write a pending `orders` doc (this is what the webhook looks up once
//      the payment is independently verified).
//   4. Ask Cashfree to create a hosted-checkout order, store its id.
//   5. Return the redirect URL so the browser can complete payment.
// The order is only marked paid, and entitlements only created, once the
// webhook (or verifyPayment) independently confirms the payment — never
// from this route or a client-reported redirect.
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const body = await req.json();
    const lines = (body.items ?? []) as { productId: string; quantity: number }[];

    if (!lines.length) {
      return NextResponse.json({ message: "Cart is empty." }, { status: 400 });
    }

    let amount = 0;
    const orderItems = [];
    for (const line of lines) {
      const product = products.find((p) => p.id === line.productId);
      if (!product) {
        return NextResponse.json({ message: `Unknown product: ${line.productId}` }, { status: 400 });
      }
      amount += product.price * line.quantity;
      orderItems.push({
        productId: product.id,
        quantity: line.quantity,
        unitPrice: product.price,
        downloadLimit: 5,
      });
    }

    const orderId = `vlo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    await adminDb()
      .collection("orders")
      .doc(orderId)
      .set({
        userId: user.uid,
        userEmail: user.email,
        items: orderItems,
        total: amount,
        currency: "USD",
        provider: "cashfree",
        status: "pending",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

    const provider = getPaymentProvider("cashfree");
    const result = await provider.createPayment(orderId, amount, "USD", {
      email: user.email,
      name: body.customer?.name ?? user.email,
      userId: user.uid,
    });

    return NextResponse.json({ orderId, redirectUrl: result.redirectUrl });
  } catch (err) {
    if (err instanceof UnauthenticatedError) {
      return NextResponse.json({ message: err.message }, { status: 401 });
    }
    if (err instanceof PaymentConfigurationError) {
      return NextResponse.json(
        {
          message:
            "Cashfree isn't configured in this environment yet. Add CASHFREE_CLIENT_ID, " +
            "CASHFREE_CLIENT_SECRET, and CASHFREE_WEBHOOK_SECRET (see .env.example) to enable live payments.",
        },
        { status: 501 }
      );
    }
    console.error(err);
    return NextResponse.json({ message: "Could not start Cashfree payment." }, { status: 500 });
  }
}
