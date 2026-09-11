import type {
  CreatureDefinition,
  CreatureId,
  EncounterDefinition,
  EncounterId,
} from "./types";

export const CAMPUS_CENTER = {
  latitude: 13.8201,
  longitude: 100.5153,
} as const;
export const DEMO_SPEED_METERS_PER_SECOND = 4;
export const WEAK_GPS_ACCURACY_METERS = 50;
export const STARTER_IDS: CreatureId[] = ["charmadillo", "gulfin", "cleaf"];

export const CREATURES: Record<CreatureId, CreatureDefinition> = {
  friolera: {
    id: "friolera",
    name: "Friolera",
    element: "ice",
    role: "wild",
    description: "A gentle frost scout with crystalline antlers.",
    buff: { stat: "hp", amount: 15, label: "Maximum HP +15" },
  },
  draem: {
    id: "draem",
    name: "Draem",
    element: "psychic",
    role: "wild",
    description: "A sleepy dream keeper with unexpected courage.",
    buff: { stat: "attack", amount: 0.12, label: "Attack +12%" },
  },
  pouch: {
    id: "pouch",
    name: "Pouch",
    element: "dark",
    role: "wild",
    description: "A tiny dusk explorer who hides in the shadows.",
    buff: { stat: "hp", amount: 20, label: "Maximum HP +20" },
  },
  pluma: {
    id: "pluma",
    name: "Pluma",
    element: "psychic",
    role: "wild",
    description: "A bright little companion with a fearless heart.",
    buff: { stat: "attack", amount: 0.15, label: "Attack +15%" },
  },
  atrox: {
    id: "atrox",
    name: "Atrox",
    element: "dark",
    role: "boss",
    description: "The shadow sentinel.",
    buff: { stat: "hp", amount: 20, label: "Maximum HP +20" },
  },
  finsta: {
    id: "finsta",
    name: "Finsta",
    element: "water",
    role: "boss",
    description: "A relentless tide guardian.",
    buff: { stat: "hp", amount: 15, label: "Maximum HP +15" },
  },
  ivieron: {
    id: "ivieron",
    name: "Ivieron",
    element: "ice",
    role: "boss",
    description: "The frostbound challenger.",
    buff: { stat: "hp", amount: 15, label: "Maximum HP +15" },
  },
  jacana: {
    id: "jacana",
    name: "Jacana",
    element: "grass",
    role: "boss",
    description: "An ancient grove guardian.",
    buff: { stat: "hp", amount: 15, label: "Maximum HP +15" },
  },
  sparchu: {
    id: "sparchu",
    name: "Sparchu",
    element: "psychic",
    role: "boss",
    description: "A brilliant arcane guardian.",
    buff: { stat: "hp", amount: 15, label: "Maximum HP +15" },
  },
  charmadillo: {
    id: "charmadillo",
    name: "Charmadillo",
    element: "fire",
    role: "starter",
    description: "A brave ember guardian with a volcanic shell.",
    buff: { stat: "attack", amount: 0.15, label: "Attack +15%" },
  },
  gulfin: {
    id: "gulfin",
    name: "Gulfin",
    element: "water",
    role: "starter",
    description: "A calm river spirit that endures every current.",
    buff: { stat: "hp", amount: 20, label: "Maximum HP +20" },
  },
  cleaf: {
    id: "cleaf",
    name: "Cleaf",
    element: "grass",
    role: "starter",
    description: "A bright forest scout guided by living leaves.",
    buff: { stat: "hp", amount: 15, label: "Maximum HP +15" },
  },
  cindrill: {
    id: "cindrill",
    name: "Cindrill",
    element: "fire",
    role: "boss",
    description: "A fiery campus legend with a fearless charge.",
    buff: { stat: "hp", amount: 25, label: "Maximum HP +25" },
  },
  finiette: {
    id: "finiette",
    name: "Finiette",
    element: "water",
    role: "wild",
    description: "A swift echo that glides through cool air.",
    buff: { stat: "attack", amount: 0.12, label: "Attack +12%" },
  },
  larvea: {
    id: "larvea",
    name: "Larvea",
    element: "grass",
    role: "wild",
    description: "A curious sprout creature hiding near the faculty.",
    buff: { stat: "attack", amount: 0.18, label: "Attack +18%" },
  },
};

const CORE_ENCOUNTERS: Record<
  import("./types").LandmarkId,
  EncounterDefinition
> = {
  faculty: {
    id: "faculty",
    name: "Faculty of Technical Education",
    shortName: "Technical Education",
    coordinate: { latitude: 13.8204051, longitude: 100.5154627 },
    radiusMeters: 40,
    creatureId: "friolera",
  },
  building44: {
    id: "building44",
    name: "Building 44",
    shortName: "Building 44",
    coordinate: { latitude: 13.819781, longitude: 100.5153855 },
    radiusMeters: 40,
    creatureId: "draem",
  },
  plaza: {
    id: "plaza",
    name: "Celebration Plaza",
    shortName: "Celebration Plaza",
    coordinate: { latitude: 13.8198524, longitude: 100.5149813 },
    radiusMeters: 40,
    creatureId: "pouch",
  },
};

export const ENCOUNTER_LIST = Object.values(CORE_ENCOUNTERS);
export const ENCOUNTERS: Record<EncounterId, EncounterDefinition> = {
  ...CORE_ENCOUNTERS,
  "extra-faculty": {
    ...CORE_ENCOUNTERS.faculty,
    id: "extra-faculty",
    creatureId: "larvea",
  },
  "extra-building44": {
    ...CORE_ENCOUNTERS.building44,
    id: "extra-building44",
    creatureId: "finiette",
  },
  "extra-plaza": {
    ...CORE_ENCOUNTERS.plaza,
    id: "extra-plaza",
    creatureId: "pluma",
  },
  "starter-fire": {
    ...CORE_ENCOUNTERS.faculty,
    id: "starter-fire",
    creatureId: "charmadillo",
  },
  "starter-water": {
    ...CORE_ENCOUNTERS.building44,
    id: "starter-water",
    creatureId: "gulfin",
  },
  "starter-grass": {
    ...CORE_ENCOUNTERS.plaza,
    id: "starter-grass",
    creatureId: "cleaf",
  },
};
export const PLAYER_IDS = Object.values(CREATURES)
  .filter((c) => c.role !== "boss")
  .map((c) => c.id);
export const BOSS_IDS = Object.values(CREATURES)
  .filter((c) => c.role === "boss")
  .map((c) => c.id);
export const coreComplete = (ids: EncounterId[]) =>
  ENCOUNTER_LIST.every((e) => ids.includes(e.id));
export const coreCount = (ids: EncounterId[]) =>
  ENCOUNTER_LIST.filter((e) => ids.includes(e.id)).length;

export const INITIAL_SAVE = (): import("./types").GameSaveV1 => ({
  schemaVersion: 2,
  ownedCreatureIds: [],
  facultyVictories: [],
  completedEncounterIds: [],
  activeCompanionId: "charmadillo",
  soundEnabled: true,
  musicEnabled: true,
  onboardingCompleted: false,
});
