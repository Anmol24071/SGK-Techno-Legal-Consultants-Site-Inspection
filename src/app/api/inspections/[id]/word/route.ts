import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  HeadingLevel,
  ImageRun,
} from "docx";

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return [];
}

async function getImageBuffer(fileUrl?: string | null): Promise<Buffer | null> {
  if (!fileUrl) return null;
  try {
    if (fileUrl.startsWith("/uploads/")) {
      const filePath = path.join(process.cwd(), "public", fileUrl);
      if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath);
      }
    } else if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
      const res = await fetch(fileUrl);
      if (res.ok) {
        const arrayBuf = await res.arrayBuffer();
        return Buffer.from(arrayBuf);
      }
    }
  } catch (err) {
    console.error("Failed to load image for Word document:", fileUrl, err);
  }
  return null;
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const inspection = await prisma.inspection.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
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

    // Security check: Employee can only access their assigned inspection
    if (currentUser.role !== "ADMIN" && inspection.assignedToId !== currentUser.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const rooms = inspection.rooms || [];
    const compassDirections = inspection.compassDirections || [];
    const landmarks = inspection.landmarks || [];
    const facilities = inspection.nearbyFacilities || [];
    const sketches = inspection.sketches || [];
    const sitePhotos = inspection.sitePhotos || [];
    const gps = inspection.gpsLocation;

    const flatDir: any = compassDirections.find((c: any) => c.target === "FLAT") || {};
    const bldgDir: any = compassDirections.find((c: any) => c.target === "BUILDING") || {};
    const flatSketch: any = sketches.find((s: any) => s.type === "FLAT");
    const bldgSketch: any = sketches.find((s: any) => s.type === "BUILDING");

    // Fetch images for sketches
    const flatSketchBuf = flatSketch ? await getImageBuffer(flatSketch.fileUrl) : null;
    const bldgSketchBuf = bldgSketch ? await getImageBuffer(bldgSketch.fileUrl) : null;

    // Fetch images for site photos
    const photoBuffers: { caption: string | null; buffer: Buffer | null; lat: number | null; lng: number | null }[] = [];
    for (const p of sitePhotos) {
      const buf = await getImageBuffer(p.fileUrl);
      photoBuffers.push({ caption: p.caption, buffer: buf, lat: p.latitude, lng: p.longitude });
    }

    const tableBorderConfig = {
      top: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
    };

    const docChildren: any[] = [];

    // Header Title
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: "SGK TECHNO-LEGAL CONSULTANTS",
            bold: true,
            size: 32,
            color: "1E3A8A",
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: "SITE INSPECTION REPORT",
            bold: true,
            size: 24,
            color: "0F172A",
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        children: [
          new TextRun({
            text: "Property & Physical Measurement Verification Document",
            italics: true,
            size: 18,
            color: "64748B",
          }),
        ],
      })
    );

    // Draft warning if not submitted
    if (inspection.status !== "SUBMITTED" && inspection.status !== "REVIEWED") {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
          children: [
            new TextRun({
              text: "⚠️ DRAFT PREVIEW — INSPECTION NOT FINALIZED / SUBMITTED YET",
              bold: true,
              size: 20,
              color: "B45309",
            }),
          ],
        })
      );
    }

    // Summary Metadata Table
    docChildren.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: tableBorderConfig,
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({ children: [new TextRun({ text: "Inspection ID:", bold: true, size: 18 })] }),
                  new Paragraph({ children: [new TextRun({ text: inspection.id, size: 18, color: "334155" })] }),
                ],
              }),
              new TableCell({
                children: [
                  new Paragraph({ children: [new TextRun({ text: "Inspector / Engineer:", bold: true, size: 18 })] }),
                  new Paragraph({ children: [new TextRun({ text: inspection.engineerName || inspection.assignedTo?.name || "N/A", size: 18, color: "334155" })] }),
                ],
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({ children: [new TextRun({ text: "Status:", bold: true, size: 18 })] }),
                  new Paragraph({ children: [new TextRun({ text: inspection.status, bold: true, size: 18, color: "047857" })] }),
                ],
              }),
              new TableCell({
                children: [
                  new Paragraph({ children: [new TextRun({ text: "Date & Time:", bold: true, size: 18 })] }),
                  new Paragraph({ children: [new TextRun({ text: new Date(inspection.updatedAt).toLocaleString(), size: 18, color: "334155" })] }),
                ],
              }),
            ],
          }),
        ],
      }),
      new Paragraph({ spacing: { after: 300 }, children: [] })
    );

    // Section 1: Site Information
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 120 },
        children: [new TextRun({ text: "1. Site & Property Information", bold: true, color: "1E3A8A", size: 22 })],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Building Name: ", bold: true }),
          new TextRun({ text: inspection.buildingName || "N/A" }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Site Coordinator: ", bold: true }),
          new TextRun({ text: inspection.siteCoordinator || "N/A" }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Total Building Floors: ", bold: true }),
          new TextRun({ text: inspection.totalFloors ? String(inspection.totalFloors) : "N/A" }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Flat Location (Floor): ", bold: true }),
          new TextRun({ text: inspection.flatFloor ? String(inspection.flatFloor) : "N/A" }),
        ],
      }),
      new Paragraph({
        spacing: { after: 300 },
        children: [
          new TextRun({ text: "Full Site Address: ", bold: true }),
          new TextRun({ text: inspection.address || "N/A" }),
        ],
      })
    );

    // Section 2: Physical Measurements
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 120 },
        children: [new TextRun({ text: "2. Physical Measurement Matrix", bold: true, color: "1E3A8A", size: 22 })],
      })
    );

    if (rooms.length === 0) {
      docChildren.push(
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: "No physical measurements recorded.", italics: true, color: "64748B" })],
        })
      );
    } else {
      const roomRows = [
        new TableRow({
          tableHeader: true,
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Room / Component", bold: true, size: 18 })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Length", bold: true, size: 18 })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Width", bold: true, size: 18 })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Calculated Area", bold: true, size: 18 })] })] }),
          ],
        }),
      ];

      for (const r of rooms) {
        roomRows.push(
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: `${r.type}${r.roomNumber ? ` #${r.roomNumber}` : ""}`, bold: true, size: 18 })],
                  }),
                ],
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: r.length ? `${r.length} ${r.unit === "sq. ft." ? "ft" : "m"}` : "-", size: 18 })],
                  }),
                ],
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: r.width ? `${r.width} ${r.unit === "sq. ft." ? "ft" : "m"}` : "-", size: 18 })],
                  }),
                ],
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({ text: r.area ? `${r.area} ${r.unit}` : "-", bold: true, color: "1E3A8A", size: 18 }),
                      new TextRun({ text: r.manualOverride ? " (Manual)" : "", size: 16, color: "7C3AED" }),
                    ],
                  }),
                ],
              }),
            ],
          })
        );
      }

      docChildren.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: tableBorderConfig,
          rows: roomRows,
        })
      );
    }

    if (inspection.carpetDetail) {
      docChildren.push(
        new Paragraph({
          spacing: { before: 120, after: 300 },
          children: [
            new TextRun({ text: "TOTAL CARPET AREA OF FLAT: ", bold: true, color: "1E3A8A", size: 20 }),
            new TextRun({ text: `${inspection.carpetDetail.carpetArea} ${inspection.carpetDetail.unit}`, bold: true, size: 20 }),
          ],
        })
      );
    }

    // Section 3: Compass Directions
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 120 },
        children: [new TextRun({ text: "3. Compass Directions", bold: true, color: "1E3A8A", size: 22 })],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Flat Orientation: ", bold: true }),
          new TextRun({ text: `North: ${flatDir.north || "N/A"} | South: ${flatDir.south || "N/A"} | East: ${flatDir.east || "N/A"} | West: ${flatDir.west || "N/A"}` }),
        ],
      }),
      new Paragraph({
        spacing: { after: 300 },
        children: [
          new TextRun({ text: "Building Orientation: ", bold: true }),
          new TextRun({ text: `North: ${bldgDir.north || "N/A"} | South: ${bldgDir.south || "N/A"} | East: ${bldgDir.east || "N/A"} | West: ${bldgDir.west || "N/A"}` }),
        ],
      })
    );

    // Section 4: GPS Coordinates
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 120 },
        children: [new TextRun({ text: "4. GPS Geolocation Reference", bold: true, color: "1E3A8A", size: 22 })],
      })
    );

    if (gps) {
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: "Latitude: ", bold: true }),
            new TextRun({ text: `${gps.latitude}, ` }),
            new TextRun({ text: "Longitude: ", bold: true }),
            new TextRun({ text: `${gps.longitude}` }),
          ],
        }),
        new Paragraph({
          spacing: { after: 300 },
          children: [
            new TextRun({ text: "Google Maps Link: ", bold: true }),
            new TextRun({ text: `https://maps.google.com/?q=${gps.latitude},${gps.longitude}`, color: "2563EB" }),
          ],
        })
      );
    } else {
      docChildren.push(
        new Paragraph({
          spacing: { after: 300 },
          children: [new TextRun({ text: "No GPS coordinates recorded.", italics: true, color: "64748B" })],
        })
      );
    }

    // Section 5: Nearby Public Facilities (Q13 - Q23)
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 120 },
        children: [new TextRun({ text: "5. Nearby Public Facilities & Infrastructure (Q13–Q23)", bold: true, color: "1E3A8A", size: 22 })],
      })
    );

    if (facilities.length === 0) {
      docChildren.push(
        new Paragraph({
          spacing: { after: 300 },
          children: [new TextRun({ text: "No nearby facilities recorded.", italics: true, color: "64748B" })],
        })
      );
    } else {
      const facRows = [
        new TableRow({
          tableHeader: true,
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Facility Category", bold: true, size: 18 })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Nearest Place Name", bold: true, size: 18 })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Distance", bold: true, size: 18 })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Address / Details", bold: true, size: 18 })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Source", bold: true, size: 18 })] })] }),
          ],
        }),
      ];

      for (const f of facilities) {
        const distStr = f.distanceText || (f.distance !== null ? `${f.distance} ${f.unit || "km"}` : "No nearby facility found");
        const mapsUrl = f.placeId
          ? `https://www.google.com/maps/search/?api=1&query_place_id=${f.placeId}&query=${encodeURIComponent(f.placeName || "")}`
          : f.latitude && f.longitude
          ? `https://maps.google.com/?q=${f.latitude},${f.longitude}`
          : f.placeName && f.placeName !== "No nearby facility found"
          ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${f.placeName} ${f.address || ""}`)}`
          : "";

        facRows.push(
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: f.facilityLabel || f.facilityKey, bold: true, size: 18 })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: f.placeName || "No nearby facility found", size: 18 })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: distStr, size: 18, color: "1E3A8A" })] })] }),
              new TableCell({
                children: [
                  new Paragraph({ children: [new TextRun({ text: f.address || "-", size: 16, color: "475569" })] }),
                  ...(mapsUrl
                    ? [new Paragraph({ children: [new TextRun({ text: `Maps: ${mapsUrl}`, size: 14, color: "2563EB" })] })]
                    : []),
                ],
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: f.selectionMethod === "MANUAL" ? "MANUAL" : "AUTOMATIC",
                        bold: true,
                        size: 16,
                        color: f.selectionMethod === "MANUAL" ? "6B21A8" : "047857",
                      }),
                    ],
                  }),
                ],
              }),
            ],
          })
        );
      }

      docChildren.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: tableBorderConfig,
          rows: facRows,
        }),
        new Paragraph({ spacing: { after: 300 }, children: [] })
      );
    }

    // Section 6: Rough Sketches
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 120 },
        children: [new TextRun({ text: "6. Rough Sketches", bold: true, color: "1E3A8A", size: 22 })],
      })
    );

    if (flatSketchBuf) {
      docChildren.push(
        new Paragraph({ children: [new TextRun({ text: "Flat Rough Sketch:", bold: true })] }),
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new ImageRun({
              data: flatSketchBuf,
              transformation: { width: 450, height: 300 },
              type: "png",
            }),
          ],
        })
      );
    } else if (flatSketch) {
      docChildren.push(
        new Paragraph({
          spacing: { after: 120 },
          children: [new TextRun({ text: `Flat Rough Sketch URL: ${flatSketch.fileUrl}`, italics: true })],
        })
      );
    }

    if (bldgSketchBuf) {
      docChildren.push(
        new Paragraph({ children: [new TextRun({ text: "Building Rough Sketch:", bold: true })] }),
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new ImageRun({
              data: bldgSketchBuf,
              transformation: { width: 450, height: 300 },
              type: "png",
            }),
          ],
        })
      );
    } else if (bldgSketch) {
      docChildren.push(
        new Paragraph({
          spacing: { after: 120 },
          children: [new TextRun({ text: `Building Rough Sketch URL: ${bldgSketch.fileUrl}`, italics: true })],
        })
      );
    }

    if (!flatSketch && !bldgSketch) {
      docChildren.push(
        new Paragraph({
          spacing: { after: 300 },
          children: [new TextRun({ text: "No rough sketches uploaded.", italics: true, color: "64748B" })],
        })
      );
    }

    // Section 7: Attached Site Photographs
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 120 },
        children: [new TextRun({ text: `7. Attached Site Photographs (${sitePhotos.length} Images)`, bold: true, color: "1E3A8A", size: 22 })],
      })
    );

    if (photoBuffers.length === 0) {
      docChildren.push(
        new Paragraph({
          spacing: { after: 300 },
          children: [new TextRun({ text: "No site photographs uploaded.", italics: true, color: "64748B" })],
        })
      );
    } else {
      for (let idx = 0; idx < photoBuffers.length; idx++) {
        const item = photoBuffers[idx];
        const children: any[] = [
          new TextRun({ text: `Photo ${idx + 1}${item.caption ? `: ${item.caption}` : ""}`, bold: true }),
        ];
        if (item.lat && item.lng) {
          children.push(new TextRun({ text: ` (GPS: ${item.lat}, ${item.lng})`, size: 16, color: "64748B" }));
        }

        docChildren.push(new Paragraph({ children }));

        if (item.buffer) {
          docChildren.push(
            new Paragraph({
              spacing: { after: 200 },
              children: [
                new ImageRun({
                  data: item.buffer,
                  transformation: { width: 400, height: 260 },
                  type: "png",
                }),
              ],
            })
          );
        }
      }
    }

    // Footer Sign-off Block
    docChildren.push(
      new Paragraph({ spacing: { before: 400 }, children: [] }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 2, color: "0F172A" },
          bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({ children: [new TextRun({ text: "Inspected & Prepared By:", bold: true, size: 18 })] }),
                  new Paragraph({ spacing: { before: 400 }, children: [new TextRun({ text: inspection.engineerName || inspection.assignedTo?.name || "Site Inspector", bold: true, size: 18 })] }),
                  new Paragraph({ children: [new TextRun({ text: "Site Inspection Engineer", size: 16, color: "64748B" })] }),
                ],
              }),
              new TableCell({
                children: [
                  new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Authorized Signature:", bold: true, size: 18 })] }),
                  new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { before: 400 }, children: [new TextRun({ text: "SGK TECHNO-LEGAL CONSULTANTS", bold: true, size: 18 })] }),
                  new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Chief Valuer / Technical Auditor", size: 16, color: "64748B" })] }),
                ],
              }),
            ],
          }),
        ],
      })
    );

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: docChildren,
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    const safeTitle = (inspection.title || "Inspection").replace(/[^a-zA-Z0-9_-]/g, "_");

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="SGK_Inspection_Report_${safeTitle}.docx"`,
      },
    });
  } catch (err: any) {
    console.error("Failed to generate Word report:", err);
    return NextResponse.json({ error: err.message || "Failed to generate Word document report" }, { status: 500 });
  }
}
