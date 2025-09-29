import Dropzone from "../islands/Dropzone.tsx";
import ThemeIsland from "../islands/ThemeIsland.tsx";

export default function Home() {
  return (
    <div class="min-h-screen flex flex-col" style="background: var(--color-base-gradient, var(--color-base, #FAF9F6))">
      {/* Theme Switcher */}
      <ThemeIsland />

      {/* Header */}
      <header class="border-b-4" style="border-color: var(--color-border, #0A0A0A); background-color: var(--color-secondary, #FFE5B4)">
        <div class="max-w-6xl mx-auto px-4 py-6">
          <div class="flex items-start justify-between">
            <div>
              <a href="/" class="group">
                <h1 class="text-5xl font-bold flex items-baseline gap-3 cursor-pointer">
                  <span class="tracking-tight" style="color: var(--color-text, #0A0A0A)">ASCIIFIER</span>
                </h1>
              </a>
              <p class="text-lg mt-2 font-mono" style="color: var(--color-text, #0A0A0A)">
                Drop an image.
                <br/>
                Get text art.
              </p>
            </div>
            <div class="text-right space-y-1">
              <div class="inline-block px-3 py-1 rounded-full text-xs font-bold animate-pulse" style="background-color: var(--color-accent, #FF69B4); color: var(--color-base, #FAF9F6)">
                • LIVE
              </div>
              <p class="text-xs font-mono opacity-60" style="color: var(--color-text, #0A0A0A)">
                instant
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
      <footer class="border-t-4 py-4" style="border-color: var(--color-border, #0A0A0A); background-color: var(--color-secondary, #FFE5B4)">
        <div class="max-w-4xl mx-auto text-center">
          <div class="flex items-center justify-center gap-4 text-xs font-mono">
            <span style="color: var(--color-text, #0A0A0A)">Free forever. No ads. No tracking.</span>
            <span style="color: var(--color-text, #0A0A0A)">•</span>
            <a
              href="https://github.com/pibulus/asciifier"
              class="font-bold hover:animate-spring transition-all"
              style="color: var(--color-text, #0A0A0A)"
              target="_blank"
            >
              Source
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}