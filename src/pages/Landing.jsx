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
          <span className="mj-nav-link" onClick={onPricingClick} style={{ cursor: "pointer" }}>Pricing</span>
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

      {/* Executive Spotlight & Leadership Endorsement */}
      <section style={{
        position: "relative",
        zIndex: 1,
        padding: "70px 24px 90px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }} className="animate-slide-up animate-delay-4">
        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: "36px", maxWidth: "720px" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(56, 189, 248, 0.15))",
            border: "1px solid rgba(139, 92, 246, 0.35)",
            padding: "6px 18px",
            borderRadius: "9999px",
            fontSize: "12px",
            fontWeight: 700,
            color: "#c084fc",
            letterSpacing: "1.2px",
            textTransform: "uppercase",
            marginBottom: "16px",
            boxShadow: "0 4px 20px rgba(139, 92, 246, 0.2)"
          }}>
            <Sparkles size={14} style={{ color: "#38bdf8" }} />
            Executive Leadership &amp; Vision • Techindro
          </div>
          <h2 style={{
            fontSize: "clamp(26px, 4vw, 38px)",
            fontWeight: 800,
            lineHeight: 1.25,
            color: "var(--text-primary)",
            margin: "0 0 12px",
            letterSpacing: "-0.8px"
          }}>
            Architecting India's Premier <span style={{
              background: "linear-gradient(135deg, #a78bfa 0%, #38bdf8 50%, #f472b6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>Sovereign AI Engine</span>
          </h2>
          <p style={{
            fontSize: "15px",
            color: "var(--text-secondary)",
            lineHeight: 1.6,
            margin: 0
          }}>
            Under the visionary leadership of <strong>Shubham Patel</strong>, Techindro is transforming high-fidelity Generative AI into an instantaneous, accessible reality for creators, builders, and global enterprises.
          </p>
        </div>

        {/* Master Glassmorphic Executive Card */}
        <div style={{
          width: "100%",
          maxWidth: "1040px",
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(18, 18, 30, 0.75) 50%, rgba(10, 10, 20, 0.9) 100%)",
          backdropFilter: "blur(30px)",
          WebkitBackdropFilter: "blur(30px)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "32px",
          padding: "48px",
          boxShadow: "0 35px 90px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "44px",
          alignItems: "center",
          position: "relative",
          overflow: "hidden"
        }}>
          {/* Ambient Laser Beam Accents */}
          <div style={{
            position: "absolute",
            top: 0,
            left: "15%",
            right: "15%",
            height: "2px",
            background: "linear-gradient(90deg, transparent, #8b5cf6, #38bdf8, transparent)",
            boxShadow: "0 0 12px rgba(56, 189, 248, 0.8)"
          }} />
          <div style={{
            position: "absolute",
            bottom: 0,
            left: "25%",
            right: "25%",
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.4), transparent)"
          }} />

          {/* Left Column: Founder Profile & Credentials */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            paddingRight: "10px",
            borderRight: "1px solid rgba(255, 255, 255, 0.08)",
            position: "relative"
          }}>
            {/* Founder Avatar with Multi-layer Glow & Active Beacon */}
            <div style={{ position: "relative", marginBottom: "22px" }}>
              <div style={{
                position: "absolute",
                inset: "-8px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(139, 92, 246, 0.7), rgba(56, 189, 248, 0.7), rgba(244, 114, 182, 0.6))",
                opacity: 0.85,
                filter: "blur(12px)",
                animation: "pulse 3s infinite ease-in-out"
              }} />
              <img
                src="/shubham-patel.jpg"
                alt="Shubham Patel - Founder & CEO, Techindro"
                style={{
                  position: "relative",
                  width: "128px",
                  height: "128px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "3px solid rgba(255, 255, 255, 0.4)",
                  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.7)",
                  display: "block"
                }}
              />
              {/* Verified Badge */}
              <div style={{
                position: "absolute",
                bottom: "4px",
                right: "4px",
                background: "linear-gradient(135deg, #0284c7, #2563eb)",
                borderRadius: "50%",
                padding: "5px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.6)",
                border: "2px solid #0f172a"
              }} title="Verified Founder & CEO">
                <BadgeCheck size={18} style={{ color: "#ffffff" }} />
              </div>
            </div>

            {/* Founder Identity */}
            <h3 style={{
              fontSize: "24px",
              fontWeight: 800,
              color: "var(--text-primary)",
              margin: "0 0 6px",
              letterSpacing: "-0.5px"
            }}>
              Shubham Patel
            </h3>
            
            {/* Official Title Pill */}
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
              fontWeight: 700,
              padding: "5px 16px",
              borderRadius: "9999px",
              background: "rgba(139, 92, 246, 0.12)",
              border: "1px solid rgba(139, 92, 246, 0.3)",
              color: "#c084fc",
              margin: "0 0 16px"
            }}>
              <span>Founder &amp; CEO</span>
              <span style={{ opacity: 0.4 }}>•</span>
              <span style={{ color: "#38bdf8", fontWeight: 800 }}>Techindro</span>
            </div>

            {/* Credential Tags */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "center", width: "100%" }}>
              <span style={{
                fontSize: "12px",
                color: "var(--text-secondary)",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid var(--border)",
                padding: "6px 14px",
                borderRadius: "9999px",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                maxWidth: "280px"
              }}>
                <Cpu size={14} style={{ color: "#10b981" }} />
                AI Systems Architect &amp; Visionary
              </span>

              <span style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                background: "rgba(56, 189, 248, 0.05)",
                border: "1px solid rgba(56, 189, 248, 0.2)",
                padding: "4px 12px",
                borderRadius: "9999px",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: "6px"
              }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981" }} />
                Live: Engineering Techindro AI Stack
              </span>
            </div>

            {/* Techindro Ecosystem Link */}
            <div style={{ marginTop: "20px" }}>
              <a
                href="https://techindro.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#38bdf8",
                  textDecoration: "none",
                  padding: "6px 16px",
                  borderRadius: "8px",
                  background: "rgba(56, 189, 248, 0.08)",
                  border: "1px solid rgba(56, 189, 248, 0.25)",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(56, 189, 248, 0.18)";
                  e.currentTarget.style.borderColor = "rgba(56, 189, 248, 0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(56, 189, 248, 0.08)";
                  e.currentTarget.style.borderColor = "rgba(56, 189, 248, 0.25)";
                }}
              >
                <Globe size={13} />
                techindro.com
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* Right Column: In-Depth Perspective, Keynote & Core Pillars */}
          <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "rgba(139, 92, 246, 0.15)",
                  border: "1px solid rgba(139, 92, 246, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <Quote size={20} style={{ color: "#a78bfa" }} />
                </div>
                <div>
                  <div style={{
                    fontSize: "12px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "1.4px",
                    color: "#a78bfa"
                  }}>
                    Founder Keynote &amp; Manifesto
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    Shubham Patel • Founder &amp; CEO
                  </div>
                </div>
              </div>
              <span style={{
                fontSize: "11px",
                color: "#38bdf8",
                background: "rgba(56, 189, 248, 0.08)",
                border: "1px solid rgba(56, 189, 248, 0.25)",
                padding: "4px 10px",
                borderRadius: "8px",
                fontWeight: 600
              }}>
                Techindro Labs
              </span>
            </div>

            {/* Quotation text */}
            <p style={{
              fontSize: "15px",
              lineHeight: 1.8,
              color: "var(--text-primary)",
              margin: 0,
              fontWeight: 400,
              letterSpacing: "-0.2px"
            }}>
              &ldquo;Generative AI must never be gated behind exorbitant paywalls, sluggish queues, or restrictive compute quotas. At <strong>Techindro</strong>, our foundational conviction is engineering sovereign, world-class compute velocity that places studio-tier creative synthesis directly into the hands of 1 Billion creators, developers, and global innovators. <strong>Chitra AI</strong> represents our pursuit of uncompromising excellence — uniting the poetic aesthetic fidelity of Midjourney, the razor-sharp typographic precision of Ideogram, and true photorealism into an instantaneous, accessible canvas.&rdquo;
            </p>

            {/* 4 Architectural Milestone Tiles */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "12px",
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              paddingTop: "20px"
            }}>
              <div style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.07)",
                borderRadius: "14px",
                padding: "12px 14px",
                display: "flex",
                flexDirection: "column",
                gap: "4px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#10b981", fontSize: "13px", fontWeight: 700 }}>
                  <Zap size={14} /> Sub-2s Synthesis
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                  Zero-latency parallel turbo dispatch with no queue bottlenecks.
                </div>
              </div>

              <div style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.07)",
                borderRadius: "14px",
                padding: "12px 14px",
                display: "flex",
                flexDirection: "column",
                gap: "4px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#38bdf8", fontSize: "13px", fontWeight: 700 }}>
                  <Sparkles size={14} /> Tri-Engine Fidelity
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                  Seamless synthesis across Midjourney, Ideogram &amp; Leonardo styles.
                </div>
              </div>

              <div style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.07)",
                borderRadius: "14px",
                padding: "12px 14px",
                display: "flex",
                flexDirection: "column",
                gap: "4px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#c084fc", fontSize: "13px", fontWeight: 700 }}>
                  <Rocket size={14} /> Sovereign Compute
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                  Independent high-speed pipeline engineered natively by Techindro.
                </div>
              </div>

              <div style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.07)",
                borderRadius: "14px",
                padding: "12px 14px",
                display: "flex",
                flexDirection: "column",
                gap: "4px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#f59e0b", fontSize: "13px", fontWeight: 700 }}>
                  <ShieldCheck size={14} /> Enterprise Privacy
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                  Confidential AI pipeline with zero training on your proprietary prompts.
                </div>
              </div>
            </div>

            {/* Bottom Executive Verification Seal */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "10px",
              paddingTop: "6px"
            }}>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "11px",
                color: "var(--text-muted)"
              }}>
                <Award size={14} style={{ color: "#a78bfa" }} />
                <span>Endorsed by Techindro Executive Leadership</span>
              </div>
              <div style={{
                fontSize: "11px",
                color: "var(--text-secondary)",
                letterSpacing: "0.5px",
                fontWeight: 600
              }}>
                Built with ❤️ for Global Creators • <span style={{ color: "#38bdf8" }}>techindro.com</span>
              </div>
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
            <span onClick={onPricingClick} style={footerLinkStyle} onMouseEnter={footerHover} onMouseLeave={footerLeave}>Pricing</span>
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
