import React from 'react';
import { Flame, Coins, Award, Menu, Sun, Moon } from 'lucide-react';
import { PREP_STAGES } from '../hooks/useGameState';

export default function Header({ state, wordsData, selectedUnit, sidebarOpen, setSidebarOpen, theme, setTheme }) {
  const currentStage = PREP_STAGES.find(s => s.id === state.unlockedLevel) || PREP_STAGES[0];
  
  // Calculate unit-specific mastery progress
  const levelWords = wordsData?.getWordsForLevel(state.unlockedLevel) || [];
  const wordsPerUnit = levelWords.length ? Math.ceil(levelWords.length / 10) : 19;
  
  // Calculate stats for all units to find the active unit
  const unitsMastery = [];
  for (let u = 1; u <= 10; u++) {
    const start = (u - 1) * wordsPerUnit;
    const end = Math.min(u * wordsPerUnit, levelWords.length);
    const unitWords = levelWords.slice(start, end);
    const unitWordIds = unitWords.map(w => w.id);
    const masteredInUnit = state.masteredWordIds.filter(id => unitWordIds.includes(id)).length;
    unitsMastery.push({
      unitNumber: u,
      mastered: masteredInUnit,
      total: unitWords.length,
    });
  }

  // Use selectedUnit if passed, otherwise find first unit not fully mastered
  const targetUnitNum = selectedUnit || unitsMastery.find(u => u.mastered < u.total)?.unitNumber || 1;
  const currentUnitData = unitsMastery[targetUnitNum - 1] || { mastered: 0, total: 19 };

  const unitMasteredCount = currentUnitData.mastered;
  const unitTotalWords = currentUnitData.total;
  const unitProgressPercent = unitTotalWords ? Math.round((unitMasteredCount / unitTotalWords) * 100) : 0;

  return (
    <header className="main-header" style={{
      borderBottom: 'var(--border-thick)',
      padding: '1rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: 'var(--bg-surface)',
      zIndex: 10,
      width: '100%',
      gap: '1rem',
      flexWrap: 'wrap'
    }}>
      {/* Left Area: Toggle + Active Phase Banner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Mobile Menu Button */}
        <button 
          onClick={() => setSidebarOpen(true)}
          className="mobile-menu-btn min-touch"
          aria-label="Open navigation menu"
          style={{ 
            display: 'none', 
            backgroundColor: 'var(--bg-surface)',
            border: 'var(--border-thin)',
            boxShadow: 'var(--shadow-tiny)',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <Menu size={20} color="var(--text-primary)" />
        </button>

        <div style={{
          width: '36px',
          height: '36px',
          backgroundColor: 'var(--theme-green)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'var(--border-thin)',
          boxShadow: 'var(--shadow-tiny)'
        }}>
          <Award size={18} color="var(--text-black)" />
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '800', letterSpacing: '0.05em' }}>
            STAGE {state.unlockedLevel}: {currentStage.name.toUpperCase()}
          </div>
          <div style={{ fontFamily: 'var(--font-title)', fontWeight: '900', fontSize: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span>Unit {state.unlockedLevel}.{targetUnitNum}</span>
            <span style={{ 
              fontSize: '0.75rem', 
              padding: '0.1rem 0.5rem', 
              backgroundColor: 'var(--theme-green)', 
              color: 'var(--text-black)', 
              fontWeight: '800',
              border: 'var(--border-thin)',
              boxShadow: 'var(--shadow-one)'
            }}>
              {unitMasteredCount}/{unitTotalWords} <span className="hide-mobile">mastered </span>({unitProgressPercent}%)
            </span>
          </div>
          {/* Progress bar */}
          <div style={{ 
            height: '10px', 
            width: '100%', 
            maxWidth: '150px',
            backgroundColor: 'var(--bg-canvas)', 
            border: 'var(--border-thin)',
            marginTop: '0.35rem', 
            overflow: 'hidden' 
          }}>
            <div style={{ 
              height: '100%', 
              width: `${unitProgressPercent}%`, 
              backgroundColor: 'var(--theme-green)',
              transition: 'var(--transition-normal)'
            }}></div>
          </div>
        </div>
      </div>

      {/* Gamified Stats Header */}
      <div className="header-stats-container" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        {/* Streak Counter */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.4rem', 
          padding: '0.4rem 0.75rem', 
          backgroundColor: state.streak > 0 ? 'var(--theme-red)' : 'var(--bg-canvas)',
          border: 'var(--border-thin)',
          boxShadow: 'var(--shadow-tiny)',
          color: state.streak > 0 ? 'var(--text-black)' : 'var(--text-primary)'
        }}>
          <div className={state.streak > 0 ? 'animate-fire' : ''}>
            <Flame size={16} color={state.streak > 0 ? 'var(--text-black)' : 'var(--text-muted)'} fill={state.streak > 0 ? 'var(--text-black)' : 'none'} />
          </div>
          <div>
            <div className="hide-mobile" style={{ fontSize: '0.6rem', color: state.streak > 0 ? 'var(--text-black)' : 'var(--text-muted)', fontWeight: '900', textTransform: 'uppercase' }}>STREAK</div>
            <div style={{ fontSize: '0.85rem', fontWeight: '900', fontFamily: 'var(--font-title)', lineHeight: '1' }}>
              {state.streak}<span className="hide-mobile"> {state.streak === 1 ? 'Day' : 'Days'}</span><span className="show-mobile-inline">d</span>
            </div>
          </div>
        </div>

        {/* Prep Budget (Coins) */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.4rem', 
          padding: '0.4rem 0.75rem', 
          backgroundColor: 'var(--theme-yellow)',
          border: 'var(--border-thin)',
          boxShadow: 'var(--shadow-tiny)',
          color: 'var(--text-black)'
        }}>
          <Coins size={16} color="var(--text-black)" />
          <div>
            <div className="hide-mobile" style={{ fontSize: '0.6rem', color: 'var(--text-black)', fontWeight: '900', textTransform: 'uppercase' }}>BUDGET</div>
            <div style={{ fontSize: '0.85rem', fontWeight: '900', fontFamily: 'var(--font-title)', lineHeight: '1' }}>
              {state.coins}<span className="hide-mobile"> Coins</span>
            </div>
          </div>
        </div>

        {/* Experience Points (XP) */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.4rem', 
          padding: '0.4rem 0.75rem', 
          backgroundColor: 'var(--theme-purple)',
          border: 'var(--border-thin)',
          boxShadow: 'var(--shadow-tiny)',
          color: 'var(--text-black)'
        }}>
          <Award size={16} color="var(--text-black)" />
          <div>
            <div className="hide-mobile" style={{ fontSize: '0.6rem', color: 'var(--text-black)', fontWeight: '900', textTransform: 'uppercase' }}>TOTAL XP</div>
            <div style={{ fontSize: '0.85rem', fontWeight: '900', fontFamily: 'var(--font-title)', lineHeight: '1' }}>
              {state.xp.toLocaleString()}<span className="show-mobile-inline"> XP</span>
            </div>
          </div>
        </div>

        {/* Theme Toggler */}
        <button
          onClick={() => {
            setTheme(theme === 'dark' ? 'light' : 'dark');
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '38px',
            height: '38px',
            padding: 0,
            backgroundColor: 'var(--theme-cyan)',
            border: 'var(--border-thin)',
            boxShadow: 'var(--shadow-tiny)',
            color: 'var(--text-black)',
            cursor: 'pointer',
            fontWeight: '900',
            fontSize: '0.85rem',
            textTransform: 'uppercase'
          }}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'light' && <Sun size={16} />}
          {theme === 'dark' && <Moon size={16} />}
        </button>
      </div>
    </header>
  );
}
