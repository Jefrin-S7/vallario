import Link from "next/link";
import { CompassIcon } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 text-center">
      <div className="max-w-md">
        <div className="w-14 h-14 rounded-full bg-violet/10 text-violet flex items-center justify-center mx-auto mb-6">
          <CompassIcon size={24} />
        </div>
        <p className="font-display text-6xl font-bold text-ink">404</p>
        <h1 className="font-display text-xl font-bold mt-3">This page wandered off.</h1>
        <p className="text-steel mt-2">
          The page you&rsquo;re looking for doesn&rsquo;t exist or may have moved. Let&rsquo;s get you back on track.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/" className="v-btn v-btn-primary">
            Back to home
          </Link>
          <Link href="/shop" className="v-btn v-btn-ghost border-black/15">
            Browse shop
          </Link>
        </div>
      </div>
    </div>
  );
}
