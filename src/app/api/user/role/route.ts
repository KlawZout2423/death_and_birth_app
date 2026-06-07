import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.email },
      select: {
        role: true,
        institution: {
          select: {
            type: true,
          },
        },
      },
    });

    const institutionType = user?.institution?.type ?? null;

    let role = "admin";
    let dashboardPath = "/dashboard";

    if (user?.role === "REGISTRY_OFFICER") {
      role = "registrar";
      dashboardPath = "/registrar";
    } else if (user?.role === "INSTITUTION_OFFICER") {
      if (institutionType === "BANK") {
        role = "bank";
        dashboardPath = "/bank";
      } else if (institutionType === "INSURANCE") {
        role = "insurance";
        dashboardPath = "/insurance";
      } else {
        role = "ssnit";
        dashboardPath = "/ssnit";
      }
    } else if (user?.role === "ADMINISTRATOR") {
      role = "admin";
      dashboardPath = "/dashboard";
    }

    return NextResponse.json({
      role,
      rawRole: user?.role ?? session.role,
      name: session.name,
      email: session.email,
      institutionType,
      dashboardPath,
    });
  } catch (err: any) {
    console.error("/api/user/role error", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
