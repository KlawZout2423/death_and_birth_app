import { NextResponse } from "next/server";
import { authenticate } from "../../../lib/userStore";
import { setSession, SessionPayload } from "../../../lib/session";
import type { User } from "../../../lib/userStore";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password required" }, { status: 400 });
    }

    const dbUser = await authenticate(email, password);
    if (!dbUser) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const sessionPayload: SessionPayload = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name || '',
      role: dbUser.role,
      institutionId: dbUser.institutionId ?? null,
    };

    await setSession(sessionPayload);
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("/api/login error", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
