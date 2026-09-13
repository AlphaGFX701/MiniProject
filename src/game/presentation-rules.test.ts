import { describe, expect, it } from "vitest";
import {
  isQteOrbVisible,
  qteOrbOpacity,
  segmentHitsCircle,
  qteRating,
  qteStage,
  QTE_ORB_COUNT,
  QTE_TIMING,
  WILD_BASIC_DAMAGE,
  WILD_ULTIMATE_DAMAGE,
} from "./presentation-rules";
import {
  STARTER_IDS,
  ENCOUNTER_LIST,
  FACULTY_COORDINATES,
  INITIAL_SAVE,
} from "./data";
import { damageFor, distanceMeters, maxHpFor, sanitizeSave } from "./logic";
import { chargedDamage } from "./combat-rules";
import { recordCapture } from "./save-rules";

describe("readable encounters", () => {
  it("gives players four readable seconds to sweep the charge orbs", () => {
    expect(QTE_TIMING).toEqual({ prepare: 750, collect: 4000, result: 700 });
    expect(QTE_ORB_COUNT).toBe(20);
    expect(qteStage(4749)).toBe("collect");
    expect(qteStage(4750)).toBe("result");
    expect(qteStage(5449)).toBe("result");
    expect(qteStage(5450)).toBe("done");
  });
  it("shows five orbs per slower wave and keeps them readable", () => {
    expect(Array.from({ length: 20 }, (_, i) => isQteOrbVisible(i, 750)).filter(Boolean)).toHaveLength(5);
    expect(Array.from({ length: 20 }, (_, i) => isQteOrbVisible(i, 1700)).filter(Boolean)).toHaveLength(10);
    expect(isQteOrbVisible(0, 2201)).toBe(false);
  });
  it("fades collected and expired orbs instead of leaving them on screen", () => {
    expect(qteOrbOpacity(0, 800, 800)).toBe(1);
    expect(qteOrbOpacity(0, 900, 800)).toBeCloseTo(0.5);
    expect(qteOrbOpacity(0, 1000, 800)).toBe(0);
    expect(qteOrbOpacity(0, 2100)).toBeLessThan(1);
    expect(qteOrbOpacity(0, 2201)).toBe(0);
  });
  it("detects a fast drag crossing an orb without accepting a remote segment", () => {
    expect(segmentHitsCircle({ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 4 }, 8)).toBe(true);
    expect(segmentHitsCircle({ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 20 }, 8)).toBe(false);
  });
  it("grades the 20-orb challenge at reachable thresholds", () => {
    expect(qteRating(6)).toBe("KEEP SWIPING");
    expect(qteRating(7)).toBe("NICE");
    expect(qteRating(12)).toBe("GREAT");
    expect(qteRating(17)).toBe("EXCELLENT");
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
      it(`${starter} can beat ${encounter.creatureId} at two taps/sec and nine QTE hits`, () => {
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
                chargedDamage(9),
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
  it("keeps every trainer outside its wild encounter radius", () => {
    for (const encounter of ENCOUNTER_LIST) {
      const trainer = FACULTY_COORDINATES[
        encounter.id as keyof typeof FACULTY_COORDINATES
      ];
      expect(distanceMeters(encounter.coordinate, trainer)).toBeGreaterThanOrEqual(70);
    }
  });
});
