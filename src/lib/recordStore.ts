import { prisma } from "./prisma";
import { notifyInstitutions } from "./notificationStore";

export type LegacyBirthRecord = {
  type?: "birth";
  childName: string;
  dateOfBirth: string;
  timeOfBirth?: string;
  gender?: string;
  placeOfBirth: string;
  birthRegionId?: string;
  birthType?: string;
  motherName: string;
  fatherName: string;
  informantName?: string;
  informantContact?: string;
  contactNumber?: string;
  registrationCenter?: string;
  attendantName?: string;
  supportingDocumentUrl?: string;
  verificationNotes?: string;
  documents?: unknown[];
  status?: string;
  registrarEmail?: string;
  rejectionReason?: string;
};

export type LegacyDeathRecord = {
  fullName?: string;
  deceasedName?: string;
  dateOfBirth?: string;
  dateOfDeath: string;
  timeOfDeath?: string;
  gender?: string;
  ageAtDeath?: number;
  placeOfDeath: string;
  deathRegionId?: string;
  causeOfDeath: string;
  nationalId?: string;
  informantName: string;
  informantContact?: string;
  contactNumber?: string;
  informantRelation?: string;
  doctorReportUrl?: string;
  status: string;
  rejectionReason?: string;
};

type BaseRecord = {
  id: string;
  type: "birth" | "death";
  status: string;
  rejectionReason: string | null;
  createdById: string;
  registrarEmail: string | null;
  verifiedById: string | null;
  verifiedByName: string | null;
  certificateId: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  documents: string[];
};

export interface BirthRecord extends BaseRecord {
  type: "birth";
  childName: string;
  fullName: string;
  dateOfBirth: string;
  timeOfBirth: string;
  gender: string;
  placeOfBirth: string;
  birthRegionId: string | null;
  birthRegionName: string | null;
  birthType: string;
  motherName: string;
  fatherName: string;
  informantName: string;
  informantContact: string;
  contactNumber: string;
  registrationCenter: string;
  attendantName: string;
  supportingDocumentUrl: string | null;
  verificationNotes: string | null;
}

export interface DeathRecord extends BaseRecord {
  type: "death";
  fullName: string;
  deceasedName: string;
  dateOfBirth: string;
  dateOfDeath: string;
  timeOfDeath: string;
  gender: string;
  ageAtDeath: number | null;
  placeOfDeath: string;
  deathRegionId: string | null;
  deathRegionName: string | null;
  causeOfDeath: string;
  nationalId: string | null;
  informantName: string;
  informantContact: string;
  contactNumber: string;
  informantRelation: string;
  doctorReportUrl: string | null;
}

export type Record = BirthRecord | DeathRecord;

function toIsoString(value: Date | string | null | undefined) {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : value;
}

function normalizeStatus(status?: string) {
  const normalized = (status || "PENDING_VERIFICATION").toUpperCase();

  if (
    normalized === "PENDING_VERIFICATION" ||
    normalized === "VERIFIED" ||
    normalized === "REJECTED" ||
    normalized === "CERTIFICATE_ISSUED" ||
    normalized === "NOTIFIED"
  ) {
    return normalized;
  }

  if (normalized === "APPROVED" || normalized === "SUBMITTED") {
    return "PENDING_VERIFICATION";
  }

  return "PENDING_VERIFICATION";
}

function assertStatusAllowedForType(
  type: "birth" | "death",
  status: string,
) {
  if (type === "birth" && status === "NOTIFIED") {
    throw new Error(`Status ${status} is not valid for birth records.`);
  }
}

function deriveDateOfBirth(dateOfDeath: string, ageAtDeath?: number): Date | null {
  const deathDate = new Date(dateOfDeath);
  if (Number.isNaN(deathDate.getTime())) {
    return null;
  }

  if (!ageAtDeath || ageAtDeath <= 0) {
    return null;
  }

  return new Date(
    Date.UTC(
      deathDate.getUTCFullYear() - ageAtDeath,
      deathDate.getUTCMonth(),
      deathDate.getUTCDate()
    )
  );
}

