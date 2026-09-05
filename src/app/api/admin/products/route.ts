import { NextRequest, NextResponse } from "next/server";
import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { requireStaff, UnauthenticatedError, ForbiddenError } from "@/lib/server/auth";
import { products as catalogSeed } from "@/lib/data/products";
import { writeAuditLog } from "@/lib/server/audit";

// GET /api/admin/products
export async function GET(req: NextRequest) {
  try {
    await requireStaff(req);

    if (!isAdminConfigured()) {
      // No Firebase Admin credentials yet — show the seed catalog so the
      // panel is still useful to look at, clearly marked as not live.
      return NextResponse.json({ products: catalogSeed, source: "seed", unseeded: true, connected: false });
    }

    const db = adminDb();
    const snap = await db.collection("products").get();
    if (snap.empty) {
      return NextResponse.json({ products: catalogSeed, source: "seed", unseeded: true, connected: true });
    }

    const products = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ products, source: "firestore", unseeded: false, connected: true });
  } catch (err) {
    if (err instanceof UnauthenticatedError) {
      return NextResponse.json({ message: err.message }, { status: 401 });
    }
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ message: err.message }, { status: 403 });
    }
    console.error("Admin products error:", err);
    return NextResponse.json({ message: "Failed to load products." }, { status: 500 });
  }
}

// PATCH /api/admin/products
// Body: { id, price?, compareAtPrice?, status?, featured?, bestseller? }
export async function PATCH(req: NextRequest) {
  try {
    const caller = await requireStaff(req);

    if (!isAdminConfigured()) {
      return NextResponse.json(
        { message: "Firebase Admin isn't configured yet — see DEPLOYMENT.md to connect a real project." },
        { status: 503 }
      );
    }

    const db = adminDb();
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ message: "Product id is required." }, { status: 400 });
    }

    const productRef = db.collection("products").doc(id);
    const snap = await productRef.get();

    if (!snap.exists) {
      const seedItem = catalogSeed.find((p) => p.id === id);
      if (!seedItem) {
        return NextResponse.json({ message: "Product not found." }, { status: 404 });
      }
      await productRef.set({ ...seedItem, ...updates, updatedAt: new Date().toISOString().slice(0, 10) });
    } else {
      await productRef.update({ ...updates, updatedAt: new Date().toISOString().slice(0, 10) });
    }

    await writeAuditLog({
      action: "product_update",
      actorUid: caller.uid,
      targetId: id,
      targetType: "product",
      metadata: updates,
    });

    return NextResponse.json({ ok: true, id, updates });
  } catch (err) {
    if (err instanceof UnauthenticatedError) {
      return NextResponse.json({ message: err.message }, { status: 401 });
    }
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ message: err.message }, { status: 403 });
    }
    console.error("Admin update product error:", err);
    return NextResponse.json({ message: "Failed to update product." }, { status: 500 });
  }
}
