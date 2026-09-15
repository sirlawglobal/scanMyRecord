import { describe, expect, it } from "vitest";
import { createRegistrationReferenceFromData, generateRegistrationReference } from "./registration.service";

describe("registration service", () => {
  it("generates a reference in the expected format", () => {
    const reference = generateRegistrationReference(2026);
    expect(reference).toMatch(/^SMR-2026-\d{6}$/);
  });

  it("validates and enriches registration payloads", () => {
    const result = createRegistrationReferenceFromData({
      fullName: "Ada Okafor",
      phone: "08031234567",
      email: "ada@example.com",
      address: "12 Lekki Phase 1",
      state: "Lagos",
      lga: "Eti-Osa",
      customFields: { needsSupport: "yes" },
    });

    expect(result.reference).toMatch(/^SMR-\d{4}-\d{6}$/);
    expect(result.fullName).toBe("Ada Okafor");
  });
});
