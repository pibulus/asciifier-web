import { FreshContext } from "$fresh/server.ts";

interface FigletRequest {
  text: string;
  font?: string;
  colorize?: boolean;
  effect?: 'rainbow' | 'fire' | 'ocean' | 'unicorn' | 'matrix';
}

export const handler = async (req: Request, _ctx: FreshContext): Promise<Response> => {
  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { text, font = "standard", colorize = false, effect = "rainbow" } = await req.json() as FigletRequest;

    // Validate input
    if (!text || typeof text !== "string") {
      return new Response("Invalid text input", { status: 400 });
    }

    // Limit text length for performance
    const limitedText = text.slice(0, 20);

    // Import figlet server-side - handle CommonJS module structure
    const figletModule = await import("figlet");
    const figlet = figletModule.default || figletModule;

    // Generate ASCII art - figlet uses different methods
    const result = figlet.textSync ?
      figlet.textSync(limitedText, {
        font: font as any,
        horizontalLayout: "fitted",
        verticalLayout: "fitted",
      }) :
      figlet(limitedText, {
        font: font as any,
        horizontalLayout: "fitted",
        verticalLayout: "fitted",
      });

    let finalResult = result;
    let htmlResult = result;

    // Apply colorization if requested
    if (colorize) {
      const lines = result.split('\n');
      const colorizedLines: string[] = [];

      for (let y = 0; y < lines.length; y++) {
        const line = lines[y];
        let colorizedLine = '';

        for (let x = 0; x < line.length; x++) {
          const char = line[x];

          if (char === ' ' || char === '') {
            colorizedLine += char; // Keep spaces plain
          } else {
            // Generate color based on effect and position
            const color = getEffectColor(effect, x, y, line.length, lines.length);
            colorizedLine += `<span style="color: ${color};">${char}</span>`;
          }
        }
        colorizedLines.push(colorizedLine);
      }

      htmlResult = colorizedLines.join('\n');
      finalResult = htmlResult; // Return HTML for display
    }

    return new Response(JSON.stringify({
      success: true,
      ascii: finalResult,
      html: htmlResult,
      plain: result
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });

  } catch (error) {
    console.error("Figlet API error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to generate ASCII text" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};

// Generate colors for different effects using HSL
function getEffectColor(effect: string, x: number, y: number, lineWidth: number, totalLines: number): string {
  switch (effect) {
    case 'fire':
      // Red to yellow gradient
      const fireHue = 60 - (y * 60 / totalLines); // 60 (yellow) to 0 (red)
      return `hsl(${fireHue}, 100%, 50%)`;

    case 'ocean':
      // Blue to cyan gradient
      const oceanHue = 180 + ((x + y) * 60 / (lineWidth + totalLines));
      return `hsl(${oceanHue % 360}, 70%, 50%)`;

    case 'unicorn':
      // Pink to purple gradient
      const unicornHue = 280 + ((x * 2) * 80 / lineWidth);
      return `hsl(${unicornHue % 360}, 85%, 65%)`;

    case 'matrix':
      // Green matrix effect
      const matrixHue = 120; // Pure green
      const lightness = 30 + ((x + y) * 40 / (lineWidth + totalLines));
      return `hsl(${matrixHue}, 100%, ${lightness}%)`;

    default: // rainbow
      // Same algorithm as image processor - consistent rainbow!
      const hue = ((x + y * 2) * 360 / (lineWidth + totalLines * 2)) % 360;
      return `hsl(${hue}, 70%, 50%)`;
  }
}

