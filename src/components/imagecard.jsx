import { useState } from "react";
import { downloadImage } from "@utils/imageGen";
import { STYLES } from "../constants";
import {
  AlertTriangle, Clock, Sprout, Palette, Camera, Zap, Cpu, Brush, Box, Image, Gamepad2, Wand, RefreshCw
} from "lucide-react";

const renderStyleIcon = (lucideName) => {
  const iconMap = {
    Sprout, Palette, Camera, Zap, Cpu, Brush, Box, Image, Gamepad2, Wand
  };
  const IconComponent = iconMap[lucideName] || Image;
  return <IconComponent size={12} />;
};

export default function ImageCard({ item, onDelete, onImageClick }) {
  const [hov, setHov] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(item.url);
  const [retryAttempt, setRetryAttempt] = useState(0);

  const handleCopy = (e) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(item.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const style = STYLES.find((s) => s.id === item.style);

  const handleDownload = async (e) => {
    if (e) e.stopPropagation();
    setDownloading(true);
    await downloadImage(currentUrl || item.url, `chitra-${item.id}.jpg`);
    setDownloading(false);
  };

  const handleImageError = () => {
    if (retryAttempt === 0 && (currentUrl || item.url)) {
      setRetryAttempt(1);
      let target = currentUrl || item.url;
      if (target.includes("model=flux")) {
        target = target.replace("model=flux", "model=turbo");
      } else if (!target.includes("model=turbo")) {
        target = `${target}&model=turbo`;
      }
      setCurrentUrl(target);
      return;
    }
    if (retryAttempt === 1 && (currentUrl || item.url)) {
      setRetryAttempt(2);
      const target = (currentUrl || item.url).replace(/&model=[^&]*/g, "").replace(/model=[^&]*&?/g, "");
      const newSeed = Math.floor(Math.random() * 800000) + 1000;
      const seedReplaced = target.replace(/seed=\d+/, `seed=${newSeed}`);
      setCurrentUrl(seedReplaced);
      return;
    }
    setImgError(true);
  };

  const handleRetryManual = () => {
    setImgError(false);
    setRetryAttempt(0);
    const newSeed = Math.floor(Math.random() * 800000) + 1000;
    const base = (item.url || currentUrl).replace(/seed=\d+/, `seed=${newSeed}`);
    const fallback = base.includes("model=turbo") ? base : `${base}&model=turbo`;
    setCurrentUrl(fallback);
  };


  // ── GENERATING STATE ──
  if (item.status === "generating") {
    return (
      <article style={{
        borderRadius: "14px", overflow: "hidden",
        border: "1px solid var(--border)", background: "var(--surface)",
        animation: "fadeSlideUp 0.4s ease forwards",
      }}>
        <div style={{
          aspectRatio: "1", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: "14px",
          background: "var(--bg-secondary)",
        }}>
          <div style={{
            width: "36px", height: "36px",
            border: "3px solid var(--border)", borderTopColor: "var(--accent)",
            borderRadius: "50%", animation: "spin 0.8s linear infinite",
          }}/>
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "var(--accent)", fontSize: "13px", fontWeight: 500, margin: "0 0 8px" }}>
              Generating...
            </p>
            <div style={{
              width: "120px", height: "3px", background: "var(--border)",
              borderRadius: "2px", overflow: "hidden",
            }}>
              <div style={{
                height: "100%",
                background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
                borderRadius: "2px", animation: "progressBar 3s ease-in-out infinite",
              }}/>
            </div>
          </div>
        </div>
        <div style={{ padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border)" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "4px",
            background: "var(--accent-bg)", color: "var(--accent)", fontSize: "11px",
            padding: "3px 10px", borderRadius: "9999px", fontWeight: 500,
          }}>{renderStyleIcon(style?.lucideName)} {style?.label}</span>
          <span style={{ color: "var(--text-muted)", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
            <Clock size={10} />
            {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </article>
    );
  }

  // ── ERROR STATE ──
  if (item.status === "error") {
    return (
      <article style={{
        borderRadius: "14px", overflow: "hidden",
        border: "1px solid var(--border)", background: "var(--surface)",
        animation: "fadeSlideUp 0.4s ease forwards",
      }}>
        <div style={{
          aspectRatio: "1", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: "10px",
          padding: "20px", background: "rgba(239, 68, 68, 0.05)",
        }}>
          <AlertTriangle size={28} style={{ color: "var(--error)" }} />
          <p style={{ color: "var(--error)", fontSize: "13px", textAlign: "center", margin: 0, lineHeight: 1.5 }}>
            {item.error}
          </p>
        </div>
        <div style={{ padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border)" }}>
          <span style={{
            background: "rgba(239, 68, 68, 0.1)", color: "var(--error)", fontSize: "11px",
            padding: "3px 10px", borderRadius: "9999px", fontWeight: 500,
          }}>Failed</span>
          {onDelete && (
            <button onClick={() => onDelete(item.id)} style={{
              background: "rgba(239, 68, 68, 0.1)", border: "1px solid transparent",
              color: "var(--error)", padding: "4px 12px", borderRadius: "6px",
              cursor: "pointer", fontSize: "12px",
            }}>Remove</button>
          )}
        </div>
      </article>
    );
  }

  // ── DONE but image failed to load ──
  if (imgError) {
    return (
      <article style={{
        borderRadius: "14px", overflow: "hidden",
        border: "1px solid var(--border)", background: "var(--surface)",
      }}>
        <div style={{
          aspectRatio: "1", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: "10px",
          padding: "20px", background: "rgba(239, 68, 68, 0.05)",
        }}>
          <AlertTriangle size={28} style={{ color: "var(--error)" }} />
          <p style={{ color: "var(--error)", fontSize: "13px", textAlign: "center", margin: 0 }}>
            Image failed to load
          </p>
          <button
            onClick={handleRetryManual}
            style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              background: "var(--accent)", color: "#fff", border: "none",
              padding: "6px 14px", borderRadius: "8px", fontSize: "12px",
              cursor: "pointer", fontWeight: 500, marginTop: "4px"
            }}
          >
            <RefreshCw size={12} />
            Try Again
          </button>
        </div>
        <div style={{ padding: "10px 12px", display: "flex", justifyContent: "flex-end", borderTop: "1px solid var(--border)" }}>
          {onDelete && (
            <button onClick={() => onDelete(item.id)} style={{
              background: "rgba(239, 68, 68, 0.1)", border: "none",
              color: "var(--error)", padding: "4px 12px", borderRadius: "6px",
              cursor: "pointer", fontSize: "12px",
            }}>Remove</button>
          )}
        </div>
      </article>
    );
  }

  // ── DONE STATE ──
  return (
    <article
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: "14px", overflow: "hidden",
        border: "1px solid var(--border)", background: "var(--surface)",
        transform: hov ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hov ? "var(--shadow-md)" : "var(--shadow-sm)",
        transition: "all 0.2s ease",
        animation: "fadeSlideUp 0.4s ease forwards",
      }}
    >
      <div 
        onClick={onImageClick}
        style={{ 
          aspectRatio: item.aspectRatio === "16:9" ? "16/9" : item.aspectRatio === "9:16" ? "9/16" : item.aspectRatio === "3:4" ? "3/4" : item.aspectRatio === "4:5" ? "4/5" : "1",
          position: "relative", 
          overflow: "hidden", 
          cursor: "pointer" 
        }}
      >
        <img
          src={currentUrl || item.url}
          alt={item.prompt}
          onError={handleImageError}
          style={{
            width: "100%", height: "100%",
            objectFit: "cover", display: "block",
            transform: hov ? "scale(1.03)" : "scale(1)",
            transition: "transform 0.3s ease",
          }}
        />
        {hov && (
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 40%, transparent 100%)",
            display: "flex", flexDirection: "column", justifyContent: "flex-end",
            padding: "14px", animation: "fadeIn 0.15s ease",
          }}>
            <p style={{
              color: "rgba(255,255,255,0.9)", fontSize: "12px", margin: "0 0 10px",
              lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>{item.prompt}</p>
            <div style={{ display: "flex", gap: "6px" }}>
              <button onClick={handleDownload} disabled={downloading} style={{
                flex: 1, padding: "8px", background: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px", color: "white", cursor: "pointer",
                fontSize: "12px", fontWeight: 600, transition: "background 0.15s",
              }}>
                {downloading ? "Saving..." : "⬇ Download"}
              </button>
              <button onClick={handleCopy} style={{
                padding: "8px 12px", background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px",
                color: "white", cursor: "pointer", fontSize: "12px",
              }} title="Copy Prompt">{copied ? "✓" : "📋"}</button>
              <button onClick={(e) => { e.stopPropagation(); window.open(item.url, "_blank"); }} style={{
                padding: "8px 12px", background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px",
                color: "white", cursor: "pointer", fontSize: "12px",
              }}>↗</button>
              {onDelete && (
                <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} style={{
                  padding: "8px 12px", background: "rgba(239,68,68,0.3)",
                  border: "none", borderRadius: "8px",
                  color: "white", cursor: "pointer", fontSize: "12px",
                }}>✕</button>
              )}
            </div>
          </div>
        )}
      </div>
      <div style={{ padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border)" }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: "4px",
          background: "var(--accent-bg)", color: "var(--text-primary)", fontSize: "11px",
          padding: "3px 10px", borderRadius: "9999px", fontWeight: 500,
        }}>{style?.icon} {style?.label}</span>
        <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>
          {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </article>
  );
}
