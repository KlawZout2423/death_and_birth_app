import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const institution = url.searchParams.get("institution");
    const typeMap: Record<string, string> = {
      bank: "BANK",
      insurance: "INSURANCE",
      ssnit: "PENSION",
    };

    // Institution officers should only see notifications for their own institution.
    if (session.role === "INSTITUTION_OFFICER") {
      const user = await prisma.user.findUnique({
        where: { email: session.email },
        select: { institutionId: true },
      });

      if (!user?.institutionId) {
        return NextResponse.json({ notifications: [] });
      }

      const notifications = await prisma.notification.findMany({
        where: { institutionId: user.institutionId },
        include: {
          institution: true,
          deathRecord: {
            include: {
              certificate: {
                select: {
                  certificateNumber: true,
                },
              },
            },
          },
        },
        orderBy: { sentAt: "desc" },
      });

      const items = notifications.map((notification) => ({
        id: notification.id,
        deathRecordId: notification.deathRecordId,
        institution: notification.institution.name,
        institutionType: notification.institution.type,
        status: notification.status,
        deceasedName: notification.deathRecord.fullName,
        gender: notification.deathRecord.gender,
        dateOfBirth: notification.deathRecord.dateOfBirth.toISOString(),
        dateOfDeath: notification.deathRecord.dateOfDeath.toISOString(),
        placeOfDeath: notification.deathRecord.placeOfDeath,
        certificateNumber: notification.deathRecord.certificate?.certificateNumber ?? null,
        sentAt: notification.sentAt.toISOString(),
        receivedAt: notification.receivedAt?.toISOString() ?? null,
      }));

      return NextResponse.json({ notifications: items });
    }

    const notifications = await prisma.notification.findMany({
      where: institution && typeMap[institution]
        ? { institution: { type: typeMap[institution] as any } }
        : undefined,
      include: {
        institution: true,
        deathRecord: {
          include: {
            certificate: {
              select: {
                certificateNumber: true,
              },
            },
          },
        },
      },
      orderBy: { sentAt: "desc" },
    });

    const items = notifications.map((notification) => ({
      id: notification.id,
      deathRecordId: notification.deathRecordId,
      institution: notification.institution.name,
      institutionType: notification.institution.type,
      status: notification.status,
      deceasedName: notification.deathRecord.fullName,
      gender: notification.deathRecord.gender,
      dateOfBirth: notification.deathRecord.dateOfBirth.toISOString(),
      dateOfDeath: notification.deathRecord.dateOfDeath.toISOString(),
      placeOfDeath: notification.deathRecord.placeOfDeath,
      certificateNumber: notification.deathRecord.certificate?.certificateNumber ?? null,
      sentAt: notification.sentAt.toISOString(),
      receivedAt: notification.receivedAt?.toISOString() ?? null,
    }));

    return NextResponse.json({ notifications: items });
  } catch (err: any) {
    console.error("/api/notifications error", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (session.role !== "ADMINISTRATOR") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ message: "id is required" }, { status: 400 });
    }

    const record = await prisma.deathRecord.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!record) {
      return NextResponse.json({ message: "Death record not found" }, { status: 404 });
    }

    if (record.status !== "VERIFIED" && record.status !== "CERTIFICATE_ISSUED" && record.status !== "NOTIFIED") {
      return NextResponse.json({ message: "Record must be verified before sending notifications" }, { status: 400 });
    }

    const institutions = await prisma.institution.findMany({
      where: { status: true },
      select: { id: true },
    });

    if (institutions.length === 0) {
      return NextResponse.json({ message: "No active institutions found" }, { status: 400 });
    }

    await prisma.notification.deleteMany({
      where: { deathRecordId: id },
    });

    await prisma.notification.createMany({
      data: institutions.map((institution) => ({
        deathRecordId: id,
        institutionId: institution.id,
      })),
    });

    // Keep certificate stage if already reached; otherwise move verified records to NOTIFIED.
    if (record.status === "VERIFIED") {
      await prisma.deathRecord.update({
        where: { id },
        data: { status: "NOTIFIED" },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("/api/notifications POST error", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
