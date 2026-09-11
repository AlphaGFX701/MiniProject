export const palette = {
  navy: "#10263E",
  navyLight: "#173B57",
  aqua: "#21B6A8",
  aquaDark: "#148C82",
  yellow: "#FFD166",
  cream: "#FFF7E6",
  white: "#FFFFFF",
  ink: "#17212B",
  muted: "#6B7C8F",
  line: "#D7E0E7",
  fire: "#F26444",
  water: "#3C8DFF",
  grass: "#59B96B",
  danger: "#DD405D",
  success: "#36A269",
  shadow: "rgba(16, 38, 62, 0.22)",
  scrim: "rgba(6, 20, 32, 0.66)",
} as const;

export const elementColors = {
  ice: "#74DBEB",
  psychic: "#DA83DD",
  dark: "#9482B9",
  fire: palette.fire,
  water: palette.water,
  grass: palette.grass,
} as const;

export const fonts = {
  pixel: "Pixel",
  pixelBold: "PixelBold",
  body: "PixelBody",
} as const;
