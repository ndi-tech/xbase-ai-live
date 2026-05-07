"use client";

import { useState } from "react";

const navItems = [
  { name: "Dashboard", icon: "◆", path: "/dashboard" },
  { name: "Products", icon: "●", path: "/products" },
  { name: "AI Agents", icon: "○", path: "/agents" },
  { name: "AI Chat", icon: "◇", path: "/ai-chat" },
  { name: "Documents", icon: "□", path: "/documents" },
  { name: "Orders", icon: "■", path: "/orders" },
  { name: "Leads", icon: "👥", path: "/leads" },
  { name: "Pricing", icon: "💰", path: "/pricing" },
  { name: "Settings", icon: "△", path: "/settings" }
];

export default function Sidebar({ activeNav, isMobile, sidebarOpen, setSidebarOpen, theme, toggleTheme, isDark, user, handleLogout }) {
  const getInitial = user?.email?.charAt(0).toUpperCase() || "U";

  return (
    <>
      {/* Sidebar */}
      <aside style={{
        width: 280,
        background: theme.bg2,
        borderRight: "1px solid " + theme.border,
        transition: "0.3s ease",
        transform: isMobile && !sidebarOpen ? "translateX(-100%)" : "translateX(0)",
        position: isMobile ? "fixed" : "relative",
        height: "100vh",
        zIndex: 50,
        overflowY: "auto"
      }}>
        {/* Logo */}
        <div style={{ padding: "24px 20px", borderBottom: "1px solid " + theme.border, marginBottom: 16 }}>
          <div style={{
            background: `linear-gradient(135deg, ${theme.accent}, ${theme.secondary})`,
            width: 40, height: 40, borderRadius: 12,
            display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12
          }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: "#000" }}>X</span>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: theme.text }}>Xbase AI</h2>
          <p style={{ fontSize: 11, color: theme.textMuted, marginTop: 4 }}>Agent Platform</p>
        </div>

        {/* Navigation */}
        <nav style={{ padding: "0 16px" }}>
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.path}
              className="nav-item"
              style={{
                display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 12,
                textDecoration: "none", color: activeNav === item.name ? theme.accentLight : theme.textSub,
                background: activeNav === item.name ? theme.accent + "10" : "transparent",
                marginBottom: 4
              }}
              onClick={() => { if (isMobile) setSidebarOpen(false); }}
            >
              <span style={{ fontSize: 18, width: 24 }}>{item.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{item.name}</span>
            </a>
          ))}
        </nav>

        {/* Theme Toggle */}
        <div style={{ margin: "16px", padding: "12px", background: theme.bg3 + "80", borderRadius: 12, border: "1px solid " + theme.border }}>
          <button onClick={toggleTheme} style={{
            display: "flex", alignItems: "center", gap: 12, width: "100%",
            background: "none", border: "none", cursor: "pointer", padding: 8, borderRadius: 8, color: theme.text
          }}>
            <span style={{ fontSize: 20 }}>{isDark ? "☀️" : "🌙"}</span>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{isDark ? "Light Mode" : "Dark Mode"}</span>
          </button>
        </div>

        {/* User Section */}
        <div style={{ padding: "16px", borderTop: "1px solid " + theme.border, marginTop: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36,
            background: `linear-gradient(135deg, ${theme.accentDim}, ${theme.accent})`,
            borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#000"
          }}>
            {getInitial}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: theme.text }}>{user?.email?.split("@")[0] || "User"}</div>
            <div style={{ fontSize: 10, color: theme.textMuted }}>{user?.email || "user@example.com"}</div>
          </div>
          <button onClick={handleLogout} style={{
            background: "transparent", border: "1px solid " + theme.border,
            padding: "6px 10px", borderRadius: 8, fontSize: 12, cursor: "pointer", color: theme.textSub
          }}>Exit</button>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      {isMobile && !sidebarOpen && (
        <button onClick={() => setSidebarOpen(true)} style={{
          position: "fixed", bottom: 20, left: 20, zIndex: 60,
          background: theme.accent, border: "none", width: 48, height: 48, borderRadius: 24,
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
        }}>
          <span style={{ fontSize: 24, color: "#000" }}>☰</span>
        </button>
      )}

      {/* Close button when sidebar is open on mobile */}
      {isMobile && sidebarOpen && (
        <button onClick={() => setSidebarOpen(false)} style={{
          position: "fixed", top: 20, right: 20, zIndex: 60,
          background: theme.bg3, border: "1px solid " + theme.border, width: 36, height: 36, borderRadius: 18,
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          color: theme.text
        }}>
          ✕
        </button>
      )}

      <style>{`
        .nav-item { transition: all 0.2s; }
        .nav-item:hover { background: ${theme.accent}15; color: ${theme.accentLight}; transform: translateX(4px); }
      `}</style>
    </>
  );
}