# Birth & Death Registration System (BDRS) - System Testing Report

This report outlines the automated system integration testing and manual interface validation conducted to verify that all vital record management modules function correctly in isolation and integration.

---

## 1. Overview of Testing Approach

Testing is conducted using **Node.js (v22) Native Test Runner** and **TypeScript (`tsx`)** to run tests in isolation against the Postgres database using the Prisma ORM client. 

For each test run:
1. A clean, isolated environment is initialized by creating mock registry officers and administrators.
2. The entire lifecycle of birth and death records is simulated (from submission to verification, certificate issuance, and institution notification).
3. Post-execution, the database is restored to its original state by deleting all test records.

---

## 2. Testing Tools Used

To perform automated integration testing and visual verification, the following tools and frameworks were utilized:

| Tool / Library | Category | Description / Purpose |
| :--- | :--- | :--- |
| **Node.js Native Test Runner (`node:test`)** | Test Runner | Native, high-performance testing framework built into Node.js (v22). Used to isolate, describe, and execute backend integration tests without external test dependencies. |
| **Node.js Strict Assertions (`node:assert/strict`)** | Assertion Library | Native strict assertions engine. Used to validate database response matches, status updates, and user session payload contents. |
| **TypeScript CLI Execution Tool (`tsx`)** | Test Runner CLI | Lightweight TypeScript execution engine. Allows direct in-memory execution of TypeScript test files (`npx tsx --test`) without manual compilation steps. |
| **Prisma ORM Client (`@prisma/client`)** | Database Connectivity | Communicates directly with the PostgreSQL database to create mock test accounts, insert vital records, perform verification updates, and ensure correct data state verification. |
| **Playwright / Chromium Automation** | Visual Verification | Used by the browser runner to load dashboard pages, interact with form fields, simulate logins, and export pixel-perfect module screenshots (`.png`). |

---

## 3. Tested Modules & Isolation Verification

The following six modules have been fully verified with automated test suites:

### 1. User Authentication Module
* **What is verified:**
  * Password hashing and credential verification (`bcrypt`).
  * Sign-in validation for correct roles (`REGISTRY_OFFICER`, `ADMINISTRATOR`, `INSTITUTION_OFFICER`).
  * Security session payload creation and token decoding/verification using JWT.
* **Testing Code File:** `src/tests/system.test.ts` (Subtest: `Module 1`)

### 2. Birth Registration Module
* **What is verified:**
  * Submission of a birth record by an authorized Registry Officer.
  * Validation that the initial record state is `PENDING_VERIFICATION`.
  * Integrity of data fields (child details, parents, informant details, and hospital registry center).
* **Testing Code File:** `src/tests/system.test.ts` (Subtest: `Module 2`)

### 3. Death Registration Module
* **What is verified:**
  * Submission of a death record by an authorized Registry Officer.
  * Validation that the initial record state is `PENDING_VERIFICATION`.
  * Integrity of data fields (deceased name, date of death, place of death, cause of death, and informant contact).
* **Testing Code File:** `src/tests/system.test.ts` (Subtest: `Module 3`)

### 4. Verification Module
* **What is verified:**
  * Verification of pending birth and death records by an authorized Administrator.
  * Update of record status to `VERIFIED` and setting the administrator's ID as `verifiedById` for auditing.
* **Testing Code File:** `src/tests/system.test.ts` (Subtest: `Module 4`)

### 5. Certificate Generation Module
* **What is verified:**
  * Issuance of unique certificates linked directly to verified birth and death records.
  * Auto-generation of Certificate numbers.
  * Transition of record status to `CERTIFICATE_ISSUED`.
* **Testing Code File:** `src/tests/system.test.ts` (Subtest: `Module 5`)

### 6. Notification Module
* **What is verified:**
  * Distribution of death alerts to registered institutions (Banks, SSNIT/Pension, Unity Life Insurance).
  * Auto-creation of database alerts linked to the deceased person.
  * Transition of record status to `NOTIFIED`.
* **Testing Code File:** `src/tests/system.test.ts` (Subtest: `Module 6`)

---

## 4. Automated Test Execution & Results

### Running the Tests
You can execute the automated test suite locally by running:
```bash
npm test
```

