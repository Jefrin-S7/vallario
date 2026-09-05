import { NextRequest, NextResponse } from "next/server";
import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { requireStaff, UnauthenticatedError, ForbiddenError } from "@/lib/server/auth";
import { products as catalogSeed } from "@/lib/data/products";
import { writeAuditLog } from "@/lib/server/audit";

// POST /api/admin/seed
// Pushes the local catalog (src/lib/data/products.ts — the real 6 VALLARIO
// products, with your real uploaded image paths) into the `products`
// Firestore collection. Safe to call repeatedly (uses `merge: true`).
export async function POST(req: NextRequest) {
  try {
    const caller = await requireStaff(req);

    if (!isAdminConfigured()) {
      return NextResponse.json(
        {
          message:
            "Firebase Admin isn't configured yet — set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, " +
            "and FIREBASE_PRIVATE_KEY (see .env.example / DEPLOYMENT.md) before syncing to Firestore.",
        },
        { status: 503 }
      );
    }

    const db = adminDb();
    const batch = db.batch();
    for (const p of catalogSeed) {
      const ref = db.collection("products").doc(p.id);
      batch.set(
        ref,
        { ...p, createdAt: p.createdAt || new Date().toISOString(), updatedAt: p.updatedAt || new Date().toISOString() },
        { merge: true }
      );
    }
    await batch.commit();

    await writeAuditLog({
      action: "catalog_seeded_to_firestore",
      actorUid: caller.uid,
      targetId: "products",
      targetType: "catalog",
      metadata: { count: catalogSeed.length },
    });

    return NextResponse.json({
      ok: true,
      message: `Successfully seeded ${catalogSeed.length} products to Firestore.`,
      count: catalogSeed.length,
    });
  } catch (err) {
    if (err instanceof UnauthenticatedError) {
      return NextResponse.json({ message: err.message }, { status: 401 });
    }
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ message: err.message }, { status: 403 });
    }
    console.error("Admin seed error:", err);
    return NextResponse.json({ message: "Failed to seed catalog." }, { status: 500 });
  }
}
