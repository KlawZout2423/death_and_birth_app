import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { rejectRecord, getRecord } from "@/lib/recordStore";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (session.role !== "ADMINISTRATOR") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { reason } = await req.json();

    if (!reason) {
      return NextResponse.json({ message: "Rejection reason is required" }, { status: 400 });
    }

    const record = await getRecord(id);

    if (!record) {
      return NextResponse.json({ message: "Record not found" }, { status: 404 });
    }

    const rejected = await rejectRecord(id, reason, session.id);

    return NextResponse.json({ success: true, record: rejected });
  } catch (err: any) {
    console.error("/api/records/[id]/reject error", err);
    return NextResponse.json({ message: err.message || "Internal server error" }, { status: 400 });
  }
}
