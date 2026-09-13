import { describe, expect, it } from "vitest";

import {
  musicPolicy,
  musicTargetVolume,
  nextPlaybackGeneration,
} from "./music-rules";

describe("music playback policy", () => {
  it("plays victory once while looping exploration and battle themes", () => {
    expect(musicPolicy("victory")).toMatchObject({ loop: false, restart: true });
    expect(musicPolicy("map").loop).toBe(true);
    expect(musicPolicy("wild").loop).toBe(true);
    expect(musicPolicy("trainer").loop).toBe(true);
  });
  it("invalidates a pending victory start when the screen changes", () => {
    expect(nextPlaybackGeneration(4)).toBe(5);
    expect(nextPlaybackGeneration(5)).toBe(6);
  });
  it("keeps music at one constant volume through effects and capture", () => {
    expect(
      musicTargetVolume({ ducked: false, capture: false, victory: false }),
    ).toBe(0.58);
    expect(
      musicTargetVolume({ ducked: true, capture: false, victory: false }),
    ).toBe(0.58);
    expect(
      musicTargetVolume({ ducked: false, capture: true, victory: false }),
    ).toBe(0.58);
    expect(
      musicTargetVolume({ ducked: false, capture: true, victory: true }),
    ).toBe(0.58);
  });
});
