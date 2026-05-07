'use client';

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Sidebar from "../components/Sidebar";
import CartNotification from "../components/CartNotification";

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

export default function DashboardPage() {
  const width = useWidth();
  const isMobile = width < 1024;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("");

  const theme = isDark ? darkTheme : lightTheme;

  useEffect(() => {
    const savedTheme = localStorage.getItem("xbase_theme");
    if (savedTheme === "light") setIsDark(false);
    if (savedTheme === "dark") setIsDark(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("xbase_theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }
      setUser(user);
      const { data } = await supabase.from("products").select("*").eq("user_id", user.id);
      if (data) setProducts(data);
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    const storedCart = localStorage.getItem("xbase_cart");
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
    const handleCartUpdate = () => {
      const updatedCart = localStorage.getItem("xbase_cart");
      if (updatedCart) setCart(JSON.parse(updatedCart));
    };
    window.addEventListener("cartUpdated", handleCartUpdate);
    window.addEventListener("storage", handleCartUpdate);
    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
      window.removeEventListener("storage", handleCartUpdate);
    };
  }, []);

  const addToCart = (item, price) => {
    let cart = [];
    const existingCart = localStorage.getItem("xbase_cart");
    if (existingCart) {
      cart = JSON.parse(existingCart);
    }
    const existing = cart.find(i => i.item === item);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ item, price, quantity: 1 });
    }
    localStorage.setItem("xbase_cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
    window.dispatchEvent(new Event("storage"));
    setAnswer(`✅ Added ${item} to cart!`);
    setTimeout(() => setAnswer(""), 2000);
  };

  const removeFromCart = (item) => {
    const existing = cart.find(i => i.item === item);
    if (existing && existing.quantity > 1) {
      setCart(cart.map(i => i.item === item ? { ...i, quantity: i.quantity - 1 } : i));
    } else {
      setCart(cart.filter(i => i.item !== item));
    }
    setAnswer(`🗑️ Removed ${item}`);
    setTimeout(() => setAnswer(""), 2000);
  };

  const clearCart = () => { setCart([]); setAnswer("Cart cleared"); setTimeout(() => setAnswer(""), 2000); };

  const openPaymentModal = (method) => {
    if (cart.length === 0) { setAnswer("Cart is empty"); return; }
    setSelectedMethod(method);
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    if (!customerPhone || customerPhone.length < 9) { setAnswer("Please enter a phone number"); return; }
    setPaymentProcessing(true);
    const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const { data: order, error } = await supabase.from("orders").insert({
      user_id: user.id, customer_phone: customerPhone, items: cart, total: total,
      status: "pending", payment_status: "pending"
    }).select().single();
    if (error) { setAnswer("Error creating order"); setPaymentProcessing(false); return; }
    await new Promise(r => setTimeout(r, 2000));
    const isSuccess = Math.random() < 0.9;
    if (isSuccess) {
      await supabase.from("orders").update({ payment_status: "paid", status: "confirmed" }).eq("id", order.id);
      setAnswer(`✅ Order confirmed! Total: ${total.toLocaleString()} FCFA`);
      setCart([]);
      setCustomerPhone("");
      setShowPaymentModal(false);
    } else { setAnswer(`❌ Payment failed. Please try again.`); }
    setPaymentProcessing(false);
    setTimeout(() => setAnswer(""), 4000);
  };

  const askAI = async () => {
    if (!question.trim()) return;
    setChatLoading(true);
    const context = products.map(p => `${p.name} - ${p.price} FCFA`).join("\n");
    try {
      const response = await fetch("/api/deepseek", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "system", content: `Products: ${context || "None."}` }, { role: "user", content: question }] })
      });
      const data = await response.json();
      setAnswer(data.answer || "No response");
    } catch { setAnswer("Sorry, try again."); }
    setChatLoading(false);
    setQuestion("");
  };

  const handleLogout = async () => { await supabase.auth.signOut(); window.location.href = "/login"; };
  const toggleTheme = () => setIsDark(!isDark);

  if (loading) return <div style={{ minHeight: "100vh", background: theme.bg }}>Loading...</div>;

  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: `radial-gradient(circle at 20% 20%, ${theme.accent}08, transparent 50%), radial-gradient(circle at 80% 30%, ${theme.secondary}08, transparent 50%), ${theme.bg}`, color: theme.text, fontFamily: "'Inter', sans-serif" }}>
      <Sidebar activeNav="Dashboard" isMobile={isMobile} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} theme={theme} toggleTheme={toggleTheme} isDark={isDark} user={user} handleLogout={handleLogout} />
      <main style={{ flex: 1, padding: 24, overflowY: "auto" }}>
        {isMobile && !sidebarOpen && (
          <button onClick={() => setSidebarOpen(true)} style={{ marginBottom: 20, padding: 10, background: theme.cardBg, border: "1px solid " + theme.border, borderRadius: 10, cursor: "pointer", color: theme.text }}>☰ Open Menu</button>
        )}
        
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* Welcome Section */}
          <div style={{ background: theme.bg2, borderRadius: 20, padding: 24, marginBottom: 24, border: "1px solid " + theme.border }}>
            <h1 style={{ fontSize: 28, fontWeight: 800 }}>Welcome, <span style={{ color: theme.accent }}>{user?.email?.split("@")[0]}</span>!</h1>
            <p style={{ color: theme.textSub }}>Your AI-powered business platform is ready.</p>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16, marginBottom: 24 }}>
            <div style={{ background: theme.bg2, border: "1px solid " + theme.border, borderRadius: 16, padding: 20, textAlign: "center" }}><div style={{ fontSize: 32 }}>📦</div><div style={{ fontSize: 28, fontWeight: 800 }}>{products.length}</div><div>Products</div></div>
            <div style={{ background: theme.bg2, border: "1px solid " + theme.border, borderRadius: 16, padding: 20, textAlign: "center" }}><div style={{ fontSize: 32 }}>🛒</div><div style={{ fontSize: 28, fontWeight: 800 }}>{totalItems}</div><div>Cart Items</div></div>
            <div style={{ background: theme.bg2, border: "1px solid " + theme.border, borderRadius: 16, padding: 20, textAlign: "center" }}><div style={{ fontSize: 32 }}>🤖</div><div style={{ fontSize: 28, fontWeight: 800 }}>Online</div><div>AI Status</div></div>
          </div>

          {/* Products Grid */}
          <div style={{ background: theme.bg2, border: "1px solid " + theme.border, borderRadius: 20, padding: 24, marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>Recent Products</h2>
              <a href="/products" style={{ color: theme.accent, fontSize: 12 }}>View all →</a>
            </div>
            {products.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40 }}><p>No products yet.</p><a href="/documents" style={{ display: "inline-block", marginTop: 16, padding: "10px 20px", background: `linear-gradient(135deg, ${theme.accent}, ${theme.secondary})`, borderRadius: 10, fontWeight: 600, color: "#000", textDecoration: "none" }}>Upload Document →</a></div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                {products.slice(0, 6).map((product, idx) => (
                  <div key={idx} style={{ padding: 16, background: theme.bg3, borderRadius: 12, border: "1px solid " + theme.border }}>
                    <div style={{ fontWeight: 600 }}>{product.name}</div>
                    <div style={{ color: theme.accent, fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{product.price.toLocaleString()} FCFA</div>
                    <button onClick={() => addToCart(product.name, product.price)} style={{ width: "100%", background: `linear-gradient(135deg, ${theme.accent}, ${theme.secondary})`, border: "none", padding: 8, borderRadius: 8, fontWeight: 600, cursor: "pointer", color: "#000" }}>Add to Cart</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Chat */}
          <div style={{ background: theme.bg2, border: "1px solid " + theme.border, borderRadius: 20, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}><span style={{ fontSize: 24 }}>💬</span><h2 style={{ fontSize: 18, fontWeight: 700 }}>AI Assistant</h2></div>
            <div style={{ padding: 16, background: theme.bg3, borderRadius: 12, marginBottom: 16, minHeight: 80 }}><p>{answer || "Ask me anything about your products!"}</p>{chatLoading && <p style={{ color: theme.accent, fontSize: 12, marginTop: 8 }}>Thinking...</p>}</div>
            <div style={{ display: "flex", gap: 12 }}>
              <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} onKeyPress={(e) => e.key === "Enter" && askAI()} placeholder="Ask something..." style={{ flex: 1, padding: 12, background: theme.bg3, border: "1px solid " + theme.border, borderRadius: 10, color: theme.text }} />
              <button onClick={askAI} disabled={chatLoading} style={{ padding: "0 20px", background: `linear-gradient(135deg, ${theme.accent}, ${theme.secondary})`, border: "none", borderRadius: 10, fontWeight: 600, cursor: "pointer", color: "#000" }}>Send</button>
            </div>
          </div>

          {/* Cart Section - Visible on all pages */}
          <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 100 }}>
            <button onClick={() => window.location.href = "/checkout"} style={{ background: theme.accent, border: "none", width: 56, height: 56, borderRadius: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.3)", position: "relative" }}>
              🛒
              {totalItems > 0 && <span style={{ position: "absolute", top: -5, right: -5, background: "#EF4444", color: "white", fontSize: 10, padding: "2px 6px", borderRadius: 10 }}>{totalItems}</span>}
            </button>
          </div>
        </div>
      </main>

      {showPaymentModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: theme.bg2, borderRadius: 24, maxWidth: 400, width: "90%", padding: 24, border: "1px solid " + theme.border }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ width: 60, height: 60, background: selectedMethod === "mtn" ? "#F5A623" : "#FF6600", borderRadius: 30, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>💰</div>
              <h2 style={{ fontSize: 24, fontWeight: 800 }}>{selectedMethod === "mtn" ? "MTN MoMo" : "Orange Money"}</h2>
              <p style={{ color: theme.textSub }}>Total: <strong style={{ color: theme.accent }}>{cartTotal.toLocaleString()} FCFA</strong></p>
            </div>
            <input type="tel" placeholder="Phone number (e.g., 677571266)" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} disabled={paymentProcessing} style={{ width: "100%", padding: 14, background: theme.bg, border: "1px solid " + theme.border, borderRadius: 10, marginBottom: 20, color: theme.text }} />
            <button onClick={processPayment} disabled={paymentProcessing || !customerPhone} style={{ width: "100%", background: `linear-gradient(135deg, ${theme.accent}, ${theme.secondary})`, border: "none", padding: 14, borderRadius: 12, fontWeight: "bold", cursor: "pointer", color: "#000", marginBottom: 12 }}>{paymentProcessing ? "Processing..." : `Pay ${cartTotal.toLocaleString()} FCFA`}</button>
            <button onClick={() => setShowPaymentModal(false)} style={{ width: "100%", background: "transparent", border: "1px solid " + theme.border, padding: 12, borderRadius: 10, cursor: "pointer", color: theme.textSub }}>Cancel</button>
            <p style={{ fontSize: 10, color: theme.textMuted, textAlign: "center", marginTop: 12 }}>Demo mode - No real money charged</p>
          </div>
        </div>
      )}
    </div>
  );
}