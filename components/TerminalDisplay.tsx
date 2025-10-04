// ===================================================================
// TERMINAL DISPLAY - Shared terminal window component
// ===================================================================
// Used by both TextToAscii and AsciiGallery for consistent UI

import { useState } from "preact/hooks";
import { sounds } from "../utils/sounds.ts";
import { copyToClipboard, downloadPNG, downloadText } from "../utils/exportUtils.ts";

/**
 * Get CSS filter string for visual effects
 */
function getVisualEffectStyle(effect?: string): string {
  let css = "";
  switch (effect) {
    case "none":
      css = "filter: none; text-shadow: none;";
      break;
    case "neon":
      css = "filter: saturate(2.2) brightness(1.2); text-shadow: 0 0 8px currentColor, 0 0 16px currentColor, 0 0 24px currentColor;";
      break;
    case "glitch":
      css = "filter: saturate(2.5) contrast(1.5); text-shadow: -3px 0 4px #ff00ff, 3px 0 4px #00ffff, -2px 0 2px #ff0000, 2px 0 2px #00ff00;";
      break;
    case "thermal":
      css = "filter: saturate(2) contrast(1.8) brightness(1.3) hue-rotate(20deg); text-shadow: 0 0 10px #ff6600, 0 0 20px #ff3300;";
      break;
    case "hologram":
      css = "filter: saturate(1.8) brightness(1.5); text-shadow: 0 0 10px currentColor, 0 0 20px #00ffff, 0 0 30px #ff00ff; opacity: 0.9;";
      break;
    case "retro":
      css = "filter: saturate(1.4) contrast(1.2) blur(0.3px); text-shadow: 0 0 2px currentColor, 0 0 4px currentColor;";
      break;
    case "cyberpunk":
      css = "filter: saturate(2) contrast(1.3); text-shadow: -1px 0 2px #ff00ff, 1px 0 2px #00ffff, 0 0 8px currentColor;";
      break;
    default:
      // Default to neon if not specified
      css = "filter: saturate(2.2) brightness(1.2); text-shadow: 0 0 8px currentColor, 0 0 16px currentColor, 0 0 24px currentColor;";
  }
  return css;
}

interface TerminalDisplayProps {
  /** Plain text content to display */
  content: string;
  /** HTML content with color spans (optional) */
  htmlContent?: string;
  /** Whether content is currently loading */
  isLoading?: boolean;
  /** Filename for downloads (without extension) */
  filename?: string;
  /** Optional shuffle handler for gallery mode */
  onShuffle?: () => void;
  /** Terminal title bar path */
  terminalPath?: string;
  /** Whether to show shuffle button in menu bar */
  showShuffleButton?: boolean;
  /** Visual effect to apply (glow, saturation, etc.) */
  visualEffect?: string;
}

export function TerminalDisplay({
  content,
  htmlContent,
  isLoading = false,
  filename = "ascii-art",
  onShuffle,
  terminalPath = "~/output/text-art.txt",
  showShuffleButton = false,
  visualEffect = "subtle",
}: TerminalDisplayProps) {
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [mobileExportOpen, setMobileExportOpen] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(
      content,
      htmlContent || content,
      "email",
    );
    if (success) {
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    }
  };

  const handleDownloadText = () => {
    downloadText(content, htmlContent || "", filename);
  };

  const handleDownloadPNG = async () => {
    await downloadPNG(".ascii-display", filename);
  };

  const hasContent = Boolean(content);

  return (
    <div
      class="rounded-3xl border-4 shadow-brutal overflow-hidden relative"
      style="background-color: #000000; border-color: var(--color-border, #0A0A0A);"
    >
      {/* Terminal Menu Bar */}
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
            {terminalPath}
          </span>
          {/* Shuffle button in menu bar (gallery mode) */}
          {showShuffleButton && onShuffle && hasContent && (
            <button
              onClick={onShuffle}
              class="px-2 py-1 text-xs font-mono font-bold transition-all hover:scale-110 active:scale-95 opacity-70 hover:opacity-100"
              style="color: #00FF41"
              title="Get a random ASCII art"
            >
              🎲
            </button>
          )}
        </div>
      </div>

      {/* Terminal Content Area */}
      <div
        class="p-4 sm:p-6 md:p-8 overflow-auto custom-scrollbar transition-all duration-700"
        style="height: 400px; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);"
      >
        {isLoading && !content
          ? (
            <div class="flex items-start justify-start w-full pt-2 pl-2">
              <pre
                class="font-mono text-lg animate-loading-cursor"
                style="color: #00FF41;"
              >
                <span class="blinking-cursor">█</span>
              </pre>
            </div>
          )
          : htmlContent
          ? (
            <pre
              class="ascii-display font-mono text-base opacity-85"
              style={`color: #00FF41; line-height: 1.4; white-space: pre; margin: 0; padding: 0; display: block; text-align: left; text-indent: 0; letter-spacing: 0.8px; font-weight: 900; ${getVisualEffectStyle(visualEffect)}`}
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          )
          : content
          ? (
            <pre
              class="ascii-display font-mono text-base opacity-85"
              style={`color: #00FF41; line-height: 1.4; white-space: pre; margin: 0; padding: 0; display: block; text-align: left; text-indent: 0; letter-spacing: 0.8px; font-weight: 900; ${getVisualEffectStyle(visualEffect)}`}
            >
              {content}
            </pre>
          )
          : null}
      </div>

      {/* Export Buttons - Show when content is ready */}
      {hasContent && (
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
                      handleDownloadPNG();
                      setMobileExportOpen(false);
                    }}
                    class="w-full px-4 py-3 font-mono font-bold text-left hover:bg-opacity-80 transition-colors"
                    style="background-color: var(--color-secondary, #FFE5B4); color: var(--color-text, #0A0A0A);"
                  >
                    🖼️ PNG
                  </button>
                  <button
                    onClick={() => {
                      handleDownloadText();
                      setMobileExportOpen(false);
                    }}
                    class="w-full px-4 py-3 font-mono font-bold text-left hover:bg-opacity-80 transition-colors border-t-2"
                    style="background-color: var(--color-secondary, #FFE5B4); color: var(--color-text, #0A0A0A); border-color: var(--color-border, #0A0A0A);"
                  >
                    💾 TXT
                  </button>
                  <button
                    onClick={() => {
                      handleCopy();
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
              onClick={handleDownloadPNG}
              class="px-5 py-3 border-4 rounded-2xl font-mono font-black shadow-brutal-lg transition-all hover:shadow-brutal-xl hover:-translate-y-1 active:translate-y-0"
              style="background-color: var(--color-secondary, #FFE5B4); color: var(--color-text, #0A0A0A); border-color: var(--color-border, #0A0A0A);"
              title="Download as PNG image"
            >
              🖼️ PNG
            </button>
            <button
              onClick={handleDownloadText}
              class="px-5 py-3 border-4 rounded-2xl font-mono font-black shadow-brutal-lg transition-all hover:shadow-brutal-xl hover:-translate-y-1 active:translate-y-0"
              style="background-color: var(--color-secondary, #FFE5B4); color: var(--color-text, #0A0A0A); border-color: var(--color-border, #0A0A0A);"
              title="Download as text file"
            >
              💾 TXT
            </button>
            <button
              onClick={handleCopy}
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

        /* Loading cursor animation */
        @keyframes loadingCursor {
          0% { transform: translateX(0); }
          50% { transform: translateX(40px); }
          100% { transform: translateX(40px); }
        }

        .animate-loading-cursor {
          animation: loadingCursor 1.5s ease-out;
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
