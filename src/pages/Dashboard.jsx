import { useState, useEffect, useRef, useCallback } from "react";
import Logo from "@components/logo";
import ImageCard from "@components/imagecard";
import { STYLES, SUGGESTIONS, EXPLORE_ITEMS } from "../constants";
import { createImageJob, validatePrompt, generateImage, generateImageToImage, buildPrompt, downloadImage, buildImageUrl } from "@utils/imageGen";
import { upscaleImageTo4K, removeImageBackground } from "@utils/imageProcess";
import {
  Home, Compass, Sparkles, Archive, ImagePlus, X, LogOut, Sun, Moon, Settings2, CreditCard,
  Film, Play, Pause, RefreshCw, Volume2, Download, Copy, Dices, Wand2, Square, Tv, Smartphone, Image,
  Sprout, Palette, Camera, Zap, Cpu, Brush, Box, Gamepad2, Wand, Lightbulb, Globe,
  Heart, Search, Trash2, CheckCircle2, Sliders, Scissors, Maximize2, Share2, History, Lock, Unlock, Check,
  Type, Aperture, SunMedium, Layers, SlidersHorizontal
} from "lucide-react";

const renderStyleIcon = (lucideName) => {
  const iconMap = {
    Sprout, Palette, Camera, Zap, Cpu, Brush, Box, Image, Gamepad2, Wand
  };
  const IconComponent = iconMap[lucideName] || Image;
  return <IconComponent size={14} />;
};

const applyConvolution = (img, kernel) => {
  try {
    const canvas = document.createElement("canvas");
    const tempCtx = canvas.getContext("2d");
    canvas.width = 128;
    canvas.height = 128;
    tempCtx.drawImage(img, 0, 0, 128, 128);

    const imgData = tempCtx.getImageData(0, 0, 128, 128);
    const src = imgData.data;
    const output = tempCtx.createImageData(128, 128);
    const dst = output.data;
    const w = 128;
    const h = 128;

    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        let r = 0, g = 0, b = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const pixelIdx = ((y + ky) * w + (x + kx)) * 4;
            const weight = kernel[(ky + 1) * 3 + (kx + 1)];
            r += src[pixelIdx] * weight;
            g += src[pixelIdx + 1] * weight;
            b += src[pixelIdx + 2] * weight;
          }
        }
        const dstIdx = (y * w + x) * 4;
        dst[dstIdx] = Math.min(Math.max(r, 0), 255);
        dst[dstIdx + 1] = Math.min(Math.max(g, 0), 255);
        dst[dstIdx + 2] = Math.min(Math.max(b, 0), 255);
        dst[dstIdx + 3] = 255;
      }
    }
    tempCtx.putImageData(output, 0, 0);
    return canvas.toDataURL("image/jpeg");
  } catch (e) {
    console.error(e);
    return null;
  }
};

const ENHANCERS = {
  realistic: [
    "cinematic lighting, volumetric atmosphere, highly detailed, 8k resolution, photorealistic, shot on 35mm lens",
    "golden hour lighting, soft shadows, sharp focus, hyper-detailed, DSLR photograph, professional color grading",
    "volumetric dust particles, dramatic side-lighting, cinematic composition, intricate textures, masterpiece, high fidelity",
    "moody atmosphere, raytraced reflections, highly detailed, studio lighting, award-winning photography, close-up details"
  ],
  ghibli: [
    "studio ghibli aesthetic, hand-painted watercolor background, nostalgic lighting, whimsical atmosphere, retro anime key art",
    "spirited away style, soft clouds, hand-drawn detailing, warm sun rays, pastel watercolor textures, anime key visual",
    "howl's moving castle vibe, lush green hills, soft natural lighting, magical fantasy atmosphere, intricate hand-painted scenery",
    "my neighbor totoro style, soft focus, nostalgic summer afternoon, hand-painted gouache style, high-quality anime art"
  ],
  anime: [
    "modern anime key visual, dynamic lighting, vibrant colors, detailed line art, digital painting, masterpiece",
    "makoto shinkai aesthetic, gorgeous starry sky, reflective water, highly detailed clouds, dramatic sunset lighting, anime wallpaper",
    "kyoto animation style, soft natural lighting, emotional atmosphere, delicate character art, high resolution anime key visual",
    "futuristic anime style, neon highlights, dynamic composition, clean lines, cell-shaded, high aesthetic value"
  ],
  cyberpunk: [
    "cyberpunk aesthetic, glowing neon signage, wet streets with puddle reflections, volumetric steam, dark moody atmosphere",
    "futuristic city street, hologram ads, rain-slicked pavement, dramatic purple and cyan neon lighting, retro-futurism style",
    "neon cyber-tech detailing, moody night city backdrop, soft lens flare, synthwave aesthetic, high-fidelity cyberpunk visual",
    "dark alleyway, glowing cables, cybernetic highlights, volumetric smoke, raytraced neon reflections, 8k cyberpunk key art"
  ],
  watercolor: [
    "delicate watercolor painting, soft color bleeding, fine paper texture, hand-drawn ink outlines, aesthetic pastel palette",
    "whimsical watercolor wash, elegant splatters, vintage sketch feel, organic textures, hand-painted masterwork",
    "soft gouache and watercolor blend, dreamy pastel tones, organic paint splashes, high artistic quality"
  ],
  "3d": [
    "3d render, octane render, stylized cg illustration, smooth clay texture, vibrant studio lighting, clean geometric shapes",
    "toy style 3d modeling, soft plastic materials, ambient occlusion, bright pastel colors, cute isometric rendering",
    "digital 3d art, glossy materials, soft shadows, raytraced reflections, dynamic studio key light, highly polished"
  ],
  cartoon: [
    "vibrant cartoon illustration, bold outlines, flat shading, playful character design, highly saturated colors, animated movie style",
    "cute disney style drawing, expressive features, soft lighting, whimsical background illustration, magical vector clean lines"
  ],
  oilpaint: [
    "classical oil painting, rich canvas texture, impasto brushstrokes, dramatic chiaroscuro lighting, masterwork museum quality",
    "baroque style oil painting, deep color tones, realistic shadows, textured canvas, fine art classical composition"
  ],
  pixel: [
    "retro 16-bit pixel art, detailed dithered shading, nostalgic arcade game aesthetic, clean grid structure, colorful sprite visual",
    "cozy pixel scene, pixelated textures, isometric retro style, vibrant limited color palette, 8-bit aesthetic"
  ],
  fantasy: [
    "epic fantasy illustration, ethereal mythical glow, magical spell details, high fantasy digital painting, dramatic light rays",
    "dungeons and dragons concept art, magical atmosphere, glowing crystal light, dynamic epic composition, fantasy landscape"
  ]
};

const BHOJPURI_TRANSLATIONS = {
  "The universe spans infinitely, holding secrets beyond our wild imagination.": 
    "ई ब्रह्मांड अनंत बा, जवने में अइसन रहस्य छिपल बा जेकरा बारे में हमनी के सोच भी ना सकीं।",
  "For generations, humanity has gazed upon the stars, dreaming of a journey into the deep void.": 
    "सदियन से हमनी के पुरखा लोग आसमान के तारा देख के सोचत रहल हं कि कवना दिन आसमान में जाईं जा।",
  "Now, the time has come. We are stepping into the cosmos, navigating warp gates towards new frontiers.": 
    "अब समय आ गइल बा, हमनी के तारा के ओर कदम बढ़ावत बानी जा, नया दुनिया खोजे खातिर।",
  "Deep in the quiet forest, nature whispers ancient secrets to those who stop to listen.": 
    "शांत जंगल के गहराई में, प्रकृति हमनी के पुरान रहस्य सुनावत बिया, बस सुने वाला चाहीं।",
  "Every mountain peak stands as a testament of time, holding the skies in everlasting embrace.": 
    "हर पहाड़ के चोटी समय के गवाह बा, आसमान के गले लगा के रखले बा।",
  "This planet is our only home. It is a masterpiece created in silence, meant to be preserved forever.": 
    "ई धरती हमनी के एकलौता घर बा, एकरा के बचा के रखल हमनी के फ़र्ज़ बा।",
  "Artificial Intelligence is redefining the canvas of human thought, spark-plugging the digital renaissance.": 
    "आर्टिफिशियल इंटेलिजेंस इंसान के सोच के बदलत बा, एक नया क्रांति लावत बा।",
  "Humanoid robots are stepping out of science fiction, learning to create and think alongside us.": 
    "इंसान जइसन रोबोट अब कहानी से बाहर आके हमनी के साथ काम करत बाड़े।",
  "We stand at the edge of a new horizon. A cybernetic future where design merges with algorithms.": 
    "हमनी के एक नया मोड़ पर खड़ा बानी जा, जहाँ तकनीक और इंसान एक हो जाई।"
};

const translateToBhojpuri = (text, topic) => {
  if (BHOJPURI_TRANSLATIONS[text]) {
    return BHOJPURI_TRANSLATIONS[text];
  }
  if (text.includes("Let us dive into the wonderful world of")) {
    return `चलीं जा ${topic || "विषय"} के सुंदर दुनिया में घूम के आवल जाओ, जहाँ सोच के कोई सीमा नईखे।`;
  }
  if (text.includes("Every single angle reveals a deeper mystery and intricate story")) {
    return `हर एक कोना से ${topic || "विषय"} के बारे में एक नया रहस्य और कहानी पता चलत बा।`;
  }
  if (text.includes("A true masterpiece captured in the flow of time, celebrating the art of visual imagination.")) {
    return "समय के बहाव में छिपल एगो असली नमूना बा, जेकरा के देख के दिल खुश हो जाई।";
  }
  return text;
};

const HINDI_TRANSLATIONS = {
  "The universe spans infinitely, holding secrets beyond our wild imagination.": 
    "ब्रह्मांड अनंत दूरी तक फैला हुआ है, जिसमें हमारी कल्पना से भी परे रहस्य छिपे हुए हैं।",
  "For generations, humanity has gazed upon the stars, dreaming of a journey into the deep void.": 
    "पीढ़ियों से, मानवता ने तारों की ओर देखा है, और गहरी शून्यता की यात्रा का सपना देखा है।",
  "Now, the time has come. We are stepping into the cosmos, navigating warp gates towards new frontiers.": 
    "अब, वह समय आ गया है। हम ब्रह्मांड में कदम रख रहे हैं, नए क्षितिजों की ओर बढ़ रहे हैं।",
  "Deep in the quiet forest, nature whispers ancient secrets to those who stop to listen.": 
    "शांत जंगल की गहराई में, प्रकृति उन लोगों को प्राचीन रहस्य सुनाती है जो सुनने के लिए रुकते हैं।",
  "Every mountain peak stands as a testament of time, holding the skies in everlasting embrace.": 
    "हर पहाड़ की चोटी समय के प्रमाण के रूप में खड़ी है, जो आसमान को गले लगाए हुए है।",
  "This planet is our only home. It is a masterpiece created in silence, meant to be preserved forever.": 
    "यह ग्रह हमारा एकमात्र घर है। यह मौन में बनाई गई एक उत्कृष्ट कृति है, जिसे हमेशा के लिए संरक्षित किया जाना है।",
  "Artificial Intelligence is redefining the canvas of human thought, spark-plugging the digital renaissance.": 
    "आर्टिफिशियल इंटेलिजेंस मानव विचार के कैनवास को फिर से परिभाषित कर रहा है, एक नई डिजिटल क्रांति ला रहा है।",
  "Humanoid robots are stepping out of science fiction, learning to create and think alongside us.": 
    "ह्यूमनॉइड रोबोट विज्ञान कथाओं से बाहर आ रहे हैं, हमारे साथ मिलकर बनाना और सोचना सीख रहे हैं।",
  "We stand at the edge of a new horizon. A cybernetic future where design merges with algorithms.": 
    "हम एक नए क्षितिज के किनारे पर खड़े हैं। एक साइबरनेटिक भविष्य जहां डिजाइन एल्गोरिदम के साथ विलीन हो जाता है।"
};

const translateToHindi = (text, topic) => {
  if (HINDI_TRANSLATIONS[text]) {
    return HINDI_TRANSLATIONS[text];
  }
  if (text.includes("Let us dive into the wonderful world of")) {
    return `आइए हम ${topic || "विषय"} की अद्भुत दुनिया में गोता लगाएँ, जहाँ रचनात्मकता की कोई सीमा नहीं है।`;
  }
  if (text.includes("Every single angle reveals a deeper mystery and intricate story")) {
    return `हर एक कोण ${topic || "विषय"} के निर्माण के पीछे एक गहरा रहस्य और जटिल कहानी प्रकट करता है।`;
  }
  if (text.includes("A true masterpiece captured in the flow of time, celebrating the art of visual imagination.")) {
    return "समय के प्रवाह में कैद एक सच्ची उत्कृष्ट कृति, जो दृश्य कल्पना की कला का जश्न मनाती है।";
  }
  return text;
};

