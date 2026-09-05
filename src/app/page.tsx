import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap, Infinity as InfinityIcon, Download } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { products, getFeaturedProducts, categories } from "@/lib/data/products";

export default function HomePage() {
  const featured = getFeaturedProducts();
  const mega = products.find((p) => p.slug === "vallario-digital-product-mega-bundle")!;

  return (
    <>
      {/* HERO */}
      <section className="relative bg-ink text-white overflow-hidden">
        <div
          className="pointer-events-none absolute -top-40 right-[-10%] h-[520px] w-[520px] rounded-full opacity-30 blur-[110px]"
          style={{ background: "radial-gradient(circle, var(--v-violet), transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute bottom-[-20%] left-[-10%] h-[420px] w-[420px] rounded-full opacity-20 blur-[110px]"
          style={{ background: "radial-gradient(circle, var(--v-gold), transparent 70%)" }}
        />
        <div className="v-container relative py-20 md:py-28 grid lg:grid-cols-[1.1fr_0.9fr] gap-14 items-center">
          <div>
            <p className="v-eyebrow text-violet-2 mb-5">Vallario Digital Catalog</p>
            <h1 className="font-display font-bold text-[2.6rem] leading-[1.05] sm:text-6xl md:text-[4.2rem]">
              Build. Automate.
              <br />
              Create. <span className="text-violet-2">Grow.</span>
            </h1>
            <p className="mt-6 max-w-md text-white/65 text-base md:text-lg">
              Premium digital products, AI resources, automation systems,
              templates and creator tools designed to help you move faster.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link href="/shop" className="v-btn v-btn-primary">
                Explore Products <ArrowRight size={16} />
              </Link>
              <Link
                href="/shop?category=Digital+Product+Bundles"
                className="v-btn v-btn-ghost text-white border-white/25"
              >
                Explore Mega Bundles
              </Link>
            </div>
            <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs text-white/60">
              <Feature icon={<ShieldCheck size={16} />} label="Secure checkout" />
              <Feature icon={<Zap size={16} />} label="Instant delivery" />
              <Feature icon={<InfinityIcon size={16} />} label="Lifetime access" />
              <Feature icon={<Download size={16} />} label="Secure downloads" />
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-violet/25 to-transparent blur-2xl" />
            <div className="relative v-float rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
              <Image
                src={mega.image}
                alt={mega.name}
                width={900}
                height={900}
                className="w-full h-auto object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED COLLECTION */}
      <section className="py-20 md:py-28 bg-ivory">
        <div className="v-container">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <p className="v-eyebrow text-violet mb-3">The Full Catalog</p>
              <h2 className="font-display font-bold text-3xl md:text-4xl">
                Everything You Need. In One Place.
              </h2>
            </div>
            <Link
              href="/shop"
              className="v-btn v-btn-ghost text-ink border-black/15 shrink-0"
            >
              View all products <ArrowRight size={15} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* MEGA BUNDLE SPOTLIGHT */}
      <section className="py-20 md:py-24 bg-ink text-white">
        <div className="v-container grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative order-2 lg:order-1">
            <div
              className="absolute -inset-6 rounded-[2rem] opacity-40 blur-3xl"
              style={{ background: "radial-gradient(circle, var(--v-gold), transparent 65%)" }}
            />
            <div className="relative rounded-[1.75rem] overflow-hidden border border-white/10">
              <Image
                src={mega.image}
                alt={mega.name}
                width={900}
                height={900}
                className="w-full h-auto"
              />
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <p className="v-eyebrow text-gold-2 mb-4">VALLARIO Mega Collections</p>
            <h2 className="font-display font-bold text-3xl md:text-[2.75rem] leading-tight">
              One purchase.
              <br />
              Every collection.
            </h2>
            <p className="mt-5 text-white/65 max-w-md">
              {mega.shortDescription}
            </p>
            <ul className="mt-7 space-y-2.5 text-sm text-white/75">
              {mega.whatsIncluded.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gold shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex items-center gap-4">
              <span className="font-display text-3xl font-bold">${mega.price}</span>
              <span className="text-white/40 line-through">${mega.compareAtPrice}</span>
              <Link href={`/products/${mega.slug}`} className="v-btn v-btn-light ml-2">
                View Bundle <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY GRID */}
      <section className="py-20 md:py-24 bg-ivory">
        <div className="v-container">
          <p className="v-eyebrow text-violet mb-3">Browse by Category</p>
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-10">
            Find your next tool.
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/shop?category=${encodeURIComponent(cat)}`}
                className="v-card p-6 hover:border-violet hover:shadow-lg transition-all group"
              >
                <span className="font-display font-semibold text-sm block group-hover:text-violet transition-colors">
                  {cat}
                </span>
                <span className="text-xs text-ink/50 mt-1 flex items-center gap-1">
                  Shop now <ArrowRight size={12} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST / HOW IT WORKS */}
      <section className="py-20 bg-white border-t border-black/5">
        <div className="v-container grid sm:grid-cols-3 gap-8 text-center sm:text-left">
          <Step
            n="01"
            title="Choose your product"
            desc="Browse the catalog and pick a single tool or a full mega bundle."
          />
          <Step
            n="02"
            title="Checkout securely"
            desc="Pay with Cashfree or PayPal — payments are verified server-side before delivery."
          />
          <Step
            n="03"
            title="Get instant access"
            desc="Your files unlock immediately in your VALLARIO dashboard, with secure download links."
          />
        </div>
      </section>
    </>
  );
}

function Feature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-violet-2">{icon}</span>
      <span>{label}</span>
    </div>
  );
}

function Step({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div>
      <span className="v-eyebrow text-violet">{n}</span>
      <h3 className="font-display font-bold text-lg mt-2 mb-1.5">{title}</h3>
      <p className="text-sm text-ink/60">{desc}</p>
    </div>
  );
}
