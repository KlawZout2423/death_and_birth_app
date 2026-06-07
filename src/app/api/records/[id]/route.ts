import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getRecord, updateRecord, deleteRecord } from "@/lib/recordStore";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const record = await getRecord(id);

    if (!record) {
      return NextResponse.json({ message: "Record not found" }, { status: 404 });
    }

    return NextResponse.json({ record });
  } catch (err: any) {
    console.error("/api/records/[id] error", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const updatedRecord = await updateRecord(id, body);

    return NextResponse.json({ record: updatedRecord });
  } catch (err: any) {
    console.error("/api/records/[id] PUT error", err);
    return NextResponse.json({ message: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await deleteRecord(id);

    return NextResponse.json({ message: "Record deleted" });
  } catch (err: any) {
    console.error("/api/records/[id] DELETE error", err);
    return NextResponse.json({ message: err.message || "Internal server error" }, { status: 500 });
  }
}
