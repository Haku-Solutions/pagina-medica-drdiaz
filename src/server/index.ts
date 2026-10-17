import mongoose from "mongoose";
import { env } from "./config/env";

declare global {
  var _mongo: Promise<typeof mongoose> | undefined;
}

export async function connectDB(): Promise<typeof mongoose> {
  if (!globalThis._mongo) {
    globalThis._mongo = mongoose
      .connect(env.DATABASE_URL(), {
        serverSelectionTimeoutMS: 10000,
      })
      .catch((error) => {
        // No cachear una conexión fallida: si no, todos los requests
        // siguientes siguen fallando hasta reiniciar el servidor.
        globalThis._mongo = undefined;
        throw error;
      });
  }
  await globalThis._mongo;
  return mongoose;
}