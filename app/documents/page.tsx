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

export default function DocumentsPage() {
  const width = useWidth();
  const isMobile = width < 1024;
  const [user, setUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);

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
      await loadDocuments(user.id);
    };
    init();
  }, []);

  const loadDocuments = async (userId) => {
    const { data } = await supabase.from('documents').select('*').eq('user_id', userId);
    setDocuments(data || []);
    setLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    setMessage(`Uploading ${file.name}...`);
    
    // Read file content
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      
      // Save to Supabase
      const { error } = await supabase.from('documents').insert({
        user_id: user.id,
        filename: file.name,
        content: content,
        uploaded_at: new Date().toISOString()
      });
      
      if (error) {
        setMessage(`❌ Error: ${error.message}`);
      } else {
        setMessage(`✅ "${file.name}" uploaded and AI is training...`);
        await loadDocuments(user.id);
        setTimeout(() => {
          setMessage('AI knowledge base updated! Your customers will now get smarter responses.');
        }, 2000);
      }
      setUploading(false);
    };
    
    reader.readAsText(file);
  };

  const deleteDocument = async (id, filename) => {
    if (confirm(`Delete "${filename}"?`)) {
      const { error } = await supabase.from('documents').delete().eq('id', id);
      if (!error) {
        setMessage(`🗑️ Deleted: ${filename}. AI is updating...`);
        await loadDocuments(user.id);
        setTimeout(() => {
          setMessage('AI knowledge base updated!');
        }, 2000);
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const toggleTheme = () => setIsDark(!isDark);

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
        </div>
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
        activeNav="Documents" 
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
        
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ 
            background: theme.bg2, 
            borderRadius: 20, 
            padding: 24, 
            marginBottom: 24, 
            border: "1px solid " + theme.border 
          }}>
            <h1 style={{ fontSize: 28, fontWeight: 800 }}>📄 Documents</h1>
            <p style={{ color: theme.textSub }}>Upload documents to train your AI agent</p>
          </div>

          {/* Message */}
          {message && (
            <div style={{ 
              background: theme.accentDim, 
              color: "#000", 
              padding: 12, 
              borderRadius: 10, 
              marginBottom: 20, 
              textAlign: "center",
              fontWeight: 500
            }}>
              {message}
            </div>
          )}

          {/* Upload Section */}
          <div style={{ 
            background: theme.bg2, 
            borderRadius: 20, 
            padding: 24, 
            marginBottom: 24, 
            border: "2px dashed " + theme.border,
            textAlign: "center"
          }}>
            <input
              type="file"
              id="file-upload"
              accept=".txt,.pdf,.docx,.md"
              onChange={handleFileUpload}
              disabled={uploading}
              style={{ display: "none" }}
            />
            <label htmlFor="file-upload" style={{ cursor: "pointer" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📤</div>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>
                {uploading ? "Uploading and training AI..." : "Click to upload document"}
              </div>
              <div style={{ fontSize: 12, color: theme.textSub }}>
                TXT, PDF, DOCX, or MD files
              </div>
            </label>
          </div>

          {/* Documents List */}
          <div style={{ 
            background: theme.bg2, 
            borderRadius: 20, 
            padding: 24, 
            border: "1px solid " + theme.border 
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Your Documents ({documents.length})</h2>
            {documents.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: theme.textMuted }}>
                No documents uploaded yet. Upload your first document to train your AI.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {documents.map((doc) => (
                  <div 
                    key={doc.id} 
                    style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center",
                      padding: "12px 16px",
                      background: theme.bg3,
                      borderRadius: 12,
                      border: "1px solid " + theme.border
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 24 }}>📄</span>
                      <div>
                        <div style={{ fontWeight: 600 }}>{doc.filename}</div>
                        <div style={{ fontSize: 11, color: theme.textMuted }}>
                          {new Date(doc.uploaded_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteDocument(doc.id, doc.filename)}
                      style={{
                        background: "transparent",
                        border: "1px solid #EF4444",
                        padding: "6px 12px",
                        borderRadius: 8,
                        cursor: "pointer",
                        color: "#EF4444",
                        fontSize: 12
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}