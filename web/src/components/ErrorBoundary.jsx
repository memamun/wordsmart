import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

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
          background: 'var(--bg-canvas)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-body)',
          padding: '2rem',
          textAlign: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--theme-yellow), var(--theme-red))',
            border: 'var(--border-thick)',
            boxShadow: 'var(--shadow-small)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AlertTriangle size={32} color="#000" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-title)', fontSize: '1.5rem' }}>Something went wrong</h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', lineHeight: '1.5', fontSize: '0.9rem' }}>
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
            style={{ gap: '0.4rem' }}
          >
            <RefreshCw size={16} /> Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
