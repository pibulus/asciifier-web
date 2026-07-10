// 🎨 Asciifier theme data (palette follows the 60/30/10 rule:
// 60% base, 30% secondary, 10% accent). The runtime theme engine lives in
// theme-system/mod.ts; this file only supplies the app's palettes.

export interface Theme {
  name: string;
  vibe: string;
  base: string; // 60% - main background
  secondary: string; // 30% - cards/sections
  accent: string; // 10% - CTAs/highlights
  text: string; // Primary text
  textSecondary?: string; // Secondary text (optional)
  border: string; // Border color
  shadow?: string; // Shadow color (optional)
  // CSS variable mappings
  cssVars?: Record<string, string>;
}

export interface ThemeSystemConfig {
  themes: Theme[];
  defaultTheme?: string;
  storageKey?: string;
  randomEnabled?: boolean;
  cssPrefix?: string;
}

export const asciifierThemes: Theme[] = [
  // Hot Pink Dream (pink text/borders on cream background)
  {
    name: "PINK_DREAM",
    vibe: "hot pink on cream",
    base: "#FFF9FC",
    secondary: "#FFD6E8",
    accent: "#FF1493",
    text: "#8B0A50",
    border: "#C71585",
  },
  // Turquoise Pop (cyan text/borders on white)
  {
    name: "TURQUOISE",
    vibe: "cyan pop",
    base: "#F8FFFF",
    secondary: "#B2EBF2",
    accent: "#00BCD4",
    text: "#006978",
    border: "#00838F",
  },
  // Coral Punch (orange text/borders on peach background)
  {
    name: "CORAL",
    vibe: "coral punch",
    base: "#FFF5F0",
    secondary: "#FFCCBC",
    accent: "#FF5722",
    text: "#BF360C",
    border: "#E64A19",
  },
  // Electric Purple (purple text/borders on lavender)
  {
    name: "PURPLE",
    vibe: "electric purple",
    base: "#FAF7FF",
    secondary: "#E1BEE7",
    accent: "#9C27B0",
    text: "#4A148C",
    border: "#6A1B9A",
  },
  // Ocean Blue (blue text/borders on sky background)
  {
    name: "OCEAN",
    vibe: "ocean blue",
    base: "#F5FCFF",
    secondary: "#BBDEFB",
    accent: "#2196F3",
    text: "#0D47A1",
    border: "#1565C0",
  },
  // Neon Mint (green text/borders on mint background)
  {
    name: "MINT",
    vibe: "neon mint",
    base: "#F5FFF9",
    secondary: "#C8E6C9",
    accent: "#4CAF50",
    text: "#1B5E20",
    border: "#2E7D32",
  },
  // Sunset Orange (orange text/borders on cream)
  {
    name: "SUNSET",
    vibe: "sunset orange",
    base: "#FFF8F5",
    secondary: "#FFCCBC",
    accent: "#FF6D00",
    text: "#BF360C",
    border: "#E64A19",
  },
  // Cyber Blue (indigo text/borders on light blue)
  {
    name: "CYBER",
    vibe: "cyber blue",
    base: "#F8FAFF",
    secondary: "#C5CAE9",
    accent: "#3F51B5",
    text: "#1A237E",
    border: "#283593",
  },
  // Magenta Burst (pink text/borders on blush)
  {
    name: "MAGENTA",
    vibe: "magenta burst",
    base: "#FFF9FA",
    secondary: "#F8BBD0",
    accent: "#E91E63",
    text: "#880E4F",
    border: "#AD1457",
  },
  // Teal Wave (teal text/borders on aqua)
  {
    name: "TEAL",
    vibe: "teal wave",
    base: "#F0FFFF",
    secondary: "#B2DFDB",
    accent: "#009688",
    text: "#004D40",
    border: "#00695C",
  },
  // Amber Glow (orange text/borders on cream)
  {
    name: "AMBER",
    vibe: "amber glow",
    base: "#FFF9F5",
    secondary: "#FFE0B2",
    accent: "#FF6F00",
    text: "#E65100",
    border: "#EF6C00",
  },
  // Risograph Pink+Yellow (pink text/borders on yellow)
  {
    name: "RISO",
    vibe: "risograph clash",
    base: "#FFFEF7",
    secondary: "#FFF59D",
    accent: "#FF1493",
    text: "#C2185B",
    border: "#D81B60",
  },
  // Lime Punch (green text/borders on light green)
  {
    name: "LIME",
    vibe: "lime punch",
    base: "#F9FFF5",
    secondary: "#DCEDC8",
    accent: "#8BC34A",
    text: "#33691E",
    border: "#558B2F",
  },
  // Cherry Red (red text/borders on blush)
  {
    name: "CHERRY",
    vibe: "cherry red",
    base: "#FFF5F7",
    secondary: "#FFCDD2",
    accent: "#F44336",
    text: "#B71C1C",
    border: "#C62828",
  },
  // TERMINAL (keep the dark terminal theme)
  {
    name: "TERMINAL",
    vibe: "hacker mode",
    base: "#1a1a1a",
    secondary: "#2a2a2a",
    accent: "#00ff41",
    text: "#00ff41",
    border: "#00ff41",
  },
];
