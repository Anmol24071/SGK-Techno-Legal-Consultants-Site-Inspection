import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendAccessEmail } from "@/lib/email";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return [];
}

export async function POST(
  req: Request,
  { params }: { params: { id: string; action: string } }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }

  const { id, action } = params;
  if (action !== "grant" && action !== "deny") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const request = await prisma.accessRequest.findUnique({
    where: { id },
  });

  if (!request) {
    return NextResponse.json({ error: "Access request not found" }, { status: 404 });
  }

  const isGrant = action === "grant";
  const newStatus = isGrant ? "APPROVED" : "DENIED";

  // Update AccessRequest
  await prisma.accessRequest.update({
    where: { id },
    data: {
      status: newStatus,
      reviewedAt: new Date(),
      reviewedBy: currentUser.email,
    },
  });

  // Update User
  await prisma.user.update({
    where: { id: request.userId },
    data: {
      status: newStatus,
      role: "EMPLOYEE",
    },
  });

  // Log Audit Event
  await logAuditEvent({
    userId: currentUser.id,
    userName: currentUser.name,
    userEmail: currentUser.email,
    action: isGrant ? "ACCESS_GRANTED" : "ACCESS_DENIED",
    details: `${isGrant ? 'Granted' : 'Denied'} employee access for ${request.name} (${request.email})`,
  });

  // Dispatch Transactional Email (Section 5 & 6)
  await sendAccessEmail({
    to: request.email,
    name: request.name,
    type: isGrant ? "GRANTED" : "DENIED",
  });

  return NextResponse.json({
    success: true,
    status: newStatus,
    message: `Access ${isGrant ? "granted" : "denied"} for ${request.name}`,
  });
}
