import { compare, hash } from "bcryptjs";

export function hashPassword(plain: string): Promise<string> {
  return hash(plain, 10);
}

export function verifyPassword(
  plain: string,
  passwordHash: string
): Promise<boolean> {
  return compare(plain, passwordHash);
}