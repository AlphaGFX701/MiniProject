import { CREATURES, ENCOUNTERS, STARTER_IDS, coreComplete } from "./data";
import type { CreatureId, EncounterId, GameSaveV1, LandmarkId } from "./types";

export function chooseStarter(save: GameSaveV1, id: CreatureId): GameSaveV1 {
  if (!STARTER_IDS.includes(id) || save.ownedCreatureIds.length > 0)
    return save;
  return {
    ...save,
    starterId: id,
    ownedCreatureIds: [id],
    activeCompanionId: id,
    onboardingCompleted: true,
  };
}

export function availableEncounters(save: GameSaveV1, landmark: LandmarkId) {
  const coordinate = ENCOUNTERS[landmark].coordinate;
  return Object.values(ENCOUNTERS).filter(
    (e) =>
      e.coordinate.latitude === coordinate.latitude &&
      (!e.id.startsWith("starter-") ||
        (coreComplete(save.completedEncounterIds) &&
          !save.ownedCreatureIds.includes(e.creatureId))),
  );
}

export function recordCapture(save: GameSaveV1, id: EncounterId): GameSaveV1 {
  const encounter = ENCOUNTERS[id];
  if (
    !encounter ||
    CREATURES[encounter.creatureId].role === "boss" ||
    save.completedEncounterIds.includes(id)
  )
    return save;
  if (id.startsWith("starter-") && !coreComplete(save.completedEncounterIds))
    return save;
  return {
    ...save,
    completedEncounterIds: [...save.completedEncounterIds, id],
    ownedCreatureIds: save.ownedCreatureIds.includes(encounter.creatureId)
      ? save.ownedCreatureIds
      : [...save.ownedCreatureIds, encounter.creatureId],
  };
}
