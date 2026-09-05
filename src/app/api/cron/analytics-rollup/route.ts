import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";

// GET /api/cron/analytics-rollup
// Called once daily by Vercel Cron (see vercel.json) — free on the Hobby
// plan, up to once/day. Pre-aggregates the last 24h of orders/payments into
// `analytics/{yyyy-mm-dd}` so the admin dashboard reads one small doc
// instead of scanning every order on every page load.
//
// Protected by CRON_SECRET so this can't be triggered by anyone who finds
// the URL — Vercel Cron sends this automatically as a bearer token when
// CRON_SECRET is set in the project's environment variables.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const db = adminDb();
  const since = Timestamp.fromMillis(Date.now() - 24 * 60 * 60 * 1000);

  const [ordersSnap, paymentsSnap] = await Promise.all([
    db.collection("orders").where("createdAt", ">=", since).get(),
    db.collection("payments").where("verifiedAt", ">=", since).get(),
  ]);

  const grossRevenue = paymentsSnap.docs.reduce((sum, d) => sum + (d.data().amount ?? 0), 0);
  const orderCount = ordersSnap.size;
  const cashfreeRevenue = paymentsSnap.docs
    .filter((d) => d.data().provider === "cashfree")
    .reduce((sum, d) => sum + (d.data().amount ?? 0), 0);
  const paypalRevenue = paymentsSnap.docs
    .filter((d) => d.data().provider === "paypal")
    .reduce((sum, d) => sum + (d.data().amount ?? 0), 0);

  const dateKey = new Date().toISOString().slice(0, 10);
  await db
    .collection("analytics")
    .doc(dateKey)
    .set({
      date: dateKey,
      grossRevenue,
      orderCount,
      cashfreeRevenue,
      paypalRevenue,
      averageOrderValue: orderCount ? grossRevenue / orderCount : 0,
      computedAt: Timestamp.now(),
    });

  return NextResponse.json({ ok: true, date: dateKey, orderCount, grossRevenue });
}
