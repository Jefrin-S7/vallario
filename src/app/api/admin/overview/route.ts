import { NextRequest, NextResponse } from "next/server";
import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { requireStaff, UnauthenticatedError, ForbiddenError } from "@/lib/server/auth";

// GET /api/admin/overview
export async function GET(req: NextRequest) {
  try {
    await requireStaff(req);

    if (!isAdminConfigured()) {
      return NextResponse.json({
        connected: false,
        message: "Firebase Admin isn't configured yet — see DEPLOYMENT.md.",
        stats: null,
        recentOrders: [],
        recentLogs: [],
      });
    }

    const db = adminDb();

    // Live queries
    const [ordersSnap, usersSnap, productsSnap, auditSnap] = await Promise.all([
      db.collection("orders").orderBy("createdAt", "desc").limit(20).get(),
      db.collection("users").get(),
      db.collection("products").get(),
      db.collection("auditLogs").orderBy("createdAt", "desc").limit(5).get(),
    ]);

    let grossRevenue = 0;
    let paidOrdersCount = 0;
    let cashfreeRevenue = 0;
    let paypalRevenue = 0;

    const orders = ordersSnap.docs.map((doc) => {
      const data = doc.data();
      const total = Number(data.total) || 0;
      if (data.status === "paid") {
        grossRevenue += total;
        paidOrdersCount += 1;
        if (data.provider === "cashfree") cashfreeRevenue += total;
        else if (data.provider === "paypal") paypalRevenue += total;
      }

      return {
        id: doc.id,
        customerName: data.customerName || data.customer?.name || "Customer",
        customerEmail: data.customerEmail || data.customer?.email || data.userId || "",
        items: Array.isArray(data.items)
          ? data.items.map((i: { name?: string; productId?: string }) => i.name || i.productId || "Product")
          : [],
        total,
        provider: data.provider || "cashfree",
        status: data.status || "pending",
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
      };
    });

    return NextResponse.json({
      connected: true,
      projectId: process.env.FIREBASE_PROJECT_ID,
      stats: {
        grossRevenue,
        ordersCount: ordersSnap.size,
        paidOrdersCount,
        cashfreeRevenue,
        paypalRevenue,
        customersCount: usersSnap.size,
        productsCount: productsSnap.size,
        refundsCount: 0,
      },
      recentOrders: orders.slice(0, 5),
      recentLogs: auditSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    });
  } catch (err) {
    if (err instanceof UnauthenticatedError) {
      return NextResponse.json({ message: err.message }, { status: 401 });
    }
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ message: err.message }, { status: 403 });
    }
    console.error("Admin overview error:", err);
    return NextResponse.json({ message: "Failed to load live overview metrics." }, { status: 500 });
  }
}
