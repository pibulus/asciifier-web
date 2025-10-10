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
import { showToast } from "../components/Toast.tsx";
import { MagicDropdown } from "../components/MagicDropdown.tsx";
import { TerminalDisplay } from "../components/TerminalDisplay.tsx";

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

// Dropdown options for MagicDropdown components
const STYLE_OPTIONS = [
  { name: "Classic", value: "classic" },
  { name: "Blocks", value: "blocks" },
  { name: "Dots", value: "dots" },
  { name: "Hearts", value: "hearts" },
  { name: "Minimal", value: "minimal" },
  { name: "Retro", value: "retro" },
  { name: "Shades", value: "shades" },
  { name: "Geometric", value: "geometric" },
  { name: "Gradient", value: "gradient" },
];

const PRESET_OPTIONS = [
  { name: "Classic", value: "0" },
  { name: "Color", value: "1" },
  { name: "Inverted", value: "2" },
  { name: "Detailed", value: "3" },
];

const COLOR_OPTIONS = [
  { name: "None", value: "none" },
  { name: "Color", value: "color" },
  { name: "Rainbow", value: "rainbow" },
];

export default function Dropzone() {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [asciiOutput, setAsciiOutput] = useState<string>("");
  const [htmlOutput, setHtmlOutput] = useState<string>("");
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentImage, setCurrentImage] = useState<File | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Track which dropdowns have been changed (for visual feedback)
  const [styleChanged, setStyleChanged] = useState(false);
  const [presetChanged, setPresetChanged] = useState(false);
  const [colorChanged, setColorChanged] = useState(false);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<string>("0"); // Track selected preset

  // Settings with signals for reactive updates
  const selectedStyle = useSignal<CharacterStyle>("classic");
  const charWidth = useSignal(80);
  const colorMode = useSignal<string>("none"); // "none", "color", or "rainbow"
  const invertBrightness = useSignal(false);

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
      // Number keys for presets (1-4)
      if (e.key >= "1" && e.key <= "4") {
        const presetIndex = parseInt(e.key) - 1;
        applyPreset(presetIndex);
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

      const useColor = colorMode.value === "color";
      const useRainbow = colorMode.value === "rainbow";

      const options: ProcessOptions = {
        width: charWidth.value,
        style: selectedStyle.value,
        useColor: useColor,
        rainbow: useRainbow,
        invert: invertBrightness.value,
        enhance: false, // Simplified - removed enhance toggle
      };

      const ascii = processor.current.processImage(img, options);
      let formatted = processor.current.formatAscii(
        ascii,
        useColor || useRainbow,
      );

      // Maybe add secret watermark
      formatted = easterEggs.addSecretWatermark(formatted);

      setAsciiOutput(formatted);
      setHtmlOutput(formatted); // Store HTML version for TerminalDisplay
      setImageLoaded(true);
      sounds.success();
      analytics.trackImageConverted(file.size, true);
    } catch (error) {
      console.error("Error processing image:", error);
      showToast("Failed to process image. Please try another file.", "error");
      sounds.error();
      analytics.trackImageConverted(
        file.size,
        false,
        error instanceof Error ? error.message : "unknown",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Debounced reprocess for live updates (always auto-update)
  const scheduleReprocess = () => {
    if (!currentImage || !imageLoaded) return;

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

  const applyPreset = (presetIndex: number) => {
    const preset = PRESETS[presetIndex];
    if (!preset) return;

    sounds.click();
    selectedStyle.value = preset.style as CharacterStyle;
    colorMode.value = preset.color ? "color" : "none";
    charWidth.value = preset.width;
    invertBrightness.value = preset.invert || false;
    setSelectedPresetIndex(presetIndex.toString());
    setPresetChanged(true);

    if (imageLoaded) {
      scheduleReprocess();
    }
  };

  const handleReset = () => {
    sounds.click();
    setImageLoaded(false);
    setAsciiOutput("");
    setHtmlOutput("");
    setCurrentImage(null);
    // Reset all change trackers and settings
    setStyleChanged(false);
    setPresetChanged(false);
    setColorChanged(false);
    setSelectedPresetIndex("0");
    // Reset signals to defaults
    selectedStyle.value = "classic";
    charWidth.value = 80;
    colorMode.value = "none";
    invertBrightness.value = false;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
  };

  // Add paste event listener
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("paste", handlePaste);
      return () => window.removeEventListener("paste", handlePaste);
    }
  }, []);

  // React to setting changes and cleanup timeout on unmount
  useEffect(() => {
    if (imageLoaded) {
      scheduleReprocess();
    }

    // Cleanup: clear any pending timeout when component unmounts or dependencies change
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
        updateTimeoutRef.current = null;
      }
    };
  }, [
    selectedStyle.value,
    charWidth.value,
    colorMode.value,
    invertBrightness.value,
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

      {/* Image Loaded State - Output First! */}
      {imageLoaded && (
        <div class="space-y-6 md:space-y-8">
          {/* ASCII Output - Priority #1! */}
          <TerminalDisplay
            content={asciiOutput.replace(/<[^>]*>/g, "")}
            htmlContent={htmlOutput}
            isLoading={isProcessing}
            filename="image-ascii-art"
            terminalPath="~/output/image-art.txt"
            showShuffleButton={false}
          />

          {/* Compact Controls - Below Output */}
          <div class="space-y-4 md:space-y-6">
            {/* Three Magic Dropdowns - Match TextToAscii layout */}
            <div class="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6">
              <MagicDropdown
                label="Style"
                options={STYLE_OPTIONS}
                value={selectedStyle.value}
                onChange={(value) => {
                  selectedStyle.value = value as CharacterStyle;
                  setStyleChanged(true);
                }}
                changed={styleChanged}
              />

              <MagicDropdown
                label="Preset"
                options={PRESET_OPTIONS}
                value={selectedPresetIndex}
                onChange={(value) => {
                  const presetIndex = parseInt(value);
                  applyPreset(presetIndex);
                }}
                changed={presetChanged}
              />

              <MagicDropdown
                label="Color"
                options={COLOR_OPTIONS}
                value={colorMode.value}
                onChange={(value) => {
                  colorMode.value = value;
                  setColorChanged(true);
                }}
                changed={colorChanged}
              />
            </div>

            {/* Width Slider */}
            <div
              class="border-4 rounded-2xl p-4 md:p-6 shadow-brutal"
              style="background-color: var(--color-base, #FAF9F6); border-color: var(--color-border, #0A0A0A)"
            >
              <label
                class="block text-sm md:text-base font-mono font-bold mb-3"
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
                  const value = parseInt((e.target as HTMLInputElement).value);
                  charWidth.value = value;
                  if (Math.random() < 0.1) sounds.slide(value);
                }}
              />
              <div class="flex justify-between text-xs font-mono opacity-60 mt-2" style="color: var(--color-text, #0A0A0A)">
                <span>smol</span>
                <span>just right</span>
                <span>thicc</span>
              </div>
            </div>

            {/* Bottom Controls: Invert + New Image */}
            <div class="flex items-center gap-4">
              <label class="flex items-center space-x-3 cursor-pointer group flex-1">
                <input
                  type="checkbox"
                  checked={invertBrightness.value}
                  onChange={(e) => {
                    sounds.toggle();
                    invertBrightness.value = (e.target as HTMLInputElement).checked;
                  }}
                  class="w-5 h-5 group-hover:animate-wiggle"
                  style="accent-color: var(--color-accent, #FF69B4)"
                />
                <span
                  class="font-mono font-bold text-sm md:text-base transition-colors group-hover:opacity-80"
                  style="color: var(--color-text, #0A0A0A)"
                >
                  Invert
                </span>
              </label>

              <button
                onClick={handleReset}
                class="px-6 py-3 md:px-8 md:py-4 border-4 rounded-2xl font-mono font-black text-sm md:text-base shadow-brutal hover:shadow-brutal-lg hover:-translate-y-1 transition-all active:scale-95"
                style="background-color: var(--color-accent, #FF69B4); color: var(--color-base, #FAF9F6); border-color: var(--color-border, #0A0A0A)"
              >
                NEW IMAGE
              </button>
            </div>

            {/* Keyboard Shortcuts Help */}
            <div class="text-xs font-mono opacity-60 text-center space-x-4" style="color: var(--color-text, #0A0A0A)">
              <span>
                <kbd class="px-1.5 py-0.5 rounded" style="background-color: var(--color-secondary, #FFE5B4)">Cmd+Z</kbd>
                {" "}
                reset
              </span>
              <span>
                <kbd class="px-1.5 py-0.5 rounded" style="background-color: var(--color-secondary, #FFE5B4)">1-4</kbd>{" "}
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
        /* Processing overlay animation */
        @keyframes slide-right {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-slide-right {
          animation: slide-right 1.5s ease-in-out infinite;
        }

        /* Smooth interactions */
        input[type="range"]:active {
          transform: scale(1.02);
        }
      `}
      </style>
    </div>
  );
}