function isFinalOrProcessedStatus(status: string) {
  return (
    status === "VERIFIED" ||
    status === "REJECTED" ||
    status === "NOTIFIED" ||
    status === "CERTIFICATE_ISSUED"
  );
}

function mapBirthRecord(record: any): BirthRecord {
  return {
    id: record.id,
    type: "birth",
    childName: record.childName,
    fullName: record.childName,
    dateOfBirth: toIsoString(record.dateOfBirth) ?? "",
    timeOfBirth: record.timeOfBirth ?? "",
    gender: record.gender ?? "",
    placeOfBirth: record.placeOfBirth,
    birthRegionId: record.birthRegionId ?? null,
    birthRegionName: record.birthRegion?.name ?? null,
    birthType: record.birthType ?? "",
    motherName: record.motherName,
    fatherName: record.fatherName,
    informantName: record.informantName ?? "",
    informantContact: record.informantContact ?? "",
    contactNumber: record.informantContact ?? "",
    registrationCenter: record.registrationCenter ?? "",
    attendantName: record.attendantName ?? "",
    supportingDocumentUrl: record.supportingDocumentUrl ?? null,
    verificationNotes: record.verificationNotes ?? null,
    documents: record.supportingDocumentUrl ? [record.supportingDocumentUrl] : [],
    status: record.status,
    rejectionReason: record.rejectionReason ?? null,
    createdById: record.createdById,
    registrarEmail: record.createdBy?.email ?? null,
    verifiedById: record.verifiedById ?? null,
    verifiedByName: record.verifiedBy?.name ?? null,
    certificateId: record.certificate?.certificateNumber ?? null,
    approvedAt: toIsoString(record.certificate?.issueDate) ?? (record.status === "VERIFIED" ? toIsoString(record.updatedAt) : null),
    createdAt: toIsoString(record.createdAt) ?? "",
    updatedAt: toIsoString(record.updatedAt) ?? "",
  };
}

function mapDeathRecord(record: any): DeathRecord {
  return {
    id: record.id,
    type: "death",
    fullName: record.fullName,
    deceasedName: record.fullName,
    dateOfBirth: toIsoString(record.dateOfBirth) ?? "",
    dateOfDeath: toIsoString(record.dateOfDeath) ?? "",
    timeOfDeath: record.timeOfDeath ?? "",
    gender: record.gender ?? "",
    ageAtDeath: record.ageAtDeath ?? null,
    placeOfDeath: record.placeOfDeath,
    deathRegionId: record.deathRegionId ?? null,
    deathRegionName: record.deathRegion?.name ?? null,
    causeOfDeath: record.causeOfDeath,
    nationalId: record.nationalId ?? null,
    informantName: record.informantName,
    informantContact: record.informantContact,
    contactNumber: record.informantContact,
    informantRelation: record.informantRelation ?? "",
    doctorReportUrl: record.doctorReportUrl ?? null,
    documents: record.doctorReportUrl ? [record.doctorReportUrl] : [],
    status: record.status,
    rejectionReason: record.rejectionReason ?? null,
    createdById: record.createdById,
    registrarEmail: record.createdBy?.email ?? null,
    verifiedById: record.verifiedById ?? null,
    verifiedByName: record.verifiedBy?.name ?? null,
    certificateId: record.certificate?.certificateNumber ?? null,
    approvedAt: toIsoString(record.certificate?.issueDate) ?? null,
    createdAt: toIsoString(record.createdAt) ?? "",
    updatedAt: toIsoString(record.updatedAt) ?? "",
  };
}

function getBirthInclude() {
  return {
    createdBy: { select: { email: true } },
    verifiedBy: { select: { name: true } },
    birthRegion: { select: { id: true, name: true } },
    certificate: {
      select: {
        certificateNumber: true,
        issueDate: true,
      },
    },
  } as const;
}

