import { useSignal, computed } from "@preact/signals";
import { useRef, useState, useEffect } from "preact/hooks";
import { ImageProcessor, type ProcessOptions } from "../utils/image-processor.ts";
import { CHARACTER_SETS, STYLE_DESCRIPTIONS, type CharacterStyle } from "../utils/character-sets.ts";
import { sounds } from "../utils/sounds.ts";
import { easterEggs } from "../utils/easter-eggs.ts";

// Preset configurations for quick starts
const PRESETS = [
  { name: "Terminal", style: "classic", color: false, width: 80, enhance: false, vibe: "90s hacker" },
  { name: "Emoji", style: "emoji", color: true, width: 40, enhance: true, vibe: "chaos mode" },
  { name: "Matrix", style: "dense", color: false, width: 100, enhance: true, vibe: "follow the rabbit" },
  { name: "Blocks", style: "blocks", color: true, width: 60, enhance: false, vibe: "chunky boi" },
];

export default function Dropzone() {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [asciiOutput, setAsciiOutput] = useState<string>("");
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentImage, setCurrentImage] = useState<File | null>(null);
  const [showStylePreview, setShowStylePreview] = useState<string | null>(null);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);

  // Settings with signals for reactive updates
  const selectedStyle = useSignal<CharacterStyle>("classic");
  const charWidth = useSignal(80);
  const useColor = useSignal(false);
  const invertBrightness = useSignal(false);
  const enhanceImage = useSignal(false);
  const autoUpdate = useSignal(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const processor = useRef(new ImageProcessor());
  const updateTimeoutRef = useRef<number | null>(null);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      // Check for Konami code
      easterEggs.checkKonami(e.key);

      if (!imageLoaded) return;

      // Cmd/Ctrl + Z for reset
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        handleReset();
      }
      // Cmd/Ctrl + C for copy
      if ((e.metaKey || e.ctrlKey) && e.key === 'c' && !e.shiftKey) {
        e.preventDefault();
        copyToClipboard();
      }
      // Number keys for presets
      if (e.key >= '1' && e.key <= '4') {
        const presetIndex = parseInt(e.key) - 1;
        if (PRESETS[presetIndex]) {
          applyPreset(PRESETS[presetIndex], presetIndex);
        }
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [imageLoaded]);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    sounds.drop();

    const files = e.dataTransfer?.files;
    if (files && files[0]) {
      easterEggs.maybeShowVibe(0.2);
      await processImage(files[0]);
    }
  };

  const handleFileSelect = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      sounds.click();
      easterEggs.maybeShowVibe(0.15);
      await processImage(input.files[0]);
    }
  };

  const handlePaste = async (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (const item of items) {
        if (item.type.indexOf("image") === 0) {
          const blob = item.getAsFile();
          if (blob) {
            await processImage(blob);
          }
        }
      }
    }
  };

  const processImage = async (file: File) => {
    setIsProcessing(true);
    setCurrentImage(file);

    try {
      const img = await processor.current.loadImage(file);

      const options: ProcessOptions = {
        width: charWidth.value,
        style: selectedStyle.value,
        useColor: useColor.value,
        invert: invertBrightness.value,
        enhance: enhanceImage.value,
      };

      const ascii = processor.current.processImage(img, options);
      let formatted = processor.current.formatAscii(ascii, useColor.value);

      // Maybe add secret watermark
      formatted = easterEggs.addSecretWatermark(formatted);

      setAsciiOutput(formatted);
      setImageLoaded(true);
      sounds.success();
    } catch (error) {
      console.error("Error processing image:", error);
      alert("Failed to process image. Please try another file.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Debounced reprocess for live updates
  const scheduleReprocess = () => {
    if (!autoUpdate.value || !currentImage || !imageLoaded) return;

    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = window.setTimeout(() => {
      reprocess();
    }, 150); // Small delay for smooth updates
  };

  const reprocess = async () => {
    if (currentImage) {
      await processImage(currentImage);
    }
  };

  const applyPreset = (preset: typeof PRESETS[0], index: number) => {
    sounds.click();
    selectedStyle.value = preset.style as CharacterStyle;
    useColor.value = preset.color;
    charWidth.value = preset.width;
    enhanceImage.value = preset.enhance;
    setSelectedPreset(index);
    if (imageLoaded) {
      scheduleReprocess();
    }
  };

  const handleReset = () => {
    setImageLoaded(false);
    setAsciiOutput("");
    setCurrentImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const downloadText = () => {
    const blob = new Blob([asciiOutput.replace(/<[^>]*>/g, '')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ascii-art.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadHTML = () => {
    const html = `<!DOCTYPE html>
<html>
<head>
  <title>ASCII Art</title>
  <style>
    body { background: #000; color: #0F0; font-family: 'Courier New', monospace; font-size: 10px; line-height: 1.2; padding: 20px; }
    pre { margin: 0; letter-spacing: 0.05em; }
  </style>
</head>
<body><pre>${asciiOutput}</pre></body>
</html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ascii-art.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(asciiOutput.replace(/<[^>]*>/g, ''));
      setCopiedToClipboard(true);
      sounds.copy();
      setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch (err) {
      sounds.error();
      alert('Recalibration needed. Try again.');
    }
  };

  // Add paste event listener
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('paste', handlePaste);
      return () => window.removeEventListener('paste', handlePaste);
    }
  }, []);

  // React to setting changes
  useEffect(() => {
    if (imageLoaded) {
      scheduleReprocess();
    }
  }, [selectedStyle.value, charWidth.value, useColor.value, invertBrightness.value, enhanceImage.value, imageLoaded]);

  return (
    <div class="space-y-8">
      {/* Empty State / Drop Zone */}
      {!imageLoaded && (
        <div class="text-center space-y-6">
          {/* Friendly greeting */}
          <div class="space-y-2">
            <h2 class="text-3xl font-bold animate-bounce-subtle">
              Drop a pic.
              <span class="text-hot-pink"> Get art.</span>
            </h2>
            <p class="text-soft-black opacity-80 font-mono text-sm">
              Paste works too • <kbd class="px-2 py-1 bg-soft-yellow rounded text-xs">Cmd+V</kbd>
            </p>
          </div>

          {/* Drop Zone */}
          <div
            class={`relative border-4 border-dashed transition-all duration-300 rounded-xl p-20 cursor-pointer group ${
              isDragging
                ? 'border-hot-pink bg-gradient-to-br from-peach to-soft-yellow scale-105 shadow-brutal-lg rotate-1'
                : 'border-black bg-white hover:bg-gradient-to-br hover:from-white hover:to-peach hover:scale-102 shadow-brutal hover:shadow-brutal-lg'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              class="hidden"
              onChange={handleFileSelect}
            />

            <div class="space-y-4 pointer-events-none">
              <div class={`text-7xl transition-all duration-300 ${isDragging ? 'animate-spin' : 'group-hover:animate-wiggle'}`}>
                {isDragging ? "🎯" : "💾"}
              </div>
              <h3 class="text-2xl font-bold font-mono">
                {isDragging ? "Release to convert" : "Click or drop"}
              </h3>
              <p class="text-soft-black opacity-60 text-sm font-mono">
                JPG PNG GIF WebP • 10MB max
              </p>
            </div>

            {/* Animated corner decorations */}
            <div class="absolute top-4 left-4 text-2xl opacity-50 group-hover:opacity-100 group-hover:animate-spring transition-opacity">✨</div>
            <div class="absolute top-4 right-4 text-2xl opacity-50 group-hover:opacity-100 group-hover:animate-spring transition-opacity animation-delay-100">✨</div>
            <div class="absolute bottom-4 left-4 text-2xl opacity-50 group-hover:opacity-100 group-hover:animate-spring transition-opacity animation-delay-200">✨</div>
            <div class="absolute bottom-4 right-4 text-2xl opacity-50 group-hover:opacity-100 group-hover:animate-spring transition-opacity animation-delay-300">✨</div>
          </div>

          {/* Quick Start Presets */}
          <div class="space-y-3">
            <p class="text-sm font-mono text-soft-black opacity-60">Pick your vibe:</p>
            <div class="flex flex-wrap gap-3 justify-center">
              {PRESETS.map((preset, i) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset, i)}
                  class={`group relative px-4 py-2 border-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                    selectedPreset === i
                      ? 'bg-hot-pink text-white border-black shadow-brutal animate-pulse-soft'
                      : 'bg-white border-black shadow-brutal-sm hover:shadow-brutal hover:animate-pop'
                  }`}
                  title={imageLoaded ? `Press ${i + 1} to apply` : 'Select preset before uploading'}
                >
                  <span class="font-mono font-bold">{preset.name}</span>
                  <span class="absolute -top-2 -right-2 bg-soft-black text-white text-xs px-1.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                    {i + 1}
                  </span>
                  {selectedPreset === i && (
                    <span class="absolute -bottom-3 left-1/2 transform -translate-x-1/2 text-xs animate-bounce">✓</span>
                  )}
                  <span class="block text-xs opacity-60 mt-0.5">{preset.vibe}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Controls & Preview (when image is loaded) */}
      {imageLoaded && (
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Controls */}
          <div class="space-y-4">
            {/* Quick Actions */}
            <div class="bg-white border-4 border-soft-black rounded-lg p-4 shadow-brutal">
              <h3 class="font-mono font-bold mb-3 text-soft-black">PRESETS</h3>
              <div class="grid grid-cols-2 gap-2">
                {PRESETS.map((preset, i) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset, i)}
                    class={`px-3 py-2 border-2 border-black rounded text-sm font-bold transition-all duration-200 ${
                      selectedPreset === i
                        ? 'bg-hot-pink text-white shadow-brutal-sm animate-pulse-soft'
                        : 'bg-gradient-to-r from-soft-yellow to-peach hover:animate-spring hover:shadow-brutal-sm active:scale-95'
                    }`}
                    title={`Keyboard: ${i + 1}`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Style Selector with Preview */}
            <div class="bg-white border-4 border-soft-black rounded-lg p-4 shadow-brutal">
              <label class="block text-sm font-mono font-bold mb-2 text-soft-black">STYLE PICKER</label>
              <div class="space-y-2">
                {Object.keys(CHARACTER_SETS).map(style => (
                  <button
                    key={style}
                    onClick={() => {
                      sounds.click();
                      selectedStyle.value = style as CharacterStyle;
                      scheduleReprocess();
                    }}
                    onMouseEnter={() => setShowStylePreview(style)}
                    onMouseLeave={() => setShowStylePreview(null)}
                    class={`w-full text-left px-3 py-2 rounded border-2 transition-all duration-200 ${
                      selectedStyle.value === style
                        ? 'bg-hot-pink text-white border-black animate-pulse-soft shadow-brutal-sm'
                        : 'bg-white border-gray-300 hover:border-black hover:shadow-brutal-sm hover:animate-pop'
                    } active:scale-95`}
                  >
                    <div class="font-mono font-bold">{style}</div>
                    <div class="text-xs opacity-60">{STYLE_DESCRIPTIONS[style as CharacterStyle]}</div>
                    {showStylePreview === style && (
                      <div class="mt-1 font-mono text-xs bg-black text-terminal-green p-1 rounded animate-slide-up">
                        {CHARACTER_SETS[style as CharacterStyle]}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div class="bg-white border-4 border-soft-black rounded-lg p-4 shadow-brutal space-y-4">
              {/* Width Slider */}
              <div>
                <label class="block text-sm font-mono font-bold mb-2 text-soft-black">
                  WIDTH • <span class="text-hot-pink">{charWidth.value}</span>
                </label>
                <input
                  type="range"
                  min="20"
                  max="200"
                  value={charWidth.value}
                  class="w-full accent-hot-pink"
                  onInput={(e) => {
                    const value = parseInt((e.target as HTMLInputElement).value);
                    charWidth.value = value;
                    if (Math.random() < 0.1) sounds.slide(value); // Occasional sound feedback
                    scheduleReprocess();
                  }}
                />
                <div class="flex justify-between text-xs font-mono text-soft-black opacity-60 mt-1">
                  <span>smol</span>
                  <span>just right</span>
                  <span>thicc</span>
                </div>
              </div>

              {/* Toggle Options */}
              <div class="space-y-3">
                <label class="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={useColor.value}
                    onChange={(e) => {
                      sounds.toggle();
                      useColor.value = (e.target as HTMLInputElement).checked;
                      scheduleReprocess();
                    }}
                    class="w-5 h-5 accent-hot-pink group-hover:animate-wiggle"
                  />
                  <span class="font-mono font-bold group-hover:text-hot-pink transition-colors">
                    <span class="inline-block group-hover:animate-spring">🎨</span> Color mode
                  </span>
                </label>

                <label class="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={invertBrightness.value}
                    onChange={(e) => {
                      sounds.toggle();
                      invertBrightness.value = (e.target as HTMLInputElement).checked;
                      scheduleReprocess();
                    }}
                    class="w-5 h-5 accent-hot-pink group-hover:animate-wiggle"
                  />
                  <span class="font-mono font-bold group-hover:text-hot-pink transition-colors">
                    <span class="inline-block group-hover:animate-spring">🔄</span> Flip it
                  </span>
                </label>

                <label class="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={enhanceImage.value}
                    onChange={(e) => {
                      sounds.toggle();
                      enhanceImage.value = (e.target as HTMLInputElement).checked;
                      scheduleReprocess();
                    }}
                    class="w-5 h-5 accent-hot-pink group-hover:animate-wiggle"
                  />
                  <span class="font-mono font-bold group-hover:text-hot-pink transition-colors">
                    <span class="inline-block group-hover:animate-spring">✨</span> Juice it
                  </span>
                </label>

                <label class="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={autoUpdate.value}
                    onChange={(e) => {
                      sounds.toggle();
                      autoUpdate.value = (e.target as HTMLInputElement).checked;
                      if (!autoUpdate.value && updateTimeoutRef.current) {
                        clearTimeout(updateTimeoutRef.current);
                      }
                    }}
                    class="w-5 h-5 accent-hot-pink group-hover:animate-wiggle"
                  />
                  <span class="font-mono font-bold group-hover:text-hot-pink transition-colors">
                    <span class="inline-block group-hover:animate-spring">⚡</span> Auto-refresh
                  </span>
                </label>
              </div>

              {/* Manual Update Button */}
              {!autoUpdate.value && (
                <button
                  onClick={reprocess}
                  class="w-full px-4 py-2 bg-terminal-green text-soft-black border-2 border-soft-black rounded-lg font-mono font-bold hover:animate-jello hover:shadow-brutal-sm transition-all duration-200 active:scale-95"
                >
                  🔄 REFRESH
                </button>
              )}
            </div>
          </div>

          {/* Right: ASCII Preview */}
          <div class="lg:col-span-2 space-y-4">
            {/* Output Display */}
            <div class="bg-soft-black text-terminal-green rounded-lg border-4 border-soft-black shadow-brutal overflow-hidden">
              <div class="bg-gray-900 px-4 py-2 border-b-2 border-soft-black flex items-center justify-between">
                <div class="flex space-x-2">
                  <div class="w-3 h-3 bg-red-500 rounded-full hover:animate-pulse-soft cursor-pointer" title="Close (jk)"></div>
                  <div class="w-3 h-3 bg-yellow-500 rounded-full hover:animate-pulse-soft cursor-pointer" title="Minimize (nope)"></div>
                  <div class="w-3 h-3 bg-green-500 rounded-full hover:animate-pulse-soft cursor-pointer" title="Full screen (maybe)"></div>
                </div>
                <span class="text-xs font-mono text-gray-500">~/output/art.txt</span>
              </div>
              <div class="p-6 overflow-x-auto max-h-96 overflow-y-auto custom-scrollbar">
                <pre
                  class="ascii-display text-xs leading-tight"
                  dangerouslySetInnerHTML={{ __html: useColor.value ? asciiOutput : asciiOutput }}
                  style={useColor.value ? {} : { color: '#00FF41' }}
                />
              </div>
            </div>

            {/* Export Actions */}
            <div class="flex flex-wrap gap-3">
              <button
                onClick={downloadText}
                class="flex-1 px-4 py-3 bg-white border-3 border-soft-black rounded-lg font-mono font-bold shadow-brutal hover:shadow-brutal-lg hover:animate-pop active:scale-95 transition-all duration-200 group"
              >
                <span class="group-hover:animate-bounce-subtle inline-block">💾</span> .TXT
              </button>

              <button
                onClick={downloadHTML}
                class="flex-1 px-4 py-3 bg-peach border-3 border-soft-black rounded-lg font-mono font-bold shadow-brutal hover:shadow-brutal-lg hover:animate-pop active:scale-95 transition-all duration-200 group"
              >
                <span class="group-hover:animate-bounce-subtle inline-block">🌐</span> .HTML
              </button>

              <button
                onClick={copyToClipboard}
                class={`flex-1 px-4 py-3 border-3 border-soft-black rounded-lg font-mono font-bold shadow-brutal hover:shadow-brutal-lg ${copiedToClipboard ? 'animate-jello' : 'hover:animate-pop'} active:scale-95 transition-all duration-200 group ${
                  copiedToClipboard ? 'bg-terminal-green text-soft-black' : 'bg-soft-mint'
                }`}
              >
                <span class="group-hover:animate-bounce-subtle inline-block">
                  {copiedToClipboard ? '✓' : '✂'}
                </span> {copiedToClipboard ? 'GOT IT' : 'COPY'}
              </button>

              <button
                onClick={handleReset}
                class="flex-1 px-4 py-3 bg-hot-pink text-white border-3 border-soft-black rounded-lg font-mono font-bold shadow-brutal hover:shadow-brutal-lg hover:animate-pop active:scale-95 transition-all duration-200 group"
              >
                <span class="group-hover:animate-spin inline-block">🔁</span> AGAIN
              </button>
            </div>

            {/* Keyboard Shortcuts Help */}
            <div class="text-xs font-mono text-soft-black opacity-60 text-center space-x-4">
              <span><kbd class="px-1.5 py-0.5 bg-soft-yellow rounded">Cmd+C</kbd> copy</span>
              <span><kbd class="px-1.5 py-0.5 bg-soft-yellow rounded">Cmd+Z</kbd> reset</span>
              <span><kbd class="px-1.5 py-0.5 bg-soft-yellow rounded">1-4</kbd> presets</span>
              <span class="opacity-40">•</span>
              <span class="opacity-40">try: ↑↑↓↓←→←→BA</span>
            </div>
          </div>
        </div>
      )}

      {/* Processing Overlay */}
      {isProcessing && (
        <div class="fixed inset-0 bg-soft-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div class="bg-paper p-8 rounded-xl border-4 border-soft-black shadow-brutal-lg animate-spring">
            <div class="text-5xl animate-spin mb-4">💾</div>
            <p class="font-mono font-bold text-lg text-soft-black">Converting pixels...</p>
            <div class="mt-4 h-2 bg-soft-yellow rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-hot-pink to-terminal-green animate-slide-right"></div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-right {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-slide-right {
          animation: slide-right 1.5s ease-in-out infinite;
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 0.5s ease-in-out;
        }
        .animation-delay-100 {
          animation-delay: 0.1s;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-300 {
          animation-delay: 0.3s;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 12px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1a1a1a;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #00FF41;
          border-radius: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #00CC33;
        }
        /* Spring physics for buttons on click */
        button:active {
          animation: spring 0.3s ease-out;
        }
        /* Smooth checkbox transitions */
        input[type="checkbox"] {
          transition: transform 0.2s ease-out;
        }
        input[type="checkbox"]:checked {
          animation: spring 0.4s ease-out;
        }
        /* Range slider smooth updates */
        input[type="range"] {
          transition: transform 0.1s ease-out;
        }
        input[type="range"]:active {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
}