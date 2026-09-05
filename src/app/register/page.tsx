import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";

export default function RegisterPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-ink px-4 py-16">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Image src="/brand/vallario-logo.png" alt="VALLARIO" width={56} height={56} className="h-14 w-14 object-contain" />
        </div>
        <div className="bg-white rounded-2xl p-8">
          <h1 className="font-display text-2xl font-bold text-center">Create your account</h1>
          <p className="text-sm text-steel text-center mt-1">One account for every VALLARIO purchase.</p>
          <Suspense fallback={null}>
            <AuthForm mode="register" />
          </Suspense>
          <p className="text-center text-sm text-steel mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-violet font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
