import { describe, it, expect } from "vitest";
import { verifyKey, revealKey } from "../src/keys";

describe("keys", () => {
  it("round-trips every revealed key through verifyKey, case-insensitively", async () => {
    for (const level of ["N4", "N3", "N2", "N1"] as const) {
      const k = revealKey(level);
      expect(k).toMatch(/^[A-Z]{4}$/);
      expect(await verifyKey(k!)).toBe(level);
      expect(await verifyKey(` ${k!.toLowerCase()} `)).toBe(level);
    }
  });
  it("rejects unknown keys and returns null for N5", async () => {
    expect(await verifyKey("ZZZZ")).toBeNull();
    expect(await verifyKey("")).toBeNull();
    expect(revealKey("N5")).toBeNull();
  });
  it("uses four distinct keys", () => {
    const ks = (["N4", "N3", "N2", "N1"] as const).map(revealKey);
    expect(new Set(ks).size).toBe(4);
  });
});
