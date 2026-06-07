import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.role !== "ADMINISTRATOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const certificates = await prisma.certificate.findMany({
      include: {
        deathRecord: true,
        birthRecord: true,
      },
      orderBy: { issueDate: "desc" },
    });

    const items = certificates.map((certificate) => {
      const type = certificate.birthRecordId ? "birth" : "death";
      const record = certificate.birthRecord || certificate.deathRecord;
      
      return {
        id: certificate.birthRecordId || certificate.deathRecordId,
        certificateRecordId: certificate.id,
        certificateId: certificate.certificateNumber,
        name: certificate.birthRecord ? certificate.birthRecord.childName : (certificate.deathRecord?.fullName ?? "Unknown"),
        type,
        date: certificate.issueDate.toISOString(),
        status: "CERTIFICATE_ISSUED",
      };
    });

    return NextResponse.json({ certificates: items });
  } catch (error) {
    console.error("Error fetching certificates:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.role !== "ADMINISTRATOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const deathRecordId = body.deathRecordId as string | undefined;
    const birthRecordId = body.birthRecordId as string | undefined;

    if (!deathRecordId && !birthRecordId) {
      return NextResponse.json({ error: "Record ID is required" }, { status: 400 });
    }

    if (deathRecordId) {
      const deathRecord = await prisma.deathRecord.findUnique({
        where: { id: deathRecordId },
        include: { certificate: true },
      });

      if (!deathRecord) {
        return NextResponse.json({ error: "Death record not found" }, { status: 404 });
      }

      if (
        deathRecord.status !== "VERIFIED" &&
        deathRecord.status !== "NOTIFIED" &&
        deathRecord.status !== "CERTIFICATE_ISSUED"
      ) {
        return NextResponse.json({ error: "Only verified death records can be issued certificates" }, { status: 400 });
      }

      if (deathRecord.certificate) {
        return NextResponse.json({
          certificate: {
            id: deathRecord.id,
            certificateRecordId: deathRecord.certificate.id,
            certificateId: deathRecord.certificate.certificateNumber,
            name: deathRecord.fullName,
            type: "death",
            date: deathRecord.certificate.issueDate.toISOString(),
            status: "CERTIFICATE_ISSUED",
          },
        });
      }

      const certificate = await prisma.$transaction(async (tx) => {
        const certificateNumber = `CERT-D-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

        const created = await tx.certificate.create({
          data: {
            deathRecordId,
            certificateNumber,
            issuedById: session.id,
          },
        });

        await tx.deathRecord.update({
          where: { id: deathRecordId },
          data: {
            status: "CERTIFICATE_ISSUED",
            verifiedById: deathRecord.verifiedById || session.id,
          },
        });

        return created;
      });

      return NextResponse.json({
        certificate: {
          id: deathRecordId,
          certificateRecordId: certificate.id,
          certificateId: certificate.certificateNumber,
          name: deathRecord.fullName,
          type: "death",
          date: certificate.issueDate.toISOString(),
          status: "CERTIFICATE_ISSUED",
        },
      });
    } else {
      // Birth Record
      const birthRecord = await prisma.birthRecord.findUnique({
        where: { id: birthRecordId },
        include: { certificate: true },
      });

      if (!birthRecord) {
        return NextResponse.json({ error: "Birth record not found" }, { status: 404 });
      }

      if (birthRecord.status !== "VERIFIED" && birthRecord.status !== "CERTIFICATE_ISSUED") {
        return NextResponse.json({ error: "Only verified birth records can be issued certificates" }, { status: 400 });
      }

      if (birthRecord.certificate) {
        return NextResponse.json({
          certificate: {
            id: birthRecord.id,
            certificateRecordId: birthRecord.certificate.id,
            certificateId: birthRecord.certificate.certificateNumber,
            name: birthRecord.childName,
            type: "birth",
            date: birthRecord.certificate.issueDate.toISOString(),
            status: "CERTIFICATE_ISSUED",
          },
        });
      }

      const certificate = await prisma.$transaction(async (tx) => {
        const certificateNumber = `CERT-B-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

        const created = await tx.certificate.create({
          data: {
            birthRecordId,
            certificateNumber,
            issuedById: session.id,
          },
        });

        await tx.birthRecord.update({
          where: { id: birthRecordId },
          data: {
            status: "CERTIFICATE_ISSUED",
            verifiedById: birthRecord.verifiedById || session.id,
          },
        });

        return created;
      });

      return NextResponse.json({
        certificate: {
          id: birthRecordId,
          certificateRecordId: certificate.id,
          certificateId: certificate.certificateNumber,
          name: birthRecord.childName,
          type: "birth",
          date: certificate.issueDate.toISOString(),
          status: "CERTIFICATE_ISSUED",
        },
      });
    }
  } catch (error) {
    console.error("Error issuing certificate:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
