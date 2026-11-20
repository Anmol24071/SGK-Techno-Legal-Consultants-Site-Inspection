import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const contentType = req.headers.get("content-type") || "";

    // Support direct JSON upload of base64 data URL
    if (contentType.includes("application/json")) {
      const body = await req.json();
      if (body.dataUrl) {
        return NextResponse.json({ success: true, url: body.dataUrl, filename: "image.jpg" });
      }
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Size limit check: max 15MB per photo
    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json({ error: "File exceeds maximum size limit of 15MB" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileType = file.type || "image/jpeg";
    const dataUrlFallback = `data:${fileType};base64,${buffer.toString("base64")}`;

    const fileExt = path.extname(file.name) || ".jpg";
    const filename = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${fileExt}`;

    // Try saving to public/uploads if filesystem is writable
    try {
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, buffer);

      const publicUrl = `/uploads/${filename}`;
      return NextResponse.json({ success: true, url: publicUrl, filename });
    } catch (fsErr) {
      // Serverless or read-only filesystem (e.g. Vercel EROFS or Docker permission)
      // Seamlessly fallback to data URL so photo attachment never fails
      console.warn("Filesystem write restricted, using Data URL storage fallback:", fsErr);
      return NextResponse.json({ success: true, url: dataUrlFallback, filename });
    }
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Failed to upload file: " + (err.message || "") }, { status: 500 });
  }
}
