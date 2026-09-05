import Link from "next/link";
import { RotateCcw, AlertTriangle, CheckCircle, HelpCircle, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Refund Policy",
  description:
    "Review VALLARIO's digital goods refund policy, eligible refund criteria, resolution procedures, and request steps.",
};

export default function RefundPolicyPage() {
  return (
    <article className="v-card p-6 md:p-10 bg-white shadow-sm border border-black/5 text-ink space-y-8">
      {/* Header */}
      <div className="border-b border-black/10 pb-6">
        <div className="flex items-center gap-2 text-crimson font-display font-semibold text-xs tracking-wider uppercase mb-1">
          <RotateCcw size={15} /> Customer Guarantee &amp; Policy
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
          Refund Policy
        </h1>
        <p className="text-xs text-steel mt-2">
          Last Updated: August 29, 2026 • Digital Goods Standard
        </p>
      </div>

      {/* Summary Box */}
      <div className="bg-ivory-2 rounded-2xl p-5 border border-black/5">
        <h3 className="font-display font-semibold text-sm text-ink mb-2">
          Quick Overview of Our Refund Policy
        </h3>
        <p className="text-xs text-ink/75 leading-relaxed mb-3">
          Due to the instant access and non-tangible nature of downloadable digital goods (JSON automation workflows, video libraries, PDF guides, and design templates), <strong>all sales are final once files are downloaded or accessed in your dashboard</strong>, with explicit exceptions for technical defects, duplicate charges, or unfulfilled orders.
        </p>
        <div className="flex flex-wrap gap-4 text-xs font-medium text-ink">
          <span className="inline-flex items-center gap-1.5 text-emerald">
            <CheckCircle size={14} /> 14-Day Resolution Window
          </span>
          <span className="inline-flex items-center gap-1.5 text-violet">
            <HelpCircle size={14} /> 24-Hour Support Response
          </span>
        </div>
      </div>

      {/* Section 1 */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-bold text-ink">
          1. The Nature of Digital Deliverables
        </h2>
        <p className="text-sm text-ink/75 leading-relaxed">
          Unlike physical goods, digital assets—including our 15,000+ n8n workflows, 10K+ Reels video files, 1,000+ course videos, and Canva/Notion starter kits—are delivered instantly upon payment confirmation via our secure download signing service.
        </p>
        <p className="text-sm text-ink/75 leading-relaxed">
          Because digital files cannot be physically returned or revoked from local storage once downloaded, we maintain clear standards to balance fair buyer protection with intellectual property security.
        </p>
      </section>

      {/* Section 2 */}
      <section className="space-y-4">
        <h2 className="font-display text-lg font-bold text-ink">
          2. Circumstances Eligible for a Refund
        </h2>
        <p className="text-sm text-ink/75 leading-relaxed">
          You are eligible for a full refund or transaction reversal within <strong>14 days of purchase</strong> under the following conditions:
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-emerald/5 border border-emerald/20 space-y-1.5">
            <p className="font-semibold text-xs text-emerald font-display flex items-center gap-1.5">
              <CheckCircle size={15} /> Duplicate Charges
            </p>
            <p className="text-xs text-ink/75 leading-relaxed">
              If an accidental double billing occurred due to gateway latency or duplicate checkout clicks, the duplicate charge will be refunded immediately.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald/5 border border-emerald/20 space-y-1.5">
            <p className="font-semibold text-xs text-emerald font-display flex items-center gap-1.5">
              <CheckCircle size={15} /> Unfulfilled Delivery
            </p>
            <p className="text-xs text-ink/75 leading-relaxed">
              If your payment succeeded but our automated entitlement engine failed to provision access and our support team is unable to resolve the delivery within 48 hours.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald/5 border border-emerald/20 space-y-1.5">
            <p className="font-semibold text-xs text-emerald font-display flex items-center gap-1.5">
              <CheckCircle size={15} /> Corrupted / Defective Files
            </p>
            <p className="text-xs text-ink/75 leading-relaxed">
              If a downloaded archive is demonstrably corrupt or broken, and our technical team cannot provide a working replacement file.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald/5 border border-emerald/20 space-y-1.5">
            <p className="font-semibold text-xs text-emerald font-display flex items-center gap-1.5">
              <CheckCircle size={15} /> Unauthorized Purchase
            </p>
            <p className="text-xs text-ink/75 leading-relaxed">
              If verified fraudulent activity occurred on your account before any product files were downloaded or accessed.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3 */}
      <section className="space-y-4">
        <h2 className="font-display text-lg font-bold text-ink">
          3. Situations Not Eligible for a Refund
        </h2>
        <p className="text-sm text-ink/75 leading-relaxed">
          Refunds will <strong>not</strong> be granted in the following scenarios:
        </p>

        <div className="space-y-2 text-sm text-ink/75">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-crimson/5 border border-crimson/15">
            <AlertTriangle size={16} className="text-crimson shrink-0 mt-0.5" />
            <span>
              <strong>Buyer&apos;s remorse or change of mind:</strong> Deciding you no longer need the product after downloading the files.
            </span>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-crimson/5 border border-crimson/15">
            <AlertTriangle size={16} className="text-crimson shrink-0 mt-0.5" />
            <span>
              <strong>Missing third-party tools or hardware requirements:</strong> Inability to use templates due to not having required external accounts (such as an n8n instance, OpenAI API keys, Notion account, Canva Pro, or adequate disk space for large bundles), where requirements are clearly listed in the product specifications.
            </span>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-crimson/5 border border-crimson/15">
            <AlertTriangle size={16} className="text-crimson shrink-0 mt-0.5" />
            <span>
              <strong>Subjective commercial performance:</strong> Templates, automations, and educational courses are tools. We do not guarantee specific income, subscriber counts, or business metrics.
            </span>
          </div>
        </div>
      </section>

      {/* Section 4 */}
      <section className="space-y-4">
        <h2 className="font-display text-lg font-bold text-ink">
          4. How to Request a Refund
        </h2>
        <p className="text-sm text-ink/75 leading-relaxed">
          If you meet the eligibility criteria outlined in Section 2, follow these simple steps:
        </p>

        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-ivory-2 border border-black/5">
            <div className="w-6 h-6 rounded-full bg-violet text-white text-xs font-bold flex items-center justify-center shrink-0">
              1
            </div>
            <div>
              <p className="text-xs font-semibold text-ink">Gather Order Details</p>
              <p className="text-xs text-steel">
                Find your Order ID (available in your{" "}
                <Link href="/dashboard?tab=orders" className="text-violet underline">
                  Orders Dashboard
                </Link>{" "}
                or confirmation receipt).
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-ivory-2 border border-black/5">
            <div className="w-6 h-6 rounded-full bg-violet text-white text-xs font-bold flex items-center justify-center shrink-0">
              2
            </div>
            <div>
              <p className="text-xs font-semibold text-ink">Submit a Support Ticket</p>
              <p className="text-xs text-steel">
                Visit our{" "}
                <Link href="/support" className="text-violet underline">
                  Support Portal
                </Link>{" "}
                or email{" "}
                <a href="mailto:support@vallario.com" className="text-violet underline">
                  support@vallario.com
                </a>{" "}
                with your Order ID and a brief description of the technical or billing issue.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-ivory-2 border border-black/5">
            <div className="w-6 h-6 rounded-full bg-violet text-white text-xs font-bold flex items-center justify-center shrink-0">
              3
            </div>
            <div>
              <p className="text-xs font-semibold text-ink">Fast Review &amp; Processing</p>
              <p className="text-xs text-steel">
                Our support team will review your case within 1 business day. Approved refunds are credited directly back to your original payment method (Cashfree or PayPal) within 5–7 business days depending on your bank.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5 */}
      <section className="p-5 rounded-2xl bg-violet/5 border border-violet/20 space-y-2">
        <h3 className="font-display font-semibold text-sm text-ink flex items-center gap-2">
          <HelpCircle size={16} className="text-violet" />
          Need assistance before requesting a refund?
        </h3>
        <p className="text-xs text-ink/70 leading-relaxed">
          Most workflow import errors or download timeouts can be resolved in minutes by our technical staff. We are happy to help you get your automation or library set up smoothly.
        </p>
        <div className="pt-1">
          <Link href="/support" className="v-btn v-btn-primary text-xs py-2">
            <span>Open Support Ticket</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </section>
    </article>
  );
}
