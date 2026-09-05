import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, ShieldCheck, FileDown, Layers } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import AddToCartBar from "@/components/AddToCartBar";
import { getProductBySlug, getRelatedProducts, products, accentHex } from "@/lib/data/products";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const related = getRelatedProducts(slug);
  const discount = product.compareAtPrice
    ? Math.round(100 - (product.price / product.compareAtPrice) * 100)
    : null;

  return (
    <div className="v-container py-10 md:py-16">
      <nav className="text-xs text-ink/50 mb-8 flex items-center gap-1.5">
        <Link href="/">Home</Link> <span>/</span>
        <Link href="/shop">Shop</Link> <span>/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-12">
        <div>
          <div className="relative aspect-square rounded-2xl overflow-hidden border border-black/10 bg-ivory-2">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
            {discount && (
              <span
                className="absolute top-4 left-4 v-eyebrow text-white px-3 py-1.5 rounded-full text-[11px]"
                style={{ backgroundColor: accentHex.crimson }}
              >
                -{discount}% today
              </span>
            )}
          </div>
        </div>

        <div>
          <p className="v-eyebrow mb-2" style={{ color: accentHex[product.accent] }}>
            {product.category}
            {product.subcategory ? ` · ${product.subcategory}` : ""}
          </p>
          <h1 className="font-display font-bold text-3xl md:text-4xl leading-tight mb-3">
            {product.name}
          </h1>
          <div className="flex items-center gap-2 text-sm text-ink/60 mb-5">
            <Star size={15} fill="currentColor" className="text-gold" />
            <span className="font-medium text-ink">{product.rating}</span>
            <span>({product.reviewCount} reviews)</span>
            <span>·</span>
            <span>{product.salesCount} sold</span>
          </div>

          <p className="text-ink/70 mb-6 leading-relaxed">{product.shortDescription}</p>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="font-display font-bold text-3xl">${product.price}</span>
            {product.compareAtPrice && (
              <span className="text-lg line-through text-ink/40">
                ${product.compareAtPrice}
              </span>
            )}
            <span className="text-xs text-ink/50">{product.license} license</span>
          </div>

          <AddToCartBar product={product} />

          <div className="grid grid-cols-3 gap-3 mt-8 text-xs">
            <InfoPill icon={<ShieldCheck size={15} />} label="Secure delivery" />
            <InfoPill icon={<FileDown size={15} />} label={product.fileFormat} />
            <InfoPill icon={<Layers size={15} />} label={`v${product.version}`} />
          </div>

          <div className="mt-10">
            <h3 className="font-display font-semibold text-sm mb-3">What&apos;s included</h3>
            <ul className="space-y-2 text-sm text-ink/70">
              {product.whatsIncluded.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span
                    className="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: accentHex[product.accent] }}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* DETAILS */}
      <div className="mt-16 grid md:grid-cols-3 gap-6">
        <DetailCard title="Product Details">
          <dl className="text-sm space-y-2">
            <Row k="File format" v={product.fileFormat} />
            <Row k="File size" v={product.fileSize} />
            <Row k="License" v={product.license} />
            <Row k="Version" v={product.version} />
            <Row k="Last updated" v={product.updatedAt} />
          </dl>
        </DetailCard>
        <DetailCard title="Features">
          <ul className="text-sm space-y-2 text-ink/70">
            {product.features.map((f) => (
              <li key={f}>• {f}</li>
            ))}
          </ul>
        </DetailCard>
        <DetailCard title="How It Works">
          <ol className="text-sm space-y-2 text-ink/70 list-decimal list-inside">
            <li>Complete checkout with Cashfree or PayPal</li>
            <li>Payment is verified server-side</li>
            <li>Access unlocks instantly in your dashboard</li>
            <li>Download via secure, time-limited links</li>
          </ol>
        </DetailCard>
      </div>

      {/* RELATED */}
      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="font-display font-bold text-2xl mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-1.5 rounded-xl border border-black/10 py-3 px-2">
      <span className="text-violet">{icon}</span>
      <span className="text-ink/70 leading-tight">{label}</span>
    </div>
  );
}

function DetailCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="v-card p-6">
      <h3 className="font-display font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-black/5 pb-2">
      <dt className="text-ink/50">{k}</dt>
      <dd className="font-medium text-right">{v}</dd>
    </div>
  );
}
