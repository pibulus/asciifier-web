// ===================================================================
// EXPORT UTILITIES - Shared export functions for ASCII art
// ===================================================================
// Used by both TextToAscii and AsciiGallery for consistent export

import { toPng } from "html-to-image";
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
 * Download ASCII art as a PNG image using in-place capture
 * Temporarily modifies the original element for perfect dimensions, then restores
 */
export async function downloadPNG(
  asciiElementSelector: string = ".ascii-display",
  filename: string = "ascii-art",
): Promise<void> {
  analytics.trackExport("png");

  try {
    // Get the ASCII display element
    const asciiElement = document.querySelector(asciiElementSelector) as HTMLElement;
    if (!asciiElement) {
      console.error("ASCII display element not found");
      sounds.error();
      alert("Could not find ASCII art to export.");
      return;
    }

    // Calculate actual text dimensions
    const lines = asciiElement.innerText.split('\n').filter(line => line.trim().length > 0);
    const maxLineLength = Math.max(...lines.map(line => line.length));

    // Get font size from computed styles or use defaults
    const computedStyles = window.getComputedStyle(asciiElement);
    const fontSize = parseInt(computedStyles.fontSize) || 16;

    // Monospace character dimensions (more generous for effects)
    const charWidth = fontSize * 0.65; // Slightly wider to prevent clipping
    const lineHeight = fontSize * 1.4; // Matches the line-height in style

    // Calculate perfect content dimensions with extra buffer
    const contentWidth = (maxLineLength * charWidth) + 10; // Extra 10px buffer for effects
    const contentHeight = lines.length * lineHeight;
    const padding = 40;

    // Store original styles to restore later
    const originalWidth = asciiElement.style.width;
    const originalHeight = asciiElement.style.height;
    const originalMaxWidth = asciiElement.style.maxWidth;
    const originalMaxHeight = asciiElement.style.maxHeight;
    const originalOverflow = asciiElement.style.overflow;
    const originalOpacity = asciiElement.style.opacity;

    // Get parent container and store scroll position
    const parentContainer = asciiElement.parentElement;
    const scrollTop = parentContainer?.scrollTop || 0;

    // Temporarily set exact dimensions for perfect capture
    asciiElement.style.width = `${contentWidth}px`;
    asciiElement.style.height = `${contentHeight}px`;
    asciiElement.style.maxWidth = "none";
    asciiElement.style.maxHeight = "none";
    asciiElement.style.overflow = "visible";
    asciiElement.style.opacity = "1";

    // Force layout recalculation
    asciiElement.offsetHeight;

    // Capture with html-to-image with exact dimensions
    const dataUrl = await toPng(asciiElement, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: "#000000",
      width: contentWidth + (padding * 2),
      height: contentHeight + (padding * 2),
      style: {
        padding: `${padding}px`,
      }
    });

    // Immediately restore original styles
    asciiElement.style.width = originalWidth;
    asciiElement.style.height = originalHeight;
    asciiElement.style.maxWidth = originalMaxWidth;
    asciiElement.style.maxHeight = originalMaxHeight;
    asciiElement.style.overflow = originalOverflow;
    asciiElement.style.opacity = originalOpacity;

    // Restore scroll position
    if (parentContainer) {
      parentContainer.scrollTop = scrollTop;
    }

    // Download
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${filename}.png`;
    a.click();

    sounds.success();
  } catch (error) {
    console.error("Error generating PNG:", error);
    sounds.error();
    alert("Failed to export as PNG. Please try again.");
  }
}
