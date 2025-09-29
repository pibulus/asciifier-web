import { useSignal } from "@preact/signals";
import { useEffect, useState } from "preact/hooks";
import { sounds } from "../utils/sounds.ts";

// Available figlet fonts - 35+ options organized by category!
const FIGLET_FONTS = [
  // Classic fonts
  { name: "Standard", file: "Standard", category: "classic" },
  { name: "Big", file: "Big", category: "classic" },
  { name: "Slant", file: "Slant", category: "classic" },
  { name: "Small", file: "Small", category: "classic" },
  { name: "Banner", file: "Banner", category: "classic" },
  { name: "Block", file: "Block", category: "classic" },
  { name: "Bubble", file: "Bubble", category: "classic" },
  { name: "Digital", file: "Digital", category: "classic" },
  { name: "Ivrit", file: "Ivrit", category: "classic" },
  { name: "Mini", file: "Mini", category: "classic" },
  { name: "Script", file: "Script", category: "classic" },
  { name: "Shadow", file: "Shadow", category: "classic" },

  // 3D fonts
  { name: "3D-ASCII", file: "3-D", category: "3d" },
  { name: "3x5", file: "3x5", category: "3d" },
  { name: "5 Line Oblique", file: "5 Line Oblique", category: "3d" },
  { name: "Alphabet", file: "Alphabet", category: "3d" },
  { name: "Isometric1", file: "Isometric1", category: "3d" },
  { name: "Isometric2", file: "Isometric2", category: "3d" },
  { name: "Isometric3", file: "Isometric3", category: "3d" },
  { name: "Isometric4", file: "Isometric4", category: "3d" },

  // Cool/Modern fonts
  { name: "Doom", file: "Doom", category: "modern" },
  { name: "Epic", file: "Epic", category: "modern" },
  { name: "Poison", file: "Poison", category: "modern" },
  { name: "Alligator", file: "Alligator", category: "modern" },
  { name: "Avatar", file: "Avatar", category: "modern" },
  { name: "Big Chief", file: "Big Chief", category: "modern" },
  { name: "Broadway", file: "Broadway", category: "modern" },
  { name: "Crazy", file: "Crazy", category: "modern" },
  { name: "Ghost", file: "Ghost", category: "modern" },
  { name: "Gothic", file: "Gothic", category: "modern" },
  { name: "Graffiti", file: "Graffiti", category: "modern" },
  { name: "Sub-Zero", file: "Sub-Zero", category: "modern" },
  { name: "Swamp Land", file: "Swamp Land", category: "modern" },

  // Special/Fun fonts
  { name: "Star Wars", file: "Star Wars", category: "fun" },
  { name: "Sweet", file: "Sweet", category: "fun" },
  { name: "Weird", file: "Weird", category: "fun" },
  { name: "Fire Font-s", file: "Fire Font-s", category: "fun" },
  { name: "Fuzzy", file: "Fuzzy", category: "fun" },
  { name: "Bloody", file: "Bloody", category: "fun" },
  { name: "Colossal", file: "Colossal", category: "fun" },
  { name: "Calgphy2", file: "Calgphy2", category: "fun" },
  { name: "Crawford", file: "Crawford", category: "fun" },
];

// Border styles for ASCII art
const BORDER_STYLES = [
  { name: "⬜ None", value: "none" },
  { name: "─ Single", value: "single" },
  { name: "═ Double", value: "double" },
  { name: "█ Block", value: "block" },
  { name: "┌ Angles", value: "angles" },
  { name: "╭ Round", value: "round" },
];

// Enhanced color effects
const COLOR_EFFECTS = [
  { name: "⚫ Plain", value: "none" },
  { name: "🌈 Rainbow", value: "rainbow" },
  { name: "🔥 Fire", value: "fire" },
  { name: "🌊 Ocean", value: "ocean" },
  { name: "🦄 Unicorn", value: "unicorn" },
  { name: "🔋 Matrix", value: "matrix" },
  { name: "🔩 Metal", value: "metal" },
  { name: "✨ Chrome", value: "chrome" },
];

