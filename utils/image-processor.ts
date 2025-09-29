import { type CharacterStyle, getCharacters } from "./character-sets.ts";

export interface ProcessOptions {
  width?: number;
  height?: number;
  style?: CharacterStyle;
  useColor?: boolean;
  invert?: boolean;
  enhance?: boolean;
  rainbow?: boolean;
}

export class ImageProcessor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    if (typeof document !== "undefined") {
      this.canvas = document.createElement("canvas");
      this.ctx = this.canvas.getContext("2d")!;
    } else {
      // Server-side fallback
      this.canvas = {} as HTMLCanvasElement;
      this.ctx = {} as CanvasRenderingContext2D;
    }
  }

  async loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to load image"));
      };

      img.src = url;
    });
  }

  calculateOptimalSize(
    originalWidth: number,
    originalHeight: number,
    targetWidth?: number,
    maxHeight?: number,
  ): { width: number; height: number } {
    // Default to 80 chars wide if not specified
    targetWidth = targetWidth || 80;
    maxHeight = maxHeight || 40;

    // Account for character aspect ratio (characters are ~2:1 height:width)
    const aspectRatio = originalWidth / originalHeight;
    let newHeight = Math.floor(targetWidth / aspectRatio * 0.5);

    // Clamp to max height
    newHeight = Math.max(1, Math.min(newHeight, maxHeight));
    if (newHeight === maxHeight) {
      targetWidth = Math.floor(newHeight * aspectRatio * 2);
    }

    return { width: Math.max(1, targetWidth), height: newHeight };
  }

  enhanceImage(imageData: ImageData): ImageData {
    const data = imageData.data;

    // Apply contrast enhancement
    const factor = 1.3; // Contrast factor
    for (let i = 0; i < data.length; i += 4) {
      // Apply contrast to RGB channels
      data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
      data[i + 1] = Math.min(
        255,
        Math.max(0, factor * (data[i + 1] - 128) + 128),
      );
      data[i + 2] = Math.min(
        255,
        Math.max(0, factor * (data[i + 2] - 128) + 128),
      );
    }

    return imageData;
  }

  processImage(
    img: HTMLImageElement,
    options: ProcessOptions = {},
  ): string[][] {
    const { width: targetWidth, height: targetHeight } = this
      .calculateOptimalSize(
        img.width,
        img.height,
        options.width,
        options.height,
      );

    // Resize image
    this.canvas.width = targetWidth;
    this.canvas.height = targetHeight;
    this.ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    let imageData = this.ctx.getImageData(0, 0, targetWidth, targetHeight);

    // Apply enhancements if requested
    if (options.enhance) {
      imageData = this.enhanceImage(imageData);
    }

    const chars = getCharacters(options.style || "classic");
    const result: string[][] = [];

    for (let y = 0; y < targetHeight; y++) {
      const row: string[] = [];
      for (let x = 0; x < targetWidth; x++) {
        const idx = (y * targetWidth + x) * 4;
        const r = imageData.data[idx];
        const g = imageData.data[idx + 1];
        const b = imageData.data[idx + 2];

        // Calculate luminance (same formula as Python version)
        let brightness = Math.floor(0.299 * r + 0.587 * g + 0.114 * b);

        if (options.invert) {
          brightness = 255 - brightness;
        }

        // Map to character
        const charIndex = Math.floor(brightness * (chars.length - 1) / 255);
        const char = chars[charIndex];

        // Store character with optional color info
        if (options.rainbow) {
          // Rainbow gradient based on position
          const hue = ((x + y * 2) * 360 / (targetWidth + targetHeight * 2)) %
            360;
          row.push(`<span style="color: hsl(${hue}, 70%, 50%)">${char}</span>`);
        } else if (options.useColor) {
          row.push(`<span style="color: rgb(${r}, ${g}, ${b})">${char}</span>`);
        } else {
          row.push(char);
        }
      }
      result.push(row);
    }

    return result;
  }

  // Convert ASCII array to display string
  formatAscii(ascii: string[][], useColor: boolean = false): string {
    if (useColor) {
      // Return HTML for colored display
      return ascii.map((row) => row.join("")).join("\n");
    } else {
      // Return plain text
      return ascii.map((row) =>
        row.map((cell) => cell.replace(/<[^>]*>/g, "")).join("")
      ).join("\n");
    }
  }
}
