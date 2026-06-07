import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createBirthRecord } from "@/lib/recordStore";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (session.role !== "REGISTRY_OFFICER" && session.role !== "ADMINISTRATOR") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const data = await req.json();

    if (!data.childName || !data.dateOfBirth || !data.motherName || !data.fatherName) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const record = await createBirthRecord({
      childName: data.childName,
      dateOfBirth: data.dateOfBirth,
      timeOfBirth: data.timeOfBirth,
      gender: data.gender,
      placeOfBirth: data.placeOfBirth,
      birthRegionId: data.birthRegionId,
      birthType: data.birthType,
      motherName: data.motherName,
      fatherName: data.fatherName,
      informantName: data.informantName,
      informantContact: data.informantContact,
      contactNumber: data.contactNumber,
      registrationCenter: data.registrationCenter,
      attendantName: data.attendantName,
      supportingDocumentUrl: data.supportingDocumentUrl,
      verificationNotes: data.verificationNotes,
      documents: data.documents,
      status: "submitted",
      createdById: session.id,
    });

    return NextResponse.json({ record });
  } catch (err: any) {
    console.error("/api/birth-registration error", err);
    return NextResponse.json({ message: err.message || "Internal server error" }, { status: 400 });
  }
}
