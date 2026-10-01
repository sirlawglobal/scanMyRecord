import { describe, expect, it } from "vitest";
import { slugify, uniqueSlug } from "./slug";

describe("slug", () => {
  it("slugifies and returns empty for symbol-only titles", () => {
    expect(slugify("  Road & Bridge, Phase 2! ")).toBe("road-bridge-phase-2");
    expect(slugify("!!!")).toBe("");
  });

  it("appends a numeric suffix until the slug is free", async () => {
    const taken = new Set(["road", "road-2"]);
    expect(await uniqueSlug(async (s) => taken.has(s), "road")).toBe("road-3");
    expect(await uniqueSlug(async (s) => taken.has(s), "bridge")).toBe("bridge");
  });
});
