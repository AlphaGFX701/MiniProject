import { describe, expect, it } from "vitest";
import { chargedDamage, shieldDamage, captureShakes } from "./combat-rules";
import { sanitizeSave, captureSucceeds } from "./logic";
import { INITIAL_SAVE } from "./data";
describe("refined combat and capture", () => {
  it("weak missed charge still deals damage and complete charge reaches fifty", () => {
    expect(chargedDamage(0)).toBe(15);
    expect(chargedDamage(24)).toBe(50);
    expect(chargedDamage(-1)).toBe(15);
    expect(chargedDamage(100)).toBe(50);
    for (let n = 1; n <= 24; n++)
      expect(chargedDamage(n)).toBeGreaterThan(chargedDamage(n - 1));
  });
  it("shield blocks eighty percent after damage calculation", () => {
    expect(shieldDamage(50, true)).toBe(10);
    expect(shieldDamage(50, false)).toBe(50);
  });
  it("success shakes three times while escape never looks successful", () => {
    expect(captureShakes(true, 0)).toBe(3);
    expect(captureShakes(false, 0)).toBe(1);
    expect(captureShakes(false, 0.9)).toBe(2);
    expect(captureSucceeds(3, 0.99)).toBe(true);
  });
  it("old saves default music on and retain explicit muted setting", () => {
    const { musicEnabled: _music, ...old } = INITIAL_SAVE();
    expect(sanitizeSave(old)?.musicEnabled).toBe(true);
    expect(sanitizeSave({ ...old, musicEnabled: false })?.musicEnabled).toBe(
      false,
    );
  });
});
