import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'hsl(224, 45%, 6%)',
          color: 'hsl(220, 20%, 98%)',
          fontFamily: 'Inter, sans-serif',
          padding: '2rem',
          textAlign: 'center',
          gap: '1rem'
        }}>
          <span style={{ fontSize: '4rem' }}>⚠️</span>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem' }}>Something went wrong</h1>
          <p style={{ color: 'hsl(220, 15%, 78%)', maxWidth: '480px', lineHeight: '1.5', fontSize: '0.9rem' }}>
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, hsl(155, 85%, 48%) 0%, hsl(160, 80%, 40%) 100%)',
              color: 'hsl(224, 45%, 6%)',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
