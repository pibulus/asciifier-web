import { useEffect } from "preact/hooks";
import { signal } from "@preact/signals";

/**
 * 🎸 About Modal Component
 *
 * Showcase modal explaining ASCIIFIER's purpose and Pablo's rapid dev approach.
 *
 * FEATURES:
 * - Project narrative & tech stack showcase
 * - Links to portfolio, GitHub, LinkedIn
 * - Escape key to close
 * - Mobile responsive
 * - Fully themed to match app aesthetic
 *
 * Built by Pablo for SoftStack apps 🎸
 */

// Global signal for modal state
export const aboutModalOpen = signal(false);

// Helper to open modal from anywhere
export function openAboutModal() {
  aboutModalOpen.value = true;
}

// Helper to close modal
export function closeAboutModal() {
  aboutModalOpen.value = false;
}

export function AboutModal() {
  const isOpen = aboutModalOpen.value;

  useEffect(() => {
    // Close on Escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeAboutModal();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(8px);"
        onClick={closeAboutModal}
      >
        {/* Modal */}
        <div
          class="relative w-full max-w-3xl animate-modal-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            class="p-6 border-4 border-b-0 rounded-t-3xl"
            style="background-color: var(--color-secondary, #FFE5B4); border-color: var(--color-border, #0A0A0A)"
          >
            <div class="flex items-start justify-between mb-2">
              <h2
                class="text-3xl font-bold font-mono"
                style="color: var(--color-text, #0A0A0A)"
              >
                About ASCIIFIER
              </h2>
              <button
                onClick={closeAboutModal}
                class="text-3xl leading-none font-bold transition-transform hover:scale-110"
                style="color: var(--color-text, #0A0A0A)"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <p
              class="text-lg font-mono font-bold"
              style="color: var(--color-accent, #FF69B4)"
            >
              Text art machine built with speed & soul 🌈
            </p>
          </div>

          {/* Content */}
          <div
            class="p-8 border-4 rounded-b-3xl shadow-brutal-xl space-y-6"
            style="background-color: var(--color-base, #FAF9F6); border-color: var(--color-border, #0A0A0A)"
          >
            {/* The Story */}
            <div class="space-y-3">
              <h3
                class="text-xl font-bold font-mono"
                style="color: var(--color-text, #0A0A0A)"
              >
                The Idea 💡
              </h3>
              <p
                class="text-base font-mono leading-relaxed"
                style="color: var(--color-text, #0A0A0A)"
              >
                I wanted to prove how fast I could build high-quality,
                interactive experiences with my Deno/Fresh development system.
                So I built <strong>ASCIIFIER</strong>: a full-featured text art
                studio that lets you create your own ASCII art AND explore a
                curated library of classic pieces from internet culture.
              </p>
            </div>

            {/* The Tech */}
            <div class="space-y-3">
              <h3
                class="text-xl font-bold font-mono"
                style="color: var(--color-text, #0A0A0A)"
              >
                The Stack 🛠️
              </h3>
              <div
                class="font-mono text-sm space-y-1"
                style="color: var(--color-text, #0A0A0A)"
              >
                <div>
                  <strong>Framework:</strong> Deno + Fresh (Islands
                  architecture)
                </div>
                <div>
                  <strong>ASCII Engine:</strong> Figlet (server-side generation)
                </div>
                <div>
                  <strong>Colors:</strong> Custom HSL gradient math
                </div>
                <div>
                  <strong>Design:</strong> Pastel-punk brutalism with CSS custom
                  properties
                </div>
                <div>
                  <strong>Deploy:</strong> Deno Deploy (edge runtime)
                </div>
              </div>
            </div>

            {/* The Features */}
            <div class="space-y-3">
              <h3
                class="text-xl font-bold font-mono"
                style="color: var(--color-text, #0A0A0A)"
              >
                What It Does ✨
              </h3>
              <ul
                class="font-mono text-sm space-y-2 list-disc list-inside"
                style="color: var(--color-text, #0A0A0A)"
              >
                <li>Convert images to ASCII art with multiple character styles</li>
                <li>
                  Generate text art with 17+ fonts and 10 color gradient effects
                </li>
                <li>Explore curated ASCII art library with theme filters</li>
                <li>Export as PNG, TXT, HTML with preserved colors</li>
                <li>3 dynamic themes (Vintage, Dark, Retro)</li>
                <li>Typewriter keyboard sounds for immersion</li>
              </ul>
            </div>

            {/* The Philosophy */}
            <div class="space-y-3">
              <h3
                class="text-xl font-bold font-mono"
                style="color: var(--color-text, #0A0A0A)"
              >
                The Philosophy 🎸
              </h3>
              <p
                class="text-base font-mono leading-relaxed"
                style="color: var(--color-text, #0A0A0A)"
              >
                Built with the <strong>80/20 principle</strong>: essential
                features that spark joy, compression over complexity, tools with
                personality. No tracking, no subscriptions, just pure creative
                utility that works offline.
              </p>
            </div>

            {/* Links */}
            <div class="pt-4 border-t-2" style="border-color: var(--color-border, #0A0A0A)">
              <h3
                class="text-xl font-bold font-mono mb-4"
                style="color: var(--color-text, #0A0A0A)"
              >
                Connect 🔗
              </h3>
              <div class="flex flex-wrap gap-3">
                <a
                  href="https://pibul.us"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-2 px-4 py-2 border-3 rounded-lg font-mono font-bold transition-all hover:scale-105 shadow-brutal-sm"
                  style="background-color: var(--color-accent, #FF69B4); color: var(--color-base, #FAF9F6); border-color: var(--color-border, #0A0A0A)"
                >
                  🌐 Portfolio
                </a>
                <a
                  href="https://github.com/pibulus/asciifier-web"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-2 px-4 py-2 border-3 rounded-lg font-mono font-bold transition-all hover:scale-105 shadow-brutal-sm"
                  style="background-color: var(--color-secondary, #FFE5B4); color: var(--color-text, #0A0A0A); border-color: var(--color-border, #0A0A0A)"
                >
                  💻 GitHub
                </a>
                <a
                  href="https://linkedin.com/in/pabloalvarado"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-2 px-4 py-2 border-3 rounded-lg font-mono font-bold transition-all hover:scale-105 shadow-brutal-sm"
                  style="background-color: var(--color-secondary, #FFE5B4); color: var(--color-text, #0A0A0A); border-color: var(--color-border, #0A0A0A)"
                >
                  💼 LinkedIn
                </a>
              </div>
            </div>

            {/* Made with love */}
            <div class="pt-4 text-center">
              <p
                class="text-sm font-mono opacity-60"
                style="color: var(--color-text, #0A0A0A)"
              >
                Made with care by Pablo 🎸
              </p>
              <p
                class="text-xs font-mono opacity-60 mt-1"
                style="color: var(--color-text, #0A0A0A)"
              >
                Melbourne → Building ethical tech with personality
              </p>
            </div>
          </div>

          {/* Footer hint */}
          <div class="text-center mt-4">
            <p
              class="text-xs font-mono opacity-60"
              style="color: var(--color-text, #0A0A0A)"
            >
              Press ESC or click outside to close
            </p>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes modal-in {
            0% {
              opacity: 0;
              transform: scale(0.95) translateY(20px);
            }
            100% {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }

          .animate-modal-in {
            animation: modal-in 0.3s ease-out forwards;
          }

          .shadow-brutal-xl {
            box-shadow: 12px 12px 0px var(--color-border, #0A0A0A);
          }

          .shadow-brutal-sm {
            box-shadow: 4px 4px 0px var(--color-border, #0A0A0A);
          }
        `}
      </style>
    </>
  );
}

/**
 * 🔘 About Link Component
 *
 * Simple link that opens the About modal.
 */

interface AboutLinkProps {
  label?: string;
  className?: string;
}

export function AboutLink({
  label = "Made with care by Pablo",
  className = "",
}: AboutLinkProps) {
  return (
    <button
      onClick={openAboutModal}
      class={`font-mono hover:opacity-100 transition-opacity underline ${className}`}
      style="color: var(--color-text, #0A0A0A)"
    >
      {label}
    </button>
  );
}
