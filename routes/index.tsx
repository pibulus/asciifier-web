import Dropzone from "../islands/Dropzone.tsx";

export default function Home() {
  return (
    <div class="min-h-screen bg-paper">
      {/* Header */}
      <header class="border-b-4 border-black bg-white">
        <div class="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 class="text-4xl font-bold text-shadow-brutal">
              🎨 ASCIIFIER
            </h1>
            <p class="text-lg mt-1 text-gray-700">
              Turn images into beautiful ASCII art!
            </p>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-600">Drag. Drop. ASCII.</p>
            <p class="text-xs text-gray-500 mt-1">No complexity theatre</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main class="max-w-6xl mx-auto px-4 py-8">
        <Dropzone />
      </main>

      {/* Footer */}
      <footer class="border-t-4 border-black mt-16 py-6 text-center text-sm text-gray-600">
        <p>Built with 80/20 energy by Pablo Alvarado 🎸</p>
        <p class="mt-1">No scale. No subscriptions. Just ASCII art.</p>
      </footer>
    </div>
  );
}