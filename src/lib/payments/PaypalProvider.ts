import crypto from "crypto";
import {
  PaymentProvider,
  PaymentConfigurationError,
  CreatePaymentResult,
  VerifyPaymentResult,
  WebhookHandleResult,
  CustomerInput,
} from "./PaymentProvider";

const PAYPAL_BASE_URL =
  process.env.PAYPAL_ENV === "production"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

function requireConfig() {
  const missing: string[] = [];
  if (!process.env.PAYPAL_CLIENT_ID) missing.push("PAYPAL_CLIENT_ID");
  if (!process.env.PAYPAL_CLIENT_SECRET) missing.push("PAYPAL_CLIENT_SECRET");
  if (missing.length) throw new PaymentConfigurationError("PayPal", missing);
}

async function getAccessToken(): Promise<string> {
  requireConfig();
  const basic = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`PayPal auth failed: ${res.status}`);
  const data = await res.json();
  return data.access_token;
}

export class PaypalProvider extends PaymentProvider {
  readonly name = "paypal" as const;

  async createPayment(
    orderId: string,
    amount: number,
    currency: string,
    _customer: CustomerInput
  ): Promise<CreatePaymentResult> {
    const token = await getAccessToken();

    const res = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "PayPal-Request-Id": orderId, // idempotency key
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: orderId,
            custom_id: orderId,
            amount: { currency_code: currency, value: amount.toFixed(2) },
          },
        ],
        application_context: {
          return_url: `${process.env.APP_BASE_URL}/checkout/return?order_id=${orderId}&provider=paypal`,
          cancel_url: `${process.env.APP_BASE_URL}/checkout`,
        },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`PayPal order creation failed: ${res.status} ${body}`);
    }

    const data = await res.json();
    const approveLink = data.links?.find((l: { rel: string }) => l.rel === "approve")?.href;

    return { providerPaymentId: data.id, redirectUrl: approveLink };
  }

  async verifyPayment(providerPaymentId: string): Promise<VerifyPaymentResult> {
    const token = await getAccessToken();
    const res = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${providerPaymentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`PayPal order lookup failed: ${res.status}`);
    const data = await res.json();
    const status: VerifyPaymentResult["status"] =
      data.status === "COMPLETED" ? "paid" : data.status === "APPROVED" ? "pending" : "failed";
    const unit = data.purchase_units?.[0];
    return {
      verified: status === "paid",
      status,
      providerPaymentId,
      amount: Number(unit?.amount?.value ?? 0),
      currency: unit?.amount?.currency_code ?? "USD",
    };
  }

  async capturePayment(providerPaymentId: string): Promise<VerifyPaymentResult> {
    const token = await getAccessToken();
    const res = await fetch(
      `${PAYPAL_BASE_URL}/v2/checkout/orders/${providerPaymentId}/capture`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      }
    );
    if (!res.ok) throw new Error(`PayPal capture failed: ${res.status}`);
    const data = await res.json();
    const capture = data.purchase_units?.[0]?.payments?.captures?.[0];
    return {
      verified: data.status === "COMPLETED",
      status: data.status === "COMPLETED" ? "paid" : "failed",
      providerPaymentId,
      amount: Number(capture?.amount?.value ?? 0),
      currency: capture?.amount?.currency_code ?? "USD",
    };
  }

  async refundPayment(captureId: string, amount?: number): Promise<{ refundId: string }> {
    const token = await getAccessToken();
    const res = await fetch(`${PAYPAL_BASE_URL}/v2/payments/captures/${captureId}/refund`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: amount ? JSON.stringify({ amount: { value: amount.toFixed(2), currency_code: "USD" } }) : undefined,
    });
    if (!res.ok) throw new Error(`PayPal refund failed: ${res.status}`);
    const data = await res.json();
    return { refundId: data.id };
  }

  async handleWebhook(
    rawBody: string,
    _signatureHeader: string | null,
    extraHeaders?: Record<string, string | null>
  ): Promise<WebhookHandleResult> {
    if (!process.env.PAYPAL_WEBHOOK_ID) {
      throw new PaymentConfigurationError("PayPal", ["PAYPAL_WEBHOOK_ID"]);
    }

    const transmissionId = extraHeaders?.["paypal-transmission-id"];
    const transmissionTime = extraHeaders?.["paypal-transmission-time"];
    const certUrl = extraHeaders?.["paypal-cert-url"];
    const authAlgo = extraHeaders?.["paypal-auth-algo"];
    const transmissionSig = extraHeaders?.["paypal-transmission-sig"];

    if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) {
      return { valid: false, eventType: "unknown", eventId: "" };
    }

    const token = await getAccessToken();
    const verifyRes = await fetch(`${PAYPAL_BASE_URL}/v1/notifications/verify-webhook-signature`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        transmission_id: transmissionId,
        transmission_time: transmissionTime,
        cert_url: certUrl,
        auth_algo: authAlgo,
        transmission_sig: transmissionSig,
        webhook_id: process.env.PAYPAL_WEBHOOK_ID,
        webhook_event: JSON.parse(rawBody),
      }),
    });

    if (!verifyRes.ok) {
      return { valid: false, eventType: "unknown", eventId: "" };
    }
    const verifyData = await verifyRes.json();
    if (verifyData.verification_status !== "SUCCESS") {
      return { valid: false, eventType: "unknown", eventId: "" };
    }

    const payload = JSON.parse(rawBody);
    const eventType: string = payload.event_type ?? "UNKNOWN";
    const status =
      eventType === "PAYMENT.CAPTURE.COMPLETED"
        ? "paid"
        : eventType === "PAYMENT.CAPTURE.DENIED"
        ? "failed"
        : eventType === "PAYMENT.CAPTURE.REFUNDED"
        ? "refunded"
        : undefined;

    return {
      valid: true,
      eventType,
      orderId: payload.resource?.custom_id,
      providerPaymentId: payload.resource?.id,
      status,
      amount: Number(payload.resource?.amount?.value ?? 0),
      currency: payload.resource?.amount?.currency_code,
      eventId: payload.id ?? crypto.randomUUID(),
    };
  }
}
