import { useSignal } from "@preact/signals";
import { useEffect, useRef, useState } from "preact/hooks";
import {
  ImageProcessor,
  type ProcessOptions,
} from "../utils/image-processor.ts";
import { type CharacterStyle } from "../utils/character-sets.ts";
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

  const [colorChanged, setColorChanged] = useState(false);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<string>("0"); // Track selected preset

  // Settings with signals for reactive updates
  const selectedStyle = useSignal<CharacterStyle>("classic");
  const charWidth = useSignal(80);
  const colorMode = useSignal<string>("none"); // "none", "color", or "rainbow"
  const invertBrightness = useSignal(false);

  const [isLiveCamera, setIsLiveCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const processor = useRef(new ImageProcessor());
  const updateTimeoutRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);
  const processRequestRef = useRef(0);

  // Detect mobile device
  useEffect(() => {
    isMountedRef.current = true;

    if (typeof window !== "undefined") {
      // Modern best practice: check for touch points instead of userAgent
      const isTouchDevice = navigator.maxTouchPoints > 0;
      setIsMobile(isTouchDevice);
    }

    return () => {
      isMountedRef.current = false;
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
        updateTimeoutRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
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

    globalThis.addEventListener("keydown", handleKeyboard);
    return () => globalThis.removeEventListener("keydown", handleKeyboard);
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
    const requestId = ++processRequestRef.current;
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

      if (!isMountedRef.current || requestId !== processRequestRef.current) {
        return;
      }

      setAsciiOutput(formatted);
      setHtmlOutput(formatted); // Store HTML version for TerminalDisplay
      setImageLoaded(true);
      sounds.success();
      analytics.trackImageConverted(file.size, true);
    } catch (error) {
      if (!isMountedRef.current || requestId !== processRequestRef.current) {
        return;
      }

      console.error("Error processing image:", error);
      showToast("Failed to process image. Please try another file.", "error");
      sounds.error();
      analytics.trackImageConverted(
        file.size,
        false,
        error instanceof Error ? error.message : "unknown",
      );
    } finally {
      if (isMountedRef.current && requestId === processRequestRef.current) {
        setIsProcessing(false);
      }
    }
  };

  // Debounced reprocess for live updates (always auto-update)
  const scheduleReprocess = () => {
    if (!currentImage || !imageLoaded) return;

    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = globalThis.setTimeout(() => {
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

    if (imageLoaded) {
      scheduleReprocess();
    }
  };

  const startCamera = async () => {
    sounds.click();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsLiveCamera(true);
          setImageLoaded(true);
          tickCamera();
        };
      }
    } catch (err) {
      console.error("Camera access failed:", err);
      showToast("Webcam access denied or unavailable.", "error");
      sounds.error();
    }
  };

  const tickCamera = () => {
    if (!isMountedRef.current || !streamRef.current || !videoRef.current) {
      return;
    }

    if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      processVideoFrame(videoRef.current);
    }

    animationFrameIdRef.current = requestAnimationFrame(tickCamera);
  };

  const processVideoFrame = (video: HTMLVideoElement) => {
    try {
      const useColor = colorMode.value === "color";
      const useRainbow = colorMode.value === "rainbow";

      const options: ProcessOptions = {
        width: charWidth.value,
        style: selectedStyle.value,
        useColor: useColor,
        rainbow: useRainbow,
        invert: invertBrightness.value,
      };

      const ascii = processor.current.processImage(video, options);
      const formatted = processor.current.formatAscii(
        ascii,
        useColor || useRainbow,
      );

      setAsciiOutput(formatted);
      setHtmlOutput(formatted);
    } catch (err) {
      console.error("Error processing video frame:", err);
    }
  };

  const handleReset = () => {
    processRequestRef.current++;
    sounds.click();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    setIsLiveCamera(false);

    setImageLoaded(false);
    setAsciiOutput("");
    setHtmlOutput("");
    setCurrentImage(null);
    // Reset all change trackers and settings
    setStyleChanged(false);
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
      globalThis.addEventListener("paste", handlePaste);
      return () => globalThis.removeEventListener("paste", handlePaste);
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
      {/* Hidden video element for live camera feed */}
      <video
        ref={videoRef}
        autoplay
        playsinline
        muted
        class="hidden"
        style="width: 0; height: 0; display: none;"
      />

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
                <span style="--char-index: 5">t</span>
                <span style="--char-index: 6">e</span>
                <span style="--char-index: 7">x</span>
                <span style="--char-index: 8">t</span>
                <span style="--char-index: 9">&nbsp;</span>
                <span style="--char-index: 10">a</span>
                <span style="--char-index: 11">r</span>
                <span style="--char-index: 12">t</span>
              </span>
            </h2>
          </div>

          {/* Drop Zone */}
          <div
            class={`relative border-4 md:border-8 border-dashed transition-all duration-300 rounded-xl p-6 sm:p-12 md:p-16 lg:p-24 cursor-pointer group ${
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
                class="opacity-70 text-xs sm:text-sm font-mono"
                style="color: var(--color-text, #0A0A0A)"
              >
                JPG PNG GIF WebP • 10MB max
              </p>
            </div>
          </div>

          {/* Webcam Scrying Mirror Button */}
          <div class="flex justify-center pt-2">
            <button
              type="button"
              onClick={startCamera}
              class="px-6 py-4 border-4 rounded-2xl font-mono font-black text-sm md:text-base shadow-brutal hover:shadow-brutal-lg hover:-translate-y-1 transition-all active:scale-95 animate-pulse-soft flex items-center gap-3"
              style="background-color: var(--color-secondary, #FFE5B4); color: var(--color-text, #0A0A0A); border-color: var(--color-border, #0A0A0A);"
            >
              <span class="text-2xl animate-spin">🔮</span>
              <span>WEBCAM SCRYING MIRROR</span>
            </button>
          </div>

          {/* Camera Capture Button (Mobile-only) */}
          {isMobile && (
            <div class="flex flex-col gap-3 items-stretch justify-center">
              <button
                type="button"
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
        <div class="space-y-6 md:space-y-8 flex flex-col">
          {/* Live scrying mirror indicator */}
          {isLiveCamera && (
            <div
              class="flex items-center gap-2 px-3 py-1.5 border-3 rounded-xl font-mono text-xs font-bold animate-pulse-soft max-w-max self-start"
              style="background-color: var(--color-secondary, #FFE5B4); border-color: var(--color-border, #0A0A0A); color: var(--color-text, #0A0A0A); position: relative;"
            >
              <span class="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping absolute">
              </span>
              <span class="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span class="ml-1 uppercase tracking-wide">
                🔮 LIVE SCRYING MIRROR ACTIVE
              </span>
            </div>
          )}

          {/* ASCII Output - Priority #1! */}
          <TerminalDisplay
            content={asciiOutput.replace(/<[^>]*>/g, "")}
            htmlContent={htmlOutput.includes("<span") ? htmlOutput : undefined}
            isLoading={isProcessing}
            filename="image-ascii-art"
            terminalPath="~/output/image-art.txt"
            showShuffleButton={false}
          />

          {/* Compact Controls - Below Output */}
          <div class="space-y-4 md:space-y-6">
            {/* Quick Presets Pills Row */}
            <div class="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
              <span class="font-mono text-xs font-bold opacity-60 mr-1 uppercase">
                Presets:
              </span>
              {PRESETS.map((preset, index) => (
                <button
                  type="button"
                  key={preset.name}
                  onClick={() => applyPreset(index)}
                  class={`px-3 py-1.5 text-xs font-mono font-bold border-3 rounded-xl transition-all active:scale-95 shadow-brutal-sm hover:translate-y-[-1px]`}
                  style={selectedPresetIndex === index.toString()
                    ? "background-color: var(--color-accent, #FF69B4); color: var(--color-base, #FAF9F6); border-color: var(--color-border, #0A0A0A);"
                    : "background-color: var(--color-secondary, #FFE5B4); color: var(--color-text, #0A0A0A); border-color: var(--color-border, #0A0A0A);"}
                >
                  {preset.name}
                </button>
              ))}
            </div>

            {/* Two Magic Dropdowns - Style and Color */}
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              <MagicDropdown
                label="Style"
                options={STYLE_OPTIONS}
                value={selectedStyle.value}
                onChange={(value) => {
                  selectedStyle.value = value as CharacterStyle;
                  setStyleChanged(true);
                  setSelectedPresetIndex("-1");
                }}
                changed={styleChanged}
              />

              <MagicDropdown
                label="Color"
                options={COLOR_OPTIONS}
                value={colorMode.value}
                onChange={(value) => {
                  colorMode.value = value;
                  setColorChanged(true);
                  setSelectedPresetIndex("-1");
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
                  setSelectedPresetIndex("-1");
                  if (Math.random() < 0.1) sounds.slide(value);
                }}
              />
              <div
                class="flex justify-between text-xs font-mono opacity-60 mt-2"
                style="color: var(--color-text, #0A0A0A)"
              >
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
                    invertBrightness.value =
                      (e.target as HTMLInputElement).checked;
                    setSelectedPresetIndex("-1");
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
                type="button"
                onClick={handleReset}
                class="px-6 py-3 md:px-8 md:py-4 border-4 rounded-2xl font-mono font-black text-sm md:text-base shadow-brutal hover:shadow-brutal-lg hover:-translate-y-1 transition-all active:scale-95"
                style="background-color: var(--color-accent, #FF69B4); color: var(--color-base, #FAF9F6); border-color: var(--color-border, #0A0A0A)"
              >
                {isLiveCamera ? "STOP STREAM" : "NEW IMAGE"}
              </button>
            </div>

            {/* Keyboard Shortcuts Help */}
            <div
              class="text-xs font-mono opacity-60 text-center space-x-4"
              style="color: var(--color-text, #0A0A0A)"
            >
              <span>
                <kbd
                  class="px-1.5 py-0.5 rounded"
                  style="background-color: var(--color-secondary, #FFE5B4)"
                >
                  Cmd+Z
                </kbd>{" "}
                reset
              </span>
              <span>
                <kbd
                  class="px-1.5 py-0.5 rounded"
                  style="background-color: var(--color-secondary, #FFE5B4)"
                >
                  1-4
                </kbd>{" "}
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
