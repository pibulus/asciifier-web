import { useEffect, useState } from "preact/hooks";
import { themes, applyTheme, getNextTheme, loadTheme } from "../utils/themes.ts";
import { sounds } from "../utils/sounds.ts";

export default function ThemeIsland() {
  const [currentTheme, setCurrentTheme] = useState(themes[0]);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    // Load saved or random theme on mount
    const theme = loadTheme();
    setCurrentTheme(theme);
    applyTheme(theme);

    // Initialize sounds
    sounds.init();
  }, []);

  const handleThemeChange = (theme: typeof themes[0]) => {
    sounds.click();
    setCurrentTheme(theme);
    applyTheme(theme);
    setShowPicker(false);
  };

  const cycleTheme = () => {
    sounds.click();
    const next = getNextTheme();
    setCurrentTheme(next);
    applyTheme(next);
  };

  return (
    <div class="fixed top-4 right-4 z-50">
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
          class="absolute top-full right-0 mt-2 w-64 rounded-lg shadow-brutal overflow-hidden animate-slide-up"
          style="background-color: var(--color-base, #FAF9F6); border: 3px solid var(--color-border, #0A0A0A)"
        >
          <div class="p-3 font-mono">
            <div class="text-xs font-bold mb-2" style="color: var(--color-text, #0A0A0A)">
              PICK YOUR VIBE
            </div>
            <div class="space-y-1 max-h-96 overflow-y-auto">
              {themes.map(theme => (
                <button
                  key={theme.name}
                  onClick={() => handleThemeChange(theme)}
                  onMouseEnter={() => sounds.hover()}
                  class={`w-full text-left px-3 py-2 rounded text-xs font-mono hover:animate-pop transition-all ${
                    currentTheme.name === theme.name ? 'ring-2' : ''
                  }`}
                  style={`
                    background-color: ${theme.secondary};
                    color: ${theme.text};
                    border: 2px solid ${theme.border};
                    ${currentTheme.name === theme.name ? `ring-color: ${theme.accent}` : ''}
                  `}
                >
                  <div class="flex items-center justify-between">
                    <span class="font-bold">{theme.name}</span>
                    {currentTheme.name === theme.name && <span>✓</span>}
                  </div>
                  <div class="opacity-60 text-xs mt-1">{theme.vibe}</div>
                  <div class="flex gap-1 mt-2">
                    <div class="w-4 h-4 rounded" style={`background-color: ${theme.base}`} title="60%"></div>
                    <div class="w-4 h-4 rounded" style={`background-color: ${theme.secondary}`} title="30%"></div>
                    <div class="w-4 h-4 rounded" style={`background-color: ${theme.accent}`} title="10%"></div>
                  </div>
                </button>
              ))}
            </div>

            {/* Quick Cycle Button */}
            <button
              onClick={cycleTheme}
              class="w-full mt-3 px-3 py-2 rounded text-xs font-mono font-bold hover:animate-spring transition-all"
              style="background-color: var(--color-text, #0A0A0A); color: var(--color-base, #FAF9F6)"
            >
              🎲 RANDOM VIBE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}