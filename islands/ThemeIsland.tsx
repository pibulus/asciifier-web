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
                    color: ${theme.text};
                    border: 3px solid ${theme.border};
                    ${
                    currentTheme.name === theme.name
                      ? `box-shadow: 0 0 0 2px ${theme.accent} inset`
                      : ""
                  }
                  `}
                >
                  <div class="flex items-center justify-center relative">
                    <span class="font-black tracking-wider uppercase">{theme.name.split(' ')[0]}</span>
                    {currentTheme.name === theme.name && (
                      <span class="absolute right-0 text-lg">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Divider */}
            <div class="my-3 border-t-2 opacity-20" style="border-color: var(--color-border, #0A0A0A)"></div>

            {/* Smart Random Theme Button - smaller and elegant */}
            <button
              onClick={generateRandomTheme}
              class="w-full px-3 py-1.5 rounded-lg text-xs font-mono hover:scale-[1.02] transition-all"
              style="background: linear-gradient(135deg, #E8E8E8 0%, #D0D0D0 100%); color: #2C2825; border: 2px solid #2C2825; box-shadow: inset 0 1px 0 rgba(255,255,255,0.3)"
            >
              <span class="flex items-center justify-center gap-1.5 font-bold tracking-wide">
                <span class="opacity-70">🎲</span>
                <span class="uppercase">random</span>
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
