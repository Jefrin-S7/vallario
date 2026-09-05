"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, sendPasswordResetEmail, sendEmailVerification } from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/lib/firebase/client";
import {
  Download,
  FileText,
  KeyRound,
  Heart,
  User,
  LifeBuoy,
  Package,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogOut,
  Mail,
  Building,
  Phone,
  Lock,
  Bell,
  HardDriveDownload,
  type LucideIcon,
} from "lucide-react";
import { products } from "@/lib/data/products";

type TabKey = "overview" | "downloads" | "licenses" | "orders" | "wishlist" | "profile";

const demoOwned = [products[0], products[2], products[4]];

const demoOrders = [
  { id: "ord_demo_1", date: "2026-07-14", items: [products[0].name], total: 149, status: "paid" },
  { id: "ord_demo_2", date: "2026-06-02", items: [products[2].name, products[4].name], total: 178, status: "paid" },
];

const VALID_TABS: TabKey[] = ["overview", "downloads", "licenses", "orders", "wishlist", "profile"];

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as TabKey | null;

  const [localTab, setLocalTab] = useState<TabKey>("overview");
  const activeTab = tabParam && VALID_TABS.includes(tabParam) ? tabParam : localTab;

  // Profile Form State
  const [profile, setProfile] = useState({
    displayName: "Alex Morgan",
    email: "alex.morgan@example.com",
    company: "Vallario Studio",
    bio: "Digital product creator & automation specialist.",
    phoneNumber: "+1 (555) 019-2834",
    role: "customer",
    emailVerified: true,
    provider: "password",
    notifications: {
      productUpdates: true,
      securityAlerts: true,
      marketing: false,
    },
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);

  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  // Sync with Firebase Auth
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setProfile((prev) => ({
          ...prev,
          displayName: u.displayName || prev.displayName,
          email: u.email || prev.email,
          emailVerified: u.emailVerified,
          provider: u.providerData?.[0]?.providerId || "password",
        }));

        // Fetch server profile if available
        try {
          const token = await u.getIdToken();
          const res = await fetch("/api/user/profile", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            setProfile((prev) => ({
              ...prev,
              displayName: data.displayName || prev.displayName,
              email: data.email || prev.email,
              company: data.company || "",
              bio: data.bio || "",
              phoneNumber: data.phoneNumber || "",
              role: data.role || "customer",
              emailVerified: data.emailVerified ?? u.emailVerified,
              provider: data.provider || prev.provider,
              notifications: data.notifications || prev.notifications,
            }));
          }
        } catch {
          // fallback to auth data
        }
      }
    });

    return unsubscribe;
  }, []);

  const handleTabChange = (tab: TabKey) => {
    setLocalTab(tab);
    router.replace(`/dashboard?tab=${tab}`, { scroll: false });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccessMsg(null);
    setProfileErrorMsg(null);

    try {
      if (isFirebaseConfigured && auth?.currentUser) {
        const token = await auth.currentUser.getIdToken();
        const res = await fetch("/api/user/profile", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            displayName: profile.displayName,
            company: profile.company,
            bio: profile.bio,
            phoneNumber: profile.phoneNumber,
            notifications: profile.notifications,
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to save profile on server");
        }
      }
      setProfileSuccessMsg("Profile details updated successfully!");
      setTimeout(() => setProfileSuccessMsg(null), 4000);
    } catch {
      setProfileErrorMsg("Could not save profile changes. Please try again.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSendPasswordReset = async () => {
    setSendingReset(true);
    setProfileSuccessMsg(null);
    try {
      if (isFirebaseConfigured && auth && profile.email) {
        await sendPasswordResetEmail(auth, profile.email);
      }
      setResetEmailSent(true);
      setProfileSuccessMsg(`Password reset instructions sent to ${profile.email}`);
      setTimeout(() => setResetEmailSent(false), 6000);
    } catch {
      setProfileErrorMsg("Unable to send reset email right now.");
    } finally {
      setSendingReset(false);
    }
  };

  const handleResendVerification = async () => {
    if (isFirebaseConfigured && auth?.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
        setVerificationSent(true);
        setProfileSuccessMsg("Verification email sent! Please check your inbox.");
        setTimeout(() => setVerificationSent(false), 5000);
      } catch {
        setProfileErrorMsg("Could not send verification email.");
      }
    } else {
      setVerificationSent(true);
      setProfileSuccessMsg("Verification email simulated in demo mode.");
      setTimeout(() => setVerificationSent(false), 4000);
    }
  };

  const handleSignOut = async () => {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    }
    router.push("/login");
  };

  const handleExportData = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      account: {
        displayName: profile.displayName,
        email: profile.email,
        company: profile.company,
        bio: profile.bio,
        role: profile.role,
        provider: profile.provider,
      },
      orders: demoOrders,
      ownedProducts: demoOwned.map((p) => ({ id: p.id, name: p.name, license: p.license })),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vallario-account-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalSpent = demoOrders.reduce((s, o) => s + o.total, 0);

  const initials = (profile.displayName || "User")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const navItems: { key: TabKey; label: string; icon: LucideIcon }[] = [
    { key: "overview", label: "Overview", icon: Package },
    { key: "downloads", label: "Downloads", icon: Download },
    { key: "licenses", label: "Licenses", icon: KeyRound },
    { key: "orders", label: "Orders", icon: FileText },
    { key: "wishlist", label: "Wishlist", icon: Heart },
    { key: "profile", label: "Profile & Settings", icon: User },
  ];

  return (
    <div className="bg-ivory-2 min-h-screen">
      <div className="v-container py-10">
        {/* Top Header Card */}
        <div className="v-card p-6 bg-white shadow-xs border border-black/5 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet to-violet-2 text-white font-display font-bold text-lg flex items-center justify-center shadow-md shadow-violet/20">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-bold text-ink">
                  {profile.displayName || "My Account"}
                </h1>
                <span className="text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-violet/10 text-violet border border-violet/20">
                  {profile.role === "super_admin" || profile.role === "admin" ? "Admin" : "Customer"}
                </span>
                {!isFirebaseConfigured && (
                  <span className="text-[11px] font-medium uppercase px-2 py-0.5 rounded-full bg-black/5 text-steel border border-black/5">
                    Demo Mode
                  </span>
                )}
              </div>
              <p className="text-xs text-steel mt-0.5 flex items-center gap-2">
                <span>{profile.email}</span>
                {profile.emailVerified ? (
                  <span className="inline-flex items-center gap-1 text-emerald font-medium">
                    <ShieldCheck size={13} /> Verified
                  </span>
                ) : (
                  <span className="text-gold font-medium">Unverified</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => handleTabChange("profile")}
              className={`v-btn text-xs py-2 px-4 ${
                activeTab === "profile" ? "v-btn-primary" : "v-btn-ghost"
              }`}
            >
              <User size={14} />
              <span>Edit Profile</span>
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="v-btn v-btn-ghost text-xs py-2 px-3 text-crimson hover:bg-crimson/5 hover:border-crimson/20"
              title="Sign Out"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            icon={Package}
            label="Total Orders"
            value={String(demoOrders.length)}
            onClick={() => handleTabChange("orders")}
          />
          <StatCard
            icon={Download}
            label="Downloads Available"
            value={String(demoOwned.length)}
            onClick={() => handleTabChange("downloads")}
          />
          <StatCard
            icon={KeyRound}
            label="Active Licenses"
            value={String(demoOwned.length)}
            onClick={() => handleTabChange("licenses")}
          />
          <StatCard
            icon={FileText}
            label="Lifetime Spent"
            value={`$${totalSpent}`}
            onClick={() => handleTabChange("orders")}
          />
        </div>

        {/* Main Grid: Sidebar Tabs + Active Content */}
        <div className="grid gap-8 lg:grid-cols-[240px_1fr] items-start">
          {/* Navigation Sidebar */}
          <nav className="space-y-1.5 v-card p-3 bg-white border border-black/5 shadow-xs lg:sticky lg:top-24">
            <p className="text-[11px] font-semibold uppercase text-steel tracking-wider px-3 pt-2 pb-1">
              Account Menu
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleTabChange(item.key)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-violet text-white shadow-sm shadow-violet/20 font-semibold"
                      : "text-ink/80 hover:bg-ivory-2 hover:text-ink"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} className={isActive ? "text-white" : "text-steel"} />
                    <span>{item.label}</span>
                  </div>
                  {item.key === "downloads" && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        isActive ? "bg-white/20 text-white" : "bg-ivory-2 text-steel"
                      }`}
                    >
                      {demoOwned.length}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="pt-2 mt-2 border-t border-black/5">
              <Link
                href="/support"
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm text-ink/70 hover:bg-ivory-2 hover:text-ink transition-all"
              >
                <LifeBuoy size={16} className="text-steel" />
                <span>Help &amp; Support</span>
              </Link>
            </div>
          </nav>

          {/* Active Content Area */}
          <div className="space-y-6">
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="v-card p-6 bg-white border border-black/5 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-lg font-bold text-ink">
                      Recent Downloads
                    </h2>
                    <button
                      type="button"
                      onClick={() => handleTabChange("downloads")}
                      className="text-xs font-semibold text-violet hover:underline"
                    >
                      View all ({demoOwned.length})
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {demoOwned.slice(0, 2).map((p) => (
                      <div
                        key={p.id}
                        className="p-3.5 rounded-xl bg-ivory-2 border border-black/5 flex items-center gap-3"
                      >
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white shrink-0">
                          <Image src={p.image} alt={p.name} fill className="object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold truncate text-ink">{p.name}</p>
                          <p className="text-[11px] text-steel mt-0.5">
                            {p.fileFormat} • {p.fileSize}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="v-card p-6 bg-white border border-black/5 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-lg font-bold text-ink">
                      Latest Orders
                    </h2>
                    <button
                      type="button"
                      onClick={() => handleTabChange("orders")}
                      className="text-xs font-semibold text-violet hover:underline"
                    >
                      View all
                    </button>
                  </div>
                  <div className="divide-y divide-black/5">
                    {demoOrders.map((o) => (
                      <div key={o.id} className="py-3 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-ink">{o.items.join(", ")}</p>
                          <p className="text-steel mt-0.5">
                            Order {o.id} • {o.date}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-ink">${o.total}</p>
                          <span className="inline-flex items-center gap-1 text-emerald font-semibold text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald" /> Paid
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* DOWNLOADS TAB */}
            {activeTab === "downloads" && (
              <div className="v-card p-6 md:p-8 bg-white border border-black/5 shadow-xs space-y-6">
                <div>
                  <h2 className="font-display text-xl font-bold text-ink">
                    My Purchased Downloads
                  </h2>
                  <p className="text-xs text-steel mt-1">
                    Download links are signed dynamically with 15-minute token expiry for security.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {demoOwned.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 rounded-2xl border border-black/10 bg-ivory-2/50 hover:bg-white transition-all flex flex-col justify-between space-y-4 shadow-2xs"
                    >
                      <div className="flex gap-3.5">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white shrink-0 border border-black/5">
                          <Image src={p.image} alt={p.name} fill className="object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-display font-semibold text-sm text-ink leading-snug line-clamp-2">
                            {p.name}
                          </h3>
                          <p className="text-xs text-steel mt-1">
                            {p.fileFormat} &middot; {p.fileSize}
                          </p>
                          <span className="inline-block mt-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-violet/10 text-violet">
                            {p.license} License
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => alert(`Starting secure download for ${p.name}...`)}
                        className="v-btn v-btn-primary w-full text-xs py-2 justify-center"
                      >
                        <Download size={14} />
                        <span>Generate Download Link</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* LICENSES TAB */}
            {activeTab === "licenses" && (
              <div className="v-card p-6 md:p-8 bg-white border border-black/5 shadow-xs space-y-6">
                <div>
                  <h2 className="font-display text-xl font-bold text-ink">
                    Active Product Licenses
                  </h2>
                  <p className="text-xs text-steel mt-1">
                    Overview of your licensed assets and commercial permissions.
                  </p>
                </div>

                <div className="divide-y divide-black/10 rounded-2xl border border-black/10 bg-ivory-2/30 overflow-hidden">
                  {demoOwned.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-white"
                    >
                      <div>
                        <p className="font-display font-semibold text-sm text-ink">{p.name}</p>
                        <p className="text-steel mt-0.5">
                          Product Type: {p.productType} &middot; Version: v{p.version}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald/10 text-emerald border border-emerald/20">
                          {p.license}
                        </span>
                        <Link
                          href="/legal/license"
                          className="text-violet font-semibold hover:underline"
                        >
                          Terms
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === "orders" && (
              <div className="v-card p-6 md:p-8 bg-white border border-black/5 shadow-xs space-y-6">
                <div>
                  <h2 className="font-display text-xl font-bold text-ink">
                    Order History &amp; Receipts
                  </h2>
                  <p className="text-xs text-steel mt-1">
                    View verified transactions processed via Cashfree &amp; PayPal.
                  </p>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-black/10">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-ivory-2 text-steel font-semibold border-b border-black/10">
                      <tr>
                        <th className="p-3.5">Order ID</th>
                        <th className="p-3.5">Date</th>
                        <th className="p-3.5">Items</th>
                        <th className="p-3.5">Total</th>
                        <th className="p-3.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                      {demoOrders.map((o) => (
                        <tr key={o.id} className="hover:bg-ivory-2/40">
                          <td className="p-3.5 font-mono font-medium text-ink">{o.id}</td>
                          <td className="p-3.5 text-steel">{o.date}</td>
                          <td className="p-3.5 text-ink font-medium">{o.items.join(", ")}</td>
                          <td className="p-3.5 font-bold text-ink">${o.total}</td>
                          <td className="p-3.5">
                            <span className="inline-flex items-center gap-1 text-emerald font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald" /> Paid
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* WISHLIST TAB */}
            {activeTab === "wishlist" && (
              <div className="v-card p-8 bg-white border border-black/5 shadow-xs text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-violet/10 text-violet flex items-center justify-center mx-auto">
                  <Heart size={22} />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-ink">Your Saved Wishlist</h2>
                  <p className="text-xs text-steel mt-1 max-w-sm mx-auto">
                    Save products from the catalog to review later or track special bundles.
                  </p>
                </div>
                <div>
                  <Link href="/shop" className="v-btn v-btn-primary text-xs py-2 px-5">
                    Browse Store Catalog
                  </Link>
                </div>
              </div>
            )}

            {/* PROFILE & SETTINGS TAB */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                {/* Alerts */}
                {profileSuccessMsg && (
                  <div className="p-4 rounded-xl bg-emerald/10 border border-emerald/20 text-emerald text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    <span>{profileSuccessMsg}</span>
                  </div>
                )}
                {profileErrorMsg && (
                  <div className="p-4 rounded-xl bg-crimson/10 border border-crimson/20 text-crimson text-xs font-semibold flex items-center gap-2">
                    <AlertCircle size={16} />
                    <span>{profileErrorMsg}</span>
                  </div>
                )}

                {/* Personal Information Form */}
                <form
                  onSubmit={handleSaveProfile}
                  className="v-card p-6 md:p-8 bg-white border border-black/5 shadow-xs space-y-6"
                >
                  <div className="border-b border-black/10 pb-4">
                    <h2 className="font-display text-xl font-bold text-ink">
                      Personal Information
                    </h2>
                    <p className="text-xs text-steel mt-0.5">
                      Update your account name, contact info, and public creator details.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <label className="block text-xs">
                      <span className="font-medium text-steel">Full Name</span>
                      <div className="relative mt-1">
                        <input
                          required
                          value={profile.displayName}
                          onChange={(e) =>
                            setProfile((p) => ({ ...p, displayName: e.target.value }))
                          }
                          className="v-input pl-9"
                          placeholder="Your Name"
                        />
                        <User size={15} className="absolute left-3 top-3 text-steel" />
                      </div>
                    </label>

                    <label className="block text-xs">
                      <span className="font-medium text-steel">Email Address</span>
                      <div className="relative mt-1">
                        <input
                          disabled
                          value={profile.email}
                          className="v-input pl-9 disabled:bg-ivory-2 disabled:text-steel"
                        />
                        <Mail size={15} className="absolute left-3 top-3 text-steel" />
                      </div>
                    </label>

                    <label className="block text-xs">
                      <span className="font-medium text-steel">Company / Brand Name</span>
                      <div className="relative mt-1">
                        <input
                          value={profile.company}
                          onChange={(e) =>
                            setProfile((p) => ({ ...p, company: e.target.value }))
                          }
                          className="v-input pl-9"
                          placeholder="e.g. Acme Media Corp"
                        />
                        <Building size={15} className="absolute left-3 top-3 text-steel" />
                      </div>
                    </label>

                    <label className="block text-xs">
                      <span className="font-medium text-steel">Phone Number</span>
                      <div className="relative mt-1">
                        <input
                          value={profile.phoneNumber}
                          onChange={(e) =>
                            setProfile((p) => ({ ...p, phoneNumber: e.target.value }))
                          }
                          className="v-input pl-9"
                          placeholder="+1 (555) 000-0000"
                        />
                        <Phone size={15} className="absolute left-3 top-3 text-steel" />
                      </div>
                    </label>

                    <label className="block text-xs sm:col-span-2">
                      <span className="font-medium text-steel">Bio / Creator Profile</span>
                      <textarea
                        rows={3}
                        value={profile.bio}
                        onChange={(e) =>
                          setProfile((p) => ({ ...p, bio: e.target.value }))
                        }
                        className="v-input mt-1 resize-none"
                        placeholder="Tell us a little about what you build..."
                      />
                    </label>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="v-btn v-btn-primary text-xs py-2 px-6"
                    >
                      {savingProfile ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Saving Changes...</span>
                        </>
                      ) : (
                        <span>Save Profile</span>
                      )}
                    </button>
                  </div>
                </form>

                {/* Security & Authentication */}
                <div className="v-card p-6 md:p-8 bg-white border border-black/5 shadow-xs space-y-6">
                  <div className="border-b border-black/10 pb-4">
                    <h2 className="font-display text-xl font-bold text-ink">
                      Security &amp; Password
                    </h2>
                    <p className="text-xs text-steel mt-0.5">
                      Manage authentication credentials and email verification status.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-ivory-2 border border-black/5 space-y-3">
                      <div className="flex items-center gap-2 font-display font-semibold text-xs text-ink">
                        <Lock size={15} className="text-violet" />
                        <span>Password &amp; Sign-in</span>
                      </div>
                      <p className="text-xs text-steel">
                        Sign in provider:{" "}
                        <strong className="capitalize text-ink">
                          {profile.provider === "google.com" ? "Google OAuth" : "Email & Password"}
                        </strong>
                      </p>
                      <button
                        type="button"
                        onClick={handleSendPasswordReset}
                        disabled={sendingReset || resetEmailSent}
                        className="v-btn v-btn-ghost text-xs py-1.5 px-3 bg-white"
                      >
                        {sendingReset ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : resetEmailSent ? (
                          "Reset Link Sent!"
                        ) : (
                          "Send Password Reset Email"
                        )}
                      </button>
                    </div>

                    <div className="p-4 rounded-xl bg-ivory-2 border border-black/5 space-y-3">
                      <div className="flex items-center gap-2 font-display font-semibold text-xs text-ink">
                        <ShieldCheck size={15} className="text-emerald" />
                        <span>Email Verification</span>
                      </div>
                      <p className="text-xs text-steel">
                        Status:{" "}
                        {profile.emailVerified ? (
                          <span className="text-emerald font-semibold">Verified</span>
                        ) : (
                          <span className="text-gold font-semibold">Pending Verification</span>
                        )}
                      </p>
                      {!profile.emailVerified && (
                        <button
                          type="button"
                          onClick={handleResendVerification}
                          disabled={verificationSent}
                          className="v-btn v-btn-ghost text-xs py-1.5 px-3 bg-white"
                        >
                          {verificationSent ? "Sent!" : "Resend Verification Email"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notifications & Communications */}
                <div className="v-card p-6 md:p-8 bg-white border border-black/5 shadow-xs space-y-6">
                  <div className="border-b border-black/10 pb-4">
                    <h2 className="font-display text-xl font-bold text-ink">
                      Notification Preferences
                    </h2>
                    <p className="text-xs text-steel mt-0.5">
                      Choose which updates and security alerts you want to receive.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 rounded-xl bg-ivory-2/60 border border-black/5 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Bell size={16} className="text-violet" />
                        <div>
                          <p className="text-xs font-semibold text-ink">
                            Product Updates &amp; Version Releases
                          </p>
                          <p className="text-[11px] text-steel">
                            Notifications when templates, workflows, or courses receive updates.
                          </p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={profile.notifications.productUpdates}
                        onChange={(e) =>
                          setProfile((p) => ({
                            ...p,
                            notifications: {
                              ...p.notifications,
                              productUpdates: e.target.checked,
                            },
                          }))
                        }
                        className="h-4 w-4 rounded accent-violet cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl bg-ivory-2/60 border border-black/5 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <ShieldCheck size={16} className="text-emerald" />
                        <div>
                          <p className="text-xs font-semibold text-ink">
                            Security &amp; Order Receipts
                          </p>
                          <p className="text-[11px] text-steel">
                            Instant download link notifications and account sign-in alerts.
                          </p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={profile.notifications.securityAlerts}
                        onChange={(e) =>
                          setProfile((p) => ({
                            ...p,
                            notifications: {
                              ...p.notifications,
                              securityAlerts: e.target.checked,
                            },
                          }))
                        }
                        className="h-4 w-4 rounded accent-violet cursor-pointer"
                      />
                    </label>
                  </div>
                </div>

                {/* Account Data & Danger Zone */}
                <div className="v-card p-6 md:p-8 bg-white border border-black/5 shadow-xs space-y-4">
                  <div className="border-b border-black/10 pb-4">
                    <h2 className="font-display text-xl font-bold text-ink">
                      Data Portability &amp; Account Actions
                    </h2>
                    <p className="text-xs text-steel mt-0.5">
                      Export your data or manage account status per our Privacy Policy.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                    <div>
                      <p className="text-xs font-semibold text-ink">Export Account Information</p>
                      <p className="text-[11px] text-steel">
                        Download a machine-readable JSON copy of your profile and order history.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleExportData}
                      className="v-btn v-btn-ghost text-xs py-2 px-4"
                    >
                      <HardDriveDownload size={14} />
                      <span>Export My Data (JSON)</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-ivory-2 flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-violet" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-white text-left rounded-2xl border border-black/5 p-5 shadow-2xs hover:border-violet/30 hover:shadow-xs transition-all cursor-pointer"
    >
      <div className="w-8 h-8 rounded-lg bg-violet/10 text-violet flex items-center justify-center">
        <Icon size={16} />
      </div>
      <p className="font-display text-2xl font-bold mt-3 text-ink">{value}</p>
      <p className="text-xs text-steel mt-0.5">{label}</p>
    </button>
  );
}
