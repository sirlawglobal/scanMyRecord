import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

// Issues a short-lived signature so the browser can upload large media directly
// to Cloudinary. Vercel rejects request bodies above ~4.5MB, so files must not
// be proxied through our own API routes.
export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const resourceType = body?.resourceType === "video" ? "video" : "image";

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      { message: "Media uploads require Cloudinary to be configured (CLOUDINARY_* env vars)." },
      { status: 500 },
    );
  }

  const timestamp = Math.round(Date.now() / 1000);
  const signature = crypto
    .createHash("sha1")
    .update(`timestamp=${timestamp}${apiSecret}`)
    .digest("hex");

  return NextResponse.json({ cloudName, apiKey, timestamp, signature, resourceType });
}
