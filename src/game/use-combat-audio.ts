import { useCallback, useEffect } from "react";
import { useAudioPlayer } from "expo-audio";
import { AppState } from "react-native";
import { gameAudio } from "./assets";
import type { Element } from "./types";

function setPlayerVolume(player: ReturnType<typeof useAudioPlayer>, volume: number) {
  try {
    player.volume = volume;
  } catch {
    // Fast Refresh can release Expo's native player before React finishes
    // cleaning up the previous hook instance.
  }
}

function pauseIfAvailable(player: ReturnType<typeof useAudioPlayer>) {
  try {
    player.pause();
  } catch {
    // The native shared object has already been released; it is already quiet.
  }
}

export function useCombatAudio(enabled: boolean) {
  const player = useAudioPlayer(null, { keepAudioSessionActive: true });
  useEffect(() => {
    // Keep effects below the music-safe peak; the Psychic source is no longer
    // allowed to jump to a harsher per-hit volume.
    setPlayerVolume(player, 0.65);
  }, [player]);
  useEffect(() => {
    if (!enabled) pauseIfAvailable(player);
  }, [enabled, player]);
  useEffect(() => {
    const sub = AppState.addEventListener("change", (s) => {
      if (s !== "active") pauseIfAvailable(player);
    });
    // useAudioPlayer owns and releases the native player. Calling pause from
    // this cleanup can race that release during Fast Refresh.
    return () => sub.remove();
  }, [player]);
  return useCallback(
    (element: Element, ultimate = false) => {
      if (!enabled) return;
      const source = ultimate
        ? {
            fire: gameAudio.fireBlast,
            water: gameAudio.hydroPump,
            grass: gameAudio.solarBeam,
            ice: require("../../assets/game/audio/blizzard.mp3"),
            psychic: require("../../assets/game/audio/psychic.mp3"),
            dark: require("../../assets/game/audio/crunch.mp3"),
          }[element]
        : {
            fire: gameAudio.ember,
            water: gameAudio.waterGun,
            grass: gameAudio.razorLeaf,
            ice: require("../../assets/game/audio/ice-beam.mp3"),
            psychic: require("../../assets/game/audio/confusion.mp3"),
            dark: require("../../assets/game/audio/bite.mp3"),
          }[element];
      try {
        // replace() stops the previous effect, so a separate pause is both
        // unnecessary and vulnerable to the released-player race.
        player.replace(source);
        player.play();
      } catch {
        // Ignore a tap delivered while this hook is being unmounted/refreshed.
      }
    },
    [enabled, player],
  );
}
