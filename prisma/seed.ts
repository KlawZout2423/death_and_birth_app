import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  InstitutionType,
  NotificationStatus,
  PrismaClient,
  RecordStatus,
  Role,
} from "../generated/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

async function main() {
  console.log("Cleaning up database...");
  await prisma.notification.deleteMany();
  await prisma.nextOfKin.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.birthRecord.deleteMany();
  await prisma.deathRecord.deleteMany();
  // Keep Users, Institutions, and Regions for stability

  const passwordHash = await hashPassword("Password123!");

  // Ensure Regions exist
  const [ga, ash, west, north] = await Promise.all([
    prisma.region.upsert({ where: { code: "GA" }, update: {}, create: { code: "GA", name: "Greater Accra", country: "Ghana" } }),
    prisma.region.upsert({ where: { code: "AS" }, update: {}, create: { code: "AS", name: "Ashanti", country: "Ghana" } }),
    prisma.region.upsert({ where: { code: "WE" }, update: {}, create: { code: "WE", name: "Western", country: "Ghana" } }),
    prisma.region.upsert({ where: { code: "NO" }, update: {}, create: { code: "NO", name: "Northern", country: "Ghana" } }),
  ]);

  // Ensure Institutions exist
  const registry = await prisma.institution.upsert({
    where: { id: "seed-registry-institution" },
    update: { type: InstitutionType.BANK },
    create: { id: "seed-registry-institution", name: "Central Civil Registry", type: InstitutionType.BANK, email: "registry@dob.local" },
  });

  const bank = await prisma.institution.upsert({
    where: { id: "seed-bank-institution" },
    update: {},
    create: { id: "seed-bank-institution", name: "First National Bank", type: InstitutionType.BANK, email: "bank@dob.local" },
  });

  // Users
  const admin = await prisma.user.upsert({
    where: { email: "rg@dob.local" },
    update: { name: "Registrar General", role: Role.ADMINISTRATOR },
    create: { email: "rg@dob.local", name: "Registrar General", password: passwordHash, role: Role.ADMINISTRATOR, institutionId: registry.id, emailVerified: true },
  });

  const officer = await prisma.user.upsert({
    where: { email: "registry.officer@dob.local" },
    update: { name: "Registry Officer", role: Role.REGISTRY_OFFICER },
    create: { email: "registry.officer@dob.local", name: "Registry Officer", password: passwordHash, role: Role.REGISTRY_OFFICER, institutionId: registry.id, emailVerified: true },
  });

  console.log("Seeding Birth Records...");
  const birthData = [
    { childName: "Kofi Mensah", birthRegionId: ga.id, dateOfBirth: "2026-04-10", status: RecordStatus.VERIFIED },
    { childName: "Abena Mansa", birthRegionId: ga.id, dateOfBirth: "2026-04-12", status: RecordStatus.VERIFIED },
    { childName: "Kwame Appiah", birthRegionId: ga.id, dateOfBirth: "2026-05-01", status: RecordStatus.PENDING_VERIFICATION },
    { childName: "Esi Boateng", birthRegionId: ash.id, dateOfBirth: "2026-03-15", status: RecordStatus.VERIFIED },
    { childName: "Yaw Owusu", birthRegionId: ash.id, dateOfBirth: "2026-03-20", status: RecordStatus.VERIFIED },
    { childName: "Akua Konadu", birthRegionId: ash.id, dateOfBirth: "2026-04-05", status: RecordStatus.PENDING_VERIFICATION },
    { childName: "Baaba Quansah", birthRegionId: west.id, dateOfBirth: "2026-02-10", status: RecordStatus.VERIFIED },
    { childName: "Kojo Annan", birthRegionId: west.id, dateOfBirth: "2026-03-01", status: RecordStatus.VERIFIED },
    { childName: "Iddrisu Sule", birthRegionId: north.id, dateOfBirth: "2026-01-20", status: RecordStatus.VERIFIED },
    { childName: "Zainab Fuseini", birthRegionId: north.id, dateOfBirth: "2026-02-15", status: RecordStatus.VERIFIED },
    { childName: "Ama Serwaa", birthRegionId: ga.id, dateOfBirth: "2026-05-10", status: RecordStatus.PENDING_VERIFICATION },
    { childName: "Osei Kyeremeh", birthRegionId: ash.id, dateOfBirth: "2026-05-08", status: RecordStatus.PENDING_VERIFICATION },
  ];

  for (const b of birthData) {
    await prisma.birthRecord.create({
      data: {
        ...b,
        dateOfBirth: new Date(b.dateOfBirth),
        placeOfBirth: "Regional Hospital",
        motherName: "Mary Mother",
        fatherName: "John Father",
        createdById: officer.id,
      },
    });
  }

  console.log("Seeding Death Records...");
  const deathData = [
    { fullName: "Osei Tutu", deathRegionId: ash.id, dateOfDeath: "2026-04-20", status: RecordStatus.CERTIFICATE_ISSUED },
    { fullName: "Yaa Asantewaa II", deathRegionId: ash.id, dateOfDeath: "2026-04-25", status: RecordStatus.VERIFIED },
    { fullName: "Emmanuel Quaye", deathRegionId: ga.id, dateOfDeath: "2026-05-02", status: RecordStatus.PENDING_VERIFICATION },
    { fullName: "Grace Mensah", deathRegionId: ga.id, dateOfDeath: "2026-04-15", status: RecordStatus.CERTIFICATE_ISSUED },
    { fullName: "Samuel Tetteh", deathRegionId: ga.id, dateOfDeath: "2026-03-10", status: RecordStatus.VERIFIED },
    { fullName: "Patrick Edusei", deathRegionId: west.id, dateOfDeath: "2026-03-22", status: RecordStatus.CERTIFICATE_ISSUED },
    { fullName: "Fatima Adam", deathRegionId: north.id, dateOfDeath: "2026-02-28", status: RecordStatus.CERTIFICATE_ISSUED },
    { fullName: "Ibrahim Mohammed", deathRegionId: north.id, dateOfDeath: "2026-03-05", status: RecordStatus.VERIFIED },
  ];

  for (const d of deathData) {
    const record = await prisma.deathRecord.create({
      data: {
        ...d,
        dateOfBirth: new Date("1970-01-01"),
        dateOfDeath: new Date(d.dateOfDeath),
        placeOfDeath: "General Ward",
        causeOfDeath: "Natural Causes",
        informantName: "Relative",
        informantContact: "+233000000",
        createdById: officer.id,
      },
    });

    if (d.status === RecordStatus.CERTIFICATE_ISSUED) {
      await prisma.certificate.create({
        data: {
          deathRecordId: record.id,
          certificateNumber: `CERT-${record.id.slice(-5).toUpperCase()}`,
          issuedById: admin.id,
          issueDate: new Date(),
        },
      });
    }
  }

  console.log("Seed complete. Analytics now shows real, varied data across all regions.");
  console.table([
    { role: "REGISTRAR GENERAL", email: "rg@dob.local", password: "Password123!" },
    { role: "REGISTRY OFFICER", email: "registry.officer@dob.local", password: "Password123!" }
  ]);
}

main().catch(console.error).finally(() => prisma.$disconnect());