const getVoiceForCharacter = (charType, voices) => {
  if (charType === "us-male") {
    return voices.find(v => v.lang.startsWith("en-US") && (v.name.includes("David") || v.name.includes("Guy") || v.name.includes("Male"))) || voices.find(v => v.lang.startsWith("en-US"));
  }
  if (charType === "us-female") {
    return voices.find(v => v.lang.startsWith("en-US") && (v.name.includes("Zira") || v.name.includes("Zira") || v.name.includes("Female") || v.name.includes("Google") || v.name.includes("Jenny"))) || voices.find(v => v.lang.startsWith("en-US"));
  }
  if (charType === "in-male") {
    return voices.find(v => (v.lang.startsWith("en-IN") || v.lang.startsWith("hi-IN")) && (v.name.includes("Ravi") || v.name.includes("Male") || v.name.includes("Hindi") || v.name.includes("हिन्दी"))) || voices.find(v => v.lang.startsWith("en-IN")) || voices.find(v => v.lang.startsWith("hi-IN")) || voices[0];
  }
  if (charType === "in-female") {
    return voices.find(v => (v.lang.startsWith("en-IN") || v.lang.startsWith("hi-IN")) && (v.name.includes("Heera") || v.name.includes("Swara") || v.name.includes("Female") || v.name.includes("Google") || v.name.includes("Neerja"))) || voices.find(v => v.lang.startsWith("en-IN")) || voices.find(v => v.lang.startsWith("hi-IN")) || voices[0];
  }
  if (charType === "hi-male") {
    return voices.find(v => v.lang.startsWith("hi-IN") && (v.name.includes("Hemant") || v.name.includes("Male") || v.name.includes("Hari"))) || voices.find(v => v.lang.startsWith("hi-IN")) || voices.find(v => v.lang.startsWith("en-IN")) || voices[0];
  }
  if (charType === "hi-female") {
    return voices.find(v => v.lang.startsWith("hi-IN") && (v.name.includes("Kalpana") || v.name.includes("Female") || v.name.includes("Google हिन्दी") || v.name.includes("Madhur"))) || voices.find(v => v.lang.startsWith("hi-IN")) || voices.find(v => v.lang.startsWith("en-IN")) || voices[0];
  }
  if (charType === "bhojpuri") {
    return voices.find(v => v.lang.startsWith("hi-IN")) || voices.find(v => v.lang.startsWith("en-IN")) || voices[0];
  }
  return null;
};

