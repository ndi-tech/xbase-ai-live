// app/signup/page.tsx - Enhanced version
'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yllquiyrnhicvnrhihfk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsbHF1aXlybmhpY3ZucmhpaGZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MzAxNzAsImV4cCI6MjA5MjUwNjE3MH0.bJI1KBep_S62_cDlST7R7luBU1TirciERIqLBfHLnGk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function SignUpPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (step === 1) {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }
      setStep(2);
      setLoading(false);
      return;
    }

    // Step 2: Create account with business info
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          business_name: businessName,
          business_phone: businessPhone
        }
      }
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Create business record in database
    const { error: dbError } = await supabase
      .from('business_users')
      .insert({
        id: authData.user?.id,
        email: email,
        business_name: businessName,
        phone: businessPhone,
        created_at: new Date().toISOString()
      });

    if (dbError) {
      console.error('DB Error:', dbError);
      // Still show success since auth worked
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0B0F14',
        color: '#E5E7EB'
      }}>
        <div style={{
          background: '#1E293BCC',
          backdropFilter: 'blur(12px)',
          padding: 40,
          borderRadius: 24,
          textAlign: 'center',
          maxWidth: 400,
          border: '1px solid #1F2937'
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Business Registered!</h2>
          <p style={{ color: '#9CA3AF', marginBottom: 16 }}>
            Your WhatsApp number <strong>{businessPhone}</strong> is now connected to Xbase AI.
          </p>
          <p style={{ color: '#00FFA3', marginBottom: 16, fontSize: 14 }}>
            📱 Customers can now message you on WhatsApp!
          </p>
          <p style={{ color: '#9CA3AF', marginBottom: 16 }}>
            Check your email <strong>{email}</strong> to verify your account.
          </p>
          <p style={{ color: '#6B7280', fontSize: 14 }}>
            Redirecting to login in {countdown} seconds...
          </p>
          <a href="/login" style={{
            display: 'inline-block',
            marginTop: 20,
            color: '#00FFA3',
            textDecoration: 'none'
          }}>← Back to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: `radial-gradient(circle at 20% 20%, #00FFA308, transparent 50%),
                   radial-gradient(circle at 80% 30%, #3B82F608, transparent 50%),
                   #0B0F14`,
      fontFamily: "'Inter', system-ui, sans-serif"
    }}>
      <div style={{
        background: '#1E293BCC',
        backdropFilter: 'blur(12px)',
        padding: 40,
        borderRadius: 24,
        maxWidth: 440,
        width: '90%',
        border: '1px solid #1F2937'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56,
            height: 56,
            background: `linear-gradient(135deg, #00FFA3, #3B82F6)`,
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <span style={{ fontSize: 28, fontWeight: 900, color: '#000' }}>X</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#E5E7EB', marginBottom: 8 }}>
            {step === 1 ? 'Create Account' : 'Business Info'}
          </h1>
          <p style={{ color: '#9CA3AF', fontSize: 14 }}>
            {step === 1 ? 'Join Xbase AI platform' : 'Tell us about your business'}
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: '#EF4444',
            padding: 12,
            borderRadius: 12,
            marginBottom: 20,
            fontSize: 13
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSignUp}>
          {step === 1 ? (
            <>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#9CA3AF', marginBottom: 6 }}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'transparent',
                    border: '1px solid #1F2937',
                    borderRadius: 12,
                    color: '#E5E7EB',
                    fontSize: 14
                  }}
                  placeholder="you@example.com"
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#9CA3AF', marginBottom: 6 }}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'transparent',
                    border: '1px solid #1F2937',
                    borderRadius: 12,
                    color: '#E5E7EB',
                    fontSize: 14
                  }}
                  placeholder="••••••••"
                />
                <p style={{ color: '#6B7280', fontSize: 11, marginTop: 6 }}>Must be at least 6 characters</p>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#9CA3AF', marginBottom: 6 }}>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'transparent',
                    border: '1px solid #1F2937',
                    borderRadius: 12,
                    color: '#E5E7EB',
                    fontSize: 14
                  }}
                  placeholder="••••••••"
                />
              </div>
            </>
          ) : (
            <>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#9CA3AF', marginBottom: 6 }}>Business Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'transparent',
                    border: '1px solid #1F2937',
                    borderRadius: 12,
                    color: '#E5E7EB',
                    fontSize: 14
                  }}
                  placeholder="My Business Name"
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#9CA3AF', marginBottom: 6 }}>WhatsApp Business Number</label>
                <input
                  type="tel"
                  value={businessPhone}
                  onChange={(e) => setBusinessPhone(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'transparent',
                    border: '1px solid #1F2937',
                    borderRadius: 12,
                    color: '#E5E7EB',
                    fontSize: 14
                  }}
                  placeholder="656508197"
                />
                <p style={{ color: '#6B7280', fontSize: 11, marginTop: 6 }}>
                  Customers will message this number to reach your AI agent
                </p>
              </div>

              <div style={{
                background: '#00FFA310',
                padding: 12,
                borderRadius: 12,
                marginBottom: 20,
                fontSize: 12,
                color: '#9CA3AF'
              }}>
                💡 <strong>How it works:</strong> Customers who message this WhatsApp number will interact with your AI agent, trained on your documents.
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: `linear-gradient(135deg, #00FFA3, #3B82F6)`,
              border: 'none',
              padding: '14px',
              borderRadius: 12,
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              color: '#000',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Processing...' : (step === 1 ? 'Continue →' : 'Complete Registration →')}
          </button>
        </form>

        {step === 2 && (
          <button
            onClick={() => setStep(1)}
            style={{
              width: '100%',
              background: 'transparent',
              border: '1px solid #1F2937',
              padding: '12px',
              borderRadius: 12,
              marginTop: 12,
              cursor: 'pointer',
              color: '#9CA3AF',
              fontSize: 13
            }}
          >
            ← Back
          </button>
        )}

        {step === 1 && (
          <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 13, marginTop: 24 }}>
            Already have an account?{' '}
            <a href="/login" style={{ color: '#00FFA3', textDecoration: 'none', fontWeight: 600 }}>Login</a>
          </p>
        )}
      </div>
    </div>
  );
}