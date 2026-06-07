import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const deathRecordId = url.searchParams.get("deathRecordId");
    if (!deathRecordId) {
      return NextResponse.json({ message: "deathRecordId is required" }, { status: 400 });
    }

    // Admin can see all submissions; institution officer sees only their institution submission.
    if (session.role === "ADMINISTRATOR") {
      const items = await prisma.nextOfKin.findMany({
        where: { deathRecordId },
        include: { institution: { select: { name: true, type: true } } },
        orderBy: { updatedAt: "desc" },
      });
      return NextResponse.json({ items });
    }

    if (session.role !== "INSTITUTION_OFFICER" || !session.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { institutionId: true },
    });

    if (!user?.institutionId) {
      return NextResponse.json({ message: "Institution not set for user" }, { status: 400 });
    }

    const item = await prisma.nextOfKin.findUnique({
      where: { deathRecordId_institutionId: { deathRecordId, institutionId: user.institutionId } },
    });

    return NextResponse.json({ item });
  } catch (err) {
    console.error("/api/next-of-kin GET error", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (session.role !== "INSTITUTION_OFFICER") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const deathRecordId = body.deathRecordId as string | undefined;
    const lookupStatusRaw = body.lookupStatus as string | undefined;
    const infoSource = (body.infoSource as string | undefined) || null;

    const fullName = (body.fullName as string | undefined) || null;
    const relation = (body.relation as string | undefined) || null;
    const contactNumber = (body.contactNumber as string | undefined) || null;
    const address = (body.address as string | undefined) || null;
    const notes = (body.notes as string | undefined) || null;

    if (!deathRecordId) {
      return NextResponse.json({ message: "deathRecordId is required" }, { status: 400 });
    }

    const lookupStatus = lookupStatusRaw === "NOT_FOUND" ? "NOT_FOUND" : "FOUND";

    if (lookupStatus === "FOUND") {
      if (!fullName || !relation || !contactNumber) {
        return NextResponse.json(
          { message: "fullName, relation, and contactNumber are required when lookupStatus is FOUND" },
          { status: 400 },
        );
      }
    } else {
      // When NOT_FOUND, bank/insurer/pension desk is explicitly reporting no record / no beneficiary details available.
      if (!notes || notes.trim().length < 3) {
        return NextResponse.json(
          { message: "notes is required (min 3 chars) when lookupStatus is NOT_FOUND" },
          { status: 400 },
        );
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { institutionId: true },
    });

    if (!user?.institutionId) {
      return NextResponse.json({ message: "Institution not set for user" }, { status: 400 });
    }

    const saved = await prisma.nextOfKin.upsert({
      where: { deathRecordId_institutionId: { deathRecordId, institutionId: user.institutionId } },
      create: {
        deathRecordId,
        institutionId: user.institutionId,
        lookupStatus,
        infoSource,
        fullName: lookupStatus === "FOUND" ? fullName : null,
        relation: lookupStatus === "FOUND" ? relation : null,
        contactNumber: lookupStatus === "FOUND" ? contactNumber : null,
        address,
        notes,
      },
      update: {
        lookupStatus,
        infoSource,
        fullName: lookupStatus === "FOUND" ? fullName : null,
        relation: lookupStatus === "FOUND" ? relation : null,
        contactNumber: lookupStatus === "FOUND" ? contactNumber : null,
        address,
        notes,
      },
    });

    return NextResponse.json({ success: true, item: saved });
  } catch (err) {
    console.error("/api/next-of-kin POST error", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

