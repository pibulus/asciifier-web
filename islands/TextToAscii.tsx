import { useSignal } from "@preact/signals";
import { useEffect, useState } from "preact/hooks";
import { sounds } from "../utils/sounds.ts";
import { analytics } from "../utils/analytics.ts";

// Curated figlet fonts - hand-picked fonts for the ASCII Factory!
const FIGLET_FONTS = [
  { name: "Standard", file: "Standard" },
  { name: "Doom", file: "Doom" },
  { name: "Slant", file: "Slant" },
  { name: "Shadow", file: "Shadow" },
  { name: "Ghost", file: "Ghost" },
  { name: "Bloody", file: "Bloody" },
  { name: "Colossal", file: "Colossal" },
  { name: "Isometric3", file: "Isometric3" },
  { name: "Poison", file: "Poison" },
  { name: "Speed", file: "Speed" },
  { name: "Star Wars", file: "Star Wars" },
  { name: "Small", file: "Small" },
  { name: "Chunky", file: "Chunky" },
  { name: "Larry 3D", file: "Larry 3D" },
  { name: "Banner", file: "Banner" },
  { name: "Block", file: "Block" },
  { name: "Big", file: "Big" },
];

// Border styles for ASCII art
const BORDER_STYLES = [
  { name: "None", value: "none" },
  { name: "Single", value: "single" },
  { name: "Double", value: "double" },
  { name: "Block", value: "block" },
];

// Enhanced color effects - fun ones first!
const COLOR_EFFECTS = [
  { name: "Unicorn", value: "unicorn" },
  { name: "Cyberpunk", value: "cyberpunk" },
  { name: "Sunrise", value: "sunrise" },
  { name: "Vaporwave", value: "vaporwave" },
  { name: "Fire", value: "fire" },
  { name: "Bloody", value: "bloody" },
  { name: "Angel", value: "angel" },
  { name: "Chrome", value: "chrome" },
  { name: "Plain", value: "none" },
];

