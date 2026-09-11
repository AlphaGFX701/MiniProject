import { expect, it } from "vitest";
import {
  chooseStarter,
  availableEncounters,
  recordCapture,
} from "./save-rules";
import { INITIAL_SAVE, coreComplete } from "./data";
import type { EncounterId } from "./types";

it("selects exactly one starter and rejects subsequent selections", () => {
  const save = chooseStarter(INITIAL_SAVE(), "gulfin");
  expect(save.ownedCreatureIds).toEqual(["gulfin"]);
  expect(chooseStarter(save, "cleaf")).toBe(save);
  expect(chooseStarter(INITIAL_SAVE(), "atrox").ownedCreatureIds).toEqual([]);
});
it("extra catches do not unlock faculty or the other starters", () => {
  let save = chooseStarter(INITIAL_SAVE(), "gulfin");
  for (const id of [
    "extra-faculty",
    "extra-building44",
    "extra-plaza",
  ] as EncounterId[])
    save = recordCapture(save, id);
  expect(coreComplete(save.completedEncounterIds)).toBe(false);
  expect(
    availableEncounters(save, "faculty").some((e) => e.id === "starter-fire"),
  ).toBe(false);
  expect(recordCapture(save, "starter-fire")).toBe(save);
});
it("unlocks the two unchosen starters and allows all nine player species", () => {
  let save = chooseStarter(INITIAL_SAVE(), "gulfin");
  for (const id of ["faculty", "building44", "plaza"] as EncounterId[])
    save = recordCapture(save, id);
  expect(coreComplete(save.completedEncounterIds)).toBe(true);
  expect(
    availableEncounters(save, "building44").some(
      (e) => e.id === "starter-water",
    ),
  ).toBe(false);
  expect(
    availableEncounters(save, "faculty").some((e) => e.id === "starter-fire"),
  ).toBe(true);
  for (const id of [
    "extra-faculty",
    "extra-building44",
    "extra-plaza",
    "starter-fire",
    "starter-grass",
  ] as EncounterId[])
    save = recordCapture(save, id);
  expect(new Set(save.ownedCreatureIds).size).toBe(9);
});
it("records ownership and encounter once in the same immutable save", () => {
  const original = chooseStarter(INITIAL_SAVE(), "charmadillo");
  const next = recordCapture(original, "faculty");
  expect(original.completedEncounterIds).toEqual([]);
  expect(next.ownedCreatureIds).toContain("friolera");
  expect(next.completedEncounterIds).toEqual(["faculty"]);
  expect(recordCapture(next, "faculty")).toBe(next);
});
