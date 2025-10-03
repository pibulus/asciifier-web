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
  // Start fade out animation
  const modal = document.querySelector(".animate-welcome-in");
  if (modal) {
    modal.classList.add("animate-welcome-out");
  }

  // Trigger brightness splash
  document.body.classList.add("brightness-splash");

  // Wait for animations to complete before closing modal
  setTimeout(() => {
    document.body.classList.remove("brightness-splash");
    welcomeModalOpen.value = false;

    if (typeof localStorage !== "undefined") {
      localStorage.setItem(WELCOME_SEEN_KEY, "true");
    }
  }, 600);
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
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-modal-title"
      >
        {/* Modal */}
        <div
          class="relative w-full max-w-2xl animate-welcome-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Logo Image Header */}
          <div
            class="p-6 border-4 rounded-3xl text-center shadow-brutal-xl mb-4 overflow-hidden"
            style="background: linear-gradient(135deg, #FFB6C1 0%, #FFA07A 25%, #FF8C94 50%, #9B6B9E 75%, #6B4D8A 100%); border-color: var(--color-border, #0A0A0A)"
          >
            <img
              src="/asciifier-logo.png"
              alt="ASCIIFIER - Text Art Machine"
              class="w-full h-auto"
              style="image-rendering: crisp-edges; image-rendering: pixelated;"
            />
          </div>

          {/* Content */}
          <div
            class="p-8 border-4 rounded-3xl shadow-brutal-xl space-y-6"
            style="background-color: var(--color-base, #FAF9F6); border-color: var(--color-border, #0A0A0A)"
          >
            {/* Headline */}
            <h1
              id="welcome-modal-title"
              class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center leading-tight tracking-tight"
              style="color: var(--color-text, #0A0A0A)"
            >
              Turn anything into <br />
              glorious text art
            </h1>

            {/* Features */}
            <div class="space-y-3 sm:space-y-4">
              <p
                class="text-sm sm:text-base md:text-lg font-medium leading-relaxed"
                style="color: var(--color-text, #0A0A0A)"
              >
                🎨 <strong>Type anything or drop an image</strong>{" "}
                — Watch it transform into glorious ASCII.
              </p>
              <p
                class="text-sm sm:text-base md:text-lg font-medium leading-relaxed"
                style="color: var(--color-text, #0A0A0A)"
              >
                🌈 <strong>17 fonts, 10 color effects</strong>{" "}
                — Go rainbow, fire, ocean, matrix, cyberpunk.
              </p>
              <p
                class="text-sm sm:text-base md:text-lg font-medium leading-relaxed"
                style="color: var(--color-text, #0A0A0A)"
              >
                📚 <strong>Gallery full of classics</strong>{" "}
                — Dragons, Homer Simpson, Escher stairs. Copy and go.
              </p>
            </div>

            {/* Action */}
            <button
              onClick={markWelcomeSeen}
              class="w-full px-6 py-4 border-3 rounded-xl font-mono font-bold text-base sm:text-lg transition-all hover:scale-105 shadow-brutal-sm active:scale-[0.98]"
              style="background: linear-gradient(135deg, #FF69B4 0%, #FFB6C1 100%); color: var(--color-base, #FAF9F6); border-color: var(--color-border, #0A0A0A)"
              aria-label="Close welcome message and start using ASCIIFIER"
            >
              Start creating
            </button>

            {/* Tagline */}
            <p
              class="text-base sm:text-lg md:text-xl font-bold text-center pt-2"
              style="color: var(--color-accent, #FF69B4)"
            >
              Quick. Free. Nostalgic.
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

          @keyframes welcome-out {
            0% {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
            100% {
              opacity: 0;
              transform: scale(0.95) translateY(-20px);
            }
          }

          @keyframes brightness-flash {
            0% {
              filter: brightness(1);
            }
            30% {
              filter: brightness(1.6);
            }
            100% {
              filter: brightness(1);
            }
          }

          .animate-welcome-in {
            animation: welcome-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          }

          .animate-welcome-out {
            animation: welcome-out 0.5s cubic-bezier(0.4, 0.0, 0.2, 1) forwards;
          }

          .brightness-splash {
            animation: brightness-flash 0.6s cubic-bezier(0.4, 0.0, 0.2, 1) forwards;
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
