import { ShieldCheck, Lock, CheckCircle } from "lucide-react";

export const metadata = {
  title: "Privacy Policy",
  description:
    "Learn how VALLARIO collects, uses, protects, and handles your personal information, authentication tokens, and purchase records.",
};

export default function PrivacyPolicyPage() {
  return (
    <article className="v-card p-6 md:p-10 bg-white shadow-sm border border-black/5 text-ink space-y-8">
      {/* Header */}
      <div className="border-b border-black/10 pb-6">
        <div className="flex items-center gap-2 text-emerald font-display font-semibold text-xs tracking-wider uppercase mb-1">
          <ShieldCheck size={15} /> Data Protection &amp; Privacy
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
          Privacy Policy
        </h1>
        <p className="text-xs text-steel mt-2">
          Last Updated: August 29, 2026 • GDPR &amp; CCPA Compliant
        </p>
      </div>

      {/* Highlights Box */}
      <div className="bg-ivory-2 rounded-2xl p-5 border border-black/5">
        <h3 className="font-display font-semibold text-sm text-ink mb-2">
          Privacy Summary at a Glance
        </h3>
        <div className="grid sm:grid-cols-2 gap-3 text-xs text-ink/75">
          <div className="flex items-start gap-2">
            <CheckCircle size={14} className="text-emerald shrink-0 mt-0.5" />
            <span>We never sell or rent your personal data to third parties.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle size={14} className="text-emerald shrink-0 mt-0.5" />
            <span>Payment credentials are processed directly by Cashfree &amp; PayPal.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle size={14} className="text-emerald shrink-0 mt-0.5" />
            <span>Encrypted authentication via Google Firebase Auth.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle size={14} className="text-emerald shrink-0 mt-0.5" />
            <span>You have full rights to request data export or account deletion.</span>
          </div>
        </div>
      </div>

      {/* Section 1 */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-bold text-ink">
          1. Introduction
        </h2>
        <p className="text-sm text-ink/75 leading-relaxed">
          VALLARIO (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) respects your privacy and is committed to protecting the personal data of visitors, registered users, and customers of our digital product platform.
        </p>
        <p className="text-sm text-ink/75 leading-relaxed">
          This Privacy Policy explains what personal data we collect when you use our website, how we use it to fulfill your digital orders and grant product entitlements, how we secure it, and your legal rights under applicable privacy laws (including GDPR and CCPA).
        </p>
      </section>

      {/* Section 2 */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-bold text-ink">
          2. Information We Collect
        </h2>
        <p className="text-sm text-ink/75 leading-relaxed">
          We collect only the minimum information necessary to operate our store and deliver digital files:
        </p>
        <div className="space-y-3 text-sm text-ink/75">
          <div className="p-4 rounded-xl bg-ivory-2 border border-black/5 space-y-1">
            <p className="font-semibold text-ink">A. Account &amp; Identity Data</p>
            <p className="text-xs text-steel leading-relaxed">
              When you register or sign in with Firebase Auth (email/password or Google OAuth), we receive your email address, display name, and unique user ID (UID).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-ivory-2 border border-black/5 space-y-1">
            <p className="font-semibold text-ink">B. Transaction &amp; Entitlement Data</p>
            <p className="text-xs text-steel leading-relaxed">
              Records of purchased product IDs, order amounts, payment provider transaction identifiers, issuance dates, and entitlement statuses.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-ivory-2 border border-black/5 space-y-1">
            <p className="font-semibold text-ink">C. Security &amp; Download Audit Logs</p>
            <p className="text-xs text-steel leading-relaxed">
              When you request signed download links via our API, we log the user ID, timestamp, IP address, and browser User-Agent solely to verify entitlement integrity and prevent unauthorized distribution.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3 */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-bold text-ink flex items-center gap-2">
          <Lock size={18} className="text-emerald" />
          3. Payment Information We Do NOT Store
        </h2>
        <p className="text-sm text-ink/75 leading-relaxed">
          Your payment security is paramount. VALLARIO does <strong>NOT</strong> collect, view, or store sensitive payment credentials such as full 16-digit credit card numbers, expiration dates, CVVs, debit card PINs, or netbanking passwords.
        </p>
        <p className="text-sm text-ink/75 leading-relaxed">
          All financial transactions are conducted directly via PCI-DSS Level 1 compliant payment gateways:
        </p>
        <ul className="text-sm text-ink/75 space-y-1 list-disc list-inside pl-2 leading-relaxed">
          <li><strong>Cashfree Payments:</strong> For cards, UPI, netbanking, and domestic Indian transfers.</li>
          <li><strong>PayPal:</strong> For international cards, digital wallets, and PayPal balances.</li>
        </ul>
      </section>

      {/* Section 4 */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-bold text-ink">
          4. How We Use Your Data
        </h2>
        <p className="text-sm text-ink/75 leading-relaxed">
          We use collected information for the following legitimate business purposes:
        </p>
        <ul className="text-sm text-ink/75 space-y-2 list-disc list-inside pl-2 leading-relaxed">
          <li>To authenticate your session and maintain your customer dashboard.</li>
          <li>To provision your purchased digital entitlements and sign 15-minute expiring download links.</li>
          <li>To process payment webhooks with HMAC signature verification and avoid duplicate grants.</li>
          <li>To respond to customer support inquiries and order troubleshooting requests.</li>
          <li>To detect and prevent malicious activities, bot attacks, and fraudulent purchases.</li>
        </ul>
      </section>

      {/* Section 5 */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-bold text-ink">
          5. Third-Party Service Providers
        </h2>
        <p className="text-sm text-ink/75 leading-relaxed">
          We partner with vetted industry-standard service providers to host and secure our platform:
        </p>
        <div className="grid sm:grid-cols-2 gap-3 text-xs text-ink/80">
          <div className="p-3.5 rounded-xl border border-black/5 bg-ivory-2">
            <p className="font-semibold text-ink mb-1">Google Firebase / Cloud</p>
            <p className="text-steel">Authentication, Firestore database, and secure private Cloud Storage.</p>
          </div>
          <div className="p-3.5 rounded-xl border border-black/5 bg-ivory-2">
            <p className="font-semibold text-ink mb-1">Vercel</p>
            <p className="text-steel">Global content delivery network (CDN) and secure serverless API execution.</p>
          </div>
          <div className="p-3.5 rounded-xl border border-black/5 bg-ivory-2">
            <p className="font-semibold text-ink mb-1">Cashfree Payments</p>
            <p className="text-steel">PCI-compliant payment processing and webhook settlement.</p>
          </div>
          <div className="p-3.5 rounded-xl border border-black/5 bg-ivory-2">
            <p className="font-semibold text-ink mb-1">PayPal</p>
            <p className="text-steel">International payment gateway and buyer security verification.</p>
          </div>
        </div>
      </section>

      {/* Section 6 */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-bold text-ink">
          6. Cookies &amp; Local Storage
        </h2>
        <p className="text-sm text-ink/75 leading-relaxed">
          We use minimal cookies and browser local storage strictly required for platform operation:
        </p>
        <ul className="text-sm text-ink/75 space-y-1.5 list-disc list-inside pl-2 leading-relaxed">
          <li>
            <strong>Session &amp; Auth Tokens:</strong> Firebase Auth tokens to maintain your signed-in state.
          </li>
          <li>
            <strong>Cart State:</strong> Local storage to remember items placed in your shopping cart before checkout.
          </li>
        </ul>
      </section>

      {/* Section 7 */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-bold text-ink">
          7. Your Privacy Rights
        </h2>
        <p className="text-sm text-ink/75 leading-relaxed">
          Depending on your jurisdiction (such as under GDPR in the EU or CCPA in California), you have rights regarding your personal data:
        </p>
        <div className="space-y-2 text-sm text-ink/75">
          <p>• <strong>Right to Access:</strong> Request a copy of your stored account data and order history.</p>
          <p>• <strong>Right to Rectification:</strong> Request correction of inaccurate personal information.</p>
          <p>• <strong>Right to Erasure (&ldquo;Right to be Forgotten&rdquo;):</strong> Request deletion of your account and associated personal data, subject to legal record retention requirements for tax and accounting audits.</p>
        </div>
        <p className="text-sm text-ink/75 leading-relaxed">
          To exercise any of these rights, contact us at{" "}
          <a href="mailto:support@vallario.com" className="text-violet underline">
            support@vallario.com
          </a>
          . We respond to all verified privacy requests within 30 days.
        </p>
      </section>

      {/* Section 8 */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-bold text-ink">
          8. Contact Data Privacy
        </h2>
        <p className="text-sm text-ink/75 leading-relaxed">
          If you have questions regarding this Privacy Policy or our security architecture:
        </p>
        <div className="p-4 rounded-xl bg-ivory-2 border border-black/5 text-sm space-y-1">
          <p className="font-semibold text-ink">VALLARIO Privacy Team</p>
          <p className="text-steel">
            Email:{" "}
            <a href="mailto:support@vallario.com" className="text-violet underline">
              support@vallario.com
            </a>
          </p>
          <p className="text-steel">Help Center: /support</p>
        </div>
      </section>
    </article>
  );
}
