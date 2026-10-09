import { initializeApp, getApps, cert, type ServiceAccount } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

export function getBucket() {
  if (getApps().length === 0) {
    const serviceAccount: ServiceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    };
    initializeApp({
      credential: cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  }
  const bucket = getStorage().bucket();
  const nombreNota = "notas";
  const url = `gs://${process.env.FIREBASE_STORAGE_BUCKET}/${nombreNota}`;
  return { bucket, url };
}