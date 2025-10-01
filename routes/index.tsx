import TabsIsland from "../islands/TabsIsland.tsx";
import ThemeIsland from "../islands/ThemeIsland.tsx";

export default function Home() {
  return (
    <div
      class="min-h-screen flex flex-col"
      style="background: var(--color-base-gradient, var(--color-base, #FAF9F6))"
    >
      {/* Header */}
      <header
        class="border-b-4 relative"
        style="border-color: var(--color-border, #0A0A0A); background-color: var(--color-secondary, #FFE5B4)"
      >
        <div class="max-w-6xl mx-auto px-4 py-6">
          <div class="flex items-start justify-between">
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
            <ThemeIsland />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main class="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        <TabsIsland />
      </main>

      {/* Footer */}
      <footer
        class="border-t-4 py-4"
        style="border-color: var(--color-border, #0A0A0A); background-color: var(--color-secondary, #FFE5B4)"
      >
        <div class="max-w-4xl mx-auto px-4">
          <div class="flex items-center justify-between text-xs font-mono">
            <div class="opacity-60">
              <span style="color: var(--color-text, #0A0A0A)">
                Made with care by Pablo
              </span>
            </div>
            <a
              href="https://ko-fi.com/madebypablo"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 px-3 py-1.5 rounded border-2 transition-all hover:scale-105 font-bold"
              style="color: var(--color-accent, #FF69B4); border-color: var(--color-accent, #FF69B4); background-color: var(--color-base, #FAF9F6)"
            >
              <span>☕</span>
              <span>Support</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
