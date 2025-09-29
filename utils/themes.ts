// Modular Theme System - Pablo Style
// 60/30/10 rule: 60% base, 30% secondary, 10% accent
// Neo-brutalist color combos that always work

export interface Theme {
  name: string;
  vibe: string;
  base: string;      // 60% - backgrounds
  secondary: string; // 30% - cards/sections
  accent: string;    // 10% - CTAs/highlights
  text: string;      // Text color
  border: string;    // Border color
}

export const themes: Theme[] = [
  {
    name: "CREAM DREAM",
    vibe: "soft & warm",
    base: "#FAF9F6",      // cream
    secondary: "#FFE5B4",  // peach
    accent: "#FF69B4",     // hot pink
    text: "#0A0A0A",       // soft black
    border: "#0A0A0A",
  },
  {
    name: "MINT CONDITION",
    vibe: "fresh & clean",
    base: "#F0FFF0",       // honeydew
    secondary: "#98FB98",  // mint
    accent: "#00CED1",     // turquoise
    text: "#2F4F4F",       // dark slate
    border: "#2F4F4F",
  },
  {
    name: "BUTTER YELLOW",
    vibe: "sunny side up",
    base: "#FFFACD",       // lemon chiffon
    secondary: "#F9E79F",  // soft yellow
    accent: "#FF6347",     // tomato
    text: "#2C3E50",       // midnight
    border: "#2C3E50",
  },
  {
    name: "LAVENDER HAZE",
    vibe: "dreamy & soft",
    base: "#F8F4FF",       // ghost white
    secondary: "#DDA0DD",  // plum
    accent: "#FF1493",     // deep pink
    text: "#4B0082",       // indigo
    border: "#4B0082",
  },
  {
    name: "PEACH FUZZ",
    vibe: "warm & fuzzy",
    base: "#FFF5EE",       // seashell
    secondary: "#FFDAB9",  // peach puff
    accent: "#FF4500",     // orange red
    text: "#8B4513",       // saddle brown
    border: "#8B4513",
  },
  {
    name: "SKY HIGH",
    vibe: "cloud nine",
    base: "#F0F8FF",       // alice blue
    secondary: "#87CEEB",  // sky blue
    accent: "#FF69B4",     // hot pink
    text: "#191970",       // midnight blue
    border: "#191970",
  },
  {
    name: "SAGE ADVICE",
    vibe: "calm & wise",
    base: "#F5FFFA",       // mint cream
    secondary: "#BCE4D8",  // sage
    accent: "#FFB000",     // amber
    text: "#2F4F2F",       // dark green
    border: "#2F4F2F",
  },
  {
    name: "PINK LEMONADE",
    vibe: "sweet & tart",
    base: "#FFF0F5",       // lavender blush
    secondary: "#FFB6C1",  // light pink
    accent: "#FFD700",     // gold
    text: "#8B008B",       // dark magenta
    border: "#8B008B",
  },
];

// Get a random theme
export function getRandomTheme(): Theme {
  return themes[Math.floor(Math.random() * themes.length)];
}

// Rotate through themes
let currentThemeIndex = Math.floor(Math.random() * themes.length);
export function getNextTheme(): Theme {
  currentThemeIndex = (currentThemeIndex + 1) % themes.length;
  return themes[currentThemeIndex];
}

// Apply theme to document
export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.style.setProperty('--color-base', theme.base);
  root.style.setProperty('--color-secondary', theme.secondary);
  root.style.setProperty('--color-accent', theme.accent);
  root.style.setProperty('--color-text', theme.text);
  root.style.setProperty('--color-border', theme.border);

  // Store in localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('asciifier-theme', JSON.stringify(theme));
  }
}

// Load saved theme or random
export function loadTheme(): Theme {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('asciifier-theme');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fall through to random
      }
    }
  }
  return getRandomTheme();
}