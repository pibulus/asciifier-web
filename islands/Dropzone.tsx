import { computed, useSignal } from "@preact/signals";
import { useEffect, useRef, useState } from "preact/hooks";
import {
  ImageProcessor,
  type ProcessOptions,
} from "../utils/image-processor.ts";
import {
  CHARACTER_SETS,
  type CharacterStyle,
  STYLE_DESCRIPTIONS,
} from "../utils/character-sets.ts";
import { sounds } from "../utils/sounds.ts";
import { easterEggs } from "../utils/easter-eggs.ts";
import { analytics } from "../utils/analytics.ts";

// Preset configurations for quick starts
const PRESETS = [
  {
    name: "CLASSIC",
    style: "classic",
    color: false,
    width: 80,
    enhance: false,
    vibe: "clean and simple",
  },
  {
    name: "COLOR",
    style: "classic",
    color: true,
    width: 80,
    enhance: true,
    vibe: "full spectrum",
  },
  {
    name: "INVERTED",
    style: "classic",
    color: false,
    width: 80,
    enhance: false,
    invert: true,
    vibe: "light on dark",
  },
  {
    name: "DETAILED",
    style: "retro",
    color: false,
    width: 120,
    enhance: false,
    vibe: "maximum texture",
  },
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
  const [isMobile, setIsMobile] = useState(false);

  // Settings with signals for reactive updates
  const selectedStyle = useSignal<CharacterStyle>("classic");
  const charWidth = useSignal(80);
  const useColor = useSignal(false);
  const useRainbow = useSignal(false);
  const invertBrightness = useSignal(false);
  const enhanceImage = useSignal(false);
  const autoUpdate = useSignal(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const processor = useRef(new ImageProcessor());
  const updateTimeoutRef = useRef<number | null>(null);

  // Detect mobile device
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Modern best practice: check for touch points instead of userAgent
      const isTouchDevice = navigator.maxTouchPoints > 0;
      setIsMobile(isTouchDevice);
    }
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      // Check for Konami code
      easterEggs.checkKonami(e.key);

      if (!imageLoaded) return;

      // Cmd/Ctrl + Z for reset
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        handleReset();
      }
      // Cmd/Ctrl + C for copy
      if ((e.metaKey || e.ctrlKey) && e.key === "c" && !e.shiftKey) {
        e.preventDefault();
        copyToClipboard();
      }
      // Number keys for presets
      if (e.key >= "1" && e.key <= "4") {
        const presetIndex = parseInt(e.key) - 1;
        if (PRESETS[presetIndex]) {
          applyPreset(PRESETS[presetIndex], presetIndex);
        }
      }
    };

    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
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

  const handleCameraCapture = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      sounds.click();
      easterEggs.maybeShowVibe(0.2);
      await processImage(input.files[0]);
    }
  };

  const handlePaste = async (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
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
        rainbow: useRainbow.value,
        invert: invertBrightness.value,
        enhance: enhanceImage.value,
      };

      const ascii = processor.current.processImage(img, options);
      let formatted = processor.current.formatAscii(
        ascii,
        useColor.value || useRainbow.value,
      );

      // Maybe add secret watermark
      formatted = easterEggs.addSecretWatermark(formatted);

      setAsciiOutput(formatted);
      setImageLoaded(true);
      sounds.success();
      analytics.trackImageConverted(file.size, true);
    } catch (error) {
      console.error("Error processing image:", error);
      alert("Failed to process image. Please try another file.");
      analytics.trackImageConverted(
        file.size,
        false,
        error instanceof Error ? error.message : "unknown",
      );
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
    invertBrightness.value = preset.invert || false;
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
    const blob = new Blob([asciiOutput.replace(/<[^>]*>/g, "")], {
      type: "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ascii-art.txt";
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
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ascii-art.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    try {
      // Strip HTML tags for plain text version
      const plainText = asciiOutput.replace(/<[^>]*>/g, "");

      // Create HTML version wrapped in monospace pre tag for rich text editors
      const htmlText =
        `<pre style="font-family: 'Courier New', 'Monaco', 'Menlo', monospace; white-space: pre; line-height: 1.2; font-size: 12px; margin: 0;">${asciiOutput}</pre>`;

      // Try modern clipboard API with both formats
      if (navigator.clipboard && navigator.clipboard.write) {
        const clipboardItem = new ClipboardItem({
          "text/plain": new Blob([plainText], { type: "text/plain" }),
          "text/html": new Blob([htmlText], { type: "text/html" }),
        });
        await navigator.clipboard.write([clipboardItem]);
      } else {
        // Fallback for older browsers - just plain text
        await navigator.clipboard.writeText(plainText);
      }

      setCopiedToClipboard(true);
      sounds.copy();
      setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch (err) {
      sounds.error();
      alert("Recalibration needed. Try again.");
    }
  };

  // Add paste event listener
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("paste", handlePaste);
      return () => window.removeEventListener("paste", handlePaste);
    }
  }, []);

  // React to setting changes
  useEffect(() => {
    if (imageLoaded) {
      scheduleReprocess();
    }
  }, [
    selectedStyle.value,
    charWidth.value,
    useColor.value,
    useRainbow.value,
    invertBrightness.value,
    enhanceImage.value,
    imageLoaded,
  ]);

  return (
    <div class="space-y-8">
      {/* Empty State / Drop Zone */}
      {!imageLoaded && (
        <div class="text-center space-y-6">
          {/* Friendly greeting */}
          <div class="space-y-3">
            <h2 class="text-2xl md:text-4xl lg:text-5xl font-black leading-tight wavy-dropzone-title">
              <span
                class="block mb-2"
                style="color: var(--color-text, #0A0A0A);"
              >
                <span style="--char-index: 0">T</span>
                <span style="--char-index: 1">u</span>
                <span style="--char-index: 2">r</span>
                <span style="--char-index: 3">n</span>
                <span style="--char-index: 4">&nbsp;</span>
                <span style="--char-index: 5">a</span>
                <span style="--char-index: 6">n</span>
                <span style="--char-index: 7">y</span>
                <span style="--char-index: 8">&nbsp;</span>
                <span style="--char-index: 9">i</span>
                <span style="--char-index: 10">m</span>
                <span style="--char-index: 11">a</span>
                <span style="--char-index: 12">g</span>
                <span style="--char-index: 13">e</span>
              </span>
              <span
                class="block"
                style="color: var(--color-accent, #FF69B4);"
              >
                <span style="--char-index: 0">i</span>
                <span style="--char-index: 1">n</span>
                <span style="--char-index: 2">t</span>
                <span style="--char-index: 3">o</span>
                <span style="--char-index: 4">&nbsp;</span>
                <span style="--char-index: 5">A</span>
                <span style="--char-index: 6">S</span>
                <span style="--char-index: 7">C</span>
                <span style="--char-index: 8">I</span>
                <span style="--char-index: 9">I</span>
                <span style="--char-index: 10">&nbsp;</span>
                <span style="--char-index: 11">a</span>
                <span style="--char-index: 12">r</span>
                <span style="--char-index: 13">t</span>
              </span>
            </h2>
          </div>

          {/* Drop Zone */}
          <div
            class={`relative border-4 md:border-8 border-dashed transition-all duration-300 rounded-xl p-12 md:p-16 lg:p-24 cursor-pointer group ${
              isDragging
                ? "scale-105 shadow-brutal-lg rotate-1"
                : "hover:scale-105 hover:rotate-2 shadow-brutal hover:shadow-brutal-lg"
            }`}
            style={isDragging
              ? `border-color: var(--color-accent, #FF69B4); background-color: var(--color-secondary, #FFE5B4)`
              : `border-color: var(--color-border, #0A0A0A); background: linear-gradient(135deg, rgba(250, 249, 246, 0.3) 0%, rgba(255, 229, 180, 0.15) 100%)`}
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
              <div
                class={`text-6xl transition-all duration-300 ${
                  isDragging ? "animate-bounce" : "animate-pulse-soft"
                }`}
              >
                📦
              </div>
              <h3
                class="text-2xl font-bold font-mono"
                style="color: var(--color-text, #0A0A0A)"
              >
                {isDragging ? "Yeah! Drop it!" : "Drop zone"}
              </h3>
              <p
                class="opacity-70 text-base sm:text-sm font-mono"
                style="color: var(--color-text, #0A0A0A)"
              >
                JPG PNG GIF WebP • 10MB max
              </p>
            </div>
          </div>

          {/* Camera Capture Button (Mobile-only) */}
          {isMobile && (
            <div class="flex flex-col gap-3 items-stretch justify-center">
              <button
                onClick={() => cameraInputRef.current?.click()}
                class="group px-6 py-4 border-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-brutal hover:shadow-brutal-lg hover:scale-105 active:scale-95 animate-pulse-soft"
                style="background-color: var(--color-accent, #FF69B4); color: var(--color-base, #FAF9F6); border-color: var(--color-border, #0A0A0A)"
              >
                <div class="flex items-center justify-center gap-3">
                  <span class="text-3xl">📷</span>
                  <div class="text-left">
                    <div class="font-mono font-bold">TAKE PHOTO</div>
                    <div class="text-xs opacity-80">instant ASCII</div>
                  </div>
                </div>
              </button>
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                class="hidden"
                onChange={handleCameraCapture}
              />
            </div>
          )}
        </div>
      )}

      {/* Controls & Preview (when image is loaded) */}
      {imageLoaded && (
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Controls */}
          <div class="space-y-4">
            {/* Style Controls */}
            <div
              class="border-4 rounded-lg p-4 shadow-brutal"
              style="background-color: var(--color-base, #FAF9F6); border-color: var(--color-border, #0A0A0A)"
            >
              <label
                class="block text-sm font-mono font-bold mb-2"
                style="color: var(--color-text, #0A0A0A)"
              >
                CHARACTER STYLE
              </label>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                {PRESETS.map((preset, i) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset, i)}
                    class={`px-4 py-3 sm:px-2 sm:py-1.5 border-2 rounded text-sm sm:text-xs font-bold transition-all duration-200 ${
                      selectedPreset === i
                        ? "shadow-brutal-sm animate-pulse-soft"
                        : "hover:animate-spring hover:shadow-brutal-sm active:scale-95"
                    }`}
                    style={selectedPreset === i
                      ? "background-color: var(--color-accent, #FF69B4); color: var(--color-base, #FAF9F6); border-color: var(--color-border, #0A0A0A)"
                      : "background-color: var(--color-secondary, #FFE5B4); color: var(--color-text, #0A0A0A); border-color: var(--color-border, #0A0A0A)"}
                    title={`Quick preset ${i + 1}`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
              <div class="space-y-2">
                {Object.keys(CHARACTER_SETS).map((style) => (
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
                        ? "bg-hot-pink text-white border-black animate-pulse-soft shadow-brutal-sm"
                        : "bg-white border-gray-300 hover:border-black hover:shadow-brutal-sm hover:animate-pop"
                    } active:scale-95`}
                  >
                    <div class="font-mono font-bold">{style}</div>
                    <div class="text-xs opacity-60">
                      {STYLE_DESCRIPTIONS[style as CharacterStyle]}
                    </div>
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
            <div
              class="border-4 rounded-lg p-4 shadow-brutal space-y-4"
              style="background-color: var(--color-base, #FAF9F6); border-color: var(--color-border, #0A0A0A)"
            >
              {/* Width Slider */}
              <div>
                <label
                  class="block text-sm font-mono font-bold mb-2"
                  style="color: var(--color-text, #0A0A0A)"
                >
                  WIDTH •{" "}
                  <span style="color: var(--color-accent, #FF69B4)">
                    {charWidth.value}
                  </span>
                </label>
                <input
                  type="range"
                  min="20"
                  max="200"
                  value={charWidth.value}
                  class="w-full slider-accent"
                  style="accent-color: var(--color-accent, #FF69B4)"
                  onInput={(e) => {
                    const value = parseInt(
                      (e.target as HTMLInputElement).value,
                    );
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
                      if (useColor.value) useRainbow.value = false; // Disable rainbow
                      scheduleReprocess();
                    }}
                    class="w-5 h-5 group-hover:animate-wiggle"
                    style="accent-color: var(--color-accent, #FF69B4)"
                  />
                  <span
                    class="font-mono font-bold transition-colors group-hover:opacity-80"
                    style="color: var(--color-text, #0A0A0A)"
                  >
                    Color mode
                  </span>
                </label>

                <label class="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={useRainbow.value}
                    onChange={(e) => {
                      sounds.toggle();
                      useRainbow.value = (e.target as HTMLInputElement).checked;
                      if (useRainbow.value) useColor.value = false; // Disable regular color
                      scheduleReprocess();
                    }}
                    class="w-5 h-5 group-hover:animate-wiggle"
                    style="accent-color: var(--color-accent, #FF69B4)"
                  />
                  <span
                    class="font-mono font-bold transition-colors group-hover:opacity-80"
                    style="color: var(--color-text, #0A0A0A)"
                  >
                    Rainbow
                  </span>
                </label>

                <label class="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={invertBrightness.value}
                    onChange={(e) => {
                      sounds.toggle();
                      invertBrightness.value =
                        (e.target as HTMLInputElement).checked;
                      scheduleReprocess();
                    }}
                    class="w-5 h-5 group-hover:animate-wiggle"
                    style="accent-color: var(--color-accent, #FF69B4)"
                  />
                  <span
                    class="font-mono font-bold transition-colors group-hover:opacity-80"
                    style="color: var(--color-text, #0A0A0A)"
                  >
                    Invert
                  </span>
                </label>

                <label class="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={enhanceImage.value}
                    onChange={(e) => {
                      sounds.toggle();
                      enhanceImage.value =
                        (e.target as HTMLInputElement).checked;
                      scheduleReprocess();
                    }}
                    class="w-5 h-5 group-hover:animate-wiggle"
                    style="accent-color: var(--color-accent, #FF69B4)"
                  />
                  <span
                    class="font-mono font-bold transition-colors group-hover:opacity-80"
                    style="color: var(--color-text, #0A0A0A)"
                  >
                    Enhance
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
                    class="w-5 h-5 group-hover:animate-wiggle"
                    style="accent-color: var(--color-accent, #FF69B4)"
                  />
                  <span
                    class="font-mono font-bold transition-colors group-hover:opacity-80"
                    style="color: var(--color-text, #0A0A0A)"
                  >
                    Live update
                  </span>
                </label>
              </div>

              {/* Manual Update Button */}
              {!autoUpdate.value && (
                <button
                  onClick={reprocess}
                  class="w-full px-4 py-2 bg-terminal-green text-soft-black border-2 border-soft-black rounded-lg font-mono font-bold hover:animate-jello hover:shadow-brutal-sm transition-all duration-200 active:scale-95"
                >
                  REFRESH
                </button>
              )}
            </div>
          </div>

          {/* Right: ASCII Preview */}
          <div class="lg:col-span-2 space-y-4">
            {/* Output Display - Dynamic sizing */}
            <div
              class="text-terminal-green rounded-lg border-4 shadow-brutal overflow-hidden"
              style="background-color: #000000; border-color: var(--color-border, #0A0A0A)"
            >
              <div
                class="px-4 py-2 border-b-2 flex items-center justify-between"
                style="background-color: rgba(0,0,0,0.3); border-color: var(--color-border, #0A0A0A)"
              >
                <div class="flex space-x-2">
                  <div
                    class="w-3 h-3 bg-red-500 rounded-full hover:animate-pulse-soft cursor-pointer"
                    title="Close (jk)"
                  >
                  </div>
                  <div
                    class="w-3 h-3 bg-yellow-500 rounded-full hover:animate-pulse-soft cursor-pointer"
                    title="Minimize (nope)"
                  >
                  </div>
                  <div
                    class="w-3 h-3 bg-green-500 rounded-full hover:animate-pulse-soft cursor-pointer"
                    title="Full screen (maybe)"
                  >
                  </div>
                </div>
                <span class="text-xs font-mono opacity-60">
                  ~/output/art.txt
                </span>
              </div>
              <div
                class="p-4 overflow-auto custom-scrollbar"
                style="max-height: 70vh"
              >
                <pre
                  class="ascii-display leading-tight"
                  dangerouslySetInnerHTML={{ __html: asciiOutput }}
                  style={`color: ${
                    useColor.value ? "inherit" : "#00FF41"
                  }; font-size: clamp(0.5rem, 1.5vw, 0.75rem)`}
                />
              </div>
            </div>

            {/* Export Actions */}
            <div class="flex flex-wrap gap-3">
              <button
                onClick={downloadText}
                class="flex-1 px-4 py-3 bg-white border-3 border-soft-black rounded-lg font-mono font-bold shadow-brutal hover:shadow-brutal-lg hover:animate-pop active:scale-95 transition-all duration-200 group"
              >
                SAVE AS TEXT
              </button>

              <button
                onClick={downloadHTML}
                class="flex-1 px-4 py-3 bg-peach border-3 border-soft-black rounded-lg font-mono font-bold shadow-brutal hover:shadow-brutal-lg hover:animate-pop active:scale-95 transition-all duration-200 group"
              >
                SAVE AS HTML
              </button>

              <button
                onClick={copyToClipboard}
                class={`flex-1 px-4 py-3 border-3 border-soft-black rounded-lg font-mono font-bold shadow-brutal hover:shadow-brutal-lg ${
                  copiedToClipboard ? "animate-jello" : "hover:animate-pop"
                } active:scale-95 transition-all duration-200 group ${
                  copiedToClipboard
                    ? "bg-terminal-green text-soft-black"
                    : "bg-soft-mint"
                }`}
              >
                {copiedToClipboard ? "COPIED" : "COPY"}
              </button>

              <button
                onClick={handleReset}
                class="flex-1 px-4 py-3 bg-hot-pink text-white border-3 border-soft-black rounded-lg font-mono font-bold shadow-brutal hover:shadow-brutal-lg hover:animate-pop active:scale-95 transition-all duration-200 group"
              >
                NEW IMAGE
              </button>
            </div>

            {/* Keyboard Shortcuts Help */}
            <div class="text-xs font-mono text-soft-black opacity-60 text-center space-x-4">
              <span>
                <kbd class="px-1.5 py-0.5 bg-soft-yellow rounded">Cmd+C</kbd>
                {" "}
                copy
              </span>
              <span>
                <kbd class="px-1.5 py-0.5 bg-soft-yellow rounded">Cmd+Z</kbd>
                {" "}
                reset
              </span>
              <span>
                <kbd class="px-1.5 py-0.5 bg-soft-yellow rounded">1-4</kbd>{" "}
                presets
              </span>
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
            <p class="font-mono font-bold text-lg text-soft-black">
              Processing...
            </p>
            <div class="mt-4 h-2 bg-soft-yellow rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-hot-pink to-terminal-green animate-slide-right">
              </div>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
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
      `}
      </style>
    </div>
  );
}
