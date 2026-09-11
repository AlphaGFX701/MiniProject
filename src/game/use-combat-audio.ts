import { useCallback, useEffect, useRef } from "react";
import { useAudioPlayer, type AudioPlayer } from "expo-audio";
import { AppState } from "react-native";
import { announceCombatSound } from "./audio-events";
import { gameAudio } from "./assets";
import type { Element } from "./types";

export function useCombatAudio(enabled: boolean) {
  const fire = useAudioPlayer(gameAudio.ember),
    water = useAudioPlayer(gameAudio.waterGun),
    grass = useAudioPlayer(gameAudio.razorLeaf);
  const ice = useAudioPlayer(require("../../assets/game/audio/ice-beam.mp3")),
    psychic = useAudioPlayer(require("../../assets/game/audio/confusion.mp3")),
    dark = useAudioPlayer(require("../../assets/game/audio/bite.mp3"));
  const fireU = useAudioPlayer(gameAudio.fireBlast),
    waterU = useAudioPlayer(gameAudio.hydroPump),
    grassU = useAudioPlayer(gameAudio.solarBeam);
  const iceU = useAudioPlayer(require("../../assets/game/audio/blizzard.mp3")),
    psychicU = useAudioPlayer(require("../../assets/game/audio/psychic.mp3")),
    darkU = useAudioPlayer(require("../../assets/game/audio/crunch.mp3"));
  const current = useRef<AudioPlayer | null>(null),
    generation = useRef(0);
  useEffect(() => {
    if (!enabled) {
      generation.current++;
      current.current?.pause();
    }
  }, [enabled]);
  useEffect(() => {
    const invalidate = () => {
      generation.current++;
    };
    const sub = AppState.addEventListener("change", (s) => {
      if (s !== "active") {
        generation.current++;
        current.current?.pause();
      }
    });
    return () => {
      invalidate();
      sub.remove();
    };
  }, []);
  return useCallback(
    (element: Element, ultimate = false) => {
      if (!enabled) return;
      const player = ultimate
        ? {
            fire: fireU,
            water: waterU,
            grass: grassU,
            ice: iceU,
            psychic: psychicU,
            dark: darkU,
          }[element]
        : { fire, water, grass, ice, psychic, dark }[element];
      const token = ++generation.current;
      current.current?.pause();
      current.current = player;
      void player
        .seekTo(0)
        .then(() => {
          if (token === generation.current) {
            announceCombatSound();
            player.volume = 0.8;
            player.play();
          }
        })
        .catch(() => undefined);
    },
    [
      enabled,
      fire,
      water,
      grass,
      ice,
      psychic,
      dark,
      fireU,
      waterU,
      grassU,
      iceU,
      psychicU,
      darkU,
    ],
  );
}
