import { NextResponse } from "next/server";
import { authenticate } from "../../../lib/userStore";
import { createSession, SessionPayload } from "../../../lib/session";

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
      name: dbUser.name || "",
      role: dbUser.role,
      institutionId: dbUser.institutionId ?? null,
    };

    // Sign the JWT
    const token = createSession(sessionPayload);

    // Set cookie directly on the response so middleware can read it on Vercel
    const response = NextResponse.json({ success: true });
    response.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("/api/login error", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
