import crypto from "crypto";
import {
  PaymentProvider,
  PaymentConfigurationError,
  CreatePaymentResult,
  VerifyPaymentResult,
  WebhookHandleResult,
  CustomerInput,
} from "./PaymentProvider";

const CASHFREE_BASE_URL =
  process.env.CASHFREE_ENV === "production"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

function requireConfig() {
  const missing: string[] = [];
  if (!process.env.CASHFREE_CLIENT_ID) missing.push("CASHFREE_CLIENT_ID");
  if (!process.env.CASHFREE_CLIENT_SECRET) missing.push("CASHFREE_CLIENT_SECRET");
  if (missing.length) throw new PaymentConfigurationError("Cashfree", missing);
}

export class CashfreeProvider extends PaymentProvider {
  readonly name = "cashfree" as const;

  async createPayment(
    orderId: string,
    amount: number,
    currency: string,
    customer: CustomerInput
  ): Promise<CreatePaymentResult> {
    requireConfig();

    const res = await fetch(`${CASHFREE_BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": process.env.CASHFREE_CLIENT_ID!,
        "x-client-secret": process.env.CASHFREE_CLIENT_SECRET!,
        "x-api-version": "2023-08-01",
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: amount,
        order_currency: currency,
        customer_details: {
          customer_id: customer.userId ?? customer.email,
          customer_email: customer.email,
          customer_name: customer.name,
          // Cashfree requires a phone number; collect one in the checkout form
          // before going live, or pass a verified placeholder per their sandbox docs.
          customer_phone: "9999999999",
        },
        order_meta: {
          return_url: `${process.env.APP_BASE_URL}/checkout/return?order_id={order_id}&provider=cashfree`,
          notify_url: `${process.env.APP_BASE_URL}/api/payments/cashfree/webhook`,
        },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Cashfree order creation failed: ${res.status} ${body}`);
    }

    const data = await res.json();
    return {
      providerPaymentId: data.cf_order_id ?? data.order_id,
      redirectUrl: data.payment_link ?? data.payments?.url,
    };
  }

  async verifyPayment(providerPaymentId: string): Promise<VerifyPaymentResult> {
    requireConfig();
    const res = await fetch(`${CASHFREE_BASE_URL}/orders/${providerPaymentId}`, {
      headers: {
        "x-client-id": process.env.CASHFREE_CLIENT_ID!,
        "x-client-secret": process.env.CASHFREE_CLIENT_SECRET!,
        "x-api-version": "2023-08-01",
      },
    });
    if (!res.ok) throw new Error(`Cashfree order lookup failed: ${res.status}`);
    const data = await res.json();
    const status: VerifyPaymentResult["status"] =
      data.order_status === "PAID" ? "paid" : data.order_status === "ACTIVE" ? "pending" : "failed";
    return {
      verified: status === "paid",
      status,
      providerPaymentId,
      amount: data.order_amount,
      currency: data.order_currency,
    };
  }

  // Cashfree PG orders settle immediately on success; no separate capture step.
  async capturePayment(providerPaymentId: string): Promise<VerifyPaymentResult> {
    return this.verifyPayment(providerPaymentId);
  }

  async refundPayment(providerPaymentId: string, amount?: number): Promise<{ refundId: string }> {
    requireConfig();
    const res = await fetch(`${CASHFREE_BASE_URL}/orders/${providerPaymentId}/refunds`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": process.env.CASHFREE_CLIENT_ID!,
        "x-client-secret": process.env.CASHFREE_CLIENT_SECRET!,
        "x-api-version": "2023-08-01",
      },
      body: JSON.stringify({
        refund_amount: amount,
        refund_id: `refund_${providerPaymentId}_${Date.now()}`,
      }),
    });
    if (!res.ok) throw new Error(`Cashfree refund failed: ${res.status}`);
    const data = await res.json();
    return { refundId: data.refund_id };
  }

  async handleWebhook(
    rawBody: string,
    signatureHeader: string | null,
    extraHeaders?: Record<string, string | null>
  ): Promise<WebhookHandleResult> {
    if (!process.env.CASHFREE_WEBHOOK_SECRET) {
      throw new PaymentConfigurationError("Cashfree", ["CASHFREE_WEBHOOK_SECRET"]);
    }
    const timestamp = extraHeaders?.["x-webhook-timestamp"];
    if (!signatureHeader || !timestamp) {
      return { valid: false, eventType: "unknown", eventId: "" };
    }

    // Cashfree signs: base64(HMAC_SHA256(timestamp + rawBody, webhookSecret))
    const expected = crypto
      .createHmac("sha256", process.env.CASHFREE_WEBHOOK_SECRET)
      .update(timestamp + rawBody)
      .digest("base64");

    const expectedBuf = Buffer.from(expected);
    const receivedBuf = Buffer.from(signatureHeader);
    // timingSafeEqual throws on mismatched length rather than returning
    // false, so check length first — this is not a timing side-channel
    // concern, since signatures of the wrong length are always invalid
    // regardless of content.
    const valid =
      expectedBuf.length === receivedBuf.length && crypto.timingSafeEqual(expectedBuf, receivedBuf);

    if (!valid) return { valid: false, eventType: "unknown", eventId: "" };

    const payload = JSON.parse(rawBody);
    const status =
      payload.data?.payment?.payment_status === "SUCCESS"
        ? "paid"
        : payload.data?.payment?.payment_status === "FAILED"
        ? "failed"
        : undefined;

    return {
      valid: true,
      eventType: payload.type ?? "PAYMENT_EVENT",
      orderId: payload.data?.order?.order_id,
      providerPaymentId: payload.data?.order?.cf_order_id,
      status,
      amount: payload.data?.payment?.payment_amount,
      currency: payload.data?.payment?.payment_currency,
      eventId: payload.data?.payment?.cf_payment_id ?? crypto.randomUUID(),
    };
  }
}
