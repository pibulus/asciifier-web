import { useSignal, computed } from "@preact/signals";
import { useRef, useState, useEffect } from "preact/hooks";
import { ImageProcessor, type ProcessOptions } from "../utils/image-processor.ts";
import { CHARACTER_SETS, STYLE_DESCRIPTIONS, type CharacterStyle } from "../utils/character-sets.ts";

// Preset configurations for quick starts
const PRESETS = [
  { name: "Terminal Classic", style: "classic", color: false, width: 80, enhance: false },
  { name: "Emoji Party 🎉", style: "emoji", color: true, width: 40, enhance: true },
  { name: "Matrix Mode", style: "dense", color: false, width: 100, enhance: true },
  { name: "Chunky Blocks", style: "blocks", color: true, width: 60, enhance: false },
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

    const files = e.dataTransfer?.files;
    if (files && files[0]) {
      await processImage(files[0]);
    }
  };

  const handleFileSelect = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) {
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
      const formatted = processor.current.formatAscii(ascii, useColor.value);

      setAsciiOutput(formatted);
      setImageLoaded(true);
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
      setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch (err) {
      alert('Failed to copy to clipboard');
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
              Let's make some ASCII art!
            </h2>
            <p class="text-gray-600">
              Drop an image below or paste one with <kbd class="px-2 py-1 bg-gray-200 rounded text-xs font-mono">Cmd+V</kbd>
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
                {isDragging ? "🎯" : "🎨"}
              </div>
              <h3 class="text-2xl font-bold">
                {isDragging ? "Drop it like it's hot!" : "Drag your image here"}
              </h3>
              <p class="text-gray-500 text-sm">
                JPG, PNG, GIF, WebP • Max 10MB
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
            <p class="text-sm text-gray-500">Choose a preset style (applies when you drop an image):</p>
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
                  <span>{preset.name}</span>
                  <span class="absolute -top-2 -right-2 bg-black text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {i + 1}
                  </span>
                  {selectedPreset === i && (
                    <span class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs animate-bounce">✓</span>
                  )}
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
            <div class="bg-white border-4 border-black rounded-lg p-4 shadow-brutal">
              <h3 class="font-bold mb-3">Quick Actions</h3>
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
            <div class="bg-white border-4 border-black rounded-lg p-4 shadow-brutal">
              <label class="block text-sm font-bold mb-2">Character Style</label>
              <div class="space-y-2">
                {Object.keys(CHARACTER_SETS).map(style => (
                  <button
                    key={style}
                    onClick={() => {
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
                    <div class="font-bold">{style}</div>
                    <div class="text-xs opacity-75">{STYLE_DESCRIPTIONS[style as CharacterStyle]}</div>
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
            <div class="bg-white border-4 border-black rounded-lg p-4 shadow-brutal space-y-4">
              {/* Width Slider */}
              <div>
                <label class="block text-sm font-bold mb-2">
                  Width: <span class="text-hot-pink">{charWidth.value}</span> chars
                </label>
                <input
                  type="range"
                  min="20"
                  max="200"
                  value={charWidth.value}
                  class="w-full accent-hot-pink"
                  onInput={(e) => {
                    charWidth.value = parseInt((e.target as HTMLInputElement).value);
                    scheduleReprocess();
                  }}
                />
                <div class="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Tiny</span>
                  <span>Normal</span>
                  <span>Huge</span>
                </div>
              </div>

              {/* Toggle Options */}
              <div class="space-y-3">
                <label class="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={useColor.value}
                    onChange={(e) => {
                      useColor.value = (e.target as HTMLInputElement).checked;
                      scheduleReprocess();
                    }}
                    class="w-5 h-5 accent-hot-pink group-hover:animate-wiggle"
                  />
                  <span class="font-bold group-hover:text-hot-pink transition-colors">
                    <span class="inline-block group-hover:animate-spring">🎨</span> Use Colors
                  </span>
                </label>

                <label class="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={invertBrightness.value}
                    onChange={(e) => {
                      invertBrightness.value = (e.target as HTMLInputElement).checked;
                      scheduleReprocess();
                    }}
                    class="w-5 h-5 accent-hot-pink group-hover:animate-wiggle"
                  />
                  <span class="font-bold group-hover:text-hot-pink transition-colors">
                    <span class="inline-block group-hover:animate-spring">🔄</span> Invert
                  </span>
                </label>

                <label class="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={enhanceImage.value}
                    onChange={(e) => {
                      enhanceImage.value = (e.target as HTMLInputElement).checked;
                      scheduleReprocess();
                    }}
                    class="w-5 h-5 accent-hot-pink group-hover:animate-wiggle"
                  />
                  <span class="font-bold group-hover:text-hot-pink transition-colors">
                    <span class="inline-block group-hover:animate-spring">✨</span> Enhance
                  </span>
                </label>

                <label class="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={autoUpdate.value}
                    onChange={(e) => {
                      autoUpdate.value = (e.target as HTMLInputElement).checked;
                      if (!autoUpdate.value && updateTimeoutRef.current) {
                        clearTimeout(updateTimeoutRef.current);
                      }
                    }}
                    class="w-5 h-5 accent-hot-pink group-hover:animate-wiggle"
                  />
                  <span class="font-bold group-hover:text-hot-pink transition-colors">
                    <span class="inline-block group-hover:animate-spring">⚡</span> Live Update
                  </span>
                </label>
              </div>

              {/* Manual Update Button */}
              {!autoUpdate.value && (
                <button
                  onClick={reprocess}
                  class="w-full px-4 py-2 bg-terminal-green text-black border-2 border-black rounded-lg font-bold hover:animate-jello hover:shadow-brutal-sm transition-all duration-200 active:scale-95"
                >
                  🔄 Apply Changes
                </button>
              )}
            </div>
          </div>

          {/* Right: ASCII Preview */}
          <div class="lg:col-span-2 space-y-4">
            {/* Output Display */}
            <div class="bg-black text-terminal-green rounded-lg border-4 border-black shadow-brutal overflow-hidden">
              <div class="bg-gray-900 px-4 py-2 border-b-2 border-black flex items-center justify-between">
                <div class="flex space-x-2">
                  <div class="w-3 h-3 bg-red-500 rounded-full hover:animate-pulse-soft cursor-pointer"></div>
                  <div class="w-3 h-3 bg-yellow-500 rounded-full hover:animate-pulse-soft cursor-pointer"></div>
                  <div class="w-3 h-3 bg-green-500 rounded-full hover:animate-pulse-soft cursor-pointer"></div>
                </div>
                <span class="text-xs font-mono text-gray-500">ascii-output.txt</span>
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
                class="flex-1 px-4 py-3 bg-white border-3 border-black rounded-lg font-bold shadow-brutal hover:shadow-brutal-lg hover:animate-pop active:scale-95 transition-all duration-200 group"
              >
                <span class="group-hover:animate-bounce-subtle inline-block">📄</span> Download TXT
              </button>

              <button
                onClick={downloadHTML}
                class="flex-1 px-4 py-3 bg-peach border-3 border-black rounded-lg font-bold shadow-brutal hover:shadow-brutal-lg hover:animate-pop active:scale-95 transition-all duration-200 group"
              >
                <span class="group-hover:animate-bounce-subtle inline-block">🌐</span> Download HTML
              </button>

              <button
                onClick={copyToClipboard}
                class={`flex-1 px-4 py-3 border-3 border-black rounded-lg font-bold shadow-brutal hover:shadow-brutal-lg ${copiedToClipboard ? 'animate-jello' : 'hover:animate-pop'} active:scale-95 transition-all duration-200 group ${
                  copiedToClipboard ? 'bg-terminal-green text-black' : 'bg-soft-mint'
                }`}
              >
                <span class="group-hover:animate-bounce-subtle inline-block">
                  {copiedToClipboard ? '✅' : '📋'}
                </span> {copiedToClipboard ? 'Copied!' : 'Copy'}
              </button>

              <button
                onClick={handleReset}
                class="flex-1 px-4 py-3 bg-hot-pink text-white border-3 border-black rounded-lg font-bold shadow-brutal hover:shadow-brutal-lg hover:animate-pop active:scale-95 transition-all duration-200 group"
              >
                <span class="group-hover:animate-spin inline-block">🔄</span> New Image
              </button>
            </div>

            {/* Keyboard Shortcuts Help */}
            <div class="text-xs text-gray-500 text-center space-x-4">
              <span><kbd class="px-1.5 py-0.5 bg-gray-200 rounded font-mono">Cmd+C</kbd> Copy</span>
              <span><kbd class="px-1.5 py-0.5 bg-gray-200 rounded font-mono">Cmd+Z</kbd> Reset</span>
              <span><kbd class="px-1.5 py-0.5 bg-gray-200 rounded font-mono">1-4</kbd> Presets</span>
            </div>
          </div>
        </div>
      )}

      {/* Processing Overlay */}
      {isProcessing && (
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div class="bg-white p-8 rounded-xl border-4 border-black shadow-brutal-lg animate-spring">
            <div class="text-5xl animate-spin mb-4">🎨</div>
            <p class="font-bold text-lg">Creating your masterpiece...</p>
            <div class="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
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