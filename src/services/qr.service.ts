import { nanoid } from "nanoid";
import { connectToDatabase, hasValidMongoUri } from "@/lib/db/connection";
import { generateShortCode } from "@/lib/qr/codes";
import { generateQrPng } from "@/lib/qr/generate";
import QRCodeModel from "@/models/QRCode";
import QRScan from "@/models/QRScan";
import Politician from "@/models/Politician";
import Project from "@/models/Project";
import Programme from "@/models/Programme";
import FundraisingCampaign from "@/models/FundraisingCampaign";

export type QRCodeRecord = {
  code: string;
  targetUrl: string;
  status: "active" | "inactive";
};

export type QrTargetType = "politician" | "project" | "programme" | "fundraising";

export function generateQrCode() {
  const code = nanoid(10);
  return {
    code,
    targetUrl: "/",
    status: "active" as const,
  };
}

export function validateQrCode(code: string) {
  return typeof code === "string" && code.trim().length > 0;
}

export function buildQrRedirectUrl(code: string) {
  return `/q/${code}`;
}

export function recordScan(code: string, userAgent = "") {
  return {
    code,
    recordedAt: new Date().toISOString(),
    userAgent,
    ok: true,
  };
}

export async function createQRCode(politicianId: string, targetType: QrTargetType, targetId: string) {
  await connectToDatabase();

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const code = generateShortCode();

    try {
      return await QRCodeModel.create({ politicianId, code, targetType, targetId, status: "active" });
    } catch (error) {
      const mongoError = error as { code?: number };

      if (mongoError?.code === 11000 && attempt < 2) {
        continue;
      }

      throw error;
    }
  }

  throw new Error("Could not generate a unique QR code.");
}

async function resolveTargetUrl(targetType: QrTargetType, targetId: unknown): Promise<string | null> {
  if (targetType === "politician") {
    const politician = await Politician.findById(targetId).lean();
    return politician ? "/" : null;
  }

  if (targetType === "project") {
    const project = await Project.findById(targetId).lean();
    return project ? `/projects/${project.slug}` : null;
  }

  if (targetType === "programme") {
    const programme = await Programme.findById(targetId).lean();
    return programme ? `/programmes/${programme.slug}` : null;
  }

  if (targetType === "fundraising") {
    const campaign = await FundraisingCampaign.findById(targetId).lean();
    return campaign ? `/fundraising/${campaign.slug}` : null;
  }

  return null;
}

export async function resolveQRCode(code: string): Promise<{ id: string; targetUrl: string } | null> {
  if (!code || !hasValidMongoUri()) {
    return null;
  }

  try {
    await connectToDatabase();
    const qr = await QRCodeModel.findOne({ code }).lean();

    if (!qr || qr.status !== "active") {
      return null;
    }

    const targetUrl = await resolveTargetUrl(qr.targetType as QrTargetType, qr.targetId);

    if (!targetUrl) {
      return null;
    }

    return { id: String(qr._id), targetUrl };
  } catch {
    return null;
  }
}

/**
 * Best-effort scan logging — must never throw or block the caller's redirect.
 */
export async function recordScanAsync(qrCodeId: string, userAgent = "", ipHash = "") {
  try {
    await connectToDatabase();
    await QRScan.create({ qrCodeId, userAgent, ipHash });
  } catch {
    // Scan tracking is best-effort and must never block the redirect.
  }
}

export async function disableQRCode(id: string) {
  await connectToDatabase();
  return QRCodeModel.findByIdAndUpdate(id, { status: "inactive" }, { new: true });
}

export async function getQRAnalytics(qrCodeId: string) {
  await connectToDatabase();
  const scanCount = await QRScan.countDocuments({ qrCodeId });
  return { scanCount };
}

export async function downloadQRAsset(code: string): Promise<Buffer> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
  return generateQrPng(`${appUrl}/q/${code}`);
}
