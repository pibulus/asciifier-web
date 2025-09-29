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
    name: "WARM",
    vibe: "sunset vibes",
    base: "linear-gradient(135deg, #FAF9F6 0%, #FFF8F3 100%)",      // cream with subtle warmth
    secondary: "#FFE5B4",  // peach
    accent: "#FF69B4",     // hot pink
    text: "#0A0A0A",       // soft black
    border: "#0A0A0A",
  },
  {
    name: "COOL",
    vibe: "ocean breeze",
    base: "linear-gradient(135deg, #F0F8FF 0%, #E6F7FF 100%)",     // alice blue with subtle gradient
    secondary: "#87CEEB",  // sky blue
    accent: "#00CED1",     // turquoise
    text: "#191970",       // midnight blue
    border: "#191970",
  },
  {
    name: "EARTH",
    vibe: "forest floor",
    base: "linear-gradient(135deg, #F5FFFA 0%, #F0FFF4 100%)",     // mint cream with subtle sage
    secondary: "#BCE4D8",  // sage
    accent: "#FFB000",     // amber
    text: "#2F4F2F",       // dark green
    border: "#2F4F2F",
  },
  {
    name: "DREAM",
    vibe: "cotton candy",
    base: "linear-gradient(135deg, #F8F4FF 0%, #FFF0F5 100%)",     // ghost white to lavender blush
    secondary: "#DDA0DD",  // plum
    accent: "#FF1493",     // deep pink
    text: "#4B0082",       // indigo
    border: "#4B0082",
  },
  {
    name: "TERMINAL",
    vibe: "hacker mode",
    base: "#1a1a1a",       // off-black terminal background
    secondary: "#2a2a2a",  // slightly lighter for cards
    accent: "#00ff41",     // classic terminal green
    text: "#00ff41",       // terminal green text
    border: "#00ff41",     // green borders for full terminal aesthetic
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
  // Handle gradients for base - check if it's a gradient
  if (theme.base.includes('gradient')) {
    root.style.setProperty('--color-base-gradient', theme.base);
    root.style.setProperty('--color-base', '#FAF9F6'); // fallback solid color
  } else {
    root.style.setProperty('--color-base', theme.base);
    root.style.setProperty('--color-base-gradient', theme.base);
  }
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