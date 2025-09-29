import { FreshContext } from "$fresh/server.ts";

interface FigletRequest {
  text: string;
  font?: string;
}

export const handler = async (req: Request, _ctx: FreshContext): Promise<Response> => {
  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { text, font = "standard" } = await req.json() as FigletRequest;

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

    return new Response(JSON.stringify({ success: true, ascii: result }), {
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