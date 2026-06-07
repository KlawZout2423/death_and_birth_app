import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getAllRecords, getRecordsByRegistrar, getRecordsByStatus, createBirthRecord, createDeathRecord } from "@/lib/recordStore";
import { getRecordMetrics } from "@/lib/recordMetrics";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const type = url.searchParams.get("type");
    const status = url.searchParams.get("status");
    const roleParam = url.searchParams.get("role");

    let records;
    if (roleParam === "registrar") {
      records = await getRecordsByRegistrar(session.id);
      if (status) {
        records = records.filter((r) => r.status === status);
      }
    } else if (status) {
      records = await getRecordsByStatus(status);
    } else {
      records = await getAllRecords();
    }

    const filtered = type ? records.filter((r) => r.type === type) : records;

    return NextResponse.json({
      records: filtered,
      metrics: getRecordMetrics(filtered),
    });
  } catch (err: any) {
    console.error("/api/records error", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type } = body;

    if (type === "birth") {
      const record = await createBirthRecord({
        childName: body.childName,
        dateOfBirth: body.dateOfBirth,
        timeOfBirth: body.timeOfBirth,
        gender: body.gender,
        placeOfBirth: body.placeOfBirth,
        birthType: body.birthType,
        motherName: body.motherName,
        fatherName: body.fatherName,
        informantName: body.informantName,
        informantContact: body.informantContact,
        contactNumber: body.contactNumber,
        registrationCenter: body.registrationCenter,
        attendantName: body.attendantName,
        supportingDocumentUrl: body.supportingDocumentUrl,
        verificationNotes: body.verificationNotes,
        documents: body.documents,
        status: "submitted",
        createdById: session.id,
      });

      return NextResponse.json({ record });
    }

    if (type === "death") {
      const record = await createDeathRecord({
        fullName: body.fullName,
        deceasedName: body.deceasedName,
        dateOfBirth: body.dateOfBirth,
        dateOfDeath: body.dateOfDeath,
        timeOfDeath: body.timeOfDeath,
        gender: body.gender,
        ageAtDeath: body.ageAtDeath,
        placeOfDeath: body.placeOfDeath,
        causeOfDeath: body.causeOfDeath,
        nationalId: body.nationalId,
        informantName: body.informantName,
        informantContact: body.informantContact,
        contactNumber: body.contactNumber,
        informantRelation: body.informantRelation,
        doctorReportUrl: body.doctorReportUrl,
        status: "submitted",
        createdById: session.id,
      });
      return NextResponse.json({ record });
    }

    return NextResponse.json({ message: "Unsupported record type" }, { status: 400 });
  } catch (err: any) {
    console.error("/api/records POST error", err);
    return NextResponse.json({ message: err.message || "Internal server error" }, { status: 400 });
  }
}
