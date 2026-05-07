'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Sidebar from '../components/Sidebar';

const supabaseUrl = 'https://yllquiyrnhicvnrhihfk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsbHF1aXlybmhpY3ZucmhpaGZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MzAxNzAsImV4cCI6MjA5MjUwNjE3MH0.bJI1KBep_S62_cDlST7R7luBU1TirciERIqLBfHLnGk';

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

export default function ProductsPage() {
  const width = useWidth();
  const isMobile = width < 1024;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [answer, setAnswer] = useState("");

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
      await loadProducts(user.id);
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

  const loadProducts = async (userId) => {
    const { data } = await supabase.from('products').select('*').eq('user_id', userId);
    setProducts(data || []);
  };

  const deleteProduct = async (id, name) => {
    if (confirm(`Delete "${name}"?`)) {
      await supabase.from('products').delete().eq('id', id);
      await loadProducts(user.id);
      setAnswer(`✅ Deleted "${name}"`);
      setTimeout(() => setAnswer(""), 2000);
    }
  };

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

  const handleLogout = async () => { 
    await supabase.auth.signOut(); 
    window.location.href = "/login"; 
  };
  
  const toggleTheme = () => setIsDark(!isDark);

  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh', 
        background: theme.bg 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48,
            height: 48,
            border: `2px solid ${theme.border}`,
            borderTop: `2px solid ${theme.accent}`,
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto'
          }} />
          <p style={{ marginTop: 16, color: theme.textSub }}>Loading Products...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ 
      display: "flex", 
      minHeight: "100vh", 
      background: `radial-gradient(circle at 20% 20%, ${theme.accent}08, transparent 50%), radial-gradient(circle at 80% 30%, ${theme.secondary}08, transparent 50%), ${theme.bg}`, 
      color: theme.text, 
      fontFamily: "'Inter', sans-serif" 
    }}>
      <Sidebar 
        activeNav="Products" 
        isMobile={isMobile} 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        theme={theme} 
        toggleTheme={toggleTheme} 
        isDark={isDark} 
        user={user} 
        handleLogout={handleLogout} 
      />
      
      <main style={{ flex: 1, padding: 24, overflowY: "auto" }}>
        {isMobile && !sidebarOpen && (
          <button 
            onClick={() => setSidebarOpen(true)} 
            style={{ marginBottom: 20, padding: 10, background: theme.cardBg, border: "1px solid " + theme.border, borderRadius: 10, cursor: "pointer", color: theme.text }}
          >
            ☰ Open Menu
          </button>
        )}
        
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ 
            background: theme.bg2, 
            borderRadius: 20, 
            padding: 24, 
            marginBottom: 24, 
            border: "1px solid " + theme.border,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16
          }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800 }}>📦 Products</h1>
              <p style={{ color: theme.textSub }}>Manage your product catalog</p>
            </div>
            <button 
              onClick={() => window.location.href = "/documents"} 
              style={{ 
                padding: "12px 24px", 
                background: `linear-gradient(135deg, ${theme.accent}, ${theme.secondary})`, 
                border: "none", 
                borderRadius: 12, 
                fontWeight: 600, 
                cursor: "pointer", 
                color: "#000"
              }}
            >
              + Add Product via Document
            </button>
          </div>

          {/* Answer Message */}
          {answer && (
            <div style={{ 
              background: theme.accentDim, 
              color: "#000", 
              padding: 12, 
              borderRadius: 10, 
              marginBottom: 20, 
              textAlign: "center",
              fontWeight: 500
            }}>
              {answer}
            </div>
          )}

          {/* Products Grid */}
          {products.length === 0 ? (
            <div style={{ 
              background: theme.bg2, 
              borderRadius: 20, 
              padding: 60, 
              textAlign: "center", 
              border: "1px solid " + theme.border 
            }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>📦</div>
              <h2 style={{ fontSize: 24, marginBottom: 8 }}>No products yet</h2>
              <p style={{ color: theme.textSub, marginBottom: 24 }}>Upload documents to automatically create products</p>
              <button 
                onClick={() => window.location.href = "/documents"} 
                style={{ 
                  padding: "12px 24px", 
                  background: `linear-gradient(135deg, ${theme.accent}, ${theme.secondary})`, 
                  border: "none", 
                  borderRadius: 10, 
                  fontWeight: 600, 
                  cursor: "pointer", 
                  color: "#000"
                }}
              >
                Upload Document →
              </button>
            </div>
          ) : (
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
              gap: 20 
            }}>
              {products.map((product) => (
                <div 
                  key={product.id} 
                  style={{ 
                    background: theme.bg2, 
                    borderRadius: 16, 
                    border: "1px solid " + theme.border, 
                    overflow: "hidden",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    cursor: "pointer"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{ padding: 20 }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
                    <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{product.name}</h3>
                    <p style={{ color: theme.textSub, fontSize: 14, marginBottom: 16 }}>
                      {product.description || "No description available"}
                    </p>
                    <div style={{ 
                      fontSize: 28, 
                      fontWeight: 800, 
                      color: theme.accent, 
                      marginBottom: 16 
                    }}>
                      {product.price?.toLocaleString()} FCFA
                    </div>
                    <div style={{ display: "flex", gap: 12 }}>
                      <button 
                        onClick={() => addToCart(product.name, product.price)} 
                        style={{ 
                          flex: 1, 
                          background: `linear-gradient(135deg, ${theme.accent}, ${theme.secondary})`, 
                          border: "none", 
                          padding: 10, 
                          borderRadius: 8, 
                          fontWeight: 600, 
                          cursor: "pointer", 
                          color: "#000"
                        }}
                      >
                        🛒 Add to Cart
                      </button>
                      <button 
                        onClick={() => deleteProduct(product.id, product.name)} 
                        style={{ 
                          padding: "10px 16px", 
                          background: "transparent", 
                          border: "1px solid " + theme.border, 
                          borderRadius: 8, 
                          cursor: "pointer", 
                          color: "#EF4444"
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Cart Button */}
      <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 100 }}>
        <button 
          onClick={() => window.location.href = "/checkout"} 
          style={{ 
            background: theme.accent, 
            border: "none", 
            width: 56, 
            height: 56, 
            borderRadius: 28, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            cursor: "pointer", 
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)", 
            position: "relative" 
          }}
        >
          🛒
          {totalItems > 0 && (
            <span style={{ 
              position: "absolute", 
              top: -5, 
              right: -5, 
              background: "#EF4444", 
              color: "white", 
              fontSize: 10, 
              padding: "2px 6px", 
              borderRadius: 10 
            }}>
              {totalItems}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}