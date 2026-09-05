"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeAuditLog = writeAuditLog;
const firestore_1 = require("firebase-admin/firestore");
// Every sensitive mutation in the system (see spec #41) must call this.
// Writes go straight through the Admin SDK, so `auditLogs` stays append-only
// and unreachable from the client or the normal admin UI (see firestore.rules).
async function writeAuditLog(entry) {
    const db = (0, firestore_1.getFirestore)();
    await db.collection("auditLogs").add({
        ...entry,
        createdAt: firestore_1.FieldValue.serverTimestamp(),
    });
}
