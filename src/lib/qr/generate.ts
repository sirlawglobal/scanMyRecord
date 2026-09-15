import QRCode from "qrcode";

export async function generateQrPng(targetUrl: string): Promise<Buffer> {
  return QRCode.toBuffer(targetUrl, { type: "png", width: 512, margin: 2 });
}

export async function generateQrDataUrl(targetUrl: string): Promise<string> {
  return QRCode.toDataURL(targetUrl, { width: 512, margin: 2 });
}
