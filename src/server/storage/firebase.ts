import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { env } from "../config/env";

let bucketInstance: ReturnType<typeof buildBucket> | undefined;

function buildBucket() {
  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId: env.FIREBASE_PROJECT_ID(),
        clientEmail: env.FIREBASE_CLIENT_EMAIL(),
        privateKey: env.FIREBASE_PRIVATE_KEY(),
      }),
      storageBucket: env.FIREBASE_STORAGE_BUCKET(),
    });
  }
  return getStorage().bucket();
}

export function firebaseBucket(): ReturnType<typeof buildBucket> {
  if (!bucketInstance) {
    bucketInstance = buildBucket();
  }
  return bucketInstance;
}