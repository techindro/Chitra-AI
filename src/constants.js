export const STYLES = [
  { id: "ghibli", label: "Ghibli", lucideName: "Sprout", color: "#4ade80", tag: "studio ghibli anime art style, miyazaki, painterly, lush, dreamy" },
  { id: "cartoon", label: "Cartoon", lucideName: "Palette", color: "#fb923c", tag: "cartoon style, vibrant colors, bold outlines, animated, playful" },
  { id: "realistic", label: "Realistic", lucideName: "Camera", color: "#60a5fa", tag: "hyperrealistic photography, 8k uhd, photorealistic, DSLR, sharp detail" },
  { id: "anime", label: "Anime", lucideName: "Zap", color: "#f472b6", tag: "anime art style, manga, detailed, cel shading, japanese animation" },
  { id: "cyberpunk", label: "Cyberpunk", lucideName: "Cpu", color: "#22d3ee", tag: "cyberpunk aesthetic, neon lights, futuristic city, dark dystopian, rain" },
  { id: "watercolor", label: "Watercolor", lucideName: "Brush", color: "#a78bfa", tag: "watercolor painting, soft brushstrokes, artistic, pastel, painterly" },
  { id: "3d", label: "3D Render", lucideName: "Box", color: "#34d399", tag: "3d render, octane render, cinema4d, glossy, volumetric lighting, ultra detailed" },
  { id: "oilpaint", label: "Oil Paint", lucideName: "Image", color: "#fbbf24", tag: "oil painting, classical art, baroque, rich textures, museum quality" },
  { id: "pixel", label: "Pixel Art", lucideName: "Gamepad2", color: "#f87171", tag: "pixel art, retro game style, 16-bit, pixelated, sprite art" },
  { id: "fantasy", label: "Fantasy", lucideName: "Wand", color: "#c084fc", tag: "epic fantasy digital art, magical, ethereal glow, DnD concept art" },
];

