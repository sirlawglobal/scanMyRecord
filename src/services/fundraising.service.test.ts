import { describe, expect, it } from "vitest";
import { buildDonationCallbackUrl, createDonationReference, validateDonationInput } from "./fundraising.service";

describe("fundraising service", () => {
  it("generates donation references in the expected format", () => {
    const reference = createDonationReference(2026);
    expect(reference).toMatch(/^SMR-DON-2026-\d{6}$/);
  });

  it("accepts valid donation payloads", () => {
    const result = validateDonationInput({
      donorName: "Ada Okafor",
      donorEmail: "ada@example.com",
      amount: 5000,
      campaignSlug: "community-solar-initiative",
      anonymous: false,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.amount).toBe(5000);
    }
  });

  it("builds a contribution callback URL for a campaign", () => {
    const url = buildDonationCallbackUrl("community-solar-initiative");

    expect(url).toBe("/fundraising/community-solar-initiative/contribute/verify?ref=__REF__");
  });
});

describe("donation input validation", () => {
  const valid = { donorName: "Ada Okafor", donorEmail: "ada@example.com", amount: 5000, campaignSlug: "solar-drive", anonymous: false };

  it("normalises the email", () => {
    const result = validateDonationInput({ ...valid, donorEmail: " Ada@Example.COM " });
    expect(result.success && result.data.donorEmail).toBe("ada@example.com");
  });

  it.each([
    [{ ...valid, donorName: "x" }],
    [{ ...valid, donorName: "x".repeat(101) }],
    [{ ...valid, donorName: "<script>alert(1)</script>" }],
    [{ ...valid, donorEmail: "nope" }],
    [{ ...valid, amount: 99 }],
    [{ ...valid, amount: 10_000_001 }],
    [{ ...valid, amount: 5000.5 }],
    [{ ...valid, amount: "abc" }],
    [{ ...valid, campaignSlug: "../etc/passwd" }],
    [{ ...valid, campaignSlug: { $ne: "" } }],
  ])("rejects %j", (input) => {
    expect(validateDonationInput(input).success).toBe(false);
  });
});
