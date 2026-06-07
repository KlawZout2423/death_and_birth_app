import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Only institution officers should acknowledge notifications
    if (session.role !== "INSTITUTION_OFFICER") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return NextResponse.json({ message: "Notification not found" }, { status: 404 });
    }

    await prisma.notification.update({
      where: { id },
      data: {
        status: "RECEIVED",
        receivedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("/api/notifications/[id]/receive error", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

