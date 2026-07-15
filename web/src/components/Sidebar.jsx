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
  PanelLeftOpen
} from 'lucide-react';
import { PREP_STAGES } from '../hooks/useGameState';

export default function Sidebar({ 
  activeView, 
  setActiveView, 
  state, 
  wordsData, 
  sidebarOpen, 
  setSidebarOpen,
  sidebarCollapsed,
  setSidebarCollapsed,
  setShowResetConfirm
}) {
  const currentStage = PREP_STAGES.find(s => s.id === state.unlockedLevel) || PREP_STAGES[0];
  const [isResetHovered, setIsResetHovered] = useState(false);

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
      className={`sidebar-nav ${sidebarOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Brand Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: sidebarCollapsed ? 'center' : 'space-between', 
        marginBottom: '1.25rem', 
        padding: '0 0.25rem' 
      }}>
        <div className="brand-logo-container" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
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
          }} title="WordSmart">
            <Sparkles size={20} color="var(--text-black)" />
          </div>
          {!sidebarCollapsed && (
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

      {/* User Mini Profile - Neobrutalist Block */}
      {!sidebarCollapsed && (
        <div style={{
          padding: '0.6rem 0.85rem',
          backgroundColor: 'var(--theme-red)',
          border: 'var(--border-thin)',
          boxShadow: 'var(--shadow-small)',
          marginBottom: '1.25rem',
          color: 'var(--text-black)'
        }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-black)', fontWeight: '900', textTransform: 'uppercase', marginBottom: '0.15rem' }}>
            Current Stage
          </div>
          <div style={{ 
            fontFamily: 'var(--font-title)', 
            fontWeight: '900', 
            fontSize: '0.95rem', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '160px', textTransform: 'uppercase' }}>{currentStage.name}</span>
            <span>Lvl {state.unlockedLevel}</span>
          </div>
          <div style={{ marginTop: '0.4rem', height: '10px', backgroundColor: 'var(--bg-surface)', border: 'var(--border-thin)', overflow: 'hidden' }}>
            <div style={{ 
              height: '100%', 
              width: `${(state.unlockedLevel / 10) * 100}%`, 
              backgroundColor: 'var(--theme-green)',
              transition: 'var(--transition-normal)'
            }}></div>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: sidebarCollapsed ? '0.6rem' : '0.85rem', marginBottom: '1.5rem' }}>
        {categories.map((cat, catIdx) => (
          <div key={catIdx} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {!sidebarCollapsed ? (
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
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveView(item.id);
                      setSidebarOpen(false); // Close sidebar drawer on mobile after selection
                    }}
                    title={item.label}
                    className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: sidebarCollapsed ? 'center' : 'space-between',
                      width: sidebarCollapsed ? '40px' : '100%',
                      height: sidebarCollapsed ? '40px' : 'auto',
                      margin: sidebarCollapsed ? '0.15rem auto' : '0',
                      padding: sidebarCollapsed ? '0' : '0.45rem 0.85rem',
                      
                      // Background
                      backgroundColor: isActive ? 'var(--theme-cyan)' : 'transparent',
                      
                      // Border
                      border: isActive 
                        ? (sidebarCollapsed ? '2px solid transparent' : 'var(--border-thin)') 
                        : '2px solid transparent',
                      
                      // Shadow
                      boxShadow: isActive 
                        ? (sidebarCollapsed ? 'none' : 'var(--shadow-tiny)') 
                        : 'none',
                      
                      // Pill shape corners
                      borderRadius: sidebarCollapsed ? '50%' : '9999px',
                      
                      // Text / Icon color
                      color: isActive ? 'var(--text-black)' : 'var(--text-secondary)',
                      
                      cursor: 'pointer',
                      fontFamily: 'var(--font-body)',
                      fontWeight: isActive ? '900' : '700',
                      fontSize: '0.85rem',
                      transition: 'all 0.1s ease',
                      textAlign: 'left'
                    }}
                    onMouseOver={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                        if (sidebarCollapsed) {
                          e.currentTarget.style.borderRadius = '50%';
                        } else {
                          e.currentTarget.style.borderRadius = '9999px';
                          e.currentTarget.style.border = 'var(--border-thin)';
                          e.currentTarget.style.boxShadow = 'var(--shadow-tiny)';
                        }
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.border = '2px solid transparent';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.borderRadius = sidebarCollapsed ? '50%' : '9999px';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }
                    }}
                  >
                    <div className="item-content" style={{ display: 'flex', alignItems: 'center', gap: sidebarCollapsed ? '0' : '0.55rem' }}>
                      <Icon size={20} style={{ minWidth: '20px' }} />
                      {!sidebarCollapsed && <span>{item.label}</span>}
                    </div>
                    {!sidebarCollapsed && isActive && <ChevronRight size={12} className="item-chevron" color="var(--text-black)" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Reset Progress */}
      <button 
        onClick={() => {
          if (sidebarCollapsed) {
            setSidebarCollapsed(false);
          }
          setShowResetConfirm(true); // Triggers the global modal in App.jsx
        }}
        onMouseEnter={() => setIsResetHovered(true)}
        onMouseLeave={() => setIsResetHovered(false)}
        className="reset-btn"
        title="Start Fresh"
        style={{
          width: sidebarCollapsed ? '40px' : '100%',
          height: sidebarCollapsed ? '40px' : 'auto',
          padding: sidebarCollapsed ? '0' : '0.45rem 0.65rem',
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
          marginTop: 'auto',
          marginRight: sidebarCollapsed ? 'auto' : '0',
          marginLeft: sidebarCollapsed ? 'auto' : '0',
          boxShadow: 'var(--shadow-tiny)',
          borderRadius: sidebarCollapsed ? '50%' : '9999px',
          flexShrink: 0,
          transition: 'all 0.15s ease'
        }}
      >
        <RotateCcw size={14} />
        {!sidebarCollapsed && <span>Start Fresh</span>}
      </button>
    </aside>
  );
}
