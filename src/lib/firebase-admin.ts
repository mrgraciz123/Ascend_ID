import * as admin from "firebase-admin";

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "ascendid-web";

if (!admin.apps.length) {
  // If running in local emulator or development context, initialize with mock/simple config
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    console.log(`Firebase Admin: Connecting to emulator at ${process.env.FIRESTORE_EMULATOR_HOST} for Project: ${projectId}`);
    admin.initializeApp({ projectId });
  } else {
    try {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: projectId
      });
      console.log("Firebase Admin: Initialized successfully with Application Default Credentials.");
    } catch (e) {
      console.warn("Firebase Admin: Application Default Credentials failed. Falling back to local credentials fallback:", e);
      admin.initializeApp({ projectId });
    }
  }
}

const adminDb = admin.firestore();
export { adminDb, admin };
