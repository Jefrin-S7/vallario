import { pubsub } from "firebase-functions/v1";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

// Runs nightly. Real revenue/order figures live in `payments`/`orders`; this
// just pre-aggregates them into `analytics/{yyyy-mm-dd}` so the admin
// dashboard (#34) reads one small doc instead of scanning every order on
// every page load. Admin dashboard falls back to an empty state if this
// hasn't run yet — it never fabricates numbers (spec #52).
export const dailyAnalyticsRollup = pubsub
  .schedule("every day 01:00")
  .timeZone("Etc/UTC")
  .onRun(async () => {
    const db = getFirestore();
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
    await db.collection("analytics").doc(dateKey).set({
      date: dateKey,
      grossRevenue,
      orderCount,
      cashfreeRevenue,
      paypalRevenue,
      averageOrderValue: orderCount ? grossRevenue / orderCount : 0,
      computedAt: Timestamp.now(),
    });
  });
