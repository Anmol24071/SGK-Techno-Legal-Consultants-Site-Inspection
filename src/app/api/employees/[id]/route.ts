import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return [];
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }

  const { id } = params;
  const body = await req.json();
  const { status } = body; // APPROVED | DENIED | REVOKED

  if (!["APPROVED", "DENIED", "REVOKED"].includes(status)) {
    return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
  }

  const employee = await prisma.user.update({
    where: { id },
    data: { status },
  });

  await logAuditEvent({
    userId: currentUser.id,
    userName: currentUser.name,
    userEmail: currentUser.email,
    action: `EMPLOYEE_STATUS_${status}`,
    details: `Updated employee ${employee.name} (${employee.email}) status to ${status}`,
  });

  return NextResponse.json({ success: true, employee });
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }

  const { id } = params;

  const employee = await prisma.user.findUnique({
    where: { id },
    include: {
      _count: {
        select: { assignedInspections: true },
      },
    },
  });

  if (!employee) {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  }

  // Business Rule Compliance: If employee has historical inspections, revoke access to preserve reports. Otherwise hard delete.
  if (employee._count.assignedInspections > 0) {
    await prisma.user.update({
      where: { id },
      data: { status: "REVOKED" },
    });

    await logAuditEvent({
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      action: "EMPLOYEE_REVOKED",
      details: `Revoked access for employee ${employee.name} (${employee.email}) - Historical inspection reports preserved.`,
    });

    return NextResponse.json({
      success: true,
      mode: "revoked",
      message: `Access revoked for ${employee.name}. Historical inspection records have been preserved.`,
    });
  }

  // No historical inspections -> Hard delete cascade
  await prisma.accessRequest.deleteMany({ where: { userId: id } });
  await prisma.user.delete({ where: { id } });

  await logAuditEvent({
    userId: currentUser.id,
    userName: currentUser.name,
    userEmail: currentUser.email,
    action: "EMPLOYEE_DELETED",
    details: `Permanently deleted employee account ${employee.name} (${employee.email})`,
  });

  return NextResponse.json({
    success: true,
    mode: "deleted",
    message: `Employee account ${employee.name} deleted successfully.`,
  });
}
