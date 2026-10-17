import dns from "node:dns";
import mongoose from "mongoose";
import { env } from "./config/env";

declare global {
  var _mongo: Promise<typeof mongoose> | undefined;
}

// Algunos entornos (Windows con DNS heredado) no resuelven `mongodb+srv` con
// el resolutor por defecto de Node. Si se define DNS_SERVERS, se usa ese.
export function applyDnsOverride(): void {
  const servers = env.DNS_SERVERS();
  if (servers.length === 0) return;

  const current = dns.getServers();
  const mismo =
    current.length === servers.length &&
    current.every((server, index) => server === servers[index]);
  if (mismo) return;

  try {
    dns.setServers(servers);
  } catch (error) {
    console.warn("No se pudieron aplicar DNS_SERVERS:", error);
  }
}

export async function connectDB(): Promise<typeof mongoose> {
  applyDnsOverride();

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