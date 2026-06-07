import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createDeathRecord } from "@/lib/recordStore";

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

    // Basic validation
    if (!data.deceasedName || !data.dateOfDeath || !data.informantName || !data.contactNumber) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const deathRecord = await createDeathRecord({
      fullName: data.deceasedName,
      dateOfBirth: data.dateOfBirth,
      dateOfDeath: data.dateOfDeath,
      timeOfDeath: data.timeOfDeath,
      gender: data.gender,
      ageAtDeath: data.ageAtDeath,
      placeOfDeath: data.placeOfDeath,
      deathRegionId: data.deathRegionId,
      causeOfDeath: data.causeOfDeath,
      nationalId: data.nationalId,
      informantName: data.informantName,
      informantContact: data.contactNumber,
      informantRelation: data.informantRelation,
      doctorReportUrl: data.doctorReportUrl,
      status: "submitted",
      createdById: session.id,
    });

    return NextResponse.json({ success: true, record: deathRecord }, { status: 201 });
  } catch (err: any) {
    console.error("/api/death-registration error", err);
    return NextResponse.json({ message: err.message || "Internal server error" }, { status: 400 });
  }
}
