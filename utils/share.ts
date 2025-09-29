// Share functionality - Pablo style
// "No integrations, just URLs that work"

export function generateShareableAscii(ascii: string, style: string): string {
  // Create a shareable URL with the ASCII art encoded
  const data = {
    art: ascii.substring(0, 5000), // Limit for URL safety
    style: style,
    ts: Date.now(),
    v: "2.0",
  };

  // Simple base64 encoding
  const encoded = btoa(JSON.stringify(data));

  // Create shareable URL
  const url = `${window.location.origin}/#share=${encoded}`;

  return url;
}

export function parseSharedAscii(
  hash: string,
): { art: string; style: string } | null {
  if (!hash.startsWith("#share=")) return null;

  try {
    const encoded = hash.replace("#share=", "");
    const decoded = atob(encoded);
    const data = JSON.parse(decoded);

    return {
      art: data.art,
      style: data.style,
    };
  } catch {
    return null;
  }
}

// Fun share messages
export const shareMessages = [
  "Look what I made! →",
  "ASCII art fresh from the machine →",
  "Text art that actually slaps →",
  "Made with ASCIIFIER →",
  "Pixels converted to poetry →",
  "Check this out →",
  "Art mode: ACTIVATED →",
];

export function getRandomShareMessage(): string {
  return shareMessages[Math.floor(Math.random() * shareMessages.length)];
}
