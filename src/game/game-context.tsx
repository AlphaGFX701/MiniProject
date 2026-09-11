import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  CAMPUS_CENTER,
  CREATURES,
  INITIAL_SAVE,
  STARTER_IDS,
  coreComplete,
} from "./data";
import { loadGame, persistGame } from "./storage";
import { chooseStarter, recordCapture } from "./save-rules";
import type {
  Coordinate,
  CreatureId,
  EncounterId,
  GameSaveV1,
  GameScreen,
  LocationMode,
} from "./types";

type GameContextValue = {
  victoryMusic: boolean;
  setVictoryMusic: (value: boolean) => void;
  markHint: (key: "mapHintSeen" | "qteHintSeen" | "facultyNoticeSeen") => void;
  awardCapture: () => void;
  save: GameSaveV1;
  hydrated: boolean;
  screen: GameScreen;
  activeEncounterId: EncounterId | null;
  selectedCompanionId: CreatureId;
  locationMode: LocationMode;
  demoCoordinate: Coordinate;
  beginExpedition: (starter: CreatureId) => void;
  trainerId: import("./types").LandmarkId | null;
  openTrainer: (id: import("./types").LandmarkId) => void;
  winTrainer: (id: import("./types").LandmarkId) => void;
  openCollection: () => void;
  openSettings: () => void;
  returnToMap: () => void;
  startBattle: (encounterId: EncounterId, companionId: CreatureId) => void;
  completeBattle: () => void;
  completeCapture: () => void;
  setActiveCompanion: (id: CreatureId) => void;
  setLocationMode: (mode: LocationMode, coordinate?: Coordinate) => void;
  setDemoCoordinate: (coordinate: Coordinate) => void;
  toggleSound: () => void;
  toggleMusic: () => void;
  battleNumber: number;
  resetProgress: () => void;
};

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [victoryMusic, setVictoryMusic] = useState(false);
  const [save, setSave] = useState<GameSaveV1>(INITIAL_SAVE);
  const [hydrated, setHydrated] = useState(false);
  const [battleNumber, setBattleNumber] = useState(0);
  const [screen, setScreen] = useState<GameScreen>("onboarding");
  const [trainerId, setTrainerId] = useState<
    import("./types").LandmarkId | null
  >(null);
  const [activeEncounterId, setActiveEncounterId] =
    useState<EncounterId | null>(null);
  const [selectedCompanionId, setSelectedCompanionId] =
    useState<CreatureId>("charmadillo");
  const [locationMode, setLocationModeState] = useState<LocationMode>("gps");
  const [demoCoordinate, setDemoCoordinate] =
    useState<Coordinate>(CAMPUS_CENTER);

  useEffect(() => {
    let mounted = true;
    loadGame().then((loaded) => {
      if (!mounted) return;
      setSave(loaded);
      setSelectedCompanionId(loaded.activeCompanionId);
      setScreen(
        loaded.onboardingCompleted
          ? coreComplete(loaded.completedEncounterIds) &&
            !loaded.facultyNoticeSeen
            ? "complete"
            : "map"
          : "onboarding",
      );
      setHydrated(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const commitSave = useCallback(
    (update: (current: GameSaveV1) => GameSaveV1) => {
      setSave((current) => {
        const next = update(current);
        return next;
      });
    },
    [],
  );

  useEffect(() => {
    if (hydrated)
      void persistGame(save).catch(() =>
        console.warn("Unable to save expedition progress."),
      );
  }, [save, hydrated]);

  const beginExpedition = useCallback(
    (starter: CreatureId) => {
      if (!STARTER_IDS.includes(starter) || save.ownedCreatureIds.length > 0)
        return;
      commitSave((current) => chooseStarter(current, starter));
      setSelectedCompanionId(starter);
      setScreen("map");
    },
    [commitSave, save.ownedCreatureIds.length],
  );

  const markHint = useCallback(
    (key: "mapHintSeen" | "qteHintSeen" | "facultyNoticeSeen") => {
      commitSave((current) =>
        current[key] ? current : { ...current, [key]: true },
      );
    },
    [commitSave],
  );
  const awardCapture = useCallback(() => {
    if (activeEncounterId)
      commitSave((current) => recordCapture(current, activeEncounterId));
  }, [activeEncounterId, commitSave]);

  const returnToMap = useCallback(() => {
    setVictoryMusic(false);
    setTrainerId(null);
    setActiveEncounterId(null);
    setScreen("map");
  }, []);

  const startBattle = useCallback(
    (encounterId: EncounterId, companionId: CreatureId) => {
      setBattleNumber((n) => n + 1);
      setActiveEncounterId(encounterId);
      setSelectedCompanionId(companionId);
      setScreen("battle");
    },
    [],
  );

  const completeBattle = useCallback(() => setScreen("capture"), []);

  const completeCapture = useCallback(() => {
    if (!activeEncounterId) {
      setScreen("map");
      return;
    }
    commitSave((current) => recordCapture(current, activeEncounterId));
    setVictoryMusic(false);
    setScreen(
      !save.facultyNoticeSeen &&
        coreComplete([...save.completedEncounterIds, activeEncounterId])
        ? "complete"
        : "map",
    );
    setActiveEncounterId(null);
  }, [
    activeEncounterId,
    commitSave,
    save.completedEncounterIds,
    save.facultyNoticeSeen,
  ]);

  const setActiveCompanion = useCallback(
    (id: CreatureId) => {
      if (
        !CREATURES[id] ||
        !save.ownedCreatureIds.includes(id) ||
        CREATURES[id].role === "boss"
      )
        return;
      setSelectedCompanionId(id);
      commitSave((current) => ({ ...current, activeCompanionId: id }));
    },
    [commitSave, save.ownedCreatureIds],
  );

  const setLocationMode = useCallback(
    (mode: LocationMode, coordinate?: Coordinate) => {
      if (mode === "demo" && coordinate) setDemoCoordinate(coordinate);
      setLocationModeState(mode);
    },
    [],
  );

  const toggleSound = useCallback(() => {
    commitSave((current) => ({
      ...current,
      soundEnabled: !current.soundEnabled,
    }));
  }, [commitSave]);

  const toggleMusic = useCallback(() => {
    commitSave((current) => ({
      ...current,
      musicEnabled: !current.musicEnabled,
    }));
  }, [commitSave]);

  const resetProgress = useCallback(() => {
    setVictoryMusic(false);
    const fresh = {
      ...INITIAL_SAVE(),
      soundEnabled: save.soundEnabled,
      musicEnabled: save.musicEnabled,
    };
    setSelectedCompanionId(fresh.activeCompanionId);
    setActiveEncounterId(null);
    setDemoCoordinate(CAMPUS_CENTER);
    setLocationModeState("gps");
    setSave(fresh);
    setScreen("onboarding");
  }, [save.soundEnabled, save.musicEnabled]);

  const openTrainer = useCallback(
    (id: import("./types").LandmarkId) => {
      if (!coreComplete(save.completedEncounterIds)) return;
      setTrainerId(id);
      setScreen("trainer");
    },
    [save.completedEncounterIds],
  );
  const winTrainer = useCallback(
    (id: import("./types").LandmarkId) => {
      commitSave((current) => ({
        ...current,
        facultyVictories: [
          ...new Set([...(current.facultyVictories ?? []), id]),
        ],
      }));
    },
    [commitSave],
  );

  const value = useMemo<GameContextValue>(
    () => ({
      victoryMusic,
      setVictoryMusic,
      markHint,
      awardCapture,
      save,
      hydrated,
      trainerId,
      openTrainer,
      winTrainer,
      screen,
      activeEncounterId,
      selectedCompanionId,
      locationMode,
      demoCoordinate,
      beginExpedition,
      openCollection: () => setScreen("collection"),
      openSettings: () => setScreen("settings"),
      returnToMap,
      startBattle,
      completeBattle,
      completeCapture,
      setActiveCompanion,
      setLocationMode,
      setDemoCoordinate,
      toggleSound,
      toggleMusic,
      battleNumber,
      resetProgress,
    }),
    [
      victoryMusic,
      markHint,
      awardCapture,
      activeEncounterId,
      trainerId,
      openTrainer,
      winTrainer,
      beginExpedition,
      completeBattle,
      completeCapture,
      demoCoordinate,
      hydrated,
      locationMode,
      resetProgress,
      returnToMap,
      save,
      screen,
      selectedCompanionId,
      setActiveCompanion,
      setLocationMode,
      startBattle,
      toggleSound,
      toggleMusic,
      battleNumber,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const value = useContext(GameContext);
  if (!value) throw new Error("useGame must be used inside GameProvider");
  return value;
}
