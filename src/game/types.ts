export type Element = "fire" | "water" | "grass" | "ice" | "psychic" | "dark";

export type LocationMode = "gps" | "demo";

export type CreatureId =
  | "charmadillo"
  | "gulfin"
  | "cleaf"
  | "cindrill"
  | "finiette"
  | "larvea"
  | ExpandedCreatureId;
export type ExpandedCreatureId =
  | "friolera"
  | "draem"
  | "pouch"
  | "pluma"
  | "atrox"
  | "finsta"
  | "ivieron"
  | "jacana"
  | "sparchu";

export type LandmarkId = "faculty" | "building44" | "plaza";
export type EncounterId =
  | LandmarkId
  | "extra-faculty"
  | "extra-building44"
  | "extra-plaza"
  | "starter-fire"
  | "starter-water"
  | "starter-grass";

export type GameScreen =
  | "title"
  | "login"
  | "name"
  | "onboarding"
  | "map"
  | "battle"
  | "capture"
  | "collection"
  | "settings"
  | "complete"
  | "trainer";

export type Coordinate = {
  latitude: number;
  longitude: number;
};

export type CreatureBuff = {
  stat: "attack" | "hp";
  amount: number;
  label: string;
};

export type CreatureDefinition = {
  id: CreatureId;
  name: string;
  element: Element;
  role: "starter" | "wild" | "boss";
  description: string;
  buff: CreatureBuff;
};

export type EncounterDefinition = {
  id: EncounterId;
  name: string;
  shortName: string;
  coordinate: Coordinate;
  radiusMeters: number;
  creatureId: CreatureId;
};

export type GameSaveV1 = {
  schemaVersion: 1 | 2;
  starterId?: CreatureId;
  playerName?: string;
  facultyVictories?: LandmarkId[];
  ownedCreatureIds: CreatureId[];
  completedEncounterIds: EncounterId[];
  activeCompanionId: CreatureId;
  soundEnabled: boolean;
  musicEnabled: boolean;
  onboardingCompleted: boolean;
  mapHintSeen?: boolean;
  qteHintSeen?: boolean;
  facultyNoticeSeen?: boolean;
};

export type SaveSlots = [
  GameSaveV1 | null,
  GameSaveV1 | null,
  GameSaveV1 | null,
];

export type BattleState = {
  playerHp: number;
  enemyHp: number;
  energy: number;
  status: "active" | "won" | "lost";
};

export type CaptureState = {
  hitCount: number;
  throwCount: number;
  status: "ready" | "sealing" | "flying" | "missed" | "escaped" | "captured";
};
