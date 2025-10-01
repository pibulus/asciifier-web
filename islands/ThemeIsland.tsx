import { useEffect, useRef, useState } from "preact/hooks";
import { createThemeSystem, type Theme } from "../theme-system/mod.ts";
import {
  asciifierThemeConfig,
  generateAsciifierRandomTheme,
  themes,
} from "../theme-system/asciifier-themes.ts";
import { sounds } from "../utils/sounds.ts";
import { analytics } from "../utils/analytics.ts";

export default function ThemeIsland() {
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]);
  const [showPicker, setShowPicker] = useState(false);
  const [themeSystem] = useState(() => createThemeSystem(asciifierThemeConfig));
  const [grainLevel, setGrainLevel] = useState(0.08); // Default grain
  const [scanLevel, setScanLevel] = useState(0.03); // Default scanlines
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize theme system and load saved theme
    const theme = themeSystem.init();
    setCurrentTheme(theme);

    // Subscribe to theme changes
    const unsubscribe = themeSystem.subscribe((theme) => {
      setCurrentTheme(theme);
    });

    // Initialize sounds
    sounds.init();

    // Load saved vintage settings
    const savedGrain = localStorage.getItem("vintage-grain");
    const savedScan = localStorage.getItem("vintage-scan");
    if (savedGrain) setGrainLevel(parseFloat(savedGrain));
    if (savedScan) setScanLevel(parseFloat(savedScan));

    return unsubscribe;
  }, []);

  // Update vintage effects when sliders change
  useEffect(() => {
    // Update the grain layer
    const grainLayer = document.getElementById("grain-layer");
    if (grainLayer) {
      (grainLayer as HTMLElement).style.opacity = grainLevel.toString();
    }
    // Update the scanline layer
    const scanLayer = document.getElementById("scan-layer");
    if (scanLayer) {
      (scanLayer as HTMLElement).style.opacity = scanLevel.toString();
    }
    // Save settings
    localStorage.setItem("vintage-grain", grainLevel.toString());
    localStorage.setItem("vintage-scan", scanLevel.toString());
  }, [grainLevel, scanLevel]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showPicker]);

  const handleThemeChange = (theme: Theme) => {
    sounds.click();
    analytics.trackThemeChanged(currentTheme.name, theme.name);
    themeSystem.setTheme(theme.name);
    setShowPicker(false);
  };

  const generateRandomTheme = () => {
    sounds.click();
    // Determine if current theme is light or dark based on the theme name or if it's a random theme, check the base color
    let isCurrentlyLight = false;

    if (currentTheme.name === "VINTAGE CREAM") {
      isCurrentlyLight = true;
    } else if (currentTheme.name === "TERMINAL DUSK") {
      isCurrentlyLight = false;
    } else if (currentTheme.name === "RANDOM") {
      // For random themes, check if the base color is light (high lightness)
      const baseColor = currentTheme.base.includes("gradient")
        ? currentTheme.base.match(/#[0-9A-Fa-f]{6}/)?.[0] || currentTheme.base
        : currentTheme.base;
      // Simple check: if the color starts with F, E, D, C it's likely light
      const firstChar = baseColor[1]?.toUpperCase();
      isCurrentlyLight = ["F", "E", "D", "C"].includes(firstChar);
    }

    const randomTheme = generateAsciifierRandomTheme(isCurrentlyLight);
    themeSystem.applyTheme(randomTheme);
    setCurrentTheme(randomTheme);
  };

  return (
    <div class="relative" ref={dropdownRef}>
      {/* Theme Toggle Button */}
      <button
        onClick={() => setShowPicker(!showPicker)}
        onMouseEnter={() => sounds.hover()}
        class="group relative px-4 py-2 rounded-lg font-mono text-xs font-bold shadow-brutal hover:shadow-brutal-lg hover:animate-pop transition-all active:scale-95"
        style="background-color: var(--color-accent, #FF69B4); color: var(--color-base, #FAF9F6); border: 2px solid var(--color-border, #0A0A0A)"
        title="Change theme"
      >
        <span class="mr-2">🎨</span>
        {currentTheme.name.split(" ")[0]}
        <span class="ml-2 opacity-60 text-xs">↓</span>
      </button>

      {/* Theme Picker Dropdown */}
      {showPicker && (
        <div
          class="absolute top-full right-0 mt-2 w-56 rounded-xl shadow-brutal overflow-hidden animate-slide-up z-50"
          style="background-color: var(--color-base, #FAF9F6); border: 3px solid var(--color-border, #0A0A0A)"
        >
          <div class="p-4 font-mono">
            {/* Only show the two main themes */}
            <div class="space-y-3">
              {themes.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => handleThemeChange(theme)}
                  onMouseEnter={() => sounds.hover()}
                  class={`w-full text-center px-4 py-3 rounded-lg text-sm font-mono hover:scale-[1.02] transition-all ${
                    currentTheme.name === theme.name ? "" : ""
                  }`}
                  style={`
                    background-color: ${theme.secondary};
                    color: ${
                    theme.name === "VINTAGE CREAM" ? "#2C2825" : theme.text
                  };
                    border: 3px solid ${
                    theme.name === "VINTAGE CREAM" ? "#2C2825" : theme.border
                  };
                    ${
                    currentTheme.name === theme.name
                      ? `box-shadow: 0 0 0 2px ${theme.accent} inset`
                      : ""
                  }
                  `}
                >
                  <div class="flex items-center justify-center relative">
                    <span class="font-black tracking-wider uppercase">
                      {theme.name.split(" ")[0]}
                    </span>
                    {currentTheme.name === theme.name && (
                      <span class="absolute right-0 text-lg">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Divider */}
            <div
              class="my-3 border-t-2 opacity-20"
              style="border-color: var(--color-border, #0A0A0A)"
            >
            </div>

            {/* Smart Random Theme Button - smaller and elegant */}
            <button
              onClick={generateRandomTheme}
              class="w-full px-3 py-1.5 rounded-lg text-xs font-mono hover:scale-[1.02] transition-all"
              style="background: linear-gradient(90deg, #FFE8CC 0%, #FFD3B6 50%, #FFBFA0 100%); color: #2C2825; border: 2px solid #2C2825;"
            >
              <span class="flex items-center justify-center gap-1.5 font-bold tracking-wide">
                <span class="opacity-80">🎲</span>
                <span class="uppercase">random</span>
              </span>
            </button>

            {/* Divider */}
            <div
              class="my-3 border-t-2 opacity-20"
              style="border-color: var(--color-border, #0A0A0A)"
            >
            </div>

            {/* Vintage Controls */}
            <div class="space-y-3">
              {/* Grain Slider - now goes up to 50%! */}
              <div>
                <label
                  class="flex items-center justify-between text-xs font-mono mb-1"
                  style="color: var(--color-text, #0A0A0A)"
                >
                  <span class="uppercase font-bold">Grain</span>
                  <span class="opacity-60">
                    {Math.round(grainLevel * 100)}%
                  </span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="0.5"
                  step="0.01"
                  value={grainLevel}
                  onInput={(e) =>
                    setGrainLevel(
                      parseFloat((e.target as HTMLInputElement).value),
                    )}
                  class="w-full h-2 rounded-full outline-none cursor-pointer"
                  style={`
                    background: linear-gradient(to right,
                      var(--color-accent, #FF69B4) 0%,
                      var(--color-accent, #FF69B4) ${(grainLevel / 0.5) * 100}%,
                      var(--color-secondary, #FFE5B4) ${
                    (grainLevel / 0.5) * 100
                  }%,
                      var(--color-secondary, #FFE5B4) 100%);
                    -webkit-appearance: none;
                  `}
                />
              </div>

              {/* Scan Slider - reduced max to 20% */}
              <div>
                <label
                  class="flex items-center justify-between text-xs font-mono mb-1"
                  style="color: var(--color-text, #0A0A0A)"
                >
                  <span class="uppercase font-bold">Scan</span>
                  <span class="opacity-60">{Math.round(scanLevel * 100)}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="0.2"
                  step="0.01"
                  value={scanLevel}
                  onInput={(e) =>
                    setScanLevel(
                      parseFloat((e.target as HTMLInputElement).value),
                    )}
                  class="w-full h-2 rounded-full outline-none cursor-pointer"
                  style={`
                    background: linear-gradient(to right,
                      var(--color-accent, #FF69B4) 0%,
                      var(--color-accent, #FF69B4) ${(scanLevel / 0.2) * 100}%,
                      var(--color-secondary, #FFE5B4) ${
                    (scanLevel / 0.2) * 100
                  }%,
                      var(--color-secondary, #FFE5B4) 100%);
                    -webkit-appearance: none;
                  `}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
