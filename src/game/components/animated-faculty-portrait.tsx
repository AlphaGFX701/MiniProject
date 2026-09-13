import { useEffect, useState } from "react";
import type { ImageSourcePropType, ImageStyle, StyleProp } from "react-native";
import { Image } from "expo-image";

import type { LandmarkId } from "../types";

const portraits: Record<LandmarkId, ImageSourcePropType[]> = {
  faculty: [require("../../../assets/game/faculty/trainer-0.png")],
  // Keep Veetina consistent with the short-haired trainer shown by her map
  // marker instead of swapping to a different portrait during dialogue.
  building44: [require("../../../assets/game/faculty/trainer-1.png")],
  plaza: [require("../../../assets/game/faculty/trainer-2.png")],
};

const veetinaEasterEggFrames: ImageSourcePropType[] = [
  require("../../../assets/game/faculty/vatinee-idle-0.png"),
  require("../../../assets/game/faculty/vatinee-idle-1.png"),
  require("../../../assets/game/faculty/vatinee-idle-2.png"),
  require("../../../assets/game/faculty/vatinee-idle-3.png"),
];

export function AnimatedFacultyPortrait({
  trainerId,
  easterEgg = false,
  style,
}: {
  trainerId: LandmarkId;
  easterEgg?: boolean;
  style?: StyleProp<ImageStyle>;
}) {
  const frames =
    trainerId === "building44" && easterEgg
      ? veetinaEasterEggFrames
      : portraits[trainerId];
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (frames.length === 1) return;
    const timer = setInterval(
      () => setFrame((current) => (current + 1) % frames.length),
      260,
    );
    return () => clearInterval(timer);
  }, [frames]);

  return (
    <Image
      source={frames[frame % frames.length]}
      contentFit="contain"
      cachePolicy="memory-disk"
      transition={0}
      style={style}
    />
  );
}
