"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { onAuthStateChanged, type User } from "firebase/auth";
import { ShieldCheck, Loader2, LogIn } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { auth, isFirebaseConfigured } from "@/lib/firebase/client";

type Provider = "cashfree" | "paypal";

export default function CheckoutPage() {
  const { items, subtotal } = useCart();
  const [provider, setProvider] = useState<Provider>("cashfree");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ email: "", name: "" });
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(!isFirebaseConfigured || !auth);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) return;
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthChecked(true);
      if (u?.email) setForm((f) => ({ ...f, email: u.email ?? "", name: u.displayName ?? f.name }));
    });
    return unsubscribe;
  }, []);

  if (items.length === 0) {
    return (
      <div className="v-container py-24 text-center">
        <h1 className="font-display font-bold text-2xl mb-3">Nothing to check out</h1>
        <Link href="/shop" className="v-btn v-btn-primary inline-flex">
          Browse products
        </Link>
      </div>
    );
  }

  // A real purchase always needs a signed-in Firebase user, because
  // entitlements are keyed by uid — this is the same posture the API routes
  // enforce server-side, surfaced here so the person isn't surprised by a
  // 401 after filling out the whole form.
  if (isFirebaseConfigured && authChecked && !user) {
    return (
      <div className="v-container py-24 text-center max-w-md">
        <div className="w-12 h-12 rounded-full bg-violet/10 text-violet flex items-center justify-center mx-auto mb-5">
          <LogIn size={20} />
        </div>
        <h1 className="font-display font-bold text-2xl mb-2">Sign in to check out</h1>
        <p className="text-steel text-sm mb-6">
          Purchases are tied to your VALLARIO account so your downloads and licenses show up in
          your dashboard.
        </p>
        <Link href="/login?redirect=/checkout" className="v-btn v-btn-primary inline-flex">
          Sign in to continue
        </Link>
      </div>
    );
  }

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (isFirebaseConfigured && auth?.currentUser) {
        headers.Authorization = `Bearer ${await auth.currentUser.getIdToken()}`;
      }

      const res = await fetch(`/api/payments/${provider}/create`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
          customer: form,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Payment could not be started.");
      } else if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    } catch {
      setError("Something went wrong starting the payment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="v-container py-12 md:py-16">
      <h1 className="font-display font-bold text-3xl mb-8">Checkout</h1>
      <div className="grid lg:grid-cols-[1fr_380px] gap-10">
        <form onSubmit={handlePay} className="space-y-8">
          <section className="v-card p-6">
            <h2 className="font-display font-semibold mb-4">Contact</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                required
                placeholder="Full name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="border border-black/15 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-violet"
              />
              <input
                required
                type="email"
                placeholder="Email address"
                value={form.email}
                disabled={Boolean(user?.email)}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="border border-black/15 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-violet disabled:bg-ivory-2 disabled:text-steel"
              />
            </div>
            <p className="text-xs text-ink/50 mt-2">
              {user?.email
                ? "Your download links and license keys are sent to your account email."
                : "Your download links and license keys are sent to this email."}
            </p>
          </section>

          <section className="v-card p-6">
            <h2 className="font-display font-semibold mb-4">Payment Method</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <ProviderOption
                id="cashfree"
                label="Cashfree"
                sub="Cards, UPI, netbanking"
                active={provider === "cashfree"}
                onSelect={() => setProvider("cashfree")}
              />
              <ProviderOption
                id="paypal"
                label="PayPal"
                sub="PayPal balance & cards"
                active={provider === "paypal"}
                onSelect={() => setProvider("paypal")}
              />
            </div>
            <p className="text-xs text-ink/50 mt-4 flex items-center gap-1.5">
              <ShieldCheck size={13} /> Payments are verified server-side before any
              product is unlocked — nothing ships on a client-side success signal.
            </p>
          </section>

          {error && (
            <div className="rounded-lg border border-crimson/30 bg-crimson/5 text-crimson text-sm px-4 py-3">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="v-btn v-btn-primary w-full">
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Starting payment…
              </>
            ) : (
              `Pay $${subtotal.toFixed(2)} with ${provider === "cashfree" ? "Cashfree" : "PayPal"}`
            )}
          </button>
        </form>

        <div className="v-card p-6 h-fit">
          <h2 className="font-display font-semibold mb-4">Order Summary</h2>
          <div className="space-y-3">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex gap-3 items-center">
                <div className="relative h-12 w-12 rounded-lg overflow-hidden shrink-0 bg-ivory-2">
                  <Image src={product.image} alt={product.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                  <p className="text-xs text-ink/50">Qty {quantity}</p>
                </div>
                <span className="text-sm font-medium">${(product.price * quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-display font-bold text-lg mt-5 pt-4 border-t border-black/10">
            <span>Total</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProviderOption({
  label,
  sub,
  active,
  onSelect,
}: {
  id: Provider;
  label: string;
  sub: string;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`text-left rounded-xl border p-4 transition-colors ${
        active ? "border-violet bg-violet/5" : "border-black/15 hover:border-black/30"
      }`}
    >
      <span className="font-display font-semibold text-sm block">{label}</span>
      <span className="text-xs text-ink/50">{sub}</span>
    </button>
  );
}
