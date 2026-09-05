// PaymentProvider — the abstraction every payment gateway implements.
//
// Nothing in this file (or CashfreeProvider.ts / PaypalProvider.ts) ever runs
// on the client. It is only ever imported from server code: API routes under
// src/app/api/payments/**, or Cloud Functions in functions/src/payments/**.
//
// The golden rule: a client can request a payment and can be told a payment
// *looks* successful, but VALLARIO only grants an entitlement after this
// layer has independently verified the payment with the provider (a webhook,
// or a server-to-server verify call) — never from a redirect query string or
// a client-reported "success" flag alone.

export interface CartLineInput {
  productId: string;
  quantity: number;
}

export interface CustomerInput {
  email: string;
  name: string;
  userId?: string;
}

export interface CreatePaymentResult {
  /** Provider-side payment/order id, stored on our `payments` doc. */
  providerPaymentId: string;
  /** Where to send the browser to complete payment (hosted checkout / approval URL). */
  redirectUrl: string;
}

export interface VerifyPaymentResult {
  verified: boolean;
  status: "paid" | "pending" | "failed";
  providerPaymentId: string;
  amount: number;
  currency: string;
}

export interface WebhookHandleResult {
  /** True once we've confirmed the signature and parsed a known event. */
  valid: boolean;
  eventType: string;
  /** Our own order id (not the provider's internal payment/order id) — used to look up the Firestore order. */
  orderId?: string;
  providerPaymentId?: string;
  status?: "paid" | "failed" | "refunded";
  amount?: number;
  currency?: string;
  /** Idempotency key — dedupe against `webhookEvents` before acting on it. */
  eventId: string;
}

export abstract class PaymentProvider {
  abstract readonly name: "cashfree" | "paypal";

  /** Create a pending order/payment with the provider and return where to send the browser. */
  abstract createPayment(
    orderId: string,
    amount: number,
    currency: string,
    customer: CustomerInput
  ): Promise<CreatePaymentResult>;

  /** Server-to-server check of a payment's true status. Never trust the client for this. */
  abstract verifyPayment(providerPaymentId: string): Promise<VerifyPaymentResult>;

  /** Capture funds for providers with an authorize/capture split (e.g. PayPal orders). */
  abstract capturePayment(providerPaymentId: string): Promise<VerifyPaymentResult>;

  /** Issue a refund for a previously captured payment. */
  abstract refundPayment(providerPaymentId: string, amount?: number): Promise<{ refundId: string }>;

  /**
   * Verify a webhook signature and parse it into a normalized event.
   * Reject (return `valid: false`) if the signature fails. `extraHeaders`
   * carries provider-specific headers the signature covers beyond the body
   * — e.g. Cashfree includes a timestamp in its HMAC input.
   */
  abstract handleWebhook(
    rawBody: string,
    signatureHeader: string | null,
    extraHeaders?: Record<string, string | null>
  ): Promise<WebhookHandleResult>;
}

export class PaymentConfigurationError extends Error {
  constructor(provider: string, missing: string[]) {
    super(
      `${provider} is not configured. Missing environment variables: ${missing.join(", ")}. ` +
        `See .env.example.`
    );
    this.name = "PaymentConfigurationError";
  }
}
