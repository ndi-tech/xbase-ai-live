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
  const [w, setW] = useState<number>(typeof window !== "undefined" ? window.innerWidth : 1280);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return w;
}

export default function SettingsPage() {
  const width = useWidth();
  const isMobile = width < 1024;
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [business, setBusiness] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState<"success" | "error">("success");
  const [isUpdating, setIsUpdating] = useState(false);

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
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/login";
        return;
      }
      setUser(user);
      
      // Get business info from database
      const { data: businessData } = await supabase
        .from('business_users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setBusiness(businessData);
      setLoading(false);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const toggleTheme = () => setIsDark(!isDark);

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification(message);
    setNotificationType(type);
    setTimeout(() => setNotification(""), 5000);
  };

  // Update Full Name
  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUpdating(true);
    const formData = new FormData(e.currentTarget);
    const fullName = formData.get("fullName") as string;
    
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName }
    });
    
    if (!error) {
      setUser({ ...user, user_metadata: { ...user.user_metadata, full_name: fullName } });
      showNotification("✅ Profile updated successfully!");
    } else {
      showNotification("❌ Error updating profile: " + error.message, "error");
    }
    setIsUpdating(false);
  };

  // Update Business Info
  const handleUpdateBusiness = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUpdating(true);
    const formData = new FormData(e.currentTarget);
    const businessName = formData.get("businessName") as string;
    const businessPhone = formData.get("businessPhone") as string;
    
    const { error } = await supabase
      .from('business_users')
      .update({
        business_name: businessName,
        phone: businessPhone,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);
    
    if (!error) {
      setBusiness({ ...business, business_name: businessName, phone: businessPhone });
      showNotification("✅ Business information updated successfully!");
    } else {
      showNotification("❌ Error updating business: " + error.message, "error");
    }
    setIsUpdating(false);
  };

  // Update Email
  const handleUpdateEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUpdating(true);
    const formData = new FormData(e.currentTarget);
    const newEmail = formData.get("newEmail") as string;
    const password = formData.get("password") as string;
    
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: password,
    });
    
    if (signInError) {
      showNotification("❌ Incorrect password", "error");
      setIsUpdating(false);
      return;
    }
    
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    
    if (!error) {
      showNotification(
        "📧 Confirmation email sent! Please check your NEW email inbox and click the confirmation link.",
        "success"
      );
      e.currentTarget.reset();
    } else {
      showNotification("❌ Error updating email: " + error.message, "error");
    }
    setIsUpdating(false);
  };

  // Update Password
  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUpdating(true);
    const formData = new FormData(e.currentTarget);
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    
    if (newPassword !== confirmPassword) {
      showNotification("❌ New passwords do not match", "error");
      setIsUpdating(false);
      return;
    }
    
    if (newPassword.length < 6) {
      showNotification("❌ Password must be at least 6 characters", "error");
      setIsUpdating(false);
      return;
    }
    
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    
    if (signInError) {
      showNotification("❌ Current password is incorrect", "error");
      setIsUpdating(false);
      return;
    }
    
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    
    if (!error) {
      showNotification("🔒 Password updated successfully!", "success");
      e.currentTarget.reset();
    } else {
      showNotification("❌ Error updating password: " + error.message, "error");
    }
    setIsUpdating(false);
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
          <p style={{ marginTop: 16, color: theme.textSub }}>Loading Settings...</p>
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
        activeNav="Settings" 
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
          <div style={{ 
            background: theme.bg2, 
            borderRadius: 20, 
            padding: 24, 
            marginBottom: 24, 
            border: "1px solid " + theme.border 
          }}>
            <h1 style={{ fontSize: 28, fontWeight: 800 }}>⚙️ Settings</h1>
            <p style={{ color: theme.textSub }}>Manage your account and business preferences</p>
          </div>

          {notification && (
            <div style={{ 
              background: notificationType === "success" ? theme.accentDim : "#EF444420",
              color: notificationType === "success" ? "#000" : "#EF4444", 
              padding: 12, 
              borderRadius: 10, 
              marginBottom: 20, 
              textAlign: "center",
              fontWeight: 500,
              fontSize: 14
            }}>
              {notification}
            </div>
          )}

          {/* Business Information */}
          <div style={{ 
            background: theme.bg2, 
            borderRadius: 20, 
            padding: 24, 
            marginBottom: 24, 
            border: "1px solid " + theme.border 
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>🏢 Business Information</h2>
            <form onSubmit={handleUpdateBusiness}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", marginBottom: 8, color: theme.textSub }}>Business Name</label>
                <input 
                  type="text" 
                  name="businessName"
                  defaultValue={business?.business_name || ""} 
                  placeholder="Enter your business name"
                  style={{ 
                    width: "100%", 
                    padding: 12, 
                    background: theme.bg3, 
                    border: "1px solid " + theme.border, 
                    borderRadius: 10, 
                    color: theme.text 
                  }} 
                />
              </div>
              
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", marginBottom: 8, color: theme.textSub }}>WhatsApp Business Number</label>
                <input 
                  type="tel" 
                  name="businessPhone"
                  defaultValue={business?.phone || ""} 
                  placeholder="e.g., 656508197"
                  style={{ 
                    width: "100%", 
                    padding: 12, 
                    background: theme.bg3, 
                    border: "1px solid " + theme.border, 
                    borderRadius: 10, 
                    color: theme.text 
                  }} 
                />
                <p style={{ fontSize: 12, color: theme.textMuted, marginTop: 4 }}>
                  Customers will message this number to interact with your AI agent
                </p>
              </div>
              
              <button 
                type="submit" 
                disabled={isUpdating}
                style={{ 
                  padding: "12px 24px", 
                  background: `linear-gradient(135deg, ${theme.accent}, ${theme.secondary})`, 
                  border: "none", 
                  borderRadius: 10, 
                  fontWeight: 600, 
                  cursor: isUpdating ? "not-allowed" : "pointer", 
                  color: "#000",
                  opacity: isUpdating ? 0.7 : 1
                }}
              >
                {isUpdating ? "Updating..." : "Update Business Info"}
              </button>
            </form>
          </div>

          {/* Profile Information */}
          <div style={{ 
            background: theme.bg2, 
            borderRadius: 20, 
            padding: 24, 
            marginBottom: 24, 
            border: "1px solid " + theme.border 
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>👤 Profile Information</h2>
            <form onSubmit={handleUpdateProfile}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", marginBottom: 8, color: theme.textSub }}>Email Address</label>
                <input 
                  type="email" 
                  value={user?.email || ""} 
                  disabled 
                  style={{ 
                    width: "100%", 
                    padding: 12, 
                    background: theme.bg3, 
                    border: "1px solid " + theme.border, 
                    borderRadius: 10, 
                    color: theme.textMuted,
                    cursor: "not-allowed"
                  }} 
                />
                <p style={{ fontSize: 12, color: theme.textMuted, marginTop: 4 }}>Use "Change Email" below to update (requires confirmation)</p>
              </div>
              
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", marginBottom: 8, color: theme.textSub }}>Full Name</label>
                <input 
                  type="text" 
                  name="fullName"
                  defaultValue={user?.user_metadata?.full_name || ""} 
                  placeholder="Enter your full name"
                  style={{ 
                    width: "100%", 
                    padding: 12, 
                    background: theme.bg3, 
                    border: "1px solid " + theme.border, 
                    borderRadius: 10, 
                    color: theme.text 
                  }} 
                />
              </div>
              
              <button 
                type="submit" 
                disabled={isUpdating}
                style={{ 
                  padding: "12px 24px", 
                  background: `linear-gradient(135deg, ${theme.accent}, ${theme.secondary})`, 
                  border: "none", 
                  borderRadius: 10, 
                  fontWeight: 600, 
                  cursor: isUpdating ? "not-allowed" : "pointer", 
                  color: "#000",
                  opacity: isUpdating ? 0.7 : 1
                }}
              >
                {isUpdating ? "Updating..." : "Save Changes"}
              </button>
            </form>
          </div>

          {/* Change Email */}
          <div style={{ 
            background: theme.bg2, 
            borderRadius: 20, 
            padding: 24, 
            marginBottom: 24, 
            border: "1px solid " + theme.border 
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>📧 Change Email</h2>
            <form onSubmit={handleUpdateEmail}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", marginBottom: 8, color: theme.textSub }}>New Email Address</label>
                <input 
                  type="email" 
                  name="newEmail"
                  required
                  placeholder="Enter new email address"
                  style={{ 
                    width: "100%", 
                    padding: 12, 
                    background: theme.bg3, 
                    border: "1px solid " + theme.border, 
                    borderRadius: 10, 
                    color: theme.text 
                  }} 
                />
              </div>
              
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", marginBottom: 8, color: theme.textSub }}>Current Password (required)</label>
                <input 
                  type="password" 
                  name="password"
                  required
                  placeholder="Enter your current password"
                  style={{ 
                    width: "100%", 
                    padding: 12, 
                    background: theme.bg3, 
                    border: "1px solid " + theme.border, 
                    borderRadius: 10, 
                    color: theme.text 
                  }} 
                />
              </div>
              
              <button 
                type="submit" 
                disabled={isUpdating}
                style={{ 
                  padding: "12px 24px", 
                  background: `linear-gradient(135deg, ${theme.accent}, ${theme.secondary})`, 
                  border: "none", 
                  borderRadius: 10, 
                  fontWeight: 600, 
                  cursor: isUpdating ? "not-allowed" : "pointer", 
                  color: "#000",
                  opacity: isUpdating ? 0.7 : 1
                }}
              >
                {isUpdating ? "Sending Confirmation..." : "Send Confirmation Email"}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div style={{ 
            background: theme.bg2, 
            borderRadius: 20, 
            padding: 24, 
            marginBottom: 24, 
            border: "1px solid " + theme.border 
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>🔒 Change Password</h2>
            <form onSubmit={handleUpdatePassword}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", marginBottom: 8, color: theme.textSub }}>Current Password</label>
                <input 
                  type="password" 
                  name="currentPassword"
                  required
                  placeholder="Enter current password"
                  style={{ 
                    width: "100%", 
                    padding: 12, 
                    background: theme.bg3, 
                    border: "1px solid " + theme.border, 
                    borderRadius: 10, 
                    color: theme.text 
                  }} 
                />
              </div>
              
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", marginBottom: 8, color: theme.textSub }}>New Password</label>
                <input 
                  type="password" 
                  name="newPassword"
                  required
                  minLength={6}
                  placeholder="Enter new password (min 6 characters)"
                  style={{ 
                    width: "100%", 
                    padding: 12, 
                    background: theme.bg3, 
                    border: "1px solid " + theme.border, 
                    borderRadius: 10, 
                    color: theme.text 
                  }} 
                />
              </div>
              
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", marginBottom: 8, color: theme.textSub }}>Confirm New Password</label>
                <input 
                  type="password" 
                  name="confirmPassword"
                  required
                  placeholder="Confirm new password"
                  style={{ 
                    width: "100%", 
                    padding: 12, 
                    background: theme.bg3, 
                    border: "1px solid " + theme.border, 
                    borderRadius: 10, 
                    color: theme.text 
                  }} 
                />
              </div>
              
              <button 
                type="submit" 
                disabled={isUpdating}
                style={{ 
                  padding: "12px 24px", 
                  background: `linear-gradient(135deg, ${theme.accent}, ${theme.secondary})`, 
                  border: "none", 
                  borderRadius: 10, 
                  fontWeight: 600, 
                  cursor: isUpdating ? "not-allowed" : "pointer", 
                  color: "#000",
                  opacity: isUpdating ? 0.7 : 1
                }}
              >
                {isUpdating ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>

          {/* Appearance */}
          <div style={{ 
            background: theme.bg2, 
            borderRadius: 20, 
            padding: 24, 
            marginBottom: 24, 
            border: "1px solid " + theme.border 
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>🎨 Appearance</h2>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Theme</div>
                <p style={{ fontSize: 14, color: theme.textSub }}>Switch between dark and light mode</p>
              </div>
              <button 
                onClick={toggleTheme} 
                style={{ 
                  padding: "10px 20px", 
                  background: theme.bg3, 
                  border: "1px solid " + theme.border, 
                  borderRadius: 10, 
                  cursor: "pointer", 
                  color: theme.text,
                  display: "flex",
                  alignItems: "center",
                  gap: 8
                }}
              >
                {isDark ? "🌙 Dark" : "☀️ Light"}
              </button>
            </div>
          </div>

          {/* Account */}
          <div style={{ 
            background: theme.bg2, 
            borderRadius: 20, 
            padding: 24, 
            marginBottom: 24, 
            border: "1px solid " + theme.border 
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>🚪 Account</h2>
            <button 
              onClick={handleLogout} 
              style={{ 
                padding: "12px 24px", 
                background: "transparent", 
                border: "1px solid #EF4444", 
                borderRadius: 10, 
                cursor: "pointer", 
                color: "#EF4444",
                fontWeight: 600
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

