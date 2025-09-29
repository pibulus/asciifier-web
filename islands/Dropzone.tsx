import { useSignal } from "@preact/signals";
import { useRef, useState } from "preact/hooks";
import { ImageProcessor, type ProcessOptions } from "../utils/image-processor.ts";
import { CHARACTER_SETS, STYLE_DESCRIPTIONS, type CharacterStyle } from "../utils/character-sets.ts";

export default function Dropzone() {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [asciiOutput, setAsciiOutput] = useState<string>("");
  const [imageLoaded, setImageLoaded] = useState(false);

  // Settings
  const selectedStyle = useSignal<CharacterStyle>("classic");
  const charWidth = useSignal(80);
  const useColor = useSignal(false);
  const invertBrightness = useSignal(false);
  const enhanceImage = useSignal(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const processor = useRef(new ImageProcessor());

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

  const reprocess = async () => {
    if (fileInputRef.current?.files?.[0]) {
      await processImage(fileInputRef.current.files[0]);
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
    body { background: #000; color: #fff; font-family: monospace; font-size: 10px; line-height: 1.2; padding: 20px; }
    pre { margin: 0; }
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(asciiOutput.replace(/<[^>]*>/g, ''));
    alert('Copied to clipboard!');
  };

  // Add paste event listener
  if (typeof window !== 'undefined') {
    window.addEventListener('paste', handlePaste);
  }

  return (
    <div class="space-y-8">
      {/* Drop Zone */}
      {!imageLoaded && (
        <div
          class={`border-4 border-dashed transition-all duration-300 rounded-lg p-16 text-center cursor-pointer ${
            isDragging
              ? 'border-hot-pink bg-peach scale-102 shadow-brutal-lg'
              : 'border-black bg-white hover:bg-peach hover:scale-102 shadow-brutal'
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

          <div class="space-y-4">
            <div class="text-6xl">🎨</div>
            <h2 class="text-2xl font-bold">
              {isDragging ? "Drop it like it's hot!" : "Drag & Drop Your Image"}
            </h2>
            <p class="text-gray-600">
              or click to select • or paste from clipboard (Cmd+V)
            </p>
            <p class="text-sm text-gray-500">
              Supports JPG, PNG, GIF, WebP
            </p>
          </div>
        </div>
      )}

      {/* Controls */}
      {imageLoaded && (
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6 bg-white border-4 border-black shadow-brutal rounded-lg">
          {/* Style Selector */}
          <div>
            <label class="block text-sm font-bold mb-2">Character Style</label>
            <select
              class="w-full p-2 border-2 border-black rounded focus:border-hot-pink"
              value={selectedStyle.value}
              onChange={(e) => {
                selectedStyle.value = (e.target as HTMLSelectElement).value as CharacterStyle;
                reprocess();
              }}
            >
              {Object.keys(CHARACTER_SETS).map(style => (
                <option value={style}>
                  {style} - {STYLE_DESCRIPTIONS[style as CharacterStyle]}
                </option>
              ))}
            </select>
          </div>

          {/* Width Control */}
          <div>
            <label class="block text-sm font-bold mb-2">
              Width: {charWidth.value} chars
            </label>
            <input
              type="range"
              min="20"
              max="200"
              value={charWidth.value}
              class="w-full"
              onInput={(e) => {
                charWidth.value = parseInt((e.target as HTMLInputElement).value);
              }}
              onChange={reprocess}
            />
          </div>

          {/* Toggles */}
          <div class="space-y-2">
            <label class="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={useColor.value}
                onChange={(e) => {
                  useColor.value = (e.target as HTMLInputElement).checked;
                  reprocess();
                }}
                class="w-4 h-4"
              />
              <span class="font-bold">Use Colors</span>
            </label>

            <label class="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={invertBrightness.value}
                onChange={(e) => {
                  invertBrightness.value = (e.target as HTMLInputElement).checked;
                  reprocess();
                }}
                class="w-4 h-4"
              />
              <span class="font-bold">Invert</span>
            </label>

            <label class="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={enhanceImage.value}
                onChange={(e) => {
                  enhanceImage.value = (e.target as HTMLInputElement).checked;
                  reprocess();
                }}
                class="w-4 h-4"
              />
              <span class="font-bold">Enhance</span>
            </label>
          </div>
        </div>
      )}

      {/* ASCII Output */}
      {asciiOutput && (
        <div class="space-y-4">
          <div class="bg-black text-terminal-green p-6 rounded-lg border-4 border-black shadow-brutal overflow-x-auto">
            <pre
              class="ascii-display text-xs leading-tight"
              dangerouslySetInnerHTML={{ __html: useColor.value ? asciiOutput : asciiOutput }}
              style={useColor.value ? {} : { color: '#00FF41' }}
            />
          </div>

          {/* Export Buttons */}
          <div class="flex flex-wrap gap-4 justify-center">
            <button
              onClick={downloadText}
              class="px-6 py-3 bg-white border-4 border-black rounded-lg font-bold shadow-brutal hover:shadow-brutal-lg hover:scale-102 transition-all"
            >
              📄 Download TXT
            </button>

            <button
              onClick={downloadHTML}
              class="px-6 py-3 bg-peach border-4 border-black rounded-lg font-bold shadow-brutal hover:shadow-brutal-lg hover:scale-102 transition-all"
            >
              🌐 Download HTML
            </button>

            <button
              onClick={copyToClipboard}
              class="px-6 py-3 bg-soft-mint border-4 border-black rounded-lg font-bold shadow-brutal hover:shadow-brutal-lg hover:scale-102 transition-all"
            >
              📋 Copy to Clipboard
            </button>

            <button
              onClick={() => {
                setImageLoaded(false);
                setAsciiOutput("");
              }}
              class="px-6 py-3 bg-hot-pink text-white border-4 border-black rounded-lg font-bold shadow-brutal hover:shadow-brutal-lg hover:scale-102 transition-all"
            >
              🔄 New Image
            </button>
          </div>
        </div>
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white p-8 rounded-lg border-4 border-black shadow-brutal-lg">
            <div class="text-4xl animate-spin">🎨</div>
            <p class="mt-4 font-bold">Processing your art...</p>
          </div>
        </div>
      )}
    </div>
  );
}