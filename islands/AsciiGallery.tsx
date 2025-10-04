import { useEffect, useState } from "preact/hooks";
import { sounds } from "../utils/sounds.ts";
import { analytics } from "../utils/analytics.ts";
import { COLOR_EFFECTS, VISUAL_EFFECTS } from "../utils/constants.ts";
import { MagicDropdown } from "../components/MagicDropdown.tsx";
import { TerminalDisplay } from "../components/TerminalDisplay.tsx";
import { applyColorToArt } from "../utils/colorEffects.ts";

// Available categories from the API
const CATEGORIES = [
  { name: "Dragons", value: "mythology/dragons" },
  { name: "Escher Art", value: "art-and-design/escher" },
  { name: "The Simpsons", value: "cartoons/simpsons" },
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
  const [selectedEffect, setSelectedEffect] = useState<string>("neon");
  const [colorizedArt, setColorizedArt] = useState<string>("");
  const [artCache, setArtCache] = useState<string[]>([]);
  const [isLoadingArt, setIsLoadingArt] = useState(false);

  // Load initial random art on mount
  useEffect(() => {
    analytics.init();
    prefetchArt(3);
  }, []);

  // When category changes (but not on initial mount)
  const [hasInitialized, setHasInitialized] = useState(false);
  useEffect(() => {
    if (hasInitialized) {
      setArtCache([]);
      setCurrentArt("");
      setColorizedArt("");
      prefetchArt(3);
    } else {
      setHasInitialized(true);
    }
  }, [selectedCategory]);

  // Apply colorization when color effect changes
  useEffect(() => {
    if (currentArt && selectedColor !== "none") {
      const colorized = applyColorToArt(currentArt, selectedColor);
      setColorizedArt(colorized);
    } else {
      setColorizedArt("");
    }
  }, [currentArt, selectedColor]);

  // Function to fetch a single piece of ASCII art
  const fetchSingleArt = async (): Promise<string | null> => {
    try {
      const url = `/api/random-ascii-art?category=${
        encodeURIComponent(selectedCategory)
      }`;
      const response = await fetch(url);
      const data: AsciiArt = await response.json();

      if (data.art) {
        analytics.trackRandomAscii(selectedCategory);
        return data.art;
      }
      return null;
    } catch (error) {
      console.error("Failed to fetch ASCII art:", error);
      return null;
    }
  };

  // Prefetch multiple pieces for smooth shuffling
  const prefetchArt = async (count: number) => {
    setIsLoadingArt(true);
    const fetches = Array(count).fill(null).map(() => fetchSingleArt());
    const results = await Promise.all(fetches);
    const validArt = results.filter((art): art is string => art !== null);

    if (validArt.length > 0) {
      setArtCache(validArt);
      setCurrentArt(validArt[0]);
      setColorizedArt("");
    }
    setIsLoadingArt(false);
  };

  // Shuffle through cached art
  const shuffleArt = () => {
    sounds.click();

    if (artCache.length > 1) {
      // Don't clear currentArt to prevent size jump
      setIsLoadingArt(true);

      // Brief delay for visual feedback
      setTimeout(() => {
        // Rotate cache
        const [_current, ...rest] = artCache;
        setCurrentArt(rest[0]);
        setColorizedArt(""); // Clear colorized version for fresh color application
        setArtCache(rest);
        setIsLoadingArt(false);

        // Prefetch one more to keep cache full
        fetchSingleArt().then((art) => {
          if (art) setArtCache((prev) => [...prev, art]);
        });
      }, 200); // Shorter delay since we're not clearing content
    } else {
      // Fetch fresh if cache empty
      setIsLoadingArt(true);
      prefetchArt(3);
    }
  };


  return (
    <div class="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Controls - Three Dropdown Layout matching Text view */}
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-8">
        {/* Category Selector */}
        <MagicDropdown
          label="Theme"
          options={CATEGORIES}
          value={selectedCategory}
          onChange={setSelectedCategory}
        />

        {/* Color Effect Selector */}
        <MagicDropdown
          label="Color"
          options={COLOR_EFFECTS}
          value={selectedColor}
          onChange={setSelectedColor}
        />

        {/* Visual Effect Selector */}
        <MagicDropdown
          label="Effects"
          options={VISUAL_EFFECTS}
          value={selectedEffect}
          onChange={(value) => {
            sounds.click();
            setSelectedEffect(value);
          }}
        />
      </div>

      {/* Terminal Display */}
      <div class="mb-10">
        <TerminalDisplay
          content={currentArt}
          htmlContent={selectedColor !== "none" && colorizedArt
            ? colorizedArt
            : currentArt}
          isLoading={isLoadingArt && !currentArt}
          filename="ascii-art"
          onShuffle={shuffleArt}
          showShuffleButton={Boolean(currentArt)}
          terminalPath="~/gallery/ascii-art.txt"
          visualEffect={selectedEffect}
        />
      </div>

      {/* Info */}
      <div class="text-center">
        <p
          class="text-sm sm:text-base font-mono opacity-80"
          style="color: var(--color-text, #0A0A0A)"
        >
          Art sourced from asciiart.eu archive
        </p>
      </div>

    </div>
  );
}
