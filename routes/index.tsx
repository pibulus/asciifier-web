import TabsIsland from "../islands/TabsIsland.tsx";
import ThemeIsland from "../islands/ThemeIsland.tsx";

export default function Home() {
  return (
    <div class="min-h-screen flex flex-col" style="background: var(--color-base-gradient, var(--color-base, #FAF9F6))">
      {/* Header */}
      <header class="border-b-4 relative" style="border-color: var(--color-border, #0A0A0A); background-color: var(--color-secondary, #FFE5B4)">
        <div class="max-w-6xl mx-auto px-4 py-6">
          <div class="flex items-start justify-between">
            <div>
              <a href="/" class="group">
                <h1 class="text-5xl font-bold flex items-baseline gap-3 cursor-pointer">
                  <span class="tracking-tight" style="color: var(--color-text, #0A0A0A)">ASCIIFIER</span>
                </h1>
              </a>
              <p class="text-lg mt-2 font-mono" style="color: var(--color-text, #0A0A0A)">
                The best ASCII art converter on the internet.
                <br/>
                <span class="text-sm opacity-80">From pixels to characters in seconds</span>
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
      <footer class="border-t-4 py-4" style="border-color: var(--color-border, #0A0A0A); background-color: var(--color-secondary, #FFE5B4)">
        <div class="max-w-4xl mx-auto text-center">
          <div class="text-center text-xs font-mono opacity-60">
            <span style="color: var(--color-text, #0A0A0A)">Made with care by Pablo</span>
          </div>
        </div>
      </footer>
    </div>
  );
}