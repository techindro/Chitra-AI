#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

const GEMINI_KEY = process.env.GEMINI_API_KEY;

const STYLES = {
  ghibli: "studio ghibli anime art style, miyazaki, painterly, lush, dreamy",
  cartoon: "cartoon style, vibrant colors, bold outlines, animated, playful",
  realistic: "hyperrealistic photography, 8k uhd, photorealistic, DSLR, sharp detail",
  anime: "anime art style, manga, detailed, cel shading, japanese animation",
  cyberpunk: "cyberpunk aesthetic, neon lights, futuristic city, dark dystopian, rain",
  watercolor: "watercolor painting, soft brushstrokes, artistic, pastel, painterly",
  "3d": "3d render, octane render, cinema4d, glossy, volumetric lighting, ultra detailed",
  oilpaint: "oil painting, classical art, baroque, rich textures, museum quality",
  pixel: "pixel art, retro game style, 16-bit, pixelated, sprite art",
  fantasy: "epic fantasy digital art, magical, ethereal glow, DnD concept art",
};

// Gemini Flash Prompt Enhancer
async function enhancePrompt(rawPrompt) {
  if (!GEMINI_KEY || !rawPrompt || rawPrompt.length < 3) return rawPrompt;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are an expert AI image prompt engineer. Enhance this prompt for FLUX image generator into a vivid, visually stunning description (under 45 words). Return ONLY the improved prompt, no chat or quotes:\nPrompt: ${rawPrompt}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        }),
      }
    );
    if (!res.ok) return rawPrompt;
    const data = await res.json();
    const enhanced = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return enhanced || rawPrompt;
  } catch {
    return rawPrompt;
  }
}

// Generate HD Image via Pollinations Turbo (ultra-fast, 100% free)
function generateFluxUrl({ prompt, width = 1024, height = 1024, seed = Math.floor(Math.random() * 999999) }) {
  const baseUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
  const query = new URLSearchParams({
    width: width.toString(),
    height: height.toString(),
    seed: seed.toString(),
    nologo: "true",
    enhance: "false",
    model: "turbo",
    nocache: Date.now().toString(),
  });
  return `${baseUrl}?${query.toString()}`;
}

const server = new Server(
  {
    name: "chitra-ai-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define Tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "generate_image",
        description:
          "Generate a high-resolution, photorealistic or artistic image using Chitra-AI's FLUX.1 + Gemini pipeline. Returns the direct image URL.",
        inputSchema: {
          type: "object",
          properties: {
            prompt: {
              type: "string",
              description: "The text description of the image to generate.",
            },
            style: {
              type: "string",
              description: "Art style: realistic, ghibli, anime, cyberpunk, watercolor, 3d, oilpaint, pixel, fantasy, or cartoon.",
              enum: Object.keys(STYLES),
            },
            aspect_ratio: {
              type: "string",
              description: "Aspect ratio for the image: 1:1 (Square), 16:9 (Landscape), 9:16 (Portrait/Stories), 3:4, or 4:5.",
              enum: ["1:1", "16:9", "9:16", "3:4", "4:5"],
              default: "1:1",
            },
            enhance_with_gemini: {
              type: "boolean",
              description: "Whether to automatically enhance the prompt using Gemini 2.5 Flash for cinematic fidelity (default: true).",
              default: true,
            },
          },
          required: ["prompt"],
        },
      },
      {
        name: "enhance_prompt",
        description:
          "Use Google Gemini 2.5 Flash to expand a short prompt into a rich, cinematic FLUX prompt with lighting and atmosphere details.",
        inputSchema: {
          type: "object",
          properties: {
            prompt: {
              type: "string",
              description: "The simple or raw prompt to enhance.",
            },
          },
          required: ["prompt"],
        },
      },
      {
        name: "get_art_styles",
        description: "List all supported artistic styles and their prompt tags in Chitra-AI.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  };
});

// Handle Tool Calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "generate_image") {
    let finalPrompt = args.prompt;

    // Optional Gemini enhancement
    if (args.enhance_with_gemini !== false) {
      finalPrompt = await enhancePrompt(finalPrompt);
    }

    // Append style modifier if provided
    if (args.style && STYLES[args.style]) {
      finalPrompt = `${finalPrompt}, ${STYLES[args.style]}`;
    }

    // Dimension mapping
    let width = 1024;
    let height = 1024;
    const ratio = args.aspect_ratio || "1:1";
    if (ratio === "16:9") { width = 1280; height = 720; }
    else if (ratio === "9:16") { width = 720; height = 1280; }
    else if (ratio === "3:4") { width = 768; height = 1024; }
    else if (ratio === "4:5") { width = 800; height = 1000; }

    const imageUrl = generateFluxUrl({ prompt: finalPrompt, width, height });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              success: true,
              imageUrl,
              promptUsed: finalPrompt,
              aspectRatio: ratio,
              dimensions: `${width}x${height}`,
              engine: "FLUX.1 (HD 1024) via Chitra-AI",
            },
            null,
            2
          ),
        },
      ],
    };
  }

  if (name === "enhance_prompt") {
    const enhanced = await enhancePrompt(args.prompt);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              originalPrompt: args.prompt,
              enhancedPrompt: enhanced,
              engine: "Google Gemini 2.5 Flash",
            },
            null,
            2
          ),
        },
      ],
    };
  }

  if (name === "get_art_styles") {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(STYLES, null, 2),
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Chitra-AI MCP Server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error running MCP server:", err);
  process.exit(1);
});
