import { useState, useEffect } from "react";
import Landing from "@pages/Landing";
import Dashboard from "@pages/Dashboard";
import AuthModal from "@components/Authmodal";
import PricingModal from "@components/PricingModal";
import "./index.css";

// Use environment variable for the token
const HF_TOKEN = import.meta.env.VITE_HF_TOKEN || "";
const IDEOGRAM_API_KEY = import.meta.env.VITE_IDEOGRAM_API_KEY || "";

export default function App() {
  const [page, setPage] = useState("landing");
  const [authModal, setAuthModal] = useState(null);
  const [user, setUser] = useState(null);
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState(() => {
    return localStorage.getItem("chitra_subscription") || localStorage.getItem("khicho_subscription") || "Free";
  });

  const handleSubscribe = (tier) => {
    setSubscriptionTier(tier);
    localStorage.setItem("chitra_subscription", tier);
  };

  // Theme management
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("chitra_theme") || localStorage.getItem("khicho_theme") || "dark";
  });
  
  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
    localStorage.setItem("chitra_theme", theme);
  }, [theme]);


  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setAuthModal(null);
    setPage("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setPage("landing");
  };

  return (
    <>
      {page === "landing" && (
        <Landing
          onLogin={() => setAuthModal("login")}
          onSignup={() => setAuthModal("signup")}
          onPricingClick={() => setPricingModalOpen(true)}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      )}
      {page === "dashboard" && user && (
        <Dashboard
          user={user}
          hfToken={HF_TOKEN}
          ideogramApiKey={IDEOGRAM_API_KEY}
          currentTier={subscriptionTier}
          onPricingClick={() => setPricingModalOpen(true)}
          onLogout={handleLogout}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      )}
      {authModal && (
        <AuthModal
          mode={authModal}
          onClose={() => setAuthModal(null)}
          onSuccess={handleAuthSuccess}
        />
      )}
      <PricingModal
        isOpen={pricingModalOpen}
        onClose={() => setPricingModalOpen(false)}
        currentTier={subscriptionTier}
        onSubscribe={handleSubscribe}
      />
    </>
  );
}
