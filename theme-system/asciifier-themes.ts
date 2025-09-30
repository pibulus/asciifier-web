// 🎨 Asciifier-specific theme configuration
// Two carefully tuned themes: Vintage Cream & Terminal Dusk

import type { Theme, ThemeSystemConfig } from "./mod.ts";
import { RandomThemeGenerator } from "./mod.ts";

// Refined themes for Asciifier
export const vintageCream: Theme = {
  name: "VINTAGE CREAM",
  vibe: "warm nostalgia",
  base: "linear-gradient(135deg, #FBF8F3 0%, #FFF9F4 100%)", // Warmer, creamier base
  secondary: "#FFE8CC", // Softer peach, more vintage
  accent: "#FF6B9D", // Slightly softer hot pink
  text: "#1A1818", // Warmer black with brown undertones
  textSecondary: "#6B5D54", // Warm gray-brown for secondary text
  border: "#1A1818",
  cssVars: {
    "--color-base-solid": "#FBF8F3", // Solid fallback for gradient
    "--shadow-soft": "rgba(139, 90, 43, 0.1)", // Warm shadow
    "--highlight": "#FFD3B6", // Peachy highlight
  },
};

export const terminalDusk: Theme = {
  name: "TERMINAL DUSK",
  vibe: "midnight hacker",
  base: "#0D0E14", // Deep blue-black, like a CRT at night
  secondary: "#1A1D29", // Slightly lighter with blue tint
  accent: "#00FF88", // Classic terminal green with cyan twist
  text: "#00FF88", // Terminal green text
  textSecondary: "#00CC6A", // Darker green for secondary
  border: "#00FF88",
  cssVars: {
    "--color-base-solid": "#0D0E14",
    "--shadow-glow": "0 0 20px rgba(0, 255, 136, 0.3)", // Terminal glow effect
    "--terminal-amber": "#FFB000", // Alternative terminal color
    "--terminal-blue": "#00B4D8", // Cyan-blue for links
  },
};

// Random theme generator with app-specific constraints
export function generateAsciifierRandomTheme(): Theme {
  // Determine if we should generate light or dark
  const isLight = Math.random() > 0.5;

  // Use the base themes as reference for constraints
  const baseTheme = isLight ? vintageCream : terminalDusk;

  // Generate a harmonically balanced random theme
  const randomTheme = RandomThemeGenerator.generateHarmonicTheme(isLight ? "light" : "dark");

  // Override name and vibe with fun ASCII-themed names
  const asciiVibes = [
    "glitch paradise", "pixel dreams", "retro terminal", "matrix flow",
    "cyber sunset", "neon nights", "digital dawn", "ascii jazz",
    "terminal poetry", "code carnival", "binary ballet", "hex harmony"
  ];

  randomTheme.name = "RANDOM";
  randomTheme.vibe = asciiVibes[Math.floor(Math.random() * asciiVibes.length)];

  // Add some ASCII-specific CSS variables
  randomTheme.cssVars = {
    "--color-base-solid": randomTheme.base.includes("gradient")
      ? randomTheme.base.match(/#[0-9A-Fa-f]{6}/)?.[0] || randomTheme.base
      : randomTheme.base,
    "--shadow-brutal": `4px 4px 0 ${randomTheme.border}`,
  };

  return randomTheme;
}

// Configuration for asciifier-web
export const asciifierThemeConfig: ThemeSystemConfig = {
  themes: [vintageCream, terminalDusk],
  defaultTheme: "VINTAGE CREAM",
  storageKey: "asciifier-theme",
  randomEnabled: true,
  cssPrefix: "--color",
};

// Export individual themes for direct access
export const themes = [vintageCream, terminalDusk];