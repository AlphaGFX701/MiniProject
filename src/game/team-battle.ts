import { BOSS_IDS, CREATURES } from "./data";
import { damageFor, maxHpFor } from "./logic";
import { chargedDamage, shieldDamage } from "./combat-rules";
import type { CreatureId } from "./types";

export type Slot = {
  id: CreatureId;
  hp: number;
  energy: number;
  attacks: number;
};
export type TeamBattle = {
  player: Slot[];
  enemy: Slot[];
  playerIndex: number;
  enemyIndex: number;
  switchReady: boolean;
  playerShield: boolean;
  enemyShield: boolean;
  lastTap: number;
  phase: "fight" | "charge" | "shield" | "replace" | "won" | "lost";
};
export type BattleEvent =
  | { type: "tap"; now: number }
  | { type: "enemy" }
  | { type: "ultimate" }
  | { type: "charge"; hits: number }
  | { type: "defend"; shield: boolean }
  | { type: "switch"; index: number };
export function validTeam(ids: CreatureId[], owned: CreatureId[]) {
  return (
    ids.length === 3 &&
    new Set(ids).size === 3 &&
    ids.every((id) => owned.includes(id) && CREATURES[id]?.role !== "boss") &&
    new Set(ids.map((id) => CREATURES[id].element)).size === 3
  );
}
export function randomBossTeam(
  random: () => number = Math.random,
): CreatureId[] {
  const pool = [...BOSS_IDS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.min(i, Math.max(0, Math.floor(random() * (i + 1))));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, 3);
}
export function createTeamBattle(
  player: CreatureId[],
  enemy: CreatureId[],
): TeamBattle {
  return {
    player: player.map((id) => ({
      id,
      hp: maxHpFor(id),
      energy: 0,
      attacks: 0,
    })),
    enemy: enemy.map((id) => ({
      id,
      hp: maxHpFor(id, 120),
      energy: 0,
      attacks: 0,
    })),
    playerIndex: 0,
    enemyIndex: 0,
    switchReady: true,
    playerShield: true,
    enemyShield: true,
    lastTap: -Infinity,
    phase: "fight",
  };
}
function finish(state: TeamBattle): TeamBattle {
  if (state.enemy[state.enemyIndex].hp <= 0) {
    const next = state.enemy.findIndex((s) => s.hp > 0);
    if (next < 0) return { ...state, phase: "won" };
    state.enemyIndex = next;
  }
  if (state.player[state.playerIndex].hp <= 0)
    state.phase = state.player.some((s) => s.hp > 0) ? "replace" : "lost";
  return state;
}
export function teamBattleReducer(
  current: TeamBattle,
  event: BattleEvent,
): TeamBattle {
  if (current.phase === "won" || current.phase === "lost") return current;
  const s = {
    ...current,
    player: current.player.map((x) => ({ ...x })),
    enemy: current.enemy.map((x) => ({ ...x })),
  };
  const p = s.player[s.playerIndex],
    e = s.enemy[s.enemyIndex];
  switch (event.type) {
    case "tap":
      if (s.phase !== "fight" || event.now - s.lastTap < 250) return current;
      s.lastTap = event.now;
      p.energy = Math.min(100, p.energy + 8);
      e.hp = Math.max(0, e.hp - damageFor(p.id, e.id, 5));
      break;
    case "enemy":
      if (s.phase !== "fight") return current;
      if (e.attacks >= 6) {
        e.attacks = 0;
        s.phase = "shield";
        break;
      }
      e.attacks++;
      p.hp = Math.max(0, p.hp - damageFor(e.id, p.id, 8));
      break;
    case "ultimate":
      if (s.phase !== "fight" || p.energy < 100) return current;
      p.energy = 0;
      s.phase = "charge";
      break;
    case "charge":
      if (s.phase !== "charge") return current;
      e.hp = Math.max(
        0,
        e.hp -
          shieldDamage(
            damageFor(p.id, e.id, chargedDamage(event.hits)),
            s.enemyShield,
          ),
      );
      s.enemyShield = false;
      s.phase = "fight";
      break;
    case "defend":
      if (s.phase !== "shield") return current;
      p.hp = Math.max(
        0,
        p.hp -
          shieldDamage(
            damageFor(e.id, p.id, 35),
            event.shield && s.playerShield,
          ),
      );
      if (event.shield) s.playerShield = false;
      s.phase = "fight";
      break;
    case "switch":
      if (
        event.index === s.playerIndex ||
        !s.player[event.index] ||
        s.player[event.index].hp <= 0
      )
        return current;
      if (s.phase === "replace") {
        s.playerIndex = event.index;
        s.switchReady = true;
        s.phase = "fight";
      } else if (s.phase === "fight" && s.switchReady) {
        s.playerIndex = event.index;
        s.switchReady = false;
      } else return current;
      break;
  }
  return finish(s);
}

export function randomOrbLayout(random: () => number = Math.random) {
  // Pick ten of sixteen safe cells, so each challenge has a different silhouette.
  const cells = Array.from({ length: 16 }, (_, i) => i);
  for (let i = 15; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  return cells.slice(0, 10).map((i) => ({
    x: 0.12 + (i % 4) * 0.25 + (random() - 0.5) * 0.015,
    y: 58 + Math.floor(i / 4) * 58 + (random() - 0.5) * 4,
    offset: random() * Math.PI * 2,
  }));
}
