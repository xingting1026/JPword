import { describe, it, expect } from "vitest";
import { LEVELS, unlockedLevels, nextLevelAfter, filterSelectable } from "../src/levels";

describe("levels", () => {
  it("orders levels from N5 to N1", () => {
    expect(LEVELS).toEqual(["N5", "N4", "N3", "N2", "N1"]);
  });
  it("unlocks cumulatively", () => {
    expect(unlockedLevels(null)).toEqual(["N5"]);
    expect(unlockedLevels("N4")).toEqual(["N5", "N4"]);
    expect(unlockedLevels("N3")).toEqual(["N5", "N4", "N3"]);
    expect(unlockedLevels("N1")).toEqual(["N5", "N4", "N3", "N2", "N1"]);
  });
  it("gives the level after the highest selected", () => {
    expect(nextLevelAfter(["N5"])).toBe("N4");
    expect(nextLevelAfter(["N5", "N4"])).toBe("N3");
    expect(nextLevelAfter(["N4", "N5"])).toBe("N3");
    expect(nextLevelAfter(["N1"])).toBeNull();
    expect(nextLevelAfter(["N5", "N1"])).toBeNull();
  });
  it("filters a requested selection down to unlocked levels, defaulting to N5", () => {
    expect(filterSelectable(["N4", "N3"], ["N5", "N4"])).toEqual(["N4"]);
    expect(filterSelectable(["N1"], ["N5"])).toEqual(["N5"]);
  });
});
