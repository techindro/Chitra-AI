import { useState } from "react";

/**
 * LazyImg — Image with shimmer skeleton loading state
 */
export default function LazyImg({ src, alt, style, className, fallbackSrc }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [triedFallback, setTriedFallback] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  // Sync if src prop changes
  if (src !== currentSrc && !triedFallback) {
    setCurrentSrc(src);
  }

  const handleError = () => {
    if (fallbackSrc && !triedFallback && fallbackSrc !== currentSrc) {
      setTriedFallback(true);
      setCurrentSrc(fallbackSrc);
    } else {
      setError(true);
    }
  };

  return (
    <div style={{ position: "relative", overflow: "hidden", ...style }} className={className}>
      {!loaded && !error && (
        <div
          aria-label="Loading image..."
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(110deg, var(--bg-secondary) 30%, var(--bg-tertiary) 50%, var(--bg-secondary) 70%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite",
          }}
        />
      )}
      {error && (
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg, rgba(30,30,40,0.8), rgba(15,15,22,0.95))",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: 0.6,
        }} />
      )}
      <img
        src={currentSrc}
        alt={alt || ""}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={handleError}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.6s ease",
          display: "block",
        }}
      />
    </div>
  );
}
