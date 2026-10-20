import mongoose from "mongoose";
import { databaseName, env } from "./config/env";

declare global {
  var _mongo: Promise<typeof mongoose> | undefined;
}

export async function connectDB(): Promise<typeof mongoose> {
  if (!globalThis._mongo) {
    globalThis._mongo = mongoose.connect(env.DATABASE_URL(), {
      dbName: databaseName(),
    });
  }
  await globalThis._mongo;
  return mongoose;
}