"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Minus, Plus, Trash2, ArrowRight, Tag } from "lucide-react";
import { useCart } from "@/lib/cart-context";

export default function CartPage() {
  const { items, setQuantity, removeItem, subtotal } = useCart();
  const [coupon, setCoupon] = useState("");
  const [couponMsg, setCouponMsg] = useState<string | null>(null);

  function applyCoupon() {
    if (!coupon.trim()) return;
    // Coupons are validated server-side (see functions/src/coupons.ts).
    // This UI only reflects the result of that validation.
    setCouponMsg("Coupon codes are validated at checkout.");
  }

  if (items.length === 0) {
    return (
      <div className="v-container py-24 text-center">
        <h1 className="font-display font-bold text-2xl mb-2">Your cart is empty</h1>
        <p className="text-ink/60 mb-8">Browse the catalog to find your next tool.</p>
        <Link href="/shop" className="v-btn v-btn-primary inline-flex">
          Explore Products <ArrowRight size={15} />
        </Link>
      </div>
    );
  }

  return (
    <div className="v-container py-12 md:py-16">
      <h1 className="font-display font-bold text-3xl mb-8">Your Cart</h1>
      <div className="grid lg:grid-cols-[1fr_340px] gap-10">
        <div className="space-y-4">
          {items.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="v-card p-4 flex gap-4 items-center"
            >
              <div className="relative h-20 w-20 rounded-xl overflow-hidden shrink-0 bg-ivory-2">
                <Image src={product.image} alt={product.name} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/products/${product.slug}`} className="font-display font-semibold text-sm hover:text-violet line-clamp-1">
                  {product.name}
                </Link>
                <p className="text-xs text-ink/50 mt-1">{product.category}</p>
                <p className="font-display font-bold mt-1">${product.price}</p>
              </div>
              <div className="flex items-center gap-2 border border-black/10 rounded-full px-1">
                <button
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity(product.id, quantity - 1)}
                  className="h-7 w-7 flex items-center justify-center"
                >
                  <Minus size={13} />
                </button>
                <span className="text-sm w-4 text-center">{quantity}</span>
                <button
                  aria-label="Increase quantity"
                  onClick={() => setQuantity(product.id, quantity + 1)}
                  className="h-7 w-7 flex items-center justify-center"
                >
                  <Plus size={13} />
                </button>
              </div>
              <button
                aria-label={`Remove ${product.name}`}
                onClick={() => removeItem(product.id)}
                className="text-ink/40 hover:text-crimson transition-colors"
              >
                <Trash2 size={17} />
              </button>
            </div>
          ))}
        </div>

        <div className="v-card p-6 h-fit sticky top-24">
          <h2 className="font-display font-semibold mb-5">Order Summary</h2>
          <div className="flex gap-2 mb-4">
            <div className="flex-1 flex items-center gap-2 border border-black/15 rounded-full px-3">
              <Tag size={14} className="text-ink/40" />
              <input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="Coupon code"
                className="flex-1 py-2.5 text-sm outline-none bg-transparent"
              />
            </div>
            <button onClick={applyCoupon} className="v-btn v-btn-ghost border-black/15 px-4">
              Apply
            </button>
          </div>
          {couponMsg && <p className="text-xs text-ink/50 mb-4">{couponMsg}</p>}

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-ink/60">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink/60">Tax</span>
              <span>Calculated at checkout</span>
            </div>
          </div>
          <div className="flex justify-between font-display font-bold text-lg mt-4 pt-4 border-t border-black/10">
            <span>Total</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <Link href="/checkout" className="v-btn v-btn-primary w-full mt-6">
            Proceed to Checkout <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}