export default function TextToAscii() {
  const [asciiOutput, setAsciiOutput] = useState<string>("");
  const [htmlOutput, setHtmlOutput] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [copiedFormat, setCopiedFormat] = useState("");
  const [showAdvancedFonts, setShowAdvancedFonts] = useState(false);

  const inputText = useSignal("");
  const selectedFont = useSignal("Standard");
  const colorEffect = useSignal("none");
  const borderStyle = useSignal("none");

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
      } else {
        throw new Error(data.error || "Failed to generate ASCII text");
      }
    } catch (error) {
      console.error("Error generating ASCII text:", error);
      setAsciiOutput("Error: Could not generate ASCII text");
      sounds.error();
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
    <div class="max-w-4xl mx-auto px-4 py-8">
      {/* Text Input Section */}
      <div class="mb-10">
        <label
          class="block text-lg font-mono font-black tracking-[0.15em] uppercase mb-4"
          style="color: var(--color-text, #0A0A0A);"
        >
          ✨ YOUR TEXT
        </label>
        <div class="relative">
          <input
            type="text"
            value={inputText.value}
            onInput={(e) => {
              sounds.click();
              inputText.value = (e.target as HTMLInputElement).value;
            }}
            placeholder="Type something magical..."
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

      {/* Output Section - Appears after text entry */}
      {asciiOutput && (
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

      {/* Font Style Section */}
      <div class="mb-10">
        <label
          class="block text-lg font-mono font-black tracking-[0.15em] uppercase mb-4 flex items-center justify-between"
          style="color: var(--color-text, #0A0A0A);"
        >
          <span>🎨 FONT STYLE</span>
          <button
            onClick={() => setShowAdvancedFonts(!showAdvancedFonts)}
            class="text-sm font-bold px-3 py-1 rounded-xl border-2 transition-all hover:scale-105"
            style="border-color: var(--color-border, #0A0A0A); background-color: var(--color-secondary, #FFE5B4);"
          >
            {showAdvancedFonts ? "Show Less" : "Show All Fonts"}
          </button>
        </label>
        <div class="grid grid-cols-3 gap-3">
          {(showAdvancedFonts ? FIGLET_FONTS : FIGLET_FONTS.slice(0, 9)).map((
            font,
          ) => (
            <button
              key={font.file}
              onClick={() => {
                sounds.click();
                selectedFont.value = font.file;
              }}
              class={`px-4 py-4 rounded-2xl text-sm font-bold transition-all relative overflow-hidden group ${
                selectedFont.value === font.file
                  ? "shadow-brutal-lg"
                  : "border-4 hover:shadow-brutal hover:-translate-y-1 active:translate-y-0"
              }`}
              style={selectedFont.value === font.file
                ? "background-color: var(--color-accent, #FF69B4); color: var(--color-base, #FAF9F6); border: 4px solid var(--color-border, #0A0A0A);"
                : "background-color: var(--color-secondary, #FFE5B4); color: var(--color-text, #0A0A0A); border-color: var(--color-border, #0A0A0A);"}
            >
              <span class="relative z-10 flex items-center justify-center">
                {selectedFont.value === font.file && (
                  <span class="mr-2">
                    ✓
                  </span>
                )}
                {font.name}
              </span>
              <div class="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Color Effects */}
      <div class="mb-10">
        <label
          class="block text-lg font-mono font-black tracking-[0.15em] uppercase mb-4"
          style="color: var(--color-text, #0A0A0A);"
        >
          🌈 COLOR MAGIC
        </label>
        <div class="grid grid-cols-3 gap-4">
          {COLOR_EFFECTS.map((effect) => (
            <button
              key={effect.value}
              onClick={() => {
                sounds.click();
                colorEffect.value = effect.value;
              }}
              class={`px-5 py-5 rounded-3xl text-sm font-bold transition-all relative overflow-hidden group ${
                colorEffect.value === effect.value
                  ? "shadow-brutal-lg"
                  : "border-4 hover:shadow-brutal hover:-translate-y-1 active:translate-y-0"
              }`}
              style={colorEffect.value === effect.value
                ? "background-color: var(--color-accent, #FF69B4); color: var(--color-base, #FAF9F6); border: 4px solid var(--color-border, #0A0A0A);"
                : "background-color: var(--color-secondary, #FFE5B4); color: var(--color-text, #0A0A0A); border-color: var(--color-border, #0A0A0A);"}
            >
              <span class="relative z-10 flex items-center justify-center">
                {colorEffect.value === effect.value && (
                  <span class="mr-1">✓</span>
                )}
                {effect.name}
              </span>
              <div class="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              </div>
            </button>
          ))}
        </div>
        <div
          class="text-sm font-mono opacity-60 text-center mt-4"
          style="color: var(--color-text, #0A0A0A)"
        >
          {colorEffect.value === "none"
            ? "🎭 Simple & clean"
            : "✨ Adding color magic!"}
        </div>
      </div>

      {/* Border Styles */}
      <div class="mb-10">
        <label
          class="block text-lg font-mono font-black tracking-[0.15em] uppercase mb-4"
          style="color: var(--color-text, #0A0A0A);"
        >
          🖼️ BORDER STYLE
        </label>
        <div class="grid grid-cols-3 gap-4">
          {BORDER_STYLES.map((border) => (
            <button
              key={border.value}
              onClick={() => {
                sounds.click();
                borderStyle.value = border.value;
              }}
              class={`px-5 py-5 rounded-3xl text-sm font-bold transition-all relative overflow-hidden group ${
                borderStyle.value === border.value
                  ? "shadow-brutal-lg"
                  : "border-4 hover:shadow-brutal hover:-translate-y-1 active:translate-y-0"
              }`}
              style={borderStyle.value === border.value
                ? "background-color: var(--color-accent, #FF69B4); color: var(--color-base, #FAF9F6); border: 4px solid var(--color-border, #0A0A0A);"
                : "background-color: var(--color-secondary, #FFE5B4); color: var(--color-text, #0A0A0A); border-color: var(--color-border, #0A0A0A);"}
            >
              <span class="relative z-10 flex items-center justify-center">
                {borderStyle.value === border.value && (
                  <span class="mr-1">✓</span>
                )}
                {border.name}
              </span>
              <div class="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Export Actions */}
      <div class="mb-10">
        <label
          class="block text-lg font-mono font-black tracking-[0.15em] uppercase mb-4"
          style="color: var(--color-text, #0A0A0A);"
        >
          📤 SHARE YOUR ART
        </label>
        <div class="grid grid-cols-2 gap-4 mb-4">
          {/* Copy for Email */}
          <button
            onClick={() => copyToClipboard("email")}
            disabled={!asciiOutput}
            class={`px-5 py-5 border-4 rounded-3xl font-mono font-black shadow-brutal-lg transition-all group relative overflow-hidden ${
              asciiOutput
                ? "hover:shadow-brutal-xl hover:-translate-y-1 active:translate-y-0"
                : "opacity-50 cursor-not-allowed"
            } ${copiedToClipboard && copiedFormat === "email" ? "animate-bounce-once" : ""}`}
            style={copiedToClipboard && copiedFormat === "email"
              ? "background-color: #4ADE80; color: #0A0A0A; border: 4px solid var(--color-border, #0A0A0A)"
              : "background-color: var(--color-accent, #FF69B4); color: var(--color-base, #FAF9F6); border: 4px solid var(--color-border, #0A0A0A)"}
          >
            <span class="relative z-10 flex flex-col items-center justify-center gap-1">
              <span class="text-base">
                {copiedToClipboard && copiedFormat === "email" ? "✅ COPIED!" : "📧 COPY FOR EMAIL"}
              </span>
              <span class="text-xs opacity-80">Rich colors preserved</span>
            </span>
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            </div>
          </button>

          {/* Copy for Messages */}
          <button
            onClick={() => copyToClipboard("message")}
            disabled={!asciiOutput}
            class={`px-5 py-5 border-4 rounded-3xl font-mono font-black shadow-brutal-lg transition-all group relative overflow-hidden ${
              asciiOutput
                ? "hover:shadow-brutal-xl hover:-translate-y-1 active:translate-y-0"
                : "opacity-50 cursor-not-allowed"
            } ${copiedToClipboard && copiedFormat === "message" ? "animate-bounce-once" : ""}`}
            style={copiedToClipboard && copiedFormat === "message"
              ? "background-color: #4ADE80; color: #0A0A0A; border: 4px solid var(--color-border, #0A0A0A)"
              : "background-color: var(--color-accent, #FF69B4); color: var(--color-base, #FAF9F6); border: 4px solid var(--color-border, #0A0A0A)"}
          >
            <span class="relative z-10 flex flex-col items-center justify-center gap-1">
              <span class="text-base">
                {copiedToClipboard && copiedFormat === "message" ? "✅ COPIED!" : "💬 COPY FOR MESSAGES"}
              </span>
              <span class="text-xs opacity-80">Works everywhere</span>
            </span>
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            </div>
          </button>
        </div>

        {/* Download Options */}
        <div class="grid grid-cols-2 gap-4">
          <button
            onClick={downloadText}
            disabled={!asciiOutput}
            class={`px-5 py-5 border-4 rounded-3xl font-mono font-black transition-all group relative overflow-hidden ${
              asciiOutput
                ? "shadow-brutal hover:shadow-brutal-lg hover:-translate-y-1 active:translate-y-0"
                : "opacity-50 cursor-not-allowed"
            }`}
            style="background-color: var(--color-secondary, #FFE5B4); color: var(--color-text, #0A0A0A); border-color: var(--color-border, #0A0A0A)"
          >
            <span class="relative z-10 flex flex-col items-center justify-center gap-1">
              <span class="text-base">💾 DOWNLOAD TXT</span>
              <span class="text-xs opacity-60">Plain text file</span>
            </span>
            <div class="absolute inset-0 bg-gradient-to-br from-transparent via-yellow-200/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            </div>
          </button>

          <button
            onClick={downloadPNG}
            disabled={!asciiOutput}
            class={`px-5 py-5 border-4 rounded-3xl font-mono font-black transition-all group relative overflow-hidden ${
              asciiOutput
                ? "shadow-brutal hover:shadow-brutal-lg hover:-translate-y-1 active:translate-y-0"
                : "opacity-50 cursor-not-allowed"
            }`}
            style="background-color: var(--color-secondary, #FFE5B4); color: var(--color-text, #0A0A0A); border-color: var(--color-border, #0A0A0A)"
          >
            <span class="relative z-10 flex flex-col items-center justify-center gap-1">
              <span class="text-base">🖼️ DOWNLOAD PNG</span>
              <span class="text-xs opacity-60">Perfect screenshot</span>
            </span>
            <div class="absolute inset-0 bg-gradient-to-br from-transparent via-yellow-200/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            </div>
          </button>
        </div>
      </div>

      <style>
        {`
        /* Custom Scrollbar */
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

        /* Micro Wiggle on Hover */
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(0.5deg); }
          75% { transform: rotate(-0.5deg); }
        }

        .hover\\:animate-wiggle:hover {
          animation: wiggle 0.3s ease-in-out;
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
