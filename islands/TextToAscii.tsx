import { useSignal } from "@preact/signals";
import { useEffect, useState } from "preact/hooks";
import { sounds } from "../utils/sounds.ts";
import { analytics } from "../utils/analytics.ts";
import { SimpleTypeWriter } from "../utils/simple-typewriter.js";
import { COLOR_EFFECTS } from "../utils/constants.ts";
import { MagicDropdown } from "../components/MagicDropdown.tsx";
import { TerminalDisplay } from "../components/TerminalDisplay.tsx";
import { applyColorToArt } from "../utils/colorEffects.ts";

// Curated figlet fonts - hand-picked fonts for the ASCII Factory!
const FIGLET_FONTS = [
  { name: "Standard", value: "Standard" },
  { name: "Doom", value: "Doom" },
  { name: "Slant", value: "Slant" },
  { name: "Shadow", value: "Shadow" },
  { name: "Ghost", value: "Ghost" },
  { name: "Bloody", value: "Bloody" },
  { name: "Colossal", value: "Colossal" },
  { name: "Isometric3", value: "Isometric3" },
  { name: "Poison", value: "Poison" },
  { name: "Speed", value: "Speed" },
  { name: "Star Wars", value: "Star Wars" },
  { name: "Small", value: "Small" },
  { name: "Chunky", value: "Chunky" },
  { name: "Larry 3D", value: "Larry 3D" },
  { name: "Banner", value: "Banner" },
  { name: "Block", value: "Block" },
  { name: "Big", value: "Big" },
];

// Border styles for ASCII art
const BORDER_STYLES = [
  { name: "None", value: "none" },
  { name: "Single", value: "single" },
  { name: "Double", value: "double" },
  { name: "Block", value: "block" },
];

