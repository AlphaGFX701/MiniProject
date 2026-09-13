import type { ImageSourcePropType } from "react-native";

import type { CreatureId, Element } from "./types";

type CreatureArt = {
  icon: ImageSourcePropType;
  idle: ImageSourcePropType[];
  attack: ImageSourcePropType[];
};

const sourceArt: Record<CreatureId, CreatureArt> = {
  friolera: {
    icon: require("../../assets/game/icons/Friolera.png"),
    idle: [
      require("../../assets/game/creatures/Friolera-idle-0.png"),
      require("../../assets/game/creatures/Friolera-idle-1.png"),
      require("../../assets/game/creatures/Friolera-idle-2.png"),
      require("../../assets/game/creatures/Friolera-idle-3.png"),
    ],
    attack: [
      require("../../assets/game/creatures/Friolera-attack-0.png"),
      require("../../assets/game/creatures/Friolera-attack-1.png"),
      require("../../assets/game/creatures/Friolera-attack-2.png"),
      require("../../assets/game/creatures/Friolera-attack-3.png"),
    ],
  },
  draem: {
    icon: require("../../assets/game/icons/Draem.png"),
    idle: [
      require("../../assets/game/creatures/Draem-idle-0.png"),
      require("../../assets/game/creatures/Draem-idle-1.png"),
      require("../../assets/game/creatures/Draem-idle-2.png"),
      require("../../assets/game/creatures/Draem-idle-3.png"),
    ],
    attack: [
      require("../../assets/game/creatures/Draem-attack-0.png"),
      require("../../assets/game/creatures/Draem-attack-1.png"),
      require("../../assets/game/creatures/Draem-attack-2.png"),
      require("../../assets/game/creatures/Draem-attack-3.png"),
    ],
  },
  pouch: {
    icon: require("../../assets/game/icons/Pouch.png"),
    idle: [
      require("../../assets/game/creatures/Pouch-idle-0.png"),
      require("../../assets/game/creatures/Pouch-idle-1.png"),
      require("../../assets/game/creatures/Pouch-idle-2.png"),
      require("../../assets/game/creatures/Pouch-idle-3.png"),
    ],
    attack: [
      require("../../assets/game/creatures/Pouch-attack-0.png"),
      require("../../assets/game/creatures/Pouch-attack-1.png"),
      require("../../assets/game/creatures/Pouch-attack-2.png"),
      require("../../assets/game/creatures/Pouch-attack-3.png"),
    ],
  },
  pluma: {
    icon: require("../../assets/game/icons/Pluma.png"),
    idle: [
      require("../../assets/game/creatures/Pluma-idle-0.png"),
      require("../../assets/game/creatures/Pluma-idle-1.png"),
      require("../../assets/game/creatures/Pluma-idle-2.png"),
      require("../../assets/game/creatures/Pluma-idle-3.png"),
    ],
    attack: [
      require("../../assets/game/creatures/Pluma-attack-0.png"),
      require("../../assets/game/creatures/Pluma-attack-1.png"),
      require("../../assets/game/creatures/Pluma-attack-2.png"),
      require("../../assets/game/creatures/Pluma-attack-3.png"),
    ],
  },
  atrox: {
    icon: require("../../assets/game/icons/Atrox.png"),
    idle: [
      require("../../assets/game/creatures/Atrox-idle-0.png"),
      require("../../assets/game/creatures/Atrox-idle-1.png"),
      require("../../assets/game/creatures/Atrox-idle-2.png"),
      require("../../assets/game/creatures/Atrox-idle-3.png"),
    ],
    attack: [
      require("../../assets/game/creatures/Atrox-attack-0.png"),
      require("../../assets/game/creatures/Atrox-attack-1.png"),
      require("../../assets/game/creatures/Atrox-attack-2.png"),
      require("../../assets/game/creatures/Atrox-attack-3.png"),
    ],
  },
  finsta: {
    icon: require("../../assets/game/icons/Finsta.png"),
    idle: [
      require("../../assets/game/creatures/Finsta-idle-0.png"),
      require("../../assets/game/creatures/Finsta-idle-1.png"),
      require("../../assets/game/creatures/Finsta-idle-2.png"),
      require("../../assets/game/creatures/Finsta-idle-3.png"),
    ],
    attack: [
      require("../../assets/game/creatures/Finsta-attack-0.png"),
      require("../../assets/game/creatures/Finsta-attack-1.png"),
      require("../../assets/game/creatures/Finsta-attack-2.png"),
      require("../../assets/game/creatures/Finsta-attack-3.png"),
    ],
  },
  ivieron: {
    icon: require("../../assets/game/icons/Ivieron.png"),
    idle: [
      require("../../assets/game/creatures/Ivieron-idle-0.png"),
      require("../../assets/game/creatures/Ivieron-idle-1.png"),
      require("../../assets/game/creatures/Ivieron-idle-2.png"),
      require("../../assets/game/creatures/Ivieron-idle-3.png"),
    ],
    attack: [
      require("../../assets/game/creatures/Ivieron-attack-0.png"),
      require("../../assets/game/creatures/Ivieron-attack-1.png"),
      require("../../assets/game/creatures/Ivieron-attack-2.png"),
      require("../../assets/game/creatures/Ivieron-attack-3.png"),
    ],
  },
  jacana: {
    icon: require("../../assets/game/icons/Jacana.png"),
    idle: [
      require("../../assets/game/creatures/Jacana-idle-0.png"),
      require("../../assets/game/creatures/Jacana-idle-1.png"),
      require("../../assets/game/creatures/Jacana-idle-2.png"),
      require("../../assets/game/creatures/Jacana-idle-3.png"),
    ],
    attack: [
      require("../../assets/game/creatures/Jacana-attack-0.png"),
      require("../../assets/game/creatures/Jacana-attack-1.png"),
      require("../../assets/game/creatures/Jacana-attack-2.png"),
      require("../../assets/game/creatures/Jacana-attack-3.png"),
    ],
  },
  sparchu: {
    icon: require("../../assets/game/icons/Sparchu.png"),
    idle: [
      require("../../assets/game/creatures/Sparchu-idle-0.png"),
      require("../../assets/game/creatures/Sparchu-idle-1.png"),
      require("../../assets/game/creatures/Sparchu-idle-2.png"),
      require("../../assets/game/creatures/Sparchu-idle-3.png"),
    ],
    attack: [
      require("../../assets/game/creatures/Sparchu-attack-0.png"),
      require("../../assets/game/creatures/Sparchu-attack-1.png"),
      require("../../assets/game/creatures/Sparchu-attack-2.png"),
      require("../../assets/game/creatures/Sparchu-attack-3.png"),
    ],
  },
  charmadillo: {
    icon: require("../../assets/game/icons/Charmadillo.png"),
    idle: [
      require("../../assets/game/creatures/Charmadillo-idle-0.png"),
      require("../../assets/game/creatures/Charmadillo-idle-1.png"),
      require("../../assets/game/creatures/Charmadillo-idle-2.png"),
      require("../../assets/game/creatures/Charmadillo-idle-3.png"),
    ],
    attack: [
      require("../../assets/game/creatures/Charmadillo-attack-0.png"),
      require("../../assets/game/creatures/Charmadillo-attack-1.png"),
      require("../../assets/game/creatures/Charmadillo-attack-2.png"),
      require("../../assets/game/creatures/Charmadillo-attack-3.png"),
    ],
  },
  gulfin: {
    icon: require("../../assets/game/icons/Gulfin.png"),
    idle: [
      require("../../assets/game/creatures/Gulfin-idle-0.png"),
      require("../../assets/game/creatures/Gulfin-idle-1.png"),
      require("../../assets/game/creatures/Gulfin-idle-2.png"),
      require("../../assets/game/creatures/Gulfin-idle-3.png"),
    ],
    attack: [
      require("../../assets/game/creatures/Gulfin-attack-0.png"),
      require("../../assets/game/creatures/Gulfin-attack-1.png"),
      require("../../assets/game/creatures/Gulfin-attack-2.png"),
      require("../../assets/game/creatures/Gulfin-attack-3.png"),
    ],
  },
  cleaf: {
    icon: require("../../assets/game/icons/Cleaf.png"),
    idle: [
      require("../../assets/game/creatures/Cleaf-idle-0.png"),
      require("../../assets/game/creatures/Cleaf-idle-1.png"),
      require("../../assets/game/creatures/Cleaf-idle-2.png"),
      require("../../assets/game/creatures/Cleaf-idle-3.png"),
    ],
    attack: [
      require("../../assets/game/creatures/Cleaf-attack-0.png"),
      require("../../assets/game/creatures/Cleaf-attack-1.png"),
      require("../../assets/game/creatures/Cleaf-attack-2.png"),
      require("../../assets/game/creatures/Cleaf-attack-3.png"),
    ],
  },
  cindrill: {
    icon: require("../../assets/game/icons/Cindrill.png"),
    idle: [
      require("../../assets/game/creatures/Cindrill-idle-0.png"),
      require("../../assets/game/creatures/Cindrill-idle-1.png"),
      require("../../assets/game/creatures/Cindrill-idle-2.png"),
      require("../../assets/game/creatures/Cindrill-idle-3.png"),
    ],
    attack: [
      require("../../assets/game/creatures/Cindrill-attack-0.png"),
      require("../../assets/game/creatures/Cindrill-attack-1.png"),
      require("../../assets/game/creatures/Cindrill-attack-2.png"),
      require("../../assets/game/creatures/Cindrill-attack-3.png"),
    ],
  },
  finiette: {
    icon: require("../../assets/game/icons/Finiette.png"),
    idle: [
      require("../../assets/game/creatures/Finiette-idle-0.png"),
      require("../../assets/game/creatures/Finiette-idle-1.png"),
      require("../../assets/game/creatures/Finiette-idle-2.png"),
      require("../../assets/game/creatures/Finiette-idle-3.png"),
    ],
    attack: [
      require("../../assets/game/creatures/Finiette-attack-0.png"),
      require("../../assets/game/creatures/Finiette-attack-1.png"),
      require("../../assets/game/creatures/Finiette-attack-2.png"),
      require("../../assets/game/creatures/Finiette-attack-3.png"),
    ],
  },
  larvea: {
    icon: require("../../assets/game/icons/Larvea.png"),
    idle: [
      require("../../assets/game/creatures/Larvea-idle-0.png"),
      require("../../assets/game/creatures/Larvea-idle-1.png"),
      require("../../assets/game/creatures/Larvea-idle-2.png"),
      require("../../assets/game/creatures/Larvea-idle-3.png"),
    ],
    attack: [
      require("../../assets/game/creatures/Larvea-attack-0.png"),
      require("../../assets/game/creatures/Larvea-attack-1.png"),
      require("../../assets/game/creatures/Larvea-attack-2.png"),
      require("../../assets/game/creatures/Larvea-attack-3.png"),
    ],
  },
};

