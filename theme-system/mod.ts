// 🎨 Pablo's Universal Theme System
// Modular, reusable theme engine for any Deno/Fresh app
// 60/30/10 rule: 60% base, 30% secondary, 10% accent

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

export class ThemeSystem {
  private config: ThemeSystemConfig;
  private currentTheme: Theme;
  private listeners: Array<(theme: Theme) => void> = [];

  constructor(config: ThemeSystemConfig) {
    this.config = {
      storageKey: "app-theme",
      cssPrefix: "--color",
      randomEnabled: true,
      ...config,
    };

    // Initialize with default or first theme
    const defaultTheme = config.defaultTheme
      ? config.themes.find((t) => t.name === config.defaultTheme)
      : config.themes[0];

    this.currentTheme = defaultTheme || config.themes[0];
  }

  // Get all available themes
  getThemes(): Theme[] {
    return this.config.themes;
  }

  // Get current active theme
  getCurrentTheme(): Theme {
    return this.currentTheme;
  }

  // Set a specific theme
  setTheme(themeName: string): Theme {
    const theme = this.config.themes.find((t) => t.name === themeName);
    if (!theme) {
      throw new Error(`Theme '${themeName}' not found`);
    }

    this.currentTheme = theme;
    this.applyTheme(theme);
    this.notifyListeners(theme);
    return theme;
  }

  // Apply theme to document
  applyTheme(theme: Theme): void {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    const prefix = this.config.cssPrefix;

    // Apply base theme colors
    this.setCSSVar(root, `${prefix}-base`, theme.base);
    this.setCSSVar(root, `${prefix}-secondary`, theme.secondary);
    this.setCSSVar(root, `${prefix}-accent`, theme.accent);
    this.setCSSVar(root, `${prefix}-text`, theme.text);
    this.setCSSVar(root, `${prefix}-border`, theme.border);

    // Apply optional properties
    if (theme.textSecondary) {
      this.setCSSVar(root, `${prefix}-text-secondary`, theme.textSecondary);
    }
    if (theme.shadow) {
      this.setCSSVar(root, `${prefix}-shadow`, theme.shadow);
    }

    // Apply any custom CSS variables
    if (theme.cssVars) {
      Object.entries(theme.cssVars).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    }

    // Handle gradients and always set both solid and gradient versions
    if (theme.base.includes("gradient")) {
      this.setCSSVar(root, `${prefix}-base-gradient`, theme.base);
      // Extract a solid fallback color from gradient if possible
      const fallback = this.extractColorFromGradient(theme.base) || "#FAF9F6";
      this.setCSSVar(root, `${prefix}-base`, fallback);
      this.setCSSVar(root, `${prefix}-base-solid`, fallback);
    } else {
      this.setCSSVar(root, `${prefix}-base`, theme.base);
      this.setCSSVar(root, `${prefix}-base-gradient`, theme.base);
      this.setCSSVar(root, `${prefix}-base-solid`, theme.base);
    }

    // Save to storage
    this.saveTheme(theme);
  }

  // Helper to set CSS variable
  private setCSSVar(root: HTMLElement, property: string, value: string): void {
    root.style.setProperty(property, value);
  }

  // Extract solid color from gradient string
  private extractColorFromGradient(gradient: string): string | null {
    const match = gradient.match(/#[0-9A-Fa-f]{6}/);
    return match ? match[0] : null;
  }

  // Load saved theme
  loadTheme(): Theme {
    if (typeof window === "undefined") return this.currentTheme;

    const storageKey = this.config.storageKey || "app-theme";
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const savedTheme = JSON.parse(saved);
        // Find matching theme by name
        const theme = this.config.themes.find((t) =>
          t.name === savedTheme.name
        );
        if (theme) {
          this.currentTheme = theme;
          return theme;
        }
      } catch {
        // Fall through to default
      }
    }

