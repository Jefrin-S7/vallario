"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Heart, ShoppingBag } from "lucide-react";
import { Product, accentHex } from "@/lib/data/products";
import { useCart } from "@/lib/cart-context";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const discount = product.compareAtPrice
    ? Math.round(100 - (product.price / product.compareAtPrice) * 100)
    : null;

  return (
    <div className="group relative rounded-2xl border border-black/10 bg-white overflow-hidden transition-shadow hover:shadow-[0_20px_45px_-20px_rgba(10,10,13,0.35)]">
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-[4/5] bg-ivory-2 overflow-hidden"
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 320px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.bestseller && <Badge color={accentHex.gold}>Bestseller</Badge>}
          {product.newArrival && <Badge color={accentHex.emerald}>New</Badge>}
          {discount && <Badge color={accentHex.crimson}>-{discount}%</Badge>}
        </div>
        <button
          aria-label="Add to wishlist"
          onClick={(e) => e.preventDefault()}
          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Heart size={15} />
        </button>
      </Link>

      <div className="p-4">
        <p
          className="v-eyebrow mb-1.5"
          style={{ color: accentHex[product.accent] }}
        >
          {product.category}
        </p>
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-display font-semibold text-[15px] leading-snug line-clamp-2 mb-1.5">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1 text-xs text-ink/60 mb-3">
          <Star size={13} fill="currentColor" className="text-gold" />
          <span>{product.rating}</span>
          <span>·</span>
          <span>{product.salesCount} sold</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-display font-bold">${product.price}</span>
            {product.compareAtPrice && (
              <span className="text-xs line-through text-ink/40">
                ${product.compareAtPrice}
              </span>
            )}
          </div>
          <button
            onClick={() => addItem(product.id)}
            aria-label={`Add ${product.name} to cart`}
            className="h-9 w-9 rounded-full bg-ink text-white flex items-center justify-center hover:bg-violet transition-colors"
          >
            <ShoppingBag size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span
      className="v-eyebrow px-2 py-1 rounded-full text-white text-[10px]"
      style={{ backgroundColor: color }}
    >
      {children}
    </span>
  );
}
