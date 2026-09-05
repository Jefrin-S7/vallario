"use client";

import { useRouter } from "next/navigation";
import { ShoppingBag, Zap } from "lucide-react";
import { Product } from "@/lib/data/products";
import { useCart } from "@/lib/cart-context";

export default function AddToCartBar({ product }: { product: Product }) {
  const { addItem } = useCart();
  const router = useRouter();

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <button
        onClick={() => addItem(product.id)}
        className="v-btn v-btn-ghost border-black/15 flex-1"
      >
        <ShoppingBag size={16} /> Add to Cart
      </button>
      <button
        onClick={() => {
          addItem(product.id);
          router.push("/checkout");
        }}
        className="v-btn v-btn-primary flex-1"
      >
        <Zap size={16} /> Buy Now
      </button>
    </div>
  );
}
