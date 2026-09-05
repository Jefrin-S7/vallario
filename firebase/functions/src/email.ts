// Thin email-sending wrapper. Swap `sendViaProvider` for a real transactional
// provider (Resend, SendGrid, Postmark, SES) — this file intentionally keeps
// the rest of the codebase decoupled from which one you pick.

export type EmailTemplate =
  | "welcome"
  | "verification"
  | "password_reset"
  | "order_confirmation"
  | "payment_confirmation"
  | "digital_delivery"
  | "download_available"
  | "product_update"
  | "refund"
  | "security_alert"
  | "support_reply";

interface SendEmailInput {
  to: string;
  template: EmailTemplate;
  data: Record<string, unknown>;
}

export async function sendEmail({ to, template, data }: SendEmailInput) {
  if (!process.env.EMAIL_PROVIDER_API_KEY) {
    console.warn(
      `[email] EMAIL_PROVIDER_API_KEY not set — skipping "${template}" to ${to} (dev/demo mode).`
    );
    return { sent: false, reason: "not_configured" as const };
  }
  return sendViaProvider({ to, template, data });
}

async function sendViaProvider(input: SendEmailInput) {
  // Example shape for a provider call — fill in once EMAIL_PROVIDER_API_KEY
  // and EMAIL_FROM_ADDRESS are set in the Functions environment config.
  //
  // await fetch("https://api.your-provider.com/v1/send", {
  //   method: "POST",
  //   headers: { Authorization: `Bearer ${process.env.EMAIL_PROVIDER_API_KEY}` },
  //   body: JSON.stringify({ to: input.to, template: input.template, data: input.data }),
  // });
  console.log(`[email] would send "${input.template}" to ${input.to}`, input.data);
  return { sent: true };
}
