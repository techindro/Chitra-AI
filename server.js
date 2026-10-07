import express from "express";
import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json({ limit: "50mb" }));

const RUNWAY_KEY = process.env.RUNWAY_API_KEY;
const RUNWAY_URL = "https://api.dev.runwayml.com/v1";
const GEMINI_KEY = process.env.GEMINI_API_KEY;

// Smart Gemini prompt enhancer (uses gemini-2.5-flash)
async function enhancePromptWithGemini(prompt) {
  if (!GEMINI_KEY || !prompt || prompt.length < 3) return prompt;
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are an expert AI image prompt engineer. Enhance this prompt for the FLUX image generator into a vivid, descriptive prompt (under 45 words). Return ONLY the enhanced prompt, no conversational filler or quotes:\nPrompt: ${prompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500
        }
      })
    });
    if (!res.ok) return prompt;
    const data = await res.json();
    const enhanced = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (enhanced && enhanced.length > 5) {
      console.log(`[gemini] Enhanced prompt: "${enhanced.slice(0, 50)}..."`);
      return enhanced;
    }
  } catch (err) {
    console.warn("[gemini] Prompt enhancement skipped:", err.message);
  }
  return prompt;
}

let geminiQuotaCooldownUntil = 0;

// Gemini image generation attempt (falls back to Pollinations when quota/model is exhausted)
async function tryGeminiImageGenerate({ prompt, width = 1024, height = 1024 }) {
  if (!GEMINI_KEY || Date.now() < geminiQuotaCooldownUntil) return null;
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GEMINI_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!res.ok) {
      if (res.status === 429) {
        geminiQuotaCooldownUntil = Date.now() + 60 * 60 * 1000;
        console.warn("[gemini-image] Gemini quota exhausted, caching fallback to Pollinations.");
      }
      return null;
    }

    const data = await res.json();
    const part = data.candidates?.[0]?.content?.parts?.[0];
    if (part?.inlineData?.data) {
      return `data:${part.inlineData.mimeType || "image/jpeg"};base64,${part.inlineData.data}`;
    }
  } catch (err) {
    console.warn("[gemini-image] Error, shifting to Pollinations:", err.message);
  }
  return null;
}

