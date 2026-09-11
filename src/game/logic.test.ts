import { describe, expect, it } from "vitest";

import { CAMPUS_CENTER, INITIAL_SAVE } from "./data";
import {
  canRegisterAttack,
  captureSucceeds,
  damageFor,
  distanceMeters,
  moveCoordinate,
  sanitizeSave,
  typeMultiplier,
} from "./logic";

describe("element matchups", () => {
  it.each([
    ["fire", "fire", 1],
    ["fire", "grass", 1.5],
    ["fire", "water", 0.75],
    ["water", "water", 1],
    ["water", "fire", 1.5],
    ["water", "grass", 0.75],
    ["grass", "grass", 1],
    ["grass", "water", 1.5],
    ["grass", "fire", 0.75],
  ] as const)("%s against %s returns %s", (attacker, defender, expected) => {
    expect(typeMultiplier(attacker, defender)).toBe(expected);
  });

  it("applies elemental and fixed attack buffs", () => {
    expect(damageFor("charmadillo", "larvea", 100)).toBe(173);
    expect(damageFor("gulfin", "larvea", 100)).toBe(75);
  });
});

describe("battle input", () => {
  it("limits attacks to four per second", () => {
    expect(canRegisterAttack(1_000, 1_249)).toBe(false);
    expect(canRegisterAttack(1_000, 1_250)).toBe(true);
  });
});

describe("capture rules", () => {
  it("uses a 70 percent catch chance before the guarantee", () => {
    expect(captureSucceeds(1, 0.69)).toBe(true);
    expect(captureSucceeds(2, 0.7)).toBe(false);
  });

  it("guarantees the third hit", () => {
    expect(captureSucceeds(3, 0.999)).toBe(true);
  });
});

describe("campus distance", () => {
  it.each([39.9, 40, 40.1])("preserves a %s meter boundary", (meters) => {
    const destination = moveCoordinate(CAMPUS_CENTER, { x: 1, y: 0 }, meters);
    expect(distanceMeters(CAMPUS_CENTER, destination)).toBeCloseTo(meters, 1);
  });
});

describe("save validation", () => {
  it("rejects invalid versions and falls back safely", () => {
    expect(sanitizeSave({ schemaVersion: 99 })).toBeNull();
  });

  it("migrates legacy rewards while moving Cindrill out of the player roster", () => {
    const save = INITIAL_SAVE();
    const sanitized = sanitizeSave({
      ...save,
      schemaVersion: 1,
      ownedCreatureIds: ["cindrill", "cindrill"],
      completedEncounterIds: ["building44", "building44"],
    });
    expect(sanitized?.ownedCreatureIds).toEqual([
      "charmadillo",
      "gulfin",
      "cleaf",
      "draem",
    ]);
    expect(sanitized?.completedEncounterIds).toEqual(["building44"]);
  });
});
