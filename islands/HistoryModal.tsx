import { useEffect } from "preact/hooks";
import { signal } from "@preact/signals";
import { sounds } from "../utils/sounds.ts";

/**
 * 📜 History & Lore Modal Component
 *
 * An interactive, retro-styled educational modal detailing the lineage
 * and tech of ASCII & ANSI text art.
 *
 * Built by Pablo for curious coders and demoscene lovers 🎸
 */

export const historyModalOpen = signal(false);

export function openHistoryModal() {
  sounds.click();
  historyModalOpen.value = true;
}

export function closeHistoryModal() {
  sounds.click();
  historyModalOpen.value = false;
}

export function HistoryModal() {
  const isOpen = historyModalOpen.value;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeHistoryModal();
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
        class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
        style="background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(8px);"
        onClick={closeHistoryModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-modal-title"
      >
        {/* Modal Window */}
        <div
          class="relative w-full max-w-3xl max-h-[90vh] overflow-hidden animate-modal-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            class="p-4 sm:p-6 border-4 border-b-0 rounded-t-2xl sm:rounded-t-3xl"
            style="background-color: var(--color-accent, #FF69B4); border-color: var(--color-border, #0A0A0A)"
          >
            <div class="flex items-start justify-between">
              <div>
                <h2
                  id="history-modal-title"
                  class="text-xl sm:text-3xl font-bold font-mono"
                  style="color: var(--color-base, #FAF9F6)"
                >
                  📜 The Lore of Text Art
                </h2>
                <p
                  class="mt-1 text-xs sm:text-sm font-mono font-bold opacity-90"
                  style="color: var(--color-base, #FAF9F6)"
                >
                  From 19th-century typewriters to 80s BBS cyberdecks
                </p>
              </div>
              <button
                type="button"
                onClick={closeHistoryModal}
                class="p-2 -mr-2 -mt-2 text-2xl sm:text-3xl leading-none font-bold transition-transform hover:scale-115"
                style="color: var(--color-base, #FAF9F6)"
                aria-label="Close lore dialog"
              >
                ×
              </button>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div
            class="p-4 sm:p-8 border-4 rounded-b-2xl sm:rounded-b-3xl shadow-brutal-xl space-y-6 overflow-y-auto dropdown-scrollbar"
            style="background-color: var(--color-base, #FAF9F6); border-color: var(--color-border, #0A0A0A); max-height: calc(90vh - 140px);"
          >
            {/* Intro */}
            <p class="text-sm sm:text-base leading-relaxed font-bold">
              Before high-definition pixels and graphics accelerators hijacked
              our screens, hackers, artists, and hobbyists built entire visual
              universes using nothing but the basic character set. This is a
              quick dive into how text art evolved from ink ribbons to colorized
              terminal commands.
            </p>

            {/* Timeline Sections */}
            <div
              class="space-y-6 border-l-4 pl-4 sm:pl-6"
              style="border-color: var(--color-accent, #FF69B4)"
            >
              {/* Era 1 */}
              <div class="relative">
                <div
                  class="absolute -left-[26px] sm:-left-[34px] top-1.5 w-4 h-4 rounded-full border-4"
                  style="background-color: var(--color-accent, #FF69B4); border-color: var(--color-border, #0A0A0A)"
                >
                </div>
                <h3
                  class="text-base sm:text-lg font-bold font-mono"
                  style="color: var(--color-accent, #FF69B4)"
                >
                  1890s: Typewriter Tapestry
                </h3>
                <p class="mt-1 text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  As soon as keyboard machines entered offices, people began
                  experimenting. The earliest documented piece of typewriter art
                  was completed in <strong>1898</strong>{" "}
                  by Flora Stacey—a complex, hand-struck illustration of a
                  butterfly. Writers used varying keystroke force and paper
                  alignment offsets to generate shading.
                </p>
              </div>

              {/* Era 2 */}
              <div class="relative">
                <div
                  class="absolute -left-[26px] sm:-left-[34px] top-1.5 w-4 h-4 rounded-full border-4"
                  style="background-color: var(--color-accent, #FF69B4); border-color: var(--color-border, #0A0A0A)"
                >
                </div>
                <h3
                  class="text-base sm:text-lg font-bold font-mono"
                  style="color: var(--color-accent, #FF69B4)"
                >
                  1960s: Telex & RTTY Mainframes
                </h3>
                <p class="mt-1 text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  During the mainframe computer era, teleprinters (teletypes)
                  communicated over radio networks (RTTY). Since operators had
                  no graphic screens, they printed massive banners on
                  continuous-feed paper. Banners of pinups, cartoons, and
                  seasonal greetings were sent across cables. This is where{" "}
                  <strong>monospace layout rules</strong> were solidified.
                </p>
              </div>

              {/* Era 3 */}
              <div class="relative">
                <div
                  class="absolute -left-[26px] sm:-left-[34px] top-1.5 w-4 h-4 rounded-full border-4"
                  style="background-color: var(--color-accent, #FF69B4); border-color: var(--color-border, #0A0A0A)"
                >
                </div>
                <h3
                  class="text-base sm:text-lg font-bold font-mono"
                  style="color: var(--color-accent, #FF69B4)"
                >
                  1980s: The BBS & ANSI Art Explosion
                </h3>
                <p class="mt-1 text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  With the rise of dial-up Bulletin Board Systems (BBS) and the
                  IBM PC, text art evolved. IBM's{" "}
                  <strong>Code Page 437 (CP437)</strong>{" "}
                  introduced block shaders (<code>░</code>, <code>▒</code>,{" "}
                  <code>▓</code>,{" "}
                  <code>█</code>) and box frames. Adding standard{" "}
                  <strong>ANSI escape color codes</strong>{" "}
                  unlocked 16-color graphics. Art groups like ACiD and iCE
                  competed to build custom BBS menus, screens, and game headers
                  in the emerging demoscene.
                </p>
              </div>

              {/* Era 4 */}
              <div class="relative">
                <div
                  class="absolute -left-[26px] sm:-left-[34px] top-1.5 w-4 h-4 rounded-full border-4"
                  style="background-color: var(--color-accent, #FF69B4); border-color: var(--color-border, #0A0A0A)"
                >
                </div>
                <h3
                  class="text-base sm:text-lg font-bold font-mono"
                  style="color: var(--color-accent, #FF69B4)"
                >
                  2000s: Unicode & Shift-JIS
                </h3>
                <p class="mt-1 text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  Global Unicode standards unlocked thousands of new characters.
                  In Japan, 2channel users created complex Shift-JIS art,
                  utilizing katakana and mathematical symbols for highly
                  expressive designs (originating modern kaomoji). Today,
                  braille generators map image pixels directly to 8-dot braille
                  cells, allowing ultra-dense, terminal-safe image rendering.
                </p>
              </div>
            </div>

            {/* How it Works Section */}
            <div
              class="p-4 sm:p-5 border-3 rounded-xl space-y-3"
              style="background-color: var(--color-secondary, #FFE5B4); border-color: var(--color-border, #0A0A0A)"
            >
              <h4
                class="text-sm sm:text-base font-bold font-mono"
                style="color: var(--color-text, #0A0A0A)"
              >
                ⚙️ The Math Behind Image-to-Text Conversion
              </h4>
              <p class="text-xs sm:text-sm leading-relaxed text-gray-800">
                Ever wondered how ASCIIFIER converts your uploaded photos into
                character matrices? It boils down to three steps:
              </p>
              <ol class="list-decimal list-inside text-xs sm:text-sm space-y-2 pl-2 text-gray-800">
                <li>
                  <strong>Luminosity Calculation:</strong>{" "}
                  The browser samples each pixel block and calculates its
                  perceived brightness using standard human-eye weighting:
                  <code class="block my-1 p-1 rounded font-mono bg-white bg-opacity-50 text-center font-bold text-xs sm:text-sm">
                    Luminosity = (0.299 * Red) + (0.587 * Green) + (0.114 *
                    Blue)
                  </code>
                </li>
                <li>
                  <strong>Density Mapping:</strong>{" "}
                  This value (0 to 255) maps directly to a index in a character
                  density string. For example, in our <em>Classic</em> set:
                  <code class="block my-1 p-1 rounded font-mono bg-white bg-opacity-50 text-center font-bold text-xs sm:text-sm">
                    " .:-=+*#%@" (spaces = brightest, @ = darkest)
                  </code>
                </li>
                <li>
                  <strong>Aspect Compensation:</strong>{" "}
                  Because terminal characters are typically twice as tall as
                  they are wide (~1:2 aspect ratio), standard images would look
                  horizontally squished. ASCIIFIER dynamically corrects this by
                  adjusting sample dimensions by a factor of <code>0.5</code>.
                </li>
              </ol>
            </div>

            {/* Preservation Links */}
            <div class="space-y-3">
              <h4
                class="text-sm sm:text-base font-bold font-mono"
                style="color: var(--color-accent, #FF69B4)"
              >
                🔗 Deep Dives & Historic Archives
              </h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                <a
                  href="https://www.asciiart.eu/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="p-2 border-2 rounded-lg font-mono font-bold hover:scale-[1.01] transition-transform flex items-center justify-between"
                  style="background-color: var(--color-secondary, #FFE5B4); border-color: var(--color-border, #0A0A0A); color: var(--color-text, #0A0A0A)"
                >
                  <span>🖼️ AsciiArt.eu Gallery</span>
                  <span>➔</span>
                </a>
                <a
                  href="http://www.artpacks.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="p-2 border-2 rounded-lg font-mono font-bold hover:scale-[1.01] transition-transform flex items-center justify-between"
                  style="background-color: var(--color-secondary, #FFE5B4); border-color: var(--color-border, #0A0A0A); color: var(--color-text, #0A0A0A)"
                >
                  <span>👾 Artpacks.org (BBS/ANSI packs)</span>
                  <span>➔</span>
                </a>
                <a
                  href="http://textfiles.com/art/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="p-2 border-2 rounded-lg font-mono font-bold hover:scale-[1.01] transition-transform flex items-center justify-between"
                  style="background-color: var(--color-secondary, #FFE5B4); border-color: var(--color-border, #0A0A0A); color: var(--color-text, #0A0A0A)"
                >
                  <span>💾 Textfiles.com Historic Art</span>
                  <span>➔</span>
                </a>
                <a
                  href="https://telehack.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="p-2 border-2 rounded-lg font-mono font-bold hover:scale-[1.01] transition-transform flex items-center justify-between"
                  style="background-color: var(--color-secondary, #FFE5B4); border-color: var(--color-border, #0A0A0A); color: var(--color-text, #0A0A0A)"
                >
                  <span>📡 Telehack ARPANET Terminal</span>
                  <span>➔</span>
                </a>
              </div>
            </div>

            {/* Footer */}
            <div
              class="pt-4 text-center border-t-2"
              style="border-color: var(--color-border, #0A0A0A)"
            >
              <p class="text-xs opacity-60">
                Keep the terminal alive. Long live monospace. 🕰️
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * 🔘 History Link Component
 */
interface HistoryLinkProps {
  label?: string;
  className?: string;
}

export function HistoryLink({
  label = "📜 ASCII Lore & History",
  className = "",
}: HistoryLinkProps) {
  return (
    <button
      type="button"
      onClick={openHistoryModal}
      class={`px-3 py-2 text-sm border-3 rounded-xl font-mono font-bold shadow-brutal transition-all hover:scale-105 active:scale-95 ${className}`}
      style="background-color: var(--color-accent, #FF69B4); color: var(--color-base, #FAF9F6); border-color: var(--color-border, #0A0A0A);"
    >
      {label}
    </button>
  );
}
