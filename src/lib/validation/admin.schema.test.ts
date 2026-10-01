import { describe, expect, it } from "vitest";
import { loginSchema } from "./auth.schema";
import {
  programmeCreateSchema,
  programmeUpdateSchema,
  projectCreateSchema,
  projectUpdateSchema,
} from "./admin.schema";

describe("project schemas", () => {
  const valid = { title: "Borehole", category: "Water", status: "ongoing", year: 2025 };

  it("accepts a valid project and normalises the form's blank/uppercase values", () => {
    const result = projectCreateSchema.safeParse({ ...valid, status: "Ongoing", year: "", summary: "  hi " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("ongoing");
      expect(result.data.year).toBeUndefined();
      expect(result.data.summary).toBe("hi");
    }
  });

  it.each([
    [{ ...valid, title: "   " }, "Title is required."],
    [{ ...valid, title: "x".repeat(161) }, "Title must be at most 160 characters."],
    [{ ...valid, category: "" }, "Category is required."],
    [{ ...valid, status: "done" }, "Status must be completed, ongoing or proposed."],
    [{ ...valid, year: "abc" }, "Year must be a number."],
    [{ ...valid, year: 1800 }, "Year must be 1900 or later."],
    [{ ...valid, year: 2020.5 }, "Year must be a whole number."],
    [{ ...valid, summary: { a: 1 } }, "Summary must be text."],
    [{ ...valid, media: [{ url: "javascript:alert(1)" }] }, "Media URLs must be https links or uploaded files."],
    [{ ...valid, media: [{ url: "http://insecure.example/x.jpg" }] }, "Media URLs must be https links or uploaded files."],
    [{ ...valid, media: "nope" }, "Media must be an array of { url, type, stage } items."],
  ])("rejects %j", (input, message) => {
    const result = projectCreateSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(message);
    }
  });

  it("accepts https and local upload media", () => {
    const result = projectCreateSchema.safeParse({
      ...valid,
      media: [{ url: "https://res.cloudinary.com/x/a.jpg" }, { url: "/uploads/1_a.jpg", type: "image", stage: "before" }],
    });
    expect(result.success).toBe(true);
  });

  it("update only validates the fields that are sent", () => {
    expect(projectUpdateSchema.safeParse({ status: "completed" }).success).toBe(true);
    expect(projectUpdateSchema.safeParse({ title: "" }).success).toBe(false);
    expect(projectUpdateSchema.safeParse({}).success).toBe(true);
  });
});

describe("programme schemas", () => {
  it("accepts the create form payload", () => {
    const result = programmeCreateSchema.safeParse({
      title: "Skills",
      description: "d",
      category: "Youth",
      capacity: "50",
      registrationDeadline: "2026-12-31",
      registrationOpen: true,
      images: [],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.capacity).toBe(50);
      expect(result.data.registrationDeadline).toBeInstanceOf(Date);
    }
  });

  it("treats blank capacity and deadline as null (unlimited / none)", () => {
    const result = programmeCreateSchema.safeParse({ title: "Skills", capacity: "", registrationDeadline: "" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.capacity).toBeNull();
      expect(result.data.registrationDeadline).toBeNull();
    }
  });

  it.each([
    [{ title: "" }, "Title is required."],
    [{ title: "T", capacity: "abc" }, "Capacity must be a number."],
    [{ title: "T", capacity: 0 }, "Capacity must be at least 1."],
    [{ title: "T", capacity: 2.5 }, "Capacity must be a whole number."],
    [{ title: "T", registrationDeadline: "not-a-date" }, "Registration deadline is not a valid date."],
    [{ title: "T", images: ["ftp://x"] }, "Media URLs must be https links or uploaded files."],
    [{ title: "T", images: "x" }, "Images must be an array of URLs."],
  ])("rejects %j", (input, message) => {
    const result = programmeCreateSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(message);
    }
  });

  it("update distinguishes absent fields from null (clear)", () => {
    const cleared = programmeUpdateSchema.parse({ capacity: "" });
    expect(cleared.capacity).toBeNull();
    expect(programmeUpdateSchema.parse({}).capacity).toBeUndefined();
    expect(programmeUpdateSchema.safeParse({ status: "archived" }).success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts a normal login and trims the email", () => {
    const result = loginSchema.safeParse({ email: " a@b.co ", password: "x" });
    expect(result.success).toBe(true);
  });

  it("rejects malformed input", () => {
    expect(loginSchema.safeParse({ email: "nope", password: "x" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "a@b.co", password: "" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "a@b.co", password: "x".repeat(129) }).success).toBe(false);
    expect(loginSchema.safeParse({ email: { $ne: "" }, password: "x" }).success).toBe(false);
  });
});
