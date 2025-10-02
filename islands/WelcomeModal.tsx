import { useEffect } from "preact/hooks";
import { signal } from "@preact/signals";

/**
 * 🌅 Welcome Modal Component
 *
 * First-open modal with ASCII art and sunset gradient intro.
 * Shows once, then never again (unless localStorage cleared).
 *
 * Built by Pablo for that legendary first impression 🎸
 */

// Global signal for modal state
export const welcomeModalOpen = signal(false);

// Check if user has seen welcome before
const WELCOME_SEEN_KEY = "asciifier-welcome-seen";

export function checkWelcomeStatus() {
  if (typeof localStorage !== "undefined") {
    const seen = localStorage.getItem(WELCOME_SEEN_KEY);
    if (!seen) {
      welcomeModalOpen.value = true;
    }
  }
}

export function markWelcomeSeen() {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(WELCOME_SEEN_KEY, "true");
  }
  welcomeModalOpen.value = false;
}

export function WelcomeModal() {
  const isOpen = welcomeModalOpen.value;

  useEffect(() => {
    // Close on Escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        markWelcomeSeen();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
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
        style="background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(12px);"
      >
        {/* Modal */}
        <div
          class="relative w-full max-w-2xl animate-welcome-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ASCII Art with Sunset Gradient */}
          <div
            class="p-8 border-4 rounded-3xl text-center shadow-brutal-xl mb-4"
            style="background: linear-gradient(135deg, #FFB6C1 0%, #FFA07A 25%, #FF8C94 50%, #9B6B9E 75%, #6B4D8A 100%); border-color: var(--color-border, #0A0A0A)"
          >
            <pre
              class="font-mono text-xs sm:text-sm md:text-base lg:text-lg font-bold leading-tight select-none"
              style="color: #0A0A0A; text-shadow: 1px 1px 0px rgba(255,255,255,0.3)"
            >
{`
   ▄▀█ █▀ █▀▀ █ █ █▀▀ █ █▀▀ █▀█
   █▀█ ▄█ █▄▄ █ █ █▀  █ ██▄ █▀▄
`}
            </pre>
          </div>

          {/* Content */}
          <div
            class="p-8 border-4 rounded-3xl shadow-brutal-xl space-y-6"
            style="background-color: var(--color-base, #FAF9F6); border-color: var(--color-border, #0A0A0A)"
          >
            {/* Headline */}
            <h1
              class="text-3xl sm:text-4xl md:text-5xl font-extrabold font-mono text-center leading-tight tracking-tight"
              style="color: var(--color-text, #0A0A0A)"
            >
              ASCIIFIER's the move. <br />
              Paint with letters.
            </h1>

            {/* Features */}
            <div class="space-y-3 sm:space-y-4">
              <p
                class="text-sm sm:text-base md:text-lg font-medium leading-relaxed"
                style="color: var(--color-text, #0A0A0A)"
              >
                🎨 <strong>Type or upload</strong> — Turn anything into text art in seconds.
              </p>
              <p
                class="text-sm sm:text-base md:text-lg font-medium leading-relaxed"
                style="color: var(--color-text, #0A0A0A)"
              >
                🌈 <strong>17 fonts, 10 color effects</strong> — Rainbow, fire, ocean, matrix, more.
              </p>
              <p
                class="text-sm sm:text-base md:text-lg font-medium leading-relaxed"
                style="color: var(--color-text, #0A0A0A)"
              >
                📚 <strong>Gallery of classics</strong> — Dragons, Homer, Escher. Ready to use.
              </p>
            </div>

            {/* Action */}
            <button
              onClick={markWelcomeSeen}
              class="w-full px-6 py-4 border-3 rounded-xl font-mono font-bold text-base sm:text-lg transition-all hover:scale-105 shadow-brutal-sm active:scale-[0.98]"
              style="background: linear-gradient(135deg, #FF69B4 0%, #FFB6C1 100%); color: var(--color-base, #FAF9F6); border-color: var(--color-border, #0A0A0A)"
            >
              Type it, paint it, share it.
            </button>

            {/* Tagline */}
            <p
              class="text-base sm:text-lg md:text-xl font-bold text-center pt-2"
              style="color: var(--color-accent, #FF69B4)"
            >
              It's quick, it's free, it's freaky nostalgic.
            </p>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes welcome-in {
            0% {
              opacity: 0;
              transform: scale(0.9) translateY(30px);
            }
            100% {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }

          .animate-welcome-in {
            animation: welcome-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
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
