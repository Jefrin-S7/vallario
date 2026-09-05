import Link from "next/link";
import { LifeBuoy, Mail, MessageCircle, ChevronLeft } from "lucide-react";

// Ticket submission is a visual reference here — wiring it up means a
// server action that writes to `supportTickets/{id}` with
// { uid, status: "open", ... } via the Admin SDK, matching the shape
// firestore.rules already allows a signed-in customer to create.
const faqs = [
  {
    q: "How do I access my downloads after purchase?",
    a: "Go to your Dashboard → Downloads. Each entitlement has its own signed download link that's generated fresh each time and expires after 15 minutes for security.",
  },
  {
    q: "What if my download link expires before I use it?",
    a: "Just go back to your Dashboard and request the download again — it doesn't count against your download limit unless the file actually starts transferring.",
  },
  {
    q: "Can I use these products commercially?",
    a: "License terms vary by product and are listed on each product page under \"License.\" Check the specific product before commercial use.",
  },
  {
    q: "I was charged but never got the product. What happened?",
    a: "This can happen if the payment webhook hasn't been processed yet — usually resolves within a few minutes. If it's been longer, open a ticket below with your order ID.",
  },
];

export default function SupportPage() {
  return (
    <div className="bg-ivory-2 min-h-screen">
      <div className="v-container py-10 max-w-3xl">
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-steel hover:text-ink mb-6">
          <ChevronLeft size={15} /> Back to dashboard
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-violet/10 text-violet flex items-center justify-center">
            <LifeBuoy size={18} />
          </div>
          <h1 className="font-display text-2xl font-bold">Support</h1>
        </div>
        <p className="text-steel text-sm mb-8">
          Check the FAQ below, or open a ticket and we&rsquo;ll get back to you.
        </p>

        <div className="bg-white rounded-2xl border border-black/5 p-6 mb-8">
          <h2 className="font-display font-bold mb-4">Frequently asked</h2>
          <div className="divide-y divide-black/5">
            {faqs.map((f) => (
              <details key={f.q} className="group py-3">
                <summary className="cursor-pointer text-sm font-medium list-none flex items-center justify-between">
                  {f.q}
                  <span className="text-steel group-open:rotate-45 transition-transform text-lg leading-none">+</span>
                </summary>
                <p className="text-sm text-steel mt-2 pr-6">{f.a}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-black/5 p-6">
          <h2 className="font-display font-bold mb-1">Open a ticket</h2>
          <p className="text-xs text-steel mb-4">
            We typically respond within one business day.
          </p>
          <form className="space-y-4">
            <label className="block text-sm">
              <span className="text-xs font-medium text-steel">Order ID (if applicable)</span>
              <input placeholder="ord_8841" className="v-input mt-1" />
            </label>
            <label className="block text-sm">
              <span className="text-xs font-medium text-steel">Subject</span>
              <input placeholder="What's this about?" className="v-input mt-1" required />
            </label>
            <label className="block text-sm">
              <span className="text-xs font-medium text-steel">Message</span>
              <textarea rows={4} placeholder="Tell us what's going on…" className="v-input mt-1 resize-none" required />
            </label>
            <button type="submit" className="v-btn v-btn-primary">
              <Mail size={15} /> Submit ticket
            </button>
          </form>
        </div>

        <div className="flex items-center gap-2 text-xs text-steel mt-6">
          <MessageCircle size={13} /> Prefer email? Reach us directly at support@vallario.com
        </div>
      </div>
    </div>
  );
}
