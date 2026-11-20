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

  // Ensure current admin user exists in DB with role: ADMIN and status: APPROVED
  if (currentUser.email) {
    try {
      await prisma.user.upsert({
        where: { email: currentUser.email.toLowerCase() },
        update: {
          role: "ADMIN",
          status: "APPROVED",
        },
        create: {
          id: currentUser.id && currentUser.id !== "temp-id" ? currentUser.id : undefined,
          name: currentUser.name || "Administrator",
          email: currentUser.email.toLowerCase(),
          role: "ADMIN",
          status: "APPROVED",
          image: currentUser.image || null,
        },
      });
    } catch (upsertErr) {
      console.warn("Could not upsert admin user record:", upsertErr);
    }
  }

  let whereClause: any;
  if (includeAdmins) {
    // For assigning inspections: return Admins and all non-revoked Employees
    whereClause = {
      OR: [
        { role: "ADMIN" },
        { role: "EMPLOYEE" },
      ],
      NOT: {
        status: { in: ["DENIED", "REVOKED"] },
      },
    };
  } else {
    // For employee directory list: return all employees
    whereClause = { role: "EMPLOYEE" };
  }

  let employees = await prisma.user.findMany({
    where: whereClause,
    orderBy: [{ role: "asc" }, { createdAt: "desc" }],
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

  // If includeAdmins is true, ensure current admin user is guaranteed to be in the list
  if (includeAdmins) {
    const hasAdmin = employees.some(
      (e) => e.email.toLowerCase() === currentUser.email.toLowerCase() || e.id === currentUser.id
    );
    if (!hasAdmin) {
      const adminInDb = await prisma.user.findUnique({
        where: { email: currentUser.email.toLowerCase() },
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
      if (adminInDb) {
        employees = [adminInDb, ...employees];
      } else {
        employees = [
          {
            id: currentUser.id,
            name: currentUser.name || "Administrator (Self)",
            email: currentUser.email,
            image: currentUser.image || null,
            role: "ADMIN",
            status: "APPROVED",
            lastLoginAt: new Date(),
            createdAt: new Date(),
            _count: { assignedInspections: 0 },
          },
          ...employees,
        ];
      }
    }
  }

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