    return this.currentTheme;
  }

  // Save theme preference
  private saveTheme(theme: Theme): void {
    if (typeof window !== "undefined") {
      const storageKey = this.config.storageKey || "app-theme";
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          name: theme.name,
          timestamp: Date.now(),
        }),
      );
    }
  }

  // Get random theme
  getRandomTheme(): Theme {
    const randomIndex = Math.floor(Math.random() * this.config.themes.length);
    return this.config.themes[randomIndex];
  }

  // Cycle to next theme
  cycleTheme(): Theme {
    const currentIndex = this.config.themes.findIndex((t) =>
      t.name === this.currentTheme.name
    );
    const nextIndex = (currentIndex + 1) % this.config.themes.length;
    const nextTheme = this.config.themes[nextIndex];

    this.currentTheme = nextTheme;
    this.applyTheme(nextTheme);
    this.notifyListeners(nextTheme);
    return nextTheme;
  }

  // Subscribe to theme changes
  subscribe(listener: (theme: Theme) => void): () => void {
    this.listeners.push(listener);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  // Notify all listeners
  private notifyListeners(theme: Theme): void {
    this.listeners.forEach((listener) => listener(theme));
  }

  // Initialize on mount (for client-side)
  init(): Theme {
    const theme = this.loadTheme();
    this.applyTheme(theme);
    return theme;
  }
}

// Smart random theme generator with color harmony
export class RandomThemeGenerator {
  // Curated tasteful palettes for dark themes - multi-color harmony like the best cyberpunk UIs
  private static readonly TASTEFUL_DARK_PALETTES = [
    // Cyberpunk Mix (exactly like your good example - pink/salmon/gold)
    {
      base: "#0A0B0F",
      secondary: "#1A1B2E",
      accent: "#FF6B9D",
      text: "#FFD700",
      border: "#FF69B4",
    },
    // Matrix Duo (green primary with gold accents)
    {
      base: "#000805",
      secondary: "#0A1510",
      accent: "#00FF88",
      text: "#FFD700",
      border: "#00CC66",
    },
    // Sunset Gradient (pink to orange to yellow)
    {
      base: "#0F0A0F",
      secondary: "#1A1520",
      accent: "#FF69B4",
      text: "#FFA500",
      border: "#FFD700",
    },
    // Neon Nights (hot pink with electric blue accent)
    {
      base: "#0A0A1A",
      secondary: "#15152A",
      accent: "#FF10F0",
      text: "#00E5FF",
      border: "#FF69B4",
    },
    // Vaporwave Trinity (purple/pink/cyan classic)
    {
      base: "#100818",
      secondary: "#1A0E28",
      accent: "#C084FC",
      text: "#00D4FF",
      border: "#FF69B4",
    },
    // Plasma Core (purple with electric green)
    {
      base: "#0A0015",
      secondary: "#15002A",
      accent: "#9D4EDD",
      text: "#00FF88",
      border: "#7209B7",
    },
    // Rose Gold (pink with copper accents)
    {
      base: "#1A0A10",
      secondary: "#2A1520",
      accent: "#FF69B4",
      text: "#B87333",
      border: "#FF1493",
    },
    // Cherry Gold (pink primary with golden text)
    {
      base: "#0F0A0D",
      secondary: "#1A1418",
      accent: "#F472B6",
      text: "#FFD700",
      border: "#EC4899",
    },
    // Radioactive (green with hot pink contrast)
    {
      base: "#001005",
      secondary: "#002010",
      accent: "#39FF14",
      text: "#FF69B4",
      border: "#00FF88",
    },
    // Galaxy Mix (purple base with cyan and pink)
    {
      base: "#08081A",
      secondary: "#10102A",
      accent: "#818CF8",
      text: "#00D4FF",
      border: "#FF69B4",
    },
    // Coral Reef (salmon/turquoise ocean theme)
    {
      base: "#0F0808",
      secondary: "#1A1010",
      accent: "#FB7185",
      text: "#4ECDC4",
      border: "#F43F5E",
    },
    // Blood Moon (deep red with cyan glow)
    {
      base: "#1A0505",
      secondary: "#2A0A0A",
      accent: "#DC143C",
      text: "#00E5FF",
      border: "#FF1744",
    },
  ];

