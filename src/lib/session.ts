import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { Role } from '../../generated/client';

const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const COOKIE_NAME = "session";
const SESSION_EXPIRY = "7d";

export type RoleType = Role | "ADMINISTRATOR" | "REGISTRY_OFFICER" | "INSTITUTION_OFFICER";

export interface SessionPayload {
  id: string;
  email: string;
  name?: string;
  role: RoleType;
  institutionId?: string | null;
}

export function createSession(user: Omit<SessionPayload, 'id'>): string {
  return jwt.sign(user, SECRET_KEY, { expiresIn: SESSION_EXPIRY });
}

export function verifySession(token: string): SessionPayload | null {
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as SessionPayload;
    return decoded;
  } catch {
    return null;
  }
}

export async function setSession(user: Omit<SessionPayload, 'id'> & {id: string}) {
  const token = createSession(user);
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
  
  const session = verifySession(token);
  if (!session) return null;
  return session;
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

