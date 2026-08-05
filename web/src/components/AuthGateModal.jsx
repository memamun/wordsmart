import React, { useEffect } from 'react';
import { FEATURE_NAMES, FEATURE_BENEFITS } from '../config/freemium.js';

/**
 * AuthGateModal — SaaS-style soft gate overlay.
 * Shows a blurred/dimmed backdrop over the view the user tried to access,
 * with a centered card asking them to sign in with Google.
 */
export default function AuthGateModal({ viewId, onGoogleSignIn, onDismiss }) {
  const featureName = FEATURE_NAMES[viewId] || 'this feature';
  const benefit = FEATURE_BENEFITS[viewId] || 'Sign in to unlock full access.';

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onDismiss(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onDismiss]);

  // Prevent background scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        // Soft-gate: blurred dimmed backdrop instead of solid black
        backdropFilter: 'blur(8px) brightness(0.45)',
        WebkitBackdropFilter: 'blur(8px) brightness(0.45)',
        backgroundColor: 'rgba(0,0,0,0.35)',
        animation: 'authGateFadeIn 0.2s ease',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onDismiss(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-gate-title"
    >
      <style>{`
        @keyframes authGateFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes authGateSlideUp {
          from { transform: translateY(24px) scale(0.97); opacity: 0; }
          to   { transform: translateY(0)    scale(1);    opacity: 1; }
        }
        .auth-gate-card {
          animation: authGateSlideUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        .auth-gate-google-btn:hover {
          transform: translateY(-2px);
          box-shadow: 4px 6px 0px var(--shadow-color) !important;
        }
        .auth-gate-google-btn:active {
          transform: translateY(1px);
          box-shadow: 1px 1px 0px var(--shadow-color) !important;
        }
        .auth-gate-dismiss:hover {
          text-decoration: underline;
          opacity: 1 !important;
        }
      `}</style>

      {/* Card */}
      <div
        className="auth-gate-card"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: 'var(--border-thick)',
          boxShadow: 'var(--shadow-main)',
          padding: '2.5rem 2rem 2rem',
          maxWidth: '420px',
          width: '100%',
          position: 'relative',
          textAlign: 'center',
        }}
      >
        {/* Lock badge */}
        <div style={{
          width: '56px',
          height: '56px',
          backgroundColor: 'var(--theme-yellow)',
          border: 'var(--border-thick)',
          boxShadow: 'var(--shadow-small)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem',
          fontSize: '1.75rem',
        }}>
          🔒
        </div>

        {/* Feature name pill */}
        <div style={{
          display: 'inline-block',
          backgroundColor: 'var(--theme-cyan)',
          border: 'var(--border-thin)',
          boxShadow: 'var(--shadow-tiny)',
          padding: '0.2rem 0.75rem',
          fontSize: '0.7rem',
          fontWeight: '900',
          fontFamily: 'var(--font-title)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--text-black)',
          marginBottom: '0.9rem',
        }}>
          {featureName}
        </div>

        {/* Headline */}
        <h2
          id="auth-gate-title"
          style={{
            fontFamily: 'var(--font-title)',
            fontWeight: '900',
            fontSize: '1.5rem',
            textTransform: 'uppercase',
            lineHeight: 1.1,
            color: 'var(--text-primary)',
            marginBottom: '0.65rem',
          }}
        >
          Unlock Free Access
        </h2>

        {/* Benefit copy */}
        <p style={{
          fontSize: '0.9rem',
          color: 'var(--text-muted)',
          lineHeight: 1.55,
          marginBottom: '1.75rem',
          maxWidth: '320px',
          margin: '0 auto 1.75rem',
        }}>
          {benefit}
          <br /><br />
          <strong style={{ color: 'var(--text-primary)' }}>It's completely free</strong> — just sign in with your Google account to save progress and unlock all features.
        </p>

        {/* Google Sign-in button */}
        <button
          className="auth-gate-google-btn"
          onClick={onGoogleSignIn}
          style={{
            width: '100%',
            padding: '0.85rem 1.25rem',
            backgroundColor: '#FFFFFF',
            border: 'var(--border-thick)',
            boxShadow: 'var(--shadow-small)',
            color: '#1F1F1F',
            fontWeight: '900',
            fontSize: '0.95rem',
            fontFamily: 'var(--font-title)',
            textTransform: 'uppercase',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.65rem',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            letterSpacing: '0.04em',
            marginBottom: '0.85rem',
            borderRadius: 'var(--radius-sm)'
          }}
        >
          {/* Google G logo SVG */}
          <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        {/* What's included chips */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.4rem',
          justifyContent: 'center',
          marginBottom: '1.25rem',
        }}>
          {['Progress sync', 'All 10 units', 'SM-2 reviews', 'Leaderboard'].map(perk => (
            <span key={perk} style={{
              backgroundColor: 'var(--theme-green)',
              border: 'var(--border-thin)',
              color: 'var(--text-black)',
              fontSize: '0.65rem',
              fontWeight: '900',
              padding: '0.15rem 0.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              ✓ {perk}
            </span>
          ))}
        </div>

        {/* Dismiss / continue as guest */}
        <button
          className="auth-gate-dismiss"
          onClick={onDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '0.78rem',
            cursor: 'pointer',
            opacity: 0.7,
            transition: 'opacity 0.15s',
            padding: '0.25rem',
          }}
        >
          Maybe later — continue as guest
        </button>
      </div>
    </div>
  );
}
