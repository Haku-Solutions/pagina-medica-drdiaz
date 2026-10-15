function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}`);
  }
  return value;
}

export const env = {
  DATABASE_URL: () => required("DATABASE_URL"),

  FIREBASE_PROJECT_ID: () => required("FIREBASE_PROJECT_ID"),
  FIREBASE_STORAGE_BUCKET: () => required("FIREBASE_STORAGE_BUCKET"),
  FIREBASE_CLIENT_EMAIL: () => required("FIREBASE_CLIENT_EMAIL"),
  FIREBASE_PRIVATE_KEY: () =>
    process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n") ?? "",

  ADMIN_SESSION_SECRET: () => required("ADMIN_SESSION_SECRET"),
};

export function databaseName(): string {
  const url = new URL(env.DATABASE_URL());
  const path = url.pathname.replace(/^\/|\/$/g, "");
  return path || "Expediente";
}