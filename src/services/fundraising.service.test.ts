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
