import { useState, useEffect } from "react";
import Logo from "@components/logo";
import LazyImg from "@components/Lazylmg";
import { HERO_PROMPTS, HIGHLIGHTS } from "../constants";
import { buildImageUrl } from "@utils/imageGen";
import { 
  Sun, Moon, Zap, Palette, Shield, Download, Infinity, Smartphone, Heart,
  Sparkles, ArrowRight, Star, CheckCircle2, Quote, BadgeCheck, Flame, Wand2, Layers, ShieldCheck, TrendingUp,
  Globe, Rocket, Award, ExternalLink, Cpu, Check
} from "lucide-react";

export default function Landing({ onLogin, onSignup, theme, toggleTheme, onPricingClick }) {
  const [scrolled, setScrolled] = useState(false);
  const [heroPrompt, setHeroPrompt] = useState("");
  const [billingCycle, setBillingCycle] = useState("monthly");

  const handleStartWithPrompt = (promptText) => {
    const p = promptText || heroPrompt;
    if (p) {
      sessionStorage.setItem("chitra_initial_prompt", p);
    }
    onSignup();
  };

  const footerLinkStyle = {
    color: "var(--text-secondary)",
    fontSize: "13px",
    cursor: "pointer",
    transition: "color 0.15s ease",
  };

  const footerHover = (e) => {
    e.currentTarget.style.color = "var(--text-primary)";
  };

  const footerLeave = (e) => {
    e.currentTarget.style.color = "var(--text-secondary)";
  };

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div className="mj-landing">
      {/* Background mosaic */}
      <div className="mj-landing-bg" aria-hidden="true">
        {HERO_PROMPTS.slice(0, 12).map((item, i) => (
          <div key={i}>
            <LazyImg
              src={item.img || buildImageUrl(item.p, item.s, 400, 400)}
              fallbackSrc={buildImageUrl(item.p, item.s, 400, 400)}
              alt=""
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        ))}
      </div>

      {/* Nav */}
      <nav className="mj-landing-nav" style={{
        background: scrolled ? "var(--nav-bg-scrolled)" : "var(--nav-bg)",
      }}>
        <Logo size="md" />
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button className="mj-nav-link" onClick={toggleTheme}>
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <span className="mj-nav-link" style={{ cursor: "pointer" }}>Explore</span>
          <span
            className="mj-nav-link"
            onClick={() => {
              const el = document.getElementById("pricing");
              if (el) el.scrollIntoView({ behavior: "smooth" });
              else onPricingClick();
            }}
            style={{ cursor: "pointer" }}
          >
            Pricing
          </span>
          <button className="mj-nav-link" onClick={onLogin}>Sign In</button>
          <button className="mj-cta-btn" onClick={onSignup} style={{ padding: "10px 24px", fontSize: 14 }}>
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="mj-landing-hero">
        <h1 className="animate-slide-up animate-delay-1">
          Explore new<br /><em>ways of creating</em>
        </h1>
        <p className="animate-slide-up animate-delay-2" style={{ maxWidth: "500px" }}>
          Turn your imagination into stunning visuals. Describe anything — we bring it to life.
        </p>

        {/* Calm & Organic Prompt Bar (Blends naturally with background) */}
        <div 
          className="animate-slide-up animate-delay-3"
          style={{
            width: "100%",
            maxWidth: "580px",
            margin: "0 auto 16px",
          }}
        >
          <div style={{
            display: "flex",
            alignItems: "center",
            background: "rgba(255, 255, 255, 0.04)",
            backdropFilter: "blur(16px)",
            border: "1px solid var(--border)",
            borderRadius: "9999px",
            padding: "6px 8px 6px 18px",
            gap: "10px",
            transition: "border-color 0.2s ease",
          }}>
            <Wand2 size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
            <input
              type="text"
              value={heroPrompt}
              onChange={(e) => setHeroPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleStartWithPrompt();
              }}
              placeholder="A serene mountain monastery at twilight..."
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "var(--text-primary)",
                fontSize: "14px",
                fontFamily: "inherit",
              }}
            />
            <button
              onClick={() => handleStartWithPrompt()}
              className="mj-cta-btn"
              style={{
                padding: "10px 22px",
                fontSize: "13px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                borderRadius: "9999px",
              }}
            >
              <span>Create</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Calm Prompt Inspiration Chips (Real Icons, No Emojis) */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "8px",
            marginTop: "14px",
          }}>
            {[
              { icon: Sparkles, text: "Enchanted misty forest" },
              { icon: Palette, text: "Classical oil portrait" },
              { icon: Flame, text: "Cyberpunk rainy alleyway" },
            ].map((pill, idx) => {
              const IconComp = pill.icon;
              return (
                <button
                  key={idx}
                  onClick={() => setHeroPrompt(pill.text)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid var(--border)",
                    borderRadius: "9999px",
                    padding: "4px 12px",
                    fontSize: "11px",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
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
                  <IconComp size={11} style={{ opacity: 0.7 }} />
                  <span>{pill.text}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Showcase grid */}
      <section className="mj-landing-showcase animate-slide-up animate-delay-4">
        <div className="mj-showcase-grid">
          {HERO_PROMPTS.slice(0, 8).map((item, i) => (
            <div key={i}>
              <LazyImg
                src={item.img || buildImageUrl(item.p, item.s, i < 2 ? 600 : 400, i < 2 ? 600 : 400)}
                fallbackSrc={buildImageUrl(item.p, item.s, 400, 400)}
                alt={item.p}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <div className="mj-feature-row animate-slide-up animate-delay-4">
        {HIGHLIGHTS.map((s, i) => (
          <div key={i} className="mj-feature-item">
            <div className="num">{s.n}</div>
            <div className="label">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Founder & Leadership Spotlight - Clean, Simple & Catchy */}
      <section style={{
        position: "relative",
        zIndex: 1,
        padding: "60px 24px 80px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }} className="animate-slide-up animate-delay-4">
        {/* Simple & Catchy Header */}
        <div style={{ textAlign: "center", marginBottom: "32px", maxWidth: "600px" }}>
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(56, 189, 248, 0.08)",
            border: "1px solid rgba(56, 189, 248, 0.2)",
            padding: "5px 14px",
            borderRadius: "9999px",
            fontSize: "12px",
            fontWeight: 600,
            color: "#38bdf8",
            marginBottom: "12px"
          }}>
            <Sparkles size={13} />
            Behind Chitra AI • Techindro
          </span>
          <h2 style={{
            fontSize: "clamp(24px, 3.5vw, 34px)",
            fontWeight: 700,
            color: "var(--text-primary)",
            margin: "0 0 8px",
            letterSpacing: "-0.5px"
          }}>
            Built for creators, by creators.
          </h2>
          <p style={{
            fontSize: "14px",
            color: "var(--text-secondary)",
            margin: 0,
            lineHeight: 1.5
          }}>
            A simple mission from Techindro: make high-quality AI art fast, free, and accessible to everyone.
          </p>
        </div>

        {/* Clean Showcase Card */}
        <div style={{
          width: "100%",
          maxWidth: "880px",
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(20, 20, 25, 0.6) 100%)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "24px",
          padding: "36px 40px",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.35)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "36px",
          alignItems: "center",
          position: "relative"
        }}>
          {/* Left: Founder Profile */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            paddingRight: "8px",
            borderRight: "1px solid rgba(255, 255, 255, 0.08)"
          }}>
            {/* Avatar */}
            <div style={{ position: "relative", marginBottom: "16px" }}>
              <img
                src="/shubham-patel.jpg"
                alt="Shubham Patel - Founder & CEO, Techindro"
                style={{
                  width: "104px",
                  height: "104px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "3px solid rgba(255, 255, 255, 0.2)",
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)",
                  display: "block"
                }}
              />
              <div style={{
                position: "absolute",
                bottom: "2px",
                right: "2px",
                background: "#0284c7",
                borderRadius: "50%",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 6px rgba(0,0,0,0.5)",
                border: "2px solid #0f172a"
              }} title="Verified Founder">
                <BadgeCheck size={16} style={{ color: "#ffffff" }} />
              </div>
            </div>

            {/* Name & Role */}
            <h3 style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "var(--text-primary)",
              margin: "0 0 4px",
              letterSpacing: "-0.3px"
            }}>
              Shubham Patel
            </h3>
            
            <div style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#38bdf8",
              marginBottom: "14px"
            }}>
              Founder &amp; CEO, Techindro
            </div>

            {/* Link to techindro.com */}
            <a
              href="https://techindro.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--text-secondary)",
                textDecoration: "none",
                padding: "6px 14px",
                borderRadius: "8px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#ffffff";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-secondary)";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              }}
            >
              <Globe size={13} />
              techindro.com
              <ExternalLink size={11} />
            </a>
          </div>

          {/* Right: Relatable Quote & Key Points */}
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {/* Simple Quote */}
            <div style={{ position: "relative" }}>
              <Quote size={24} style={{ color: "#8b5cf6", opacity: 0.6, marginBottom: "8px" }} />
              <p style={{
                fontSize: "15px",
                lineHeight: 1.65,
                color: "var(--text-primary)",
                margin: 0,
                fontWeight: 400
              }}>
                &ldquo;We got tired of expensive subscriptions, slow queues, and complicated tools just to generate good images. At <strong>Techindro</strong>, we built <strong>Chitra AI</strong> to fix that — making AI creation instant, beautiful, and completely free for everyone.&rdquo;
              </p>
            </div>

            {/* 3 Catchy Simple Highlights */}
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              paddingTop: "6px",
              borderTop: "1px solid rgba(255, 255, 255, 0.08)"
            }}>
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#10b981",
                background: "rgba(16, 185, 129, 0.08)",
                border: "1px solid rgba(16, 185, 129, 0.2)",
                padding: "4px 12px",
                borderRadius: "9999px"
              }}>
                <Zap size={13} /> Instant 2s Generation
              </span>

              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#38bdf8",
                background: "rgba(56, 189, 248, 0.08)",
                border: "1px solid rgba(56, 189, 248, 0.2)",
                padding: "4px 12px",
                borderRadius: "9999px"
              }}>
                <Palette size={13} /> Pro Art Styles
              </span>

              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#c084fc",
                background: "rgba(192, 132, 252, 0.08)",
                border: "1px solid rgba(192, 132, 252, 0.2)",
                padding: "4px 12px",
                borderRadius: "9999px"
              }}>
                <Check size={13} /> 100% Free Forever
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section (Midjourney, Ideogram & Leonardo.ai Power Suite) */}
      <section style={{
        position: "relative",
        zIndex: 1,
        padding: "80px 24px",
        background: "var(--bg-secondary)",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
      }}>
        <div style={{ maxWidth: "1140px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "52px" }}>
            <span style={{
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "2px",
              color: "#8b5cf6",
              fontWeight: 700,
              background: "rgba(139, 92, 246, 0.08)",
              padding: "4px 14px",
              borderRadius: "9999px",
              display: "inline-block",
              marginBottom: "16px"
            }}>
              Production Capabilities
            </span>
            <h2 style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(26px, 3.8vw, 38px)",
              fontWeight: 400,
              color: "var(--text-primary)",
              letterSpacing: "-0.5px"
            }}>
              Powered by Tri-Engine Generative Architecture
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", maxWidth: "600px", margin: "10px auto 0" }}>
              Synthesizing the core superpowers of the world&rsquo;s most advanced creative AI platforms into one seamless creative workflow.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "24px"
          }}>
            {/* Feature 1: Midjourney Engine */}
            <div className="mj-feature-card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <Sparkles size={24} style={{ color: "#8b5cf6" }} />
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#8b5cf6", background: "rgba(139, 92, 246, 0.1)", padding: "2px 8px", borderRadius: "4px" }}>MIDJOURNEY v6</span>
              </div>
              <h3 style={{ fontSize: "17px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "8px" }}>Stylize &amp; Variations Engine</h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>Control aesthetic intensity with granular `--stylize` sliders. Instant <strong>Vary (Subtle)</strong> and <strong>Vary (Strong)</strong> workflows with character seed consistency.</p>
            </div>

            {/* Feature 2: Ideogram Engine */}
            <div className="mj-feature-card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <Palette size={24} style={{ color: "#06b6d4" }} />
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#06b6d4", background: "rgba(6, 182, 212, 0.1)", padding: "2px 8px", borderRadius: "4px" }}>IDEOGRAM 2.0</span>
              </div>
              <h3 style={{ fontSize: "17px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "8px" }}>Typography &amp; Logo Engine</h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>Render razor-sharp text, quotes, and brand marks directly inside images. Choose from 3D Chrome, Neon Glow, or Swiss Serif styles with harmonic color palettes.</p>
            </div>

            {/* Feature 3: Leonardo.ai Engine */}
            <div className="mj-feature-card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <Zap size={24} style={{ color: "#f59e0b" }} />
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#f59e0b", background: "rgba(245, 158, 11, 0.1)", padding: "2px 8px", borderRadius: "4px" }}>LEONARDO ALCHEMY</span>
              </div>
              <h3 style={{ fontSize: "17px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "8px" }}>PhotoReal Optics &amp; Lighting Rigs</h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>One-click Alchemy PhotoReal toggle. Direct lens control across 35mm Prime, 85mm Bokeh f/1.4, Golden Hour, and dramatic Chiaroscuro studio rigs.</p>
            </div>

            {/* Feature 4: Studio 4K Upscaler */}
            <div className="mj-feature-card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <Download size={24} style={{ color: "#10b981" }} />
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#10b981", background: "rgba(16, 185, 129, 0.1)", padding: "2px 8px", borderRadius: "4px" }}>SUPER-RES</span>
              </div>
              <h3 style={{ fontSize: "17px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "8px" }}>Native 4K Canvas Upscaling</h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>Multi-pass canvas bicubic interpolation and unsharp edge convolution to export print-ready, high-resolution artwork without cloud waiting queues.</p>
            </div>

            {/* Feature 5: 1-Click Background Remover */}
            <div className="mj-feature-card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <ShieldCheck size={24} style={{ color: "#ec4899" }} />
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#ec4899", background: "rgba(236, 72, 153, 0.1)", padding: "2px 8px", borderRadius: "4px" }}>PRECISION CUT</span>
              </div>
              <h3 style={{ fontSize: "17px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "8px" }}>1-Click Background Removal</h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>Instantly isolate subjects into transparent PNG cutouts ready for graphic design, sticker production, e-commerce, and digital presentations.</p>
            </div>

            {/* Feature 6: Vision Lab & Video Studio */}
            <div className="mj-feature-card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <Infinity size={24} style={{ color: "#6366f1" }} />
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#6366f1", background: "rgba(99, 102, 241, 0.1)", padding: "2px 8px", borderRadius: "4px" }}>MULTIMODAL</span>
              </div>
              <h3 style={{ fontSize: "17px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "8px" }}>AI Vision Lab &amp; Video Studio</h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>Real-time CNN edge detection, simulated YOLO bounding boxes, and automated AI video presentations with voice synthesis in English and Hindi.</p>
            </div>
          </div>
        </div>
      </section>

      {/* On-Page Pricing Section */}
      <section id="pricing" style={{
        position: "relative",
        zIndex: 1,
        padding: "80px 24px",
        background: "var(--bg)",
        borderTop: "1px solid var(--border)",
      }}>
        <div style={{ maxWidth: "1080px", margin: "0 auto", textAlign: "center" }}>
          <span style={{
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            color: "#38bdf8",
            fontWeight: 700,
            background: "rgba(56, 189, 248, 0.08)",
            padding: "5px 16px",
            borderRadius: "9999px",
            display: "inline-block",
            marginBottom: "14px"
          }}>
            Simple, Transparent Pricing
          </span>
          <h2 style={{
            fontSize: "clamp(26px, 4vw, 38px)",
            fontWeight: 700,
            color: "var(--text-primary)",
            margin: "0 0 10px",
            letterSpacing: "-0.5px"
          }}>
            Start free, upgrade when you need.
          </h2>
          <p style={{
            fontSize: "15px",
            color: "var(--text-secondary)",
            maxWidth: "520px",
            margin: "0 auto 30px"
          }}>
            No hidden fees or surprise renewals. Transparent plans built for creators, designers, and studios.
          </p>

          {/* Billing Cycle Toggle */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "var(--bg-secondary)",
            padding: "4px",
            borderRadius: "9999px",
            border: "1px solid var(--border)",
            marginBottom: "44px"
          }}>
            <button
              onClick={() => setBillingCycle("monthly")}
              style={{
                padding: "6px 18px",
                border: "none",
                borderRadius: "9999px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                background: billingCycle === "monthly" ? "var(--surface)" : "transparent",
                color: billingCycle === "monthly" ? "var(--text-primary)" : "var(--text-muted)",
                boxShadow: billingCycle === "monthly" ? "var(--shadow-sm)" : "none",
                transition: "all 0.2s"
              }}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              style={{
                padding: "6px 18px",
                border: "none",
                borderRadius: "9999px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                position: "relative",
                background: billingCycle === "yearly" ? "var(--surface)" : "transparent",
                color: billingCycle === "yearly" ? "var(--text-primary)" : "var(--text-muted)",
                boxShadow: billingCycle === "yearly" ? "var(--shadow-sm)" : "none",
                transition: "all 0.2s"
              }}
            >
              Yearly (Save 20%)
              <span style={{
                position: "absolute",
                top: "-8px",
                right: "-6px",
                background: "#10b981",
                color: "#ffffff",
                fontSize: "9px",
                fontWeight: 700,
                padding: "2px 6px",
                borderRadius: "9999px"
              }}>
                SAVE 20%
              </span>
            </button>
          </div>

          {/* 3 Pricing Cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
            textAlign: "left"
          }}>
            {/* Plan 1: Free */}
            <div style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              borderRadius: "22px",
              padding: "32px 28px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              transition: "transform 0.2s",
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                  <h3 style={{ fontSize: "19px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Free Forever</h3>
                  <Sparkles size={20} style={{ color: "var(--text-muted)" }} />
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: "13px", lineHeight: 1.5, margin: "0 0 18px" }}>
                  Perfect for exploring AI art, personal projects and hobby creations.
                </p>
                <div style={{ marginBottom: "20px" }}>
                  <span style={{ fontSize: "32px", fontWeight: 800, color: "var(--text-primary)" }}>₹0</span>
                  <span style={{ color: "var(--text-muted)", fontSize: "14px" }}> / month</span>
                </div>
                <div style={{ height: "1px", background: "var(--border)", marginBottom: "20px" }} />
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                  {[
                    "Instant Sub-2s generation speed",
                    "50 Free creations included",
                    "Full 1024x1024 HD image exports",
                    "Access to all 10+ art styles",
                    "Free 4K Upscaler & BG Remover",
                    "Personal use license"
                  ].map((f, idx) => (
                    <li key={idx} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "var(--text-secondary)" }}>
                      <Check size={15} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={onSignup}
                style={{
                  width: "100%",
                  marginTop: "28px",
                  padding: "12px",
                  borderRadius: "12px",
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: "pointer",
                  background: "var(--bg-tertiary)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border)",
                  transition: "all 0.2s"
                }}
              >
                Start Free
              </button>
            </div>

            {/* Plan 2: Pro Creator (Highlighted) */}
            <div style={{
              background: "linear-gradient(180deg, rgba(56, 189, 248, 0.06) 0%, var(--bg-secondary) 100%)",
              border: "2px solid #38bdf8",
              borderRadius: "22px",
              padding: "32px 28px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              boxShadow: "0 12px 36px rgba(56, 189, 248, 0.15)",
              transform: "translateY(-6px)"
            }}>
              <span style={{
                position: "absolute",
                top: "-12px",
                left: "24px",
                background: "#38bdf8",
                color: "#0f172a",
                fontSize: "11px",
                fontWeight: 800,
                textTransform: "uppercase",
                padding: "3px 12px",
                borderRadius: "9999px",
                letterSpacing: "0.5px"
              }}>
                Most Popular
              </span>
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                  <h3 style={{ fontSize: "19px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Pro Creator</h3>
                  <Zap size={20} style={{ color: "#38bdf8" }} />
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: "13px", lineHeight: 1.5, margin: "0 0 18px" }}>
                  For designers, active creators & power users needing unlimited speed.
                </p>
                <div style={{ marginBottom: "20px" }}>
                  <span style={{ fontSize: "32px", fontWeight: 800, color: "var(--text-primary)" }}>
                    {billingCycle === "yearly" ? "₹159" : "₹199"}
                  </span>
                  <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                    / month {billingCycle === "yearly" ? "(billed yearly)" : ""}
                  </span>
                </div>
                <div style={{ height: "1px", background: "var(--border)", marginBottom: "20px" }} />
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                  {[
                    "Unlimited fast image generations",
                    "Ideogram 2.0 3D Typography & text",
                    "Leonardo studio lens & lighting rigs",
                    "Priority GPU queue (zero wait)",
                    "Commercial rights & no watermark",
                    "Parallel batch generations (4 at once)"
                  ].map((f, idx) => (
                    <li key={idx} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "var(--text-primary)" }}>
                      <Check size={15} style={{ color: "#38bdf8", flexShrink: 0 }} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={onPricingClick}
                style={{
                  width: "100%",
                  marginTop: "28px",
                  padding: "12px",
                  borderRadius: "12px",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: "pointer",
                  background: "#38bdf8",
                  color: "#0f172a",
                  border: "none",
                  boxShadow: "0 4px 14px rgba(56, 189, 248, 0.4)",
                  transition: "all 0.2s"
                }}
              >
                Upgrade to Pro
              </button>
            </div>

            {/* Plan 3: Studio Max */}
            <div style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              borderRadius: "22px",
              padding: "32px 28px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                  <h3 style={{ fontSize: "19px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Studio Max</h3>
                  <Flame size={20} style={{ color: "#c084fc" }} />
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: "13px", lineHeight: 1.5, margin: "0 0 18px" }}>
                  For agencies, production teams & commercial brands needing full scale.
                </p>
                <div style={{ marginBottom: "20px" }}>
                  <span style={{ fontSize: "32px", fontWeight: 800, color: "var(--text-primary)" }}>
                    {billingCycle === "yearly" ? "₹399" : "₹499"}
                  </span>
                  <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                    / month {billingCycle === "yearly" ? "(billed yearly)" : ""}
                  </span>
                </div>
                <div style={{ height: "1px", background: "var(--border)", marginBottom: "20px" }} />
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                  {[
                    "Everything in Pro included",
                    "AI Video Studio & Speech Synthesis",
                    "Runway portrait identity engine",
                    "Ultra-HD 4K canvas exports",
                    "Max concurrency priority pipeline",
                    "24/7 Dedicated VIP creator support"
                  ].map((f, idx) => (
                    <li key={idx} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "var(--text-secondary)" }}>
                      <Check size={15} style={{ color: "#c084fc", flexShrink: 0 }} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={onPricingClick}
                style={{
                  width: "100%",
                  marginTop: "28px",
                  padding: "12px",
                  borderRadius: "12px",
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: "pointer",
                  background: "rgba(192, 132, 252, 0.15)",
                  color: "#c084fc",
                  border: "1px solid rgba(192, 132, 252, 0.3)",
                  transition: "all 0.2s"
                }}
              >
                Upgrade to Studio
              </button>
            </div>
          </div>

          {/* Payment Trust Strip */}
          <div style={{
            marginTop: "40px",
            paddingTop: "24px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "20px",
            fontSize: "12px",
            color: "var(--text-muted)"
          }}>
            <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Accepted Payments:</span>
            <span>UPI • Google Pay • PhonePe • Paytm • Credit &amp; Debit Cards • NetBanking</span>
            <span>•</span>
            <span>🔒 256-Bit SSL Encrypted • 7-Day Money Back Guarantee</span>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{
        position: "relative", zIndex: 1, textAlign: "center",
        padding: "80px 24px",
      }}>
        <h2 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(28px, 4vw, 48px)",
          fontWeight: 400,
          marginBottom: 16,
          letterSpacing: -1,
        }}>
          Ready to create?
        </h2>
        <p style={{ color: "var(--text-muted)", marginBottom: 28, fontSize: 16 }}>
          Free, unlimited, no credit card required.
        </p>
        <button className="mj-cta-btn" onClick={onSignup}>Get Started Free</button>
      </section>

      {/* Footer */}
      <footer className="mj-landing-footer" style={{
        display: "block",
        borderTop: "1px solid var(--border)",
        background: "var(--bg)",
        padding: "80px 4% 40px",
        position: "relative",
        zIndex: 1,
      }}>
        <div style={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "48px",
          marginBottom: "60px",
        }}>
          {/* Logo & Tagline Column */}
          <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: "16px", minWidth: "250px" }}>
            <Logo size="md" />
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: 1.6, maxWidth: "320px" }}>
              India's premier AI art engine. Turn text prompts into Ghibli, Anime, and hyper-realistic art in seconds.
            </p>
            <div style={{ display: "flex", gap: "16px", marginTop: "8px" }}>
              {["Discord", "Twitter", "Instagram", "GitHub"].map((s) => (
                <span key={s} style={{ color: "var(--text-muted)", fontSize: "12px", cursor: "pointer", transition: "color 0.2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-primary)"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Column 1: Product */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", textAlign: "left" }}>
            <h4 style={{ color: "var(--text-primary)", fontSize: "14px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>Product</h4>
            <span
              onClick={() => {
                const el = document.getElementById("pricing");
                if (el) el.scrollIntoView({ behavior: "smooth" });
                else onPricingClick();
              }}
              style={footerLinkStyle}
              onMouseEnter={footerHover}
              onMouseLeave={footerLeave}
            >
              Pricing
            </span>
            <span style={footerLinkStyle} onMouseEnter={footerHover} onMouseLeave={footerLeave}>Art Styles</span>
            <span style={footerLinkStyle} onMouseEnter={footerHover} onMouseLeave={footerLeave}>Explore Feed</span>
            <span style={footerLinkStyle} onMouseEnter={footerHover} onMouseLeave={footerLeave}>Release Notes</span>
          </div>

          {/* Column 2: Resources */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", textAlign: "left" }}>
            <h4 style={{ color: "var(--text-primary)", fontSize: "14px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>Resources</h4>
            <span style={footerLinkStyle} onMouseEnter={footerHover} onMouseLeave={footerLeave}>API Beta Access</span>
            <span style={footerLinkStyle} onMouseEnter={footerHover} onMouseLeave={footerLeave}>Help Center</span>
            <span style={footerLinkStyle} onMouseEnter={footerHover} onMouseLeave={footerLeave}>Status Page</span>
            <span style={footerLinkStyle} onMouseEnter={footerHover} onMouseLeave={footerLeave}>Guidelines</span>
          </div>

          {/* Column 3: Legal */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", textAlign: "left" }}>
            <h4 style={{ color: "var(--text-primary)", fontSize: "14px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>Legal</h4>
            <span style={footerLinkStyle} onMouseEnter={footerHover} onMouseLeave={footerLeave}>Privacy Policy</span>
            <span style={footerLinkStyle} onMouseEnter={footerHover} onMouseLeave={footerLeave}>Terms of Service</span>
            <span style={footerLinkStyle} onMouseEnter={footerHover} onMouseLeave={footerLeave}>DMCA / Copyright</span>
            <span style={footerLinkStyle} onMouseEnter={footerHover} onMouseLeave={footerLeave}>Security Policy</span>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          width: "100%",
          borderTop: "1px solid var(--border)",
          paddingTop: "32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}>
          <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
            &copy; {new Date().getFullYear()} Chitra AI. All rights reserved.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <span style={{ color: "var(--text-muted)", fontSize: "13px", display: "flex", alignItems: "center", gap: "4px" }}>
              Designed & Developed with <Heart size={12} fill="#ef4444" style={{ color: "#ef4444", display: "inline-block", margin: "0 2px", verticalAlign: "middle" }} /> in India
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
