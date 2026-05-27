import { useEffect, useRef, useState } from "preact/hooks";
import { sounds } from "../utils/sounds.ts";
import { analytics } from "../utils/analytics.ts";
import {
  ASCII_MUSEUM_CATEGORIES,
  COLOR_EFFECTS,
  VISUAL_EFFECTS,
} from "../utils/constants.ts";
import { MagicDropdown } from "../components/MagicDropdown.tsx";
import { TerminalDisplay } from "../components/TerminalDisplay.tsx";
import { applyColorToArt } from "../utils/colorEffects.ts";

interface AsciiArt {
  art: string;
  source: string;
  category: string;
  categoryName?: string;
  title?: string;
  artist?: string;
  sourceOnly?: boolean;
}

export default function AsciiGallery() {
  const [currentArt, setCurrentArt] = useState<string>("");
  const [currentTitle, setCurrentTitle] = useState<string>("ascii-art");
  const [currentArtist, setCurrentArtist] = useState<string>("");
  const [currentSourceUrl, setCurrentSourceUrl] = useState<string>(
    ASCII_MUSEUM_CATEGORIES[0].sourceUrl,
  );
  const [currentSourceOnly, setCurrentSourceOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    ASCII_MUSEUM_CATEGORIES[0].value,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedColor, setSelectedColor] = useState<string>("none");
  const [selectedEffect, setSelectedEffect] = useState<string>("none");
  const [colorizedArt, setColorizedArt] = useState<string>("");
  const [artCache, setArtCache] = useState<AsciiArt[]>([]);
  const [isLoadingArt, setIsLoadingArt] = useState(false);

  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);
  const shuffleTimeoutRef = useRef<number | null>(null);
  const fetchRequestRef = useRef(0);

  const selectedCategoryConfig =
    ASCII_MUSEUM_CATEGORIES.find((category) =>
      category.value === selectedCategory
    ) || ASCII_MUSEUM_CATEGORIES[0];

  const archiveSearchUrl = searchQuery.trim()
    ? `https://www.asciiart.eu/search?q=${
      encodeURIComponent(searchQuery.trim())
    }`
    : selectedCategoryConfig.sourceUrl;

  // Initialize analytics and cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    analytics.init();

    return () => {
      isMountedRef.current = false;
      if (shuffleTimeoutRef.current) {
        clearTimeout(shuffleTimeoutRef.current);
        shuffleTimeoutRef.current = null;
      }
    };
  }, []);

  // Load art whenever category or local search changes.
  useEffect(() => {
    if (shuffleTimeoutRef.current) {
      clearTimeout(shuffleTimeoutRef.current);
      shuffleTimeoutRef.current = null;
    }

    const timeoutId = globalThis.setTimeout(() => {
      setArtCache([]);
      setCurrentArt("");
      setColorizedArt("");
      setCurrentSourceOnly(false);
      prefetchArt(3);
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [selectedCategory, searchQuery]);

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
  const fetchSingleArt = async (): Promise<AsciiArt | null> => {
    try {
      const url = new URL("/api/random-ascii-art", globalThis.location.origin);
      url.searchParams.set("category", selectedCategory);
      if (searchQuery.trim()) {
        url.searchParams.set("q", searchQuery.trim());
      }

      const response = await fetch(url.toString());
      const data: AsciiArt = await response.json();

      if (data.art) {
        analytics.trackRandomAscii(selectedCategory);
        return data;
      }
      return null;
    } catch (error) {
      console.error("Failed to fetch ASCII art:", error);
      return null;
    }
  };

  // Prefetch multiple pieces for smooth shuffling
  const prefetchArt = async (count: number) => {
    if (!isMountedRef.current) return;

    const requestId = ++fetchRequestRef.current;
    setIsLoadingArt(true);
    const fetches = Array(count).fill(null).map(() => fetchSingleArt());
    const results = await Promise.all(fetches);
    const validArt = results.filter((art): art is AsciiArt => art !== null);

    if (!isMountedRef.current || requestId !== fetchRequestRef.current) {
      return;
    }

    if (validArt.length > 0) {
      setArtCache(validArt);
      showArt(validArt[0]);
      setColorizedArt("");
    }
    setIsLoadingArt(false);
  };

  const showArt = (item: AsciiArt) => {
    setCurrentArt(item.art);
    setCurrentTitle(item.title || item.categoryName || "ascii-art");
    setCurrentArtist(item.artist || "");
    setCurrentSourceUrl(item.source || selectedCategoryConfig.sourceUrl);
    setCurrentSourceOnly(Boolean(item.sourceOnly));
  };

  // Shuffle through cached art
  const shuffleArt = () => {
    sounds.click();

    if (artCache.length > 1) {
      // Don't clear currentArt to prevent size jump
      setIsLoadingArt(true);

      // Brief delay for visual feedback
      shuffleTimeoutRef.current = globalThis.setTimeout(() => {
        shuffleTimeoutRef.current = null;

        // Only update state if still mounted
        if (!isMountedRef.current) return;

        // Rotate cache
        const [_current, ...rest] = artCache;
        showArt(rest[0]);
        setColorizedArt(""); // Clear colorized version for fresh color application
        setArtCache(rest);
        setIsLoadingArt(false);

        // Prefetch one more to keep cache full
        fetchSingleArt().then((art) => {
          if (art && isMountedRef.current) {
            setArtCache((prev) => [...prev, art]);
          }
        });
      }, 200); // Shorter delay since we're not clearing content
    } else {
      // Fetch fresh if cache empty
      setIsLoadingArt(true);
      prefetchArt(3);
    }
  };

  return (
    <div class="max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-8 space-y-3 sm:space-y-6">
      {/* Controls - Three Dropdown Layout matching Text view */}
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-3 sm:mb-8">
        {/* Category Selector */}
        <MagicDropdown
          label="Theme"
          options={ASCII_MUSEUM_CATEGORIES}
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

      <div class="flex flex-col sm:flex-row gap-3 mb-3 sm:mb-8">
        <input
          type="search"
          value={searchQuery}
          maxLength={40}
          onInput={(event) =>
            setSearchQuery((event.target as HTMLInputElement).value)}
          placeholder="Search museum"
          class="flex-1 px-4 py-3 border-3 sm:border-4 rounded-xl sm:rounded-2xl font-mono font-bold text-sm sm:text-base shadow-brutal focus:outline-none"
          style="background-color: var(--color-secondary, #FFE5B4); border-color: var(--color-border, #0A0A0A); color: var(--color-text, #0A0A0A);"
        />
        <a
          href={selectedCategoryConfig.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          class="px-4 py-3 border-3 sm:border-4 rounded-xl sm:rounded-2xl font-mono font-black text-center text-sm sm:text-base shadow-brutal hover:shadow-brutal-lg hover:-translate-y-0.5 transition-all"
          style="background-color: var(--color-accent, #FF69B4); color: var(--color-base, #FAF9F6); border-color: var(--color-border, #0A0A0A);"
        >
          OPEN SOURCE
        </a>
        <a
          href={archiveSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          class="px-4 py-3 border-3 sm:border-4 rounded-xl sm:rounded-2xl font-mono font-black text-center text-sm sm:text-base shadow-brutal hover:shadow-brutal-lg hover:-translate-y-0.5 transition-all"
          style="background-color: var(--color-secondary, #FFE5B4); color: var(--color-text, #0A0A0A); border-color: var(--color-border, #0A0A0A);"
        >
          SEARCH ONLINE
        </a>
      </div>

      {/* Terminal Display */}
      <div class="mb-4 sm:mb-10">
        <TerminalDisplay
          content={currentArt}
          htmlContent={selectedColor !== "none" && colorizedArt
            ? colorizedArt
            : undefined}
          isLoading={isLoadingArt && !currentArt}
          filename={currentTitle.toLowerCase().replace(/[^a-z0-9]/g, "-") ||
            "ascii-art"}
          onShuffle={shuffleArt}
          showShuffleButton={Boolean(currentArt) && !currentSourceOnly}
          showExportButtons={Boolean(currentArt) && !currentSourceOnly}
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
          <span class="font-bold">{currentTitle}</span>
          {currentArtist && <span>by {currentArtist}</span>}
          <span>• Online collection:</span>
          <a
            href={currentSourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="underline font-bold"
          >
            asciiart.eu
          </a>
        </p>
      </div>
    </div>
  );
}
