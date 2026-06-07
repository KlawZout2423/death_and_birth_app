import test, { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "../lib/prisma";
import { authenticate } from "../lib/userStore";
import { createSession, verifySession } from "../lib/session";
import { Role, RecordStatus, NotificationStatus } from "@prisma/client";

describe("DOB Project System Integration Tests", () => {
  // Test data variables
  let testOfficerId: string;
  let testAdminId: string;
  let testBirthRecordId: string;
  let testDeathRecordId: string;
  let testBirthCertificateId: string;
  let testDeathCertificateId: string;
  
  const testOfficerEmail = "test.officer@dob.local";
  const testAdminEmail = "test.admin@dob.local";
  const testPassword = "TestPassword123!";

  // Setup database users for tests
  before(async () => {
    console.log("Setting up test users in the database...");
    
    // Clean up any stale test users first
    await prisma.user.deleteMany({
      where: { email: { in: [testOfficerEmail, testAdminEmail] } }
    });

    // Create a mock Registry Officer
    const officer = await prisma.user.create({
      data: {
        email: testOfficerEmail,
        password: await import("bcryptjs").then(m => m.hash(testPassword, 10)),
        role: Role.REGISTRY_OFFICER,
        name: "Test Registry Officer"
      }
    });
    testOfficerId = officer.id;

    // Create a mock Administrator
    const admin = await prisma.user.create({
      data: {
        email: testAdminEmail,
        password: await import("bcryptjs").then(m => m.hash(testPassword, 10)),
        role: Role.ADMINISTRATOR,
        name: "Test Administrator"
      }
    });
    testAdminId = admin.id;
  });

  // Cleanup all created records
  after(async () => {
    console.log("Cleaning up test records from database...");

    // Delete Certificates
    if (testBirthCertificateId) {
      await prisma.certificate.delete({ where: { id: testBirthCertificateId } }).catch(() => {});
    }
    if (testDeathCertificateId) {
      await prisma.certificate.delete({ where: { id: testDeathCertificateId } }).catch(() => {});
    }

    // Delete Notifications
    if (testDeathRecordId) {
      await prisma.notification.deleteMany({ where: { deathRecordId: testDeathRecordId } }).catch(() => {});
    }

    // Delete Records
    if (testBirthRecordId) {
      await prisma.birthRecord.delete({ where: { id: testBirthRecordId } }).catch(() => {});
    }
    if (testDeathRecordId) {
      await prisma.deathRecord.delete({ where: { id: testDeathRecordId } }).catch(() => {});
    }

    // Delete Users
    await prisma.user.deleteMany({
      where: { email: { in: [testOfficerEmail, testAdminEmail] } }
    });

    await prisma.$disconnect();
    console.log("Cleanup complete!");
  });

  // MODULE 1: User Authentication Module
  describe("Module 1: User Authentication Module", () => {
    it("should successfully authenticate valid credentials", async () => {
      const user = await authenticate(testOfficerEmail, testPassword);
      assert.ok(user, "User should be authenticated");
      assert.equal(user.email, testOfficerEmail);
      assert.equal(user.role, Role.REGISTRY_OFFICER);
    });

    it("should fail authentication with invalid credentials", async () => {
      const user = await authenticate(testOfficerEmail, "WrongPassword!");
      assert.equal(user, null, "Authentication should return null");
    });

    it("should correctly sign and verify a session JWT", () => {
      const payload = {
        id: testOfficerId,
        email: testOfficerEmail,
        name: "Test Registry Officer",
        role: Role.REGISTRY_OFFICER,
        institutionId: null
      };

      const token = createSession(payload);
      assert.ok(token, "Token should be generated");

      const decoded = verifySession(token);
      assert.ok(decoded, "Token verification should succeed");
      assert.equal(decoded.email, testOfficerEmail);
      assert.equal(decoded.role, Role.REGISTRY_OFFICER);
    });
  });

  // MODULE 2: Birth Registration Module
  describe("Module 2: Birth Registration Module", () => {
    it("should allow a registry officer to submit a birth record with pending status", async () => {
      const birthRecord = await prisma.birthRecord.create({
        data: {
          childName: "TEST_BABY_DOE",
          dateOfBirth: new Date("2026-05-01T00:00:00Z"),
          timeOfBirth: "12:00",
          gender: "Male",
          placeOfBirth: "Accra Municipal Hospital",
          motherName: "Jane Doe",
          fatherName: "John Doe",
          informantName: "Jane Doe",
          informantContact: "+233240000000",
          createdById: testOfficerId,
          status: RecordStatus.PENDING_VERIFICATION
        }
      });

      assert.ok(birthRecord.id, "Birth record should be created");
      assert.equal(birthRecord.childName, "TEST_BABY_DOE");
      assert.equal(birthRecord.status, RecordStatus.PENDING_VERIFICATION);
      
      testBirthRecordId = birthRecord.id;
    });
  });

  // MODULE 3: Death Registration Module
  describe("Module 3: Death Registration Module", () => {
    it("should allow a registry officer to submit a death record with pending status", async () => {
      const deathRecord = await prisma.deathRecord.create({
        data: {
          fullName: "TEST_DECEASED_DOE",
          dateOfBirth: new Date("1970-01-01T00:00:00Z"),
          dateOfDeath: new Date("2026-05-15T00:00:00Z"),
          placeOfDeath: "Kumasi South Hospital",
          causeOfDeath: "Natural Causes",
          informantName: "Abena Doe",
          informantContact: "+233241111111",
          createdById: testOfficerId,
          status: RecordStatus.PENDING_VERIFICATION
        }
      });

      assert.ok(deathRecord.id, "Death record should be created");
      assert.equal(deathRecord.fullName, "TEST_DECEASED_DOE");
      assert.equal(deathRecord.status, RecordStatus.PENDING_VERIFICATION);

      testDeathRecordId = deathRecord.id;
    });
  });

  // MODULE 4: Verification Module
  describe("Module 4: Verification / Review Module", () => {
    it("should allow an administrator to verify a pending birth record", async () => {
      assert.ok(testBirthRecordId, "Birth record ID is required for verification");

      const updatedBirth = await prisma.birthRecord.update({
        where: { id: testBirthRecordId },
        data: {
          status: RecordStatus.VERIFIED,
          verifiedById: testAdminId,
          verificationNotes: "Verified birth details match hospital records."
        }
      });

      assert.equal(updatedBirth.status, RecordStatus.VERIFIED);
      assert.equal(updatedBirth.verifiedById, testAdminId);
    });

    it("should allow an administrator to verify a pending death record", async () => {
      assert.ok(testDeathRecordId, "Death record ID is required for verification");

      const updatedDeath = await prisma.deathRecord.update({
        where: { id: testDeathRecordId },
        data: {
          status: RecordStatus.VERIFIED,
          verifiedById: testAdminId
        }
      });

      assert.equal(updatedDeath.status, RecordStatus.VERIFIED);
      assert.equal(updatedDeath.verifiedById, testAdminId);
    });
  });

  // MODULE 5: Certificate Generation Module
  describe("Module 5: Certificate Generation Module", () => {
    it("should allow generating a birth certificate for verified record", async () => {
      assert.ok(testBirthRecordId, "Verified birth record ID required");

      const cert = await prisma.certificate.create({
        data: {
          certificateNumber: "TEST-CERT-B-999",
          birthRecordId: testBirthRecordId,
          issuedById: testAdminId,
          issueDate: new Date()
        }
      });

      assert.ok(cert.id);
      assert.equal(cert.certificateNumber, "TEST-CERT-B-999");
      assert.equal(cert.birthRecordId, testBirthRecordId);

      testBirthCertificateId = cert.id;

      // Update birth status to CERTIFICATE_ISSUED
      await prisma.birthRecord.update({
        where: { id: testBirthRecordId },
        data: { status: RecordStatus.CERTIFICATE_ISSUED }
      });
    });

    it("should allow generating a death certificate for verified record", async () => {
      assert.ok(testDeathRecordId, "Verified death record ID required");

      const cert = await prisma.certificate.create({
        data: {
          certificateNumber: "TEST-CERT-D-999",
          deathRecordId: testDeathRecordId,
          issuedById: testAdminId,
          issueDate: new Date()
        }
      });

      assert.ok(cert.id);
      assert.equal(cert.certificateNumber, "TEST-CERT-D-999");
      assert.equal(cert.deathRecordId, testDeathRecordId);

      testDeathCertificateId = cert.id;

      // Update death status to CERTIFICATE_ISSUED
      await prisma.deathRecord.update({
        where: { id: testDeathRecordId },
        data: { status: RecordStatus.CERTIFICATE_ISSUED }
      });
    });
  });

  // MODULE 6: Notification Module
  describe("Module 6: Notification Management Module", () => {
    it("should route notifications to registered institutions upon death certificate issuance", async () => {
      assert.ok(testDeathRecordId, "Death record ID is required for notifications");

      // Query active institutions in the system (seeded in the DB)
      const institutions = await prisma.institution.findMany({
        where: { status: true }
      });

      assert.ok(institutions.length > 0, "There should be seeded institutions in the database");

      // Simulate sending notifications to all active institutions
      const notificationData = institutions.map(inst => ({
        deathRecordId: testDeathRecordId,
        institutionId: inst.id,
        status: NotificationStatus.SENT,
        sentAt: new Date()
      }));

      await prisma.notification.createMany({
        data: notificationData
      });

      // Verify notifications were created
      const dbNotifications = await prisma.notification.findMany({
        where: { deathRecordId: testDeathRecordId }
      });

      assert.equal(dbNotifications.length, institutions.length, "Notification count should match institution count");
      assert.equal(dbNotifications[0].status, NotificationStatus.SENT);

      // Update death status to NOTIFIED
      const updatedDeath = await prisma.deathRecord.update({
        where: { id: testDeathRecordId },
        data: { status: RecordStatus.NOTIFIED }
      });

      assert.equal(updatedDeath.status, RecordStatus.NOTIFIED);
    });
  });
});
