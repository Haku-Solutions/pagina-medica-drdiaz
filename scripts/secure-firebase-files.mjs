import mongoose from "mongoose";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Falta la variable de entorno ${name}`);
  return value;
}

function databaseName(uri) {
  const withoutScheme = uri.replace(/^mongodb(?:\+srv)?:\/\//, "");
  const slashIndex = withoutScheme.indexOf("/");
  if (slashIndex === -1) return "Expediente";
  return decodeURIComponent(withoutScheme.slice(slashIndex + 1).split("?")[0].trim()) || "Expediente";
}

function storagePath(archivo) {
  if (archivo.storagePath) return archivo.storagePath;
  if (!archivo.url) return null;
  try {
    const parsed = new URL(archivo.url);
    if (parsed.hostname !== "firebasestorage.googleapis.com") return null;
    const match = parsed.pathname.match(/^\/v0\/b\/[^/]+\/o\/(.+)$/);
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

async function main() {
  const uri = required("DATABASE_URL");
  const bucketName = required("FIREBASE_STORAGE_BUCKET");
  const privateKey = required("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n");

  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId: required("FIREBASE_PROJECT_ID"),
        clientEmail: required("FIREBASE_CLIENT_EMAIL"),
        privateKey,
      }),
      storageBucket: bucketName,
    });
  }

  await mongoose.connect(uri, { dbName: databaseName(uri) });
  const bucket = getStorage().bucket();
  const collection = mongoose.connection.collection("archivos");
  let actualizados = 0;
  let omitidos = 0;

  try {
    for await (const archivo of collection.find({})) {
      const path = storagePath(archivo);
      if (!path) {
        omitidos += 1;
        console.warn(`Sin ruta Firebase válida: ${archivo._id}`);
        continue;
      }

      await bucket.file(path).setMetadata({
        metadata: { firebaseStorageDownloadTokens: null },
      });
      await collection.updateOne(
        { _id: archivo._id },
        { $set: { url: `/api/archivos/${archivo._id}` } },
      );
      actualizados += 1;
    }
  } finally {
    await mongoose.disconnect();
  }

  console.log(`Archivos protegidos: ${actualizados}. Omitidos: ${omitidos}.`);
}

main().catch((error) => {
  console.error("No se pudieron proteger los archivos:", error.message);
  process.exitCode = 1;
});
