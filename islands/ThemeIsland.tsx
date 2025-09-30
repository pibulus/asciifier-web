import { useEffect, useState } from "preact/hooks";
import { createThemeSystem, type Theme } from "../theme-system/mod.ts";
import {
  asciifierThemeConfig,
  generateAsciifierRandomTheme,
  themes,
} from "../theme-system/asciifier-themes.ts";
import { sounds } from "../utils/sounds.ts";

export default function ThemeIsland() {
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]);
  const [showPicker, setShowPicker] = useState(false);
  const [themeSystem] = useState(() => createThemeSystem(asciifierThemeConfig));

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

    return unsubscribe;
  }, []);

  const handleThemeChange = (theme: Theme) => {
    sounds.click();
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
      isCurrentlyLight = ['F', 'E', 'D', 'C'].includes(firstChar);
    }

    const randomTheme = generateAsciifierRandomTheme(isCurrentlyLight);
    themeSystem.applyTheme(randomTheme);
    setCurrentTheme(randomTheme);
  };

  return (
    <div class="relative">
      {/* Theme Toggle Button */}
      <button
        onClick={() => setShowPicker(!showPicker)}
        onMouseEnter={() => sounds.hover()}
        class="group relative px-4 py-2 rounded-lg font-mono text-xs font-bold shadow-brutal hover:shadow-brutal-lg hover:animate-pop transition-all active:scale-95"
        style="background-color: var(--color-accent, #FF69B4); color: var(--color-base, #FAF9F6); border: 2px solid var(--color-border, #0A0A0A)"
        title="Change theme"
      >
        <span class="mr-2">🎨</span>
        {currentTheme.name.split(' ')[0]}
        <span class="ml-2 opacity-60 text-xs">↓</span>
      </button>

      {/* Theme Picker Dropdown */}
      {showPicker && (
        <div
          class="absolute top-full right-0 mt-2 w-48 rounded-lg shadow-brutal overflow-hidden animate-slide-up z-50"
          style="background-color: var(--color-base-solid, var(--color-base, #FAF9F6)); border: 3px solid var(--color-border, #0A0A0A)"
        >
          <div class="p-3 font-mono">
            {/* Only show the two main themes */}
            <div class="space-y-2">
              {themes.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => handleThemeChange(theme)}
                  onMouseEnter={() => sounds.hover()}
                  class={`w-full text-left px-4 py-3 rounded-lg text-xs font-mono hover:scale-[1.02] transition-all ${
                    currentTheme.name === theme.name ? "ring-2" : ""
                  }`}
                  style={`
                    background-color: ${theme.secondary};
                    color: ${theme.text};
                    border: 2px solid ${theme.border};
                    ${
                    currentTheme.name === theme.name
                      ? `ring-color: ${theme.accent}; box-shadow: 0 0 0 2px ${theme.accent}`
                      : ""
                  }
                  `}
                >
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-sm">{theme.name.split(' ')[0]}</span>
                    {currentTheme.name === theme.name && <span class="text-sm">✓</span>}
                  </div>
                </button>
              ))}
            </div>

            {/* Smart Random Theme Button - smaller and elegant */}
            <button
              onClick={generateRandomTheme}
              class="w-full mt-2 px-2 py-1 rounded text-xs font-mono hover:scale-[1.02] transition-all opacity-80 hover:opacity-100"
              style="background-color: var(--color-text, #0A0A0A); color: var(--color-base, #FAF9F6); border: 1px solid var(--color-border, #0A0A0A)"
            >
              <span class="flex items-center justify-center gap-1">
                <span class="text-xs">🎲</span>
                <span>random</span>
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
