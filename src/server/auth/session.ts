import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { env } from "../config/env";

export interface SessionPayload extends JWTPayload {
  usuario: string;
}

const SESSION_HOURS = 4;

function secretKey(): Uint8Array {
  return new TextEncoder().encode(env.ADMIN_SESSION_SECRET());
}

export async function createSessionToken(
  usuario: string
): Promise<string> {
  return new SignJWT({ usuario })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(usuario)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(secretKey());
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      algorithms: ["HS256"],
    });
    const usuario = typeof payload.usuario === "string" ? payload.usuario : "";
    if (!usuario) return null;
    return { ...payload, usuario };
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_NAME = "session";
export const SESSION_COOKIE_MAX_AGE = SESSION_HOURS * 60 * 60;