import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const regions = await prisma.region.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        code: true,
        name: true,
        country: true,
      },
    });

    return NextResponse.json({ regions });
  } catch (error) {
    console.error("/api/regions error", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
