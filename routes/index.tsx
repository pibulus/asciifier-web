import Dropzone from "../islands/Dropzone.tsx";
import ThemeIsland from "../islands/ThemeIsland.tsx";

export default function Home() {
  return (
    <div class="min-h-screen flex flex-col" style="background-color: var(--color-base, #FAF9F6)">
      {/* Theme Switcher */}
      <ThemeIsland />

      {/* Header */}
      <header class="border-b-4" style="border-color: var(--color-border, #0A0A0A); background-color: var(--color-secondary, #FFE5B4)">
        <div class="max-w-6xl mx-auto px-4 py-6">
          <div class="flex items-start justify-between">
            <div>
              <a href="/" class="group">
                <h1 class="text-5xl font-bold flex items-baseline gap-3 cursor-pointer">
                  <span class="animate-pulse-soft group-hover:animate-spin">💾</span>
                  <span class="tracking-tight" style="color: var(--color-text, #0A0A0A)">ASCIIFIER</span>
                  <span class="text-xs text-white px-2 py-1 rounded-full font-normal" style="background-color: var(--color-accent, #FF69B4)">v2.0</span>
                </h1>
              </a>
              <p class="text-lg mt-2 font-mono" style="color: var(--color-text, #0A0A0A)">
                Pics → Text art.
                <br/>
                Zero friction.
              </p>
            </div>
            <div class="text-right space-y-1">
              <div class="inline-block px-3 py-1 rounded-full text-xs font-bold animate-pulse" style="background-color: var(--color-accent, #FF69B4); color: var(--color-base, #FAF9F6)">
                • LIVE
              </div>
              <p class="text-xs font-mono opacity-60" style="color: var(--color-text, #0A0A0A)">
                Drop. Convert. Ship.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main class="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        <Dropzone />
      </main>

      {/* Footer */}
      <footer class="border-t-4 py-8" style="border-color: var(--color-border, #0A0A0A); background-color: var(--color-secondary, #FFE5B4)">
        <div class="max-w-4xl mx-auto text-center space-y-3">
          <div class="flex items-center justify-center gap-4 text-sm font-mono">
            <span style="color: var(--color-text, #0A0A0A)">Built with</span>
            <span class="font-bold animate-bounce-subtle inline-block" style="color: var(--color-accent, #FF69B4)">80/20 energy</span>
            <span style="color: var(--color-text, #0A0A0A)">by</span>
            <span class="font-bold" style="color: var(--color-text, #0A0A0A)">Pablo 🎸</span>
          </div>
          <div class="text-xs space-y-1 opacity-80" style="color: var(--color-text, #0A0A0A)">
            <p>No scale. No data harvesting. No complexity theatre.</p>
            <p>Just text art that slaps. Free forever. • <span style="color: var(--color-accent, #FF69B4)">$0</span></p>
          </div>
          <div class="pt-2">
            <a
              href="https://github.com/pibulus/asciifier"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono hover:animate-spring hover:shadow-brutal-sm transition-all"
              style="background-color: var(--color-text, #0A0A0A); color: var(--color-base, #FAF9F6)"
              target="_blank"
            >
              <span>Source</span>
              <span class="opacity-60">→</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}