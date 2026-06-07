import { NextResponse } from "next/server";
import { clearSession } from "../../../lib/session";

export async function POST() {
  try {
    await clearSession();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("/api/logout error", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