function getDeathInclude() {
  return {
    createdBy: { select: { email: true } },
    verifiedBy: { select: { name: true } },
    deathRegion: { select: { id: true, name: true } },
    certificate: {
      select: {
        certificateNumber: true,
        issueDate: true,
      },
    },
  } as const;
}

function sortRecords(records: Record[]) {
  return [...records].sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    return bTime - aTime;
  });
}

async function findRecordType(id: string): Promise<"birth" | "death" | null> {
  const birth = await prisma.birthRecord.findUnique({ where: { id }, select: { id: true } });
  if (birth) return "birth";

  const death = await prisma.deathRecord.findUnique({ where: { id }, select: { id: true } });
  if (death) return "death";

  return null;
}

function buildBirthUpdateData(data: any) {
  const updateData: { [key: string]: unknown } = {};

  if ("childName" in data && data.childName?.trim()) updateData.childName = data.childName.trim();
  if ("dateOfBirth" in data && data.dateOfBirth) updateData.dateOfBirth = new Date(data.dateOfBirth);
  if ("timeOfBirth" in data) updateData.timeOfBirth = data.timeOfBirth || null;
  if ("gender" in data) updateData.gender = data.gender || null;
  if ("placeOfBirth" in data) updateData.placeOfBirth = data.placeOfBirth;
  if ("birthRegionId" in data) updateData.birthRegionId = data.birthRegionId || null;
  if ("birthType" in data) updateData.birthType = data.birthType || null;
  if ("motherName" in data) updateData.motherName = data.motherName;
  if ("fatherName" in data) updateData.fatherName = data.fatherName;
  if ("informantName" in data) updateData.informantName = data.informantName || null;

  if ("informantContact" in data || "contactNumber" in data) {
    updateData.informantContact = data.informantContact?.trim() || data.contactNumber?.trim() || null;
  }

  if ("registrationCenter" in data) updateData.registrationCenter = data.registrationCenter || null;
  if ("attendantName" in data) updateData.attendantName = data.attendantName || null;

  if ("supportingDocumentUrl" in data) {
    updateData.supportingDocumentUrl = data.supportingDocumentUrl || null;
  } else if (Array.isArray(data.documents)) {
    updateData.supportingDocumentUrl = data.documents[0] || null;
  }

  if ("verificationNotes" in data) updateData.verificationNotes = data.verificationNotes || null;
  if ("status" in data && data.status) updateData.status = normalizeStatus(data.status);
  if ("rejectionReason" in data) updateData.rejectionReason = data.rejectionReason || null;
  if ("verifiedById" in data) updateData.verifiedById = data.verifiedById || null;

  return updateData;
}

function buildDeathUpdateData(data: any) {
  const updateData: { [key: string]: unknown } = {};

  if ("fullName" in data || "deceasedName" in data) {
    const fullName = data.fullName?.trim() || data.deceasedName?.trim();
    if (fullName) updateData.fullName = fullName;
  }

  if ("dateOfDeath" in data && data.dateOfDeath) updateData.dateOfDeath = new Date(data.dateOfDeath);

  if ("dateOfBirth" in data && data.dateOfBirth) {
    updateData.dateOfBirth = new Date(data.dateOfBirth);
  } else if ("ageAtDeath" in data && data.ageAtDeath && data.dateOfDeath) {
    const derivedDate = deriveDateOfBirth(data.dateOfDeath, Number(data.ageAtDeath));
    if (derivedDate) updateData.dateOfBirth = derivedDate;
  }

  if ("timeOfDeath" in data) updateData.timeOfDeath = data.timeOfDeath || null;
  if ("gender" in data) updateData.gender = data.gender || null;
  if ("ageAtDeath" in data) updateData.ageAtDeath = data.ageAtDeath ? Number(data.ageAtDeath) : null;
  if ("placeOfDeath" in data) updateData.placeOfDeath = data.placeOfDeath;
  if ("deathRegionId" in data) updateData.deathRegionId = data.deathRegionId || null;
  if ("causeOfDeath" in data) updateData.causeOfDeath = data.causeOfDeath;
  if ("nationalId" in data) updateData.nationalId = data.nationalId || null;
  if ("informantName" in data) updateData.informantName = data.informantName;

  if ("informantContact" in data || "contactNumber" in data) {
    updateData.informantContact = data.informantContact?.trim() || data.contactNumber?.trim() || "";
  }

  if ("informantRelation" in data) updateData.informantRelation = data.informantRelation || null;

  if ("doctorReportUrl" in data) {
    updateData.doctorReportUrl = data.doctorReportUrl || null;
  } else if (Array.isArray(data.documents)) {
    updateData.doctorReportUrl = data.documents[0] || null;
  }

  if ("status" in data && data.status) updateData.status = normalizeStatus(data.status);
  if ("rejectionReason" in data) updateData.rejectionReason = data.rejectionReason || null;
  if ("verifiedById" in data) updateData.verifiedById = data.verifiedById || null;

  return updateData;
}

