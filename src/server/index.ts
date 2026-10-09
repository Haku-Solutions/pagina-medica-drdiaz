import mongoose from "mongoose";

declare global {
  // eslint-disable-next-line no-var
  var _mongo: Promise<typeof mongoose> | undefined;
}

const MONGODB_URI = process.env.DATABASE_URL!;

export function connectDB(): Promise<typeof mongoose> {
  if (!globalThis._mongo) {
    globalThis._mongo = mongoose.connect(MONGODB_URI);
  }
  return globalThis._mongo;
}