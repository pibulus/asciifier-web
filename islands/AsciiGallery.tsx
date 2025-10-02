import { useEffect, useState } from "preact/hooks";
import { sounds } from "../utils/sounds.ts";
import { analytics } from "../utils/analytics.ts";

// Available categories from the API
const CATEGORIES = [
  { name: "Dragons", value: "mythology/dragons" },
  { name: "Escher Art", value: "art-and-design/escher" },
  { name: "The Simpsons", value: "cartoons/simpsons" },
];

// Color effects matching TextToAscii
const COLOR_EFFECTS = [
  { name: "Plain", value: "none" },
  { name: "Matrix", value: "matrix" },
  { name: "Fire", value: "fire" },
  { name: "Sunrise", value: "sunrise" },
  { name: "Unicorn", value: "unicorn" },
  { name: "Vaporwave", value: "vaporwave" },
  { name: "Cyberpunk", value: "cyberpunk" },
  { name: "Ocean", value: "ocean" },
  { name: "Chrome", value: "chrome" },
  { name: "Neon", value: "neon" },
  { name: "Poison", value: "poison" },
];

interface AsciiArt {
  art: string;
  source: string;
  category: string;
}

export default function AsciiGallery() {
  const [currentArt, setCurrentArt] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    CATEGORIES[0].value,
  );
  const [selectedColor, setSelectedColor] = useState<string>("none");
  const [colorizedArt, setColorizedArt] = useState<string>("");
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [colorDropdownOpen, setColorDropdownOpen] = useState(false);

  // Load initial random art on mount
  useEffect(() => {
    analytics.init();
    fetchRandomArt();
  }, []);

  // Apply colorization when color effect changes
  useEffect(() => {
    if (currentArt && selectedColor !== "none") {
      applyColorEffect(currentArt, selectedColor);
    } else {
      setColorizedArt("");
    }
  }, [currentArt, selectedColor]);

  const fetchRandomArt = async () => {
    setIsLoading(true);
    sounds.click();

    try {
      const response = await fetch("/api/random-ascii-art");
      const data: AsciiArt = await response.json();

      if (data.art) {
        setCurrentArt(data.art);
        analytics.track("gallery_shuffle", {
          category: selectedCategory,
        });
      }
    } catch (error) {
      console.error("Failed to fetch ASCII art:", error);
      setCurrentArt("Error loading ASCII art. Try again!");
    } finally {
      setIsLoading(false);
    }
  };

  const applyColorEffect = async (art: string, effect: string) => {
    try {
      const response = await fetch("/api/enhanced-figlet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: art,
          colorEffect: effect,
          justColorize: true,
        }),
      });

      const data = await response.json();
      if (data.htmlOutput) {
        setColorizedArt(data.htmlOutput);
      }
    } catch (error) {
      console.error("Failed to colorize art:", error);
    }
  };

  const handleCopy = async () => {
    const textToCopy = currentArt;
    sounds.pop();

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedToClipboard(true);
      analytics.track("gallery_copy", {
        category: selectedCategory,
        colorEffect: selectedColor,
      });

      setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const displayArt = selectedColor !== "none" && colorizedArt
    ? colorizedArt
    : currentArt;

  return (
    <div class="space-y-6">
      {/* Header */}
      <div class="text-center space-y-2">
        <h2
          class="text-3xl font-bold font-mono"
          style="color: var(--color-text, #0A0A0A)"
        >
          🎨 ASCII Art Gallery
        </h2>
        <p
          class="text-lg font-mono"
          style="color: var(--color-text, #0A0A0A); opacity: 0.7"
        >
          Explore classic ASCII art from the archives
        </p>
      </div>

      {/* Controls */}
      <div class="flex flex-wrap items-center justify-center gap-4">
        {/* Category Selector */}
        <div class="relative">
          <label
            class="block text-xs font-mono font-bold mb-2 uppercase tracking-wide"
            style="color: var(--color-text, #0A0A0A)"
          >
            THEME
          </label>
          <button
            onClick={() => {
              setCategoryDropdownOpen(!categoryDropdownOpen);
              setColorDropdownOpen(false);
            }}
            class="w-48 px-4 py-3 border-4 rounded-lg font-mono font-bold text-left flex items-center justify-between shadow-brutal transition-all hover:scale-105"
            style="background-color: var(--color-secondary, #FFE5B4); color: var(--color-text, #0A0A0A); border-color: var(--color-border, #0A0A0A)"
          >
            <span>
              {CATEGORIES.find((c) => c.value === selectedCategory)?.name}
            </span>
            <span class="text-lg">▼</span>
          </button>

          {categoryDropdownOpen && (
            <div
              class="absolute top-full mt-2 w-48 border-4 rounded-lg shadow-brutal overflow-hidden z-10"
              style="background-color: var(--color-base, #FAF9F6); border-color: var(--color-border, #0A0A0A)"
            >
              {CATEGORIES.map((category) => (
                <button
                  key={category.value}
                  onClick={() => {
                    setSelectedCategory(category.value);
                    setCategoryDropdownOpen(false);
                    sounds.click();
                  }}
                  class="w-full px-4 py-3 font-mono font-bold text-left hover:bg-opacity-80 transition-colors"
                  style={selectedCategory === category.value
                    ? "background-color: var(--color-accent, #FF69B4); color: var(--color-base, #FAF9F6)"
                    : "background-color: var(--color-secondary, #FFE5B4); color: var(--color-text, #0A0A0A)"}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Color Effect Selector */}
        <div class="relative">
          <label
            class="block text-xs font-mono font-bold mb-2 uppercase tracking-wide"
            style="color: var(--color-text, #0A0A0A)"
          >
            COLOR
          </label>
          <button
            onClick={() => {
              setColorDropdownOpen(!colorDropdownOpen);
              setCategoryDropdownOpen(false);
            }}
            class="w-48 px-4 py-3 border-4 rounded-lg font-mono font-bold text-left flex items-center justify-between shadow-brutal transition-all hover:scale-105"
            style="background-color: var(--color-secondary, #FFE5B4); color: var(--color-text, #0A0A0A); border-color: var(--color-border, #0A0A0A)"
          >
            <span>
              {COLOR_EFFECTS.find((c) => c.value === selectedColor)?.name}
            </span>
            <span class="text-lg">▼</span>
          </button>

          {colorDropdownOpen && (
            <div
              class="absolute top-full mt-2 w-48 border-4 rounded-lg shadow-brutal overflow-hidden z-10 max-h-80 overflow-y-auto"
              style="background-color: var(--color-base, #FAF9F6); border-color: var(--color-border, #0A0A0A)"
            >
              {COLOR_EFFECTS.map((effect) => (
                <button
                  key={effect.value}
                  onClick={() => {
                    setSelectedColor(effect.value);
                    setColorDropdownOpen(false);
                    sounds.click();
                  }}
                  class="w-full px-4 py-3 font-mono font-bold text-left hover:bg-opacity-80 transition-colors"
                  style={selectedColor === effect.value
                    ? "background-color: var(--color-accent, #FF69B4); color: var(--color-base, #FAF9F6)"
                    : "background-color: var(--color-secondary, #FFE5B4); color: var(--color-text, #0A0A0A)"}
                >
                  {effect.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Shuffle Button */}
        <div>
          <label
            class="block text-xs font-mono font-bold mb-2 uppercase tracking-wide opacity-0"
            style="color: var(--color-text, #0A0A0A)"
          >
            _
          </label>
          <button
            onClick={fetchRandomArt}
            disabled={isLoading}
            class="px-6 py-3 border-4 rounded-lg font-mono font-bold shadow-brutal transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style="background-color: var(--color-accent, #FF69B4); color: var(--color-base, #FAF9F6); border-color: var(--color-border, #0A0A0A)"
          >
            {isLoading ? "🎲 Loading..." : "🎲 Shuffle"}
          </button>
        </div>
      </div>

      {/* ASCII Art Display */}
      <div
        class="border-4 rounded-2xl p-6 shadow-brutal-xl overflow-hidden"
        style="background-color: #0A0A0A; border-color: var(--color-border, #0A0A0A)"
      >
        {/* Terminal Window Dots */}
        <div class="flex gap-2 mb-4">
          <div class="w-3 h-3 rounded-full bg-red-500"></div>
          <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div class="w-3 h-3 rounded-full bg-green-500"></div>
        </div>

        {/* ASCII Art */}
        <div
          class="font-mono text-xs leading-tight overflow-x-auto"
          style="color: #00FF00; white-space: pre; min-height: 400px"
        >
          {isLoading ? (
            <div class="flex items-center justify-center h-96">
              <div class="animate-pulse">Loading ASCII magic...</div>
            </div>
          ) : selectedColor !== "none" && colorizedArt ? (
            <div
              dangerouslySetInnerHTML={{ __html: colorizedArt }}
            />
          ) : (
            currentArt
          )}
        </div>
      </div>

      {/* Export Buttons */}
      <div class="flex items-center justify-center gap-4">
        <button
          onClick={handleCopy}
          class="inline-flex items-center gap-2 px-6 py-3 border-4 rounded-xl font-mono font-bold shadow-brutal transition-all hover:scale-105"
          style="background-color: var(--color-accent, #FF69B4); color: var(--color-base, #FAF9F6); border-color: var(--color-border, #0A0A0A)"
        >
          {copiedToClipboard ? "✓ Copied!" : "📋 COPY"}
        </button>
      </div>

      {/* Info */}
      <div class="text-center">
        <p
          class="text-sm font-mono opacity-60"
          style="color: var(--color-text, #0A0A0A)"
        >
          Art sourced from asciiart.eu archive
        </p>
      </div>
    </div>
  );
}
