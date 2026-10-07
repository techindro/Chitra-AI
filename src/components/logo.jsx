export default function ChitraLogo({ size = "md", showMark = true, className }) {
  const sizes = {
    sm: { mark: 24, text: "15px" },
    md: { mark: 30, text: "18px" },
    lg: { mark: 40, text: "24px" },
    xl: { mark: 52, text: "32px" },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "10px",
        userSelect: "none",
      }}
    >
      {showMark && (
        <svg width={s.mark} height={s.mark} viewBox="0 0 32 32" fill="none">
          <path
            d="M6 26V6h4l10 12L30 6h-4L16 20 10 6H6z"
            fill="var(--text-primary)"
            opacity="0.9"
          />
        </svg>
      )}
      <span style={{
        fontFamily: "var(--font-display)",
        fontWeight: 400,
        fontSize: s.text,
        color: "var(--text-primary)",
        lineHeight: 1,
        letterSpacing: "-0.3px",
      }}>
        Chitra AI
      </span>
    </div>
  );
}
