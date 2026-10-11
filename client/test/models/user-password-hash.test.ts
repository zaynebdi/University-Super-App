import { describe, it, expect, beforeAll } from "vitest";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "@/lib/models";

/**
 * Regression test for the double-hash bug.
 *
 * The register route hashes the password (bcrypt, 12 rounds) before calling
 * User.create. The User model used to ALSO hash in a pre("save") hook, which
 * meant the stored password was hashed twice and could never be verified by
 * login (auth.config.ts compares the plaintext against the stored hash).
 *
 * No database is used: with bufferCommands=false, save() rejects immediately,
 * but the pre-save middleware chain still runs. If a hashing hook ever comes
 * back, doc.get("password") will be re-hashed and the compare below will fail.
 */
describe("User model password hashing", () => {
  beforeAll(() => {
    mongoose.set("bufferCommands", false);
  });

  it("stores the password exactly as the register route provides it (hashed once, 12 rounds)", async () => {
    const plaintext = "Sup3rSecret!";

    // Exactly what app/api/auth/register/route.ts does before User.create:
    const hash = await bcrypt.hash(plaintext, 12);

    const doc = new User({
      name: "Hashed Once",
      email: "once@example.com",
      password: hash,
      role: "admin",
      isActive: true,
    });

    // No connection -> rejects after the pre-save middleware (if any) runs.
    await doc.save().catch(() => {});

    const stored = doc.get("password") as string;
    expect(bcrypt.getRounds(stored)).toBe(12);

    // This is the login check (auth.config.ts). It must pass, otherwise the
    // password was hashed more than once.
    expect(await bcrypt.compare(plaintext, stored)).toBe(true);
  });
});