  // Curated tasteful palettes for light themes - fresh, modern, no dusty library vibes
  private static readonly TASTEFUL_LIGHT_PALETTES = [
    // Gradient Dream (like QRBuddy - pink to purple)
    {
      base: "#FFF9FC",
      secondary: "#FFE8F5",
      accent: "#FF69B4",
      text: "#2D2D3A",
      border: "#4A4568",
    },
    // Turquoise Pop (fresh, modern)
    {
      base: "#F8FFFF",
      secondary: "#E0F7FA",
      accent: "#4ECDC4",
      text: "#1A2332",
      border: "#2C3E50",
    },
    // Peach Gradient (warm but fresh)
    {
      base: "#FFF5F0",
      secondary: "#FFE5CC",
      accent: "#FF6B6B",
      text: "#2A2A3E",
      border: "#3F3F5C",
    },
    // Lavender Haze (soft purple without brown)
    {
      base: "#FAF7FF",
      secondary: "#EDE7F6",
      accent: "#B794F4",
      text: "#2D2838",
      border: "#4A4568",
    },
    // Sky Blue (clean, airy)
    {
      base: "#F5FCFF",
      secondary: "#E3F2FD",
      accent: "#64B5F6",
      text: "#1A237E",
      border: "#3949AB",
    },
    // Mint Fresh (cool, modern)
    {
      base: "#F5FFF9",
      secondary: "#E8F5E9",
      accent: "#66BB6A",
      text: "#1B2D1B",
      border: "#2E4A2E",
    },
    // Coral Reef (vibrant but sophisticated)
    {
      base: "#FFF8F5",
      secondary: "#FFE8E1",
      accent: "#FF7043",
      text: "#2C2C3A",
      border: "#424250",
    },
    // Electric Blue (modern tech)
    {
      base: "#F8FAFF",
      secondary: "#E8F0FF",
      accent: "#536DFE",
      text: "#1A1F36",
      border: "#2C3654",
    },
    // Pink Lemonade (fun, fresh)
    {
      base: "#FFF9FA",
      secondary: "#FFE4E8",
      accent: "#EC407A",
      text: "#2A2A3A",
      border: "#3F3F4F",
    },
    // Cyan Wave (oceanic, clean)
    {
      base: "#F0FFFF",
      secondary: "#E0F7FA",
      accent: "#00BCD4",
      text: "#0D2838",
      border: "#1A3A52",
    },
    // Sunset Gradient (warm without brown)
    {
      base: "#FFF9F5",
      secondary: "#FFE5B4",
      accent: "#FFA726",
      text: "#2D2D3D",
      border: "#424252",
    },
    // Violet Dream (rich purple, no dust)
    {
      base: "#FAF5FF",
      secondary: "#F3E5F5",
      accent: "#AB47BC",
      text: "#2A2235",
      border: "#3F3454",
    },
  ];

  // Color harmony algorithms
  static generateHarmonicTheme(baseMode: "light" | "dark" = "light"): Theme {
    const isLight = baseMode === "light";

    // 80% chance to use curated palettes (they're just better)
    if (Math.random() < 0.8) {
      const palettes = isLight
        ? this.TASTEFUL_LIGHT_PALETTES
        : this.TASTEFUL_DARK_PALETTES;
      const palette = palettes[Math.floor(Math.random() * palettes.length)];
      return {
        name: `RANDOM_${Date.now()}`,
        vibe: "curated palette",
        ...palette,
      };
    }

    // Generate base hue
    const baseHue = Math.floor(Math.random() * 360);

    // Choose harmony type
    const harmonyTypes = [
      "analogous",
      "triadic",
      "complementary",
      "split-complementary",
    ];
    const harmonyType =
      harmonyTypes[Math.floor(Math.random() * harmonyTypes.length)];

    // Generate colors based on harmony
    const colors = this.generateHarmony(baseHue, harmonyType, isLight);

    return {
      name: `RANDOM_${Date.now()}`,
      vibe: `${harmonyType} harmony`,
      base: colors.base,
      secondary: colors.secondary,
      accent: colors.accent,
      text: colors.text,
      border: colors.border,
    };
  }