export async function createBirthRecord(data: LegacyBirthRecord & { createdById: string }): Promise<BirthRecord> {
  const childName = data.childName?.trim();
  const dateOfBirth = new Date(data.dateOfBirth);
  const normalizedDateOfBirth = new Date(Date.UTC(dateOfBirth.getUTCFullYear(), dateOfBirth.getUTCMonth(), dateOfBirth.getUTCDate()));
  const supportingDocumentUrl = data.supportingDocumentUrl || (Array.isArray(data.documents) ? String(data.documents[0] || "") : "");
  const informantContact = data.informantContact?.trim() || data.contactNumber?.trim() || null;

  if (!childName) throw new Error("Child name is required.");
  if (Number.isNaN(dateOfBirth.getTime())) throw new Error("A valid date of birth is required.");
  if (!data.placeOfBirth?.trim()) throw new Error("Place of birth is required.");
  if (!data.motherName?.trim()) throw new Error("Mother name is required.");
  if (!data.fatherName?.trim()) throw new Error("Father name is required.");

  const duplicateBirth = await prisma.birthRecord.findFirst({
    where: {
      childName,
      motherName: data.motherName.trim(),
      fatherName: data.fatherName.trim(),
      placeOfBirth: data.placeOfBirth.trim(),
      dateOfBirth: normalizedDateOfBirth,
      status: {
        in: ["PENDING_VERIFICATION", "VERIFIED", "NOTIFIED", "CERTIFICATE_ISSUED"],
      },
    },
    select: { id: true },
  });

  if (duplicateBirth) {
    throw new Error("A similar birth record already exists and is currently being processed.");
  }

  const record = await prisma.$transaction(async (tx) => {
    const birth = await tx.birthRecord.create({
      data: {
        childName,
        dateOfBirth,
        timeOfBirth: data.timeOfBirth || null,
        gender: data.gender || null,
        placeOfBirth: data.placeOfBirth,
        birthRegionId: data.birthRegionId || null,
        birthType: data.birthType || null,
        motherName: data.motherName,
        fatherName: data.fatherName,
        informantName: data.informantName || null,
        informantContact,
        registrationCenter: data.registrationCenter || null,
        attendantName: data.attendantName || null,
        supportingDocumentUrl: supportingDocumentUrl || null,
        verificationNotes: data.verificationNotes || null,
        status: "CERTIFICATE_ISSUED",
        rejectionReason: data.rejectionReason || null,
        createdById: data.createdById,
      }
    });

    const certificateNumber = `CERT-B-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    await tx.certificate.create({
      data: {
        birthRecordId: birth.id,
        certificateNumber,
        issuedById: data.createdById,
      },
    });

    return await tx.birthRecord.findUnique({
      where: { id: birth.id },
      include: getBirthInclude(),
    });
  });

  if (!record) throw new Error("Failed to create birth record.");

  return mapBirthRecord(record);
}

export async function createDeathRecord(data: LegacyDeathRecord & { createdById: string }): Promise<DeathRecord> {
  const fullName = data.fullName?.trim() || data.deceasedName?.trim();
  const dateOfDeath = new Date(data.dateOfDeath);
  const dateOfBirth = data.dateOfBirth
    ? new Date(data.dateOfBirth)
    : deriveDateOfBirth(data.dateOfDeath, data.ageAtDeath);
  const informantContact = data.informantContact?.trim() || data.contactNumber?.trim();

  if (!fullName) throw new Error("Full name is required.");
  if (Number.isNaN(dateOfDeath.getTime())) throw new Error("A valid date of death is required.");
  if (!dateOfBirth || Number.isNaN(dateOfBirth.getTime())) {
    throw new Error("A valid date of birth is required or age at death must be provided.");
  }
  if (!data.placeOfDeath?.trim()) throw new Error("Place of death is required.");
  if (!data.causeOfDeath?.trim()) throw new Error("Cause of death is required.");
  if (!data.informantName?.trim()) throw new Error("Informant name is required.");
  if (!informantContact) throw new Error("Informant contact is required.");

  const duplicateDeath = data.nationalId?.trim()
    ? await prisma.deathRecord.findFirst({
        where: {
          nationalId: data.nationalId.trim(),
          status: {
            in: ["PENDING_VERIFICATION", "VERIFIED", "NOTIFIED", "CERTIFICATE_ISSUED"],
          },
        },
        select: { id: true },
      })
    : await prisma.deathRecord.findFirst({
        where: {
          fullName: fullName!,
          dateOfDeath,
          placeOfDeath: data.placeOfDeath.trim(),
          informantName: data.informantName.trim(),
          status: {
            in: ["PENDING_VERIFICATION", "VERIFIED", "NOTIFIED", "CERTIFICATE_ISSUED"],
          },
        },
        select: { id: true },
      });

  if (duplicateDeath) {
    throw new Error("A similar death record already exists and is currently being processed.");
  }

  const record = await prisma.deathRecord.create({
    data: {
      fullName,
      dateOfBirth,
      dateOfDeath,
      timeOfDeath: data.timeOfDeath || null,
      gender: data.gender || null,
      ageAtDeath: data.ageAtDeath ?? null,
      placeOfDeath: data.placeOfDeath,
      deathRegionId: data.deathRegionId || null,
      causeOfDeath: data.causeOfDeath,
      nationalId: data.nationalId || null,
      informantName: data.informantName,
      informantContact,
      informantRelation: data.informantRelation || null,
      doctorReportUrl: data.doctorReportUrl || null,
      status: normalizeStatus(data.status),
      rejectionReason: data.rejectionReason || null,
      createdById: data.createdById,
    },
    include: getDeathInclude(),
  });

  return mapDeathRecord(record);
}

export async function updateRecord(id: string, data: any): Promise<Record> {
  const type = await findRecordType(id);
  if (!type) throw new Error("Record not found.");

  if ("status" in data && data.status) {
    const normalizedStatus = normalizeStatus(data.status);
    assertStatusAllowedForType(type, normalizedStatus);
  }

  if (type === "birth") {
    const record = await prisma.birthRecord.update({
      where: { id },
      data: buildBirthUpdateData(data),
      include: getBirthInclude(),
    });

    return mapBirthRecord(record);
  }

  const record = await prisma.deathRecord.update({
    where: { id },
    data: buildDeathUpdateData(data),
    include: getDeathInclude(),
  });

  return mapDeathRecord(record);
}

export async function getRecord(id: string): Promise<Record | null> {
  const birth = await prisma.birthRecord.findUnique({
    where: { id },
    include: getBirthInclude(),
  });
  if (birth) return mapBirthRecord(birth);

  const death = await prisma.deathRecord.findUnique({
    where: { id },
    include: getDeathInclude(),
  });
  return death ? mapDeathRecord(death) : null;
}

export async function getRecordsByRegistrar(createdById: string): Promise<Record[]> {
  const [births, deaths] = await Promise.all([
    prisma.birthRecord.findMany({
      where: { createdById },
      include: getBirthInclude(),
      orderBy: { createdAt: "desc" },
    }),
    prisma.deathRecord.findMany({
      where: { createdById },
      include: getDeathInclude(),
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return sortRecords([...births.map(mapBirthRecord), ...deaths.map(mapDeathRecord)]);
}

export async function getPendingRecords(): Promise<Record[]> {
  const [births, deaths] = await Promise.all([
    prisma.birthRecord.findMany({
      where: { status: "PENDING_VERIFICATION" },
      include: getBirthInclude(),
      orderBy: { createdAt: "desc" },
    }),
    prisma.deathRecord.findMany({
      where: { status: "PENDING_VERIFICATION" },
      include: getDeathInclude(),
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return sortRecords([...births.map(mapBirthRecord), ...deaths.map(mapDeathRecord)]);
}

export async function getAllRecords(): Promise<Record[]> {
  const [births, deaths] = await Promise.all([
    prisma.birthRecord.findMany({
      include: getBirthInclude(),
      orderBy: { createdAt: "desc" },
    }),
    prisma.deathRecord.findMany({
      include: getDeathInclude(),
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return sortRecords([...births.map(mapBirthRecord), ...deaths.map(mapDeathRecord)]);
}

export async function getRecordsByStatus(status: string): Promise<Record[]> {
  const normalizedStatus = normalizeStatus(status) as any;
  const [births, deaths] = await Promise.all([
    prisma.birthRecord.findMany({
      where: { status: normalizedStatus },
      include: getBirthInclude(),
      orderBy: { createdAt: "desc" },
    }),
    prisma.deathRecord.findMany({
      where: { status: normalizedStatus },
      include: getDeathInclude(),
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return sortRecords([...births.map(mapBirthRecord), ...deaths.map(mapDeathRecord)]);
}


export async function approveRecord(id: string, verifiedById?: string): Promise<Record> {
  const type = await findRecordType(id);
  if (!type) throw new Error("Record not found.");

  if (type === "birth") {
    const current = await prisma.birthRecord.findUnique({
      where: { id },
      select: { status: true },
    });
    if (!current) throw new Error("Record not found.");
    if (current.status !== "PENDING_VERIFICATION") {
      throw new Error(`Record cannot be approved from status ${current.status}.`);
    }
  } else {
    const current = await prisma.deathRecord.findUnique({
      where: { id },
      select: { status: true },
    });
    if (!current) throw new Error("Record not found.");
    if (current.status !== "PENDING_VERIFICATION") {
      throw new Error(`Record cannot be approved from status ${current.status}.`);
    }

    // Trigger institutional notifications (SSNIT, Banks, etc.)
    await notifyInstitutions(id);
  }

  return updateRecord(id, {
    status: "VERIFIED",
    verifiedById: verifiedById || null,
    rejectionReason: null,
  });
}

export async function rejectRecord(id: string, reason: string, verifiedById?: string): Promise<Record> {
  const type = await findRecordType(id);
  if (!type) throw new Error("Record not found.");

  if (type === "birth") {
    const current = await prisma.birthRecord.findUnique({
      where: { id },
      select: { status: true },
    });
    if (!current) throw new Error("Record not found.");
    if (current.status !== "PENDING_VERIFICATION") {
      throw new Error(`Record cannot be rejected from status ${current.status}.`);
    }
  } else {
    const current = await prisma.deathRecord.findUnique({
      where: { id },
      select: { status: true },
    });
    if (!current) throw new Error("Record not found.");
    if (current.status !== "PENDING_VERIFICATION") {
      throw new Error(`Record cannot be rejected from status ${current.status}.`);
    }
  }

  return updateRecord(id, {
    status: "REJECTED",
    rejectionReason: reason,
    verifiedById: verifiedById || null,
  });
}

export async function deleteRecord(id: string): Promise<void> {
  const type = await findRecordType(id);
  if (!type) throw new Error("Record not found.");

  if (type === "birth") {
    await prisma.birthRecord.delete({ where: { id } });
    return;
  }

  await prisma.deathRecord.delete({ where: { id } });
}
