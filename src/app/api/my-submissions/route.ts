import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getRecordsByRegistrar } from "@/lib/recordStore";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (session.role !== "REGISTRY_OFFICER") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const records = await getRecordsByRegistrar(session.id);

    const submissions = records.map((record) => ({
      id: record.id,
      name: record.type === "birth" ? record.childName : record.deceasedName,
      type: record.type,
      date: record.createdAt,
      status: record.status,
      rejectionReason: record.rejectionReason,
    }));

    return NextResponse.json({ submissions });
  } catch (err: any) {
    console.error("/api/my-submissions error", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
