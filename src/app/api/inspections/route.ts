import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";

export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Admin gets all inspections; Employee gets only their assigned inspections
  const whereClause = currentUser.role === "ADMIN" ? {} : { assignedToId: currentUser.id };

  const inspections = await prisma.inspection.findMany({
    where: whereClause,
    orderBy: { updatedAt: "desc" },
    include: {
      assignedTo: {
        select: { id: true, name: true, email: true, image: true },
      },
      createdBy: {
        select: { id: true, name: true, email: true },
      },
      gpsLocation: true,
      carpetDetail: true,
      _count: {
        select: {
          sitePhotos: true,
          sketches: true,
        },
      },
    },
  });

  return NextResponse.json({ inspections });
}

export async function POST(req: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Only admins can create inspections" }, { status: 403 });
  }

  const body = await req.json();
  const { title, address, siteCoordinator, engineerName, buildingName, totalFloors, flatFloor, assignedToId } = body;

  if (!title || !assignedToId) {
    return NextResponse.json({ error: "Title and assigned employee are required" }, { status: 400 });
  }

  const assignedUser = await prisma.user.findUnique({ where: { id: assignedToId } });
  if (!assignedUser) {
    return NextResponse.json({ error: "Assigned employee not found" }, { status: 404 });
  }

  const inspection = await prisma.inspection.create({
    data: {
      title,
      address,
      siteCoordinator,
      engineerName: engineerName || assignedUser.name,
      buildingName,
      totalFloors: totalFloors ? Number(totalFloors) : null,
      flatFloor: flatFloor ? Number(flatFloor) : null,
      assignedToId,
      createdById: currentUser.id,
      status: "ASSIGNED",
    },
    include: {
      assignedTo: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  await logAuditEvent({
    userId: currentUser.id,
    userName: currentUser.name,
    userEmail: currentUser.email,
    action: "INSPECTION_CREATED",
    details: `Created site inspection "${title}" assigned to ${assignedUser.name}`,
  });

  return NextResponse.json({ success: true, inspection });
}