export default function TextToAscii() {
  // Initialize analytics and typewriter sounds on mount
  useEffect(() => {
    analytics.init();

    // Initialize typewriter sounds
    if (typeof window !== "undefined") {
      const typewriter = new SimpleTypeWriter({
        volume: 0.3,
        enabled: true,
      });

      typewriter.init().then(() => {
        typewriter.attach("#ascii-text-input");

        // Resume audio context on first click (browser autoplay policy)
        const resumeAudio = () => {
          if (typewriter.audioContext?.state === "suspended") {
            typewriter.audioContext.resume();
          }
          document.removeEventListener("click", resumeAudio);
        };
        document.addEventListener("click", resumeAudio);
      }).catch((err) => {
        console.warn("Typewriter sounds unavailable:", err);
      });

      return () => typewriter.dispose();
    }
  }, []);

  const [asciiOutput, setAsciiOutput] = useState<string>("");
  const [htmlOutput, setHtmlOutput] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [welcomeArt, setWelcomeArt] = useState<string>("");
  const [artCache, setArtCache] = useState<string[]>([]);
  const [isLoadingArt, setIsLoadingArt] = useState(false);
  const [welcomeArtColorized, setWelcomeArtColorized] = useState<string>("");
  const [selectedWelcomeColor, setSelectedWelcomeColor] = useState<string>(
    "none",
  );

  // Dropdown states
  const [allSelected, setAllSelected] = useState(false);
  const [fontChanged, setFontChanged] = useState(false);
  const [colorChanged, setColorChanged] = useState(false);
  const [borderChanged, setBorderChanged] = useState(false);

  const inputText = useSignal("");
  const selectedFont = useSignal("Standard");
  const colorEffect = useSignal("none");
  const borderStyle = useSignal("none");

  // Function to fetch random ASCII art
  const fetchRandomArt = async (): Promise<string | null> => {
    try {
      const response = await fetch("/api/random-ascii-art");
      const data = await response.json();
      analytics.trackRandomAscii(data.category);
      return data.art || null;
    } catch (error) {
      console.error("Failed to fetch random ASCII art:", error);
      return null;
    }
  };

  // Escape HTML for display
  const escapeHtml = (text: string): string => {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  // Prefetch multiple pieces of art
  const prefetchArt = async (count: number = 3) => {
    const promises = Array(count).fill(null).map(() => fetchRandomArt());
    const results = await Promise.all(promises);
    const validArt = results.filter((art): art is string => art !== null).map((
      art,
    ) => escapeHtml(art)); // Just escape, don't modify the art at all
    setArtCache(validArt);
    if (validArt.length > 0) {
      setWelcomeArt(validArt[0]);
    }
  };

  // Shuffle to next cached art or fetch new with loading state
  const shuffleArt = () => {
    sounds.click();
    setIsLoadingArt(true);
    setWelcomeArt(""); // Clear current art to show loading cursor
    setSelectedWelcomeColor("none"); // Reset color selection

    // Brief loading delay for satisfaction
    setTimeout(() => {
      if (artCache.length > 1) {
        // Use next cached piece
        const [_current, ...rest] = artCache;
        setWelcomeArt(rest[0]); // Already trimmed and escaped
        setWelcomeArtColorized(""); // Clear colorized version
        setArtCache(rest);
        setIsLoadingArt(false);
        // Prefetch one more to keep cache full
        fetchRandomArt().then((art) => {
          if (art) setArtCache((prev) => [...prev, escapeHtml(art)]);
        });
      } else {
        // Fetch fresh if cache empty
        prefetchArt(3).then(() => setIsLoadingArt(false));
      }
    }, 300); // 300ms loading delay
  };

  // Apply color effect to welcome art
  const applyColorToWelcomeArt = (effect: string) => {
    setSelectedWelcomeColor(effect);
    sounds.click();

    if (effect === "none" || !welcomeArt) {
      setWelcomeArtColorized("");
      return;
    }

    const colorized = applyColorToArt(welcomeArt, effect);
    setWelcomeArtColorized(colorized);
  };

  // Load and prefetch ASCII art on mount
  useEffect(() => {
    prefetchArt(3);
  }, []);

  // Check if all three dropdowns have been changed from default
  useEffect(() => {
    const allHaveChanged = fontChanged && colorChanged && borderChanged;
    if (allHaveChanged && !allSelected) {
      setAllSelected(true);
      sounds.success(); // Play success sound on wiggle!
      // Trigger wiggle animation
      setTimeout(() => setAllSelected(false), 600);
    }
  }, [fontChanged, colorChanged, borderChanged]);


  const generateAscii = async () => {
    if (!inputText.value.trim()) {
      setAsciiOutput("");
      setHtmlOutput("");
      return;
    }

    setIsGenerating(true);
    try {
      // Always use enhanced-figlet API which has all the features
      const apiEndpoint = "/api/enhanced-figlet";

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: inputText.value.slice(0, 30),
          font: selectedFont.value,
          effect: colorEffect.value,
          borderStyle: borderStyle.value,
          color: "#00FF41", // Default green color
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAsciiOutput(data.ascii);
        setHtmlOutput(data.html || data.ascii);
        sounds.success();
        analytics.trackAsciiGenerated(
          selectedFont.value,
          colorEffect.value,
          true,
        );
      } else {
        throw new Error(data.error || "Failed to generate ASCII text");
      }
    } catch (error) {
      console.error("Error generating ASCII text:", error);
      setAsciiOutput("Error: Could not generate ASCII text");
      sounds.error();
      analytics.trackAsciiGenerated(
        selectedFont.value,
        colorEffect.value,
        false,
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-generate on input change with debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      generateAscii();
    }, 300);

    return () => clearTimeout(timeout);
  }, [
    inputText.value,
    selectedFont.value,
    colorEffect.value,
    borderStyle.value,
  ]);

  // Apply color effect to welcome art when COLOR dropdown changes
  useEffect(() => {
    if (welcomeArt && !asciiOutput) {
      applyColorToWelcomeArt(colorEffect.value);
    }
  }, [colorEffect.value, welcomeArt]);


  return (
    <div class="max-w-6xl mx-auto px-4 py-8">
      {/* Text Input Section */}
      <div class="mb-8">
        <div class="relative">
          <input
            id="ascii-text-input"
            type="text"
            value={inputText.value}
            onInput={(e) => {
              inputText.value = (e.target as HTMLInputElement).value;
            }}
            placeholder="Type something magical... ✨"
            maxLength={20}
            class="w-full px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-5 border-3 sm:border-4 rounded-2xl sm:rounded-3xl font-mono text-lg sm:text-xl md:text-2xl font-black focus:outline-none transition-all hover:scale-[1.005] focus:scale-[1.01] shadow-brutal"
            style="background-color: var(--color-secondary, #FFE5B4); border-color: var(--color-border, #0A0A0A); color: var(--color-text, #0A0A0A);"
          />
          <div class="absolute right-4 sm:right-6 md:right-8 top-1/2 -translate-y-1/2">
            <span
              class="font-mono font-black text-base sm:text-lg md:text-xl"
              style="color: var(--color-accent, #FF69B4)"
            >
              {inputText.value.length}/20
            </span>
          </div>
        </div>
      </div>

      {/* ASCII FACTORY JUKEBOX - Three Dropdown Combo Machine! */}
      <div class="mb-8">
        {/* Three Dropdown Reels - Stacked on mobile, horizontal on tablet+ */}
        <div
          class={`grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6 ${
            allSelected ? "animate-wiggle" : ""
          }`}
        >
          {/* Font Dropdown */}
          <MagicDropdown
            label="Font"
            options={FIGLET_FONTS}
            value={selectedFont.value}
            onChange={(value) => {
              selectedFont.value = value;
              setFontChanged(true);
            }}
            changed={fontChanged}
          />

          {/* Color Dropdown */}
          <MagicDropdown
            label="Color"
            options={COLOR_EFFECTS}
            value={colorEffect.value}
            onChange={(value) => {
              colorEffect.value = value;
              setColorChanged(true);
            }}
            changed={colorChanged}
          />

          {/* Border Dropdown */}
          <MagicDropdown
            label="Border"
            options={BORDER_STYLES}
            value={borderStyle.value}
            onChange={(value) => {
              borderStyle.value = value;
              setBorderChanged(true);
            }}
            changed={borderChanged}
          />
        </div>
      </div>

      {/* Terminal Display */}
      <div class="mb-10">
        <TerminalDisplay
          content={asciiOutput || welcomeArt}
          htmlContent={asciiOutput
            ? (colorEffect.value === "none"
              ? asciiOutput.replace(/</g, "&lt;").replace(/>/g, "&gt;")
              : htmlOutput)
            : (welcomeArtColorized || welcomeArt)}
          isLoading={isLoadingArt && !welcomeArt && !asciiOutput}
          filename={inputText.value.toLowerCase().replace(/[^a-z0-9]/g, "-") ||
            "ascii-art"}
          onShuffle={!asciiOutput && welcomeArt ? shuffleArt : undefined}
          showShuffleButton={!asciiOutput && Boolean(welcomeArt)}
          terminalPath="~/output/text-art.txt"
        />
      </div>


      <style>
        {`
        /* Shine/Bloop Animation - Warm and affirmatory! */
        @keyframes shine {
          0% {
            transform: scale(1);
            box-shadow: 0 0 0 rgba(255, 105, 180, 0);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 30px rgba(255, 105, 180, 0.6), 0 0 60px rgba(255, 255, 180, 0.3);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 rgba(255, 105, 180, 0);
          }
        }

        .animate-wiggle {
          animation: shine 0.6s ease-out;
        }

        /* Breathing Input Animation */
        @keyframes breathe {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 rgba(255, 105, 180, 0); }
          50% { transform: scale(1.01); box-shadow: 0 0 20px rgba(255, 105, 180, 0.1); }
        }

        input:focus {
          animation: breathe 2s ease-in-out infinite;
        }

        /* Brutal Shadows - Chunky and bold */
        .shadow-brutal {
          box-shadow: 4px 4px 0 var(--color-border, #0A0A0A);
        }
      `}
      </style>
    </div>
  );
}
