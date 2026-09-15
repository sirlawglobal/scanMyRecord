import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "smr_session";

export type SessionPayload = {
  sub: string;
  role: string;
  iat?: number;
  exp?: number;
};

const getSessionSecret = () =>
  new TextEncoder().encode(
    process.env.SESSION_SECRET ?? "development-session-secret-change-me",
  );

export async function createSession(userId: string, role: string): Promise<string> {
  const token = await new SignJWT({ sub: userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSessionSecret());

  try {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: Number(process.env.SESSION_MAX_AGE ?? 86400),
    });
  } catch {
    // Ignore missing request scope in tests or non-Request contexts.
  }

  return token;
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSessionSecret());
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;

    if (!token) {
      return null;
    }

    return verifySession(token);
  } catch {
    return null;
  }
}
