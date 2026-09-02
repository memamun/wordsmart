import React, { useState } from 'react';
import { 
  Trophy, 
  Layers, 
  Award, 
  Compass, 
  ChevronRight, 
  Sparkles,
  RotateCcw,
  Search,
  BookOpenCheck,
  X,
  Brain,
  Zap,
  Puzzle,
  GraduationCap,
  Clock,
  Book,
  Star,
  Library,
  PanelLeftClose,
  PanelLeftOpen,
  Lock
} from 'lucide-react';
import { PREP_STAGES } from '../hooks/useGameState';
import { isViewFree } from '../config/freemium.js';

export default function Sidebar({ 
  activeView, 
  setActiveView, 
  state, 
  wordsData, 
  sidebarOpen, 
  setSidebarOpen,
  sidebarCollapsed,
  setSidebarCollapsed,
  setShowResetConfirm,
  user,
  authLoading,
  onGoogleSignIn,
  onSignOut
}) {
  const currentStage = PREP_STAGES.find(s => s.id === state.unlockedLevel) || PREP_STAGES[0];
  const [isResetHovered, setIsResetHovered] = useState(false);

  const [isMobile, setIsMobile] = React.useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mobile navigation drawer is ALWAYS expanded so all text labels and category headers are visible
  const isCollapsed = isMobile ? false : sidebarCollapsed;

  // Touch Gesture State to swipe close the sidebar on mobile
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);

  const handleTouchStart = (e) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    // If swiped left by more than 80px, close the sidebar drawer
    if (touchStartX - touchEndX > 80) {
      setSidebarOpen(false);
    }
  };

  const categories = [
    {
      title: "Core Path",
      items: [
        { id: 'dashboard', label: 'Prep Roadmap', icon: Compass },
        { id: 'flashcards', label: 'Flashcard Quest', icon: Layers },
        { id: 'review', label: 'SM-2 Review Deck', icon: Brain },
        { id: 'stories', label: 'Contextual Stories', icon: BookOpenCheck },
      ]
    },
    {
      title: "Practice Arena",
      items: [
        { id: 'quizzes', label: 'Qualification MCQs', icon: Award },
        { id: 'vocabdrills', label: 'Vocab Drills', icon: Zap },
        { id: 'quickmatch', label: 'Quick Match', icon: Puzzle },
        { id: 'advanced', label: 'Advanced Quizzes', icon: GraduationCap },
        { id: 'timeblitz', label: 'Time Blitz', icon: Clock },
      ]
    },
    {
      title: "Resources & Stats",
      items: [
        { id: 'search', label: 'Dictionary Portal', icon: Search },
        { id: 'specialized', label: 'Specialized Vocabs', icon: Book },
        { id: 'hitparades', label: 'Hit Parades', icon: Star },
        { id: 'allquizzes', label: 'Quiz Library', icon: Library },
        { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
      ]
    }
  ];

  return (
    <aside 
      className={`sidebar-nav ${sidebarOpen ? 'open' : ''} ${isCollapsed ? 'collapsed no-scrollbar' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Brand Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: isCollapsed ? 'center' : 'space-between', 
        marginBottom: '1.25rem', 
        padding: '0 0.25rem' 
      }}>
        <div 
          onClick={() => {
            setActiveView('landing');
            if (setSidebarOpen) setSidebarOpen(false);
          }}
          className="brand-logo-container" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}
        >
          <div style={{
            width: '36px',
            height: '36px',
            backgroundColor: 'var(--theme-yellow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'var(--border-thin)',
            boxShadow: 'var(--shadow-tiny)',
            flexShrink: 0
          }} title="WordSmart Welcome">
            <Sparkles size={20} color="var(--text-black)" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-title)', fontWeight: '900', lineHeight: '1.1', textTransform: 'uppercase', color: 'var(--text-primary)' }}>WordSmart</h2>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '900', letterSpacing: '0.05em' }}>
                SASS VOCAB MASTERY
              </span>
            </div>
          )}
        </div>

        {/* Collapse Toggle Button (Desktop Only) */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="desktop-collapse-btn"
          style={{
            width: '36px',
            height: '36px',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: 'var(--border-thin)',
            boxShadow: 'var(--shadow-tiny)',
            cursor: 'pointer',
            padding: 0,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            color: 'var(--text-primary)'
          }}
          title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {sidebarCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
        </button>

        {/* Close Button on Mobile Drawer */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="mobile-close-btn min-touch"
          aria-label="Close navigation menu"
          style={{
            display: 'none',
            backgroundColor: 'var(--bg-surface)',
            border: 'var(--border-thin)',
            boxShadow: 'var(--shadow-one)',
            cursor: 'pointer',
            padding: '2px'
          }}
        >
          <X size={18} color="var(--text-primary)" />
        </button>
      </div>

      {/* User Profile / Auth Block */}
      {!isCollapsed && (
        <div style={{ marginBottom: '1.25rem' }}>
          {authLoading ? (
            // Loading skeleton
            <div style={{
              padding: '0.6rem 0.85rem',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: 'var(--border-thin)',
              boxShadow: 'var(--shadow-small)',
              opacity: 0.5
            }}>
              <div style={{ height: '12px', background: 'var(--bg-canvas)', borderRadius: '4px', width: '60%' }} />
            </div>
          ) : user ? (
            // Logged-in: show profile card
            <div style={{
              padding: '0.65rem 0.85rem',
              backgroundColor: 'var(--theme-cyan)',
              border: 'var(--border-thin)',
              boxShadow: 'var(--shadow-small)',
              color: 'var(--text-black)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    referrerPolicy="no-referrer"
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      border: 'var(--border-thin)',
                      flexShrink: 0
                    }}
                  />
                ) : (
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--theme-yellow)',
                    border: 'var(--border-thin)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '900',
                    fontSize: '1rem',
                    flexShrink: 0
                  }}>
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontWeight: '900', fontSize: '0.8rem', fontFamily: 'var(--font-title)', textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.displayName || 'User'}
                  </div>
                  <div style={{ fontSize: '0.65rem', fontWeight: '700', opacity: 0.75, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.email}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Guest: show Sign in with Google button
            <button
              onClick={onGoogleSignIn}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                backgroundColor: '#FFFFFF',
                border: 'var(--border-thick)',
                boxShadow: 'var(--shadow-small)',
                color: '#1F1F1F',
                fontWeight: '900',
                fontSize: '0.8rem',
                fontFamily: 'var(--font-title)',
                textTransform: 'uppercase',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                textAlign: 'left',
                borderRadius: 'var(--radius-sm)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Sign in with Google</span>
            </button>
          )}
        </div>
      )}

      {/* Navigation Menu */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: isCollapsed ? '0.6rem' : '0.85rem', marginBottom: '1.5rem' }}>
        {categories.map((cat, catIdx) => (
          <div key={catIdx} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {!isCollapsed ? (
              <h3 style={{ 
                fontSize: '0.7rem', 
                color: 'var(--text-muted)', 
                fontWeight: '900', 
                textTransform: 'uppercase', 
                letterSpacing: '0.1em',
                marginBottom: '0.15rem',
                paddingLeft: '0.3rem'
              }}>
                {cat.title}
              </h3>
            ) : (
              catIdx > 0 && <hr style={{ borderTop: '2px solid var(--bg-surface-elevated)', margin: '0.25rem 0', opacity: 0.5 }} />
            )}
            
            <div className="sidebar-items-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {cat.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                const isFree = isViewFree(item.id);
                const isLocked = !isFree && !user && item.id !== 'flashcards';
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveView(item.id);
                    }}
                    title={isLocked ? `Sign in to unlock ${item.label}` : item.label}
                    className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: isCollapsed ? 'center' : 'space-between',
                      width: isCollapsed ? '42px' : '100%',
                      height: isCollapsed ? '42px' : 'auto',
                      margin: isCollapsed ? '0.2rem auto' : '0',
                      padding: isCollapsed ? '0' : '0.45rem 0.85rem',
                      
                      // Background
                      backgroundColor: isActive ? 'var(--theme-cyan)' : 'transparent',
                      
                      // Border: ensure clean neobrutalist outline on active/hover
                      border: isActive ? 'var(--border-thin)' : '2px solid transparent',
                      
                      // Shadow: ensure clean offset drop shadow on active
                      boxShadow: isActive ? 'var(--shadow-tiny)' : 'none',
                      
                      // Perfectly circular in collapsed mode, pill in expanded mode
                      borderRadius: isCollapsed ? '50%' : '9999px',
                      
                      // Text / Icon color
                      color: isActive ? 'var(--text-black)' : isLocked ? 'var(--text-muted)' : 'var(--text-secondary)',
                      opacity: isLocked ? 0.7 : 1,
                      
                      cursor: 'pointer',
                      fontFamily: 'var(--font-body)',
                      fontWeight: isActive ? '900' : '700',
                      fontSize: '0.85rem',
                      transition: 'all 0.12s ease',
                      textAlign: 'left',
                      position: 'relative',
                      flexShrink: 0
                    }}
                    onMouseOver={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = isLocked ? 'var(--bg-surface)' : 'var(--bg-surface-elevated)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                        e.currentTarget.style.opacity = '1';
                        e.currentTarget.style.border = 'var(--border-thin)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-tiny)';
                        e.currentTarget.style.borderRadius = isCollapsed ? '50%' : '9999px';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.border = '2px solid transparent';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.borderRadius = isCollapsed ? '50%' : '9999px';
                        e.currentTarget.style.color = isLocked ? 'var(--text-muted)' : 'var(--text-secondary)';
                        e.currentTarget.style.opacity = isLocked ? '0.7' : '1';
                      }
                    }}
                  >
                    <div 
                      className="item-content" 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: isCollapsed ? 'center' : 'flex-start',
                        gap: isCollapsed ? '0' : '0.55rem', 
                        flex: isCollapsed ? 'none' : 1, 
                        width: isCollapsed ? '100%' : 'auto',
                        height: isCollapsed ? '100%' : 'auto',
                        minWidth: 0 
                      }}
                    >
                      <Icon size={isCollapsed ? 19 : 20} style={{ minWidth: isCollapsed ? '19px' : '20px', flexShrink: 0 }} />
                      {!isCollapsed && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>}
                    </div>
                    {/* Lock badge for premium items when guest (expanded mode only) */}
                    {isLocked && !isCollapsed && (
                      <Lock size={11} style={{ flexShrink: 0, opacity: 0.6, marginLeft: '0.25rem' }} />
                    )}
                    {!isCollapsed && isActive && !isLocked && <ChevronRight size={12} className="item-chevron" color="var(--text-black)" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom action row: Start Fresh + Sign Out (if logged in) */}
      <div style={{
        display: 'flex',
        gap: '0.4rem',
        marginTop: 'auto',
        flexShrink: 0
      }}>
        <button 
          onClick={() => {
            if (isCollapsed) {
              setSidebarCollapsed(false);
            }
            setShowResetConfirm(true);
          }}
          onMouseEnter={() => setIsResetHovered(true)}
          onMouseLeave={() => setIsResetHovered(false)}
          className="reset-btn"
          title="Start Fresh"
          style={{
            flexGrow: isCollapsed ? 0 : 1,
            flexBasis: isCollapsed ? 'auto' : 0,
            width: isCollapsed ? '40px' : 'auto',
            height: isCollapsed ? '40px' : 'auto',
            padding: isCollapsed ? '0' : '0.45rem 0.65rem',
            fontSize: '0.75rem',
            fontWeight: '900',
            backgroundColor: isResetHovered ? 'var(--text-black)' : 'var(--theme-yellow)',
            border: 'var(--border-thin)',
            color: isResetHovered ? 'var(--theme-yellow)' : 'var(--text-black)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem',
            marginRight: isCollapsed ? 'auto' : '0',
            marginLeft: isCollapsed ? 'auto' : '0',
            boxShadow: 'var(--shadow-tiny)',
            borderRadius: isCollapsed ? '50%' : '9999px',
            flexShrink: 0,
            transition: 'all 0.15s ease'
          }}
        >
          <RotateCcw size={14} />
          {!isCollapsed && <span>Start Fresh</span>}
        </button>

        {/* Sign Out button — only shown when logged in and sidebar is expanded */}
        {!isCollapsed && user && (
          <button
            onClick={onSignOut}
            title="Sign Out"
            style={{
              padding: '0.45rem 0.65rem',
              fontSize: '0.75rem',
              fontWeight: '900',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: 'var(--border-thin)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              boxShadow: 'var(--shadow-tiny)',
              borderRadius: '9999px',
              flexShrink: 0,
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap'
            }}
          >
            Sign Out
          </button>
        )}
      </div>
    </aside>
  );
}