export const playerFrames = {
  down: [
    require("../../assets/game/player/player-down-0.png"),
    require("../../assets/game/player/player-down-1.png"),
    require("../../assets/game/player/player-down-2.png"),
    require("../../assets/game/player/player-down-3.png"),
  ],
  left: [
    require("../../assets/game/player/player-left-0.png"),
    require("../../assets/game/player/player-left-1.png"),
    require("../../assets/game/player/player-left-2.png"),
    require("../../assets/game/player/player-left-3.png"),
  ],
  right: [
    require("../../assets/game/player/player-right-0.png"),
    require("../../assets/game/player/player-right-1.png"),
    require("../../assets/game/player/player-right-2.png"),
    require("../../assets/game/player/player-right-3.png"),
  ],
  up: [
    require("../../assets/game/player/player-up-0.png"),
    require("../../assets/game/player/player-up-1.png"),
    require("../../assets/game/player/player-up-2.png"),
    require("../../assets/game/player/player-up-3.png"),
  ],
};

// Adapt existing animation families: small companion forms face larger boss forms.
export const creatureArt: Record<CreatureId, CreatureArt> = {
  ...sourceArt,
  charmadillo: sourceArt.sparchu,
  cindrill: sourceArt.charmadillo,
  sparchu: sourceArt.cindrill,
  cleaf: sourceArt.larvea,
  larvea: sourceArt.cleaf,
  finiette: sourceArt.finsta,
  finsta: sourceArt.finiette,
  pluma: sourceArt.jacana,
  jacana: sourceArt.pluma,
};

