import { describe, expect, it } from "vitest";
import { buildQrRedirectUrl, generateQrCode, validateQrCode } from "./qr.service";

describe("qr service", () => {
  it("creates a valid QR code payload", () => {
    const qr = generateQrCode();
    expect(qr.code.length).toBeGreaterThan(5);
    expect(qr.status).toBe("active");
  });

  it("accepts a valid code and builds a redirect url", () => {
    expect(validateQrCode("profile")).toBe(true);
    expect(buildQrRedirectUrl("profile")).toBe("/q/profile");
  });
});
