import Link from "next/link";
import { FileText, ShieldAlert } from "lucide-react";

export const metadata = {
  title: "Terms of Service",
  description:
    "Read the terms and conditions governing the use of VALLARIO website, customer accounts, and digital product purchases.",
};

export default function TermsOfServicePage() {
  return (
    <article className="v-card p-6 md:p-10 bg-white shadow-sm border border-black/5 text-ink space-y-8">
      {/* Header */}
      <div className="border-b border-black/10 pb-6">
        <div className="flex items-center gap-2 text-violet font-display font-semibold text-xs tracking-wider uppercase mb-1">
          <FileText size={15} /> Legal Agreement
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
          Terms of Service
        </h1>
        <p className="text-xs text-steel mt-2">
          Last Updated: August 29, 2026 • Version 2026.2
        </p>
      </div>

      {/* Summary Box */}
      <div className="bg-ivory-2 rounded-2xl p-5 border border-black/5">
        <h3 className="font-display font-semibold text-sm text-ink mb-2">
          Summary of Key Terms
        </h3>
        <ul className="text-xs text-ink/75 space-y-1.5 list-disc list-inside leading-relaxed">
          <li>
            VALLARIO provides digital goods, automation templates, courses, and creator assets delivered electronically.
          </li>
          <li>
            Purchases require a registered account so your license keys and entitlements can be securely provisioned.
          </li>
          <li>
            Payment is processed through Cashfree or PayPal. Payments are verified server-side before downloads are issued.
          </li>
          <li>
            Downloads are generated via secure, 15-minute time-limited signed URLs directly from your customer dashboard.
          </li>
          <li>
            Redistribution or unauthorized resale of raw product files is strictly prohibited unless covered under explicit PLR terms.
          </li>
        </ul>
      </div>

      {/* Section 1 */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-bold text-ink">
          1. Acceptance of Terms &amp; Eligibility
        </h2>
        <p className="text-sm text-ink/75 leading-relaxed">
          These Terms of Service (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you (&ldquo;Customer&rdquo;, &ldquo;User&rdquo;, or &ldquo;you&rdquo;) and VALLARIO (&ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;), governing your access to and use of the VALLARIO storefront, customer dashboard, API services, and digital products.
        </p>
        <p className="text-sm text-ink/75 leading-relaxed">
          By browsing our website, creating an account, or purchasing any digital products, you acknowledge that you have read, understood, and agree to be bound by these Terms and our{" "}
          <Link href="/legal/privacy" className="text-violet underline hover:text-violet-2">
            Privacy Policy
          </Link>
          . If you do not agree, you must immediately discontinue using our services.
        </p>
      </section>

      {/* Section 2 */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-bold text-ink">
          2. Customer Accounts &amp; Authentication
        </h2>
        <p className="text-sm text-ink/75 leading-relaxed">
          To purchase products and access your digital downloads, you must create a VALLARIO account authenticated via Firebase Authentication (email/password or Google OAuth). You agree to:
        </p>
        <ul className="text-sm text-ink/75 space-y-2 list-disc list-inside pl-2 leading-relaxed">
          <li>Provide accurate, current, and complete account information.</li>
          <li>Maintain the confidentiality of your login credentials.</li>
          <li>
            Accept sole responsibility for all activity occurring under your account.
          </li>
          <li>
            Promptly notify us at{" "}
            <a href="mailto:support@vallario.com" className="text-violet underline">
              support@vallario.com
            </a>{" "}
            if you suspect unauthorized access or security breaches.
          </li>
        </ul>
        <p className="text-sm text-ink/75 leading-relaxed">
          Account sharing, password pooling, or reselling access to your customer dashboard is strictly prohibited and constitutes grounds for immediate termination of your entitlements without refund.
        </p>
      </section>

      {/* Section 3 */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-bold text-ink">
          3. Digital Catalog, Pricing &amp; Payments
        </h2>
        <p className="text-sm text-ink/75 leading-relaxed">
          VALLARIO offers digital products including but not limited to: AI agents, n8n automation workflow JSON files, video reels libraries, video courses, ebooks, Canva/Notion templates, and curated mega bundles.
        </p>
        <div className="space-y-2 text-sm text-ink/75 leading-relaxed">
          <p>
            <strong>Currency &amp; Price Integrity:</strong> All prices are displayed in USD (United States Dollars). Every order is verified and repriced from our trusted server-side catalog at the moment of checkout. Client-side price modifications are rejected.
          </p>
          <p>
            <strong>Payment Gateways:</strong> Payments are processed securely through certified third-party providers (Cashfree Payments and PayPal). By submitting payment details, you authorize our payment processors to charge the specified amount. VALLARIO never stores full credit card numbers or banking passwords on its servers.
          </p>
          <p>
            <strong>One-Time Payments:</strong> Unless explicitly noted otherwise, all catalog items are sold for a one-time fee with lifetime access to the purchased edition and applicable updates.
          </p>
        </div>
      </section>

      {/* Section 4 */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-bold text-ink">
          4. Delivery &amp; Download Security Model
        </h2>
        <p className="text-sm text-ink/75 leading-relaxed">
          All VALLARIO products are delivered electronically through your customer dashboard. Because our assets represent valuable intellectual property:
        </p>
        <ul className="text-sm text-ink/75 space-y-2 list-disc list-inside pl-2 leading-relaxed">
          <li>
            <strong>Signed Download URLs:</strong> Digital files are stored in protected storage buckets and are never accessible via permanent public URLs. Each download request generates an authenticated, time-limited signed URL that expires after 15 minutes.
          </li>
          <li>
            <strong>Entitlement Verification:</strong> Download links are issued only after server-side validation of active payment webhook events and entitlement records.
          </li>
          <li>
            <strong>Fair Use Download Limits:</strong> Entitlements carry generous download limits to prevent automated bulk extraction and hotlinking. If you exhaust your download quota due to hardware loss or reinstallation, contact support for a complimentary quota reset.
          </li>
        </ul>
      </section>

      {/* Section 5 */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-bold text-ink">
          5. Intellectual Property &amp; Licensing
        </h2>
        <p className="text-sm text-ink/75 leading-relaxed">
          All digital content, source files, graphic assets, trademarks, branding, copy, and code provided on VALLARIO are proprietary to VALLARIO or licensed from their respective creators.
        </p>
        <p className="text-sm text-ink/75 leading-relaxed">
          Purchasing a product grants you a non-exclusive, non-transferable license to use the product in accordance with our{" "}
          <Link href="/legal/license" className="text-violet underline hover:text-violet-2 font-medium">
            License Agreement
          </Link>
          . You do not acquire copyright or ownership of the underlying source files, except where designated under specific Private Label Rights (PLR).
        </p>
      </section>

      {/* Section 6 */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-bold text-ink">
          6. Prohibited Activities
        </h2>
        <p className="text-sm text-ink/75 leading-relaxed">
          You agree not to engage in any of the following prohibited actions:
        </p>
        <div className="grid gap-2 text-sm text-ink/75">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-ivory-2 border border-black/5">
            <ShieldAlert size={16} className="text-crimson shrink-0 mt-0.5" />
            <span>
              Redistributing, sublicensing, reselling, or uploading raw product files (including n8n JSON files, video footage, or course videos) to file-sharing networks, torrent sites, or competing marketplaces.
            </span>
          </div>
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-ivory-2 border border-black/5">
            <ShieldAlert size={16} className="text-crimson shrink-0 mt-0.5" />
            <span>
              Attempting to bypass server-side token authentication, scrape API endpoints, exploit download signed URLs, or attack infrastructure.
            </span>
          </div>
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-ivory-2 border border-black/5">
            <ShieldAlert size={16} className="text-crimson shrink-0 mt-0.5" />
            <span>
              Filing fraudulent chargebacks or payment disputes without first contacting support to resolve technical or delivery issues.
            </span>
          </div>
        </div>
      </section>

      {/* Section 7 */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-bold text-ink">
          7. Third-Party Integrations &amp; Software Requirements
        </h2>
        <p className="text-sm text-ink/75 leading-relaxed">
          Certain products (such as our 15,000+ AI Agents &amp; n8n Workflows) are designed to integrate with third-party software (e.g. n8n, OpenAI, Google Cloud, HubSpot, Airtable, Notion, Canva, Shopify).
        </p>
        <p className="text-sm text-ink/75 leading-relaxed">
          You acknowledge that you are responsible for maintaining your own licenses, API keys, and subscriptions for any required third-party tools. VALLARIO is not responsible for API price adjustments, rate limits, or platform changes enacted by external providers.
        </p>
      </section>

      {/* Section 8 */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-bold text-ink">
          8. Disclaimers of Warranties
        </h2>
        <p className="text-sm text-ink/75 leading-relaxed">
          VALLARIO PRODUCTS AND SERVICES ARE PROVIDED ON AN &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT GUARANTEE THAT AUTOMATION WORKFLOWS OR EDUCATIONAL MATERIALS WILL PRODUCE SPECIFIC FINANCIAL EARNINGS, REVENUE, BUSINESS GROWTH, OR ALGORITHMIC REACH. YOUR RESULTS DEPEND ON YOUR OWN EXECUTION, MARKET CONDITIONS, AND TECHNICAL PROFICIENCY.
        </p>
      </section>

      {/* Section 9 */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-bold text-ink">
          9. Limitation of Liability
        </h2>
        <p className="text-sm text-ink/75 leading-relaxed">
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL VALLARIO, ITS DIRECTORS, EMPLOYEES, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL, OR PUNITIVE DAMAGES ARISING FROM THE USE OF OR INABILITY TO USE OUR PRODUCTS. OUR MAXIMUM TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT PAID BY YOU FOR THE SPECIFIC PRODUCT GIVING RISE TO THE CLAIM.
        </p>
      </section>

      {/* Section 10 */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-bold text-ink">
          10. Contact &amp; Notices
        </h2>
        <p className="text-sm text-ink/75 leading-relaxed">
          For legal inquiries, formal notices, or questions concerning these Terms, please contact our compliance team:
        </p>
        <div className="p-4 rounded-xl bg-ivory-2 border border-black/5 text-sm space-y-1">
          <p className="font-semibold text-ink">VALLARIO Legal Department</p>
          <p className="text-steel">
            Email:{" "}
            <a href="mailto:support@vallario.com" className="text-violet underline">
              support@vallario.com
            </a>
          </p>
          <p className="text-steel">Support Portal: /support</p>
        </div>
      </section>
    </article>
  );
}