  private static generateHarmony(
    baseHue: number,
    type: string,
    isLight: boolean,
  ): Record<string, string> {
    let secondaryHue: number;
    let accentHue: number;

    switch (type) {
      case "analogous":
        // Colors next to each other on the wheel
        secondaryHue = (baseHue + 30) % 360;
        accentHue = (baseHue - 30 + 360) % 360;
        break;
      case "triadic":
        // Three colors evenly spaced
        secondaryHue = (baseHue + 120) % 360;
        accentHue = (baseHue + 240) % 360;
        break;
      case "complementary":
        // Opposite colors
        secondaryHue = baseHue;
        accentHue = (baseHue + 180) % 360;
        break;
      case "split-complementary":
        // Base + two adjacent to complement
        secondaryHue = (baseHue + 150) % 360;
        accentHue = (baseHue + 210) % 360;
        break;
      default:
        secondaryHue = (baseHue + 60) % 360;
        accentHue = (baseHue + 180) % 360;
    }

    if (isLight) {
      // TASTEFUL LIGHT THEMES - warm, off-white bases with muted tones
      // Avoid harsh saturation, prefer creamy/warm backgrounds

      // Random choice between warm and cool tinted backgrounds
      const warmBase = Math.random() > 0.5;
      const baseColorHue = warmBase
        ? Math.floor(Math.random() * 60 + 30) // 30-90 (warm yellows/oranges)
        : Math.floor(Math.random() * 60 + 200); // 200-260 (cool blues/purples)

      return {
        // Background: Always off-white with subtle tint (never pure white)
        base: this.hslToHex(baseColorHue, 15, 97), // Creamy/tinted off-white
        // Secondary: Slightly more saturated version of base
        secondary: this.hslToHex(baseColorHue, 20, 93), // Soft pastel
        // Accent: Muted, sophisticated color (not neon!)
        accent: this.hslToHex(accentHue, 45, 45), // Muted, readable accent
        // Text: Always dark charcoal/brown for readability
        text: this.hslToHex(baseColorHue, 10, 18), // Dark with slight tint
        // Border: Dark but softer than pure black
        border: this.hslToHex(baseColorHue, 8, 25), // Soft dark borders
      };
    } else {
      return {
        base: this.hslToHex(baseHue, 25, 6), // Rich dark, not pure black
        secondary: this.hslToHex(secondaryHue, 20, 12), // Slightly lighter
        accent: this.hslToHex(accentHue, 75, 65), // Bright accent
        text: this.hslToHex(accentHue, 70, 75), // Colored text
        border: this.hslToHex(accentHue, 70, 65), // Colored borders
      };
    }
  }

  private static hslToHex(h: number, s: number, l: number): string {
    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;

    let r = 0, g = 0, b = 0;

    if (h >= 0 && h < 60) {
      r = c;
      g = x;
      b = 0;
    } else if (h >= 60 && h < 120) {
      r = x;
      g = c;
      b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0;
      g = c;
      b = x;
    } else if (h >= 180 && h < 240) {
      r = 0;
      g = x;
      b = c;
    } else if (h >= 240 && h < 300) {
      r = x;
      g = 0;
      b = c;
    } else if (h >= 300 && h < 360) {
      r = c;
      g = 0;
      b = x;
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
  }

  // Generate random with constraints
  static generateConstrainedRandom(
    baseTheme: Theme,
    variance: number = 30,
  ): Theme {
    // Extract HSL from base theme colors
    const baseHsl = this.hexToHsl(baseTheme.accent);

    // Create variations within variance range
    const newHue = (baseHsl.h + (Math.random() - 0.5) * variance * 2) % 360;
    const newSat = Math.max(
      0,
      Math.min(100, baseHsl.s + (Math.random() - 0.5) * variance),
    );
    const newLight = Math.max(
      0,
      Math.min(100, baseHsl.l + (Math.random() - 0.5) * variance / 2),
    );

    const isLight = baseTheme.base.includes("#F") ||
      baseTheme.base.includes("gradient");

    return this.generateHarmonicTheme(isLight ? "light" : "dark");
  }

  private static hexToHsl(hex: string): { h: number; s: number; l: number } {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  }
}

// Export convenience functions
export function createThemeSystem(config: ThemeSystemConfig): ThemeSystem {
  return new ThemeSystem(config);
}

export function generateRandomTheme(mode: "light" | "dark" = "light"): Theme {
  return RandomThemeGenerator.generateHarmonicTheme(mode);
}
