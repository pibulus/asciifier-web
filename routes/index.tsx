import { useSignal } from "@preact/signals";
import TabSwitcher from "../islands/TabSwitcher.tsx";
import TabsIsland from "../islands/TabsIsland.tsx";
import ThemeIsland from "../islands/ThemeIsland.tsx";
import { KofiButton } from "../islands/KofiModal.tsx";
import { AboutLink, AboutModal } from "../islands/AboutModal.tsx";
import { WelcomeModal } from "../islands/WelcomeModal.tsx";
import WelcomeChecker from "../islands/WelcomeChecker.tsx";

export default function Home() {
  const activeTab = useSignal("image");

  return (
    <div
      class="min-h-[100dvh] flex flex-col"
      style="background: var(--color-base-gradient, var(--color-base, #FAF9F6))"
    >
      {/* Check if first visit and show welcome */}
      <WelcomeChecker />

      {/* First-visit welcome modal */}
      <WelcomeModal />

      {/* About modal (opened by footer link) */}
      <AboutModal />
      {/* Floating Theme Button */}
      <div class="fixed top-4 right-4 z-50">
        <ThemeIsland />
      </div>

      {/* Header */}
      <header
        class="border-b-4 relative flex-shrink-0"
        style="border-color: var(--color-border, #0A0A0A); background-color: var(--color-secondary, #FFE5B4)"
      >
        <div class="max-w-6xl mx-auto px-4 py-4 sm:py-6">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-8">
            <div class="flex-1">
              <a href="/" class="group">
                <h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold flex items-baseline gap-3 cursor-pointer">
                  <span
                    class="tracking-tight"
                    style="color: var(--color-text, #0A0A0A)"
                  >
                    ASCIIFIER
                  </span>
                </h1>
              </a>
              <p
                class="mt-1 sm:mt-2 text-xs sm:text-sm md:text-lg lg:text-xl font-mono font-bold"
                style="color: var(--color-accent, #FF69B4)"
              >
                Turn ANYTHING into text art
              </p>
            </div>
            <TabSwitcher activeTab={activeTab} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main class="flex-1 w-full px-4 py-6 md:py-8 flex items-center justify-center overflow-auto">
        <div class="max-w-5xl w-full">
          <TabsIsland activeTab={activeTab} />
        </div>
      </main>

      {/* Footer */}
      <footer
        class="border-t-4 py-6 flex-shrink-0"
        style="border-color: var(--color-border, #0A0A0A); background-color: var(--color-secondary, #FFE5B4)"
      >
        <div class="max-w-4xl mx-auto px-4">
          <div class="flex items-center justify-center gap-4">
            <AboutLink label="Made by Pablo 🎸" />
            <KofiButton size="sm" label="☕ Support" />
          </div>
        </div>
      </footer>
    </div>
  );
}
