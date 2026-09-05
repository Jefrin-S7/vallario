"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Pencil,
  Star,
  TrendingUp,
  Sparkles,
  Loader2,
  CheckCircle,
  RefreshCw,
  Plus,
  type LucideIcon,
} from "lucide-react";
import { auth, isFirebaseConfigured } from "@/lib/firebase/client";
import { Product } from "@/lib/data/products";

export default function AdminProductsPage() {
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);

  const fetchProducts = useCallback(async () => {
    try {
      let headers: Record<string, string> = {};
      if (isFirebaseConfigured && auth?.currentUser) {
        const token = await auth.currentUser.getIdToken();
        headers = { Authorization: `Bearer ${token}` };
      }

      const res = await fetch("/api/admin/products", { headers });
      if (res.ok) {
        const data = await res.json();
        setProductsList(data.products || []);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // One-time fetch on mount, gated behind a real staff/session check
    // server-side — not a synchronization loop.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts();
  }, [fetchProducts]);

  async function handleSyncFirestore() {
    setSyncing(true);
    setMessage(null);
    try {
      let headers: Record<string, string> = {};
      if (isFirebaseConfigured && auth?.currentUser) {
        const token = await auth.currentUser.getIdToken();
        headers = { Authorization: `Bearer ${token}` };
      }

      const res = await fetch("/api/admin/seed", { method: "POST", headers });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Success! ${data.count} products synced to Firestore collection.`);
        fetchProducts();
      } else {
        setMessage(data.message || "Failed to sync catalog.");
      }
    } catch {
      setMessage("Error syncing catalog to Firestore.");
    } finally {
      setSyncing(false);
    }
  }

  async function handleSavePrice(id: string) {
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (isFirebaseConfigured && auth?.currentUser) {
        const token = await auth.currentUser.getIdToken();
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers,
        body: JSON.stringify({ id, price: Number(editPrice) }),
      });

      if (res.ok) {
        setProductsList((prev) =>
          prev.map((p) => (p.id === id ? { ...p, price: Number(editPrice) } : p))
        );
        setMessage(`Updated price for product ${id}.`);
        setEditingId(null);
        setTimeout(() => setMessage(null), 3000);
      }
    } catch {
      setMessage("Failed to update price.");
    }
  }

  async function handleToggleStatus(p: Product) {
    const nextStatus = p.status === "active" ? "draft" : "active";
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (isFirebaseConfigured && auth?.currentUser) {
        const token = await auth.currentUser.getIdToken();
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers,
        body: JSON.stringify({ id: p.id, status: nextStatus }),
      });

      if (res.ok) {
        setProductsList((prev) =>
          prev.map((item) => (item.id === p.id ? { ...item, status: nextStatus } : item))
        );
        setMessage(`Product status changed to ${nextStatus}.`);
        setTimeout(() => setMessage(null), 3000);
      }
    } catch {
      setMessage("Failed to update status.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Products Catalog</h1>
          <p className="text-xs text-steel mt-0.5">
            {productsList.length} items in live Firestore inventory.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSyncFirestore}
            disabled={syncing}
            className="v-btn v-btn-primary text-xs py-1.5 px-3.5"
          >
            {syncing ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <RefreshCw size={13} />
            )}
            <span>Sync to Firestore</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-emerald/10 border border-emerald/20 text-emerald text-xs font-semibold flex items-center gap-2">
          <CheckCircle size={15} />
          <span>{message}</span>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-black/5 overflow-hidden shadow-2xs">
        {loading ? (
          <div className="py-12 flex justify-center text-steel">
            <Loader2 size={24} className="animate-spin text-violet" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-ivory-2 text-steel font-semibold border-b border-black/5">
                <tr>
                  <th className="px-5 py-3.5">Product</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Price (USD)</th>
                  <th className="px-5 py-3.5">Rating</th>
                  <th className="px-5 py-3.5">Sales</th>
                  <th className="px-5 py-3.5">Flags</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {productsList.map((p) => (
                  <tr key={p.id} className="hover:bg-ivory-2/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-ivory-2 shrink-0 border border-black/5">
                          <Image src={p.image} alt={p.name} fill className="object-cover" />
                        </div>
                        <div className="min-w-0 max-w-[220px]">
                          <p className="font-semibold text-ink leading-snug line-clamp-1">{p.name}</p>
                          <p className="text-[10px] text-steel font-mono truncate">{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-steel">{p.category}</td>
                    <td className="px-5 py-3.5">
                      {editingId === p.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(Number(e.target.value))}
                            className="w-16 px-1.5 py-1 border border-violet rounded text-xs outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleSavePrice(p.id)}
                            className="text-xs font-bold text-violet hover:underline"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="text-xs text-steel hover:underline"
                          >
                            X
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-ink">${p.price}</span>
                          {p.compareAtPrice && (
                            <span className="text-[10px] text-steel line-through">
                              ${p.compareAtPrice}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(p.id);
                              setEditPrice(p.price);
                            }}
                            className="text-steel/50 hover:text-violet p-0.5"
                          >
                            <Pencil size={11} />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 font-medium text-ink">
                        <Star size={11} className="fill-gold text-gold" /> {p.rating}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-steel">{p.salesCount || 0}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1.5">
                        {p.featured && <FlagPill icon={Sparkles} label="Featured" />}
                        {p.bestseller && <FlagPill icon={TrendingUp} label="Bestseller" />}
                        {p.newArrival && <FlagPill icon={Plus} label="New" />}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(p)}
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize transition-colors cursor-pointer ${
                          p.status === "active"
                            ? "text-emerald bg-emerald/10 hover:bg-emerald/20"
                            : "text-steel bg-black/5 hover:bg-black/10"
                        }`}
                        title="Click to toggle status"
                      >
                        {p.status}
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <a
                        href={`/products/${p.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-violet hover:underline"
                      >
                        View Store
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Media Library */}
      <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-2xs">
        <h2 className="font-display font-bold text-base text-ink mb-1">Media Assets</h2>
        <p className="text-xs text-steel mb-4">
          Live brand logo and product images configured in public storage.
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3">
          <MediaTile src="/brand/vallario-logo.png" label="Brand Logo" />
          {productsList.map((p) => (
            <MediaTile key={p.id} src={p.image} label={p.name} />
          ))}
        </div>
      </div>
    </div>
  );
}

function FlagPill({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-violet/10 text-violet px-2 py-0.5 text-[10px] font-semibold">
      <Icon size={10} /> {label}
    </span>
  );
}

function MediaTile({ src, label }: { src: string; label: string }) {
  return (
    <div className="group relative aspect-square rounded-xl overflow-hidden border border-black/5 bg-ivory-2 shadow-2xs">
      <Image src={src} alt={label} fill className="object-cover" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
        <p className="text-white text-[10px] leading-tight line-clamp-2">{label}</p>
      </div>
    </div>
  );
}
