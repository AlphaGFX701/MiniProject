import { CREATURES, STARTER_IDS, ENCOUNTERS } from "./data";
import type {
  Coordinate,
  CreatureId,
  Element,
  EncounterId,
  GameSaveV1,
} from "./types";

const EARTH_RADIUS_METERS = 6_371_000;

export function typeMultiplier(attacker: Element, defender: Element): number {
  const strengths: Record<Element, Element[]> = {
    fire: ["grass", "ice", "dark"],
    water: ["fire"],
    grass: ["water"],
    ice: ["grass"],
    psychic: ["ice"],
    dark: ["psychic"],
  };
  if (strengths[attacker].includes(defender)) return 1.5;
  if (strengths[defender].includes(attacker)) return 0.75;
  return 1;
}

export function maxHpFor(creatureId: CreatureId, baseHp = 100): number {
  const buff = CREATURES[creatureId].buff;
  return buff.stat === "hp" ? baseHp + buff.amount : baseHp;
}

export function damageFor(
  attackerId: CreatureId,
  defenderId: CreatureId,
  baseDamage: number,
): number {
  const attacker = CREATURES[attackerId];
  const defender = CREATURES[defenderId];
  const attackScale =
    attacker.buff.stat === "attack" ? 1 + attacker.buff.amount : 1;
  return Math.round(
    baseDamage *
      attackScale *
      typeMultiplier(attacker.element, defender.element) +
      1e-9,
  );
}

export function distanceMeters(a: Coordinate, b: Coordinate): number {
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDelta = radians(b.latitude - a.latitude);
  const longitudeDelta = radians(b.longitude - a.longitude);
  const latitudeA = radians(a.latitude);
  const latitudeB = radians(b.latitude);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(latitudeA) *
      Math.cos(latitudeB) *
      Math.sin(longitudeDelta / 2) ** 2;
  return (
    2 *
    EARTH_RADIUS_METERS *
    Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  );
}

export function moveCoordinate(
  origin: Coordinate,
  vector: { x: number; y: number },
  meters: number,
): Coordinate {
  const latitudeDelta = (-vector.y * meters) / 111_320;
  const longitudeScale = 111_320 * Math.cos((origin.latitude * Math.PI) / 180);
  const longitudeDelta = (vector.x * meters) / longitudeScale;
  return {
    latitude: origin.latitude + latitudeDelta,
    longitude: origin.longitude + longitudeDelta,
  };
}

export function canRegisterAttack(previousTapAt: number, now: number): boolean {
  return now - previousTapAt >= 250;
}

export function captureSucceeds(
  hitCount: number,
  randomValue: number,
): boolean {
  return hitCount >= 3 || randomValue < 0.7;
}

export function sanitizeSave(value: unknown): GameSaveV1 | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<GameSaveV1>;
  if (candidate.schemaVersion !== 1 && candidate.schemaVersion !== 2)
    return null;

  const validCreatureIds = Object.keys(CREATURES) as CreatureId[];
  const validEncounterIds = Object.keys(ENCOUNTERS) as EncounterId[];
  const owned = Array.isArray(candidate.ownedCreatureIds)
    ? candidate.ownedCreatureIds.filter((id): id is CreatureId =>
        validCreatureIds.includes(id),
      )
    : [];
  const completed = Array.isArray(candidate.completedEncounterIds)
    ? candidate.completedEncounterIds.filter((id): id is EncounterId =>
        validEncounterIds.includes(id),
      )
    : [];
  const active = validCreatureIds.includes(
    candidate.activeCompanionId as CreatureId,
  )
    ? (candidate.activeCompanionId as CreatureId)
    : STARTER_IDS[0];

  const legacy = candidate.schemaVersion === 1;
  const migrated = legacy
    ? owned.map((id) => (id === "cindrill" ? ("draem" as CreatureId) : id))
    : owned;
  const ownership = Array.from(
    new Set(legacy ? [...STARTER_IDS, ...migrated] : migrated),
  ).filter((id) => CREATURES[id].role !== "boss");
  if (legacy)
    completed.forEach((id) => {
      const creature = ENCOUNTERS[id].creatureId;
      if (!ownership.includes(creature)) ownership.push(creature);
    });
  const playerName =
    typeof candidate.playerName === "string"
      ? candidate.playerName.trim().slice(0, 20)
      : "";
  return {
    schemaVersion: 2,
    starterId: STARTER_IDS.includes(candidate.starterId as CreatureId)
      ? candidate.starterId
      : legacy
        ? STARTER_IDS[0]
        : undefined,
    playerName: playerName || undefined,
    facultyVictories: Array.isArray(candidate.facultyVictories)
      ? [
          ...new Set(
            candidate.facultyVictories.filter((id) =>
              ["faculty", "building44", "plaza"].includes(id),
            ),
          ),
        ]
      : [],
    ownedCreatureIds: ownership,
    completedEncounterIds: Array.from(new Set(completed)),
    activeCompanionId: ownership.includes(active)
      ? active
      : (ownership[0] ?? STARTER_IDS[0]),
    soundEnabled: candidate.soundEnabled !== false,
    musicEnabled: candidate.musicEnabled !== false,
    mapHintSeen: candidate.mapHintSeen === true,
    qteHintSeen: candidate.qteHintSeen === true,
    facultyNoticeSeen: candidate.facultyNoticeSeen === true,
    onboardingCompleted:
      candidate.onboardingCompleted === true && ownership.length > 0,
  };
}
