import "server-only";
import { NextRequest } from "next/server";
import { adminAuth, adminDb, isAdminConfigured } from "@/lib/firebase/admin";

export class UnauthenticatedError extends Error {
  constructor(message = "Sign in required.") {
    super(message);
    this.name = "UnauthenticatedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Admin access required.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

const STAFF_ROLES = [
  "support",
  "editor",
  "sales",
  "finance",
  "inventory_manager",
  "manager",
  "admin",
  "super_admin",
];

// Every route that creates an order, requests a download, or does anything
// else tied to a specific customer must call this rather than trusting a
// uid/email the client sent in the request body — the body is attacker-
// controlled, the verified ID token is not.
export async function requireUser(req: NextRequest): Promise<{ uid: string; email: string }> {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) throw new UnauthenticatedError();

  try {
    const decoded = await adminAuth().verifyIdToken(token);
    return { uid: decoded.uid, email: decoded.email ?? "" };
  } catch {
    throw new UnauthenticatedError("Your session has expired. Please sign in again.");
  }
}

// Every /api/admin/* route calls this. It requires a real, verified ID
// token AND a staff role on that user's Firestore profile — there is no
// bypass. An earlier version of this function returned a fake "anonymous,
// bypassed" identity for unauthenticated requests so the admin panel would
// "just work" without wiring up auth; that meant anyone who found an admin
// API route (not hard — they're at predictable, undocumented-but-guessable
// URLs) could edit prices or reseed the catalog with zero credentials.
// Don't reintroduce that shortcut.
export async function requireStaff(req: NextRequest): Promise<{ uid: string; email: string; role: string }> {
  const user = await requireUser(req);

  if (!isAdminConfigured()) {
    // No Firebase Admin credentials at all yet — there's no Firestore to
    // check a role against. Treat as forbidden rather than silently
    // allowing through; the route itself is responsible for returning a
    // clear "not configured" response for read-only endpoints if desired.
    throw new ForbiddenError(
      "Firebase Admin isn't configured in this environment yet, so staff roles can't be verified."
    );
  }

  const profile = await adminDb().collection("users").doc(user.uid).get();
  const role = profile.data()?.role;
  if (!role || !STAFF_ROLES.includes(role)) {
    throw new ForbiddenError();
  }

  return { ...user, role };
}
