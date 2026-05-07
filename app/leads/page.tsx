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

const categories = [
  { id: "ready_to_buy", name: "🔥 Ready to Buy", color: "#10B981", icon: "💰", description: "High intent - ready to purchase" },
  { id: "needs_followup", name: "📞 Needs Follow-up", color: "#F59E0B", icon: "⏰", description: "Interested but needs nurturing" },
  { id: "just_browsing", name: "👀 Just Browsing", color: "#6B7280", icon: "🔍", description: "Low intent - just looking" },
  { id: "converted", name: "✅ Converted", color: "#8B5CF6", icon: "🎉", description: "Completed purchase" },
  { id: "lost", name: "❌ Lost", color: "#EF4444", icon: "💔", description: "Not interested" }
];

export default function LeadsPage() {
  const width = useWidth();
  const isMobile = width < 1024;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [noteText, setNoteText] = useState("");

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
      await loadLeads(user.id);
      setLoading(false);
    };
    init();
  }, []);

  const loadLeads = async (userId) => {
    const { data } = await supabase
      .from("leads")
      .select("*")
      .eq("user_id", userId)
      .order("last_interaction", { ascending: false });
    if (data) setLeads(data);
  };

  const updateLeadCategory = async (leadId, category) => {
    const { error } = await supabase
      .from("leads")
      .update({ category: category, last_interaction: new Date().toISOString() })
      .eq("id", leadId);
    if (!error) {
      await loadLeads(user.id);
      if (selectedLead?.id === leadId) {
        setSelectedLead({ ...selectedLead, category });
      }
    }
  };

  const updateLeadNote = async (leadId) => {
    if (!noteText.trim()) return;
    const { error } = await supabase
      .from("leads")
      .update({ notes: noteText })
      .eq("id", leadId);
    if (!error) {
      await loadLeads(user.id);
      if (selectedLead?.id === leadId) {
        setSelectedLead({ ...selectedLead, notes: noteText });
      }
      setNoteText("");
    }
  };

  const deleteLead = async (leadId) => {
    if (confirm("Delete this lead?")) {
      await supabase.from("leads").delete().eq("id", leadId);
      await loadLeads(user.id);
      if (selectedLead?.id === leadId) setSelectedLead(null);
    }
  };

  const filteredLeads = leads.filter(lead => {
    if (filterCategory !== "all" && lead.category !== filterCategory) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return lead.customer_name?.toLowerCase().includes(search) ||
             lead.customer_phone?.includes(search) ||
             lead.customer_email?.toLowerCase().includes(search);
    }
    return true;
  });

  const categoryCounts = {
    ready_to_buy: leads.filter(l => l.category === "ready_to_buy").length,
    needs_followup: leads.filter(l => l.category === "needs_followup").length,
    just_browsing: leads.filter(l => l.category === "just_browsing").length,
    converted: leads.filter(l => l.category === "converted").length,
    lost: leads.filter(l => l.category === "lost").length
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: theme.bg }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 48,
            height: 48,
            border: `2px solid ${theme.border}`,
            borderTop: `2px solid ${theme.accent}`,
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto'
          }} />
          <p style={{ marginTop: 16, color: theme.textSub }}>Loading Leads...</p>
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
    <div style={{ display: "flex", minHeight: "100vh", background: `radial-gradient(circle at 20% 20%, ${theme.accent}08, transparent 50%), radial-gradient(circle at 80% 30%, ${theme.secondary}08, transparent 50%), ${theme.bg}`, color: theme.text, fontFamily: "'Inter', sans-serif" }}>
      <Sidebar activeNav="Leads" isMobile={isMobile} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} theme={theme} toggleTheme={() => setIsDark(!isDark)} isDark={isDark} user={user} handleLogout={async () => { await supabase.auth.signOut(); window.location.href = "/login"; }} />

      <main style={{ flex: 1, padding: 24, overflowY: "auto" }}>
        {isMobile && <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ marginBottom: 20, padding: 10, background: theme.cardBg, border: "1px solid " + theme.border, borderRadius: 10, cursor: "pointer", color: theme.text }}>☰ Menu</button>}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
          <div><h1 style={{ fontSize: 28, fontWeight: 800 }}>👥 Customer Leads</h1><p style={{ color: theme.textSub }}>Track and manage potential customers</p></div>
          <div style={{ display: "flex", gap: 12 }}>
            <input type="text" placeholder="Search by name or phone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ padding: "10px 16px", background: theme.bg2, border: "1px solid " + theme.border, borderRadius: 10, color: theme.text, width: 200 }} />
          </div>
        </div>

        {/* Category Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12, marginBottom: 24 }}>
          {categories.map(cat => (
            <div key={cat.id} onClick={() => setFilterCategory(filterCategory === cat.id ? "all" : cat.id)} style={{ cursor: "pointer", background: theme.bg2, border: `2px solid ${filterCategory === cat.id ? cat.color : theme.border}`, borderRadius: 12, padding: 12, textAlign: "center" }}>
              <div style={{ fontSize: 24 }}>{cat.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: cat.color }}>{categoryCounts[cat.id] || 0}</div>
              <div style={{ fontSize: 11, color: theme.textSub }}>{cat.name}</div>
            </div>
          ))}
        </div>

        {/* Leads List */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {filteredLeads.length === 0 ? (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 60, color: theme.textMuted }}>No leads found. Customers will appear here when they interact with your AI.</div>
          ) : (
            filteredLeads.map(lead => {
              const category = categories.find(c => c.id === lead.category);
              return (
                <div key={lead.id} className="glass-card" style={{ padding: 16, borderRadius: 16, cursor: "pointer", background: theme.bg2, border: "1px solid " + theme.border }} onClick={() => setSelectedLead(selectedLead?.id === lead.id ? null : lead)}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16 }}>{lead.customer_name || "Anonymous Customer"}</div>
                      <div style={{ fontSize: 12, color: theme.textSub }}>{lead.customer_phone || "No phone"}</div>
                      {lead.customer_email && <div style={{ fontSize: 11, color: theme.textMuted }}>{lead.customer_email}</div>}
                    </div>
                    <div style={{ background: category?.color + "20", color: category?.color, padding: "4px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{category?.icon} {category?.name}</div>
                  </div>
                  <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {categories.filter(c => c.id !== lead.category).map(cat => (
                      <button key={cat.id} onClick={(e) => { e.stopPropagation(); updateLeadCategory(lead.id, cat.id); }} style={{ background: "none", border: "1px solid " + theme.border, borderRadius: 20, padding: "4px 12px", fontSize: 11, cursor: "pointer", color: theme.textSub }}>{cat.icon} {cat.name}</button>
                    ))}
                  </div>
                  {lead.notes && <div style={{ marginTop: 8, fontSize: 12, color: theme.textMuted, padding: 8, background: theme.bg2, borderRadius: 8 }}>📝 {lead.notes}</div>}
                  {selectedLead?.id === lead.id && (
                    <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid " + theme.border }}>
                      <textarea placeholder="Add note..." rows={2} value={noteText} onChange={(e) => setNoteText(e.target.value)} style={{ width: "100%", padding: 8, background: theme.bg2, border: "1px solid " + theme.border, borderRadius: 8, color: theme.text, fontSize: 12 }} />
                      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <button onClick={() => updateLeadNote(lead.id)} style={{ background: theme.accent, border: "none", padding: "6px 12px", borderRadius: 8, cursor: "pointer", color: "#000", fontSize: 12 }}>Add Note</button>
                        <button onClick={() => deleteLead(lead.id)} style={{ background: "none", border: "1px solid #EF4444", padding: "6px 12px", borderRadius: 8, cursor: "pointer", color: "#EF4444", fontSize: 12 }}>Delete Lead</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}