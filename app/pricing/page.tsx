"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Sidebar from "../components/Sidebar";

const supabaseUrl = "https://yllquiyrnhicvnrhihfk.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsbHF1aXlybmhpY3ZucmhpaGZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MzAxNzAsImV4cCI6MjA5MjUwNjE3MH0.bJI1KBep_S62_cDlST7R7luBU1TirciERIqLBfHLnGk";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const darkTheme = {
  bg: "#0B0F14", bg2: "#0F172A", bg3: "#111827", border: "#1F2937", border2: "#374151",
  accent: "#00FFA3", accentLight: "#33FFD1", accentDim: "#00C97F", secondary: "#3B82F6",
  text: "#E5E7EB", textSub: "#9CA3AF", textMuted: "#6B7280", cardBg: "#1E293BCC",
};

const lightTheme = {
  bg: "#F0FDF4", bg2: "#FFFFFF", bg3: "#F8FAFC", border: "#D1D5DB", border2: "#9CA3AF",
  accent: "#059669", accentLight: "#10B981", accentDim: "#047857", secondary: "#2563EB",
  text: "#1F2937", textSub: "#4B5563", textMuted: "#6B7280", cardBg: "#FFFFFFCC",
};

function useWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1280);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return w;
}

interface Plan {
  name: string;
  price: string;
  period: string;
  features: string[];
  popular?: boolean;
  color?: string;
}

const plans: Plan[] = [
  { name: "Free", price: "0", period: "forever", features: ["200 messages", "1 AI Agent", "5MB storage", "Basic AI", "Email support"], color: "gray" },
  { name: "Premium", price: "15,000", period: "/month", features: ["2,000 messages", "3 AI Agents", "50MB storage", "Voice support", "Chat support", "MTN MoMo", "Orange Money"], popular: true, color: "green" },
  { name: "Gold", price: "45,000", period: "/month", features: ["Unlimited messages", "10 AI Agents", "500MB storage", "Analytics dashboard", "Priority support", "Appointment booking", "MTN MoMo", "Orange Money"], color: "yellow" },
  { name: "Platinum", price: "Custom", period: "", features: ["Unlimited everything", "White-label branding", "Custom AI model", "Dedicated support", "SLA guarantee", "MTN MoMo", "Orange Money", "All Payment Methods"], color: "purple" }
];

