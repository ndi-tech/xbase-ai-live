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

export default function AgentsPage() {
  const width = useWidth();
  const isMobile = width < 1024;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [agents, setAgents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [formData, setFormData] = useState({ name: "", type: "support", description: "" });

  const theme = isDark ? darkTheme : lightTheme;

  const agentTypes = [
    { id: "support", name: "Customer Support", icon: "🛟", description: "Answers FAQs, handles complaints" },
    { id: "sales", name: "Sales Agent", icon: "💰", description: "Processes orders, recommends products" },
    { id: "booking", name: "Booking Agent", icon: "📅", description: "Books appointments, syncs calendar" },
    { id: "lead", name: "Lead Capture", icon: "📊", description: "Collects customer info, pushes to CRM" }
  ];

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
      const { data } = await supabase.from("agents").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (data) setAgents(data);
      setLoading(false);
    };
    init();
  }, []);

  const saveAgent = async () => {
    if (!formData.name) { alert("Please enter an agent name"); return; }
    const agentData = { user_id: user.id, name: formData.name, type: formData.type, description: formData.description, status: "active" };
    let error;
    if (editingAgent) {
      const result = await supabase.from("agents").update(agentData).eq("id", editingAgent.id);
      error = result.error;
    } else {
      const result = await supabase.from("agents").insert(agentData);
      error = result.error;
    }
    if (!error) {
      const { data } = await supabase.from("agents").select("*").eq("user_id", user.id);
      if (data) setAgents(data);
      setShowModal(false);
      setEditingAgent(null);
      setFormData({ name: "", type: "support", description: "" });
    } else { alert("Error: " + error.message); }
  };

  const deleteAgent = async (id, name) => { if (confirm(`Delete "${name}"?`)) { await supabase.from("agents").delete().eq("id", id); const { data } = await supabase.from("agents").select("*").eq("user_id", user.id); if (data) setAgents(data); } };
  const toggleStatus = async (agent) => { const newStatus = agent.status === "active" ? "inactive" : "active"; await supabase.from("agents").update({ status: newStatus }).eq("id", agent.id); const { data } = await supabase.from("agents").select("*").eq("user_id", user.id); if (data) setAgents(data); };
  const editAgent = (agent) => { setEditingAgent(agent); setFormData({ name: agent.name, type: agent.type, description: agent.description || "" }); setShowModal(true); };
  const handleLogout = async () => { await supabase.auth.signOut(); window.location.href = "/login"; };
  const toggleTheme = () => setIsDark(!isDark);

  if (loading) return <div style={{ minHeight: "100vh", background: theme.bg }}>Loading...</div>;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: `radial-gradient(circle at 20% 20%, ${theme.accent}08, transparent 50%), radial-gradient(circle at 80% 30%, ${theme.secondary}08, transparent 50%), ${theme.bg}`, color: theme.text, fontFamily: "'Inter', sans-serif" }}>
      <Sidebar activeNav="AI Agents" isMobile={isMobile} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} theme={theme} toggleTheme={toggleTheme} isDark={isDark} user={user} handleLogout={handleLogout} />
      <main style={{ flex: 1, padding: 24, overflowY: "auto" }}>
        {isMobile && <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ marginBottom: 20, padding: 10, background: theme.cardBg, border: "1px solid " + theme.border, borderRadius: 10, cursor: "pointer", color: theme.text }}>☰ Menu</button>}
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <div><h1 style={{ fontSize: 28, fontWeight: 800 }}>🤖 AI Agents</h1><p style={{ color: theme.textSub }}>Create and manage AI agents for different purposes</p></div>
            <button onClick={() => { setEditingAgent(null); setFormData({ name: "", type: "support", description: "" }); setShowModal(true); }} style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.secondary})`, border: "none", padding: "12px 20px", borderRadius: 12, fontWeight: 600, cursor: "pointer", color: "#000" }}>+ New Agent</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 32 }}>
            {agentTypes.map(type => <div key={type.id} style={{ background: theme.bg2, border: "1px solid " + theme.border, borderRadius: 16, padding: 16 }}><div style={{ fontSize: 32, marginBottom: 8 }}>{type.icon}</div><div style={{ fontWeight: 700 }}>{type.name}</div><div style={{ fontSize: 12, color: theme.textSub }}>{type.description}</div></div>)}
          </div>
          <div style={{ background: theme.bg2, border: "1px solid " + theme.border, borderRadius: 20, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid " + theme.border, fontWeight: 700 }}>Your Agents ({agents.length})</div>
            {agents.length === 0 ? <div style={{ textAlign: "center", padding: 60, color: theme.textMuted }}>No agents created yet. Click "New Agent" to get started.</div> : agents.map(agent => {
              const type = agentTypes.find(t => t.id === agent.type);
              return <div key={agent.id} style={{ padding: 20, borderBottom: "1px solid " + theme.border, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                <div><div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}><span style={{ fontSize: 20 }}>{type?.icon}</span><span style={{ fontWeight: 700 }}>{agent.name}</span><span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: agent.status === "active" ? `${theme.accent}20` : `${theme.textMuted}20`, color: agent.status === "active" ? theme.accent : theme.textMuted }}>{agent.status}</span></div><div style={{ fontSize: 13, color: theme.textSub }}>{agent.description || type?.description}</div><div style={{ fontSize: 11, color: theme.textMuted, marginTop: 4 }}>Created: {new Date(agent.created_at).toLocaleDateString()}</div></div>
                <div><button onClick={() => toggleStatus(agent)} style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", background: agent.status === "active" ? "rgba(245,158,11,0.2)" : `${theme.accent}20`, color: agent.status === "active" ? "#F59E0B" : theme.accent }}>{agent.status === "active" ? "Deactivate" : "Activate"}</button><button onClick={() => editAgent(agent)} style={{ marginLeft: 8, padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", background: `${theme.secondary}20`, color: theme.secondary }}>Edit</button><button onClick={() => deleteAgent(agent.id, agent.name)} style={{ marginLeft: 8, padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", background: "rgba(239,68,68,0.2)", color: "#EF4444" }}>Delete</button></div>
              </div>;
            })}
          </div>
        </div>
      </main>
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: theme.bg2, borderRadius: 24, padding: 28, maxWidth: 500, width: "90%", border: "1px solid " + theme.border }}>
            <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>{editingAgent ? "Edit Agent" : "Create New Agent"}</h3>
            <input type="text" placeholder="Agent Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ width: "100%", padding: 12, marginBottom: 16, background: theme.bg, border: "1px solid " + theme.border, borderRadius: 8, color: theme.text }} />
            <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} style={{ width: "100%", padding: 12, marginBottom: 16, background: theme.bg, border: "1px solid " + theme.border, borderRadius: 8, color: theme.text }}>{agentTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
            <textarea placeholder="Description (optional)" rows={2} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={{ width: "100%", padding: 12, marginBottom: 20, background: theme.bg, border: "1px solid " + theme.border, borderRadius: 8, color: theme.text }} />
            <div style={{ display: "flex", gap: 12 }}><button onClick={saveAgent} style={{ flex: 1, background: `linear-gradient(135deg, ${theme.accent}, ${theme.secondary})`, border: "none", padding: 12, borderRadius: 8, fontWeight: 600, cursor: "pointer", color: "#000" }}>Save</button><button onClick={() => setShowModal(false)} style={{ flex: 1, background: "transparent", border: "1px solid " + theme.border, padding: 12, borderRadius: 8, cursor: "pointer", color: theme.textSub }}>Cancel</button></div>
          </div>
        </div>
      )}
    </div>
  );
}