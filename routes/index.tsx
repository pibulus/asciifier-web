import { useSignal } from "@preact/signals";
import TabSwitcher from "../islands/TabSwitcher.tsx";
import TabsIsland from "../islands/TabsIsland.tsx";
import ThemeIsland from "../islands/ThemeIsland.tsx";
import { KofiButton } from "../islands/KofiModal.tsx";
import { AboutLink } from "../islands/AboutModal.tsx";

export default function Home() {
  const activeTab = useSignal("image");

  return (
    <div
      class="min-h-screen flex flex-col"
      style="background: var(--color-base-gradient, var(--color-base, #FAF9F6))"
    >
      {/* Floating Theme Button */}
      <div class="fixed top-4 right-4 z-50">
        <ThemeIsland />
      </div>

      {/* Header */}
      <header
        class="border-b-4 relative"
        style="border-color: var(--color-border, #0A0A0A); background-color: var(--color-secondary, #FFE5B4)"
      >
        <div class="max-w-6xl mx-auto px-4 py-6">
          <div class="flex items-center justify-between gap-8">
            <div class="flex-1">
              <a href="/" class="group">
                <h1 class="text-5xl font-bold flex items-baseline gap-3 cursor-pointer">
                  <span
                    class="tracking-tight"
                    style="color: var(--color-text, #0A0A0A)"
                  >
                    ASCIIFIER
                  </span>
                </h1>
              </a>
              <p
                class="mt-3 text-xl font-mono font-bold"
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
      <main class="flex-1 w-full px-4 py-12">
        <div class="max-w-5xl mx-auto">
          <TabsIsland activeTab={activeTab} />
        </div>
      </main>

      {/* Footer */}
      <footer
        class="border-t-4 py-4"
        style="border-color: var(--color-border, #0A0A0A); background-color: var(--color-secondary, #FFE5B4)"
      >
        <div class="max-w-4xl mx-auto px-4">
          <div class="flex items-center justify-between text-xs font-mono">
            <div class="opacity-60">
              <AboutLink label="Made with care by Pablo" />
            </div>
            <KofiButton size="sm" label="☕ Support" />
          </div>
        </div>
      </footer>
    </div>
  );
}
