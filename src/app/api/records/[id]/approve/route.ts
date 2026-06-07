import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { approveRecord, getRecord } from "@/lib/recordStore";

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
    const record = await getRecord(id);

    if (!record) {
      return NextResponse.json({ message: "Record not found" }, { status: 404 });
    }

    const approved = await approveRecord(id, session.id);

    return NextResponse.json({ success: true, record: approved });
  } catch (err: any) {
    console.error("/api/records/[id]/approve error", err);
    return NextResponse.json({ message: err.message || "Internal server error" }, { status: 400 });
  }
}
