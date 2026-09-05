"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, X, Star, Loader2, RefreshCw, MessageSquare } from "lucide-react";
import { auth, isFirebaseConfigured } from "@/lib/firebase/client";

interface Review {
  id: string;
  product?: string;
  productId?: string;
  author?: string;
  authorName?: string;
  rating: number;
  body?: string;
  content?: string;
  status: string;
  createdAt?: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const getHeaders = useCallback(async () => {
    const headers: Record<string, string> = {};
    if (isFirebaseConfigured && auth?.currentUser) {
      const token = await auth.currentUser.getIdToken();
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }, []);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reviews", { headers: await getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  useEffect(() => {
    // One-time fetch on mount, gated behind a real staff/session check
    // server-side — not a synchronization loop.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReviews();
  }, [fetchReviews]);

  async function handleUpdateStatus(id: string, status: string) {
    try {
      const headers = { ...(await getHeaders()), "Content-Type": "application/json" };
      const res = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers,
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
        setMessage(`Review ${status === "approved" ? "approved" : "rejected"}.`);
        setTimeout(() => setMessage(null), 3000);
      }
    } catch {
      setMessage("Failed to update review.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Customer Reviews</h1>
          <p className="text-xs text-steel mt-0.5">
            Moderation queue from Firestore <code className="font-mono">reviews</code> collection.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={fetchReviews} className="v-btn v-btn-ghost text-xs py-1.5 px-3">
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3 rounded-xl bg-emerald/10 border border-emerald/20 text-emerald text-xs font-semibold">
          {message}
        </div>
      )}

      {loading ? (
        <div className="py-12 flex justify-center">
          <Loader2 size={24} className="animate-spin text-violet" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="py-12 text-center text-xs text-steel space-y-2">
          <MessageSquare size={24} className="mx-auto text-steel/40" />
          <p>No reviews yet in Firestore.</p>
          <p className="text-[11px]">Reviews from verified purchases will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-black/5 p-5 shadow-2xs">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-ink">{r.author || r.authorName || "Customer"}</p>
                  <p className="text-xs text-steel mt-0.5">{r.product || r.productId || "Product"}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className={i < r.rating ? "fill-gold text-gold" : "text-steel/20"}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-ink/70 mt-2 leading-relaxed">{r.body || r.content}</p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${
                      r.status === "approved"
                        ? "bg-emerald/10 text-emerald"
                        : r.status === "rejected"
                        ? "bg-crimson/10 text-crimson"
                        : "bg-gold/10 text-gold"
                    }`}
                  >
                    {r.status}
                  </span>
                  {r.status === "pending" && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(r.id, "approved")}
                        className="flex items-center gap-1 text-xs font-bold text-emerald hover:underline"
                      >
                        <Check size={13} /> Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(r.id, "rejected")}
                        className="flex items-center gap-1 text-xs font-bold text-crimson hover:underline"
                      >
                        <X size={13} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
