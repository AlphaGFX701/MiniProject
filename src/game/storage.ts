import AsyncStorage from "@react-native-async-storage/async-storage";

import { INITIAL_SAVE } from "./data";
import { sanitizeSave } from "./logic";
import type { GameSaveV1 } from "./types";

const SAVE_KEY = "echo-hunt.save.v1";

export async function loadGame(): Promise<GameSaveV1> {
  try {
    const raw = await AsyncStorage.getItem(SAVE_KEY);
    if (!raw) return INITIAL_SAVE();
    return sanitizeSave(JSON.parse(raw)) ?? INITIAL_SAVE();
  } catch {
    return INITIAL_SAVE();
  }
}

export async function persistGame(save: GameSaveV1): Promise<void> {
  const payload = JSON.stringify(save);
  writes = writes
    .catch(() => undefined)
    .then(() => AsyncStorage.setItem(SAVE_KEY, payload));
  await writes;
}
let writes: Promise<void> = Promise.resolve();
