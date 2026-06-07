require("dotenv/config");

const bcrypt = require("bcryptjs");
const { PrismaPg } = require("@prisma/adapter-pg");
const {
  InstitutionType,
  NotificationStatus,
  PrismaClient,
  RecordStatus,
  Role,
} = require("@prisma/client");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function main() {
  const passwordHash = await hashPassword("Password123!");

  const [greaterAccra, ashanti, western, northern] = await Promise.all([
    prisma.region.upsert({
      where: { code: "GA" },
      update: { name: "Greater Accra", country: "Ghana", isActive: true },
      create: { code: "GA", name: "Greater Accra", country: "Ghana", isActive: true },
    }),
    prisma.region.upsert({
      where: { code: "AS" },
      update: { name: "Ashanti", country: "Ghana", isActive: true },
      create: { code: "AS", name: "Ashanti", country: "Ghana", isActive: true },
    }),
    prisma.region.upsert({
      where: { code: "WE" },
      update: { name: "Western", country: "Ghana", isActive: true },
      create: { code: "WE", name: "Western", country: "Ghana", isActive: true },
    }),
    prisma.region.upsert({
      where: { code: "NO" },
      update: { name: "Northern", country: "Ghana", isActive: true },
      create: { code: "NO", name: "Northern", country: "Ghana", isActive: true },
    }),
  ]);

  const registry = await prisma.institution.upsert({
    where: { id: "seed-registry-institution" },
    update: {
      name: "Central Civil Registry",
      type: InstitutionType.BANK,
      email: "registry@dob.local",
      status: true,
    },
    create: {
      id: "seed-registry-institution",
      name: "Central Civil Registry",
      type: InstitutionType.BANK,
      email: "registry@dob.local",
      status: true,
    },
  });

  const bank = await prisma.institution.upsert({
    where: { id: "seed-bank-institution" },
    update: {
      name: "First National Bank",
      type: InstitutionType.BANK,
      email: "bank@dob.local",
      status: true,
    },
    create: {
      id: "seed-bank-institution",
      name: "First National Bank",
      type: InstitutionType.BANK,
      email: "bank@dob.local",
      status: true,
    },
  });

  const insurance = await prisma.institution.upsert({
    where: { id: "seed-insurance-institution" },
    update: {
      name: "Unity Life Insurance",
      type: InstitutionType.INSURANCE,
      email: "insurance@dob.local",
      status: true,
    },
    create: {
      id: "seed-insurance-institution",
      name: "Unity Life Insurance",
      type: InstitutionType.INSURANCE,
      email: "insurance@dob.local",
      status: true,
    },
  });

  const pension = await prisma.institution.upsert({
    where: { id: "seed-pension-institution" },
    update: {
      name: "National Pension Fund",
      type: InstitutionType.PENSION,
      email: "pension@dob.local",
      status: true,
    },
    create: {
      id: "seed-pension-institution",
      name: "National Pension Fund",
      type: InstitutionType.PENSION,
      email: "pension@dob.local",
      status: true,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@dob.local" },
    update: {
      name: "System Administrator",
      password: passwordHash,
      role: Role.ADMINISTRATOR,
      institutionId: registry.id,
    },
    create: {
      email: "admin@dob.local",
      name: "System Administrator",
      password: passwordHash,
      role: Role.ADMINISTRATOR,
      institutionId: registry.id,
    },
  });

  const registryOfficer = await prisma.user.upsert({
    where: { email: "registry.officer@dob.local" },
    update: {
      name: "Registry Officer",
      password: passwordHash,
      role: Role.REGISTRY_OFFICER,
      institutionId: registry.id,
    },
    create: {
      email: "registry.officer@dob.local",
      name: "Registry Officer",
      password: passwordHash,
      role: Role.REGISTRY_OFFICER,
      institutionId: registry.id,
    },
  });

  const bankOfficer = await prisma.user.upsert({
    where: { email: "bank.officer@dob.local" },
    update: {
      name: "Bank Officer",
      password: passwordHash,
      role: Role.INSTITUTION_OFFICER,
      institutionId: bank.id,
    },
    create: {
      email: "bank.officer@dob.local",
      name: "Bank Officer",
      password: passwordHash,
      role: Role.INSTITUTION_OFFICER,
      institutionId: bank.id,
    },
  });

  const insuranceOfficer = await prisma.user.upsert({
    where: { email: "insurance.officer@dob.local" },
    update: {
      name: "Insurance Officer",
      password: passwordHash,
      role: Role.INSTITUTION_OFFICER,
      institutionId: insurance.id,
    },
    create: {
      email: "insurance.officer@dob.local",
      name: "Insurance Officer",
      password: passwordHash,
      role: Role.INSTITUTION_OFFICER,
      institutionId: insurance.id,
    },
  });

  const pensionOfficer = await prisma.user.upsert({
    where: { email: "pension.officer@dob.local" },
    update: {
      name: "Pension Officer",
      password: passwordHash,
      role: Role.INSTITUTION_OFFICER,
      institutionId: pension.id,
    },
    create: {
      email: "pension.officer@dob.local",
      name: "Pension Officer",
      password: passwordHash,
      role: Role.INSTITUTION_OFFICER,
      institutionId: pension.id,
    },
  });

  const existingRecord = await prisma.deathRecord.findFirst({
    where: { nationalId: "99010112345" },
    select: { id: true },
  });

  const deathRecord = existingRecord
    ? await prisma.deathRecord.update({
        where: { id: existingRecord.id },
        data: {
          fullName: "John Doe",
          dateOfBirth: new Date("1990-01-01T00:00:00.000Z"),
          dateOfDeath: new Date("2026-03-10T00:00:00.000Z"),
          placeOfDeath: "Reykjavik General Hospital",
          deathRegionId: ashanti.id,
          causeOfDeath: "Cardiac arrest",
          nationalId: "99010112345",
          informantName: "Jane Doe",
          informantContact: "+3547000001",
          doctorReportUrl: "https://example.com/reports/john-doe.pdf",
          status: RecordStatus.CERTIFICATE_ISSUED,
          createdById: registryOfficer.id,
          verifiedById: admin.id,
        },
      })
    : await prisma.deathRecord.create({
        data: {
          fullName: "John Doe",
          dateOfBirth: new Date("1990-01-01T00:00:00.000Z"),
          dateOfDeath: new Date("2026-03-10T00:00:00.000Z"),
          placeOfDeath: "Reykjavik General Hospital",
          deathRegionId: ashanti.id,
          causeOfDeath: "Cardiac arrest",
          nationalId: "99010112345",
          informantName: "Jane Doe",
          informantContact: "+3547000001",
          doctorReportUrl: "https://example.com/reports/john-doe.pdf",
          status: RecordStatus.CERTIFICATE_ISSUED,
          createdById: registryOfficer.id,
          verifiedById: admin.id,
        },
      });

  const existingBirthRecord = await prisma.birthRecord.findFirst({
    where: { childName: "Ama Doe" },
    select: { id: true },
  });

  await (existingBirthRecord
    ? prisma.birthRecord.update({
        where: { id: existingBirthRecord.id },
        data: {
          childName: "Ama Doe",
          dateOfBirth: new Date("2026-03-09T00:00:00.000Z"),
          timeOfBirth: "06:45",
          gender: "Female",
          placeOfBirth: "Ridge Regional Hospital",
          birthRegionId: greaterAccra.id,
          birthType: "Single",
          motherName: "Mary Doe",
          fatherName: "Kwesi Doe",
          informantName: "Mary Doe",
          informantContact: "+233240000001",
          registrationCenter: "Accra Metro Registry",
          attendantName: "Midwife Abena",
          supportingDocumentUrl: "https://example.com/reports/ama-doe-birth-slip.pdf",
          verificationNotes: "Clinic slip and parental declaration reviewed.",
          status: RecordStatus.PENDING_VERIFICATION,
          createdById: registryOfficer.id,
        },
      })
    : prisma.birthRecord.create({
        data: {
          childName: "Ama Doe",
          dateOfBirth: new Date("2026-03-09T00:00:00.000Z"),
          timeOfBirth: "06:45",
          gender: "Female",
          placeOfBirth: "Ridge Regional Hospital",
          birthRegionId: greaterAccra.id,
          birthType: "Single",
          motherName: "Mary Doe",
          fatherName: "Kwesi Doe",
          informantName: "Mary Doe",
          informantContact: "+233240000001",
          registrationCenter: "Accra Metro Registry",
          attendantName: "Midwife Abena",
          supportingDocumentUrl: "https://example.com/reports/ama-doe-birth-slip.pdf",
          verificationNotes: "Clinic slip and parental declaration reviewed.",
          status: RecordStatus.PENDING_VERIFICATION,
          createdById: registryOfficer.id,
        },
      }));

  const extraDeaths = [
    {
      nationalId: "88020112345",
      fullName: "Kwame Mensah",
      dateOfBirth: new Date("1988-02-01T00:00:00.000Z"),
      dateOfDeath: new Date("2026-02-14T00:00:00.000Z"),
      placeOfDeath: "Takoradi Regional Hospital",
      deathRegionId: western.id,
      causeOfDeath: "Stroke",
      informantName: "Akosua Mensah",
      informantContact: "+233240111111",
      status: RecordStatus.NOTIFIED,
    },
    {
      nationalId: "76051112345",
      fullName: "Abena Kusi",
      dateOfBirth: new Date("1976-05-11T00:00:00.000Z"),
      dateOfDeath: new Date("2026-01-22T00:00:00.000Z"),
      placeOfDeath: "Tamale Teaching Hospital",
      deathRegionId: northern.id,
      causeOfDeath: "Respiratory failure",
      informantName: "Kojo Kusi",
      informantContact: "+233240222222",
      status: RecordStatus.VERIFIED,
    },
  ];

  for (const item of extraDeaths) {
    const existing = await prisma.deathRecord.findFirst({
      where: { nationalId: item.nationalId },
      select: { id: true },
    });

    if (existing) {
      await prisma.deathRecord.update({
        where: { id: existing.id },
        data: {
          ...item,
          createdById: registryOfficer.id,
          verifiedById: admin.id,
        },
      });
    } else {
      await prisma.deathRecord.create({
        data: {
          ...item,
          createdById: registryOfficer.id,
          verifiedById: admin.id,
        },
      });
    }
  }

  const extraBirths = [
    {
      childName: "Yaw Boateng",
      dateOfBirth: new Date("2026-02-18T00:00:00.000Z"),
      placeOfBirth: "Kumasi South Hospital",
      birthRegionId: ashanti.id,
      motherName: "Efua Boateng",
      fatherName: "Kwaku Boateng",
      informantName: "Efua Boateng",
      informantContact: "+233240333333",
      status: RecordStatus.PENDING_VERIFICATION,
    },
    {
      childName: "Nana Asantewaa",
      dateOfBirth: new Date("2026-01-09T00:00:00.000Z"),
      placeOfBirth: "Tamale Central Hospital",
      birthRegionId: northern.id,
      motherName: "Mariam Sule",
      fatherName: "Iddrisu Sule",
      informantName: "Mariam Sule",
      informantContact: "+233240444444",
      status: RecordStatus.VERIFIED,
    },
    {
      childName: "Esi Quansah",
      dateOfBirth: new Date("2026-03-01T00:00:00.000Z"),
      placeOfBirth: "Takoradi Municipal Clinic",
      birthRegionId: western.id,
      motherName: "Abena Quansah",
      fatherName: "Yaw Quansah",
      informantName: "Abena Quansah",
      informantContact: "+233240555555",
      status: RecordStatus.PENDING_VERIFICATION,
    },
  ];

  for (const item of extraBirths) {
    const existing = await prisma.birthRecord.findFirst({
      where: { childName: item.childName },
      select: { id: true },
    });

    if (existing) {
      await prisma.birthRecord.update({
        where: { id: existing.id },
        data: {
          ...item,
          createdById: registryOfficer.id,
        },
      });
    } else {
      await prisma.birthRecord.create({
        data: {
          ...item,
          createdById: registryOfficer.id,
        },
      });
    }
  }

  await prisma.certificate.upsert({
    where: { certificateNumber: "CERT-2026-0001" },
    update: {
      deathRecordId: deathRecord.id,
      issuedById: admin.id,
      issueDate: new Date("2026-03-12T00:00:00.000Z"),
    },
    create: {
      certificateNumber: "CERT-2026-0001",
      deathRecordId: deathRecord.id,
      issuedById: admin.id,
      issueDate: new Date("2026-03-12T00:00:00.000Z"),
    },
  });

  await prisma.notification.deleteMany({
    where: { deathRecordId: deathRecord.id },
  });

  await prisma.notification.createMany({
    data: [
      {
        deathRecordId: deathRecord.id,
        institutionId: bank.id,
        status: NotificationStatus.RECEIVED,
        sentAt: new Date("2026-03-12T08:00:00.000Z"),
        receivedAt: new Date("2026-03-12T09:00:00.000Z"),
        viewedById: bankOfficer.id,
      },
      {
        deathRecordId: deathRecord.id,
        institutionId: insurance.id,
        status: NotificationStatus.SENT,
        sentAt: new Date("2026-03-12T08:05:00.000Z"),
      },
      {
        deathRecordId: deathRecord.id,
        institutionId: pension.id,
        status: NotificationStatus.SENT,
        sentAt: new Date("2026-03-12T08:10:00.000Z"),
      },
    ],
  });

  console.log("Seed complete.");
  console.table([
    {
      role: "ADMINISTRATOR",
      email: "admin@dob.local",
      password: "Password123!",
    },
    {
      role: "REGISTRY_OFFICER",
      email: "registry.officer@dob.local",
      password: "Password123!",
    },
    {
      role: "INSTITUTION_OFFICER",
      email: "bank.officer@dob.local",
      password: "Password123!",
    },
    {
      role: "INSTITUTION_OFFICER",
      email: "insurance.officer@dob.local",
      password: "Password123!",
    },
    {
      role: "INSTITUTION_OFFICER",
      email: "pension.officer@dob.local",
      password: "Password123!",
    },
  ]);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
