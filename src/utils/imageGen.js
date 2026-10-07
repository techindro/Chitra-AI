const dataUrlFromBlob = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const compressImage = (blob, maxSize = 1024) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Failed to load image")); };
    img.src = url;
  });
};

export const generateImageToImage = async (imageBlob, prompt, _hfToken, aspectRatio = "1:1") => {
  const thumbDataUrl = await compressImage(imageBlob, 1024);

  try {
    const ratioStr = aspectRatio === "16:9" ? "1280:720" : 
                     aspectRatio === "9:16" ? "720:1280" : 
                     aspectRatio === "3:4" ? "768:1024" : 
                     aspectRatio === "4:5" ? "1024:1280" : "1024:1024";

    const res = await fetch("/api/runway/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, imageBase64: thumbDataUrl, ratio: ratioStr })
    });

    if (res.ok) {
      const data = await res.json();
      return data.url;
    }

    const errData = await res.json().catch(() => ({}));
    console.warn("Runway failed, using free fallback:", errData.error || res.statusText);
  } catch (err) {
    console.warn("Runway unavailable, using free fallback:", err.message);
  }

  // Free fallback: Pollinations.AI with compressed image guide
  const { width, height } = getSizes(aspectRatio);
  const seed = Math.floor(Math.random() * 999999);

  const res = await fetch("/api/pollinations/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, imageBase64: thumbDataUrl, width, height, seed })
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Generation failed");
  }

  const data = await res.json();
  return data.url;
};

const getSizes = (ratio) => {
  if (ratio === "16:9") return { width: 1280, height: 720 };
  if (ratio === "9:16") return { width: 720, height: 1280 };
  if (ratio === "3:4")  return { width: 768, height: 1024 };
  if (ratio === "4:5")  return { width: 800, height: 1000 };
  return { width: 1024, height: 1024 };
};

const pollinationsUrl = (prompt, seed, w, h, model = "turbo") => {
  const safeSeed = (seed && Number(seed) > 0 && Number(seed) < 2147483647)
    ? Math.floor(Number(seed))
    : (Math.floor(Math.random() * 900000) + 1000);
  const modelQuery = model ? `&model=${model}` : "";
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${w}&height=${h}&seed=${safeSeed}&nologo=true&enhance=false${modelQuery}`;
};

const checkImageUrl = (url, timeoutMs = 3000) => {
  return new Promise((resolve) => {
    const img = new Image();
    const timer = setTimeout(() => {
      resolve(url);
    }, timeoutMs);

    img.onload = () => {
      clearTimeout(timer);
      resolve(url);
    };

    img.onerror = () => {
      clearTimeout(timer);
      if (url.includes("model=flux")) {
        resolve(url.replace("model=flux", "model=turbo"));
      } else {
        resolve(url);
      }
    };

    img.src = url;
  });
};

export const generateImage = async (prompt, index = 0, currentTier = "Free", ideogramApiKey = "", aspectRatio = "1:1", customSeed = null) => {
  if (currentTier !== "Free" && ideogramApiKey) {
    try {
      const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      const endpoint = isLocal ? "/api-ideogram/v1/ideogram-v4/generate" : "https://api.ideogram.ai/v1/ideogram-v4/generate";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Api-Key": ideogramApiKey
        },
        body: JSON.stringify({
          text_prompt: prompt,
          aspect_ratio: aspectRatio === "3:4" ? "3:4" : aspectRatio === "9:16" ? "9:16" : aspectRatio === "4:5" ? "4:5" : aspectRatio === "16:9" ? "16:9" : "1:1"
        })
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      const data = await res.json();
      if (data?.data?.[0]?.url) {
        return data.data[0].url;
      }
      throw new Error("No image URL returned");
    } catch (err) {
      console.warn("Ideogram failed, falling back to Pollinations:", err);
    }
  }

  const { width, height } = getSizes(aspectRatio);
  const baseSeed = customSeed !== null ? Number(customSeed) : (Math.floor(Math.random() * 800000) + 10000 + (index * 1337));

  // 1. Try backend endpoint first (Gemini -> Pollinations pipeline)
  try {
    const res = await fetch("/api/pollinations/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, width, height, seed: baseSeed })
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.url) {
        return data.url;
      }
    }
  } catch (apiErr) {
    console.warn("Backend pipeline unavailable, using direct free generator:", apiErr.message);
  }

  // 2. Direct Pollinations URL (turbo engine - super fast, reliable, zero quota limits)
  const directUrl = pollinationsUrl(prompt, baseSeed, width, height, "turbo");
  return directUrl;
};

export const createImageJob = (prompt, style, index = 0, aspectRatio = "1:1") => ({
  id: `${Date.now()}-${index}`,
  prompt,
  style: style.id,
  styleLabel: style.label,
  styleIcon: style.icon,
  aspectRatio,
  url: null,
  createdAt: new Date().toISOString(),
  status: "generating",
  error: null
});

export const buildPrompt = (promptText, style) =>
  `${promptText}, ${style.tag}, high quality, detailed`;

export const buildImageUrl = (p, s, w = 1024, h = 1024, model = "turbo") => {
  const safeSeed = (s && Number(s) > 0 && Number(s) < 2147483647) ? Math.floor(Number(s)) : (Math.floor(Math.random() * 900000) + 1000);
  const modelQuery = model ? `&model=${model}` : "";
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(p)}?width=${w}&height=${h}&seed=${safeSeed}&nologo=true&enhance=false${modelQuery}`;
};

export const downloadImage = async (url, filename = "download.jpg") => {
  try {
    const link = `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
    const a = document.createElement("a");
    a.href = link;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (err) {
    console.error("Proxy download failed, trying direct link:", err);
    window.open(url, "_blank");
  }
};

export const validatePrompt = (prompt) => {
  const trimmed = prompt?.trim() ?? "";
  if (!trimmed) return { valid: false, error: "Please enter a prompt" };
  if (trimmed.length < 3) return { valid: false, error: "Prompt too short" };
  if (trimmed.length > 500) return { valid: false, error: "Prompt too long" };
  return { valid: true };
};
