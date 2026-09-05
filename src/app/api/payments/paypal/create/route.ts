import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getPaymentProvider, PaymentConfigurationError } from "@/lib/payments";
import { products } from "@/lib/data/products";
import { adminDb } from "@/lib/firebase/admin";
import { requireUser, UnauthenticatedError } from "@/lib/server/auth";

// POST /api/payments/paypal/create — mirrors the Cashfree create route.
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
        provider: "paypal",
        status: "pending",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

    const provider = getPaymentProvider("paypal");
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
            "PayPal isn't configured in this environment yet. Add PAYPAL_CLIENT_ID, " +
            "PAYPAL_CLIENT_SECRET, and PAYPAL_WEBHOOK_ID (see .env.example) to enable live payments.",
        },
        { status: 501 }
      );
    }
    console.error(err);
    return NextResponse.json({ message: "Could not start PayPal payment." }, { status: 500 });
  }
}
