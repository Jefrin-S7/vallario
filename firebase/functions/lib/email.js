"use strict";
// Thin email-sending wrapper. Swap `sendViaProvider` for a real transactional
// provider (Resend, SendGrid, Postmark, SES) — this file intentionally keeps
// the rest of the codebase decoupled from which one you pick.
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
async function sendEmail({ to, template, data }) {
    if (!process.env.EMAIL_PROVIDER_API_KEY) {
        console.warn(`[email] EMAIL_PROVIDER_API_KEY not set — skipping "${template}" to ${to} (dev/demo mode).`);
        return { sent: false, reason: "not_configured" };
    }
    return sendViaProvider({ to, template, data });
}
async function sendViaProvider(input) {
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
