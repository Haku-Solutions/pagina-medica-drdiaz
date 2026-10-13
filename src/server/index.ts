import mongoose from "mongoose";
import { env } from "./config/env";

declare global {
  var _mongo: Promise<typeof mongoose> | undefined;
}

export async function connectDB(): Promise<typeof mongoose> {
  if (!globalThis._mongo) {
    globalThis._mongo = mongoose.connect(env.DATABASE_URL());
  }
  await globalThis._mongo;
  return mongoose;
}