import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { getSignedDownloadUrl } from "@/lib/storage";
import { requireUser, UnauthenticatedError } from "@/lib/server/auth";
import { writeAuditLog } from "@/lib/server/audit";

const SIGNED_URL_TTL_MINUTES = 15;

// POST /api/downloads/sign
// Headers: Authorization: Bearer <Firebase ID token>
// Body: { productId: string }
//
// The ONLY path that ever produces a working download link — no permanent
// public URL for a digital product exists anywhere in this system. Checks,
// in order: caller is authenticated; an entitlement for (uid, productId)
// exists and isn't revoked; downloadsUsed < downloadLimit; the download
// window (if set) hasn't expired. The signed URL itself comes from
// whichever storage backend is configured — S3-compatible (R2/B2/Supabase)
// if you set those env vars, otherwise Firebase Storage automatically
// (see src/lib/storage/index.ts) — neither requires extra code here.
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const body = await req.json();
    const productId = String(body.productId ?? "");
    if (!productId) {
      return NextResponse.json({ message: "productId is required." }, { status: 400 });
    }

    if (!isAdminConfigured()) {
      return NextResponse.json(
        { message: "Firebase Admin isn't configured yet — see DEPLOYMENT.md." },
        { status: 503 }
      );
    }

    const db = adminDb();
    const entitlementId = `${user.uid}_${productId}`;
    const entitlementRef = db.collection("entitlements").doc(entitlementId);
    const entitlementSnap = await entitlementRef.get();

    if (!entitlementSnap.exists) {
      return NextResponse.json({ message: "No purchase found for this product." }, { status: 403 });
    }
    const entitlement = entitlementSnap.data()!;

    if (entitlement.revoked) {
      return NextResponse.json({ message: "Access to this product has been revoked." }, { status: 403 });
    }
    if (entitlement.downloadsUsed >= entitlement.downloadLimit) {
      return NextResponse.json(
        { message: "Download limit reached for this product. Contact support for a reset." },
        { status: 403 }
      );
    }
    if (entitlement.downloadExpiresAt && entitlement.downloadExpiresAt.toMillis() < Date.now()) {
      return NextResponse.json({ message: "This download window has expired." }, { status: 403 });
    }

    const productSnap = await db.collection("products").doc(productId).get();
    if (!productSnap.exists) {
      return NextResponse.json({ message: "Product not found." }, { status: 404 });
    }
    const fileName = productSnap.data()!.fileName ?? "download.zip";
    const storageKey = `products/${productId}/original/${fileName}`;

    const url = await getSignedDownloadUrl(storageKey);

    const batch = db.batch();
    batch.update(entitlementRef, {
      downloadsUsed: FieldValue.increment(1),
      lastDownloadedAt: FieldValue.serverTimestamp(),
    });
    batch.set(db.collection("downloads").doc(), {
      uid: user.uid,
      productId,
      entitlementId,
      issuedAt: FieldValue.serverTimestamp(),
      ip: req.headers.get("x-forwarded-for") ?? null,
      userAgent: req.headers.get("user-agent") ?? null,
    });
    await batch.commit();

    await writeAuditLog({
      action: "download_issued",
      actorUid: user.uid,
      targetId: productId,
      targetType: "product_download",
    });

    return NextResponse.json({ url, expiresInMinutes: SIGNED_URL_TTL_MINUTES });
  } catch (err) {
    if (err instanceof UnauthenticatedError) {
      return NextResponse.json({ message: err.message }, { status: 401 });
    }
    console.error(err);
    return NextResponse.json({ message: "Could not generate download link." }, { status: 500 });
  }
}