// Helper: 100% Free ultra-fast image generation using Pollinations.AI
async function generateWithPollinations({ prompt, imageBase64, width = 1024, height = 1024, seed }) {
  let imageUrl = "";
  if (imageBase64) {
    try {
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      
      const uploadForm = new FormData();
      const blob = new Blob([buffer], { type: "image/jpeg" });
      uploadForm.append("files[]", blob, "photo.jpg");

      const uploadRes = await fetch("https://qu.ax/upload.php", {
        method: "POST",
        body: uploadForm
      });

      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        if (uploadData.success && uploadData.files?.[0]?.url) {
          imageUrl = uploadData.files[0].url;
          console.log(`[free-ai] uploaded reference image to: ${imageUrl}`);
        }
      }
    } catch (uploadErr) {
      console.warn("Failed to upload reference to qu.ax:", uploadErr.message);
    }
  }

  const finalPrompt = imageBase64
    ? `a detailed portrait photo of the person, styled as: ${prompt}, preserving facial features, sharp details, realistic skin texture`
    : prompt;

  const safeSeed = (seed && Number(seed) > 0 && Number(seed) < 2147483647)
    ? Math.floor(Number(seed))
    : Math.floor(Math.random() * 999999) + 1;

  const baseUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}`;
  const queryParams = new URLSearchParams({
    width: width.toString(),
    height: height.toString(),
    seed: safeSeed.toString(),
    nologo: "true",
    enhance: "false",
    model: "turbo",
    nocache: (Date.now() % 10000000).toString()
  });

  if (imageUrl) {
    queryParams.append("image", imageUrl);
  }

  const url = `${baseUrl}?${queryParams.toString()}`;
  return url;
}


app.post("/api/runway/generate", async (req, res) => {
  const { prompt, imageBase64, ratio = "1024:1024" } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt" });
  }

  // If no paid Runway key, automatically use 100% Free Pollinations engine
  if (!RUNWAY_KEY) {
    console.log(`[free-mode] No Runway key, generating for free with Pollinations FLUX: ${prompt.slice(0, 30)}...`);
    try {
      const url = await generateWithPollinations({ prompt, imageBase64 });
      return res.json({ success: true, url });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  try {
    const finalPrompt = imageBase64 
      ? `a detailed portrait photo of @ref, styled as: ${prompt}, preserving the exact facial features, hair, head pose, and expression of @ref`
      : prompt;

    const payload = {
      model: "gen4_image",
      promptText: finalPrompt,
      ratio,
      referenceImages: imageBase64 ? [{ uri: imageBase64, tag: "ref" }] : []
    };

    console.log(`[runway] generating: ${prompt.slice(0, 30)}...`);

    const initRes = await fetch(`${RUNWAY_URL}/text_to_image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RUNWAY_KEY}`,
        "X-Runway-Version": "2024-11-06"
      },
      body: JSON.stringify(payload)
    });

    if (!initRes.ok) {
      const err = await initRes.text();
      return res.status(initRes.status).json({ error: `Runway API error: ${err}` });
    }

    const task = await initRes.json();
    const taskId = task.id;

    // poll for task result (max 2 mins)
    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, 2000));

      const poll = await fetch(`${RUNWAY_URL}/tasks/${taskId}`, {
        headers: {
          "Authorization": `Bearer ${RUNWAY_KEY}`,
          "X-Runway-Version": "2024-11-06"
        }
      });

      if (!poll.ok) continue;

      const result = await poll.json();
      console.log(`[runway] status: ${result.status} (attempt ${i + 1})`);

      if (result.status === "SUCCEEDED") {
        const url = result.output?.[0];
        if (url) return res.json({ success: true, url });
        return res.status(500).json({ error: "Output URL empty" });
      }

      if (result.status === "FAILED") {
        return res.status(500).json({ error: result.failure || "Generation failed" });
      }
    }

    return res.status(504).json({ error: "Task timed out" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

app.post("/api/pollinations/generate", async (req, res) => {
  const { prompt, imageBase64, width = 1024, height = 1024, seed } = req.body;
  if (!prompt) return res.status(400).json({ error: "Missing prompt" });
  console.log(`[generate] incoming prompt: "${prompt.slice(0, 40)}..." (hasImage: ${!!imageBase64})`);

  try {
    // 1. If text-to-image (no reference image), try Gemini Image Generation first
    if (!imageBase64) {
      const geminiUrl = await tryGeminiImageGenerate({ prompt, width, height });
      if (geminiUrl) {
        console.log("[generate] Successfully generated with Gemini Image!");
        return res.json({ success: true, url: geminiUrl, provider: "gemini" });
      }
    }

    // 2. When Gemini Image is unavailable/quota exhausted, shift to Pollinations FLUX
    // Use Gemini Flash to enhance prompt for stunning FLUX quality (if no reference image)
    let finalPrompt = prompt;
    if (!imageBase64) {
      finalPrompt = await enhancePromptWithGemini(prompt);
    }

    console.log(`[shift-to-pollinations] Generating with Pollinations FLUX HD...`);
    try {
      const url = await generateWithPollinations({ prompt: finalPrompt, imageBase64, width, height, seed });
      return res.json({ success: true, url, provider: "pollinations" });
    } catch (pollErr) {
      console.warn("[shift-to-pollinations] Pollinations upstream busy/throttled, delivering direct stream URL:", pollErr.message);
      const safeSeed = (seed && Number(seed) > 0 && Number(seed) < 2147483647)
        ? Math.floor(Number(seed))
        : Math.floor(Math.random() * 999999) + 1;
      const directUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=768&height=768&seed=${safeSeed}&nologo=true`;
      return res.json({ success: true, url: directUrl, provider: "direct-stream", warning: pollErr.message });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

app.post("/api/enhance-prompt", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Missing prompt" });
  try {
    const enhanced = await enhancePromptWithGemini(prompt);
    return res.json({ success: true, enhancedPrompt: enhanced });
  } catch (err) {
    return res.json({ success: false, enhancedPrompt: prompt });
  }
});


app.get("/api/download", async (req, res) => {
  const { url, filename = "download.jpg" } = req.query;
  if (!url) return res.status(400).send("Missing URL");

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch image");

    const contentType = response.headers.get("content-type") || "image/jpeg";
    
    // Enforce clean .jpg or .png extension matching the image content type
    let cleanFilename = filename;
    if (contentType.includes("png")) {
      if (!cleanFilename.endsWith(".png")) {
        cleanFilename = cleanFilename.replace(/\.[^/.]+$/, "") + ".png";
      }
    } else {
      if (!cleanFilename.endsWith(".jpg") && !cleanFilename.endsWith(".jpeg")) {
        cleanFilename = cleanFilename.replace(/\.[^/.]+$/, "") + ".jpg";
      }
    }

    res.setHeader("Content-Disposition", `attachment; filename="${cleanFilename}"`);
    res.setHeader("Content-Type", contentType);

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return res.send(buffer);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Download failed");
  }
});

// serve static build
const dist = path.join(__dirname, "dist");
app.use(express.static(dist));

app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "API route not found" });
  }
  res.sendFile(path.join(dist, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