export default function Dashboard({ user, hfToken, ideogramApiKey, currentTier, onPricingClick, onLogout, theme, toggleTheme }) {
  const [prompt, setPrompt] = useState(() => {
    const init = sessionStorage.getItem("chitra_initial_prompt");
    if (init) {
      sessionStorage.removeItem("chitra_initial_prompt");
      return init;
    }
    return "";
  });
  const [style, setStyle] = useState("realistic");
  const [count, setCount] = useState(4);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalCopied, setModalCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("create"); // "create" | "video" | "explore" | "archive"

  // SaaS Silicon Valley States
  const [credits, setCredits] = useState(() => {
    const val = localStorage.getItem("chitra_credits") || localStorage.getItem("khicho_credits");
    return val !== null ? Number(val) : 50;
  });
  const [enhancingPrompt, setEnhancingPrompt] = useState(false);
  const [remixToast, setRemixToast] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [exploreSearch, setExploreSearch] = useState("");
  const [selectedExploreCategory, setSelectedExploreCategory] = useState("all");
  const [archiveSearch, setArchiveSearch] = useState("");

  // Creative AI Power Tools (4K Upscale, Background Remover, Seed Lock, Prompt History)
  const [upscaling, setUpscaling] = useState(false);
  const [upscaledUrl, setUpscaledUrl] = useState(null);
  const [removingBg, setRemovingBg] = useState(false);
  const [bgRemovedUrl, setBgRemovedUrl] = useState(null);
  const [lockedSeed, setLockedSeed] = useState(null);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [promptHistory, setPromptHistory] = useState(() => {
    try {
      const stored = localStorage.getItem("chitra_prompt_history");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [historySearch, setHistorySearch] = useState("");

  // Tri-Engine Parameters: Midjourney, Leonardo.ai & Ideogram
  const [engineTab, setEngineTab] = useState("presets"); // "presets" | "midjourney" | "leonardo" | "ideogram"
  const [stylizeLevel, setStylizeLevel] = useState(250); // Midjourney: 50, 250, 750, 1000
  const [chaosLevel, setChaosLevel] = useState(0); // Midjourney: 0, 25, 50
  const [alchemyMode, setAlchemyMode] = useState(false); // Leonardo.ai: PhotoReal Alchemy toggle
  const [cameraLens, setCameraLens] = useState("none"); // Leonardo.ai: Optics Lens preset
  const [lightingRig, setLightingRig] = useState("none"); // Leonardo.ai: Lighting Rig preset
  const [ideogramText, setIdeogramText] = useState(""); // Ideogram: Text / typography
  const [ideogramTypeStyle, setIdeogramTypeStyle] = useState("3D Chrome & Glass"); // Ideogram: typography style
  const [colorPalette, setColorPalette] = useState("none"); // Ideogram: Harmonic color palette

  // Video Studio States
  const [videoTopic, setVideoTopic] = useState("");
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoLoadingStep, setVideoLoadingStep] = useState("");
  const [videoScenes, setVideoScenes] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [selectedCharacter, setSelectedCharacter] = useState("in-female");
  const [systemVoices, setSystemVoices] = useState([]);
  const [captionStyle, setCaptionStyle] = useState("yellow"); // "yellow" | "white"
  const [captionColor, setCaptionColor] = useState("#fbbf24");
  const [captionSize, setCaptionSize] = useState(20);
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [videoAspectRatio, setVideoAspectRatio] = useState("16:9");

  // CNN/YOLO Local Simulation States
  const [showCnnModal, setShowCnnModal] = useState(false);
  const [visionLabTab, setVisionLabTab] = useState("cnn"); // "cnn" | "yolo"
  const [yoloScanning, setYoloScanning] = useState(false);
  const [cnnFeatures, setCnnFeatures] = useState({ edge: null, ridge: null, sharpen: null });

  // Trigger scanning animation when switching to YOLO tab
  useEffect(() => {
    if (visionLabTab === "yolo" && showCnnModal) {
      setYoloScanning(true);
      const timer = setTimeout(() => {
        setYoloScanning(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [visionLabTab, showCnnModal]);

  const getMockYoloDetections = (promptText) => {
    const text = (promptText || "").toLowerCase();
    const detections = [];

    if (text.includes("man") || text.includes("boy") || text.includes("guy") || text.includes("gentleman") || text.includes("male")) {
      detections.push({ label: "Person", confidence: 97.8, color: "#10b981", bbox: { left: "20%", top: "15%", width: "60%", height: "80%" } });
      detections.push({ label: "Face", confidence: 99.2, color: "#06b6d4", bbox: { left: "40%", top: "20%", width: "20%", height: "25%" } });
      if (text.includes("glass") || text.includes("specs")) {
        detections.push({ label: "Eyewear", confidence: 91.5, color: "#f43f5e", bbox: { left: "42%", top: "23%", width: "16%", height: "8%" } });
      }
    } else if (text.includes("woman") || text.includes("girl") || text.includes("lady") || text.includes("female")) {
      detections.push({ label: "Person", confidence: 98.4, color: "#10b981", bbox: { left: "20%", top: "15%", width: "60%", height: "80%" } });
      detections.push({ label: "Face", confidence: 99.5, color: "#06b6d4", bbox: { left: "40%", top: "20%", width: "20%", height: "25%" } });
      if (text.includes("glass") || text.includes("specs")) {
        detections.push({ label: "Eyewear", confidence: 92.1, color: "#f43f5e", bbox: { left: "42%", top: "23%", width: "16%", height: "8%" } });
      }
    } else if (text.includes("cat") || text.includes("kitten") || text.includes("kitty")) {
      detections.push({ label: "Cat", confidence: 96.5, color: "#eab308", bbox: { left: "25%", top: "35%", width: "50%", height: "55%" } });
    } else if (text.includes("dog") || text.includes("puppy") || text.includes("hound")) {
      detections.push({ label: "Dog", confidence: 95.8, color: "#eab308", bbox: { left: "25%", top: "35%", width: "50%", height: "55%" } });
    } else if (text.includes("car") || text.includes("auto") || text.includes("vehicle") || text.includes("truck")) {
      detections.push({ label: "Car", confidence: 89.7, color: "#8b5cf6", bbox: { left: "10%", top: "40%", width: "80%", height: "50%" } });
    } else if (text.includes("laptop") || text.includes("computer") || text.includes("screen")) {
      detections.push({ label: "Laptop", confidence: 94.2, color: "#3b82f6", bbox: { left: "25%", top: "35%", width: "50%", height: "45%" } });
    } else {
      detections.push({ label: "Main Subject", confidence: 95.2, color: "#10b981", bbox: { left: "15%", top: "15%", width: "70%", height: "70%" } });
      detections.push({ label: "Foreground Object", confidence: 88.4, color: "#06b6d4", bbox: { left: "30%", top: "45%", width: "40%", height: "40%" } });
    }

    if (text.includes("tree") || text.includes("forest") || text.includes("plant") || text.includes("nature")) {
      detections.push({ label: "Tree", confidence: 85.3, color: "#10b981", bbox: { left: "5%", top: "5%", width: "30%", height: "75%" } });
    }
    if (text.includes("mountain") || text.includes("hill") || text.includes("peak")) {
      detections.push({ label: "Mountain Range", confidence: 91.9, color: "#6b7280", bbox: { left: "0%", top: "20%", width: "100%", height: "50%" } });
    }

    return detections;
  };

  const runCnnSimulation = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const edgeKernel = [
          -1, -1, -1,
          -1,  8, -1,
          -1, -1, -1
        ];
        const ridgeKernel = [
          -1,  0,  1,
          -2,  0,  2,
          -1,  0,  1
        ];
        const sharpenKernel = [
           0, -1,  0,
          -1,  5, -1,
           0, -1,  0
        ];

        const edge = applyConvolution(img, edgeKernel);
        const ridge = applyConvolution(img, ridgeKernel);
        const sharpen = applyConvolution(img, sharpenKernel);
        setCnnFeatures({ edge, ridge, sharpen });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Load system voices for speech synthesis
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setSystemVoices(voices);
    };
    loadVoices();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const handleModalCopy = () => {
    if (!selectedImage) return;
    navigator.clipboard.writeText(selectedImage.prompt);
    setModalCopied(true);
    setTimeout(() => setModalCopied(false), 1500);
  };

  const handleUpscale4K = async () => {
    if (!selectedImage || upscaling) return;
    setUpscaling(true);
    try {
      const res = await upscaleImageTo4K(selectedImage.url, 2);
      setUpscaledUrl(res.url);
      setRemixToast("✨ Upscaled to 4K Ultra-HD!");
      setTimeout(() => setRemixToast(""), 3000);
    } catch (err) {
      console.error(err);
      setRemixToast("⚠️ Upscale note: " + (err.message || "Could not process image"));
      setTimeout(() => setRemixToast(""), 3000);
    } finally {
      setUpscaling(false);
    }
  };

  const handleRemoveBg = async () => {
    if (!selectedImage || removingBg) return;
    setRemovingBg(true);
    try {
      const res = await removeImageBackground(selectedImage.url);
      setBgRemovedUrl(res.url);
      setRemixToast("✂️ Background removed successfully!");
      setTimeout(() => setRemixToast(""), 3000);
    } catch (err) {
      console.error(err);
      setRemixToast("⚠️ Cutout note: " + (err.message || "Could not process cutout"));
      setTimeout(() => setRemixToast(""), 3000);
    } finally {
      setRemovingBg(false);
    }
  };

  const handleShareWhatsApp = () => {
    if (!selectedImage) return;
    const text = `Look at this artwork I created with Chitra AI!\n"${selectedImage.prompt}"\n${selectedImage.url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleShareTwitter = () => {
    if (!selectedImage) return;
    const text = `Created with @ChitraAI: "${selectedImage.prompt}"\n\n${selectedImage.url}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleCopyShareLink = () => {
    if (!selectedImage) return;
    navigator.clipboard.writeText(selectedImage.url);
    setRemixToast("🔗 Direct image link copied to clipboard!");
    setTimeout(() => setRemixToast(""), 2500);
  };

  const handleEnhancePrompt = () => {
    if (!prompt.trim()) return;
    const styleEnhancers = ENHANCERS[style] || [
      "highly detailed, cinematic lighting, 8k resolution, masterpiece composition, award-winning artistic style",
      "dramatic lighting, soft depth of field, vibrant colors, composition, high fidelity, 4k",
      "volumetric atmosphere, rich color palette, intricate detailing, professional creative grading, masterpiece"
    ];
    const randomIndex = Math.floor(Math.random() * styleEnhancers.length);
    const modifier = styleEnhancers[randomIndex];
    const trimmed = prompt.trim();
    const separator = trimmed.endsWith(",") ? " " : trimmed.length > 0 ? ", " : "";
    setPrompt((p) => `${p.trim()}${separator}${modifier}`);
  };

  const handleGeminiEnhancePrompt = async () => {
    if (!prompt.trim() || enhancingPrompt) return;
    setEnhancingPrompt(true);
    setError("");
    try {
      const res = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() })
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.enhancedPrompt && data.enhancedPrompt !== prompt.trim()) {
          setPrompt(data.enhancedPrompt);
          setRemixToast("✨ Enhanced with Gemini Flash AI!");
          setTimeout(() => setRemixToast(""), 3000);
          return;
        }
      }
      handleEnhancePrompt();
    } catch {
      handleEnhancePrompt();
    } finally {
      setEnhancingPrompt(false);
    }
  };

  const handleRemix = (item) => {
    setPrompt(item.prompt);
    if (item.style) setStyle(item.style);
    if (item.aspectRatio) setAspectRatio(item.aspectRatio);
    setActiveTab("create");
    setRemixToast(`✨ Loaded prompt: "${item.title}"`);
    setTimeout(() => setRemixToast(""), 3000);
  };

  const [images, setImages] = useState(() => {
    try {
      const saved = localStorage.getItem("chitra_history") || localStorage.getItem("khicho_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [uploadedImage, setUploadedImage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    try {
      const successfulImages = images.filter((img) => img.status === "done");
      localStorage.setItem("chitra_history", JSON.stringify(successfulImages.slice(0, 50)));
    } catch (err) {
      console.error("Failed to save history:", err);
    }
  }, [images]);

  const generate = useCallback(async () => {
    const { valid, error: validError } = validatePrompt(prompt);
    if (!valid && !uploadedImage) return setError(validError);
    if (loading) return;

    if (credits <= 0) {
      setError("You have reached your 50 free creation credits. Upgrade to keep creating!");
      if (onPricingClick) onPricingClick();
      return;
    }

    setError("");
    setLoading(true);
    const selectedStyle = STYLES.find((s) => s.id === style);
    let promptToBuild = prompt.trim() || "stylize this image";

    // 1. Ideogram 2.0: Typography & Text Rendering
    if (ideogramText.trim()) {
      promptToBuild += `, featuring prominent sharp typography displaying "${ideogramText.trim()}" in ${ideogramTypeStyle} style`;
    }

    // 2. Ideogram 2.0: Harmonic Color Palette
    if (colorPalette && colorPalette !== "none") {
      promptToBuild += `, ${colorPalette} color grading`;
    }

    // 3. Leonardo.ai: Optics & Lens
    if (cameraLens && cameraLens !== "none") {
      promptToBuild += `, shot on ${cameraLens}`;
    }

    // 4. Leonardo.ai: Studio Lighting Rig
    if (lightingRig && lightingRig !== "none") {
      promptToBuild += `, ${lightingRig}`;
    }

    // 5. Leonardo.ai: PhotoReal Alchemy Mode
    if (alchemyMode) {
      promptToBuild += `, Leonardo Alchemy photoreal contrast, 8k raytraced global illumination, hyper-detailed skin pores and texture`;
    }

    // 6. Midjourney v6: Stylize & Chaos Parameters
    if (stylizeLevel && stylizeLevel !== 250) {
      promptToBuild += `, --stylize ${stylizeLevel}`;
    }
    if (chaosLevel && chaosLevel > 0) {
      promptToBuild += `, --chaos ${chaosLevel}`;
    }

    // 7. Negative Prompting
    if (negativePrompt.trim()) {
      promptToBuild += `, avoid: ${negativePrompt.trim()}`;
    }
    const fullPrompt = buildPrompt(promptToBuild, selectedStyle);

    const placeholders = Array.from({ length: count }, (_, i) =>
      createImageJob(prompt.trim(), selectedStyle, i, aspectRatio)
    );
    setImages((prev) => [...placeholders, ...prev]);

    // Save prompt to searchable history
    if (prompt.trim()) {
      setPromptHistory((prev) => {
        const filtered = prev.filter((p) => p.text !== prompt.trim());
        const updated = [{ text: prompt.trim(), time: new Date().toISOString(), style }, ...filtered].slice(0, 50);
        localStorage.setItem("chitra_prompt_history", JSON.stringify(updated));
        return updated;
      });
    }

    // Deduct credits
    setCredits((prevCredits) => {
      const next = Math.max(0, prevCredits - count);
      localStorage.setItem("chitra_credits", next.toString());
      return next;
    });

    // Generate images swiftly in parallel with lightweight stagger
    await Promise.allSettled(
      placeholders.map(async (ph, i) => {
        if (i > 0) await new Promise((r) => setTimeout(r, i * 150));
        try {
          let url;
          if (uploadedImage) {
            url = await generateImageToImage(uploadedImage, fullPrompt, hfToken, aspectRatio);
          } else {
            url = await generateImage(fullPrompt, i, currentTier, ideogramApiKey, aspectRatio, lockedSeed);
          }
          setImages((prev) =>
            prev.map((img) =>
              img.id === ph.id ? { ...img, url, status: "done" } : img
            )
          );
        } catch (err) {
          setImages((prev) =>
            prev.map((img) =>
              img.id === ph.id ? { ...img, status: "error", error: err.message || "Failed to generate image" } : img
            )
          );
        }
      })
    );
    setLoading(false);
  }, [prompt, style, count, loading, hfToken, uploadedImage, aspectRatio, credits, negativePrompt, onPricingClick, lockedSeed, stylizeLevel, chaosLevel, alchemyMode, cameraLens, lightingRig, ideogramText, ideogramTypeStyle, colorPalette]);

  const handleDownloadAll = useCallback(async () => {
    const doneImages = images.filter((img) => img.status === "done");
    if (doneImages.length === 0) return;
    for (const img of doneImages) {
      await new Promise((r) => setTimeout(r, 400));
      await downloadImage(img.url, `chitra-${img.id}.jpg`);
    }
  }, [images]);

  const deleteImage = (id) => setImages((prev) => prev.filter((img) => img.id !== id));

  // Audio Playback Controllers for Video Studio
  const speechRef = useRef(null);

  const stopPlayback = useCallback(() => {
    window.speechSynthesis.cancel();
    setPlaying(false);
    if (speechRef.current) {
      speechRef.current.onend = null;
      speechRef.current = null;
    }
  }, []);

  const playSceneAudio = useCallback((index) => {
    if (!videoScenes || !videoScenes[index]) return;
    window.speechSynthesis.cancel();
    
    const scene = videoScenes[index];
    const characterVoice = getVoiceForCharacter(selectedCharacter, systemVoices);
    
    let speakText = scene.script;
    if (selectedCharacter === "bhojpuri") {
      speakText = translateToBhojpuri(scene.script, videoTopic);
    } else if (selectedCharacter === "hi-female" || selectedCharacter === "hi-male") {
      speakText = translateToHindi(scene.script, videoTopic);
    }

    const utterance = new SpeechSynthesisUtterance(speakText);
    if (characterVoice) {
      utterance.voice = characterVoice;
    }
    
    utterance.onend = () => {
      if (index < videoScenes.length - 1) {
        setActiveSceneIndex(index + 1);
        playSceneAudio(index + 1);
      } else {
        setPlaying(false);
        setActiveSceneIndex(0);
      }
    };

    utterance.onerror = (e) => {
      console.warn("Speech synthesis error, falling back to scene duration:", e);
      setTimeout(() => {
        if (index < videoScenes.length - 1) {
          setActiveSceneIndex(index + 1);
          playSceneAudio(index + 1);
        } else {
          setPlaying(false);
          setActiveSceneIndex(0);
        }
      }, scene.duration * 1000);
    };

    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [videoScenes, selectedCharacter, systemVoices, videoTopic]);

  const handlePlayToggle = () => {
    if (playing) {
      stopPlayback();
    } else {
      setPlaying(true);
      const startIdx = activeSceneIndex >= videoScenes.length ? 0 : activeSceneIndex;
      setActiveSceneIndex(startIdx);
      playSceneAudio(startIdx);
    }
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const generateVideo = async () => {
    if (!videoTopic.trim() || videoLoading) return;
    setError("");
    setVideoLoading(true);
    setVideoLoadingStep("Creating story script...");
    
    const query = videoTopic.toLowerCase();
    let templateScenes = [];
    
    if (query.includes("space") || query.includes("universe") || query.includes("star") || query.includes("planet") || query.includes("black hole")) {
      templateScenes = [
        {
          script: "The universe spans infinitely, holding secrets beyond our wild imagination.",
          prompt: "swirling colorful space nebula, glowing stars, cinematic volumetric lighting, 8k resolution, futuristic digital art",
          duration: 5
        },
        {
          script: "For generations, humanity has gazed upon the stars, dreaming of a journey into the deep void.",
          prompt: "an astronaut standing on the moon surface looking at the glowing blue Earth, hyper-detailed, photorealistic",
          duration: 6
        },
        {
          script: "Now, the time has come. We are stepping into the cosmos, navigating warp gates towards new frontiers.",
          prompt: "futuristic warp spaceship traveling through a glowing dimensional wormhole, raytraced neon render, 8k",
          duration: 6
        }
      ];
    } else if (query.includes("nature") || query.includes("forest") || query.includes("river") || query.includes("mountain") || query.includes("green") || query.includes("lake")) {
      templateScenes = [
        {
          script: "Deep in the quiet forest, nature whispers ancient secrets to those who stop to listen.",
          prompt: "magical sunlit forest, giant ancient trees, glowing river stream, soft volumetric fog, studio ghibli anime style",
          duration: 5
        },
        {
          script: "Every mountain peak stands as a testament of time, holding the skies in everlasting embrace.",
          prompt: "massive snow-capped mountain peaks surrounding a crystal clear lake at golden hour, realistic DSLR photo",
          duration: 6
        },
        {
          script: "This planet is our only home. It is a masterpiece created in silence, meant to be preserved forever.",
          prompt: "a floating green island in a glowing sky, plants and waterfalls, surreal fantasy digital painting, high resolution",
          duration: 6
        }
      ];
    } else if (query.includes("tech") || query.includes("ai") || query.includes("robot") || query.includes("future") || query.includes("cyber")) {
      templateScenes = [
        {
          script: "Artificial Intelligence is redefining the canvas of human thought, spark-plugging the digital renaissance.",
          prompt: "glowing blue abstract neural network brain, floating cybernetic code particles, dark background, cyberpunk art",
          duration: 5
        },
        {
          script: "Humanoid robots are stepping out of science fiction, learning to create and think alongside us.",
          prompt: "a sleek white humanoid robot standing next to an easel and painting oil art, soft studio lighting, 3d render",
          duration: 6
        },
        {
          script: "We stand at the edge of a new horizon. A cybernetic future where design merges with algorithms.",
          prompt: "futuristic cyberpunk neon skyscraper city at night, flying hover vehicles, raytraced puddle reflections, 8k",
          duration: 6
        }
      ];
    } else {
      const topic = videoTopic.trim();
      templateScenes = [
        {
          script: `Let us dive into the wonderful world of ${topic}, where creativity knows no bounds.`,
          prompt: `${topic} in a beautiful cinematic landscape, golden hour lighting, hyper-detailed, 8k, photorealistic`,
          duration: 5
        },
        {
          script: `Every single angle reveals a deeper mystery and intricate story behind the creation of ${topic}.`,
          prompt: `macro detailed close-up shot of ${topic}, professional studio lighting, DSLR camera, sharp focus, 4k`,
          duration: 6
        },
        {
          script: "A true masterpiece captured in the flow of time, celebrating the art of visual imagination.",
          prompt: `stylized fantasy watercolor painting of ${topic}, soft color bleeding, fine paper texture, artistic masterpiece`,
          duration: 6
        }
      ];
    }

    try {
      const renderedScenes = [];
      for (let idx = 0; idx < templateScenes.length; idx++) {
        setVideoLoadingStep(`Rendering scene ${idx + 1} of 3...`);
        const scene = templateScenes[idx];
        const imageUrl = await generateImage(scene.prompt, idx, currentTier, ideogramApiKey, videoAspectRatio);
        renderedScenes.push({
          ...scene,
          id: `scene-${idx}-${Date.now()}`,
          url: imageUrl,
          aspectRatio: videoAspectRatio
        });
      }
      setVideoScenes(renderedScenes);
      setActiveSceneIndex(0);
      setPlaying(false);
    } catch (err) {
      console.error("Video generation failed:", err);
      setError(`Failed to generate video: ${err.message}`);
    } finally {
      setVideoLoading(false);
      setVideoLoadingStep("");
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return setError("Image must be under 5MB");
      setUploadedImage(file);
      setError("");
      runCnnSimulation(file);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.key === "Enter" && !e.shiftKey) || ((e.ctrlKey || e.metaKey) && e.key === "Enter")) {
      e.preventDefault();
      generate();
    }
  };

  return (
    <div className="mj-app">
      {/* Floating Notification Banner */}
      {remixToast && (
        <div className="mj-remix-banner">
          {remixToast}
        </div>
      )}

      {/* Sidebar */}
      <aside className="mj-sidebar">
        <Logo size="sm" showMark />
        <div style={{ width: 32, height: 1, background: "var(--border)", margin: "8px 0" }} />
        <button
          className={`mj-sidebar-btn ${activeTab === "create" ? "active" : ""}`}
          onClick={() => { stopPlayback(); setActiveTab("create"); }}
          title="Create Art"
        >
          <Sparkles size={20} />
        </button>
        <button
          className={`mj-sidebar-btn ${activeTab === "explore" ? "active" : ""}`}
          onClick={() => { stopPlayback(); setActiveTab("explore"); }}
          title="Explore Community"
        >
          <Compass size={20} />
        </button>
        <button
          className={`mj-sidebar-btn ${activeTab === "archive" ? "active" : ""}`}
          onClick={() => { stopPlayback(); setActiveTab("archive"); }}
          title="My Archive"
        >
          <Archive size={20} />
        </button>
        <button
          className={`mj-sidebar-btn ${activeTab === "video" ? "active" : ""}`}
          onClick={() => setActiveTab("video")}
          title="Video Studio"
        >
          <Film size={20} />
        </button>
        <button className="mj-sidebar-btn" onClick={onPricingClick} title="Subscription"><CreditCard size={20} /></button>
        <div className="mj-sidebar-spacer" />
        <button className="mj-sidebar-btn" onClick={toggleTheme} title="Toggle theme">
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button className="mj-sidebar-btn" onClick={onLogout} title="Log out">
          <LogOut size={18} />
        </button>
      </aside>

      {/* Mobile Bottom Navigation Bar (Visible only on mobile devices) */}
      <nav className="mj-mobile-nav">
        <button
          className={`mj-mobile-nav-btn ${activeTab === "create" ? "active" : ""}`}
          onClick={() => { stopPlayback(); setActiveTab("create"); }}
          title="Create Art"
        >
          <Sparkles size={20} />
        </button>
        <button
          className={`mj-mobile-nav-btn ${activeTab === "explore" ? "active" : ""}`}
          onClick={() => { stopPlayback(); setActiveTab("explore"); }}
          title="Explore"
        >
          <Compass size={20} />
        </button>
        <button
          className={`mj-mobile-nav-btn ${activeTab === "archive" ? "active" : ""}`}
          onClick={() => { stopPlayback(); setActiveTab("archive"); }}
          title="Archive"
        >
          <Archive size={20} />
        </button>
        <button
          className={`mj-mobile-nav-btn ${activeTab === "video" ? "active" : ""}`}
          onClick={() => setActiveTab("video")}
          title="Video Studio"
        >
          <Film size={20} />
        </button>
        <button className="mj-mobile-nav-btn" onClick={onPricingClick} title="Subscription">
          <CreditCard size={20} />
        </button>
        <button className="mj-mobile-nav-btn" onClick={toggleTheme} title="Toggle theme">
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button className="mj-mobile-nav-btn" onClick={onLogout} title="Log out">
          <LogOut size={20} />
        </button>
      </nav>

      {/* Main */}
      <main className="mj-main">
        {activeTab === "create" && (
          <>
            <header className="mj-topbar">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>
                  {images.length > 0 ? `${images.length} creations` : "Create"}
                </span>
                {images.filter((img) => img.status === "done").length > 0 && (
                  <button
                    onClick={handleDownloadAll}
                    style={{
                      background: "transparent",
                      border: "1px solid var(--border)",
                      color: "var(--text-secondary)",
                      padding: "4px 12px",
                      borderRadius: "9999px",
                      fontSize: "11px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--border-hover)";
                      e.currentTarget.style.color = "var(--text-primary)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border)";
                      e.currentTarget.style.color = "var(--text-secondary)";
                    }}
                  >
                    <Download size={12} /> Save All
                  </button>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  className="mj-credits-badge"
                  onClick={onPricingClick}
                  title="Your available creation tokens. Click to refill."
                >
                  <Zap size={13} fill="#fbbf24" color="#fbbf24" />
                  <span>{credits} Credits</span>
                </div>
                <div
                  onClick={onPricingClick}
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: currentTier === "Free" ? "var(--text-muted)" : currentTier === "Starter" ? "#3b82f6" : currentTier === "Pro" ? "#8b5cf6" : "#ef4444",
                    background: currentTier === "Free" ? "rgba(255,255,255,0.03)" : currentTier === "Starter" ? "rgba(59,130,246,0.1)" : currentTier === "Pro" ? "rgba(139,92,246,0.1)" : "rgba(239,68,68,0.1)",
                    border: `1px solid ${currentTier === "Free" ? "var(--border)" : currentTier === "Starter" ? "rgba(59,130,246,0.2)" : currentTier === "Pro" ? "rgba(139,92,246,0.2)" : "rgba(239,68,68,0.2)"}`,
                    padding: "4px 10px",
                    borderRadius: "9999px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = currentTier === "Free" ? "var(--border-hover)" : currentTier === "Starter" ? "#3b82f6" : currentTier === "Pro" ? "#8b5cf6" : "#ef4444";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = currentTier === "Free" ? "var(--border)" : currentTier === "Starter" ? "rgba(59,130,246,0.2)" : currentTier === "Pro" ? "rgba(139,92,246,0.2)" : "rgba(239,68,68,0.2)";
                  }}
                >
                  {currentTier === "Free" ? "Free Member" : `${currentTier} Tier`}
                </div>
                <div className="mj-user-pill">
                  <div className="mj-avatar">{user.name?.charAt(0).toUpperCase() || "U"}</div>
                  <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{user.name}</span>
                </div>
              </div>
            </header>

            <div className="mj-gallery animate-slide-up">
              {images.length === 0 ? (
                <div className="mj-gallery-empty">
                  <Sparkles size={32} strokeWidth={1} color="var(--text-muted)" />
                  <h2>What will you imagine?</h2>
                  <p>Type a prompt below and press Enter to generate stunning AI art in seconds.</p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginTop: 8 }}>
                    {SUGGESTIONS.slice(0, 3).map((s, i) => (
                      <button key={i} className="mj-prompt-btn" onClick={() => setPrompt(s)}>{s}</button>
                    ))}
                  </div>
                </div>
              ) : (
                 <div className="mj-gallery-grid">
                   {images.map((img) => (
                     <ImageCard 
                       key={img.id} 
                       item={img} 
                       onDelete={deleteImage} 
                       onImageClick={() => img.status === "done" && setSelectedImage(img)}
                     />
                   ))}
                 </div>
              )}
            </div>
          </>
        )}

        {/* Explore Community Tab */}
        {activeTab === "explore" && (
          <div className="mj-explore-container animate-slide-up">
            <header className="mj-explore-header">
              <div>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 400, color: "var(--text-primary)", textAlign: "left" }}>
                  Community Showcase 🌍
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "4px" }}>
                  Trending prompts generated by top creators. Click Remix to instantly load any prompt and style.
                </p>
              </div>

              {/* Search Bar */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "9999px", padding: "6px 14px", width: "min(320px, 100%)" }}>
                <Search size={14} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder="Search styles, themes, keywords..."
                  value={exploreSearch}
                  onChange={(e) => setExploreSearch(e.target.value)}
                  style={{ background: "transparent", border: "none", outline: "none", color: "var(--text-primary)", fontSize: "12px", width: "100%" }}
                />
                {exploreSearch && (
                  <button onClick={() => setExploreSearch("")} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><X size={12} /></button>
                )}
              </div>
            </header>

            {/* Category Filter Pills */}
            <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }} className="hide-scrollbar">
              {["all", "cyberpunk", "ghibli", "realistic", "anime", "fantasy", "3d", "watercolor", "oilpaint"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedExploreCategory(cat)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "9999px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    textTransform: "capitalize",
                    border: `1px solid ${selectedExploreCategory === cat ? "var(--accent)" : "var(--border)"}`,
                    background: selectedExploreCategory === cat ? "var(--accent-bg)" : "var(--surface)",
                    color: selectedExploreCategory === cat ? "var(--text-primary)" : "var(--text-secondary)",
                    transition: "all 0.15s ease"
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Explore Grid */}
            <div className="mj-explore-grid">
              {EXPLORE_ITEMS
                .filter((item) => {
                  const matchCat = selectedExploreCategory === "all" || item.style === selectedExploreCategory;
                  const matchSearch = !exploreSearch || item.title.toLowerCase().includes(exploreSearch.toLowerCase()) || item.prompt.toLowerCase().includes(exploreSearch.toLowerCase());
                  return matchCat && matchSearch;
                })
                .map((item) => (
                  <div key={item.id} className="mj-explore-card">
                    <div className="mj-explore-thumb-wrap">
                      <img
                        src={item.img || buildImageUrl(item.prompt, item.seed, 600, 600)}
                        alt={item.title}
                        loading="lazy"
                        onError={(e) => {
                          if (item.img && e.currentTarget.src !== item.img) {
                            e.currentTarget.src = item.img;
                          }
                        }}
                      />
                      <div style={{
                        position: "absolute",
                        top: "10px",
                        left: "10px",
                        background: "rgba(0,0,0,0.65)",
                        backdropFilter: "blur(4px)",
                        color: "white",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        fontSize: "10px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px"
                      }}>
                        {item.style}
                      </div>
                      <div style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        background: "rgba(0,0,0,0.65)",
                        backdropFilter: "blur(4px)",
                        color: "#f43f5e",
                        padding: "3px 8px",
                        borderRadius: "9999px",
                        fontSize: "11px",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}>
                        <Heart size={11} fill="#f43f5e" /> {item.likes}
                      </div>
                    </div>

                    <div className="mj-explore-meta">
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                          <h4 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>{item.title}</h4>
                          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{item.author}</span>
                        </div>
                        <p className="mj-explore-prompt">{item.prompt}</p>
                      </div>

                      <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                        <button
                          className="mj-remix-btn"
                          style={{ flex: 1 }}
                          onClick={() => handleRemix(item)}
                          title="Load this prompt, style, and settings into generator"
                        >
                          <Sparkles size={12} /> Remix Prompt
                        </button>
                        <button
                          style={{
                            background: "var(--surface-hover)",
                            border: "1px solid var(--border)",
                            color: "var(--text-secondary)",
                            padding: "7px 12px",
                            borderRadius: "8px",
                            fontSize: "11px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px"
                          }}
                          onClick={() => {
                            navigator.clipboard.writeText(item.prompt);
                            setRemixToast("✓ Prompt copied to clipboard!");
                            setTimeout(() => setRemixToast(""), 2500);
                          }}
                          title="Copy prompt"
                        >
                          <Copy size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* My Archive Tab */}
        {activeTab === "archive" && (
          <div className="mj-archive-container animate-slide-up">
            <header className="mj-archive-header">
              <div>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 400, color: "var(--text-primary)", textAlign: "left" }}>
                  My Art Archive 📁
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "4px" }}>
                  All your past creations are automatically stored safely in your browser.
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "9999px", padding: "6px 14px", width: "min(260px, 100%)" }}>
                  <Search size={14} color="var(--text-muted)" />
                  <input
                    type="text"
                    placeholder="Search your history..."
                    value={archiveSearch}
                    onChange={(e) => setArchiveSearch(e.target.value)}
                    style={{ background: "transparent", border: "none", outline: "none", color: "var(--text-primary)", fontSize: "12px", width: "100%" }}
                  />
                  {archiveSearch && (
                    <button onClick={() => setArchiveSearch("")} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><X size={12} /></button>
                  )}
                </div>

                {images.length > 0 && (
                  <button
                    onClick={() => {
                      if (window.confirm("Are you sure you want to clear your local image history?")) {
                        setImages([]);
                        localStorage.removeItem("chitra_history");
                        localStorage.removeItem("khicho_history");
                      }
                    }}
                    style={{
                      background: "rgba(248, 113, 113, 0.1)",
                      border: "1px solid rgba(248, 113, 113, 0.2)",
                      color: "#f87171",
                      padding: "6px 12px",
                      borderRadius: "9999px",
                      fontSize: "11px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    <Trash2 size={12} /> Clear All
                  </button>
                )}
              </div>
            </header>

            {images.filter(img => img.status === "done").length === 0 ? (
              <div className="mj-gallery-empty" style={{ minHeight: "360px" }}>
                <Archive size={40} strokeWidth={1} color="var(--text-muted)" />
                <h2>No creations in archive yet</h2>
                <p>Images you generate will appear here automatically so you never lose them.</p>
                <button
                  className="mj-generate-btn"
                  style={{ marginTop: "16px", padding: "8px 20px" }}
                  onClick={() => setActiveTab("create")}
                >
                  <Sparkles size={14} /> Start Creating
                </button>
              </div>
            ) : (
              <div className="mj-gallery-grid">
                {images
                  .filter((img) => img.status === "done" && (!archiveSearch || (img.prompt || "").toLowerCase().includes(archiveSearch.toLowerCase())))
                  .map((img) => (
                    <ImageCard
                      key={img.id}
                      item={img}
                      onDelete={deleteImage}
                      onImageClick={() => setSelectedImage(img)}
                    />
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Video Studio Panel */}
        {activeTab === "video" && (
          <div className="mj-video-studio animate-slide-up">
            <div className="mj-video-main">
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 400, color: "var(--text-primary)", textAlign: "left" }}>
                    Video Studio <span style={{ fontSize: "12px", background: "rgba(139, 92, 246, 0.1)", color: "#8b5cf6", padding: "2px 8px", borderRadius: "4px", fontWeight: 600, marginLeft: "8px" }}>BETA</span>
                  </h2>
                  <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "4px" }}>
                    Generate scripts, voiceovers, and matching AI visuals to create presentations.
                  </p>
                </div>
              </div>

              {/* Video Player or Setup */}
              {!videoScenes ? (
                /* Generator Setup Box */
                <div style={{
                  background: "linear-gradient(135deg, var(--surface) 0%, rgba(139, 92, 246, 0.03) 100%)",
                  border: "1px solid var(--border)",
                  borderRadius: "24px",
                  padding: "48px 32px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "28px",
                  textAlign: "center",
                  minHeight: "440px",
                  boxShadow: "var(--shadow-md)"
                }}>
                  <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(139, 92, 246, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#8b5cf6" }}>
                    <Film size={28} style={{ margin: "auto" }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "20px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "8px" }}>Create your AI Video Presentation</h3>
                    <p style={{ color: "var(--text-secondary)", fontSize: "14px", maxWidth: "460px", lineHeight: 1.5 }}>
                      Describe your topic in one sentence. We will automatically generate the narration script, render matching images with AI, and sync a voice actor!
                    </p>
                  </div>
                  
                  <div style={{ width: "100%", maxWidth: "600px" }}>
                    <textarea
                      value={videoTopic}
                      onChange={(e) => setVideoTopic(e.target.value)}
                      placeholder="e.g. A fascinating journey through black holes in deep space..."
                      style={{
                        width: "100%",
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border)",
                        borderRadius: "16px",
                        padding: "16px",
                        color: "var(--text-primary)",
                        fontSize: "14px",
                        resize: "none",
                        height: "90px",
                        outline: "none",
                        lineHeight: 1.5,
                        boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)"
                      }}
                    />
                    
                    {/* Presets Grid */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", marginTop: "12px" }}>
                      {[
                        { label: "Deep Space Exploration 🌌", value: "A fascinating journey through black holes and nebulae in deep space" },
                        { label: "Magical Fantasy Forest 🌿", value: "An ancient magical forest with glowing trees and mystical streams" },
                        { label: "Cyberpunk Future City 🌃", value: "A futuristic cyberpunk metropolis with glowing neon lights and flying cars" },
                        { label: "Future of Robots 🤖", value: "The rise of friendly humanoid robots helping humans paint and design" }
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          onClick={() => setVideoTopic(preset.value)}
                          style={{
                            background: "var(--surface)",
                            border: "1px solid var(--border)",
                            color: "var(--text-secondary)",
                            padding: "6px 12px",
                            borderRadius: "9999px",
                            fontSize: "11px",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.2s"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "#8b5cf6";
                            e.currentTarget.style.color = "var(--text-primary)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "var(--border)";
                            e.currentTarget.style.color = "var(--text-secondary)";
                          }}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    {error && (
                      <p style={{ color: "var(--error)", fontSize: "12px", textAlign: "left", marginTop: "6px" }}>{error}</p>
                    )}
                  </div>

                  <button
                    onClick={generateVideo}
                    disabled={videoLoading || !videoTopic.trim()}
                    style={{
                      padding: "14px 40px",
                      background: "var(--button-bg)",
                      color: "var(--button-text)",
                      border: "none",
                      borderRadius: "9999px",
                      fontWeight: 600,
                      fontSize: "14px",
                      cursor: videoTopic.trim() && !videoLoading ? "pointer" : "not-allowed",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      opacity: videoTopic.trim() && !videoLoading ? 1 : 0.5,
                      boxShadow: "0 4px 12px rgba(139, 92, 246, 0.2)",
                      transition: "all 0.2s"
                    }}
                  >
                    {videoLoading ? (
                      <>
                        <RefreshCw size={16} className="spin" style={{ animation: "spin 1s linear infinite" }} />
                        {videoLoadingStep}
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} /> Generate Video Storyboard
                      </>
                    )}
                  </button>
                </div>
              ) : (
                /* Active Video Editor Box */
                <>
                  {/* Player Canvas */}
                  <div 
                    className="mj-video-player"
                    style={{
                      aspectRatio: videoAspectRatio === "16:9" ? "16/9" : videoAspectRatio === "9:16" ? "9/16" : videoAspectRatio === "3:4" ? "3/4" : videoAspectRatio === "4:5" ? "4/5" : "1"
                    }}
                  >
                    <img
                      src={videoScenes[activeSceneIndex].url}
                      alt={`Scene ${activeSceneIndex + 1}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    


                    {/* Simple Play Overlay on Pause */}
                    {!playing && (
                      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <button
                          onClick={handlePlayToggle}
                          style={{
                            width: "64px",
                            height: "64px",
                            borderRadius: "50%",
                            background: "var(--button-bg)",
                            color: "var(--button-text)",
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "var(--shadow-lg)"
                          }}
                        >
                          <Play size={28} style={{ marginLeft: "4px" }} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Progress Segments */}
                  <div style={{ display: "flex", gap: "6px", width: "100%", height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden", marginTop: "12px" }}>
                    {videoScenes.map((_, idx) => (
                      <div 
                        key={idx} 
                        style={{ 
                          flex: 1, 
                          height: "100%", 
                          background: idx === activeSceneIndex ? "var(--accent)" : idx < activeSceneIndex ? "rgba(139, 92, 246, 0.4)" : "transparent",
                          borderRadius: "3px",
                          transition: "background 0.3s ease"
                        }} 
                      />
                    ))}
                  </div>

                  {/* Player Controls Bar */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "var(--surface)",
                    padding: "16px 24px",
                    borderRadius: "16px",
                    border: "1px solid var(--border)"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <button
                        onClick={handlePlayToggle}
                        style={{
                          background: "var(--bg-secondary)",
                          border: "1px solid var(--border)",
                          color: "var(--text-primary)",
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        {playing ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: "2px" }} />}
                      </button>
                      
                      <button
                        onClick={() => { stopPlayback(); setVideoScenes(null); }}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "var(--text-muted)",
                          fontSize: "13px",
                          cursor: "pointer"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-primary)"}
                        onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
                      >
                        Reset Video
                      </button>
                    </div>

                    <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 500 }}>
                      Scene {activeSceneIndex + 1} of {videoScenes.length}
                    </span>
                  </div>

                  {/* Storyboard Timeline Editor */}
                  <div>
                    <h3 style={{ fontSize: "15px", color: "var(--text-primary)", fontWeight: 600, marginBottom: "12px", textAlign: "left" }}>
                      Storyboard Timeline
                    </h3>
                    <div className="mj-video-timeline">
                      {videoScenes.map((scene, idx) => (
                        <div
                          key={scene.id}
                          className={`mj-timeline-card ${activeSceneIndex === idx ? "active" : ""}`}
                          onClick={() => {
                            setActiveSceneIndex(idx);
                            if (playing) {
                              playSceneAudio(idx);
                            }
                          }}
                        >
                          <div 
                            className="mj-timeline-thumb"
                            style={{
                              aspectRatio: videoAspectRatio === "16:9" ? "16/9" : videoAspectRatio === "9:16" ? "9/16" : videoAspectRatio === "3:4" ? "3/4" : videoAspectRatio === "4:5" ? "4/5" : "1"
                            }}
                          >
                            <img src={scene.url} alt={`Scene ${idx + 1}`} />
                            <span style={{
                              position: "absolute",
                              bottom: "6px",
                              left: "6px",
                              background: "rgba(0,0,0,0.6)",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              fontSize: "10px",
                              color: "white",
                              fontWeight: 600
                            }}>
                              Scene {idx + 1}
                            </span>
                          </div>
                          <textarea
                            className="mj-timeline-textarea"
                            value={scene.script}
                            onChange={(e) => {
                              const text = e.target.value;
                              setVideoScenes((prev) =>
                                prev.map((s, sIdx) => sIdx === idx ? { ...s, script: text } : s)
                              );
                            }}
                            onClick={(e) => e.stopPropagation()}
                            placeholder="Type script voiceover..."
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Right column: Settings */}
            <div className="mj-video-sidebar">
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)" }}>Studio Settings</h3>
              
              {/* Video Aspect Ratio */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "8px" }}>
                  Aspect Ratio
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                  {["16:9", "9:16", "3:4", "4:5", "1:1"].map((ratio) => (
                    <button
                      key={ratio}
                      onClick={() => setVideoAspectRatio(ratio)}
                      style={{
                        padding: "6px",
                        background: videoAspectRatio === ratio ? "var(--accent)" : "var(--bg-secondary)",
                        color: videoAspectRatio === ratio ? "white" : "var(--text-secondary)",
                        border: "1px solid var(--border)",
                        borderRadius: "6px",
                        fontSize: "11px",
                        cursor: "pointer"
                      }}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Voice Selection */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "12px" }}>
                  <Volume2 size={12} style={{ marginRight: "4px", verticalAlign: "middle" }} /> Narration Voice
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {[
                    { id: "hi-female", label: "Hindi Female", desc: "Kalpana / Google हिन्दी" },
                    { id: "hi-male", label: "Hindi Male", desc: "Hemant / Hari Accent" },
                    { id: "in-female", label: "Indian English Female", desc: "Heera / Swara Accent" },
                    { id: "in-male", label: "Indian English Male", desc: "Ravi Accent" },
                    { id: "us-female", label: "US Female", desc: "Zira / Jenny Accent" },
                    { id: "us-male", label: "US Male", desc: "David Accent" },
                    { id: "bhojpuri", label: "Bhojpuri Bhaiya", desc: "Bhojpuri Script Dialect" }
                  ].map((char) => (
                    <button
                      key={char.id}
                      onClick={() => {
                        stopPlayback();
                        setSelectedCharacter(char.id);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "10px 14px",
                        background: selectedCharacter === char.id ? "rgba(139, 92, 246, 0.08)" : "var(--bg-secondary)",
                        border: `1px solid ${selectedCharacter === char.id ? "var(--accent)" : "var(--border)"}`,
                        borderRadius: "12px",
                        color: "var(--text-primary)",
                        cursor: "pointer",
                        width: "100%",
                        textAlign: "left",
                        transition: "all 0.2s"
                      }}
                    >
                      <Globe size={16} style={{ color: "var(--accent)" }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "13px", fontWeight: 600 }}>{char.label}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>{char.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>



              {/* Guide Note */}
              <div style={{
                marginTop: "16px",
                borderTop: "1px solid var(--border)",
                paddingTop: "16px",
                fontSize: "11px",
                color: "var(--text-muted)",
                lineHeight: 1.5
              }}>
                <strong style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}><Lightbulb size={12} style={{ color: "var(--accent)" }} /> Tip:</strong> You can edit the text inside the timeline cards to change the voice narration! Click any card to preview that scene.
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom prompt bar */}
      {activeTab === "create" && (
        <div className="mj-prompt-dock animate-slide-up">
        <div className="mj-prompt-bar">
          {uploadedImage && (
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: 10 }}>
              <div style={{ position: "relative", display: "inline-block" }}>
                <img
                  src={URL.createObjectURL(uploadedImage)}
                  alt="Reference"
                  style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8, border: "1px solid var(--border)" }}
                />
                <button
                  onClick={() => setUploadedImage(null)}
                  style={{
                    position: "absolute", top: -6, right: -6,
                    width: 18, height: 18, borderRadius: "50%",
                    background: "var(--surface)", border: "1px solid var(--border)",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--text-muted)",
                  }}
                ><X size={10} /></button>
              </div>
              <button
                onClick={() => {
                  setVisionLabTab("cnn");
                  setShowCnnModal(true);
                }}
                className="mj-prompt-btn"
                style={{ height: "36px", padding: "0 12px", display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(139, 92, 246, 0.1)", border: "1px solid rgba(139, 92, 246, 0.2)", color: "var(--accent)" }}
              >
                <Cpu size={14} /> AI Vision Lab (CNN & YOLO)
              </button>
            </div>
          )}

          <textarea
            className="mj-prompt-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Imagine..."
            rows={1}
          />

          {error && (
            <p style={{ color: "var(--error)", fontSize: 12, marginTop: 6 }}>{error}</p>
          )}

          {/* Active Tri-Engine Rig Badges */}
          {(alchemyMode || ideogramText || cameraLens !== "none" || lightingRig !== "none" || colorPalette !== "none" || stylizeLevel !== 250 || chaosLevel > 0) && (
            <div style={{
              display: "flex",
              gap: "6px",
              flexWrap: "wrap",
              padding: "6px 10px",
              background: "rgba(0,0,0,0.35)",
              backdropFilter: "blur(8px)",
              borderRadius: "10px",
              marginBottom: "8px",
              alignItems: "center",
              border: "1px solid var(--border)"
            }}>
              <span style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.6px" }}>Studio Rig:</span>
              
              {alchemyMode && (
                <span style={{ fontSize: "11px", background: "rgba(245, 158, 11, 0.15)", border: "1px solid rgba(245, 158, 11, 0.35)", color: "#f59e0b", padding: "2px 8px", borderRadius: "9999px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <Zap size={10} /> Alchemy PhotoReal <button onClick={() => setAlchemyMode(false)} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0 }}><X size={10} /></button>
                </span>
              )}

              {ideogramText && (
                <span style={{ fontSize: "11px", background: "rgba(6, 182, 212, 0.15)", border: "1px solid rgba(6, 182, 212, 0.35)", color: "#06b6d4", padding: "2px 8px", borderRadius: "9999px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <Type size={10} /> &ldquo;{ideogramText}&rdquo; <button onClick={() => setIdeogramText("")} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0 }}><X size={10} /></button>
                </span>
              )}

              {cameraLens !== "none" && (
                <span style={{ fontSize: "11px", background: "rgba(139, 92, 246, 0.15)", border: "1px solid rgba(139, 92, 246, 0.35)", color: "#a78bfa", padding: "2px 8px", borderRadius: "9999px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <Camera size={10} /> {cameraLens.split(",")[0]} <button onClick={() => setCameraLens("none")} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0 }}><X size={10} /></button>
                </span>
              )}

              {lightingRig !== "none" && (
                <span style={{ fontSize: "11px", background: "rgba(234, 179, 8, 0.15)", border: "1px solid rgba(234, 179, 8, 0.35)", color: "#eab308", padding: "2px 8px", borderRadius: "9999px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <SunMedium size={10} /> {lightingRig.split(" ")[0]} Light <button onClick={() => setLightingRig("none")} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0 }}><X size={10} /></button>
                </span>
              )}

              {colorPalette !== "none" && (
                <span style={{ fontSize: "11px", background: "rgba(236, 72, 153, 0.15)", border: "1px solid rgba(236, 72, 153, 0.35)", color: "#ec4899", padding: "2px 8px", borderRadius: "9999px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <Palette size={10} /> {colorPalette.split(" ")[0]} <button onClick={() => setColorPalette("none")} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0 }}><X size={10} /></button>
                </span>
              )}

              {stylizeLevel !== 250 && (
                <span style={{ fontSize: "11px", background: "rgba(59, 130, 246, 0.15)", border: "1px solid rgba(59, 130, 246, 0.35)", color: "#60a5fa", padding: "2px 8px", borderRadius: "9999px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <Sparkles size={10} /> --s {stylizeLevel} <button onClick={() => setStylizeLevel(250)} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0 }}><X size={10} /></button>
                </span>
              )}

              {chaosLevel > 0 && (
                <span style={{ fontSize: "11px", background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.35)", color: "#f87171", padding: "2px 8px", borderRadius: "9999px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  --c {chaosLevel} <button onClick={() => setChaosLevel(0)} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0 }}><X size={10} /></button>
                </span>
              )}

              <button
                onClick={() => {
                  setAlchemyMode(false);
                  setIdeogramText("");
                  setCameraLens("none");
                  setLightingRig("none");
                  setColorPalette("none");
                  setStylizeLevel(250);
                  setChaosLevel(0);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  fontSize: "10px",
                  cursor: "pointer",
                  textDecoration: "underline",
                  marginLeft: "auto"
                }}
              >
                Reset Rig
              </button>
            </div>
          )}

          <div className="mj-prompt-toolbar">
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" style={{ display: "none" }} />
            <button className="mj-prompt-btn" onClick={() => fileInputRef.current?.click()}>
              <ImagePlus size={14} /> Image
            </button>
            <button className="mj-prompt-btn" onClick={() => {
              const randomIndex = Math.floor(Math.random() * SUGGESTIONS.length);
              setPrompt(SUGGESTIONS[randomIndex]);
            }} title="Get a random prompt suggestion">
              <Dices size={14} /> Surprise Me
            </button>
            <button
              className={`mj-prompt-btn ${enhancingPrompt ? "mj-enhance-glow" : ""}`}
              onClick={handleGeminiEnhancePrompt}
              disabled={enhancingPrompt}
              title="Enhance prompt with Gemini 2.5 Flash AI"
            >
              <Wand2 size={14} className={enhancingPrompt ? "animate-spin" : ""} />
              {enhancingPrompt ? "Enhancing..." : "✨ AI Enhance"}
            </button>
            <button
              className={`mj-prompt-btn ${showSettings ? "active" : ""}`}
              onClick={() => setShowSettings((s) => !s)}
            >
              <Settings2 size={14} /> Studio Rig
            </button>
            <button
              className={`mj-prompt-btn ${showHistoryDrawer ? "active" : ""}`}
              onClick={() => setShowHistoryDrawer((h) => !h)}
              title="View recent prompt history"
            >
              <History size={14} /> History
            </button>
            <button
              className={`mj-prompt-btn ${lockedSeed !== null ? "active" : ""}`}
              onClick={() => {
                if (lockedSeed !== null) {
                  setLockedSeed(null);
                  setRemixToast("🔓 Seed unlocked (Random seeds)");
                } else {
                  const newSeed = Math.floor(Math.random() * 800000) + 10000;
                  setLockedSeed(newSeed);
                  setRemixToast(`🔒 Seed locked to #${newSeed} for character consistency!`);
                }
                setTimeout(() => setRemixToast(""), 3000);
              }}
              title={lockedSeed !== null ? `Seed locked to #${lockedSeed}` : "Lock seed for character consistency"}
            >
              {lockedSeed !== null ? <Lock size={14} style={{ color: "#10b981" }} /> : <Unlock size={14} />}
              {lockedSeed !== null ? `#${lockedSeed}` : "Seed"}
            </button>

            {showSettings && (
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                width: "100%",
                marginTop: "12px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "16px",
                padding: "16px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.25)"
              }}>
                {/* Engine Selector Tabs */}
                <div style={{
                  display: "flex",
                  gap: "6px",
                  borderBottom: "1px solid var(--border)",
                  paddingBottom: "10px",
                  overflowX: "auto"
                }} className="hide-scrollbar">
                  {[
                    { id: "presets", label: "Presets & Styles", icon: Palette },
                    { id: "midjourney", label: "Midjourney v6", icon: Sparkles },
                    { id: "leonardo", label: "Leonardo.ai Optics", icon: Camera },
                    { id: "ideogram", label: "Ideogram 2.0 Typography", icon: Type }
                  ].map((tab) => {
                    const TabIcon = tab.icon;
                    const isActive = engineTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setEngineTab(tab.id)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "6px 14px",
                          borderRadius: "9999px",
                          fontSize: "11px",
                          fontWeight: 600,
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                          border: `1px solid ${isActive ? "var(--accent)" : "transparent"}`,
                          background: isActive ? "var(--accent-bg)" : "transparent",
                          color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                          transition: "all 0.15s ease"
                        }}
                      >
                        <TabIcon size={13} style={{ color: isActive ? "var(--accent)" : "inherit" }} />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Tab 1: Presets & Styles */}
                {engineTab === "presets" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: "6px" }}>Artistic Style:</span>
                      <div className="mj-style-scroll hide-scrollbar" style={{ width: "100%", margin: 0 }}>
                        {STYLES.map((s) => (
                          <button
                            key={s.id}
                            className={`mj-prompt-btn ${style === s.id ? "active" : ""}`}
                            onClick={() => setStyle(s.id)}
                            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                          >
                            {renderStyleIcon(s.lucideName)} {s.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", borderTop: "1px solid var(--border)", paddingTop: "10px" }}>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, marginRight: "6px" }}>Aspect Ratio:</span>
                      {["1:1", "16:9", "9:16", "3:4", "4:5"].map((ratio) => (
                        <button
                          key={ratio}
                          className={`mj-prompt-btn ${aspectRatio === ratio ? "active" : ""}`}
                          onClick={() => setAspectRatio(ratio)}
                          style={{ fontSize: "11px", padding: "4px 8px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                        >
                          {ratio === "1:1" && <Square size={12} />}
                          {ratio === "16:9" && <Tv size={12} />}
                          {ratio === "9:16" && <Smartphone size={12} />}
                          {ratio === "3:4" && <Image size={12} />}
                          {ratio === "4:5" && <Image size={12} />}
                          {ratio}
                        </button>
                      ))}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", borderTop: "1px solid var(--border)", paddingTop: "10px" }}>
                      <label style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>Negative Prompt (Elements to avoid):</label>
                      <input
                        type="text"
                        value={negativePrompt}
                        onChange={(e) => setNegativePrompt(e.target.value)}
                        placeholder="e.g. blurry, deformed, extra fingers, text, watermark"
                        style={{
                          background: "var(--bg-secondary)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                          padding: "6px 12px",
                          fontSize: "12px",
                          color: "var(--text-primary)",
                          outline: "none"
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Tab 2: Midjourney v6 Engine */}
                {engineTab === "midjourney" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>Stylize Intensity (--stylize):</span>
                        <span style={{ fontSize: "11px", color: "#60a5fa", fontWeight: 700 }}>--s {stylizeLevel}</span>
                      </div>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {[
                          { val: 50, label: "Subtle (50)" },
                          { val: 250, label: "Standard (250)" },
                          { val: 750, label: "Artistic (750)" },
                          { val: 1000, label: "Avant-Garde (1000)" }
                        ].map((item) => (
                          <button
                            key={item.val}
                            onClick={() => setStylizeLevel(item.val)}
                            className={`mj-prompt-btn ${stylizeLevel === item.val ? "active" : ""}`}
                            style={{ fontSize: "11px", padding: "5px 12px" }}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ borderTop: "1px solid var(--border)", paddingTop: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>Chaos &amp; Variance (--chaos):</span>
                        <span style={{ fontSize: "11px", color: "#f87171", fontWeight: 700 }}>--c {chaosLevel}</span>
                      </div>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {[
                          { val: 0, label: "Zero Chaos (0)" },
                          { val: 25, label: "Moderate Drift (25)" },
                          { val: 50, label: "High Divergence (50)" }
                        ].map((item) => (
                          <button
                            key={item.val}
                            onClick={() => setChaosLevel(item.val)}
                            className={`mj-prompt-btn ${chaosLevel === item.val ? "active" : ""}`}
                            style={{ fontSize: "11px", padding: "5px 12px" }}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ borderTop: "1px solid var(--border)", paddingTop: "10px" }}>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: "6px" }}>Midjourney Aspect Formats:</span>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {["1:1", "16:9", "9:16", "4:5", "21:9"].map((ratio) => (
                          <button
                            key={ratio}
                            onClick={() => setAspectRatio(ratio)}
                            className={`mj-prompt-btn ${aspectRatio === ratio ? "active" : ""}`}
                            style={{ fontSize: "11px", padding: "4px 10px" }}
                          >
                            {ratio === "21:9" ? "21:9 Cinema" : ratio}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 3: Leonardo.ai Optics */}
                {engineTab === "leonardo" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {/* Alchemy PhotoReal Toggle */}
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: alchemyMode ? "rgba(245, 158, 11, 0.1)" : "var(--bg-secondary)",
                      border: `1px solid ${alchemyMode ? "rgba(245, 158, 11, 0.3)" : "var(--border)"}`,
                      borderRadius: "12px",
                      padding: "10px 14px",
                      transition: "all 0.2s ease"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <Zap size={18} style={{ color: alchemyMode ? "#f59e0b" : "var(--text-muted)" }} />
                        <div>
                          <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>
                            Leonardo PhotoReal Alchemy v2
                          </div>
                          <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                            Hyper-detailed raytracing, sub-surface scattering &amp; high dynamic range
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setAlchemyMode((m) => !m)}
                        style={{
                          background: alchemyMode ? "#f59e0b" : "rgba(255, 255, 255, 0.08)",
                          color: alchemyMode ? "#000" : "var(--text-secondary)",
                          border: "none",
                          borderRadius: "9999px",
                          padding: "6px 14px",
                          fontSize: "11px",
                          fontWeight: 700,
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                      >
                        {alchemyMode ? "ENABLED" : "OFF"}
                      </button>
                    </div>

                    {/* Camera Lens Optics */}
                    <div style={{ borderTop: "1px solid var(--border)", paddingTop: "10px" }}>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: "6px" }}>Camera &amp; Lens Optics:</span>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {[
                          { id: "none", label: "Auto Lens" },
                          { id: "35mm cinematic prime camera, f/1.8", label: "35mm Prime" },
                          { id: "85mm portrait lens, f/1.4 creamy bokeh", label: "85mm Portrait Bokeh" },
                          { id: "16mm ultra-wide angle architectural lens", label: "16mm Wide Angle" },
                          { id: "macro camera lens, extreme fine detail", label: "Macro Extreme" },
                          { id: "drone aerial top-down camera", label: "Drone Aerial" }
                        ].map((cam) => (
                          <button
                            key={cam.id}
                            onClick={() => setCameraLens(cam.id)}
                            className={`mj-prompt-btn ${cameraLens === cam.id ? "active" : ""}`}
                            style={{ fontSize: "11px", padding: "4px 10px" }}
                          >
                            {cam.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Studio Lighting Rig */}
                    <div style={{ borderTop: "1px solid var(--border)", paddingTop: "10px" }}>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: "6px" }}>Studio Lighting Rig:</span>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {[
                          { id: "none", label: "Natural Light" },
                          { id: "studio softbox rim lighting with crisp edge definition", label: "Studio Softbox" },
                          { id: "golden hour directional warm sunlight and lens flare", label: "Golden Hour" },
                          { id: "dramatic chiaroscuro lighting with deep Caravaggio shadows", label: "Chiaroscuro Noir" },
                          { id: "cyberpunk volumetric dual-tone cyan and magenta neon", label: "Cyberpunk Neon" }
                        ].map((light) => (
                          <button
                            key={light.id}
                            onClick={() => setLightingRig(light.id)}
                            className={`mj-prompt-btn ${lightingRig === light.id ? "active" : ""}`}
                            style={{ fontSize: "11px", padding: "4px 10px" }}
                          >
                            {light.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 4: Ideogram 2.0 Typography */}
                {engineTab === "ideogram" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div>
                      <label style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: "6px" }}>
                        Exact Typography / Words to Render:
                      </label>
                      <input
                        type="text"
                        value={ideogramText}
                        onChange={(e) => setIdeogramText(e.target.value)}
                        placeholder="e.g. TECHINDRO, Cyber Café, Chitra AI, Tokyo Dreams"
                        style={{
                          width: "100%",
                          background: "var(--bg-secondary)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                          padding: "8px 12px",
                          fontSize: "12px",
                          color: "var(--text-primary)",
                          outline: "none"
                        }}
                      />
                    </div>

                    <div>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: "6px" }}>Typography Style:</span>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {[
                          "3D Chrome & Glass",
                          "Vibrant Neon Sign",
                          "Swiss Modern Serif",
                          "Vintage Retro Badge",
                          "Graffiti Mural"
                        ].map((tStyle) => (
                          <button
                            key={tStyle}
                            onClick={() => setIdeogramTypeStyle(tStyle)}
                            className={`mj-prompt-btn ${ideogramTypeStyle === tStyle ? "active" : ""}`}
                            style={{ fontSize: "11px", padding: "4px 10px" }}
                          >
                            {tStyle}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ borderTop: "1px solid var(--border)", paddingTop: "10px" }}>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: "6px" }}>Harmonic Color Palette:</span>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {[
                          { id: "none", label: "Auto Colors" },
                          { id: "warm amber and gold sunset", label: "Amber Sunset" },
                          { id: "cinematic teal and orange", label: "Teal & Orange" },
                          { id: "cyberpunk magenta and electric cyan", label: "Cyberpunk" },
                          { id: "monochrome high-contrast film noir", label: "Noir B&W" },
                          { id: "pastel lilac and soft mint dreamscape", label: "Pastel Dream" }
                        ].map((pal) => (
                          <button
                            key={pal.id}
                            onClick={() => setColorPalette(pal.id)}
                            className={`mj-prompt-btn ${colorPalette === pal.id ? "active" : ""}`}
                            style={{ fontSize: "11px", padding: "4px 10px" }}
                          >
                            {pal.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mj-count-toggle">
              {[1, 2, 4].map((n) => (
                <button key={n} className={count === n ? "active" : ""} onClick={() => setCount(n)}>
                  {n}
                </button>
              ))}
            </div>

            <button
              className="mj-generate-btn"
              onClick={generate}
              disabled={loading}
              title="Generate art (Press Enter or Ctrl+Enter)"
            >
              {loading ? (
                <>
                  <div style={{
                    width: 14, height: 14,
                    border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "var(--button-text)",
                    borderRadius: "50%", animation: "spin 0.8s linear infinite",
                  }} />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles size={14} /> Imagine <span style={{ fontSize: "10px", opacity: 0.6, marginLeft: "4px" }}>↵</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Lightbox / Detail Viewer Modal */}
      {selectedImage && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(12px)",
            padding: "20px",
            animation: "fadeIn 0.2s ease"
          }}
          onClick={() => setSelectedImage(null)}
        >
          <div
            style={{
              width: "min(900px, 95vw)",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "20px",
              overflow: "hidden",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              maxHeight: "90vh",
              boxShadow: "var(--shadow-xl)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "rgba(0, 0, 0, 0.5)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "white",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10
              }}
            >
              <X size={16} />
            </button>

            {/* Modal Content Wrapper */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", flex: 1, overflow: "hidden" }}>
              {/* Image Container with Badges */}
              <div style={{
                background: "#0a0a0a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                position: "relative",
                aspectRatio: "1",
                backgroundImage: bgRemovedUrl ? "linear-gradient(45deg, #1f1f1f 25%, transparent 25%), linear-gradient(-45deg, #1f1f1f 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1f1f1f 75%), linear-gradient(-45deg, transparent 75%, #1f1f1f 75%)" : "none",
                backgroundSize: "20px 20px",
                backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px"
              }}>
                <img
                  src={bgRemovedUrl || upscaledUrl || selectedImage.url}
                  alt={selectedImage.prompt}
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />

                {/* Processing Overlay Badge */}
                {(upscaledUrl || bgRemovedUrl) && (
                  <div style={{
                    position: "absolute",
                    top: "14px",
                    left: "14px",
                    padding: "6px 12px",
                    borderRadius: "9999px",
                    background: "rgba(16, 185, 129, 0.9)",
                    backdropFilter: "blur(6px)",
                    color: "white",
                    fontSize: "11px",
                    fontWeight: 700,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.4)"
                  }}>
                    {bgRemovedUrl ? "✂️ Transparent Cutout" : "✨ 4K Super-Resolution Active"}
                  </div>
                )}
              </div>

              {/* Details Sidebar */}
              <div style={{ padding: "24px 22px", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "16px", background: "var(--bg-secondary)", textAlign: "left", overflowY: "auto" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <span style={{
                      fontSize: "11px",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      color: "#8b5cf6",
                      background: "rgba(139, 92, 246, 0.08)",
                      padding: "4px 10px",
                      borderRadius: "9999px",
                      fontWeight: 600,
                      display: "inline-block",
                    }}>
                      Generation Details
                    </span>

                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      Seed: #{selectedImage.seed || "Auto"}
                    </span>
                  </div>

                  <h4 style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "6px" }}>Prompt</h4>
                  <div style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    padding: "12px 14px",
                    color: "var(--text-primary)",
                    fontSize: "13px",
                    lineHeight: 1.5,
                    marginBottom: "16px",
                    maxHeight: "120px",
                    overflowY: "auto"
                  }}>
                    {selectedImage.prompt}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                    <div>
                      <h4 style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "2px" }}>Style</h4>
                      <span style={{ fontSize: "13px", color: "var(--text-primary)" }}>
                        {STYLES.find((s) => s.id === selectedImage.style)?.label || "Default"}
                      </span>
                    </div>
                    <div>
                      <h4 style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "2px" }}>Created At</h4>
                      <span style={{ fontSize: "13px", color: "var(--text-primary)" }}>
                        {new Date(selectedImage.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>

                  {/* AI Creative Power Tools */}
                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: "14px", marginBottom: "14px" }}>
                    <h4 style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      AI Studio Tools
                    </h4>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      <button
                        onClick={handleUpscale4K}
                        disabled={upscaling}
                        style={{
                          padding: "10px",
                          background: upscaledUrl ? "rgba(16, 185, 129, 0.15)" : "rgba(139, 92, 246, 0.1)",
                          border: upscaledUrl ? "1px solid #10b981" : "1px solid rgba(139, 92, 246, 0.25)",
                          color: upscaledUrl ? "#10b981" : "var(--text-primary)",
                          borderRadius: "10px",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: upscaling ? "wait" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <Maximize2 size={13} className={upscaling ? "animate-spin" : ""} />
                        <span>{upscaling ? "Processing 4K..." : upscaledUrl ? "✓ 4K Active" : "✨ 4K Upscale"}</span>
                      </button>

                      <button
                        onClick={handleRemoveBg}
                        disabled={removingBg}
                        style={{
                          padding: "10px",
                          background: bgRemovedUrl ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.04)",
                          border: bgRemovedUrl ? "1px solid #10b981" : "1px solid var(--border)",
                          color: bgRemovedUrl ? "#10b981" : "var(--text-primary)",
                          borderRadius: "10px",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: removingBg ? "wait" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <Scissors size={13} className={removingBg ? "animate-spin" : ""} />
                        <span>{removingBg ? "Isolating..." : bgRemovedUrl ? "✓ Cutout Active" : "✂️ Remove BG"}</span>
                      </button>

                      {/* Midjourney Style Variations */}
                      <button
                        onClick={() => {
                          const variedPrompt = `${selectedImage.prompt}, subtle aesthetic refinement, nuanced lighting variation`;
                          setPrompt(variedPrompt);
                          setSelectedImage(null);
                          setRemixToast("🔀 Midjourney Vary (Subtle) loaded! Generating...");
                          setTimeout(() => setRemixToast(""), 3000);
                        }}
                        style={{
                          padding: "10px",
                          background: "rgba(255, 255, 255, 0.04)",
                          border: "1px solid var(--border)",
                          color: "var(--text-primary)",
                          borderRadius: "10px",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <RefreshCw size={13} />
                        <span>Vary (Subtle)</span>
                      </button>

                      <button
                        onClick={() => {
                          const variedPrompt = `${selectedImage.prompt}, dramatic perspective shift, dynamic bold composition, evolved atmosphere`;
                          setPrompt(variedPrompt);
                          setSelectedImage(null);
                          setRemixToast("⚡ Midjourney Vary (Strong) loaded! Generating...");
                          setTimeout(() => setRemixToast(""), 3000);
                        }}
                        style={{
                          padding: "10px",
                          background: "rgba(255, 255, 255, 0.04)",
                          border: "1px solid var(--border)",
                          color: "var(--text-primary)",
                          borderRadius: "10px",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <Zap size={13} style={{ color: "#f59e0b" }} />
                        <span>Vary (Strong)</span>
                      </button>
                    </div>
                  </div>

                  {/* Social Share Bar */}
                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: "12px", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Share:</span>
                    <button
                      onClick={handleShareWhatsApp}
                      style={{
                        padding: "5px 10px",
                        background: "rgba(37, 211, 102, 0.1)",
                        border: "1px solid rgba(37, 211, 102, 0.3)",
                        color: "#25d366",
                        borderRadius: "8px",
                        fontSize: "11px",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                    >
                      <Share2 size={11} /> WhatsApp
                    </button>
                    <button
                      onClick={handleShareTwitter}
                      style={{
                        padding: "5px 10px",
                        background: "rgba(29, 155, 240, 0.1)",
                        border: "1px solid rgba(29, 155, 240, 0.3)",
                        color: "#1d9bf0",
                        borderRadius: "8px",
                        fontSize: "11px",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                    >
                      <Share2 size={11} /> Twitter / X
                    </button>
                    <button
                      onClick={handleCopyShareLink}
                      style={{
                        padding: "5px 10px",
                        background: "rgba(255, 255, 255, 0.04)",
                        border: "1px solid var(--border)",
                        color: "var(--text-secondary)",
                        borderRadius: "8px",
                        fontSize: "11px",
                        fontWeight: 600,
                        cursor: "pointer"
                      }}
                    >
                      Copy Link
                    </button>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                  <button
                    onClick={async () => {
                      const activeUrl = bgRemovedUrl || upscaledUrl || selectedImage.url;
                      const ext = (bgRemovedUrl || upscaledUrl) ? "png" : "jpg";
                      await downloadImage(activeUrl, `chitra-${selectedImage.id}.${ext}`);
                    }}
                    style={{
                      flex: 1,
                      padding: "12px",
                      background: "var(--button-bg)",
                      color: "var(--button-text)",
                      border: "none",
                      borderRadius: "10px",
                      fontWeight: 600,
                      fontSize: "13px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px"
                    }}
                  >
                    <Download size={14} />
                    {bgRemovedUrl ? "Download Cutout (PNG)" : upscaledUrl ? "Download 4K Ultra-HD" : "Download High-Res"}
                  </button>
                  <button
                    onClick={handleModalCopy}
                    style={{
                      padding: "12px 16px",
                      background: "var(--bg-tertiary)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border)",
                      borderRadius: "10px",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px"
                    }}
                  >
                    {modalCopied ? <>✓ Copied</> : <><Copy size={14} /> Copy Prompt</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prompt History Drawer Modal */}
      {showHistoryDrawer && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2200,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            justifyContent: "flex-end",
            animation: "fadeIn 0.15s ease"
          }}
          onClick={() => setShowHistoryDrawer(false)}
        >
          <div
            style={{
              width: "min(460px, 90vw)",
              height: "100%",
              background: "var(--surface)",
              borderLeft: "1px solid var(--border)",
              boxShadow: "var(--shadow-xl)",
              display: "flex",
              flexDirection: "column",
              padding: "24px 20px",
              gap: "16px",
              animation: "slideInRight 0.2s ease",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <History size={18} style={{ color: "var(--accent)" }} />
                <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                  Prompt History
                </h3>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", background: "var(--bg-secondary)", padding: "2px 8px", borderRadius: "9999px" }}>
                  {promptHistory.length}
                </span>
              </div>
              <button
                onClick={() => setShowHistoryDrawer(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  padding: "4px",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Search filter */}
            <div style={{ position: "relative" }}>
              <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search past prompts..."
                style={{
                  width: "100%",
                  padding: "8px 12px 8px 34px",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  color: "var(--text-primary)",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
            </div>

            {/* List */}
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }} className="hide-scrollbar">
              {promptHistory
                .filter((p) => !historySearch || p.text.toLowerCase().includes(historySearch.toLowerCase()))
                .map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "14px",
                      borderRadius: "12px",
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      transition: "border-color 0.15s ease",
                    }}
                  >
                    <p style={{ margin: 0, fontSize: "13px", color: "var(--text-primary)", lineHeight: 1.5 }}>
                      {item.text}
                    </p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        {new Date(item.time).toLocaleDateString([], { month: "short", day: "numeric" })} • {new Date(item.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(item.text);
                            setRemixToast("✓ Copied prompt!");
                            setTimeout(() => setRemixToast(""), 2000);
                          }}
                          style={{
                            padding: "4px 8px",
                            background: "transparent",
                            border: "1px solid var(--border)",
                            borderRadius: "6px",
                            color: "var(--text-secondary)",
                            fontSize: "11px",
                            cursor: "pointer",
                          }}
                        >
                          Copy
                        </button>
                        <button
                          onClick={() => {
                            setPrompt(item.text);
                            if (item.style) setStyle(item.style);
                            setShowHistoryDrawer(false);
                            setRemixToast("✨ Loaded into prompt bar!");
                            setTimeout(() => setRemixToast(""), 2500);
                          }}
                          style={{
                            padding: "4px 10px",
                            background: "var(--button-bg)",
                            color: "var(--button-text)",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Use
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              {promptHistory.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)", fontSize: "13px" }}>
                  No prompts recorded yet. Your generated prompts will appear here!
                </div>
              )}
            </div>

            {/* Footer */}
            {promptHistory.length > 0 && (
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "12px", display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={() => {
                    localStorage.removeItem("chitra_prompt_history");
                    setPromptHistory([]);
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--text-muted)",
                    fontSize: "12px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <Trash2 size={13} /> Clear History
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CNN Feature Inspector Modal */}
      {showCnnModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1100,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)",
          padding: "20px"
        }}>
          <div style={{
            width: "min(1000px, 95vw)", maxHeight: "90vh",
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "24px", padding: "32px", position: "relative",
            overflowY: "auto", display: "flex", flexDirection: "column", gap: "24px"
          }}>
            <button
              onClick={() => setShowCnnModal(false)}
              style={{
                position: "absolute", top: "20px", right: "20px",
                width: "36px", height: "36px", borderRadius: "50%",
                background: "var(--bg-secondary)", border: "1px solid var(--border)",
                color: "var(--text-muted)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}
            >
              <X size={16} />
            </button>

            <div>
              <span style={{
                fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px",
                color: "var(--accent)", background: "var(--accent-bg)",
                padding: "4px 10px", borderRadius: "9999px", fontWeight: 600,
                display: "inline-block", marginBottom: "12px"
              }}>
                {visionLabTab === "cnn" ? "Local Computer Vision Simulation" : "SOTA Spatial Annotation"}
              </span>
              <h2 style={{ fontSize: "24px", color: "var(--text-primary)", fontWeight: 500, margin: 0 }}>
                {visionLabTab === "cnn" ? "CNN Feature Maps" : "YOLO Real-time Object Detection"}
              </h2>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "6px" }}>
                {visionLabTab === "cnn" 
                  ? "This inspector visualizes the spatial features extracted by the first convolutional layers of a Convolutional Neural Network (CNN) in real-time."
                  : "This simulation demonstrates State-of-the-Art (SOTA) real-time spatial annotation and object bounding box localization."}
              </p>
            </div>

            {/* Segmented Control Tabs */}
            <div style={{
              display: "flex",
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              padding: "4px",
              alignSelf: "flex-start"
            }}>
              <button
                onClick={() => setVisionLabTab("cnn")}
                style={{
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "12px",
                  transition: "all 0.15s",
                  background: visionLabTab === "cnn" ? "var(--accent)" : "transparent",
                  color: visionLabTab === "cnn" ? "white" : "var(--text-secondary)"
                }}
              >
                CNN Feature Maps
              </button>
              <button
                onClick={() => setVisionLabTab("yolo")}
                style={{
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "12px",
                  transition: "all 0.15s",
                  background: visionLabTab === "yolo" ? "var(--accent)" : "transparent",
                  color: visionLabTab === "yolo" ? "white" : "var(--text-secondary)"
                }}
              >
                YOLO Detector (SOTA)
              </button>
            </div>

            {visionLabTab === "cnn" ? (
              <>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "20px"
                }}>
                  {/* Original */}
                  <div style={{ background: "var(--bg-secondary)", borderRadius: "16px", padding: "16px", border: "1px solid var(--border)", textAlign: "center" }}>
                    <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "12px" }}>Original Image</h3>
                    <img
                      src={URL.createObjectURL(uploadedImage)}
                      alt="Original"
                      style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: "10px", border: "1px solid var(--border)" }}
                    />
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "8px", lineHeight: "1.4" }}>Raw input pixel matrix fed to the visual encoder.</p>
                  </div>

                  {/* Layer 1 */}
                  <div style={{ background: "var(--bg-secondary)", borderRadius: "16px", padding: "16px", border: "1px solid var(--border)", textAlign: "center" }}>
                    <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "12px" }}>Layer 1: Edge Map</h3>
                    {cnnFeatures.edge ? (
                      <img
                        src={cnnFeatures.edge}
                        alt="Edges"
                        style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: "10px", border: "1px solid var(--border)" }}
                      />
                    ) : (
                      <div style={{ width: "100%", aspectRatio: "1", background: "var(--surface)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "12px" }}>Processing...</div>
                    )}
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "8px", lineHeight: "1.4" }}>Sobel kernel (Laplacian approximation) highlighting structural borders.</p>
                  </div>

                  {/* Layer 2 */}
                  <div style={{ background: "var(--bg-secondary)", borderRadius: "16px", padding: "16px", border: "1px solid var(--border)", textAlign: "center" }}>
                    <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "12px" }}>Layer 2: Ridge Map</h3>
                    {cnnFeatures.ridge ? (
                      <img
                        src={cnnFeatures.ridge}
                        alt="Ridges"
                        style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: "10px", border: "1px solid var(--border)" }}
                      />
                    ) : (
                      <div style={{ width: "100%", aspectRatio: "1", background: "var(--surface)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "12px" }}>Processing...</div>
                    )}
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "8px", lineHeight: "1.4" }}>Ridge detector highlighting textures and pattern gradients.</p>
                  </div>

                  {/* Layer 3 */}
                  <div style={{ background: "var(--bg-secondary)", borderRadius: "16px", padding: "16px", border: "1px solid var(--border)", textAlign: "center" }}>
                    <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "12px" }}>Layer 3: Sharpen Map</h3>
                    {cnnFeatures.sharpen ? (
                      <img
                        src={cnnFeatures.sharpen}
                        alt="Sharpen"
                        style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: "10px", border: "1px solid var(--border)" }}
                      />
                    ) : (
                      <div style={{ width: "100%", aspectRatio: "1", background: "var(--surface)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "12px" }}>Processing...</div>
                    )}
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "8px", lineHeight: "1.4" }}>High-pass filter amplifying shape boundaries and contrast contours.</p>
                  </div>
                </div>

                <div style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  borderRadius: "16px",
                  padding: "20px",
                  fontSize: "12px",
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                  textAlign: "left"
                }}>
                  <strong>How this relates to Diffusion Models & AIML:</strong> Modern generative AI systems (like Flux and Stable Diffusion) do not read raw photos directly. Instead, they use a **Vision Encoder (VAE / CLIP)** consisting of deep Convolutional Neural Networks (CNNs). These CNN layers apply mathematical convolution matrices (kernels) — identical to the ones simulated above — to convert the input photo into spatial feature maps. This extracted structural data is what guides the diffusion process to preserve your face and posture.
                </div>
              </>
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "28px",
                alignItems: "start"
              }}>
                {/* YOLO Scanner Overlay Container */}
                <div style={{
                  position: "relative",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  borderRadius: "20px",
                  padding: "16px",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center"
                }}>
                  <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "12px" }}>Scanning Input Frame</h3>
                  <div style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "1",
                    overflow: "hidden",
                    borderRadius: "12px",
                    border: "1px solid var(--border)"
                  }}>
                    <img
                      src={URL.createObjectURL(uploadedImage)}
                      alt="YOLO Detection Frame"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    {/* Glowing vertical laser scan line */}
                    {yoloScanning && <div className="yolo-scan-line" />}

                    {/* Bounding boxes (only shown after scanning completes) */}
                    {!yoloScanning && getMockYoloDetections(prompt).map((det, index) => (
                      <div
                        key={index}
                        className="yolo-bbox"
                        style={{
                          left: det.bbox.left,
                          top: det.bbox.top,
                          width: det.bbox.width,
                          height: det.bbox.height,
                          borderColor: det.color
                        }}
                      >
                        <span
                          className="yolo-bbox-label"
                          style={{ background: det.color }}
                        >
                          {det.label} {det.confidence}%
                        </span>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "12px", lineHeight: "1.4" }}>
                    {yoloScanning ? "Scanning image data..." : "Objects matching threshold criteria shown above."}
                  </p>
                </div>

                {/* YOLO Details & Annotations List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "20px", textAlign: "left" }}>
                  <div style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border)",
                    borderRadius: "20px",
                    padding: "20px"
                  }}>
                    <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "16px" }}>Detected Entities</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      {yoloScanning ? (
                        <div style={{ color: "var(--text-muted)", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
                          <RefreshCw size={14} className="animate-spin" /> Analyzing image pixels...
                        </div>
                      ) : (
                        getMockYoloDetections(prompt).map((det, index) => (
                          <div key={index} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ fontWeight: 600, fontSize: "13px", color: "var(--text-primary)" }}>{det.label}</span>
                              <span style={{ fontSize: "12px", fontWeight: 700, color: det.color, marginLeft: "auto" }}>{det.confidence}% Confidence</span>
                            </div>
                            <div style={{
                              width: "100%",
                              height: "6px",
                              background: "var(--surface)",
                              borderRadius: "3px",
                              overflow: "hidden"
                            }}>
                              <div style={{
                                width: `${det.confidence}%`,
                                height: "100%",
                                background: det.color,
                                borderRadius: "3px"
                              }} />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border)",
                    borderRadius: "20px",
                    padding: "20px",
                    fontSize: "12px",
                    lineHeight: 1.6,
                    color: "var(--text-secondary)"
                  }}>
                    <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "8px" }}>How does YOLO work?</h3>
                    <p style={{ margin: 0 }}>
                      <strong>YOLO (You Only Look Once)</strong> is an algorithm designed for real-time object detection. 
                      Instead of dividing the image and running classifiers on different regions, it runs the entire image through a single neural network pass. This allows the system to predict bounding boxes and labels all at once.
                    </p>
                    <p style={{ marginTop: "10px", marginBottom: 0 }}>
                      This single-pass approach is highly efficient, allowing it to perform object detection at fast frame rates on video or live camera feeds.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
