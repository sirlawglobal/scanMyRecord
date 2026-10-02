import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { uploadImage } from "@/lib/storage/cloudinary";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "A file is required." }, { status: 400 });
  }

  if (file.type.startsWith("video/")) {
    return NextResponse.json(
      { message: "Videos are uploaded directly from the browser, not through this endpoint." },
      { status: 400 },
    );
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return NextResponse.json({ message: "Unsupported file type. Use JPEG, PNG or WEBP images." }, { status: 400 });
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return NextResponse.json(
      { message: `File is too large. Maximum size is ${Math.round(MAX_IMAGE_SIZE / (1024 * 1024))}MB.` },
      { status: 400 },
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    // Try Cloudinary first if configured
    if (
      process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
      process.env.CLOUDINARY_API_KEY?.trim() &&
      process.env.CLOUDINARY_API_SECRET?.trim()
    ) {
      try {
        const { url } = await uploadImage(buffer, file.name);
        return NextResponse.json({ url, type: "image" }, { status: 201 });
      } catch {
        // Fall back to local storage if Cloudinary fails
      }
    }

    // Local filesystem storage fallback in /public/uploads/
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const uploadsDir = path.join(process.cwd(), "public", "uploads");

    await fs.mkdir(uploadsDir, { recursive: true });

    const ext = path.extname(file.name) || ".jpg";
    const safeBaseName = path
      .basename(file.name, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .substring(0, 30);
    const fileName = `${Date.now()}_${safeBaseName}${ext}`;
    const filePath = path.join(uploadsDir, fileName);

    await fs.writeFile(filePath, buffer);

    const url = `/uploads/${fileName}`;
    return NextResponse.json({ url, type: "image" }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to upload image.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
