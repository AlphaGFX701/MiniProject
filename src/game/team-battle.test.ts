import { describe, it, expect } from "vitest";
import {
  createTeamBattle,
  teamBattleReducer as reduce,
  bossTeamWithCounter,
  randomBossTeam,
  trainerAttackDelay,
  validTeam,
  randomOrbLayout,
  TRAINER_RULES,
} from "./team-battle";
import { INITIAL_SAVE, PLAYER_IDS, BOSS_IDS, CREATURES } from "./data";
import { sanitizeSave, typeMultiplier } from "./logic";
import type { CreatureId, Element } from "./types";
const team: CreatureId[] = ["charmadillo", "friolera", "pouch"];
const enemies: CreatureId[] = ["atrox", "finsta", "jacana"];
describe("faculty expansion", () => {
  it("separates nine companions and six bosses", () => {
    expect(PLAYER_IDS).toHaveLength(9);
    expect(BOSS_IDS).toHaveLength(6);
    expect(PLAYER_IDS.some((id) => BOSS_IDS.includes(id))).toBe(false);
  });
  it("requires owned, distinct species and distinct elements", () => {
    expect(validTeam(team, team)).toBe(true);
    expect(validTeam(["gulfin", "finiette", "pouch"], PLAYER_IDS)).toBe(false);
    expect(
      validTeam(
        ["atrox", "friolera", "charmadillo"],
        [...PLAYER_IDS, ...BOSS_IDS],
      ),
    ).toBe(false);
    expect(validTeam(team, [])).toBe(false);
  });
  it("samples exactly three unique boss species", () => {
    for (let i = 0; i < 50; i++) {
      const ids = randomBossTeam();
      expect(new Set(ids).size).toBe(3);
      expect(ids.every((id) => BOSS_IDS.includes(id))).toBe(true);
    }
  });
  it("builds a hidden team with exactly one counter to the opening companion", () => {
    for (const playerId of PLAYER_IDS) {
      const ids = bossTeamWithCounter(playerId, () => 0.42);
      expect(new Set(ids).size).toBe(3);
      expect(ids.every((id) => BOSS_IDS.includes(id))).toBe(true);
      expect(
        ids.filter(
          (id) =>
            typeMultiplier(
              CREATURES[id].element,
              CREATURES[playerId].element,
            ) > 1,
        ),
      ).toHaveLength(1);
    }
  });
  it("uses a fast but human-like randomized trainer attack delay", () => {
    expect(trainerAttackDelay(() => 0)).toBe(650);
    expect(trainerAttackDelay(() => 0.5)).toBeGreaterThanOrEqual(775);
    expect(trainerAttackDelay(() => 0.999)).toBeLessThanOrEqual(900);
  });
  it("gives trainer teams tougher Echoes and faster Ultimates", () => {
    const battle = createTeamBattle(team, enemies);
    expect(battle.enemy[0].hp).toBeGreaterThan(battle.player[0].hp);
    expect(TRAINER_RULES.enemyBasicDamage).toBeGreaterThan(8);
    expect(TRAINER_RULES.attacksBeforeUltimate).toBeLessThan(6);
  });
  it("preserves bench resources and locks switching until the replacement faints", () => {
    let s = createTeamBattle(team, enemies);
    s.player[0].hp = 45;
    s.player[0].energy = 72;
    s = reduce(s, { type: "switch", index: 1 });
    expect(s.switchReady).toBe(false);
    expect(reduce(s, { type: "switch", index: 0 })).toBe(s);
    s.player[1].hp = 1;
    s = reduce(s, { type: "enemy" });
    expect(s.phase).toBe("replace");
    s = reduce(s, { type: "switch", index: 0 });
    expect(s.switchReady).toBe(true);
    expect(s.player[0]).toMatchObject({ hp: 45, energy: 72 });
  });
  it("rejects rapid taps and blocks combat during charge", () => {
    let s = createTeamBattle(team, enemies);
    s = reduce(s, { type: "tap", now: 1000 });
    expect(reduce(s, { type: "tap", now: 1249 })).toBe(s);
    s.player[0].energy = 100;
    s = reduce(s, { type: "ultimate" });
    expect(s.phase).toBe("charge");
    expect(reduce(s, { type: "enemy" })).toBe(s);
    expect(reduce(s, { type: "ultimate" })).toBe(s);
    s = reduce(s, { type: "charge", hits: 10 });
    expect(s.enemyShield).toBe(false);
    expect(reduce(s, { type: "charge", hits: 10 })).toBe(s);
  });
  it("uses a side-wide shield only once", () => {
    let s = createTeamBattle(team, enemies);
    s.phase = "shield";
    s = reduce(s, { type: "defend", shield: true });
    expect(s.playerShield).toBe(false);
    s = reduce(s, { type: "switch", index: 1 });
    expect(s.playerShield).toBe(false);
  });
  it("finishes once when the final enemy faints", () => {
    let s = createTeamBattle(team, enemies);
    s.enemy.forEach((e) => (e.hp = 0));
    s.enemy[0].hp = 1;
    s = reduce(s, { type: "tap", now: 1000 });
    expect(s.phase).toBe("won");
    expect(reduce(s, { type: "enemy" })).toBe(s);
  });
  it("keeps new saves starter-free until selection and does not grant extra starters", () => {
    expect(INITIAL_SAVE().ownedCreatureIds).toEqual([]);
    const save = sanitizeSave({
      ...INITIAL_SAVE(),
      ownedCreatureIds: ["gulfin"],
      starterId: "gulfin",
      onboardingCompleted: true,
    });
    expect(save?.ownedCreatureIds).toEqual(["gulfin"]);
  });
  it("defines all 36 elemental pairs", () => {
    const elements: Element[] = [
      "fire",
      "water",
      "grass",
      "ice",
      "psychic",
      "dark",
    ];
    for (const a of elements)
      for (const b of elements)
        expect([0.75, 1, 1.5]).toContain(typeMultiplier(a, b));
    expect(typeMultiplier("dark", "psychic")).toBe(1.5);
    expect(typeMultiplier("fire", "dark")).toBe(1.5);
  });
  it("random orbs stay within reachable bounds", () => {
    for (let n = 0; n < 20; n++) {
      const layout = randomOrbLayout();
      expect(layout).toHaveLength(10);
      layout.forEach((p) => {
        expect(p.x).toBeGreaterThan(0.09);
        expect(p.x).toBeLessThan(0.91);
        expect(p.y).toBeGreaterThan(50);
        expect(p.y).toBeLessThan(235);
      });
    }
  });
});
