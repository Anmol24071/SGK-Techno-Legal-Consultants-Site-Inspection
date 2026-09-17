import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendAccessEmail } from "@/lib/email";
import { logAuditEvent } from "@/lib/audit";

export async function GET(req: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const includeAdmins = searchParams.get("includeAdmins") === "true";

  const whereClause = includeAdmins
    ? { status: "APPROVED" }
    : { role: "EMPLOYEE" };

  const employees = await prisma.user.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      status: true,
      lastLoginAt: true,
      createdAt: true,
      _count: {
        select: {
          assignedInspections: true,
        },
      },
    },
  });

  return NextResponse.json({ employees });
}

export async function POST(req: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }

  const body = await req.json();
  const { name, email } = body;

  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    if (existingUser.status === "APPROVED" && existingUser.role === "EMPLOYEE") {
      return NextResponse.json({ error: "An approved employee with this email already exists." }, { status: 400 });
    }

    // Update existing request/user to APPROVED EMPLOYEE
    const updatedUser = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        name,
        role: "EMPLOYEE",
        status: "APPROVED",
      },
    });

    await logAuditEvent({
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      action: "EMPLOYEE_CREATED",
      details: `Pre-approved employee access for ${name} (${email})`,
    });

    await sendAccessEmail({
      to: email.toLowerCase(),
      name,
      type: "GRANTED",
    });

    return NextResponse.json({ success: true, employee: updatedUser });
  }

  // Create new approved employee
  const newEmployee = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      role: "EMPLOYEE",
      status: "APPROVED",
      image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
    },
  });

  await logAuditEvent({
    userId: currentUser.id,
    userName: currentUser.name,
    userEmail: currentUser.email,
    action: "EMPLOYEE_CREATED",
    details: `Created approved employee ${name} (${email})`,
  });

  await sendAccessEmail({
    to: email.toLowerCase(),
    name,
    type: "GRANTED",
  });

  return NextResponse.json({ success: true, employee: newEmployee });
}
