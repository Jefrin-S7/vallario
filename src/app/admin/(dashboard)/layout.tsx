"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/Sidebar";
import ProductionBadge from "@/components/admin/ProductionBadge";
import { Search, ShieldCheck, LogOut } from "lucide-react";
import { onAuthStateChanged, signOut, type User as FirebaseUser } from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/lib/firebase/client";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [connected, setConnected] = useState(false);
  const [projectId, setProjectId] = useState<string | undefined>(undefined);

  // One real connection check, shared by every admin page via this layout —
  // replaces what used to be a hardcoded "Live Firestore" badge repeated
  // (twice, redundantly) on every individual page regardless of whether
  // anything actually loaded. Re-runs whenever auth state resolves/changes,
  // since the request needs a fresh ID token.
  const checkConnection = useCallback(async () => {
    try {
      const headers: Record<string, string> = {};
      if (isFirebaseConfigured && auth?.currentUser) {
        headers.Authorization = `Bearer ${await auth.currentUser.getIdToken()}`;
      }
      const res = await fetch("/api/admin/overview", { headers });
      if (res.ok) {
        const data = await res.json();
        setConnected(Boolean(data.connected));
        setProjectId(data.projectId);
      } else {
        setConnected(false);
      }
    } catch {
      setConnected(false);
    }
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      checkConnection();
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      checkConnection();
    });
    return unsubscribe;
  }, [checkConnection]);

  const handleSignOut = async () => {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    }
    router.push("/admin/login");
  };

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Admin";
  const initial = displayName[0]?.toUpperCase() || "A";

  return (
    <div className="flex bg-ivory-2 min-h-screen">
      <AdminSidebar />
      <div className="flex-1 min-w-0">
        <header className="h-16 border-b border-black/5 bg-white flex items-center justify-between px-6 gap-4">
          <div className="flex items-center gap-3 w-full max-w-md">
            <div className="flex items-center gap-2 text-sm text-steel bg-ivory-2 rounded-full px-3.5 py-1.5 w-full">
              <Search size={15} />
              <input
                placeholder="Search orders, products, customers..."
                className="bg-transparent text-xs text-ink outline-none w-full placeholder:text-steel"
              />
            </div>
            <ProductionBadge connected={connected} projectId={projectId} />
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-2.5 text-sm">
              <div className="w-8 h-8 rounded-full bg-violet text-white flex items-center justify-center font-display font-semibold text-xs shadow-xs">
                {initial}
              </div>
              <div className="hidden sm:block leading-tight">
                <p className="font-semibold text-xs text-ink">{displayName}</p>
                <p className="text-[10px] text-steel flex items-center gap-1">
                  <ShieldCheck size={11} className="text-emerald" /> super_admin
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              aria-label="Sign out"
              title="Sign out of admin console"
              className="text-steel hover:text-crimson transition-colors p-1.5 rounded-lg hover:bg-crimson/5 cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>
        <div className="p-6 md:p-8">{children}</div>
      </div>
    </div>
  );
}
