import React from 'react';
import { 
  Trophy, 
  BookOpen, 
  Zap, 
  Award, 
  Compass, 
  ChevronRight, 
  Sparkles,
  HelpCircle,
  RefreshCw,
  Calendar,
  Search,
  BookOpenCheck,
  X,
  Book
} from 'lucide-react';
import { PREP_STAGES } from '../hooks/useGameState';

export default function Sidebar({ activeView, setActiveView, state, wordsData, sidebarOpen, setSidebarOpen }) {
  const currentStage = PREP_STAGES.find(s => s.id === state.unlockedLevel) || PREP_STAGES[0];

  const menuItems = [
    { id: 'dashboard', label: 'Prep Roadmap', icon: Compass, desc: 'Your progress map' },
    { id: 'flashcards', label: 'Flashcard Quest', icon: BookOpen, desc: 'Study new words' },
    { id: 'review', label: 'SM-2 Review Deck', icon: Calendar, desc: 'Spaced repetition reviews' },
    { id: 'stories', label: 'Contextual Stories', icon: BookOpenCheck, desc: 'Read in context' },
    { id: 'quizzes', label: 'Qualification MCQs', icon: Award, desc: 'Synonyms & Antonyms' },
    { id: 'analogy', label: 'Analogy Arena', icon: HelpCircle, desc: 'A : B :: C : D drills' },
    { id: 'timeblitz', label: 'Time Blitz', icon: Zap, desc: 'Timed speed challenge' },
    { id: 'search', label: 'Dictionary Portal', icon: Search, desc: `Search ${wordsData?.words?.length || 1913} words` },
    { id: 'specialized', label: 'Specialized Vocabs', icon: Book, desc: 'Common errors, Finance, Arts' },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, desc: 'Mock competition' },
  ];

  return (
    <aside className={`sidebar-nav ${sidebarOpen ? 'open' : ''}`} style={{
      width: '280px',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: '0',
      borderLeft: 'none',
      borderTop: 'none',
      borderBottom: 'none',
      padding: '1.5rem 1rem',
      backgroundColor: 'hsl(var(--bg-surface) / 0.9)',
      borderRight: '1px solid hsl(var(--border-muted))',
      overflowY: 'auto',
      zIndex: 999,
      transition: 'transform var(--transition-normal)'
    }}>
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', padding: '0 0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(160 80% 45%) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px hsla(var(--primary), 0.3)'
          }}>
            <Sparkles size={18} color="black" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-title)', lineHeight: '1.1' }}>WordSmart</h2>
            <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', fontWeight: '700', letterSpacing: '0.05em' }}>
              VOCABULARY MASTERY
            </span>
          </div>
        </div>

        {/* Close Button on Mobile Drawer */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="mobile-close-btn btn btn-secondary min-touch"
          style={{
            display: 'none',
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* User Mini Profile */}
      <div style={{
        padding: '0.75rem 1rem',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'hsl(var(--bg-canvas) / 0.5)',
        border: '1px solid hsl(var(--border-muted))',
        marginBottom: '1.5rem'
      }}>
        <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.15rem' }}>
          Current Phase
        </div>
        <div style={{ 
          fontFamily: 'var(--font-title)', 
          fontWeight: '700', 
          fontSize: '0.95rem', 
          color: 'hsl(var(--primary))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '160px' }}>{currentStage.name}</span>
          <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>
            Lvl {state.unlockedLevel}
          </span>
        </div>
        <div style={{ marginTop: '0.4rem', height: '4px', backgroundColor: 'hsl(var(--border-muted))', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ 
            height: '100%', 
            width: `${(state.unlockedLevel / 10) * 100}%`, 
            backgroundColor: 'hsl(var(--primary))',
            borderRadius: '2px',
            transition: 'var(--transition-normal)'
          }}></div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1.5rem' }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className="btn"
              style={{
                justifyContent: 'flex-start',
                width: '100%',
                padding: '0.7rem 0.8rem',
                backgroundColor: isActive ? 'hsla(var(--primary), 0.1)' : 'transparent',
                border: isActive ? '1px solid hsla(var(--primary), 0.3)' : '1px solid transparent',
                color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--text-secondary))',
                borderRadius: 'var(--radius-md)',
                transition: 'var(--transition-fast)'
              }}
            >
              <Icon size={18} style={{ minWidth: '18px' }} />
              <div style={{ textAlign: 'left', marginLeft: '0.6rem', flex: 1, overflow: 'hidden' }}>
                <div style={{ fontWeight: '600', fontSize: '0.85rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{item.label}</div>
                <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', fontWeight: '400', marginTop: '1px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {item.desc}
                </div>
              </div>
              {isActive && <ChevronRight size={14} />}
            </button>
          );
        })}
      </nav>

      {/* Reset Progress */}
      <button 
        onClick={() => {
          if (confirm('Are you sure you want to reset your prep progress? This cannot be undone.')) {
            state.resetProgress();
            window.location.reload();
          }
        }}
        className="btn btn-secondary"
        style={{
          width: '100%',
          padding: '0.55rem 0.75rem',
          fontSize: '0.8rem',
          color: 'hsl(var(--danger))',
          borderColor: 'hsla(var(--danger), 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem',
          marginTop: 'auto'
        }}
      >
        <RefreshCw size={12} />
        Reset Progress
      </button>
    </aside>
  );
}
