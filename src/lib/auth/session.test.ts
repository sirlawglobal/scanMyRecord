import { describe, expect, it } from "vitest";
import { createSession, verifySession } from "./session";

describe("session auth", () => {
  it("creates and verifies a session token", async () => {
    const token = await createSession("user-1", "SUPER_ADMIN");
    const payload = await verifySession(token);

    expect(payload?.sub).toBe("user-1");
    expect(payload?.role).toBe("SUPER_ADMIN");
  });
});
