"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, Search } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { products, categories } from "@/lib/data/products";

const SORTS = [
  "Featured",
  "Newest",
  "Best Selling",
  "Price: Low to High",
  "Price: High to Low",
  "Highest Rated",
] as const;

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") ?? "";
  const initialQuery = searchParams.get("q") ?? "";

  const [category, setCategory] = useState(initialCategory);
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState<(typeof SORTS)[number]>("Featured");
  const [maxPrice, setMaxPrice] = useState(200);
  const [bestsellerOnly, setBestsellerOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = products.filter((p) => p.status === "active");
    if (category) list = list.filter((p) => p.category === category);
    if (bestsellerOnly) list = list.filter((p) => p.bestseller);
    list = list.filter((p) => p.price <= maxPrice);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    switch (sort) {
      case "Newest":
        list = [...list].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
        break;
      case "Best Selling":
        list = [...list].sort((a, b) => b.salesCount - a.salesCount);
        break;
      case "Price: Low to High":
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case "Price: High to Low":
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case "Highest Rated":
        list = [...list].sort((a, b) => b.rating - a.rating);
        break;
      default:
        list = [...list].sort((a, b) => Number(b.featured) - Number(a.featured));
    }
    return list;
  }, [category, sort, maxPrice, bestsellerOnly, query]);

  return (
    <div className="v-container py-12 md:py-16">
      <div className="mb-10">
        <p className="v-eyebrow text-violet mb-2">Shop</p>
        <h1 className="font-display font-bold text-3xl md:text-4xl">
          The VALLARIO Catalog
        </h1>
        <p className="text-ink/60 mt-2">{filtered.length} products</p>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-steel" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products, categories, tags…"
          className="v-input pl-10"
          aria-label="Search products"
        />
      </div>

      <button
        onClick={() => setFiltersOpen(true)}
        className="v-btn v-btn-ghost border-black/15 mb-6 lg:hidden"
      >
        <SlidersHorizontal size={15} /> Filters
      </button>

      <div className="grid lg:grid-cols-[240px_1fr] gap-10">
        <aside
          className={`lg:block ${
            filtersOpen
              ? "fixed inset-0 z-50 bg-ivory p-6 overflow-y-auto"
              : "hidden"
          }`}
        >
          {filtersOpen && (
            <button
              onClick={() => setFiltersOpen(false)}
              className="lg:hidden mb-6 h-9 w-9 rounded-full border border-black/10 flex items-center justify-center"
            >
              <X size={16} />
            </button>
          )}
          <FilterBlock title="Category">
            <button
              onClick={() => setCategory("")}
              className={`filter-pill ${category === "" ? "filter-pill-active" : ""}`}
            >
              All Categories
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`filter-pill ${category === c ? "filter-pill-active" : ""}`}
              >
                {c}
              </button>
            ))}
          </FilterBlock>

          <FilterBlock title="Price">
            <input
              type="range"
              min={10}
              max={200}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-violet"
            />
            <p className="text-xs text-ink/60 mt-1">Up to ${maxPrice}</p>
          </FilterBlock>

          <FilterBlock title="Bestseller">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={bestsellerOnly}
                onChange={(e) => setBestsellerOnly(e.target.checked)}
                className="accent-violet"
              />
              Bestsellers only
            </label>
          </FilterBlock>
        </aside>

        <div>
          <div className="flex justify-end mb-6">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as (typeof SORTS)[number])}
              className="border border-black/15 rounded-full px-4 py-2 text-sm font-display bg-white"
              aria-label="Sort products"
            >
              {SORTS.map((s) => (
                <option key={s} value={s}>
                  Sort: {s}
                </option>
              ))}
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="v-card p-14 text-center">
              <p className="font-display font-semibold text-lg mb-1">
                No products match these filters
              </p>
              <p className="text-sm text-ink/60">
                Try a different search term, widening the price range, or clearing a filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .filter-pill {
          display: block;
          width: 100%;
          text-align: left;
          padding: 0.5rem 0.75rem;
          border-radius: 0.6rem;
          font-size: 0.85rem;
          margin-bottom: 0.25rem;
        }
        .filter-pill:hover { background: var(--v-ivory-2); }
        .filter-pill-active { background: var(--v-violet); color: white; }
      `}</style>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="v-container py-24">Loading catalog…</div>}>
      <ShopContent />
    </Suspense>
  );
}

function FilterBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h4 className="font-display font-semibold text-sm mb-3">{title}</h4>
      {children}
    </div>
  );
}
