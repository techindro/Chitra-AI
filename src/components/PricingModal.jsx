import { useState } from "react";
import { Sparkles, Check, X, Shield, Zap, Flame } from "lucide-react";

export default function PricingModal({ isOpen, onClose, currentTier, onSubscribe }) {
  const [billingCycle, setBillingCycle] = useState("monthly"); // "monthly" | "yearly"
  const [currency, setCurrency] = useState("INR"); // "INR" | "USD"
  const [hoveredCard, setHoveredCard] = useState(null);

  if (!isOpen) return null;

  const handleSubscribe = (tierName) => {
    onSubscribe(tierName);
    onClose();
  };

  const exchangeRate = 83; // For USD conversions if requested

  const plans = [
    {
      name: "Free",
      icon: <Sparkles size={20} className="plan-icon" style={{ color: "var(--text-muted)" }} />,
      desc: "Everything you need to create amazing AI artwork daily.",
      price: { monthly: 0, yearly: 0 },
      engine: "Chitra Turbo AI (Instant)",
      features: [
        "Instant Sub-2s generation speed",
        "50 Free creations included",
        "Full 1024x1024 HD image exports",
        "All 10+ art styles (Ghibli, Anime, 3D, Real)",
        "Free 4K Upscaler & BG Cutout tools",
        "Personal use license",
      ],
      cta: "Current Plan",
      disabled: currentTier === "Free",
      color: "var(--text-muted)",
      badge: "Free Forever"
    },
    {
      name: "Pro",
      icon: <Zap size={20} className="plan-icon" style={{ color: "#38bdf8" }} />,
      desc: "For digital creators, designers & power users.",
      price: { monthly: 199, yearly: 1899 },
      engine: "Ideogram v4 & Leonardo Optics",
      features: [
        "Unlimited fast image generations",
        "Ideogram 2.0 3D Typography & Logos",
        "Studio lighting & camera lens rigs",
        "Priority GPU queue — zero waiting",
        "Commercial license & watermark-free",
        "Parallel batch generations (4 at once)",
      ],
      cta: "Upgrade to Pro",
      disabled: currentTier === "Pro",
      color: "#38bdf8",
      badge: "Most Popular"
    },
    {
      name: "Studio",
      icon: <Flame size={20} className="plan-icon" style={{ color: "#c084fc" }} />,
      desc: "For creative agencies, studios & commercial brands.",
      price: { monthly: 499, yearly: 4799 },
      engine: "Full Studio Stack + Runway Engine",
      features: [
        "Everything in Pro included",
        "AI Video Studio & Speech Synthesis",
        "Runway portrait identity preservation",
        "Ultra-HD 4K canvas exports",
        "Max concurrency priority pipeline",
        "24/7 Dedicated VIP creator support",
      ],
      cta: "Upgrade to Studio",
      disabled: currentTier === "Studio",
      color: "#c084fc",
      badge: "Ultimate Power"
    }
  ];

  const formatPrice = (value) => {
    if (value === 0) return "Free";
    if (currency === "INR") {
      return `₹${value}`;
    } else {
      return `$${(value / exchangeRate).toFixed(2)}`;
    }
  };

  const getMonthlyRate = (value) => {
    if (value === 0) return "";
    const monthlyRate = billingCycle === "yearly" ? Math.floor(value / 12) : value;
    return `${formatPrice(monthlyRate)} / month`;
  };

  // Styled objects to match the application's clean design system
  const overlayStyle = {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(0,0,0,0.72)",
    backdropFilter: "blur(10px)",
    animation: "fadeIn 0.2s ease",
    padding: "16px",
    overflowY: "auto",
  };

  const modalStyle = {
    width: "min(1100px, 96vw)",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "20px",
    padding: "24px 24px 18px",
    position: "relative",
    boxShadow: "var(--shadow-xl)",
    animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
    maxHeight: "94vh",
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
  };

  return (
    <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={modalStyle}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            color: "var(--text-muted)",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
            zIndex: 10,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--text-primary)";
            e.currentTarget.style.borderColor = "var(--border-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-muted)";
            e.currentTarget.style.borderColor = "var(--border)";
          }}
        >
          <X size={16} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: "center", marginBottom: "14px", flexShrink: 0 }}>
          <span style={{
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            color: "#8b5cf6",
            fontWeight: 700,
            background: "rgba(139, 92, 246, 0.1)",
            padding: "3px 10px",
            borderRadius: "9999px",
            display: "inline-block",
          }}>
            Pricing Plans
          </span>
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(20px, 2.8vw, 28px)",
            fontWeight: 400,
            color: "var(--text-primary)",
            marginTop: "6px",
            marginBottom: "4px",
            lineHeight: 1.2,
          }}>
            Choose your creative power
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "13px", maxWidth: "560px", margin: "0 auto", lineHeight: 1.4 }}>
            Unlock ultra-high quality generations powered by <strong>Ideogram v4</strong> & <strong>Turbo AI</strong>.
          </p>
        </div>

        {/* Billing and Currency Toggles */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "14px",
          marginBottom: "16px",
          flexWrap: "wrap",
          flexShrink: 0,
        }}>
          {/* Billing Cycle Toggle */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            background: "var(--bg-secondary)",
            padding: "3px",
            borderRadius: "9999px",
            border: "1px solid var(--border)",
          }}>
            <button
              onClick={() => setBillingCycle("monthly")}
              style={{
                padding: "5px 14px",
                border: "none",
                borderRadius: "9999px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                background: billingCycle === "monthly" ? "var(--surface)" : "transparent",
                color: billingCycle === "monthly" ? "var(--text-primary)" : "var(--text-muted)",
                boxShadow: billingCycle === "monthly" ? "var(--shadow-sm)" : "none",
                transition: "all 0.2s",
              }}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              style={{
                padding: "5px 14px",
                border: "none",
                borderRadius: "9999px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                position: "relative",
                background: billingCycle === "yearly" ? "var(--surface)" : "transparent",
                color: billingCycle === "yearly" ? "var(--text-primary)" : "var(--text-muted)",
                boxShadow: billingCycle === "yearly" ? "var(--shadow-sm)" : "none",
                transition: "all 0.2s",
              }}
            >
              Yearly
              <span style={{
                position: "absolute",
                top: "-8px",
                right: "-6px",
                background: "linear-gradient(90deg, #10b981, #059669)",
                color: "white",
                fontSize: "9px",
                fontWeight: 700,
                padding: "1px 5px",
                borderRadius: "9999px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              }}>
                -20%
              </span>
            </button>
          </div>

          {/* Currency Toggle */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            background: "var(--bg-secondary)",
            padding: "3px",
            borderRadius: "9999px",
            border: "1px solid var(--border)",
          }}>
            <button
              onClick={() => setCurrency("INR")}
              style={{
                padding: "5px 10px",
                border: "none",
                borderRadius: "9999px",
                fontSize: "11px",
                fontWeight: 600,
                cursor: "pointer",
                background: currency === "INR" ? "var(--surface)" : "transparent",
                color: currency === "INR" ? "var(--text-primary)" : "var(--text-muted)",
                transition: "all 0.2s",
              }}
            >
              INR (₹)
            </button>
            <button
              onClick={() => setCurrency("USD")}
              style={{
                padding: "5px 10px",
                border: "none",
                borderRadius: "9999px",
                fontSize: "11px",
                fontWeight: 600,
                cursor: "pointer",
                background: currency === "USD" ? "var(--surface)" : "transparent",
                color: currency === "USD" ? "var(--text-primary)" : "var(--text-muted)",
                transition: "all 0.2s",
              }}
            >
              USD ($)
            </button>
          </div>
        </div>

        {/* Plan Cards Container */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "14px",
          alignItems: "stretch",
        }}>
          {plans.map((plan) => {
            const isHovered = hoveredCard === plan.name;
            const isCurrent = currentTier === plan.name;

            return (
              <div
                key={plan.name}
                onMouseEnter={() => setHoveredCard(plan.name)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  background: "var(--bg-secondary)",
                  border: isHovered
                    ? `1px solid ${plan.color || "var(--border-hover)"}`
                    : isCurrent
                      ? "1px solid var(--text-primary)"
                      : "1px solid var(--border)",
                  borderRadius: "16px",
                  padding: "16px 16px 14px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "all 0.2s ease-in-out",
                  transform: isHovered ? "translateY(-3px)" : "translateY(0)",
                  position: "relative",
                  boxShadow: isHovered ? "var(--shadow-md)" : "none",
                }}
              >
                {/* Plan Badge */}
                {plan.badge && (
                  <span style={{
                    position: "absolute",
                    top: "-9px",
                    left: "14px",
                    background: plan.color,
                    color: "white",
                    fontSize: "9px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    padding: "2px 8px",
                    borderRadius: "9999px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                    letterSpacing: "0.5px",
                  }}>
                    {plan.badge}
                  </span>
                )}

                {/* Top Section */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px", marginTop: "2px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>{plan.name}</h3>
                    {plan.icon}
                  </div>
                  
                  <p style={{ color: "var(--text-secondary)", fontSize: "11px", marginBottom: "10px", lineHeight: 1.35, minHeight: "28px" }}>
                    {plan.desc}
                  </p>

                  <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "2px" }}>
                    <span style={{
                      fontSize: "24px",
                      fontWeight: 700,
                      fontFamily: "var(--font-display)",
                      color: "var(--text-primary)"
                    }}>
                      {billingCycle === "yearly" && plan.price.yearly !== 0
                        ? formatPrice(plan.price.yearly)
                        : formatPrice(plan.price.monthly)
                      }
                    </span>
                    <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                      {plan.price.monthly === 0 ? "" : billingCycle === "yearly" ? "/ yr" : "/ mo"}
                    </span>
                  </div>

                  {/* Monthly equivalence text for Yearly plans */}
                  {billingCycle === "yearly" && plan.price.yearly !== 0 ? (
                    <div style={{ color: "#10b981", fontSize: "10px", fontWeight: 600, marginBottom: "8px" }}>
                      ≈ {getMonthlyRate(plan.price.yearly)}
                    </div>
                  ) : (
                    <div style={{ height: "6px", marginBottom: "8px" }} />
                  )}

                  {/* Model Engine Tag */}
                  <div style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    color: plan.price.monthly === 0 ? "var(--text-muted)" : plan.color,
                    background: plan.price.monthly === 0 ? "rgba(255,255,255,0.03)" : `rgba(255, 255, 255, 0.05)`,
                    border: `1px solid ${plan.price.monthly === 0 ? "var(--border)" : "rgba(255,255,255,0.08)"}`,
                    padding: "3px 7px",
                    borderRadius: "6px",
                    display: "inline-block",
                    marginBottom: "10px",
                  }}>
                    Engine: {plan.engine}
                  </div>

                  {/* Divider */}
                  <div style={{ height: "1px", background: "var(--border)", marginBottom: "10px" }} />

                  {/* Features List */}
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
                    {plan.features.map((feature, idx) => (
                      <li key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "6px", fontSize: "11px", color: "var(--text-secondary)", lineHeight: 1.35 }}>
                        <Check size={13} style={{ color: plan.price.monthly === 0 ? "var(--text-muted)" : "#10b981", marginTop: "1px", flexShrink: 0 }} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => !plan.disabled && handleSubscribe(plan.name)}
                  disabled={plan.disabled}
                  style={{
                    width: "100%",
                    marginTop: "14px",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: "12px",
                    cursor: plan.disabled ? "default" : "pointer",
                    background: isCurrent
                      ? "rgba(255,255,255,0.05)"
                      : plan.price.monthly === 0
                        ? "var(--bg-tertiary)"
                        : plan.color,
                    color: isCurrent
                      ? "var(--text-muted)"
                      : plan.price.monthly === 0
                        ? "var(--text-primary)"
                        : "#0f172a",
                    border: isCurrent ? "1px solid var(--border)" : "1px solid transparent",
                    transition: "opacity 0.2s, transform 0.1s",
                  }}
                  onMouseEnter={(e) => {
                    if (!plan.disabled) e.currentTarget.style.opacity = 0.9;
                  }}
                  onMouseLeave={(e) => {
                    if (!plan.disabled) e.currentTarget.style.opacity = 1;
                  }}
                >
                  {isCurrent ? "Current Plan" : plan.cta}
                </button>
              </div>
            );
          })}
        </div>

        {/* Note / Payment Trust Badges */}
        <div style={{
          textAlign: "center",
          marginTop: "14px",
          color: "var(--text-muted)",
          fontSize: "11px",
          borderTop: "1px solid var(--border)",
          paddingTop: "10px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          alignItems: "center",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
            <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Supported Payments:</span>
            <span>UPI • Google Pay • PhonePe • Paytm • Cards • NetBanking</span>
          </div>
          <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>
            🔒 256-Bit SSL Encrypted • Cancel Anytime • 7-Day Money Back Guarantee • Taxes included
          </div>
        </div>
      </div>
    </div>
  );
}
