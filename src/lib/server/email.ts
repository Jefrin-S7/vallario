import "server-only";

// Thin email-sending wrapper. Swap `sendViaProvider` for a real transactional
// provider — Resend and Postmark both have generous free tiers (Resend:
// 3,000 emails/month free; Postmark: 100/month free) that fit a $0 deploy.

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
  // Example shape for Resend (https://resend.com), which has a free tier:
  //
  // await fetch("https://api.resend.com/emails", {
  //   method: "POST",
  //   headers: {
  //     Authorization: `Bearer ${process.env.EMAIL_PROVIDER_API_KEY}`,
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({
  //     from: process.env.EMAIL_FROM_ADDRESS,
  //     to: input.to,
  //     subject: subjectFor(input.template),
  //     html: renderTemplate(input.template, input.data),
  //   }),
  // });
  console.log(`[email] would send "${input.template}" to ${input.to}`, input.data);
  return { sent: true };
}