export const battleBackgrounds: Record<Element, ImageSourcePropType> = {
  ice: require("../../assets/game/backgrounds/faculty-backs.png"),
  psychic: require("../../assets/game/backgrounds/faculty-backs.png"),
  dark: require("../../assets/game/backgrounds/faculty-backs.png"),
  fire: require("../../assets/game/backgrounds/faculty-backs.png"),
  water: require("../../assets/game/backgrounds/faculty-backs.png"),
  grass: require("../../assets/game/backgrounds/faculty-backs.png"),
};

export const titleBackground = require("../../assets/game/backgrounds/mountain-dusk.png");
export const echoOrb = require("../../assets/game/branding/echo-orb.png");
export const warpIcon = require("../../assets/game/icons/warp-crystal.png");
export const ultimateFrames = [
  require("../../assets/game/effects/ultimate/frame0000.png"),
  require("../../assets/game/effects/ultimate/frame0001.png"),
  require("../../assets/game/effects/ultimate/frame0002.png"),
  require("../../assets/game/effects/ultimate/frame0003.png"),
  require("../../assets/game/effects/ultimate/frame0004.png"),
  require("../../assets/game/effects/ultimate/frame0005.png"),
  require("../../assets/game/effects/ultimate/frame0006.png"),
  require("../../assets/game/effects/ultimate/frame0007.png"),
  require("../../assets/game/effects/ultimate/frame0008.png"),
];

export const gameAudio = {
  tackle: require("../../assets/game/audio/tackle.mp3"),
  ember: require("../../assets/game/audio/ember.mp3"),
  waterGun: require("../../assets/game/audio/water-gun.mp3"),
  razorLeaf: require("../../assets/game/audio/razor-leaf.mp3"),
  fireBlast: require("../../assets/game/audio/fire-blast.mp3"),
  hydroPump: require("../../assets/game/audio/hydro-pump.mp3"),
  solarBeam: require("../../assets/game/audio/solar-beam.mp3"),
  faint: require("../../assets/game/audio/faint.mp3"),
  throw: require("../../assets/game/audio/throw.wav"),
  bounce: require("../../assets/game/audio/bounce.wav"),
  capture: require("../../assets/game/audio/capture.wav"),
  soundCheck: require("../../assets/game/audio/sound-check.wav"),
};