### Successful Test Run Console Output (TAP Format)
```text
TAP version 13
# Setting up test users in the database...
# Subtest: DOB Project System Integration Tests
    # Subtest: Module 1: User Authentication Module
        # Subtest: should successfully authenticate valid credentials
        ok 1 - should successfully authenticate valid credentials
          ---
          duration_ms: 417.98
          type: 'test'
          ...
        # Subtest: should fail authentication with invalid credentials
        ok 2 - should fail authentication with invalid credentials
          ---
          duration_ms: 291.74
          type: 'test'
          ...
        # Subtest: should correctly sign and verify a session JWT
        ok 3 - should correctly sign and verify a session JWT
          ---
          duration_ms: 24.97
          type: 'test'
          ...
        1..3
    ok 1 - Module 1: User Authentication Module
      ---
      duration_ms: 746.49
      type: 'suite'
      ...
    # Subtest: Module 2: Birth Registration Module
        # Subtest: should allow a registry officer to submit a birth record with pending status
        ok 1 - should allow a registry officer to submit a birth record with pending status
          ---
          duration_ms: 28.10
          type: 'test'
          ...
        1..1
    ok 2 - Module 2: Birth Registration Module
      ---
      duration_ms: 28.85
      type: 'suite'
      ...
    # Subtest: Module 3: Death Registration Module
        # Subtest: should allow a registry officer to submit a death record with pending status
        ok 1 - should allow a registry officer to submit a death record with pending status
          ---
          duration_ms: 18.64
          type: 'test'
          ...
        1..1
    ok 3 - Module 3: Death Registration Module
      ---
      duration_ms: 20.07
      type: 'suite'
      ...
    # Subtest: Module 4: Verification / Review Module
        # Subtest: should allow an administrator to verify a pending birth record
        ok 1 - should allow an administrator to verify a pending birth record
          ---
          duration_ms: 25.19
          type: 'test'
          ...
        # Subtest: should allow an administrator to verify a pending death record
        ok 2 - should allow an administrator to verify a pending death record
          ---
          duration_ms: 16.44
          type: 'test'
          ...
        1..2
    ok 4 - Module 4: Verification / Review Module
      ---
      duration_ms: 47.22
      type: 'suite'
      ...
    # Subtest: Module 5: Certificate Generation Module
        # Subtest: should allow generating a birth certificate for verified record
        ok 1 - should allow generating a birth certificate for verified record
          ---
          duration_ms: 23.92
          type: 'test'
          ...
        # Subtest: should allow generating a death certificate for verified record
        ok 2 - should allow generating a death certificate for verified record
          ---
          duration_ms: 11.08
          type: 'test'
          ...
        1..2
    ok 5 - Module 5: Certificate Generation Module
      ---
      duration_ms: 35.63
      type: 'suite'
      ...
# Cleaning up test records from database...
    # Subtest: Module 6: Notification Management Module
        # Subtest: should route notifications to registered institutions upon death certificate issuance
        ok 1 - should route notifications to registered institutions upon death certificate issuance
          ---
          duration_ms: 77.17
          type: 'test'
          ...
        1..1
    ok 6 - Module 6: Notification Management Module
      ---
      duration_ms: 77.54
      type: 'suite'
      ...
# Cleanup complete!
    1..6
ok 1 - DOB Project System Integration Tests
  ---
  duration_ms: 4639.53
  type: 'suite'
  ...
1..1
# tests 10
# suites 7
# pass 10
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 16478.51
```

---

## 5. Visual Verification (Screenshots)

We have captured and exported high-resolution screenshots of the UI modules for documentation. You can find them in the project folder under:
📁 `/screenshots/`

### Available Images:
1. **User Authentication Module**
   - **File:** `/screenshots/login_page_1780534685186.png`
   - **Details:** The system login screen, prompting secure credentials (email and password) with support for showing/hiding passwords.
2. **Birth Registration Module**
   - **File:** `/screenshots/birth_registration_1780535130620.png`
   - **Details:** The form filled by Registry Officers to submit new birth registrations (includes child name, date/time, place of birth, parents' details, and supporting documents upload).
3. **Death Registration Module**
   - **File:** `/screenshots/death_registration_1780535143225.png`
   - **Details:** Form for submitting death records (including cause of death, age, date/time of death, and informant contacts).
4. **Registry Officer Records View**
   - **File:** `/screenshots/my_submissions_1780535181686.png`
   - **Details:** Dashboard for Registry Officers tracking all birth and death records they submitted along with verification status (`Pending`, `Verified`, `Certificate Issued`).
5. **System Architecture Diagram**
   - **File:** `/screenshots/dob_system_architecture_1780531698431.png`
   - **Details:** Conceptual diagram detailing role-based workflows (Admin vs Registry Officer) and data connectivity flow.
6. **Authentication & Security Module Diagram**
   - **File:** `/screenshots/auth_security_module_1780531998789.png`
   - **Details:** Details the JWT authentication session handshake.
7. **Certificate Management Module Card**
   - **File:** `/screenshots/certificate_management_module_1780532520665.png`
   - **Details:** Visual card showing certificate database logic and fields.
8. **Notification Management Module Card**
   - **File:** `/screenshots/notification_management_module_1780531936999.png`
   - **Details:** Visual representation of how death notifications propagate to financial and insurance institutions.
9. **Database Connectivity Module Card**
   - **File:** `/screenshots/prisma_connectivity_module_1780531789683.png`
   - **Details:** Code snippet diagram of the Prisma + PostgreSQL client instance (`src/lib/prisma.ts`).
