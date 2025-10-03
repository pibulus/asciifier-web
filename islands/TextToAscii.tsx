import { useSignal } from "@preact/signals";
import { useEffect, useRef, useState } from "preact/hooks";
import { sounds } from "../utils/sounds.ts";
import { analytics } from "../utils/analytics.ts";
import { SimpleTypeWriter } from "../utils/simple-typewriter.js";
import { COLOR_EFFECTS } from "../utils/constants.ts";
import { MagicDropdown } from "../components/MagicDropdown.tsx";

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
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [copiedFormat, setCopiedFormat] = useState("");
  const [welcomeArt, setWelcomeArt] = useState<string>("");
  const [artCache, setArtCache] = useState<string[]>([]);
  const [isLoadingArt, setIsLoadingArt] = useState(false);
  const [welcomeArtColorized, setWelcomeArtColorized] = useState<string>("");
  const [selectedWelcomeColor, setSelectedWelcomeColor] = useState<string>(
    "none",
  );

  // Dropdown states
  const [fontDropdownOpen, setFontDropdownOpen] = useState(false);
  const [colorDropdownOpen, setColorDropdownOpen] = useState(false);
  const [borderDropdownOpen, setBorderDropdownOpen] = useState(false);
  const [allSelected, setAllSelected] = useState(false);
  const [fontChanged, setFontChanged] = useState(false);
  const [colorChanged, setColorChanged] = useState(false);
  const [borderChanged, setBorderChanged] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

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
  const applyColorToWelcomeArt = async (effect: string) => {
    setSelectedWelcomeColor(effect);
    sounds.click();

    if (effect === "none" || !welcomeArt) {
      setWelcomeArtColorized("");
      return;
    }

    try {
      // Use the same colorization API
      const response = await fetch("/api/enhanced-figlet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "TEMP", // Dummy text, we'll replace with art
          effect,
          color: "#00FF41",
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Apply the color effect to our ASCII art manually
        // This is a simple approach - just wrap each non-space char in a colored span
        const lines = welcomeArt.split("\n");
        const colorizedLines: string[] = [];

        for (let y = 0; y < lines.length; y++) {
          const line = lines[y];

          // Calculate color for this line (use middle of line for consistent color)
          const color = getEffectColor(
            effect,
            Math.floor(line.length / 2),
            y,
            line.length,
            lines.length,
          );

          // Wrap entire line in one span (no HTML escaping needed - ASCII art is safe)
          colorizedLines.push(`<span style="color: ${color};">${line}</span>`);
        }

        setWelcomeArtColorized(colorizedLines.join("\n"));
      }
    } catch (error) {
      console.error("Failed to colorize welcome art:", error);
    }
  };

  // Color effect calculation (same as server-side)
  const getEffectColor = (
    effect: string,
    x: number,
    y: number,
    lineWidth: number,
    totalLines: number,
  ): string => {
    switch (effect) {
      case "unicorn": {
        const hue = (x * 360 / lineWidth) % 360;
        return `hsl(${hue}, 95%, 65%)`;
      }
      case "fire": {
        const hue = 60 - (y * 60 / totalLines);
        const sat = 100 - (y * 20 / totalLines);
        return `hsl(${hue}, ${sat}%, 55%)`;
      }
      case "cyberpunk": {
        const progress = (x + y) / (lineWidth + totalLines);
        const hue = 320 - (progress * 140);
        return `hsl(${hue}, 100%, 60%)`;
      }
      case "sunrise": {
        const progress = y / totalLines;
        const hue = 330 + (progress * 60);
        const sat = 85 + (progress * 15);
        const bright = 60 + (progress * 20);
        return `hsl(${hue}, ${sat}%, ${bright}%)`;
      }
      case "vaporwave": {
        const progress = y / totalLines;
        const hue = 280 + (progress * 80);
        const sat = 80 + Math.sin((x + y) * 0.3) * 15;
        const bright = 65 + Math.sin(x * 0.4) * 10;
        return `hsl(${hue}, ${sat}%, ${bright}%)`;
      }
      case "chrome": {
        const hue = 200 + Math.sin(x * 0.2) * 60;
        const brightness = 70 + Math.sin(y * 0.3) * 20;
        return `hsl(${hue}, 30%, ${brightness}%)`;
      }
      case "ocean": {
        const progress = y / totalLines;
        const hue = 180 + (progress * 30); // Cyan (180) → Blue (210)
        const sat = 70 + (progress * 20);
        const bright = 50 + (progress * 20);
        return `hsl(${hue}, ${sat}%, ${bright}%)`;
      }
      case "neon": {
        const progress = (x + y) / (lineWidth + totalLines);
        const hue = 60 + Math.sin(progress * 10) * 120; // Yellow/Green/Pink oscillation
        const sat = 100;
        const bright = 60 + Math.sin(progress * 8) * 15;
        return `hsl(${hue}, ${sat}%, ${bright}%)`;
      }
      case "poison": {
        const progress = (x + y) / (lineWidth + totalLines);
        const hue = 90 + (progress * 30); // Lime green (90) → Yellow-green (120)
        const sat = 90 + Math.sin(x * 0.5) * 10;
        const bright = 45 + (progress * 20);
        return `hsl(${hue}, ${sat}%, ${bright}%)`;
      }
      default:
        return "#00FF41";
    }
  };

  // Hero gallery for welcome screen (curated examples)
  const [heroGalleryIndex, setHeroGalleryIndex] = useState(0);
  const [showHeroGallery, setShowHeroGallery] = useState(true);

  const HERO_GALLERY = [
    `       .
.>   )\\;'a__
(  _ _)/ /-." ~~
 \`( )_ )/
  <_  <_`,
    ` /\\_/\\
( o o )
==_Y_==
  \`-'`,
    `   |\\---/|
   | ,_, |
    \\_\`_/-..----.
 ___/ \`   ' ,""+ \\
(___...'   __\\    |\`.___.';
  (___,'(___,\`___()/'.....+`,
  ];

  // Load and prefetch ASCII art on mount
  useEffect(() => {
    prefetchArt(3);
  }, []);

  // Hero gallery auto-rotation (every 3 seconds)
  useEffect(() => {
    if (!showHeroGallery || !welcomeArt) return;

    const interval = setInterval(() => {
      setHeroGalleryIndex((prev) => (prev + 1) % HERO_GALLERY.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [showHeroGallery, welcomeArt]);

  // Hide hero gallery once random art loads
  useEffect(() => {
    if (welcomeArt) {
      setTimeout(() => setShowHeroGallery(false), 500);
    }
  }, [welcomeArt]);

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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setFontDropdownOpen(false);
      setColorDropdownOpen(false);
      setBorderDropdownOpen(false);
      setExportMenuOpen(false);
    };

    if (
      fontDropdownOpen || colorDropdownOpen || borderDropdownOpen ||
      exportMenuOpen
    ) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [fontDropdownOpen, colorDropdownOpen, borderDropdownOpen, exportMenuOpen]);

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

  const copyToClipboard = async (format = "email") => {
    analytics.trackExport(format === "email" ? "html" : "plain");
    try {
      // Strip ANSI codes for plain text
      const plainText = asciiOutput.replace(/\u001b\[[0-9;]*m/g, "");

      let textToCopy = plainText;
      let htmlToCopy = "";

      if (format === "email") {
        // Rich HTML for email (Gmail, Outlook, etc.)
        htmlToCopy = htmlOutput.includes("<span")
          ? `<pre style="font-family: 'Courier New', 'Monaco', 'Menlo', monospace; white-space: pre; line-height: 1.2; font-size: 12px; margin: 0; background: black; color: white; padding: 8px; border-radius: 4px;">${htmlOutput}</pre>`
          : `<pre style="font-family: 'Courier New', 'Monaco', 'Menlo', monospace; white-space: pre; line-height: 1.2; font-size: 12px; margin: 0;">${plainText}</pre>`;
        textToCopy = plainText;
      } else if (format === "message") {
        // Wrapped in backticks for messaging apps (Discord, WhatsApp, Slack)
        textToCopy = `\`\`\`\n${plainText}\n\`\`\``;
        htmlToCopy = `<pre>${textToCopy}</pre>`;
      } else {
        // Plain text
        textToCopy = plainText;
      }

      // Try modern clipboard API with both formats
      if (navigator.clipboard && navigator.clipboard.write && htmlToCopy) {
        const clipboardItem = new ClipboardItem({
          "text/plain": new Blob([textToCopy], { type: "text/plain" }),
          "text/html": new Blob([htmlToCopy], { type: "text/html" }),
        });
        await navigator.clipboard.write([clipboardItem]);
      } else {
        // Fallback for older browsers - just plain text
        await navigator.clipboard.writeText(textToCopy);
      }

      setCopiedToClipboard(true);
      setCopiedFormat(format);
      sounds.copy();
      setTimeout(() => {
        setCopiedToClipboard(false);
        setCopiedFormat("");
      }, 2000);
    } catch (err) {
      sounds.error();
      alert("Copy failed. Try again.");
    }
  };

  const downloadText = () => {
    analytics.trackExport("text");
    // Strip HTML tags and ANSI codes for plain text download
    let plainText = asciiOutput;

    // If it contains HTML, extract just the text
    if (plainText.includes("<span")) {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = plainText;
      plainText = tempDiv.textContent || tempDiv.innerText || "";
    }

    // Also strip any remaining ANSI codes
    plainText = plainText.replace(/\u001b\[[0-9;]*m/g, "");

    const blob = new Blob([plainText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${
      inputText.value.toLowerCase().replace(/[^a-z0-9]/g, "-") || "ascii-art"
    }.txt`;
    a.click();
    URL.revokeObjectURL(url);
    sounds.success();
  };

  const downloadPNG = () => {
    analytics.trackExport("png");
    try {
      // Get the ASCII display element
      const asciiElement = document.querySelector(".ascii-display");
      if (!asciiElement) {
        console.error("ASCII display element not found");
        return;
      }

      // Parse HTML to extract text and colors character by character
      type CharData = { char: string; color: string };
      type LineData = { chars: CharData[] };
      const lines: LineData[] = [];
      let currentLine: CharData[] = [];

      // Function to extract color from a span element
      const getColorFromElement = (element: Element): string => {
        if (element.tagName === "SPAN") {
          const style = (element as HTMLElement).style.color;
          if (style) return style;
        }
        return "#00FF41"; // Default green
      };

      // Process HTML content recursively
      const processNode = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent || "";
          const parentColor = node.parentElement
            ? getColorFromElement(node.parentElement)
            : "#00FF41";

          for (const char of text) {
            if (char === "\n") {
              if (currentLine.length > 0) {
                lines.push({ chars: currentLine });
                currentLine = [];
              }
            } else {
              currentLine.push({ char, color: parentColor });
            }
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement;

          if (element.tagName === "BR") {
            if (currentLine.length > 0) {
              lines.push({ chars: currentLine });
              currentLine = [];
            }
          } else if (
            element.tagName === "SPAN" && element.childNodes.length === 1 &&
            element.childNodes[0].nodeType === Node.TEXT_NODE
          ) {
            // Direct span with text
            const text = element.textContent || "";
            const color = getColorFromElement(element);

            for (const char of text) {
              if (char === "\n") {
                if (currentLine.length > 0) {
                  lines.push({ chars: currentLine });
                  currentLine = [];
                }
              } else {
                currentLine.push({ char, color });
              }
            }
          } else {
            // Recursively process children
            for (const child of Array.from(node.childNodes)) {
              processNode(child);
            }
          }
        }
      };

      // Process all child nodes
      Array.from(asciiElement.childNodes).forEach(processNode);

      // Add remaining line
      if (currentLine.length > 0) {
        lines.push({ chars: currentLine });
      }

      // Keep only non-empty lines
      const nonEmptyLines = lines.filter((line) =>
        line.chars.some((c) => c.char.trim().length > 0)
      );

      if (nonEmptyLines.length === 0) {
        console.error("No ASCII text found");
        return;
      }

      // Calculate canvas dimensions
      const fontSize = 12;
      const charWidth = fontSize * 0.6;
      const lineHeight = fontSize * 1.2;
      const padding = 40;

      // Find the maximum line width
      const maxLineLength = Math.max(
        ...nonEmptyLines.map((line) => line.chars.length),
      );

      const canvasWidth = (maxLineLength * charWidth) + (padding * 2);
      const canvasHeight = (nonEmptyLines.length * lineHeight) + (padding * 2);

      // Create high-DPI canvas
      const canvas = document.createElement("canvas");
      const scale = 2;
      canvas.width = canvasWidth * scale;
      canvas.height = canvasHeight * scale;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        console.error("Could not get canvas context");
        return;
      }

      // Scale for high DPI
      ctx.scale(scale, scale);

      // Fill black background
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Set font
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";

      // Draw each character with its exact color
      nonEmptyLines.forEach((line, lineIndex) => {
        const y = padding + (lineIndex * lineHeight);

        line.chars.forEach((charData, charIndex) => {
          const x = padding + (charIndex * charWidth);

          // Use the exact color from the HTML
          ctx.fillStyle = charData.color;
          ctx.fillText(charData.char, x, y);
        });
      });

      // Create filename from input text
      const filename =
        inputText.value.toLowerCase().replace(/[^a-z0-9]/g, "-") || "ascii-art";

      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error("Failed to create blob");
          sounds.error();
          alert("Failed to generate PNG. Please try again.");
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${filename}.png`;
        a.click();
        URL.revokeObjectURL(url);
        sounds.success();
      }, "image/png");
    } catch (error) {
      console.error("Error generating PNG:", error);
      sounds.error();
      alert("Failed to export as PNG. Please try again.");
    }
  };

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
            class="w-full px-8 py-5 border-4 rounded-3xl font-mono text-2xl font-black focus:outline-none transition-all hover:scale-[1.005] focus:scale-[1.01] shadow-brutal"
            style="background-color: var(--color-secondary, #FFE5B4); border-color: var(--color-border, #0A0A0A); color: var(--color-text, #0A0A0A);"
          />
          <div class="absolute right-8 top-1/2 -translate-y-1/2">
            <span
              class="font-mono font-bold text-lg"
              style="color: var(--color-accent, #FF69B4)"
            >
              {inputText.value.length}/20
            </span>
          </div>
        </div>
      </div>

      {/* ASCII FACTORY JUKEBOX - Three Dropdown Combo Machine! */}
      <div class="mb-8">
        {/* Three Dropdown Reels - Horizontal on all screens */}
        <div
          class={`grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 ${
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

      {/* Terminal Display - Always visible */}
      <div class="mb-10">
        <div
          class="rounded-3xl border-4 shadow-brutal overflow-hidden relative"
          style="background-color: #000000; border-color: var(--color-border, #0A0A0A);"
        >
          <div
            class="px-4 py-3 border-b-4 flex items-center justify-between"
            style="background-color: rgba(0,0,0,0.3); border-color: var(--color-border, #0A0A0A)"
          >
            <div class="flex space-x-2">
              <div
                class="w-3 h-3 bg-red-500 rounded-full hover:scale-125 transition-transform cursor-pointer"
                title="Close (jk)"
              >
              </div>
              <div
                class="w-3 h-3 bg-yellow-500 rounded-full hover:scale-125 transition-transform cursor-pointer"
                title="Minimize (nope)"
              >
              </div>
              <div
                class="w-3 h-3 bg-green-500 rounded-full hover:scale-125 transition-transform cursor-pointer"
                title="Full screen (maybe)"
              >
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-xs font-mono opacity-60">
                ~/output/text-art.txt
              </span>
              {/* Shuffle button in menu bar - only for welcome art */}
              {!asciiOutput && welcomeArt && (
                <button
                  onClick={shuffleArt}
                  class="px-2 py-1 text-xs font-mono font-bold transition-all hover:scale-110 active:scale-95 opacity-70 hover:opacity-100"
                  style="color: #00FF41"
                  title="Get a random ASCII art"
                >
                  🎲
                </button>
              )}
            </div>
          </div>
          <div
            class="p-8 overflow-auto custom-scrollbar transition-all duration-700"
            style={asciiOutput
              ? "height: 320px; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);"
              : "min-height: 320px; max-height: 600px; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);"}
          >
            {asciiOutput
              ? (
                <pre
                  class="ascii-display leading-tight"
                  style="color: #00FF41; font-size: clamp(0.6rem, 1.4vw, 0.9rem); font-family: monospace;"
                  dangerouslySetInnerHTML={{
                    __html: colorEffect.value === "none"
                      ? asciiOutput.replace(/</g, "&lt;").replace(/>/g, "&gt;")
                      : (htmlOutput ||
                        asciiOutput.replace(/</g, "&lt;").replace(
                          />/g,
                          "&gt;",
                        )),
                  }}
                />
              )
              : (
                <div class="flex flex-col items-start justify-start h-full">
                  {welcomeArt
                    ? (
                      <pre
                        class="ascii-display font-mono text-base opacity-85 animate-fade-in"
                        style="color: #00FF41; line-height: 1.4; white-space: pre; margin: 0; padding: 0; display: block; text-align: left; text-indent: 0; letter-spacing: 0.8px; font-weight: 900; text-shadow: 0 0 1px currentColor; filter: saturate(1.3);"
                        dangerouslySetInnerHTML={{
                          __html: welcomeArtColorized || welcomeArt,
                        }}
                      />
                    )
                    : showHeroGallery
                    ? (
                      <div class="flex flex-col items-center justify-center w-full h-full space-y-4">
                        <pre
                          class="ascii-display font-mono text-sm opacity-70 animate-fade-in"
                          style="color: #00FF41; line-height: 1.2; white-space: pre; text-align: center;"
                        >
                          {HERO_GALLERY[heroGalleryIndex]}
                        </pre>
                        <div class="flex gap-2">
                          {HERO_GALLERY.map((_, idx) => (
                            <div
                              key={idx}
                              class="w-2 h-2 rounded-full transition-all"
                              style={{
                                backgroundColor: idx === heroGalleryIndex
                                  ? "#00FF41"
                                  : "rgba(0, 255, 65, 0.3)",
                              }}
                            />
                          ))}
                        </div>
                        <p
                          class="text-xs font-mono opacity-50"
                          style="color: #00FF41"
                        >
                          Loading ASCII magic...
                        </p>
                      </div>
                    )
                    : (
                      <div class="flex items-start justify-start w-full pt-2 pl-2">
                        <pre
                          class="font-mono text-lg animate-loading-cursor"
                          style="color: #00FF41;"
                        >
                          <span class="blinking-cursor">█</span>
                        </pre>
                      </div>
                    )}
                </div>
              )}
          </div>

          {/* Floating Export Buttons - Appears when ASCII is ready */}
          {asciiOutput && (
            <div class="absolute bottom-6 right-6 z-10 flex gap-3 animate-pop-in">
              {/* Download PNG */}
              <button
                onClick={downloadPNG}
                class="px-5 py-3 border-4 rounded-2xl font-mono font-black shadow-brutal-lg transition-all hover:shadow-brutal-xl hover:-translate-y-1 active:translate-y-0"
                style="background-color: var(--color-secondary, #FFE5B4); color: var(--color-text, #0A0A0A); border-color: var(--color-border, #0A0A0A);"
                title="Download as PNG image"
              >
                🖼️ PNG
              </button>

              {/* Download TXT */}
              <button
                onClick={downloadText}
                class="px-5 py-3 border-4 rounded-2xl font-mono font-black shadow-brutal-lg transition-all hover:shadow-brutal-xl hover:-translate-y-1 active:translate-y-0"
                style="background-color: var(--color-secondary, #FFE5B4); color: var(--color-text, #0A0A0A); border-color: var(--color-border, #0A0A0A);"
                title="Download as text file"
              >
                💾 TXT
              </button>

              {/* Main Copy Button */}
              <button
                onClick={() => copyToClipboard("email")}
                class={`px-6 py-3 border-4 rounded-2xl font-mono font-black shadow-brutal-lg transition-all hover:shadow-brutal-xl hover:-translate-y-1 active:translate-y-0 ${
                  copiedToClipboard ? "animate-bounce-once" : ""
                }`}
                style={copiedToClipboard
                  ? "background-color: #4ADE80; color: #0A0A0A; border-color: var(--color-border, #0A0A0A);"
                  : "background-color: var(--color-accent, #FF69B4); color: var(--color-base, #FAF9F6); border-color: var(--color-border, #0A0A0A);"}
                title="Copy to clipboard"
              >
                {copiedToClipboard ? "✅ COPIED!" : "📋 COPY"}
              </button>
            </div>
          )}

          {/* Export Buttons for Welcome Art */}
          {!asciiOutput && welcomeArt && (
            <div class="absolute bottom-6 right-6 z-10 flex gap-3 animate-pop-in">
              {/* Download PNG */}
              <button
                onClick={downloadPNG}
                class="px-5 py-3 border-4 rounded-2xl font-mono font-black shadow-brutal-lg transition-all hover:shadow-brutal-xl hover:-translate-y-1 active:translate-y-0"
                style="background-color: var(--color-secondary, #FFE5B4); color: var(--color-text, #0A0A0A); border-color: var(--color-border, #0A0A0A);"
                title="Download as PNG image"
              >
                🖼️ PNG
              </button>

              {/* Download TXT */}
              <button
                onClick={downloadText}
                class="px-5 py-3 border-4 rounded-2xl font-mono font-black shadow-brutal-lg transition-all hover:shadow-brutal-xl hover:-translate-y-1 active:translate-y-0"
                style="background-color: var(--color-secondary, #FFE5B4); color: var(--color-text, #0A0A0A); border-color: var(--color-border, #0A0A0A);"
                title="Download as text file"
              >
                💾 TXT
              </button>

              {/* Copy Button */}
              <button
                onClick={() => copyToClipboard("email")}
                class={`px-6 py-3 border-4 rounded-2xl font-mono font-black shadow-brutal-lg transition-all hover:shadow-brutal-xl hover:-translate-y-1 active:translate-y-0 ${
                  copiedToClipboard ? "animate-bounce-once" : ""
                }`}
                style={copiedToClipboard
                  ? "background-color: #4ADE80; color: #0A0A0A; border-color: var(--color-border, #0A0A0A);"
                  : "background-color: var(--color-accent, #FF69B4); color: var(--color-base, #FAF9F6); border-color: var(--color-border, #0A0A0A);"}
                title="Copy to clipboard"
              >
                {copiedToClipboard ? "✅ COPIED!" : "📋 COPY"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hidden - keeping for structure */}
      {false && (
        <div class="mb-10 animate-slide-up">
          <div
            class="rounded-3xl border-4 shadow-brutal overflow-hidden"
            style="background-color: #000000; border-color: var(--color-border, #0A0A0A);"
          >
            <div
              class="px-4 py-3 border-b-4 flex items-center justify-between"
              style="background-color: rgba(0,0,0,0.3); border-color: var(--color-border, #0A0A0A)"
            >
              <div class="flex space-x-2">
                <div
                  class="w-3 h-3 bg-red-500 rounded-full hover:scale-125 transition-transform cursor-pointer"
                  title="Close (jk)"
                >
                </div>
                <div
                  class="w-3 h-3 bg-yellow-500 rounded-full hover:scale-125 transition-transform cursor-pointer"
                  title="Minimize (nope)"
                >
                </div>
                <div
                  class="w-3 h-3 bg-green-500 rounded-full hover:scale-125 transition-transform cursor-pointer"
                  title="Full screen (maybe)"
                >
                </div>
              </div>
              <span class="text-xs font-mono opacity-60">
                ~/output/text-art.txt
              </span>
            </div>
            <div
              class="p-6 overflow-auto custom-scrollbar"
              style="max-height: 40vh;"
            >
              <pre
                class="ascii-display leading-tight"
                style="color: #00FF41; font-size: clamp(0.6rem, 1.4vw, 0.9rem); font-family: monospace;"
                dangerouslySetInnerHTML={{
                  __html: colorEffect.value === "none"
                    ? asciiOutput.replace(/</g, "&lt;").replace(/>/g, "&gt;")
                    : (htmlOutput ||
                      asciiOutput.replace(/</g, "&lt;").replace(/>/g, "&gt;")),
                }}
              />
            </div>
          </div>
        </div>
      )}

      <style>
        {`
        /* Blinking cursor animation */
        @keyframes blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }

        .blinking-cursor {
          animation: blink 1s infinite;
        }

        /* Pop-in animation for export button */
        @keyframes popIn {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(10px);
          }
          60% {
            transform: scale(1.05) translateY(0);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-pop-in {
          animation: popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        /* Fast slide up for menu */
        @keyframes slideUpFast {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-up-fast {
          animation: slideUpFast 0.2s ease-out;
        }

        /* Dropdown scrollbar styling */
        .dropdown-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .dropdown-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .dropdown-scrollbar::-webkit-scrollbar-thumb {
          background: var(--color-accent, #FF69B4);
          border-radius: 4px;
        }
        .dropdown-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--color-border, #0A0A0A);
        }
        /* Firefox scrollbar */
        .dropdown-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: var(--color-accent, #FF69B4) transparent;
        }

        /* Custom Scrollbar for output terminal only */
        .custom-scrollbar::-webkit-scrollbar {
          width: 12px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1a1a1a;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #00FF41;
          border-radius: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #00CC33;
        }

        /* Slide up animation for output */
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-up {
          animation: slideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        /* Fade in animation */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-in;
        }

        /* Dropdown open animation - light bounce */
        @keyframes dropdownOpen {
          0% {
            opacity: 0;
            transform: translateY(-8px) scale(0.95);
          }
          60% {
            opacity: 1;
            transform: translateY(2px) scale(1.01);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-dropdown-open {
          animation: dropdownOpen 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        /* Whimsical Spring Physics - Real bounce using linear() */
        @keyframes springBounce {
          from { transform: scale(1); }
          to { transform: scale(1.05); }
        }

        .hover\\:animate-spring:hover {
          animation: springBounce 0.6s linear(
            0, 0.006, 0.025, 0.101, 0.539, 0.826,
            0.967, 1.037, 1.078, 1.103, 1.115, 1.118,
            1.114, 1.106, 1.094, 1.08, 1.064, 1.046,
            1.028, 1.01, 0.992, 0.975, 0.959, 0.945,
            0.931, 0.92, 0.91, 0.901, 0.894, 0.888,
            0.883, 0.88, 0.877, 0.875, 0.875, 0.875,
            0.877, 0.88, 0.883, 0.888, 0.893, 0.9,
            0.907, 0.915, 0.924, 0.933, 0.943, 0.954,
            0.964, 0.975, 0.986, 0.996, 1.005, 1.013,
            1.02, 1.026, 1.03, 1.034, 1.036, 1.037,
            1.037, 1.036, 1.034, 1.032, 1.029, 1.026,
            1.024, 1.022, 1.021, 1.02
          ) forwards;
        }

        /* Gentle Pulse for Selected States - Removed to reduce visual noise */
        @keyframes gentlePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.95; }
        }

        .animate-gentle-pulse {
          animation: gentlePulse 2s ease-in-out infinite;
        }

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

        .hover\\:animate-wiggle:hover {
          animation: shine 0.3s ease-out;
        }

        /* Breathing Input Animation */
        @keyframes breathe {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 rgba(255, 105, 180, 0); }
          50% { transform: scale(1.01); box-shadow: 0 0 20px rgba(255, 105, 180, 0.1); }
        }

        input:focus {
          animation: breathe 2s ease-in-out infinite;
        }

        /* Shimmer Effect for Active States */
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .animate-shimmer {
          animation: shimmer 2s linear infinite;
        }

        /* Gooey Hover Morph */
        @keyframes gooeyMorph {
          0%, 100% { border-radius: 0.5rem; }
          25% { border-radius: 0.75rem 0.5rem 0.75rem 0.5rem; }
          50% { border-radius: 1rem 0.5rem 1rem 0.5rem; }
          75% { border-radius: 0.5rem 0.75rem 0.5rem 0.75rem; }
        }

        .hover\\:animate-gooey:hover {
          animation: gooeyMorph 0.8s ease-in-out;
        }

        /* Floating Animation for Layout Sections */
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-2px); }
        }

        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        /* Scale Utilities */
        .hover\\:scale-102:hover { transform: scale(1.02); }
        .hover\\:scale-105:hover { transform: scale(1.05); }
        .scale-105 { transform: scale(1.05); }

        /* Smooth Transitions */
        .transition-spring {
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .transition-gooey {
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        /* Removed magnetic button effect to reduce visual clutter */

        /* Brutal Shadows - Chunky and bold */
        .shadow-brutal {
          box-shadow: 4px 4px 0 var(--color-border, #0A0A0A);
        }

        .shadow-brutal-lg {
          box-shadow: 6px 6px 0 var(--color-border, #0A0A0A);
        }

        .shadow-brutal-xl {
          box-shadow: 8px 8px 0 var(--color-border, #0A0A0A);
        }

        .hover\\:shadow-brutal:hover {
          box-shadow: 4px 4px 0 var(--color-border, #0A0A0A);
        }

        .hover\\:shadow-brutal-lg:hover {
          box-shadow: 6px 6px 0 var(--color-border, #0A0A0A);
        }

        .hover\\:shadow-brutal-xl:hover {
          box-shadow: 8px 8px 0 var(--color-border, #0A0A0A);
        }

        /* Bounce once animation for copy success */
        @keyframes bounceOnce {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(-10px); }
          50% { transform: translateY(0); }
          75% { transform: translateY(-5px); }
        }

        .animate-bounce-once {
          animation: bounceOnce 0.5s ease-out;
        }

        /* Loading cursor animation - moves right then pulses */
        @keyframes loadingCursor {
          0% { transform: translateX(0); }
          50% { transform: translateX(40px); }
          100% { transform: translateX(40px); }
        }

        .animate-loading-cursor {
          animation: loadingCursor 1.5s ease-out;
        }

        /* Fade in animation for ASCII art */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 0.4; transform: translateY(0); }
        }

        .animate-fade-in {
          animation: fadeIn 0.4s ease-out;
        }

        /* Transform utilities */
        .hover\\:-translate-y-1:hover {
          transform: translateY(-4px);
        }

        .active\\:translate-y-0:active {
          transform: translateY(0);
        }

        /* Soft Shadows - kept for other uses */
        .shadow-soft {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        .shadow-soft-lg {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }
      `}
      </style>
    </div>
  );
}
