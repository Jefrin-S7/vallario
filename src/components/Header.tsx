"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  LogOut,
  Download,
  FileText,
  Settings,
} from "lucide-react";
import { onAuthStateChanged, signOut, type User as FirebaseUser } from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/lib/firebase/client";
import { useCart } from "@/lib/cart-context";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/shop?category=AI+%26+Automation", label: "AI & Automation" },
  { href: "/shop?category=Courses", label: "Courses" },
  { href: "/shop?category=Ebooks", label: "Ebooks" },
  { href: "/shop?category=Digital+Product+Bundles", label: "Bundles" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const pathname = usePathname();
  const { count } = useCart();
  const dark = pathname === "/";
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) return;
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);



  const handleSignOut = async () => {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    }
    setUserDropdown(false);
  };

  const initials = user?.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : user?.email
    ? user.email[0].toUpperCase()
    : "U";

  return (
    <header
      className={`sticky top-0 z-50 border-b backdrop-blur-md ${
        dark
          ? "bg-ink/85 border-white/10 text-white"
          : "bg-ivory/90 border-black/10 text-ink"
      }`}
    >
      <div className="v-container flex items-center justify-between h-20">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/brand/vallario-logo.png"
            alt="VALLARIO"
            width={40}
            height={40}
            className="h-9 w-9 object-contain"
            priority
          />
          <span className="font-display font-bold text-lg tracking-wide">
            VALLARIO
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8 font-display text-sm font-medium">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="opacity-80 hover:opacity-100 transition-opacity"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/shop"
            aria-label="Search products"
            className="h-10 w-10 hidden sm:flex items-center justify-center rounded-full hover:bg-white/10 transition"
          >
            <Search size={18} />
          </Link>
          <Link
            href="/dashboard?tab=wishlist"
            aria-label="Wishlist"
            className="h-10 w-10 hidden sm:flex items-center justify-center rounded-full hover:bg-white/10 transition"
          >
            <Heart size={18} />
          </Link>
          <Link
            href="/cart"
            aria-label="Cart"
            className="h-10 w-10 relative flex items-center justify-center rounded-full hover:bg-white/10 transition"
          >
            <ShoppingBag size={18} />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-violet text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>

          {/* User Account / Profile Menu */}
          <div className="relative hidden sm:block" ref={dropdownRef}>
            {user ? (
              <button
                type="button"
                onClick={() => setUserDropdown((prev) => !prev)}
                aria-label="User profile menu"
                className="h-9 w-9 rounded-full bg-violet text-white font-display font-bold text-xs flex items-center justify-center shadow-xs hover:ring-2 hover:ring-violet/30 transition-all cursor-pointer"
              >
                {initials}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setUserDropdown((prev) => !prev)}
                aria-label="Account"
                className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white/10 transition cursor-pointer"
              >
                <User size={18} />
              </button>
            )}

            {userDropdown && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white text-ink border border-black/10 shadow-xl p-2 z-50 animate-in fade-in-50 zoom-in-95">
                {user ? (
                  <>
                    <div className="px-3 py-2.5 border-b border-black/5">
                      <p className="font-display font-bold text-sm truncate">
                        {user.displayName || "My Account"}
                      </p>
                      <p className="text-xs text-steel truncate">{user.email}</p>
                    </div>

                    <div className="py-1 space-y-0.5 text-xs">
                      <Link
                        href="/dashboard?tab=overview"
                        onClick={() => setUserDropdown(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-ivory-2 transition-colors"
                      >
                        <User size={15} className="text-steel" />
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        href="/dashboard?tab=downloads"
                        onClick={() => setUserDropdown(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-ivory-2 transition-colors"
                      >
                        <Download size={15} className="text-steel" />
                        <span>My Downloads</span>
                      </Link>
                      <Link
                        href="/dashboard?tab=orders"
                        onClick={() => setUserDropdown(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-ivory-2 transition-colors"
                      >
                        <FileText size={15} className="text-steel" />
                        <span>Order History</span>
                      </Link>
                      <Link
                        href="/dashboard?tab=profile"
                        onClick={() => setUserDropdown(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-ivory-2 transition-colors"
                      >
                        <Settings size={15} className="text-steel" />
                        <span>Profile &amp; Settings</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-black/5">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-crimson hover:bg-crimson/5 transition-colors cursor-pointer"
                      >
                        <LogOut size={15} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-3 space-y-3 text-center">
                    <p className="text-xs text-steel">
                      Sign in to access your purchased downloads and licenses.
                    </p>
                    <div className="space-y-2">
                      <Link
                        href="/login"
                        onClick={() => setUserDropdown(false)}
                        className="v-btn v-btn-primary w-full text-xs py-2 justify-center"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setUserDropdown(false)}
                        className="v-btn v-btn-ghost w-full text-xs py-2 justify-center"
                      >
                        Create Account
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="h-10 w-10 flex lg:hidden items-center justify-center rounded-full hover:bg-white/10 transition"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="fixed inset-0 z-[60] bg-ink text-white lg:hidden">
          <div className="v-container h-20 flex items-center justify-between">
            <Image
              src="/brand/vallario-logo.png"
              alt="VALLARIO"
              width={36}
              height={36}
              className="h-8 w-8 object-contain"
            />
            <button
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white/10"
            >
              <X size={22} />
            </button>
          </div>
          <nav className="v-container flex flex-col gap-1 pt-4 font-display text-xl">
            {NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="py-3.5 border-b border-white/10"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/dashboard?tab=profile"
              onClick={() => setOpen(false)}
              className="py-3.5 border-b border-white/10 flex items-center justify-between"
            >
              <span>Profile &amp; Account</span>
              {user ? (
                <span className="text-xs px-2 py-0.5 rounded-full bg-violet text-white">
                  Signed In
                </span>
              ) : null}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
