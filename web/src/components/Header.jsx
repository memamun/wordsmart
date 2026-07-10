import React from 'react';
import { Flame, Coins, Award, Menu, Sun, Moon, Monitor } from 'lucide-react';
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
      borderBottom: '3px solid #000000',
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
            backgroundColor: '#ffffff',
            border: '2px solid #000000',
            boxShadow: '2px 2px 0px #000000',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <Menu size={20} color="#000000" />
        </button>

        <div style={{
          width: '36px',
          height: '36px',
          backgroundColor: '#69F0AE',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid #000000',
          boxShadow: '2px 2px 0px #000000'
        }}>
          <Award size={18} color="#000000" />
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
              backgroundColor: '#69F0AE', 
              color: '#000000', 
              fontWeight: '800',
              border: '2px solid #000000',
              boxShadow: '1px 1px 0px #000000'
            }}>
              {unitMasteredCount}/{unitTotalWords} mastered ({unitProgressPercent}%)
            </span>
          </div>
          {/* Progress bar */}
          <div style={{ 
            height: '8px', 
            width: '100%', 
            maxWidth: '150px',
            backgroundColor: 'var(--bg-canvas)', 
            border: '2px solid #000000',
            marginTop: '0.35rem', 
            overflow: 'hidden' 
          }}>
            <div style={{ 
              height: '100%', 
              width: `${unitProgressPercent}%`, 
              backgroundColor: '#69F0AE',
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
          backgroundColor: state.streak > 0 ? '#FF5252' : 'var(--bg-canvas)',
          border: '2px solid #000000',
          boxShadow: '2px 2px 0px #000000',
          color: state.streak > 0 ? '#000000' : 'var(--text-primary)'
        }}>
          <div className={state.streak > 0 ? 'animate-fire' : ''}>
            <Flame size={16} color={state.streak > 0 ? '#000000' : 'var(--text-muted)'} fill={state.streak > 0 ? '#000000' : 'none'} />
          </div>
          <div>
            <div style={{ fontSize: '0.6rem', color: state.streak > 0 ? '#000000' : 'var(--text-muted)', fontWeight: '900', textTransform: 'uppercase' }}>STREAK</div>
            <div style={{ fontSize: '0.85rem', fontWeight: '900', fontFamily: 'var(--font-title)', lineHeight: '1' }}>
              {state.streak} Days
            </div>
          </div>
        </div>

        {/* Prep Budget (Coins) */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.4rem', 
          padding: '0.4rem 0.75rem', 
          backgroundColor: '#FFD740',
          border: '2px solid #000000',
          boxShadow: '2px 2px 0px #000000',
          color: '#000000'
        }}>
          <Coins size={16} color="#000000" />
          <div>
            <div style={{ fontSize: '0.6rem', color: '#000000', fontWeight: '900', textTransform: 'uppercase' }}>BUDGET</div>
            <div style={{ fontSize: '0.85rem', fontWeight: '900', fontFamily: 'var(--font-title)', lineHeight: '1' }}>
              {state.coins} Coins
            </div>
          </div>
        </div>

        {/* Experience Points (XP) */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.4rem', 
          padding: '0.4rem 0.75rem', 
          backgroundColor: '#E040FB',
          border: '2px solid #000000',
          boxShadow: '2px 2px 0px #000000',
          color: '#000000'
        }}>
          <Award size={16} color="#000000" />
          <div>
            <div style={{ fontSize: '0.6rem', color: '#000000', fontWeight: '900', textTransform: 'uppercase' }}>TOTAL XP</div>
            <div style={{ fontSize: '0.85rem', fontWeight: '900', fontFamily: 'var(--font-title)', lineHeight: '1' }}>
              {state.xp.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Theme Toggler */}
        <button
          onClick={() => {
            const themes = ['light', 'dark', 'system'];
            const nextIdx = (themes.indexOf(theme) + 1) % themes.length;
            setTheme(themes[nextIdx]);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.4rem 0.75rem',
            backgroundColor: '#18FFFF',
            border: '2px solid #000000',
            boxShadow: '2px 2px 0px #000000',
            color: '#000000',
            cursor: 'pointer',
            fontWeight: '900',
            fontSize: '0.85rem',
            textTransform: 'uppercase'
          }}
          title={`Theme: ${theme}`}
        >
          {theme === 'light' && <Sun size={16} />}
          {theme === 'dark' && <Moon size={16} />}
          {theme === 'system' && <Monitor size={16} />}
          <span>{theme}</span>
        </button>
      </div>
    </header>
  );
}
