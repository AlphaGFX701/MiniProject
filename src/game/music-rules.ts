export type MusicKind = "map" | "wild" | "victory" | "trainer";

export function musicPolicy(kind: MusicKind) {
  return {
    loop: kind !== "victory",
    restart: kind === "victory",
  };
}

export function nextPlaybackGeneration(current: number) {
  return current + 1;
}

export function musicTargetVolume(options: {
  ducked: boolean;
  capture: boolean;
  victory: boolean;
}) {
  void options;
  return 0.58;
}
