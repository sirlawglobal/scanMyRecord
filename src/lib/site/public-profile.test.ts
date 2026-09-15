import { afterEach, describe, expect, it } from "vitest";
import { getDefaultPoliticianSlug, getPublicProfileFallback } from "./public-profile";

afterEach(() => {
  delete process.env.NEXT_PUBLIC_POLITICIAN_SLUG;
  delete process.env.NEXT_PUBLIC_POLITICIAN_NAME;
  delete process.env.NEXT_PUBLIC_POLITICIAN_OFFICE;
  delete process.env.NEXT_PUBLIC_POLITICIAN_CONSTITUENCY;
  delete process.env.NEXT_PUBLIC_POLITICIAN_TAGLINE;
});

describe("public profile config", () => {
  it("uses the configured politician slug as the default public route", () => {
    process.env.NEXT_PUBLIC_POLITICIAN_SLUG = "senator-ada-eze";

    expect(getDefaultPoliticianSlug()).toBe("senator-ada-eze");
  });

  it("builds a production-safe fallback profile from environment variables", () => {
    process.env.NEXT_PUBLIC_POLITICIAN_NAME = "Senator Ada Eze";
    process.env.NEXT_PUBLIC_POLITICIAN_OFFICE = "Senator, Federal Republic of Nigeria";
    process.env.NEXT_PUBLIC_POLITICIAN_CONSTITUENCY = "Abia Central";
    process.env.NEXT_PUBLIC_POLITICIAN_TAGLINE = "Public service grounded in transparency, access, and accountability.";

    expect(getPublicProfileFallback()).toMatchObject({
      name: "Senator Ada Eze",
      office: "Senator, Federal Republic of Nigeria",
      constituency: "Abia Central",
      tagline: "Public service grounded in transparency, access, and accountability.",
    });
  });

  it("ignores placeholder MongoDB values and keeps the profile in fallback mode", () => {
    process.env.MONGODB_URI = "replace-with-your-mongodb-atlas-connection-string";
    process.env.NEXT_PUBLIC_POLITICIAN_NAME = "Mr. Temple";
    process.env.NEXT_PUBLIC_POLITICIAN_OFFICE = "Governor of the state";
    process.env.NEXT_PUBLIC_POLITICIAN_CONSTITUENCY = "Ife East Federal Constituency";
    process.env.NEXT_PUBLIC_POLITICIAN_TAGLINE = "PDP";

    const profile = getPublicProfileFallback();

    expect(profile.name).toBe("Mr. Temple");
    expect(profile.office).toBe("Governor of the state");
  });
});
