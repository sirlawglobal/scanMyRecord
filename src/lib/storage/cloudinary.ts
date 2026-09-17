import crypto from "node:crypto";

function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Image uploads are not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
  }

  return { cloudName, apiKey, apiSecret };
}

async function uploadToCloudinary(
  file: Buffer,
  filename: string,
  resourceType: "image" | "video",
): Promise<{ url: string }> {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();

  const timestamp = Math.round(Date.now() / 1000);
  const signature = crypto
    .createHash("sha1")
    .update(`timestamp=${timestamp}${apiSecret}`)
    .digest("hex");

  const formData = new FormData();
  formData.append("file", new Blob([new Uint8Array(file)]), filename);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
    method: "POST",
    body: formData,
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok || !body?.secure_url) {
    throw new Error(body?.error?.message ?? `Failed to upload ${resourceType} to Cloudinary.`);
  }

  return { url: body.secure_url as string };
}

export async function uploadImage(file: Buffer, filename: string): Promise<{ url: string }> {
  return uploadToCloudinary(file, filename, "image");
}

export async function uploadVideo(file: Buffer, filename: string): Promise<{ url: string }> {
  return uploadToCloudinary(file, filename, "video");
}
