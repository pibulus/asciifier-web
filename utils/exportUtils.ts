// ===================================================================
// EXPORT UTILITIES - Shared export functions for ASCII art
// ===================================================================
// Used by both TextToAscii and AsciiGallery for consistent export

import { sounds } from "./sounds.ts";
import { analytics } from "./analytics.ts";

/**
 * Copy ASCII art to clipboard with optional formatting
 * Supports plain text, email (HTML), and messaging app formats
 */
export async function copyToClipboard(
  plainText: string,
  htmlContent: string,
  format: "plain" | "email" | "message" = "email",
): Promise<boolean> {
  analytics.trackExport(format === "email" ? "html" : "plain");

  try {
    // Strip ANSI codes for plain text
    const cleanText = plainText.replace(/\u001b\[[0-9;]*m/g, "");

    let textToCopy = cleanText;
    let htmlToCopy = "";

    if (format === "email") {
      // Rich HTML for email (Gmail, Outlook, etc.)
      htmlToCopy = htmlContent.includes("<span")
        ? `<pre style="font-family: 'Courier New', 'Monaco', 'Menlo', monospace; white-space: pre; line-height: 1.2; font-size: 12px; margin: 0; background: black; color: white; padding: 8px; border-radius: 4px;">${htmlContent}</pre>`
        : `<pre style="font-family: 'Courier New', 'Monaco', 'Menlo', monospace; white-space: pre; line-height: 1.2; font-size: 12px; margin: 0;">${cleanText}</pre>`;
      textToCopy = cleanText;
    } else if (format === "message") {
      // Wrapped in backticks for messaging apps (Discord, WhatsApp, Slack)
      textToCopy = `\`\`\`\n${cleanText}\n\`\`\``;
      htmlToCopy = `<pre>${textToCopy}</pre>`;
    } else {
      // Plain text
      textToCopy = cleanText;
    }

    // Try modern clipboard API with both formats
    if (navigator.clipboard && navigator.clipboard.write && htmlToCopy) {
      const clipboardItem = new ClipboardItem({
        "text/plain": new Blob([textToCopy], { type: "text/plain" }),
        "text/html": new Blob([htmlToCopy], { type: "text/html" }),
      });
      await navigator.clipboard.write([clipboardItem]);
    } else {
      // Fallback for older browsers - just plain text
      await navigator.clipboard.writeText(textToCopy);
    }

    sounds.copy();
    return true;
  } catch (err) {
    sounds.error();
    alert("Copy failed. Try again.");
    return false;
  }
}

/**
 * Download ASCII art as a plain text file
 */
export function downloadText(
  content: string,
  htmlContent: string,
  filename: string = "ascii-art",
): void {
  analytics.trackExport("text");

  // Strip HTML tags and ANSI codes for plain text download
  let plainText = content;

  // If it contains HTML, extract just the text
  if (htmlContent && htmlContent.includes("<span")) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;
    plainText = tempDiv.textContent || tempDiv.innerText || "";
  }

  // Also strip any remaining ANSI codes
  plainText = plainText.replace(/\u001b\[[0-9;]*m/g, "");

  const blob = new Blob([plainText], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  sounds.success();
}

/**
 * Apply visual effects to canvas context based on effect type
 */
function applyCanvasEffect(
  ctx: CanvasRenderingContext2D,
  effect: string = "neon",
): void {
  // Reset any previous filters
  ctx.filter = "none";
  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";

  switch (effect) {
    case "none":
      // No effects
      break;

    case "neon":
      // Bright triple-layer glow
      ctx.filter = "saturate(2.2) brightness(1.2)";
      ctx.shadowBlur = 12;
      ctx.shadowColor = "currentColor";
      break;

    case "retro":
      // CRT-style with blur and contrast
      ctx.filter = "saturate(1.4) contrast(1.2) blur(0.3px)";
      ctx.shadowBlur = 3;
      ctx.shadowColor = "currentColor";
      break;

    case "thermal":
      // Heat vision with hue shift
      ctx.filter = "saturate(2) contrast(1.8) brightness(1.3) hue-rotate(20deg)";
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#ff6600";
      break;

    case "hologram":
      // Iridescent shimmer
      ctx.filter = "saturate(1.8) brightness(1.5)";
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#00ffff";
      ctx.globalAlpha = 0.9;
      break;

    case "glitch":
    case "cyberpunk":
      // Chromatic aberration effects handled separately in rendering
      ctx.filter = "saturate(2.5) contrast(1.5)";
      break;

    default:
      // Default to neon
      ctx.filter = "saturate(2.2) brightness(1.2)";
      ctx.shadowBlur = 12;
      ctx.shadowColor = "currentColor";
  }
}

/**
 * Render character with chromatic aberration effect
 */
function drawChromaticChar(
  ctx: CanvasRenderingContext2D,
  char: string,
  x: number,
  y: number,
  baseColor: string,
  effect: string,
): void {
  const originalGlobalAlpha = ctx.globalAlpha;

  if (effect === "glitch") {
    // Heavy chromatic aberration - 4 color layers
    // Magenta left
    ctx.fillStyle = "#ff00ff";
    ctx.globalAlpha = 0.6;
    ctx.fillText(char, x - 3, y);

    // Cyan right
    ctx.fillStyle = "#00ffff";
    ctx.globalAlpha = 0.6;
    ctx.fillText(char, x + 3, y);

    // Red left (inner)
    ctx.fillStyle = "#ff0000";
    ctx.globalAlpha = 0.4;
    ctx.fillText(char, x - 2, y);

    // Green right (inner)
    ctx.fillStyle = "#00ff00";
    ctx.globalAlpha = 0.4;
    ctx.fillText(char, x + 2, y);

    // Base color on top
    ctx.fillStyle = baseColor;
    ctx.globalAlpha = 0.8;
    ctx.fillText(char, x, y);
  } else if (effect === "cyberpunk") {
    // Subtle chromatic aberration
    // Magenta left
    ctx.fillStyle = "#ff00ff";
    ctx.globalAlpha = 0.5;
    ctx.fillText(char, x - 1, y);

    // Cyan right
    ctx.fillStyle = "#00ffff";
    ctx.globalAlpha = 0.5;
    ctx.fillText(char, x + 1, y);

    // Base color on top
    ctx.fillStyle = baseColor;
    ctx.globalAlpha = 0.9;
    ctx.fillText(char, x, y);
  } else if (effect === "hologram") {
    // Rainbow shimmer layers
    ctx.fillStyle = "#00ffff";
    ctx.globalAlpha = 0.3;
    ctx.fillText(char, x, y);

    ctx.fillStyle = "#ff00ff";
    ctx.globalAlpha = 0.3;
    ctx.fillText(char, x, y);

    // Base color on top
    ctx.fillStyle = baseColor;
    ctx.globalAlpha = 0.7;
    ctx.fillText(char, x, y);
  } else {
    // Normal rendering
    ctx.fillStyle = baseColor;
    ctx.fillText(char, x, y);
  }

  ctx.globalAlpha = originalGlobalAlpha;
}

/**
 * Download ASCII art as a PNG image with visual effects
 * Renders the art to a canvas with proper colors and effects, then exports as image
 */
export function downloadPNG(
  asciiElementSelector: string = ".ascii-display",
  filename: string = "ascii-art",
  visualEffect: string = "neon",
): void {
  analytics.trackExport("png");

  try {
    // Get the ASCII display element
    const asciiElement = document.querySelector(asciiElementSelector);
    if (!asciiElement) {
      console.error("ASCII display element not found");
      return;
    }

    // Parse HTML to extract text and colors character by character
    type CharData = { char: string; color: string };
    type LineData = { chars: CharData[] };
    const lines: LineData[] = [];
    let currentLine: CharData[] = [];

    // Function to extract color from a span element
    const getColorFromElement = (element: Element): string => {
      if (element.tagName === "SPAN") {
        const style = (element as HTMLElement).style.color;
        if (style) return style;
      }
      return "#00FF41"; // Default green
    };

    // Process HTML content recursively
    const processNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || "";
        const parentColor = node.parentElement
          ? getColorFromElement(node.parentElement)
          : "#00FF41";

        for (const char of text) {
          if (char === "\n") {
            if (currentLine.length > 0) {
              lines.push({ chars: currentLine });
              currentLine = [];
            }
          } else {
            currentLine.push({ char, color: parentColor });
          }
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;

        if (element.tagName === "BR") {
          if (currentLine.length > 0) {
            lines.push({ chars: currentLine });
            currentLine = [];
          }
        } else if (
          element.tagName === "SPAN" && element.childNodes.length === 1 &&
          element.childNodes[0].nodeType === Node.TEXT_NODE
        ) {
          // Direct span with text
          const text = element.textContent || "";
          const color = getColorFromElement(element);

          for (const char of text) {
            if (char === "\n") {
              if (currentLine.length > 0) {
                lines.push({ chars: currentLine });
                currentLine = [];
              }
            } else {
              currentLine.push({ char, color });
            }
          }
        } else {
          // Recursively process children
          for (const child of Array.from(node.childNodes)) {
            processNode(child);
          }
        }
      }
    };

    // Process all child nodes
    Array.from(asciiElement.childNodes).forEach(processNode);

    // Add remaining line
    if (currentLine.length > 0) {
      lines.push({ chars: currentLine });
    }

    // Keep only non-empty lines
    const nonEmptyLines = lines.filter((line) =>
      line.chars.some((c) => c.char.trim().length > 0)
    );

    if (nonEmptyLines.length === 0) {
      console.error("No ASCII text found");
      return;
    }

    // Calculate canvas dimensions
    const fontSize = 12;
    const charWidth = fontSize * 0.6;
    const lineHeight = fontSize * 1.2;
    const padding = 40;

    // Find the maximum line width
    const maxLineLength = Math.max(
      ...nonEmptyLines.map((line) => line.chars.length),
    );

    const canvasWidth = (maxLineLength * charWidth) + (padding * 2);
    const canvasHeight = (nonEmptyLines.length * lineHeight) + (padding * 2);

    // Create high-DPI canvas
    const canvas = document.createElement("canvas");
    const scale = 2;
    canvas.width = canvasWidth * scale;
    canvas.height = canvasHeight * scale;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("Could not get canvas context");
      return;
    }

    // Scale for high DPI
    ctx.scale(scale, scale);

    // Fill black background
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Set font
    ctx.font = `${fontSize}px monospace`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    // Apply visual effects to context
    applyCanvasEffect(ctx, visualEffect);

    // Determine if we need chromatic rendering
    const needsChromatic = visualEffect === "glitch" ||
      visualEffect === "cyberpunk" || visualEffect === "hologram";

    // Draw each character with its exact color and effects
    nonEmptyLines.forEach((line, lineIndex) => {
      const y = padding + (lineIndex * lineHeight);

      line.chars.forEach((charData, charIndex) => {
        const x = padding + (charIndex * charWidth);

        // Apply effect-specific rendering
        if (needsChromatic) {
          drawChromaticChar(ctx, charData.char, x, y, charData.color, visualEffect);
        } else {
          // Standard rendering with applied effects
          ctx.fillStyle = charData.color;
          ctx.fillText(charData.char, x, y);

          // For neon/thermal effects, draw multiple passes for stronger glow
          if (visualEffect === "neon") {
            ctx.fillText(charData.char, x, y);
            ctx.fillText(charData.char, x, y);
          } else if (visualEffect === "thermal") {
            ctx.fillText(charData.char, x, y);
          }
        }
      });
    });

    // Convert canvas to blob and download
    canvas.toBlob((blob) => {
      if (!blob) {
        console.error("Failed to create blob");
        sounds.error();
        alert("Failed to generate PNG. Please try again.");
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.png`;
      a.click();
      URL.revokeObjectURL(url);
      sounds.success();
    }, "image/png");
  } catch (error) {
    console.error("Error generating PNG:", error);
    sounds.error();
    alert("Failed to export as PNG. Please try again.");
  }
}
