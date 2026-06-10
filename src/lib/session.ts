import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { Role } from '../../generated/client';

const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const COOKIE_NAME = "session";
const SESSION_EXPIRY = "7d";

const KEY = new TextEncoder().encode(SECRET_KEY);

export type RoleType = Role | "ADMINISTRATOR" | "REGISTRY_OFFICER" | "INSTITUTION_OFFICER";

export interface SessionPayload {
  id: string;
  email: string;
  name?: string;
  role: RoleType;
  institutionId?: string | null;
}

export async function createSession(user: SessionPayload): Promise<string> {
  return await new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(SESSION_EXPIRY)
    .sign(KEY);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, KEY, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function setSession(user: Omit<SessionPayload, 'id'> & {id: string}) {
  const token = await createSession(user);
  const cookieStore = await cookies();
  
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  
  if (!token) return null;
  
  const session = await verifySession(token);
  if (!session) return null;
  return session;
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

