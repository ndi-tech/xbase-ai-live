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

export default function OrdersPage() {
  const width = useWidth();
  const isMobile = width < 1024;
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

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
      if (!user) {
        window.location.href = "/login";
        return;
      }
      setUser(user);
      await loadOrders(user.id);
    };
    init();
  }, []);

  const loadOrders = async (userId) => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const toggleTheme = () => setIsDark(!isDark);

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'confirmed': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'cancelled': return '#EF4444';
      default: return theme.textSub;
    }
  };

  const getPaymentStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'paid': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'failed': return '#EF4444';
      default: return theme.textSub;
    }
  };

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
          <p style={{ marginTop: 16, color: theme.textSub }}>Loading Orders...</p>
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
        activeNav="Orders" 
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
          <div style={{ 
            background: theme.bg2, 
            borderRadius: 20, 
            padding: 24, 
            marginBottom: 24, 
            border: "1px solid " + theme.border 
          }}>
            <h1 style={{ fontSize: 28, fontWeight: 800 }}>Orders</h1>
            <p style={{ color: theme.textSub }}>Manage and track customer orders</p>
          </div>

          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
            gap: 16, 
            marginBottom: 24 
          }}>
            <div style={{ background: theme.bg2, border: "1px solid " + theme.border, borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{orders.length}</div>
              <div style={{ color: theme.textSub }}>Total Orders</div>
            </div>
            <div style={{ background: theme.bg2, border: "1px solid " + theme.border, borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>💰</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>
                {orders.reduce((sum, order) => sum + (order.total || 0), 0).toLocaleString()} FCFA
              </div>
              <div style={{ color: theme.textSub }}>Total Revenue</div>
            </div>
            <div style={{ background: theme.bg2, border: "1px solid " + theme.border, borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>
                {orders.filter(o => o.payment_status === "paid").length}
              </div>
              <div style={{ color: theme.textSub }}>Paid Orders</div>
            </div>
          </div>

          {orders.length === 0 ? (
            <div style={{ background: theme.bg2, borderRadius: 20, padding: 60, textAlign: "center", border: "1px solid " + theme.border }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>📦</div>
              <h2 style={{ fontSize: 24, marginBottom: 8 }}>No orders yet</h2>
              <p style={{ color: theme.textSub }}>When customers place orders, they'll appear here</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {orders.map((order) => (
                <div key={order.id} style={{ background: theme.bg2, borderRadius: 16, border: "1px solid " + theme.border, overflow: "hidden", cursor: "pointer", transition: "all 0.2s" }}
                  onClick={() => setSelectedOrder(selectedOrder === String(order.id) ? null : String(order.id))}>
                  <div style={{ padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>Order #{String(order.id).slice(-8)}</div>
                      <div style={{ fontSize: 14, color: theme.textSub }}>
                        {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: theme.accent }}>{order.total?.toLocaleString()} FCFA</div>
                      <div style={{ fontSize: 14, color: theme.textSub }}>{order.customer_phone || "No phone"}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: getStatusColor(order.status) + "20", color: getStatusColor(order.status) }}>
                        {order.status || "pending"}
                      </span>
                      <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: getPaymentStatusColor(order.payment_status) + "20", color: getPaymentStatusColor(order.payment_status) }}>
                        {order.payment_status || "pending"}
                      </span>
                    </div>
                  </div>
                  
                  {selectedOrder === String(order.id) && (
                    <div style={{ borderTop: "1px solid " + theme.border, padding: 20, background: theme.bg3 }}>
                      <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Order Details</h3>
                      {order.items && JSON.parse(order.items).map((item, idx) => (
                        <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: idx < JSON.parse(order.items).length - 1 ? "1px solid " + theme.border : "none" }}>
                          <span>{item.item} x{item.quantity}</span>
                          <span style={{ fontWeight: 600 }}>{(item.price * item.quantity).toLocaleString()} FCFA</span>
                        </div>
                      ))}
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTop: "2px solid " + theme.border, fontWeight: 800 }}>
                        <span>Total</span>
                        <span style={{ color: theme.accent }}>{order.total?.toLocaleString()} FCFA</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}