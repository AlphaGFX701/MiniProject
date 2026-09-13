export const palette = {
  navy: "#10263E",
  navyLight: "#173B57",
  aqua: "#21B6A8",
  aquaDark: "#148C82",
  yellow: "#FFD166",
  yellowLight: "#FFE499",
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
  glowAqua: "rgba(33, 182, 168, 0.35)",
  glowYellow: "rgba(255, 209, 102, 0.40)",
  glowDanger: "rgba(221, 64, 93, 0.35)",
  glowSuccess: "rgba(54, 162, 105, 0.35)",
} as const;

export const elementColors = {
  ice: "#74DBEB",
  psychic: "#DA83DD",
  dark: "#9482B9",
  fire: palette.fire,
  water: palette.water,
  grass: palette.grass,
} as const;

export const elementGlows: Record<string, string> = {
  ice: "rgba(116, 219, 235, 0.40)",
  psychic: "rgba(218, 131, 221, 0.40)",
  dark: "rgba(148, 130, 185, 0.40)",
  fire: "rgba(242, 100, 68, 0.40)",
  water: "rgba(60, 141, 255, 0.40)",
  grass: "rgba(89, 185, 107, 0.40)",
};

export const shadows = {
  card: {
    shadowColor: "#10263E",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 8,
  },
  button: {
    shadowColor: "#10263E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 0,
    elevation: 5,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 14,
    elevation: 10,
  }),
} as const;

export const fonts = {
  pixel: "Pixel",
  pixelBold: "PixelBold",
  body: "PixelBody",
} as const;
