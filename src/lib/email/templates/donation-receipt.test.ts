import { describe, expect, it } from "vitest";
import { renderDonationReceiptEmail } from "./donation-receipt";

describe("donation receipt email template", () => {
  it("renders subject, html, and text with official reference and formatted currency", () => {
    const payload = {
      reference: "SMR-DON-2026-888999",
      donorName: "Dr. Ngozi Okonjo",
      amount: 50000,
      campaignTitle: "Primary Healthcare Renewal",
      campaignSlug: "primary-healthcare-renewal",
      politicianName: "Mr. Temple",
      politicianOffice: "Governor of the state",
      politicianConstituency: "Ife East Federal Constituency",
    };

    const { subject, html, text } = renderDonationReceiptEmail(payload);

    expect(subject).toContain("SMR-DON-2026-888999");
    expect(subject).toContain("₦50,000");
    expect(subject).toContain("Primary Healthcare Renewal");

    expect(html).toContain("SMR-DON-2026-888999");
    expect(html).toContain("₦50,000");
    expect(html).toContain("Dr. Ngozi Okonjo");
    expect(html).toContain("Primary Healthcare Renewal");
    expect(html).toContain("Ife East Federal Constituency");

    expect(text).toContain("SMR-DON-2026-888999");
    expect(text).toContain("₦50,000");
    expect(text).toContain("Dr. Ngozi Okonjo");
  });
});
