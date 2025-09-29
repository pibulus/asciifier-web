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

// Color effects - now includes 'none' option
const COLOR_EFFECTS = [
  { name: "⚫ Plain", value: "none" },
  { name: "🌈 Rainbow", value: "rainbow" },
  { name: "🔥 Fire", value: "fire" },
  { name: "🌊 Ocean", value: "ocean" },
  { name: "🦄 Unicorn", value: "unicorn" },
  { name: "🔋 Matrix", value: "matrix" },
];

export default function TextToAscii() {
  const [asciiOutput, setAsciiOutput] = useState<string>("");
  const [htmlOutput, setHtmlOutput] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  const inputText = useSignal("");
  const selectedFont = useSignal("standard");
  const colorEffect = useSignal("none"); // Default to none (plain text)

  const generateAscii = async () => {
    if (!inputText.value.trim()) {
      setAsciiOutput("");
      setHtmlOutput("");
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
          colorize: colorEffect.value !== "none",
          effect: colorEffect.value,
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
  }, [inputText.value, selectedFont.value, colorEffect.value]);

  const copyToClipboard = async () => {
    try {
      // Use colorized HTML if available, otherwise wrap plain ASCII in monospace
      const plainText = asciiOutput.replace(/\u001b\[[0-9;]*m/g, ''); // Strip ANSI codes for plain text
      const htmlText = htmlOutput.includes('<span') ?
        `<pre style="font-family: 'Courier New', 'Monaco', 'Menlo', monospace; white-space: pre; line-height: 1.2; font-size: 12px; margin: 0; background: black; color: white; padding: 8px; border-radius: 4px;">${htmlOutput}</pre>` :
        `<pre style="font-family: 'Courier New', 'Monaco', 'Menlo', monospace; white-space: pre; line-height: 1.2; font-size: 12px; margin: 0;">${plainText}</pre>`;

      // Try modern clipboard API with both formats
      if (navigator.clipboard && navigator.clipboard.write) {
        const clipboardItem = new ClipboardItem({
          'text/plain': new Blob([plainText], { type: 'text/plain' }),
          'text/html': new Blob([htmlText], { type: 'text/html' })
        });
        await navigator.clipboard.write([clipboardItem]);
      } else {
        // Fallback for older browsers - just plain text
        await navigator.clipboard.writeText(plainText);
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
    // Strip ANSI codes for plain text download
    const plainText = asciiOutput.replace(/\u001b\[[0-9;]*m/g, '');
    const blob = new Blob([plainText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ascii-text.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div class="space-y-8">
      {/* Input Section */}
      <div class="border-4 rounded-2xl p-6 shadow-brutal space-y-6 animate-float transition-spring"
        style="background-color: var(--color-base, #FAF9F6); border-color: var(--color-border, #0A0A0A)">

        <div class="space-y-3">
          <label class="block text-sm font-mono font-bold tracking-wide" style="color: var(--color-text, #0A0A0A)">
            ✨ YOUR TEXT
          </label>
          <input
            type="text"
            value={inputText.value}
            onInput={(e) => {
              sounds.click();
              inputText.value = (e.target as HTMLInputElement).value;
            }}
            placeholder="Type something magical..."
            maxLength={20}
            class="w-full px-4 py-3 border-3 rounded-xl font-mono text-lg focus:outline-none transition-spring hover:animate-gooey shadow-soft focus:shadow-soft-lg"
            style="background-color: var(--color-secondary, #FFE5B4); border-color: var(--color-border, #0A0A0A); color: var(--color-text, #0A0A0A);"
          />
          <div class="text-xs font-mono opacity-70 flex justify-between items-center">
            <span style="color: var(--color-text, #0A0A0A)">
              {inputText.value.length > 0 ? '✨ Looking good!' : '💭 Start typing...'}
            </span>
            <span class="font-semibold" style="color: var(--color-accent, #FF69B4)">
              {inputText.value.length}/20
            </span>
          </div>
        </div>

        <div class="space-y-4">
          <label class="block text-sm font-mono font-bold tracking-wide" style="color: var(--color-text, #0A0A0A)">
            🎨 FONT STYLE
          </label>
          <div class="grid grid-cols-2 gap-3">
            {FIGLET_FONTS.map(font => (
              <button
                key={font.file}
                onClick={() => {
                  sounds.click();
                  selectedFont.value = font.file;
                }}
                class={`px-4 py-3 border-3 rounded-xl text-sm font-bold transition-spring group magnetic-btn relative overflow-hidden ${
                  selectedFont.value === font.file
                    ? 'shadow-brutal-sm animate-gentle-pulse scale-105'
                    : 'hover:animate-spring hover:shadow-brutal-sm active:scale-95 hover:animate-wiggle shadow-soft'
                }`}
                style={selectedFont.value === font.file
                  ? "background-color: var(--color-accent, #FF69B4); color: var(--color-base, #FAF9F6); border-color: var(--color-border, #0A0A0A)"
                  : "background-color: var(--color-secondary, #FFE5B4); color: var(--color-text, #0A0A0A); border-color: var(--color-border, #0A0A0A)"
                }
              >
                <span class="relative z-10">{font.name}</span>
                {selectedFont.value === font.file && (
                  <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-shimmer"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Color Effects - Always Visible */}
        <div class="space-y-4">
          <label class="block text-sm font-mono font-bold tracking-wide" style="color: var(--color-text, #0A0A0A)">
            🌈 COLOR MAGIC
          </label>
          <div class="grid grid-cols-2 gap-3">
            {COLOR_EFFECTS.map(effect => (
              <button
                key={effect.value}
                onClick={() => {
                  sounds.click();
                  colorEffect.value = effect.value;
                }}
                class={`px-4 py-3 border-3 rounded-xl text-sm font-bold transition-spring group magnetic-btn relative overflow-hidden ${
                  colorEffect.value === effect.value
                    ? 'shadow-brutal-sm animate-gentle-pulse scale-105'
                    : 'hover:animate-spring hover:shadow-brutal-sm active:scale-95 hover:animate-wiggle shadow-soft'
                }`}
                style={colorEffect.value === effect.value
                  ? "background-color: var(--color-accent, #FF69B4); color: var(--color-base, #FAF9F6); border-color: var(--color-border, #0A0A0A)"
                  : "background-color: var(--color-secondary, #FFE5B4); color: var(--color-text, #0A0A0A); border-color: var(--color-border, #0A0A0A)"
                }
              >
                <span class="relative z-10">{effect.name}</span>
                {colorEffect.value === effect.value && (
                  <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-shimmer"></div>
                )}
              </button>
            ))}
          </div>
          <div class="text-xs font-mono opacity-60 text-center" style="color: var(--color-text, #0A0A0A)">
            {colorEffect.value === 'none' ? '🎭 Simple & clean' : '✨ Adding some color magic!'}
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
                dangerouslySetInnerHTML={{
                  __html: colorEffect.value !== "none" && htmlOutput ? htmlOutput : asciiOutput.replace(/</g, '&lt;').replace(/>/g, '&gt;')
                }}
              />
            </div>
          </div>

          {/* Export Actions */}
          <div class="flex flex-wrap gap-4">
            <button
              onClick={downloadText}
              class="flex-1 px-6 py-4 border-4 rounded-xl font-mono font-bold shadow-brutal transition-spring magnetic-btn hover:shadow-brutal-lg hover:animate-spring active:scale-95 group relative overflow-hidden"
              style="background-color: var(--color-secondary, #FFE5B4); color: var(--color-text, #0A0A0A); border-color: var(--color-border, #0A0A0A)"
            >
              <span class="relative z-10 flex items-center justify-center gap-2">
                💾 SAVE AS TEXT
              </span>
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 animate-shimmer"></div>
            </button>

            <button
              onClick={copyToClipboard}
              class={`flex-1 px-6 py-4 border-4 rounded-xl font-mono font-bold shadow-brutal transition-spring magnetic-btn hover:shadow-brutal-lg active:scale-95 group relative overflow-hidden ${
                copiedToClipboard ? 'animate-gentle-pulse scale-105' : 'hover:animate-spring hover:animate-wiggle'
              }`}
              style={copiedToClipboard
                ? "background-color: #4ADE80; color: #0A0A0A; border-color: var(--color-border, #0A0A0A)"
                : "background-color: var(--color-accent, #FF69B4); color: var(--color-base, #FAF9F6); border-color: var(--color-border, #0A0A0A)"
              }
            >
              <span class="relative z-10 flex items-center justify-center gap-2">
                {copiedToClipboard ? '✅ COPIED!' : '📋 COPY'}
              </span>
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-shimmer"></div>
            </button>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {isGenerating && (
        <div class="text-center py-6 animate-float">
          <div class="inline-flex items-center justify-center space-x-3 px-6 py-4 rounded-xl border-3 shadow-soft transition-spring"
            style="background-color: var(--color-base, #FAF9F6); border-color: var(--color-border, #0A0A0A)">
            <div class="animate-spin h-6 w-6 border-3 border-transparent rounded-full"
              style="border-top-color: var(--color-accent, #FF69B4); border-right-color: var(--color-accent, #FF69B4)">
            </div>
            <p class="font-mono text-sm font-bold animate-gentle-pulse" style="color: var(--color-text, #0A0A0A)">
              ✨ Crafting your ASCII art...
            </p>
          </div>
        </div>
      )}

      <style>{`
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

        /* Gentle Pulse for Selected States */
        @keyframes gentlePulse {
          0%, 100% { transform: scale(1.05); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.95; }
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

        /* Magnetic Button Effect */
        .magnetic-btn {
          transition: transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .magnetic-btn:hover {
          transform: translate(2px, -2px);
        }

        /* Soft Shadows */
        .shadow-soft {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        .shadow-soft-lg {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </div>
  );
}