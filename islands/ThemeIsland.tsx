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
    const randomTheme = generateAsciifierRandomTheme();
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
        {currentTheme.name}
        <span class="ml-2 opacity-60 text-xs">↓</span>
      </button>

      {/* Theme Picker Dropdown */}
      {showPicker && (
        <div
          class="absolute top-full right-0 mt-2 w-64 rounded-lg shadow-brutal overflow-hidden animate-slide-up z-50"
          style="background-color: var(--color-base-solid, var(--color-base, #FAF9F6)); border: 3px solid var(--color-border, #0A0A0A)"
        >
          <div class="p-3 font-mono">
            <div
              class="text-xs font-bold mb-3"
              style="color: var(--color-text, #0A0A0A)"
            >
              CHOOSE YOUR VIBE
            </div>

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
                  <div class="flex items-center justify-between mb-1">
                    <span class="font-bold text-sm">{theme.name}</span>
                    {currentTheme.name === theme.name && <span class="text-lg">✓</span>}
                  </div>
                  <div class="opacity-70 text-xs">{theme.vibe}</div>
                  <div class="flex gap-1 mt-2">
                    <div
                      class="w-5 h-5 rounded border border-black/20"
                      style={`background: ${theme.base.includes("gradient") ? theme.base : `linear-gradient(135deg, ${theme.base} 0%, ${theme.base} 100%)`}`}
                      title="Base (60%)"
                    >
                    </div>
                    <div
                      class="w-5 h-5 rounded border border-black/20"
                      style={`background-color: ${theme.secondary}`}
                      title="Secondary (30%)"
                    >
                    </div>
                    <div
                      class="w-5 h-5 rounded border border-black/20"
                      style={`background-color: ${theme.accent}`}
                      title="Accent (10%)"
                    >
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Divider */}
            <div
              class="my-3 border-t-2"
              style="border-color: var(--color-border, #0A0A0A); opacity: 0.2"
            />

            {/* Smart Random Theme Button */}
            <button
              onClick={generateRandomTheme}
              class="w-full px-4 py-3 rounded-lg text-xs font-mono font-bold hover:scale-[1.02] transition-all group"
              style="background: linear-gradient(45deg, #FF6B9D, #00FF88, #FFB000, #00B4D8); color: #0A0A0A; border: 2px solid #0A0A0A"
            >
              <span class="flex items-center justify-center gap-2">
                <span class="text-base">🎲</span>
                <span>SURPRISE ME!</span>
                <span class="text-base">✨</span>
              </span>
              <span class="text-xs opacity-70 block mt-1">
                {currentTheme.name === "RANDOM" ? `current: ${currentTheme.vibe}` : "generate harmonic colors"}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
