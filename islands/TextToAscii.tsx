import { useSignal } from "@preact/signals";
import { useEffect, useState } from "preact/hooks";
import { sounds } from "../utils/sounds.ts";

// Available figlet fonts
const FIGLET_FONTS = [
  { name: "Standard", file: "standard" },
  { name: "Big", file: "big" },
  { name: "Slant", file: "slant" },
  { name: "3D-ASCII", file: "3d-ascii" },
];

export default function TextToAscii() {
  const [asciiOutput, setAsciiOutput] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  const inputText = useSignal("");
  const selectedFont = useSignal("standard");

  const generateAscii = async () => {
    if (!inputText.value.trim()) {
      setAsciiOutput("");
      return;
    }

    setIsGenerating(true);
    try {
      // Call server-side figlet API
      const response = await fetch("/api/figlet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: inputText.value.slice(0, 20), // Limit to 20 chars for performance
          font: selectedFont.value,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAsciiOutput(data.ascii);
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
  }, [inputText.value, selectedFont.value]);

  const copyToClipboard = async () => {
    try {
      // Create HTML version wrapped in monospace pre tag for rich text editors
      const htmlText = `<pre style="font-family: 'Courier New', 'Monaco', 'Menlo', monospace; white-space: pre; line-height: 1.2; font-size: 12px; margin: 0;">${asciiOutput}</pre>`;

      // Try modern clipboard API with both formats
      if (navigator.clipboard && navigator.clipboard.write) {
        const clipboardItem = new ClipboardItem({
          'text/plain': new Blob([asciiOutput], { type: 'text/plain' }),
          'text/html': new Blob([htmlText], { type: 'text/html' })
        });
        await navigator.clipboard.write([clipboardItem]);
      } else {
        // Fallback for older browsers - just plain text
        await navigator.clipboard.writeText(asciiOutput);
      }

      setCopiedToClipboard(true);
      sounds.copy();
      setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch (err) {
      sounds.error();
      alert('Copy failed. Try again.');
    }
  };

  const downloadText = () => {
    const blob = new Blob([asciiOutput], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ascii-text.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div class="space-y-6">
      {/* Input Section */}
      <div class="border-4 rounded-lg p-4 shadow-brutal space-y-4"
        style="background-color: var(--color-base, #FAF9F6); border-color: var(--color-border, #0A0A0A)">

        <div>
          <label class="block text-sm font-mono font-bold mb-2" style="color: var(--color-text, #0A0A0A)">
            TEXT INPUT
          </label>
          <input
            type="text"
            value={inputText.value}
            onInput={(e) => {
              sounds.click();
              inputText.value = (e.target as HTMLInputElement).value;
            }}
            placeholder="Type something cool..."
            maxLength={20}
            class="w-full px-3 py-2 border-2 rounded font-mono text-lg focus:outline-none focus:ring-2 transition-all"
            style="background-color: var(--color-secondary, #FFE5B4); border-color: var(--color-border, #0A0A0A); color: var(--color-text, #0A0A0A); accent-color: var(--color-accent, #FF69B4)"
          />
          <div class="text-xs font-mono opacity-60 mt-1" style="color: var(--color-text, #0A0A0A)">
            {inputText.value.length}/20 characters
          </div>
        </div>

        <div>
          <label class="block text-sm font-mono font-bold mb-2" style="color: var(--color-text, #0A0A0A)">
            FONT STYLE
          </label>
          <div class="grid grid-cols-2 gap-2">
            {FIGLET_FONTS.map(font => (
              <button
                key={font.file}
                onClick={() => {
                  sounds.click();
                  selectedFont.value = font.file;
                }}
                class={`px-3 py-2 border-2 rounded text-xs font-bold transition-all duration-200 ${
                  selectedFont.value === font.file
                    ? 'shadow-brutal-sm animate-pulse-soft'
                    : 'hover:animate-spring hover:shadow-brutal-sm active:scale-95'
                }`}
                style={selectedFont.value === font.file
                  ? "background-color: var(--color-accent, #FF69B4); color: var(--color-base, #FAF9F6); border-color: var(--color-border, #0A0A0A)"
                  : "background-color: var(--color-secondary, #FFE5B4); color: var(--color-text, #0A0A0A); border-color: var(--color-border, #0A0A0A)"
                }
              >
                {font.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Output Section */}
      {asciiOutput && (
        <div class="space-y-4">
          {/* ASCII Preview */}
          <div class="text-terminal-green rounded-lg border-4 shadow-brutal overflow-hidden"
            style="background-color: #000000; border-color: var(--color-border, #0A0A0A)">
            <div class="px-4 py-2 border-b-2 flex items-center justify-between"
              style="background-color: rgba(0,0,0,0.3); border-color: var(--color-border, #0A0A0A)">
              <div class="flex space-x-2">
                <div class="w-3 h-3 bg-red-500 rounded-full hover:animate-pulse-soft cursor-pointer" title="Close (jk)"></div>
                <div class="w-3 h-3 bg-yellow-500 rounded-full hover:animate-pulse-soft cursor-pointer" title="Minimize (nope)"></div>
                <div class="w-3 h-3 bg-green-500 rounded-full hover:animate-pulse-soft cursor-pointer" title="Full screen (maybe)"></div>
              </div>
              <span class="text-xs font-mono opacity-60">~/output/text-art.txt</span>
            </div>
            <div class="p-4 overflow-auto custom-scrollbar" style="max-height: 40vh">
              <pre
                class="ascii-display leading-tight"
                style="color: #00FF41; font-size: clamp(0.4rem, 1.2vw, 0.6rem); font-family: monospace;"
              >
                {asciiOutput}
              </pre>
            </div>
          </div>

          {/* Export Actions */}
          <div class="flex flex-wrap gap-3">
            <button
              onClick={downloadText}
              class="flex-1 px-4 py-3 bg-white border-3 border-soft-black rounded-lg font-mono font-bold shadow-brutal hover:shadow-brutal-lg hover:animate-pop active:scale-95 transition-all duration-200"
            >
              SAVE AS TEXT
            </button>

            <button
              onClick={copyToClipboard}
              class={`flex-1 px-4 py-3 border-3 border-soft-black rounded-lg font-mono font-bold shadow-brutal hover:shadow-brutal-lg ${copiedToClipboard ? 'animate-jello' : 'hover:animate-pop'} active:scale-95 transition-all duration-200 ${
                copiedToClipboard ? 'bg-terminal-green text-soft-black' : 'bg-soft-mint'
              }`}
            >
              {copiedToClipboard ? 'COPIED' : 'COPY'}
            </button>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {isGenerating && (
        <div class="text-center py-4">
          <div class="inline-block animate-spin h-6 w-6 border-2 border-transparent rounded-full"
            style="border-top-color: var(--color-accent, #FF69B4); border-right-color: var(--color-accent, #FF69B4)">
          </div>
          <p class="font-mono text-sm mt-2 opacity-60" style="color: var(--color-text, #0A0A0A)">
            Generating...
          </p>
        </div>
      )}

      <style>{`
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
      `}</style>
    </div>
  );
}