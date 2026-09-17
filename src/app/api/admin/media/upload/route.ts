import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { uploadImage, uploadVideo } from "@/lib/storage/cloudinary";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 40 * 1024 * 1024;

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

  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);

  if (!isVideo && !isImage) {
    return NextResponse.json(
      { message: "Unsupported file type. Use JPEG, PNG, WEBP images or MP4, WEBM, MOV video clips." },
      { status: 400 },
    );
  }

  const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;

  if (file.size > maxSize) {
    return NextResponse.json(
      { message: `File is too large. Maximum size is ${Math.round(maxSize / (1024 * 1024))}MB.` },
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
        const { url } = isVideo ? await uploadVideo(buffer, file.name) : await uploadImage(buffer, file.name);
        return NextResponse.json({ url, type: isVideo ? "video" : "image" }, { status: 201 });
      } catch {
        // Fall back to local storage if Cloudinary fails
      }
    }

    if (isVideo) {
      // Local disk storage isn't viable for video in most deployment targets
      // (serverless filesystems are ephemeral) — require Cloudinary for video.
      return NextResponse.json(
        { message: "Video uploads require Cloudinary to be configured (CLOUDINARY_* env vars)." },
        { status: 500 },
      );
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
