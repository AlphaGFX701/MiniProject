import AsyncStorage from "@react-native-async-storage/async-storage";

import { INITIAL_SAVE } from "./data";
import { sanitizeSave } from "./logic";
import type { GameSaveV1, SaveSlots } from "./types";

const LEGACY_SAVE_KEY = "echo-hunt.save.v1";
const SAVE_SLOTS_KEY = "echo-hunt.save-slots.v1";
const EMPTY_SLOTS = (): SaveSlots => [null, null, null];

function sanitizeSlots(value: unknown): SaveSlots | null {
  if (!Array.isArray(value)) return null;
  return [0, 1, 2].map((index) => {
    const slot = value[index];
    return slot ? sanitizeSave(slot) : null;
  }) as SaveSlots;
}

export async function loadSaveSlots(): Promise<SaveSlots> {
  try {
    const raw = await AsyncStorage.getItem(SAVE_SLOTS_KEY);
    if (raw) return sanitizeSlots(JSON.parse(raw)) ?? EMPTY_SLOTS();

    const legacy = await AsyncStorage.getItem(LEGACY_SAVE_KEY);
    const migrated = legacy ? sanitizeSave(JSON.parse(legacy)) : null;
    return [migrated, null, null];
  } catch {
    return EMPTY_SLOTS();
  }
}

export async function persistSaveSlots(slots: SaveSlots): Promise<void> {
  const payload = JSON.stringify(slots);
  writes = writes
    .catch(() => undefined)
    .then(() => AsyncStorage.setItem(SAVE_SLOTS_KEY, payload));
  await writes;
}

export async function loadGame(): Promise<GameSaveV1> {
  return (await loadSaveSlots())[0] ?? INITIAL_SAVE();
}

export async function persistGame(save: GameSaveV1): Promise<void> {
  writes = writes
    .catch(() => undefined)
    .then(async () => {
      const raw = await AsyncStorage.getItem(SAVE_SLOTS_KEY);
      const slots = raw
        ? sanitizeSlots(JSON.parse(raw)) ?? EMPTY_SLOTS()
        : EMPTY_SLOTS();
      slots[0] = save;
      await AsyncStorage.setItem(SAVE_SLOTS_KEY, JSON.stringify(slots));
    });
  await writes;
}
let writes: Promise<void> = Promise.resolve();
