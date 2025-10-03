import { useEffect, useState } from "preact/hooks";
import { sounds } from "../utils/sounds.ts";
import { analytics } from "../utils/analytics.ts";
import { COLOR_EFFECTS } from "../utils/constants.ts";
import { MagicDropdown } from "../components/MagicDropdown.tsx";

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
  const [colorizedArt, setColorizedArt] = useState<string>("");
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [artCache, setArtCache] = useState<string[]>([]);
  const [isLoadingArt, setIsLoadingArt] = useState(false);
  const [mobileExportOpen, setMobileExportOpen] = useState(false);

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
      applyColorEffect(currentArt, selectedColor);
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
        if (typeof analytics?.track === "function") {
          analytics.track("gallery_fetch", {
            category: selectedCategory,
          });
        }
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

  // Color effect calculation (same as TextToAscii)
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
        const hue = 180 + (progress * 30);
        const sat = 70 + (progress * 20);
        const bright = 50 + (progress * 20);
        return `hsl(${hue}, ${sat}%, ${bright}%)`;
      }
      case "neon": {
        const progress = (x + y) / (lineWidth + totalLines);
        const hue = 60 + Math.sin(progress * 10) * 120;
        const sat = 100;
        const bright = 60 + Math.sin(progress * 8) * 15;
        return `hsl(${hue}, ${sat}%, ${bright}%)`;
      }
      case "poison": {
        const progress = (x + y) / (lineWidth + totalLines);
        const hue = 90 + (progress * 30);
        const sat = 90 + Math.sin(x * 0.5) * 10;
        const bright = 45 + (progress * 20);
        return `hsl(${hue}, ${sat}%, ${bright}%)`;
      }
      default:
        return "#00FF41";
    }
  };

  const applyColorEffect = (art: string, effect: string) => {
    if (effect === "none" || !art) {
      setColorizedArt("");
      return;
    }

    // Apply color effect client-side like TextToAscii does
    const lines = art.split("\n");
    const colorizedLines: string[] = [];

    for (let y = 0; y < lines.length; y++) {
      const line = lines[y];

      // Calculate color for this line
      const color = getEffectColor(
        effect,
        Math.floor(line.length / 2),
        y,
        line.length,
        lines.length,
      );

      // Wrap entire line in colored span
      colorizedLines.push(`<span style="color: ${color};">${line}</span>`);
    }

    setColorizedArt(colorizedLines.join("\n"));
  };

  const copyToClipboard = async (format = "email") => {
    analytics.trackExport(format === "email" ? "html" : "plain");
    try {
      // Strip ANSI codes for plain text
      const plainText = currentArt.replace(/\u001b\[[0-9;]*m/g, "");

      let textToCopy = plainText;
      let htmlToCopy = "";

      if (format === "email") {
        // Rich HTML for email (Gmail, Outlook, etc.)
        htmlToCopy = colorizedArt && colorizedArt.includes("<span")
          ? `<pre style="font-family: 'Courier New', 'Monaco', 'Menlo', monospace; white-space: pre; line-height: 1.2; font-size: 12px; margin: 0; background: black; color: white; padding: 8px; border-radius: 4px;">${colorizedArt}</pre>`
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
      sounds.copy();
      setTimeout(() => {
        setCopiedToClipboard(false);
      }, 2000);
    } catch (err) {
      sounds.error();
      alert("Copy failed. Try again.");
    }
  };

  const downloadText = () => {
    analytics.trackExport("text");
    // Strip HTML tags and ANSI codes for plain text download
    let plainText = currentArt;

    // If it contains HTML, extract just the text
    if (colorizedArt && colorizedArt.includes("<span")) {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = colorizedArt;
      plainText = tempDiv.textContent || tempDiv.innerText || "";
    }

    // Also strip any remaining ANSI codes
    plainText = plainText.replace(/\u001b\[[0-9;]*m/g, "");

    const blob = new Blob([plainText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ascii-art.txt";
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

      // Create filename
      const filename = "ascii-art";

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
        <MagicDropdown
          label="Theme"
          options={CATEGORIES}
          value={selectedCategory}
          onChange={setSelectedCategory}
          width="w-64"
        />

        {/* Color Effect Selector */}
        <MagicDropdown
          label="Color"
          options={COLOR_EFFECTS}
          value={selectedColor}
          onChange={setSelectedColor}
          width="w-64"
        />

        {/* Shuffle Button */}
        <div>
          <label
            class="block text-xs font-mono font-bold mb-2 uppercase tracking-wide opacity-0"
            style="color: var(--color-text, #0A0A0A)"
          >
            _
          </label>
          <button
            onClick={shuffleArt}
            disabled={isLoadingArt}
            class="px-6 py-3 border-4 rounded-lg font-mono font-bold shadow-brutal transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style="background-color: var(--color-accent, #FF69B4); color: var(--color-base, #FAF9F6); border-color: var(--color-border, #0A0A0A)"
          >
            {isLoadingArt ? "🎲 Loading..." : "🎲 Shuffle"}
          </button>
        </div>
      </div>

      {/* Terminal Display - matching TextToAscii exactly */}
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
              <span class="text-xs font-mono opacity-60" style="color: #00FF41">
                ~/gallery/ascii-art.txt
              </span>
              {/* Shuffle button in menu bar */}
              {currentArt && (
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
            class="p-4 sm:p-6 md:p-8 overflow-auto custom-scrollbar transition-all duration-700"
            style={currentArt
              ? "height: auto; min-height: 400px; max-height: 600px; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);"
              : "min-height: 400px; max-height: 600px; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);"}
          >
            {isLoadingArt && !currentArt
              ? (
                <div class="flex items-center justify-center h-96">
                  <div class="animate-pulse font-mono" style="color: #00FF41">
                    Loading ASCII magic...
                  </div>
                </div>
              )
              : selectedColor !== "none" && colorizedArt
              ? (
                <pre
                  class="ascii-display font-mono text-base opacity-85"
                  style="color: #00FF41; line-height: 1.4; white-space: pre; margin: 0; padding: 0; display: block; text-align: left; text-indent: 0; letter-spacing: 0.8px; font-weight: 900; text-shadow: 0 0 1px currentColor; filter: saturate(1.3);"
                  dangerouslySetInnerHTML={{ __html: colorizedArt }}
                />
              )
              : (
                <pre
                  class="ascii-display font-mono text-base opacity-85"
                  style="color: #00FF41; line-height: 1.4; white-space: pre; margin: 0; padding: 0; display: block; text-align: left; text-indent: 0; letter-spacing: 0.8px; font-weight: 900; text-shadow: 0 0 1px currentColor; filter: saturate(1.3);"
                >
                {currentArt}
                </pre>
              )}
          </div>

          {/* Export Buttons - positioned absolute like TextToAscii */}
          {currentArt && (
            <>
              {/* Mobile: Single Export Dropdown */}
              <div class="sm:hidden absolute bottom-6 right-6 z-10 animate-pop-in">
                <div class="relative">
                  <button
                    onClick={() => {
                      sounds.click();
                      setMobileExportOpen(!mobileExportOpen);
                    }}
                    class="px-4 py-3 border-3 rounded-xl font-mono font-black shadow-brutal-lg transition-all hover:shadow-brutal-xl active:scale-95"
                    style="background-color: var(--color-accent, #FF69B4); color: var(--color-base, #FAF9F6); border-color: var(--color-border, #0A0A0A);"
                  >
                    📤 Export
                  </button>
                  {mobileExportOpen && (
                    <div
                      class="absolute bottom-full right-0 mb-2 border-3 rounded-xl overflow-hidden shadow-brutal-lg animate-dropdown-open"
                      style="background-color: var(--color-base, #FAF9F6); border-color: var(--color-border, #0A0A0A);"
                    >
                      <button
                        onClick={() => {
                          downloadPNG();
                          setMobileExportOpen(false);
                        }}
                        class="w-full px-4 py-3 font-mono font-bold text-left hover:bg-opacity-80 transition-colors"
                        style="background-color: var(--color-secondary, #FFE5B4); color: var(--color-text, #0A0A0A);"
                      >
                        🖼️ PNG
                      </button>
                      <button
                        onClick={() => {
                          downloadText();
                          setMobileExportOpen(false);
                        }}
                        class="w-full px-4 py-3 font-mono font-bold text-left hover:bg-opacity-80 transition-colors border-t-2"
                        style="background-color: var(--color-secondary, #FFE5B4); color: var(--color-text, #0A0A0A); border-color: var(--color-border, #0A0A0A);"
                      >
                        💾 TXT
                      </button>
                      <button
                        onClick={() => {
                          copyToClipboard("email");
                          setMobileExportOpen(false);
                        }}
                        class="w-full px-4 py-3 font-mono font-bold text-left hover:bg-opacity-80 transition-colors border-t-2"
                        style={copiedToClipboard
                          ? "background-color: #4ADE80; color: #0A0A0A; border-color: var(--color-border, #0A0A0A);"
                          : "background-color: var(--color-accent, #FF69B4); color: var(--color-base, #FAF9F6); border-color: var(--color-border, #0A0A0A);"}
                      >
                        {copiedToClipboard ? "✅ COPIED!" : "📋 COPY"}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Desktop: Three Button Layout */}
              <div class="hidden sm:flex absolute bottom-6 right-6 z-10 gap-3 animate-pop-in">
                <button
                  onClick={downloadPNG}
                  class="px-5 py-3 border-4 rounded-2xl font-mono font-black shadow-brutal-lg transition-all hover:shadow-brutal-xl hover:-translate-y-1 active:translate-y-0"
                  style="background-color: var(--color-secondary, #FFE5B4); color: var(--color-text, #0A0A0A); border-color: var(--color-border, #0A0A0A);"
                  title="Download as PNG image"
                >
                  🖼️ PNG
                </button>
                <button
                  onClick={downloadText}
                  class="px-5 py-3 border-4 rounded-2xl font-mono font-black shadow-brutal-lg transition-all hover:shadow-brutal-xl hover:-translate-y-1 active:translate-y-0"
                  style="background-color: var(--color-secondary, #FFE5B4); color: var(--color-text, #0A0A0A); border-color: var(--color-border, #0A0A0A);"
                  title="Download as text file"
                >
                  💾 TXT
                </button>
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
            </>
          )}
        </div>
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

      <style>
        {`
        /* Pop-in animation for export buttons */
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

        /* Brutal shadows - chunky and bold */
        .shadow-brutal-lg {
          box-shadow: 6px 6px 0 var(--color-border, #0A0A0A);
        }

        .shadow-brutal-xl {
          box-shadow: 8px 8px 0 var(--color-border, #0A0A0A);
        }

        .hover\\:shadow-brutal-xl:hover {
          box-shadow: 8px 8px 0 var(--color-border, #0A0A0A);
        }

        /* Transform utilities */
        .hover\\:-translate-y-1:hover {
          transform: translateY(-4px);
        }

        .active\\:translate-y-0:active {
          transform: translateY(0);
        }

        /* Custom Scrollbar for output terminal */
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
      `}
      </style>
    </div>
  );
}
