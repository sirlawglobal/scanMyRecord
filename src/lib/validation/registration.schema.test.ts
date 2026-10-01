import { describe, expect, it } from "vitest";
import { escapeHtml } from "@/lib/email/escape";
import { renderRegistrationConfirmationEmail } from "@/lib/email/templates/registration-confirmation";
import { registrationSchema, validateCustomFields, type ProgrammeFieldDefinition } from "./registration.schema";

const valid = {
  fullName: "Ada Okafor",
  phone: "0803 123 4567",
  email: "  Ada@Example.COM ",
  address: "12 Lekki Phase 1",
  state: "Lagos",
  lga: "Eti-Osa",
  customFields: {},
};

describe("registrationSchema", () => {
  it("normalises the email and trims text", () => {
    const result = registrationSchema.parse({ ...valid, fullName: "  Ada Okafor " });
    expect(result.email).toBe("ada@example.com");
    expect(result.fullName).toBe("Ada Okafor");
  });

  it.each<[unknown, string]>([
    [{ ...valid, fullName: "x".repeat(121) }, "Full name must be at most 120 characters."],
    [{ ...valid, phone: "<script>" }, "Enter a valid phone number (7-20 digits, e.g. 08031234567)."],
    [{ ...valid, phone: "123" }, "Enter a valid phone number (7-20 digits, e.g. 08031234567)."],
    [{ ...valid, email: "nope" }, "A valid email is required."],
    [{ ...valid, address: "x".repeat(301) }, "Address must be at most 300 characters."],
    [{ ...valid, customFields: { "$where": "1" } }, "Invalid custom field name."],
    [{ ...valid, customFields: { "a.b": "1" } }, "Invalid custom field name."],
    [{ ...valid, customFields: { note: { nested: true } } }, "Invalid input"],
    [{ ...valid, customFields: { note: "x".repeat(2001) } }, "A custom field answer is too long."],
  ])("rejects %j", (input) => {
    expect(registrationSchema.safeParse(input).success).toBe(false);
  });

  it("rejects more than 30 custom fields", () => {
    const customFields = Object.fromEntries(Array.from({ length: 31 }, (_, i) => [`f${i}`, "x"]));
    expect(registrationSchema.safeParse({ ...valid, customFields }).success).toBe(false);
  });
});

describe("validateCustomFields", () => {
  const defs: ProgrammeFieldDefinition[] = [
    { name: "age", label: "Age", type: "number", required: true },
    { name: "track", label: "Track", type: "select", options: ["web", "data"] },
    { name: "contact", label: "Contact", type: "email" },
  ];

  it("accepts valid answers and coerces numbers", () => {
    const result = validateCustomFields(defs, { age: "21", track: "web" });
    expect(result).toEqual({ ok: true, values: { age: 21, track: "web" } });
  });

  it("rejects unknown keys when the programme defines none", () => {
    expect(validateCustomFields([], { anything: "x" })).toEqual({ ok: false, error: 'Unexpected field "anything".' });
    expect(validateCustomFields([], {})).toEqual({ ok: true, values: {} });
  });

  it.each([
    [{}, "Age is required."],
    [{ age: "abc" }, "Age must be a number."],
    [{ age: 20, track: "ml" }, "Track must be one of the listed options."],
    [{ age: 20, contact: "nope" }, "Contact must be a valid email."],
  ])("rejects %j", (input, error) => {
    expect(validateCustomFields(defs, input)).toEqual({ ok: false, error });
  });
});

describe("email escaping", () => {
  it("escapes HTML metacharacters", () => {
    expect(escapeHtml(`<img src=x onerror="a()">&'`)).toBe("&lt;img src=x onerror=&quot;a()&quot;&gt;&amp;&#39;");
  });

  it("does not let a malicious name inject markup into the confirmation email", () => {
    const { html } = renderRegistrationConfirmationEmail({
      reference: "SMR-2026-123456",
      fullName: `<img src=x onerror=alert(1)>`,
      email: "a@b.co",
      programmeTitle: `<script>alert(1)</script>`,
    });

    expect(html).not.toContain("<img src=x");
    expect(html).not.toContain("<script>alert(1)");
    expect(html).toContain("&lt;img src=x onerror=alert(1)&gt;");
  });
});
