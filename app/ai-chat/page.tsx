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

export default function AIChatPage() {
  const width = useWidth();
  const isMobile = width < 1024;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

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
      const { data: docs } = await supabase.from("documents").select("*").eq("user_id", user.id);
      setDocuments(docs || []);
      setLoading(false);
    };
    init();
  }, []);

  const askQuestion = async () => {
    if (!question.trim()) return;
    setChatLoading(true);
    setChatHistory(prev => [...prev, { role: "user", content: question }]);
    const context = documents.map(doc => doc.content).join("\n\n");
    try {
      const res = await fetch("/api/deepseek", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "system", content: `Answer using: ${context || "No documents."}` }, { role: "user", content: question }] })
      });
      const data = await res.json();
      setChatHistory(prev => [...prev, { role: "assistant", content: data.answer || "No response" }]);
    } catch { setChatHistory(prev => [...prev, { role: "assistant", content: "Error" }]); }
    setChatLoading(false);
    setQuestion("");
  };

  const handleLogout = async () => { await supabase.auth.signOut(); window.location.href = "/login"; };
  const toggleTheme = () => setIsDark(!isDark);

  if (loading) return <div style={{ minHeight: "100vh", background: theme.bg }}>Loading...</div>;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: `radial-gradient(circle at 20% 20%, ${theme.accent}08, transparent 50%), radial-gradient(circle at 80% 30%, ${theme.secondary}08, transparent 50%), ${theme.bg}`, color: theme.text, fontFamily: "'Inter', sans-serif" }}>
      <Sidebar activeNav="AI Chat" isMobile={isMobile} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} theme={theme} toggleTheme={toggleTheme} isDark={isDark} user={user} handleLogout={handleLogout} />
      <main style={{ flex: 1, padding: 24, overflowY: "auto" }}>
        {isMobile && <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ marginBottom: 20, padding: 10, background: theme.cardBg, border: "1px solid " + theme.border, borderRadius: 10, cursor: "pointer", color: theme.text }}>☰ Menu</button>}
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>💬 AI Chat Assistant</h1>
          <p style={{ color: theme.textSub, marginBottom: 24 }}>Ask questions about your products and documents</p>
          {documents.length === 0 && <div style={{ background: "rgba(245,158,11,0.1)", padding: 12, borderRadius: 8, marginBottom: 20, color: "#F59E0B" }}>⚠️ No documents uploaded. Go to Documents page first.</div>}
          <div style={{ background: theme.bg2, border: "1px solid " + theme.border, borderRadius: 16, padding: 20, marginBottom: 20, minHeight: 400, maxHeight: 500, overflowY: "auto" }}>
            {chatHistory.length === 0 ? <div style={{ textAlign: "center", padding: 60, color: theme.textMuted }}>💬 Ask a question...</div> : chatHistory.map((msg, idx) => (
              <div key={idx} style={{ marginBottom: 16, textAlign: msg.role === "user" ? "right" : "left" }}>
                <div style={{ display: "inline-block", maxWidth: "80%", padding: "12px 16px", borderRadius: 16, background: msg.role === "user" ? `linear-gradient(135deg, ${theme.accent}, ${theme.secondary})` : theme.bg3, color: msg.role === "user" ? "#000" : theme.text }}>{msg.content}</div>
              </div>
            ))}
            {chatLoading && <div style={{ textAlign: "left" }}><div style={{ display: "inline-block", padding: "12px 16px", background: theme.bg3, borderRadius: 16 }}>Thinking...</div></div>}
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <input type="text" value={question} onChange={e => setQuestion(e.target.value)} onKeyPress={e => e.key === "Enter" && askQuestion()} placeholder="Ask about your products..." style={{ flex: 1, padding: 12, background: theme.bg2, border: "1px solid " + theme.border, borderRadius: 10, color: theme.text }} />
            <button onClick={askQuestion} disabled={documents.length === 0 || chatLoading} style={{ padding: "0 24px", background: `linear-gradient(135deg, ${theme.accent}, ${theme.secondary})`, border: "none", borderRadius: 10, fontWeight: 600, cursor: "pointer", color: "#000" }}>Send</button>
          </div>
        </div>
      </main>
    </div>
  );
}