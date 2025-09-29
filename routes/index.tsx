import Dropzone from "../islands/Dropzone.tsx";

export default function Home() {
  return (
    <div class="min-h-screen bg-paper relative overflow-hidden">
      {/* Background Pattern */}
      <div class="absolute inset-0 opacity-5 pointer-events-none">
        <div class="absolute top-20 left-10 text-8xl rotate-12">⌘</div>
        <div class="absolute top-40 right-20 text-6xl -rotate-6">¶</div>
        <div class="absolute bottom-20 left-1/3 text-7xl rotate-45">@</div>
        <div class="absolute bottom-40 right-1/4 text-9xl -rotate-12">#</div>
        <div class="absolute top-1/2 left-1/2 text-8xl rotate-180">&</div>
      </div>

      {/* Header */}
      <header class="border-b-4 border-soft-black bg-gradient-to-r from-peach via-white to-soft-yellow relative">
        <div class="max-w-6xl mx-auto px-4 py-6">
          <div class="flex items-start justify-between">
            <div>
              <h1 class="text-5xl font-bold flex items-baseline gap-3">
                <span class="text-soft-black animate-pulse-soft">💾</span>
                <span class="tracking-tight">ASCIIFIER</span>
                <span class="text-xs bg-hot-pink text-white px-2 py-1 rounded-full font-normal">v2.0</span>
              </h1>
              <p class="text-lg mt-2 font-mono text-soft-black">
                Pics → Text art.
                <br/>
                Zero friction.
              </p>
            </div>
            <div class="text-right space-y-1">
              <div class="inline-block bg-terminal-green text-black px-3 py-1 rounded-full text-xs font-bold animate-glow">
                • LIVE
              </div>
              <p class="text-xs font-mono text-soft-black opacity-60">
                Drop. Convert. Ship.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main class="max-w-6xl mx-auto px-4 py-8 relative z-10">
        <Dropzone />
      </main>

      {/* Footer */}
      <footer class="border-t-4 border-soft-black mt-16 py-8 bg-gradient-to-r from-soft-mint via-white to-soft-blue relative">
        <div class="max-w-4xl mx-auto text-center space-y-3">
          <div class="flex items-center justify-center gap-4 text-sm font-mono">
            <span class="text-soft-black">Built with</span>
            <span class="text-hot-pink font-bold animate-bounce-subtle inline-block">80/20 energy</span>
            <span class="text-soft-black">by</span>
            <span class="text-soft-purple font-bold">Pablo 🎸</span>
          </div>
          <div class="text-xs space-y-1 text-soft-black opacity-80">
            <p>No scale. No data harvesting. No complexity theatre.</p>
            <p>Just text art that slaps. Free forever. • <span class="text-hot-pink">$0</span></p>
          </div>
          <div class="pt-2">
            <a
              href="https://github.com/pibulus/asciifier"
              class="inline-flex items-center gap-2 px-4 py-2 bg-soft-black text-white rounded-lg text-xs font-mono hover:animate-spring hover:shadow-brutal-sm transition-all"
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