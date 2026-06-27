import { adminDb } from "./firebase-admin";

/**
 * Performs a cascading archive and deletion sequence on a student profile to prevent orphaned references.
 * Maintains W3C and Blockchain registry consistency by archiving/revoking credentials rather than deleting them.
 */
export async function performStudentCascadingCleanup(studentId: string): Promise<{
  success: boolean;
  recordsDeleted: number;
  credentialsArchived: number;
}> {
  try {
    let recordsDeleted = 0;
    let credentialsArchived = 0;

    // 1. Delete Academic Records
    const acadSnap = await adminDb.collection("academic_records").where("studentId", "==", studentId).get();
    const batch1 = adminDb.batch();
    acadSnap.forEach(doc => {
      batch1.delete(doc.ref);
      recordsDeleted++;
    });
    if (!acadSnap.empty) await batch1.commit();

    // 2. Delete Achievements
    const achSnap = await adminDb.collection("achievements").where("studentId", "==", studentId).get();
    const batch2 = adminDb.batch();
    achSnap.forEach(doc => {
      batch2.delete(doc.ref);
      recordsDeleted++;
    });
    if (!achSnap.empty) await batch2.commit();

    // 3. Delete Proof Documents
    const proofSnap = await adminDb.collection("proof_documents").where("studentId", "==", studentId).get();
    const batch3 = adminDb.batch();
    proofSnap.forEach(doc => {
      batch3.delete(doc.ref);
      recordsDeleted++;
    });
    if (!proofSnap.empty) await batch3.commit();

    // 4. Delete Opportunities Cache
    const cacheRef = adminDb.collection("opportunities_cache").doc(studentId);
    const cacheSnap = await cacheRef.get();
    if (cacheSnap.exists) {
      await cacheRef.delete();
      recordsDeleted++;
    }

    // 5. Securely Archive Credentials (W3C credentials must not be deleted to avoid blockchain hash discrepancies)
    const credSnap = await adminDb.collection("credentials").where("studentId", "==", studentId).get();
    const batch4 = adminDb.batch();
    credSnap.forEach(doc => {
      batch4.update(doc.ref, {
        verificationStatus: "revoked",
        revocationReason: "Student profile deactivated",
        archivedAt: new Date().toISOString()
      });
      credentialsArchived++;
    });
    if (!credSnap.empty) await batch4.commit();

    // 6. Delete core student profile doc
    await adminDb.collection("students").doc(studentId).delete();
    recordsDeleted++;

    return {
      success: true,
      recordsDeleted,
      credentialsArchived
    };
  } catch (error) {
    console.error("Cascading delete failed:", error);
    throw error;
  }
}
