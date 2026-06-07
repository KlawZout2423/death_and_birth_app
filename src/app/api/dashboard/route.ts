import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getRecordsByRegistrar, getPendingRecords, getAllRecords } from "@/lib/recordStore";
import { prisma } from "@/lib/prisma";
import { getRecordMetrics, isVerifiedStage, isPendingStage } from "@/lib/recordMetrics";

interface DashboardResponse {
  stats: Record<string, number>;
  recentSubmissions?: Array<{
    id: string;
    name: string;
    type: "birth" | "death";
    date: string;
    status: string;
  }>;
  pendingRecords?: Array<{
    id: string;
    certificateId: string;
    name: string;
    type: "birth" | "death";
    date: string;
  }>;
  approvedRecords?: Array<{
    id: string;
    certificateId: string;
    name: string;
    type: "birth" | "death";
    date: string;
  }>;
}

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const role = url.searchParams.get("role");

    const response: DashboardResponse = { stats: {} };

    if (role === "registrar") {
      const registrarRecords = await getRecordsByRegistrar(session.id);
      const submitted = registrarRecords.filter((r) => isPendingStage(r.status)).length;
      const approved = registrarRecords.filter((r) => isVerifiedStage(r.status)).length;

      response.stats = {
        totalSubmissions: registrarRecords.length,
        pendingVerification: submitted,
        approved,
      };

      response.recentSubmissions = registrarRecords.slice(-5).reverse().map((r) => ({
        id: r.id,
        name: r.type === "birth" ? r.childName : r.deceasedName,
        type: r.type,
        date: r.createdAt,
        status: r.status,
      }));
    } else if (role === "admin") {
      const allRecords = await getAllRecords();
      const allPending = allRecords.filter((r) => isPendingStage(r.status));
      const approvedRecords = allRecords.filter((r) => isVerifiedStage(r.status));
      const certificatesIssuedCount = await prisma.certificate.count();
      const metrics = getRecordMetrics(allRecords);

      response.stats = {
        totalRecords: metrics.totalRecords,
        pendingVerification: metrics.pendingVerification,
        verifiedRecords: metrics.verifiedRecords,
        certificatesIssued: certificatesIssuedCount,
      };

      response.pendingRecords = allPending.map((r) => ({
        id: r.id,
        certificateId: r.type === "birth" ? `BR-${String(r.id).slice(-6).toUpperCase()}` : r.certificateId || `DR-${String(r.id).slice(-6).toUpperCase()}`,
        name: r.type === "birth" ? r.childName : r.deceasedName,
        type: r.type,
        date: r.createdAt,
      }));

      response.approvedRecords = approvedRecords.slice(0, 10).map((r) => ({
        id: r.id,
        certificateId: r.type === "birth" ? `BR-${String(r.id).slice(-6).toUpperCase()}` : r.certificateId || `DR-${String(r.id).slice(-6).toUpperCase()}`,
        name: r.type === "birth" ? r.childName : r.deceasedName,
        type: r.type,
        date: r.approvedAt || r.updatedAt,
      }));
    } else if (role === "officer") {
      const allPending = await getPendingRecords();
      const allRecords = await getAllRecords();
      const approvedRecords = allRecords.filter((r) => isVerifiedStage(r.status));
      const verifiedStageRecords = allRecords.filter((r) => isVerifiedStage(r.status));

      response.stats = {
        pendingReview: allPending.length,
        verifiedRecords: verifiedStageRecords.length,
      };

      response.pendingRecords = allPending.map((r) => ({
        id: r.id,
        certificateId: r.certificateId || `DR-${String(r.id).slice(-6).toUpperCase()}`,
        name: r.type === "birth" ? r.childName : r.deceasedName,
        type: r.type,
        date: r.createdAt,
      }));

      response.approvedRecords = approvedRecords.slice(-10).reverse().map((r) => ({
        id: r.id,
        certificateId: r.type === "birth" ? `BR-${String(r.id).slice(-6).toUpperCase()}` : r.certificateId || `DR-${String(r.id).slice(-6).toUpperCase()}`,
        name: r.type === "birth" ? r.childName : r.deceasedName,
        type: r.type,
        date: r.approvedAt || r.updatedAt,
      }));
    } else if (role === "bank" || role === "ssnit" || role === "insurance") {
      const typeMap: Record<string, "BANK" | "INSURANCE" | "PENSION"> = {
        bank: "BANK",
        insurance: "INSURANCE",
        ssnit: "PENSION",
      };

      const institutionType = typeMap[role];

      const [pendingCount, respondedCount, totalDeaths] = await Promise.all([
        prisma.notification.count({
          where: {
            institution: { type: institutionType },
            status: "SENT",
          },
        }),
        prisma.notification.count({
          where: {
            institution: { type: institutionType },
            status: "RECEIVED",
          },
        }),
        prisma.deathRecord.count(),
      ]);

      response.stats = {
        pendingNotifications: pendingCount,
        respondedNotifications: respondedCount,
        totalDeaths,
      };
    }

    return NextResponse.json(response);
  } catch (err: any) {
    console.error("/api/dashboard error", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
