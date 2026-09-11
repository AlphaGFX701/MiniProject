import { describe, expect, it } from "vitest";
import {
  collectOrbHits,
  orbAvailable,
  qteStage,
  WILD_BASIC_DAMAGE,
  WILD_ULTIMATE_DAMAGE,
} from "./presentation-rules";
import { STARTER_IDS, ENCOUNTER_LIST, INITIAL_SAVE } from "./data";
import { damageFor, maxHpFor, sanitizeSave } from "./logic";
import { chargedDamage } from "./combat-rules";
import { recordCapture } from "./save-rules";

describe("readable encounters", () => {
  it("does not score before preparation or after collection closes", () => {
    const positions = [{ x: 20, y: 20 }];
    expect(
      collectOrbHits(new Set(), positions, { x: 20, y: 20 }, 999).size,
    ).toBe(0);
    expect(
      collectOrbHits(new Set(), positions, { x: 20, y: 20 }, 6000).size,
    ).toBe(0);
    expect(qteStage(5999)).toBe("collect");
    expect(qteStage(6000)).toBe("result");
    expect(qteStage(6799)).toBe("result");
    expect(qteStage(6800)).toBe("done");
  });
  it("reveals two orbs per wave and counts repeated swipes only once", () => {
    const positions = Array.from({ length: 10 }, () => ({ x: 20, y: 20 }));
    let hits = collectOrbHits(new Set(), positions, positions[0], 1000);
    expect(hits.size).toBe(2);
    hits = collectOrbHits(hits, positions, positions[0], 1100);
    expect(hits.size).toBe(2);
    expect(orbAvailable(9, 4199)).toBe(false);
    expect(orbAvailable(9, 4200)).toBe(true);
    expect(collectOrbHits(hits, positions, positions[0], 4200).size).toBe(10);
  });
  it("preserves owned creatures and tutorial flags across reload and duplicate reward", () => {
    const saved = recordCapture(
      {
        ...INITIAL_SAVE(),
        ownedCreatureIds: ["charmadillo"],
        mapHintSeen: true,
        qteHintSeen: true,
        facultyNoticeSeen: true,
      },
      "faculty",
    );
    const loaded = sanitizeSave(JSON.parse(JSON.stringify(saved)))!;
    expect(loaded.mapHintSeen).toBe(true);
    expect(loaded.qteHintSeen).toBe(true);
    expect(loaded.facultyNoticeSeen).toBe(true);
    expect(loaded.ownedCreatureIds).toEqual(saved.ownedCreatureIds);
    expect(recordCapture(loaded, "faculty")).toBe(loaded);
  });
  for (const starter of STARTER_IDS)
    for (const encounter of ENCOUNTER_LIST) {
      it(`${starter} can beat ${encounter.creatureId} at two taps/sec and six QTE hits`, () => {
        let hp = maxHpFor(starter),
          enemyHp = 160,
          energy = 0,
          enemyAttacks = 0;
        // Active combat time: QTE and warning presentation freeze normal attacks.
        for (let t = 100; t <= 60000 && hp > 0 && enemyHp > 0; t += 100) {
          if (t % 500 === 0) {
            enemyHp -= damageFor(starter, encounter.creatureId, 5);
            energy = Math.min(100, energy + 8);
            if (energy === 100 && enemyHp > 0) {
              enemyHp -= damageFor(
                starter,
                encounter.creatureId,
                chargedDamage(6),
              );
              energy = 0;
            }
          }
          if (t % 1200 === 0 && enemyHp > 0) {
            enemyAttacks++;
            hp -= damageFor(
              encounter.creatureId,
              starter,
              enemyAttacks === 7 ? WILD_ULTIMATE_DAMAGE : WILD_BASIC_DAMAGE,
            );
            if (enemyAttacks === 7) enemyAttacks = 0;
          }
        }
        expect(enemyHp).toBeLessThanOrEqual(0);
        expect(hp).toBeGreaterThan(0);
      });
    }
});
