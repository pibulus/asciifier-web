import { useEffect } from "preact/hooks";
import { signal } from "@preact/signals";
import { sounds } from "../utils/sounds.ts";

/**
 * 📜 History & Lore Modal Component
 *
 * An immersive, retro-styled educational modal detailing the lineage
 * and tech of ASCII & ANSI text art.
 *
 * DESIGN SYSTEM:
 * - Era Cards: styled to represent their actual physical era (1890s paper, 1960s mainframe, 1980s CRT, 2000s vaporwave)
 * - Engine schematic styled like an old risograph manual
 * -Monospace box art illustrations for every era
 *
 * Built by Pablo for curious coders and demoscene lovers 🎸
 */

export const historyModalOpen = signal(false);

export function openHistoryModal() {
  if (typeof window !== "undefined") {
    sounds.click();
  }
  historyModalOpen.value = true;
}

export function closeHistoryModal() {
  if (typeof window !== "undefined") {
    sounds.click();
  }
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
        style="background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(8px);"
        onClick={closeHistoryModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-modal-title"
      >
        {/* Modal Window */}
        <div
          class="relative w-full max-w-4xl max-h-[92vh] overflow-hidden animate-modal-in"
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
                  class="text-xl sm:text-3xl font-bold font-mono uppercase tracking-tight"
                  style="color: var(--color-base, #FAF9F6)"
                >
                  📜 The Monospace Archives
                </h2>
                <p
                  class="mt-1 text-xs sm:text-sm font-mono font-bold opacity-90"
                  style="color: var(--color-base, #FAF9F6)"
                >
                  Line printers, code pages, and the cyberdeck underground
                </p>
              </div>
              <button
                type="button"
                onClick={closeHistoryModal}
                class="p-2 -mr-2 -mt-2 text-2xl sm:text-3xl leading-none font-bold transition-transform hover:scale-115 active:translate-y-0.5"
                style="color: var(--color-base, #FAF9F6)"
                aria-label="Close lore dialog"
              >
                ×
              </button>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div
            class="p-4 sm:p-6 md:p-8 border-4 rounded-b-2xl sm:rounded-b-3xl shadow-brutal-xl space-y-6 md:space-y-8 overflow-y-auto dropdown-scrollbar"
            style="background-color: var(--color-base, #FAF9F6); border-color: var(--color-border, #0A0A0A); max-height: calc(92vh - 140px);"
          >
            {/* Slogan Intro */}
            <div class="space-y-2 text-left">
              <p class="text-xs sm:text-sm font-mono uppercase tracking-widest font-bold text-[#FF69B4]">
                ✨ a friendly zine on text art roots
              </p>
              <h3 class="text-lg sm:text-2xl font-black font-mono leading-tight">
                Before screens got heavy, we painted with keys.
              </h3>
              <p class="text-sm sm:text-base leading-relaxed text-gray-700 dark:text-gray-300">
                Welcome to the monospace clubhouse. Long before graphics cards
                and high-definition video took over, folks were figuring out how
                to draw butterflies, rockets, and funny faces using nothing but
                letters. It is scrappy, nostalgic, and a whole lot of fun. Grab
                a warm drink and dig into the timeline.
              </p>
            </div>

            {/* The Era Grid */}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Card 1: 1890s Typewriter */}
              <div
                class="p-4 sm:p-5 border-3 rounded-xl flex flex-col justify-between shadow-brutal-sm"
                style="background-color: #FCFAF2; border-color: var(--color-border, #0A0A0A); color: #2E2A25;"
              >
                <div>
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-xs font-mono font-bold bg-[#E6E2D3] px-2 py-0.5 rounded border border-[#2E2A25]">
                      1890s
                    </span>
                    <span class="text-xs font-mono opacity-50">PAPER FEEL</span>
                  </div>
                  <h4 class="text-base sm:text-lg font-bold font-serif italic mb-2">
                    Typewriter Tapestries
                  </h4>
                  <p class="text-xs sm:text-sm font-serif leading-relaxed text-gray-800">
                    Flora Stacey struck the first butterfly in 1898. No screen,
                    no save buttons, just heavy iron keys and paper. She and
                    other pioneers did shading by hitting characters right on
                    top of each other and rolling the feed by hand. Pure tactile
                    focus.
                  </p>
                </div>

                {/* Typewriter Graphic */}
                <pre class="mt-4 p-2 bg-[#F5F2E6] rounded border border-[#E0DBC8] text-[9px] sm:text-xs font-mono leading-none text-center select-none">
{`  \\_.-._./
  ( \\   / )  Stacey's
   .-.-.-.   Butterfly
  ( /   \\ )  (Monochrome)
  /'     '\\`}
                </pre>
              </div>

              {/* Card 2: 1960s Teletype */}
              <div
                class="p-4 sm:p-5 border-3 rounded-xl flex flex-col justify-between shadow-brutal-sm"
                style="background-color: #EAE9E1; border-color: var(--color-border, #0A0A0A); color: #303030;"
              >
                <div>
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-xs font-mono font-bold bg-[#D3D1C8] px-2 py-0.5 rounded border border-[#303030]">
                      1960s
                    </span>
                    <span class="text-xs font-mono opacity-50">DOT MATRIX</span>
                  </div>
                  <h4 class="text-base sm:text-lg font-mono font-bold mb-2">
                    RTTY & Line Printers
                  </h4>
                  <p class="text-xs sm:text-sm font-mono leading-relaxed text-gray-800">
                    Teleprinters chattered over radio waves, rolling out
                    continuous paper banners. Operators programmed mainframes to
                    print giant pinups, peace signs, and seasonal greetings.
                    Monospace rules were locked in, keeping characters aligned.
                  </p>
                </div>

                {/* Teletype Graphic */}
                <pre class="mt-4 p-2 bg-[#E1DFD5] rounded border border-[#C9C7BA] text-[9px] sm:text-xs font-mono leading-none text-center select-none">
{`    /\\
   /  \\      Telex Rocket
  /++++\\     ( Continuous
 |  ()  |    ( Paper Reel
/_|_|__|_\\`}
                </pre>
              </div>

              {/* Card 3: 1980s BBS */}
              <div
                class="p-4 sm:p-5 border-3 rounded-xl flex flex-col justify-between shadow-brutal-sm"
                style="background-color: #0A0A0A; border-color: #39FF14; color: #39FF14;"
              >
                <div>
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-xs font-mono font-bold bg-[#142A18] text-[#39FF14] px-2 py-0.5 rounded border border-[#39FF14]">
                      1980s
                    </span>
                    <span class="text-xs font-mono opacity-70">CRT SCREEN</span>
                  </div>
                  <h4 class="text-base sm:text-lg font-mono font-bold mb-2">
                    BBS & CP437 Underground
                  </h4>
                  <p class="text-xs sm:text-sm font-mono leading-relaxed text-[#2CDE10]">
                    Dial-up Bulletin Boards lit up dark bedrooms with glowing
                    CRT screens. Standard IBM blocks (░▒▓█) and ANSI escape
                    sequences let kids build 16-color underground menus. Dialing
                    in felt like magic, and the art scene was alive.
                  </p>
                </div>

                {/* ANSI Graphic */}
                <pre class="mt-4 p-2 bg-[#121212] rounded border border-[#142A18] text-[9px] sm:text-xs font-mono leading-none text-center text-[#39FF14] select-none">
{` ╔═════════════════════╗
 ║ █▀▀ █▀█ █ █ █ █ █ █ ║
 ║ █▄▄ █▀▄ █▄█ █▄█ █▄█ ║
 ╚═════════════════════╝`}
                </pre>
              </div>

              {/* Card 4: 2000s Unicode */}
              <div
                class="p-4 sm:p-5 border-3 rounded-xl flex flex-col justify-between shadow-brutal-sm"
                style="background: linear-gradient(135deg, #FFE4E1 0%, #E6E6FA 100%); border-color: var(--color-border, #0A0A0A); color: #2C2C35;"
              >
                <div>
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-xs font-mono font-bold bg-[#DDD3E3] px-2 py-0.5 rounded border border-[#2C2C35]">
                      2000s
                    </span>
                    <span class="text-xs font-mono opacity-60">VAPORWAVE</span>
                  </div>
                  <h4 class="text-base sm:text-lg font-mono font-black mb-2">
                    Unicode & Japanese Shift-JIS
                  </h4>
                  <p class="text-xs sm:text-sm font-mono leading-relaxed text-gray-800">
                    Unicode gave us thousands of strange symbols to play with.
                    On Japanese message boards, users combined katakana into
                    legendary kaomoji faces (Giko Cat). Today, braille
                    generators map images so they run fast on low-power
                    cyberdecks.
                  </p>
                </div>

                {/* Unicode Graphic */}
                <pre class="mt-4 p-2 bg-[#F3EBF7] rounded border border-[#DFD5E6] text-[9px] sm:text-xs font-mono leading-none text-center select-none text-[#5C457D]">
{`   (✿◠‿◠)  🌸
  (´･ω･\`)  (Giko Cat)
  ( ಠ_ಠ )  (Kaomoji)
  (::[ ]::) (Unicode)`}
                </pre>
              </div>
            </div>

            {/* Riso Blueprint Schematic */}
            <div
              class="p-4 sm:p-6 border-3 rounded-xl space-y-4 text-left shadow-brutal-sm border-dashed"
              style="background-color: #EBF3F9; border-color: #0078BF; color: #004B87;"
            >
              <div class="flex items-center gap-2 mb-1">
                <span class="font-mono text-xs font-black bg-[#D2E4F2] px-2 py-0.5 rounded border border-[#0078BF]">
                  ⚙️ HOW IT WORKS
                </span>
                <span class="font-mono text-xs font-bold text-blue-700">
                  SIMPLE SPELLS
                </span>
              </div>
              <h4 class="text-base sm:text-lg font-black font-mono tracking-tight uppercase">
                The Mechanics of Light to Text Mapping
              </h4>
              <p class="text-xs sm:text-sm leading-relaxed font-mono">
                Here is the clean logic under the hood. No heavy machine
                learning, just a three-step spell to translate light into
                letters:
              </p>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs sm:text-sm pt-2">
                <div class="p-3 bg-white rounded border border-[#D2E4F2] space-y-2">
                  <span class="font-bold text-[#0078BF]">
                    01 / LIGHT WEIGHTS
                  </span>
                  <p class="text-xs text-gray-700 leading-normal">
                    We evaluate each pixel block and calculate how bright it
                    feels to a human eye:
                  </p>
                  <code class="block p-1 bg-gray-50 rounded text-[9px] text-[#004B87] font-bold text-center">
                    0.299R + 0.587G + 0.114B
                  </code>
                </div>

                <div class="p-3 bg-white rounded border border-[#D2E4F2] space-y-2">
                  <span class="font-bold text-[#0078BF]">02 / GLYPH MAGIC</span>
                  <p class="text-xs text-gray-700 leading-normal">
                    We match that brightness byte to our text strings. Bright
                    spots get airy characters, dark spots get chunky blocks.
                  </p>
                </div>

                <div class="p-3 bg-white rounded border border-[#D2E4F2] space-y-2">
                  <span class="font-bold text-[#0078BF]">
                    03 / RATIO STRETCH
                  </span>
                  <p class="text-xs text-gray-700 leading-normal">
                    Terminal characters are taller than they are wide. To stop
                    squishing, we scale height by 0.5 so your face stays
                    natural.
                  </p>
                </div>
              </div>
            </div>

            {/* Preservation Links */}
            <div class="space-y-3">
              <h4
                class="text-sm sm:text-base font-bold font-mono uppercase tracking-wider"
                style="color: var(--color-accent, #FF69B4)"
              >
                🔗 Old Skool Internet Preservation Databases
              </h4>
              <p class="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-mono">
                Swinging by these digital archives is highly recommended if you
                want to explore further:
              </p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm font-mono">
                <a
                  href="https://www.asciiart.eu/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="p-3 border-3 rounded-xl font-bold hover:scale-[1.01] active:translate-y-0.5 transition-all flex items-center justify-between shadow-brutal-sm"
                  style="background-color: var(--color-secondary, #FFE5B4); border-color: var(--color-border, #0A0A0A); color: var(--color-text, #0A0A0A)"
                >
                  <span>🖼️ ASCIIArt.eu Curated Museum</span>
                  <span>➔</span>
                </a>
                <a
                  href="http://www.artpacks.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="p-3 border-3 rounded-xl font-bold hover:scale-[1.01] active:translate-y-0.5 transition-all flex items-center justify-between shadow-brutal-sm"
                  style="background-color: var(--color-secondary, #FFE5B4); border-color: var(--color-border, #0A0A0A); color: var(--color-text, #0A0A0A)"
                >
                  <span>👾 Artpacks.org (BBS/ANSI archives)</span>
                  <span>➔</span>
                </a>
                <a
                  href="http://textfiles.com/art/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="p-3 border-3 rounded-xl font-bold hover:scale-[1.01] active:translate-y-0.5 transition-all flex items-center justify-between shadow-brutal-sm"
                  style="background-color: var(--color-secondary, #FFE5B4); border-color: var(--color-border, #0A0A0A); color: var(--color-text, #0A0A0A)"
                >
                  <span>💾 Textfiles.com Scene Art Packs</span>
                  <span>➔</span>
                </a>
                <a
                  href="https://telehack.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="p-3 border-3 rounded-xl font-bold hover:scale-[1.01] active:translate-y-0.5 transition-all flex items-center justify-between shadow-brutal-sm"
                  style="background-color: var(--color-secondary, #FFE5B4); border-color: var(--color-border, #0A0A0A); color: var(--color-text, #0A0A0A)"
                >
                  <span>📡 Telehack ARPANET Terminal</span>
                  <span>➔</span>
                </a>
              </div>
            </div>

            {/* Footer */}
            <div
              class="pt-4 text-center border-t-2 font-mono text-xs opacity-60"
              style="border-color: var(--color-border, #0A0A0A)"
            >
              <p>
                Made with love, zines, and standard monospace fonts. Thanks for
                swinging by. ☕
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