export default function PricingPage() {
  const width = useWidth();
  const isMobile = width < 1024;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [currentTier, setCurrentTier] = useState("free");
  const [billingInterval, setBillingInterval] = useState("monthly");

  const theme = isDark ? darkTheme : lightTheme;

  useEffect(() => {
    const savedTheme = localStorage.getItem("xbase_theme");
    if (savedTheme === "light") setIsDark(false);
  }, []);

  useEffect(() => { localStorage.setItem("xbase_theme", isDark ? "dark" : "light"); }, [isDark]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }
      setUser(user);
      const { data } = await supabase.from("subscriptions").select("tier").eq("user_id", user.id).single();
      if (data) setCurrentTier(data.tier);
      setLoading(false);
    };
    checkUser();
  }, []);

  const handleLogout = async () => { await supabase.auth.signOut(); window.location.href = "/login"; };
  const toggleTheme = () => setIsDark(!isDark);

  const handleUpgrade = (planName) => {
    if (planName === "Platinum") { window.location.href = "mailto:sales@xbase.ai"; return; }
    window.location.href = `/checkout?plan=${planName.toLowerCase()}`;
  };

  const getYearlyPrice = (price) => {
    if (price === "Custom" || price === "0") return null;
    const monthly = parseInt(price.replace(/,/g, ""));
    return Math.floor(monthly * 12 * 0.8).toLocaleString();
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: theme.bg, color: theme.text }}>
        <p>Loading...</p>
      </div>
    );
  }

  const planIcons = { Free: "FREE", Premium: "STAR", Gold: "CROWN", Platinum: "GEM" };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: theme.bg, color: theme.text, fontFamily: "'Inter', sans-serif" }}>
      <Sidebar activeNav="Pricing" isMobile={isMobile} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} theme={theme} toggleTheme={toggleTheme} isDark={isDark} user={user} handleLogout={handleLogout} />

      <main style={{ flex: 1, padding: 24, overflowY: "auto" }}>
        {isMobile && (
          <button onClick={() => setSidebarOpen(true)} style={{ marginBottom: 20, padding: 10, background: theme.cardBg, border: "1px solid " + theme.border, borderRadius: 10, cursor: "pointer", color: theme.text }}>
            Open Menu
          </button>
        )}

        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ padding: 40, borderRadius: 24, marginBottom: 32, textAlign: "center", background: theme.cardBg, border: "1px solid " + theme.border }}>
            <span style={{ color: theme.accent, fontSize: 12, fontWeight: 600 }}>PRICING</span>
            <h1 style={{ fontSize: 42, fontWeight: 800, margin: "16px 0" }}>Simple, Transparent Pricing</h1>
            <p style={{ color: theme.textSub }}>Choose the plan that fits your business. All plans include a 14-day free trial.</p>
            <div style={{ display: "inline-flex", gap: 8, marginTop: 20, padding: 6, borderRadius: 48, background: theme.cardBg, border: "1px solid " + theme.border }}>
              <button onClick={() => setBillingInterval("monthly")} style={{ padding: "10px 28px", borderRadius: 40, background: billingInterval === "monthly" ? theme.accent : "transparent", border: "none", cursor: "pointer", fontWeight: 600, color: billingInterval === "monthly" ? "#000" : theme.textSub }}>Monthly</button>
              <button onClick={() => setBillingInterval("yearly")} style={{ padding: "10px 28px", borderRadius: 40, background: billingInterval === "yearly" ? theme.accent : "transparent", border: "none", cursor: "pointer", fontWeight: 600, color: billingInterval === "yearly" ? "#000" : theme.textSub }}>Yearly (Save 20%)</button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 24 }}>
            {plans.map((plan) => {
              const isCurrent = currentTier.toLowerCase() === plan.name.toLowerCase();
              const yearlyPrice = getYearlyPrice(plan.price);
              const displayPrice = billingInterval === "yearly" && yearlyPrice ? yearlyPrice : plan.price;

              return (
                <div key={plan.name} style={{ padding: 28, borderRadius: 24, textAlign: "center", background: theme.cardBg, border: `2px solid ${plan.popular ? theme.accent : theme.border}`, position: "relative" }}>
                  {plan.popular && <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: theme.accent, borderRadius: 40, padding: "4px 16px" }}><span style={{ fontSize: 12, fontWeight: 700, color: "#000" }}>Most Popular</span></div>}
                  <div style={{ marginBottom: 24 }}>
                    <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>{plan.name}</h3>
                    <div><span style={{ fontSize: 42, fontWeight: 800, color: theme.accent }}>{plan.price === "Custom" ? "Custom" : `${displayPrice} FCFA`}</span>{plan.period && <span style={{ color: theme.textSub, fontSize: 14 }}>{plan.period}</span>}</div>
                    {billingInterval === "yearly" && yearlyPrice && plan.price !== "Custom" && plan.price !== "0" && <p style={{ fontSize: 12, color: theme.accent, marginTop: 4 }}>{yearlyPrice} FCFA/year</p>}
                  </div>
                  <div style={{ marginBottom: 28, textAlign: "left", minHeight: 280 }}>
                    {plan.features.map((feature, idx) => <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, fontSize: 13, color: theme.textSub }}><span style={{ color: theme.accent, fontSize: 14 }}>+</span>{feature}</div>)}
                  </div>
                  <button onClick={() => handleUpgrade(plan.name)} disabled={isCurrent} style={{ width: "100%", padding: 14, borderRadius: 40, fontWeight: 700, cursor: isCurrent ? "not-allowed" : "pointer", background: isCurrent ? theme.textMuted : `linear-gradient(135deg, ${theme.accent}, ${theme.secondary})`, color: isCurrent ? theme.textSub : "#000", border: "none" }}>
                    {isCurrent ? "Current Plan" : plan.name === "Platinum" ? "Contact Sales" : "Upgrade Now"}
                  </button>
                </div>
              );
            })}
          </div>

          <div style={{ padding: 32, borderRadius: 24, marginTop: 48, textAlign: "center", background: theme.cardBg, border: "1px solid " + theme.border }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Frequently Asked Questions</h3>
            <p style={{ color: theme.textSub, marginBottom: 16 }}>Have questions about pricing or features?</p>
            <a href="mailto:support@xbase.ai" style={{ color: theme.accent, textDecoration: "none", fontWeight: 600 }}>Contact our support team</a>
          </div>
        </div>
      </main>
    </div>
  );
}