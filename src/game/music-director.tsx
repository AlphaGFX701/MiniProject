import { useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import {
  useAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
} from "expo-audio";
import { useGame } from "./game-context";
import {
  musicTargetVolume,
  musicPolicy,
  nextPlaybackGeneration,
  type MusicKind,
} from "./music-rules";

const tracks = [
  require("../../assets/game/audio/new-beginning.mp3"),
  require("../../assets/game/audio/battle-theme.mp3"),
  require("../../assets/game/audio/victory.mp3"),
  require("../../assets/game/audio/trainer-battle.mp3"),
];
function setLoop(player: AudioPlayer, loop: boolean) {
  player.loop = loop;
}
function setVolume(player: AudioPlayer, volume: number) {
  player.volume = volume;
}
function pauseIfAvailable(player: AudioPlayer) {
  try {
    player.pause();
  } catch {
    // Fast Refresh can release the native shared object before React runs the
    // previous effect cleanup. There is nothing left to pause in that case.
  }
}
export function MusicDirector() {
  const { screen, save, hydrated, victoryMusic } = useGame();
  const combat = screen === "battle" || screen === "capture";
  const kind: MusicKind = victoryMusic
    ? "victory"
    : screen === "trainer"
      ? "trainer"
      : combat
        ? "wild"
        : "map";
  const source = tracks[{ map: 0, wild: 1, victory: 2, trainer: 3 }[kind]];
  // Keep one native player alive for the whole app. Recreating the player on
  // every screen transition can leave Android's codec thread behind and may
  // make the replacement track silent on some devices.
  const player = useAudioPlayer(null, { keepAudioSessionActive: true });
  const playbackGeneration = useRef(0);
  const [active, setActive] = useState(AppState.currentState === "active");
  const [audioReady, setAudioReady] = useState(false);
  useEffect(() => {
    let mounted = true;
    void setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: "doNotMix",
    }).finally(() => {
      if (mounted) setAudioReady(true);
    });
    const subscription = AppState.addEventListener("change", (s) =>
      setActive(s === "active"),
    );
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);
  useEffect(() => {
    if (
      !audioReady ||
      !active ||
      !hydrated ||
      !save.musicEnabled
    ) {
      pauseIfAvailable(player);
      return;
    }
    const generation = nextPlaybackGeneration(playbackGeneration.current);
    playbackGeneration.current = generation;
    const policy = musicPolicy(kind);
    player.replace(source);
    setLoop(player, policy.loop);
    setVolume(player, musicTargetVolume({
      ducked: false,
      capture: screen === "capture",
      victory: victoryMusic,
    }));
    // A freshly replaced bundled source starts at zero. play() may be called
    // while Media3 is buffering; Expo queues playback until it is ready.
    if (playbackGeneration.current === generation) player.play();
    return () => {
      playbackGeneration.current = nextPlaybackGeneration(
        playbackGeneration.current,
      );
    };
  }, [
    active,
    audioReady,
    hydrated,
    kind,
    player,
    save.musicEnabled,
    screen,
    source,
    victoryMusic,
  ]);
  return null;
}