export default function TextToAscii() {
  // Initialize analytics on mount
  useEffect(() => {
    analytics.init();
  }, []);
  const [asciiOutput, setAsciiOutput] = useState<string>("");
  const [htmlOutput, setHtmlOutput] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [copiedFormat, setCopiedFormat] = useState("");
  const [welcomeArt, setWelcomeArt] = useState<string>("");
  const [artCache, setArtCache] = useState<string[]>([]);
  const [isLoadingArt, setIsLoadingArt] = useState(false);

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

    // Brief loading delay for satisfaction
    setTimeout(() => {
      if (artCache.length > 1) {
        // Use next cached piece
        const [_current, ...rest] = artCache;
        setWelcomeArt(rest[0]); // Already trimmed and escaped
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
            type="text"
            value={inputText.value}
            onInput={(e) => {
              sounds.click();
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
        {/* Three Dropdown Reels Side by Side */}
        <div
          class={`grid grid-cols-1 md:grid-cols-3 gap-6 ${
            allSelected ? "animate-wiggle" : ""
          }`}
        >
          {/* Font Dropdown */}
          <div class="relative">
            <label
              class="block mb-2 px-2 font-mono font-bold text-sm uppercase tracking-wider"
              style="color: var(--color-text, #0A0A0A);"
            >
              Font
            </label>
            <div
              class="magic-select w-full px-5 py-4 border-4 rounded-2xl font-mono font-bold cursor-pointer transition-all hover:shadow-brutal hover:-translate-y-0.5"
              style={fontChanged
                ? "background-color: var(--color-accent, #FF69B4); color: var(--color-base, #FAF9F6); border-color: var(--color-border, #0A0A0A);"
                : "background-color: var(--color-secondary, #FFE5B4); border-color: var(--color-border, #0A0A0A); color: var(--color-text, #0A0A0A);"}
              onClick={(e) => {
                e.stopPropagation();
                sounds.click();
                setFontDropdownOpen(!fontDropdownOpen);
                setColorDropdownOpen(false);
                setBorderDropdownOpen(false);
              }}
            >
              <div class="flex items-center justify-between">
                <span class="text-base">
                  {FIGLET_FONTS.find((f) => f.file === selectedFont.value)
                    ?.name || "Standard"}
                </span>
                <span
                  class="text-lg transition-transform"
                  style={`color: var(--color-accent, #FF69B4); transform: rotate(${
                    fontDropdownOpen ? "180" : "0"
                  }deg);`}
                >
                  ▼
                </span>
              </div>
            </div>
            {fontDropdownOpen && (
              <div
                class="absolute z-20 w-full mt-1 border-4 rounded-2xl shadow-brutal-lg overflow-hidden dropdown-scrollbar animate-dropdown-open"
                style="background-color: var(--color-base, #FAF9F6); border-color: var(--color-border, #0A0A0A); max-height: 400px; overflow-y: auto;"
              >
                {FIGLET_FONTS.map((font) => (
                  <div
                    key={font.file}
                    class="px-5 py-3 font-mono font-bold cursor-pointer transition-all hover:pl-7"
                    style={`background-color: ${
                      selectedFont.value === font.file
                        ? "var(--color-accent, #FF69B4)"
                        : "transparent"
                    }; color: ${
                      selectedFont.value === font.file
                        ? "var(--color-base, #FAF9F6)"
                        : "var(--color-text, #0A0A0A)"
                    };`}
                    onClick={() => {
                      sounds.click();
                      selectedFont.value = font.file;
                      setFontChanged(true);
                      setFontDropdownOpen(false);
                    }}
                    onMouseEnter={() => sounds.hover && sounds.hover()}
                  >
                    {selectedFont.value === font.file && (
                      <span class="mr-2">✓</span>
                    )}
                    {font.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Color Dropdown */}
          <div class="relative">
            <label
              class="block mb-2 px-2 font-mono font-bold text-sm uppercase tracking-wider"
              style="color: var(--color-text, #0A0A0A);"
            >
              Color
            </label>
            <div
              class="magic-select w-full px-5 py-4 border-4 rounded-2xl font-mono font-bold cursor-pointer transition-all hover:shadow-brutal hover:-translate-y-0.5"
              style={colorChanged
                ? "background-color: var(--color-accent, #FF69B4); color: var(--color-base, #FAF9F6); border-color: var(--color-border, #0A0A0A);"
                : "background-color: var(--color-secondary, #FFE5B4); border-color: var(--color-border, #0A0A0A); color: var(--color-text, #0A0A0A);"}
              onClick={(e) => {
                e.stopPropagation();
                sounds.click();
                setColorDropdownOpen(!colorDropdownOpen);
                setFontDropdownOpen(false);
                setBorderDropdownOpen(false);
              }}
            >
              <div class="flex items-center justify-between">
                <span class="text-base">
                  {COLOR_EFFECTS.find((e) => e.value === colorEffect.value)
                    ?.name || "Plain"}
                </span>
                <span
                  class="text-lg transition-transform"
                  style={`color: var(--color-accent, #FF69B4); transform: rotate(${
                    colorDropdownOpen ? "180" : "0"
                  }deg);`}
                >
                  ▼
                </span>
              </div>
            </div>
            {colorDropdownOpen && (
              <div
                class="absolute z-20 w-full mt-1 border-4 rounded-2xl shadow-brutal-lg overflow-hidden dropdown-scrollbar animate-dropdown-open"
                style="background-color: var(--color-base, #FAF9F6); border-color: var(--color-border, #0A0A0A); max-height: 400px; overflow-y: auto;"
              >
                {COLOR_EFFECTS.map((effect) => (
                  <div
                    key={effect.value}
                    class="px-5 py-3 font-mono font-bold cursor-pointer transition-all hover:pl-7"
                    style={`background-color: ${
                      colorEffect.value === effect.value
                        ? "var(--color-accent, #FF69B4)"
                        : "transparent"
                    }; color: ${
                      colorEffect.value === effect.value
                        ? "var(--color-base, #FAF9F6)"
                        : "var(--color-text, #0A0A0A)"
                    };`}
                    onClick={() => {
                      sounds.click();
                      colorEffect.value = effect.value;
                      setColorChanged(true);
                      setColorDropdownOpen(false);
                    }}
                    onMouseEnter={() => sounds.hover && sounds.hover()}
                  >
                    {colorEffect.value === effect.value && (
                      <span class="mr-2">✓</span>
                    )}
                    {effect.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Border Dropdown */}
          <div class="relative">
            <label
              class="block mb-2 px-2 font-mono font-bold text-sm uppercase tracking-wider"
              style="color: var(--color-text, #0A0A0A);"
            >
              Border
            </label>
            <div
              class="magic-select w-full px-5 py-4 border-4 rounded-2xl font-mono font-bold cursor-pointer transition-all hover:shadow-brutal hover:-translate-y-0.5"
              style={borderChanged
                ? "background-color: var(--color-accent, #FF69B4); color: var(--color-base, #FAF9F6); border-color: var(--color-border, #0A0A0A);"
                : "background-color: var(--color-secondary, #FFE5B4); border-color: var(--color-border, #0A0A0A); color: var(--color-text, #0A0A0A);"}
              onClick={(e) => {
                e.stopPropagation();
                sounds.click();
                setBorderDropdownOpen(!borderDropdownOpen);
                setFontDropdownOpen(false);
                setColorDropdownOpen(false);
              }}
            >
              <div class="flex items-center justify-between">
                <span class="text-base">
                  {BORDER_STYLES.find((b) => b.value === borderStyle.value)
                    ?.name || "None"}
                </span>
                <span
                  class="text-lg transition-transform"
                  style={`color: var(--color-accent, #FF69B4); transform: rotate(${
                    borderDropdownOpen ? "180" : "0"
                  }deg);`}
                >
                  ▼
                </span>
              </div>
            </div>
            {borderDropdownOpen && (
              <div
                class="absolute z-20 w-full mt-1 border-4 rounded-2xl shadow-brutal-lg overflow-hidden dropdown-scrollbar animate-dropdown-open"
                style="background-color: var(--color-base, #FAF9F6); border-color: var(--color-border, #0A0A0A); max-height: 400px; overflow-y: auto;"
              >
                {BORDER_STYLES.map((border) => (
                  <div
                    key={border.value}
                    class="px-5 py-3 font-mono font-bold cursor-pointer transition-all hover:pl-7"
                    style={`background-color: ${
                      borderStyle.value === border.value
                        ? "var(--color-accent, #FF69B4)"
                        : "transparent"
                    }; color: ${
                      borderStyle.value === border.value
                        ? "var(--color-base, #FAF9F6)"
                        : "var(--color-text, #0A0A0A)"
                    };`}
                    onClick={() => {
                      sounds.click();
                      borderStyle.value = border.value;
                      setBorderChanged(true);
                      setBorderDropdownOpen(false);
                    }}
                    onMouseEnter={() => sounds.hover && sounds.hover()}
                  >
                    {borderStyle.value === border.value && (
                      <span class="mr-2">✓</span>
                    )}
                    {border.name}
                  </div>
                ))}
              </div>
            )}
          </div>
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
            <span class="text-xs font-mono opacity-60">
              ~/output/text-art.txt
            </span>
            {!asciiOutput && (
              <button
                onClick={shuffleArt}
                class="px-2 py-1 text-xs font-mono font-bold transition-all hover:opacity-70"
                style="color: #00FF41;"
                title="Shuffle ASCII art"
              >
                🎲 SHUFFLE
              </button>
            )}
          </div>
          <div
            class="p-8 overflow-auto custom-scrollbar transition-all duration-500 ease-out"
            style={asciiOutput
              ? "height: 320px;"
              : "min-height: 320px; max-height: 600px;"}
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
                        class="font-mono text-sm opacity-40 animate-fade-in"
                        style="color: #00FF41; line-height: 1.2; white-space: pre; margin: 0; padding: 0; display: block; text-align: left; text-indent: 0; letter-spacing: -0.5px; font-weight: 600;"
                        dangerouslySetInnerHTML={{ __html: welcomeArt }}
                      />
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

          {/* Floating Export Button - Appears when ASCII is ready */}
          {asciiOutput && (
            <div class="absolute bottom-6 left-6 z-10 animate-pop-in">
              <div class="relative">
                {/* Main Copy Button */}
                <button
                  onClick={() => copyToClipboard("email")}
                  class={`px-6 py-3 border-4 rounded-2xl font-mono font-black shadow-brutal-lg transition-all hover:shadow-brutal-xl hover:-translate-y-1 active:translate-y-0 flex items-center gap-2 ${
                    copiedToClipboard ? "animate-bounce-once" : ""
                  }`}
                  style={copiedToClipboard
                    ? "background-color: #4ADE80; color: #0A0A0A; border-color: var(--color-border, #0A0A0A);"
                    : "background-color: var(--color-accent, #FF69B4); color: var(--color-base, #FAF9F6); border-color: var(--color-border, #0A0A0A);"}
                >
                  <span class="text-base">
                    {copiedToClipboard ? "✅ COPIED!" : "📋 COPY"}
                  </span>
                  {/* Dropdown Arrow */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      sounds.click();
                      setExportMenuOpen(!exportMenuOpen);
                    }}
                    class="ml-2 pl-2 border-l-2 transition-transform"
                    style="border-color: currentColor;"
                  >
                    <span
                      style={`transform: rotate(${
                        exportMenuOpen ? "180" : "0"
                      }deg); display: inline-block; transition: transform 0.2s;`}
                    >
                      ▼
                    </span>
                  </button>
                </button>

                {/* Export Options Menu */}
                {exportMenuOpen && (
                  <div
                    class="absolute bottom-full mb-2 left-0 border-4 rounded-2xl shadow-brutal-lg overflow-hidden animate-slide-up-fast"
                    style="background-color: var(--color-base, #FAF9F6); border-color: var(--color-border, #0A0A0A); min-width: 200px;"
                  >
                    <button
                      onClick={() => {
                        downloadText();
                        setExportMenuOpen(false);
                      }}
                      class="w-full px-5 py-3 font-mono font-bold text-left transition-all hover:pl-7"
                      style="background-color: transparent; color: var(--color-text, #0A0A0A);"
                      onMouseEnter={() => sounds.hover && sounds.hover()}
                    >
                      💾 Download TXT
                    </button>
                    <button
                      onClick={() => {
                        downloadPNG();
                        setExportMenuOpen(false);
                      }}
                      class="w-full px-5 py-3 font-mono font-bold text-left transition-all hover:pl-7 border-t-2"
                      style="background-color: transparent; color: var(--color-text, #0A0A0A); border-color: var(--color-border, #0A0A0A);"
                      onMouseEnter={() => sounds.hover && sounds.hover()}
                    >
                      🖼️ Download PNG
                    </button>
                  </div>
                )}
              </div>
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