export const HERO_PROMPTS = [
  { p: "dragon flying over misty mountains at sunset, fantasy epic art", s: 1001, img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&q=80" },
  { p: "girl with glowing lantern in enchanted forest, studio ghibli style", s: 1002, img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&q=80" },
  { p: "futuristic neon city rain cyberpunk 4k ultra detailed", s: 1003, img: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&q=80" },
  { p: "beautiful anime girl cherry blossom sakura petals", s: 1004, img: "https://images.unsplash.com/photo-1522383225653-ed111181a951?w=500&q=80" },
  { p: "ancient temple overgrown vines golden hour photography", s: 1005, img: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=500&q=80" },
  { p: "space whale swimming through nebula stars galaxy", s: 1006, img: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=500&q=80" },
  { p: "elegant woman baroque oil painting dramatic lighting", s: 1007, img: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500&q=80" },
  { p: "cute robot exploring flower garden pixar style 3d", s: 1008, img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&q=80" },
  { p: "underwater mermaid kingdom coral reef fantasy art", s: 1009, img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&q=80" },
  { p: "wolf howling northern lights aurora borealis forest", s: 1010, img: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=500&q=80" },
  { p: "samurai warrior cherry blossom petals falling anime", s: 1011, img: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=500&q=80" },
  { p: "magical witch forest mushroom glowing ethereal", s: 1012, img: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=500&q=80" },
];

// Real features with Lucide icon names (rendered in Landing.jsx)
export const FEATURES = [
  { lucideIcon: "Zap", title: "Fast creation", desc: "Images generate in less than 10 seconds." },
  { lucideIcon: "Palette", title: "Multiple styles", desc: "Choose from Ghibli, Anime, Realistic, Cyberpunk, and more." },
  { lucideIcon: "ShieldCheck", title: "Private", desc: "We do not store your images or text. Everything stays on your device." },
  { lucideIcon: "Download", title: "Free downloads", desc: "Save your work in high quality with no watermarks." },
  { lucideIcon: "Infinity", title: "Unlimited use", desc: "Make as many images as you need. No credits or daily limits." },
  { lucideIcon: "Smartphone", title: "Mobile friendly", desc: "Works smoothly on your phone, tablet, or computer." },
];

export const SUGGESTIONS = [
  "A girl walking through a forest in the rain",
  "A futuristic city floating in clouds",
  "A samurai at sunset in cherry blossoms",
  "A dragon guarding a mountain treasure",
  "A cozy cafe in autumn with warm lights",
  "Underwater kingdom glowing bioluminescence",
];

// Real, honest product highlights
export const HIGHLIGHTS = [
  { n: "10", l: "Art styles" },
  { n: "Free", l: "No hidden fees" },
  { n: "<10s", l: "Wait time" },
];

export const EXPLORE_ITEMS = [
  {
    id: "exp_1",
    title: "Celestial Cyber Samurai",
    prompt: "Cyberpunk armored samurai with neon katana, rainy Neo-Tokyo alleyway, reflection in puddles, dramatic volumetric lighting, cinematic 8k",
    style: "cyberpunk",
    aspectRatio: "1:1",
    author: "@neo_creator",
    likes: 412,
    seed: 2001,
    img: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&q=80"
  },
  {
    id: "exp_2",
    title: "Spirited Forest Tea House",
    prompt: "A cozy wooden tea house nestled deep inside an ancient glowing forest with moss-covered stones and soft lantern light, studio ghibli anime aesthetic",
    style: "ghibli",
    aspectRatio: "16:9",
    author: "@miyazaki_vibes",
    likes: 389,
    seed: 2002,
    img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80"
  },
  {
    id: "exp_3",
    title: "Royal Bengal Tiger Sovereign",
    prompt: "Hyperrealistic portrait of a royal Bengal tiger crowned with ornate emerald and gold jewels, piercing golden eyes, dramatic side-lighting, 8k DSLR",
    style: "realistic",
    aspectRatio: "3:4",
    author: "@wildlife_lens",
    likes: 521,
    seed: 2003,
    img: "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=600&q=80"
  },
  {
    id: "exp_4",
    title: "Cosmic Nebula Whale",
    prompt: "An ethereal celestial whale swimming through glowing purple stardust and iridescent ringed planets, hyper-detailed fantasy digital art",
    style: "fantasy",
    aspectRatio: "16:9",
    author: "@stargazer_ai",
    likes: 673,
    seed: 2004,
    img: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=600&q=80"
  },
  {
    id: "exp_5",
    title: "Cherry Blossom Blade Master",
    prompt: "A stoic anime swordswoman surrounded by fluttering cherry blossom sakura petals under a golden twilight sky, Makoto Shinkai aesthetic",
    style: "anime",
    aspectRatio: "9:16",
    author: "@anime_forge",
    likes: 298,
    seed: 2005,
    img: "https://images.unsplash.com/photo-1522383225653-ed111181a951?w=600&q=80"
  },
  {
    id: "exp_6",
    title: "Whimsical Robot Botanist",
    prompt: "Cute porcelain robot tending to a miniature terrarium garden, soft pastel colors, octane 3d render, clay texture, clean studio lighting",
    style: "3d",
    aspectRatio: "1:1",
    author: "@botanica3d",
    likes: 345,
    seed: 2006,
    img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80"
  },
  {
    id: "exp_7",
    title: "Vintage Italian Coastal Alley",
    prompt: "A sun-drenched Positano cobblestone alley overlooking the sparkling Mediterranean sea, soft watercolor wash, delicate ink lines, pastel palette",
    style: "watercolor",
    aspectRatio: "3:4",
    author: "@artisan_prints",
    likes: 419,
    seed: 2007,
    img: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600&q=80"
  },
  {
    id: "exp_8",
    title: "Renaissance Scholar Portrait",
    prompt: "Classical baroque oil painting of an astronomer examining an ornate brass astrolabe by warm candlelight, rich impasto canvas textures",
    style: "oilpaint",
    aspectRatio: "1:1",
    author: "@florence_studio",
    likes: 276,
    seed: 2008,
    img: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&q=80"
  }
];
