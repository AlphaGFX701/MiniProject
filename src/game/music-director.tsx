import { useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import {
  useAudioPlayer,
  useAudioPlayerStatus,
  setAudioModeAsync,
  type AudioPlayer,
} from "expo-audio";
import { onCombatSound } from "./audio-events";
import { useGame } from "./game-context";

const tracks = [
  require("../../assets/game/audio/new-beginning.mp3"),
  require("../../assets/game/audio/battle-theme.mp3"),
  require("../../assets/game/audio/victory.mp3"),
  require("../../assets/game/audio/trainer-battle.mp3"),
];
function fade(player: AudioPlayer, volume: number) {
  player.loop = true;
  const start = player.volume;
  let step = 0;
  const timer = setInterval(() => {
    step += 1;
    player.volume = start + (volume - start) * Math.min(1, step / 8);
    if (step >= 8) clearInterval(timer);
  }, 40);
  return () => clearInterval(timer);
}
export function MusicDirector() {
  const { screen, save, hydrated, victoryMusic } = useGame();
  const combat = screen === "battle" || screen === "capture";
  const source =
    tracks[victoryMusic ? 2 : screen === "trainer" ? 3 : combat ? 1 : 0];
  const [ducked, setDucked] = useState(false);
  const duckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const unsubscribe = onCombatSound(() => {
      setDucked(true);
      if (duckTimer.current) clearTimeout(duckTimer.current);
      duckTimer.current = setTimeout(() => setDucked(false), 600);
    });
    return () => {
      unsubscribe();
      if (duckTimer.current) clearTimeout(duckTimer.current);
    };
  }, []);
  const player = useAudioPlayer(source, { downloadFirst: true });
  const status = useAudioPlayerStatus(player);
  const [active, setActive] = useState(AppState.currentState === "active");
  useEffect(() => {
    void setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: "mixWithOthers",
    });
    const subscription = AppState.addEventListener("change", (s) =>
      setActive(s === "active"),
    );
    return () => subscription.remove();
  }, []);
  useEffect(() => {
    if (!status.isLoaded) return;
    if (active && hydrated && save.musicEnabled) {
      player.play();
      return fade(
        player,
        ducked ? 0.08 : screen === "capture" && !victoryMusic ? 0.12 : 0.32,
      );
    }
    player.pause();
  }, [
    active,
    hydrated,
    player,
    save.musicEnabled,
    screen,
    status.isLoaded,
    ducked,
    victoryMusic,
  ]);
  return null;
}
