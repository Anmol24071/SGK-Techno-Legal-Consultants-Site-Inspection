import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }

  const requests = await prisma.accessRequest.findMany({
    orderBy: { requestDate: "desc" },
    include: {
      user: {
        select: {
          lastLoginAt: true,
          status: true,
        },
      },
    },
  });

  return NextResponse.json({ requests });
}
