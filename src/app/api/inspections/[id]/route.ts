import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return [];
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  const inspection = await prisma.inspection.findUnique({
    where: { id },
    include: {
      assignedTo: {
        select: { id: true, name: true, email: true, image: true },
      },
      createdBy: {
        select: { id: true, name: true, email: true },
      },
      rooms: true,
      compassDirections: true,
      gpsLocation: true,
      carpetDetail: true,
      landmarks: true,
      nearbyFacilities: true,
      sketches: true,
      sitePhotos: true,
    },
  });

  if (!inspection) {
    return NextResponse.json({ error: "Inspection not found" }, { status: 404 });
  }

  // Security check: Employee can ONLY access their assigned inspection
  if (currentUser.role !== "ADMIN" && inspection.assignedToId !== currentUser.id) {
    return NextResponse.json({ error: "Access denied. This inspection is not assigned to you." }, { status: 403 });
  }

  return NextResponse.json({ inspection });
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  const body = await req.json();

  const inspection = await prisma.inspection.findUnique({ where: { id } });
  if (!inspection) {
    return NextResponse.json({ error: "Inspection not found" }, { status: 404 });
  }

  // Security check
  if (currentUser.role !== "ADMIN" && inspection.assignedToId !== currentUser.id) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const {
    title,
    address,
    siteCoordinator,
    engineerName,
    buildingName,
    totalFloors,
    flatFloor,
    status, // IN_PROGRESS | SUBMITTED | REVIEWED
    rooms,
    compassDirections,
    gpsLocation,
    carpetDetail,
    landmarks,
    nearbyFacilities,
    sketches,
    sitePhotos,
  } = body;

  // Transaction to update all inspection details cleanly
  await prisma.$transaction(async (tx) => {
    // 1. Update basic info
    await tx.inspection.update({
      where: { id },
      data: {
        title: title || inspection.title,
        address: address !== undefined ? address : inspection.address,
        siteCoordinator: siteCoordinator !== undefined ? siteCoordinator : inspection.siteCoordinator,
        engineerName: engineerName !== undefined ? engineerName : inspection.engineerName,
        buildingName: buildingName !== undefined ? buildingName : inspection.buildingName,
        totalFloors: totalFloors !== undefined ? (totalFloors ? Number(totalFloors) : null) : inspection.totalFloors,
        flatFloor: flatFloor !== undefined ? (flatFloor ? Number(flatFloor) : null) : inspection.flatFloor,
        status: status || inspection.status,
        submissionDate: status === "SUBMITTED" ? new Date() : inspection.submissionDate,
      },
    });

    // 2. Rooms (Living, Passage, Kitchen, Bedrooms, Balconies, Washrooms)
    if (Array.isArray(rooms)) {
      await tx.room.deleteMany({ where: { inspectionId: id } });
      if (rooms.length > 0) {
        await tx.room.createMany({
          data: rooms.map((r: any) => ({
            inspectionId: id,
            type: r.type,
            roomNumber: r.roomNumber ? Number(r.roomNumber) : null,
            length: r.length ? Number(r.length) : null,
            width: r.width ? Number(r.width) : null,
            area: r.area ? Number(r.area) : null,
            manualOverride: Boolean(r.manualOverride),
            unit: r.unit || "sq. ft.",
          })),
        });
      }
    }

    // 3. Compass directions
    if (Array.isArray(compassDirections)) {
      await tx.compassDirection.deleteMany({ where: { inspectionId: id } });
      if (compassDirections.length > 0) {
        await tx.compassDirection.createMany({
          data: compassDirections.map((c: any) => ({
            inspectionId: id,
            target: c.target || "FLAT",
            north: c.north || null,
            south: c.south || null,
            east: c.east || null,
            west: c.west || null,
          })),
        });
      }
    }

    // 4. GPS Location
    if (gpsLocation && gpsLocation.latitude && gpsLocation.longitude) {
      await tx.gpsLocation.upsert({
        where: { inspectionId: id },
        update: {
          latitude: Number(gpsLocation.latitude),
          longitude: Number(gpsLocation.longitude),
        },
        create: {
          inspectionId: id,
          latitude: Number(gpsLocation.latitude),
          longitude: Number(gpsLocation.longitude),
        },
      });
    }

    // 5. Carpet Detail
    if (carpetDetail) {
      await tx.carpetDetail.upsert({
        where: { inspectionId: id },
        update: {
          carpetArea: carpetDetail.carpetArea ? Number(carpetDetail.carpetArea) : null,
          unit: carpetDetail.unit || "sq. ft.",
        },
        create: {
          inspectionId: id,
          carpetArea: carpetDetail.carpetArea ? Number(carpetDetail.carpetArea) : null,
          unit: carpetDetail.unit || "sq. ft.",
        },
      });
    }

    // 6. Landmarks
    if (Array.isArray(landmarks)) {
      await tx.landmark.deleteMany({ where: { inspectionId: id } });
      if (landmarks.length > 0) {
        await tx.landmark.createMany({
          data: landmarks.map((l: any) => ({
            inspectionId: id,
            name: l.name,
            description: l.description || null,
            distance: l.distance || null,
          })),
        });
      }
    }

    // 7. Nearby Facilities
    if (Array.isArray(nearbyFacilities)) {
      await tx.nearbyFacility.deleteMany({ where: { inspectionId: id } });
      if (nearbyFacilities.length > 0) {
        await tx.nearbyFacility.createMany({
          data: nearbyFacilities.map((f: any) => ({
            inspectionId: id,
            facilityKey: f.facilityKey,
            facilityLabel: f.facilityLabel,
            placeName: f.placeName || null,
            placeId: f.placeId || null,
            address: f.address || null,
            latitude: f.latitude ? Number(f.latitude) : null,
            longitude: f.longitude ? Number(f.longitude) : null,
            distance: f.distance ? Number(f.distance) : null,
            distanceText: f.distanceText || null,
            unit: f.unit || "km",
            selectionMethod: f.selectionMethod || "AUTOMATIC",
            retrievedAt: f.retrievedAt ? new Date(f.retrievedAt) : new Date(),
          })),
        });
      }
    }

    // 8. Sketches
    if (Array.isArray(sketches)) {
      await tx.sketch.deleteMany({ where: { inspectionId: id } });
      if (sketches.length > 0) {
        await tx.sketch.createMany({
          data: sketches.map((s: any) => ({
            inspectionId: id,
            type: s.type,
            fileUrl: s.fileUrl,
          })),
        });
      }
    }

    // 9. Site Photos
    if (Array.isArray(sitePhotos)) {
      await tx.sitePhoto.deleteMany({ where: { inspectionId: id } });
      if (sitePhotos.length > 0) {
        await tx.sitePhoto.createMany({
          data: sitePhotos.map((p: any) => ({
            inspectionId: id,
            fileUrl: p.fileUrl,
            caption: p.caption || null,
            latitude: p.latitude ? Number(p.latitude) : null,
            longitude: p.longitude ? Number(p.longitude) : null,
          })),
        });
      }
    }
  });

  if (status === "SUBMITTED") {
    await logAuditEvent({
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      action: "INSPECTION_SUBMITTED",
      details: `Submitted inspection report for "${inspection.title}"`,
    });
  }

  return NextResponse.json({ success: true, message: "Inspection updated successfully" });
}
