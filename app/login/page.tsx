'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yllquiyrnhicvnrhihfk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsbHF1aXlybmhpY3ZucmhpaGZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MzAxNzAsImV4cCI6MjA5MjUwNjE3MH0.bJI1KBep_S62_cDlST7R7luBU1TirciERIqLBfHLnGk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Theme Colors
const darkTheme = {
  bg: '#0B0F14',
  bg2: '#0F172A',
  border: '#1F2937',
  accent: '#00FFA3',
  secondary: '#3B82F6',
  text: '#E5E7EB',
  textSub: '#9CA3AF',
  cardBg: '#1E293BCC',
};

const lightTheme = {
  bg: '#F0FDF4',
  bg2: '#FFFFFF',
  border: '#D1D5DB',
  accent: '#059669',
  secondary: '#2563EB',
  text: '#1F2937',
  textSub: '#4B5563',
  cardBg: '#FFFFFFCC',
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDark, setIsDark] = useState(true);

  const theme = isDark ? darkTheme : lightTheme;

  useEffect(() => {
    const savedTheme = localStorage.getItem('xbase_theme');
    if (savedTheme === 'light') setIsDark(false);
    if (savedTheme === 'dark') setIsDark(true);
  }, []);

  const toggleTheme = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    localStorage.setItem('xbase_theme', newMode ? 'dark' : 'light');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      window.location.href = '/dashboard';
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: `radial-gradient(circle at 20% 20%, ${theme.accent}08, transparent 50%),
                   radial-gradient(circle at 80% 30%, ${theme.secondary}08, transparent 50%),
                   ${theme.bg}`,
      fontFamily: "'Inter', system-ui, sans-serif"
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .glass-card {
          backdrop-filter: blur(12px);
          background: ${theme.cardBg};
          border: 1px solid ${theme.border};
        }
      `}</style>

      {/* Theme Toggle Button - Top Right */}
      <button
        onClick={toggleTheme}
        style={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 100,
          padding: '10px 16px',
          background: theme.cardBg,
          border: `1px solid ${theme.border}`,
          borderRadius: 30,
          cursor: 'pointer',
          color: theme.text,
          fontSize: 14,
          fontWeight: 500,
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}
      >
        <span>{isDark ? 'â˜€ï¸' : 'ðŸŒ™'}</span>
        <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
      </button>

      {/* Login Card */}
      <div className="glass-card" style={{
        padding: 40,
        borderRadius: 24,
        maxWidth: 440,
        width: '90%',
        margin: '20px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56,
            height: 56,
            background: `linear-gradient(135deg, ${theme.accent}, ${theme.secondary})`,
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <span style={{ fontSize: 28, fontWeight: 900, color: '#000' }}>X</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: theme.text, marginBottom: 8 }}>
            Xbase AI
          </h1>
          <p style={{ color: theme.textSub, fontSize: 14 }}>Login to your dashboard</p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#EF4444',
            padding: 12,
            borderRadius: 12,
            marginBottom: 20,
            fontSize: 13
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 500,
              color: theme.textSub,
              marginBottom: 6
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'transparent',
                border: `1px solid ${theme.border}`,
                borderRadius: 12,
                color: theme.text,
                fontSize: 14,
                outline: 'none',
                transition: 'all 0.2s'
              }}
              placeholder="you@example.com"
              onFocus={(e) => e.target.style.borderColor = theme.accent}
              onBlur={(e) => e.target.style.borderColor = theme.border}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 500,
              color: theme.textSub,
              marginBottom: 6
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'transparent',
                border: `1px solid ${theme.border}`,
                borderRadius: 12,
                color: theme.text,
                fontSize: 14,
                outline: 'none',
                transition: 'all 0.2s'
              }}
              placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
              onFocus={(e) => e.target.style.borderColor = theme.accent}
              onBlur={(e) => e.target.style.borderColor = theme.border}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: `linear-gradient(135deg, ${theme.accent}, ${theme.secondary})`,
              border: 'none',
              padding: '14px',
              borderRadius: 12,
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              color: '#000',
              opacity: loading ? 0.6 : 1,
              transition: 'opacity 0.2s'
            }}
          >
            {loading ? 'Logging in...' : 'Login â†’'}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          color: theme.textSub,
          fontSize: 13,
          marginTop: 24
        }}>
          Don't have an account?{' '}
          <a href="/signup" style={{
            color: theme.accent,
            textDecoration: 'none',
            fontWeight: 600
          }}>
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}


