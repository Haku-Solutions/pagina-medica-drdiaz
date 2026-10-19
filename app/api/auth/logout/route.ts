import { SESSION_COOKIE_NAME } from "@/src/server/auth/session";
import { ok } from "@/src/server/utils/apiResponse";

export async function POST() {
  const response = ok({ cerrada: true });
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
