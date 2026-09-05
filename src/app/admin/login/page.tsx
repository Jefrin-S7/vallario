"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/lib/firebase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!isFirebaseConfigured || !auth) {
        // Direct entry if Firebase client is still in demo
        router.push("/admin");
        return;
      }

      await signInWithEmailAndPassword(auth, email, password);
      router.push("/admin");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid credentials or unauthorized access.";
      setError(msg.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-14 h-14 mb-4">
            <Image src="/brand/vallario-logo.png" alt="VALLARIO" fill className="object-contain" priority />
          </div>
          <p className="text-white font-display font-bold tracking-wide text-lg">VALLARIO</p>
          <p className="text-white/50 text-xs uppercase tracking-[0.2em] mt-1">Admin &amp; ERP Console</p>
        </div>

        <div className="bg-charcoal rounded-2xl border border-white/10 p-6 shadow-xl">
          <form onSubmit={handleAdminLogin} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-crimson/10 border border-crimson/20 text-crimson text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <label className="block text-sm">
              <span className="text-xs font-medium text-white/60">Staff Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@vallario.com"
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 px-3.5 py-2.5 text-sm outline-none focus:border-violet transition"
              />
            </label>

            <label className="block text-sm">
              <span className="text-xs font-medium text-white/60">Password</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 px-3.5 py-2.5 text-sm outline-none focus:border-violet transition"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="v-btn v-btn-primary w-full justify-center text-sm py-2.5 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Sign In to Console</span>
              )}
            </button>
          </form>

          <p className="mt-5 flex items-center gap-1.5 text-[11px] text-white/40 border-t border-white/5 pt-3">
            <ShieldCheck size={13} className="text-emerald" />
            <span>Staff accounts only. Connected to live Firestore security rules.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
