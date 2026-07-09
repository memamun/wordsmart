import React from 'react';
import { Flame, Coins, Award, Menu } from 'lucide-react';
import { PREP_STAGES } from '../hooks/useGameState';

export default function Header({ state, wordsData, selectedUnit, sidebarOpen, setSidebarOpen }) {
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
    <header className="glass-panel main-header" style={{
      borderRadius: '0',
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: 'none',
      padding: '1rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: 'hsl(var(--bg-surface) / 0.4)',
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
          className="mobile-menu-btn btn btn-secondary"
          style={{ 
            display: 'none', 
            padding: '0.5rem', 
            borderRadius: 'var(--radius-md)',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Menu size={20} />
        </button>

        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          backgroundColor: 'hsla(var(--primary), 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid hsla(var(--primary), 0.2)'
        }}>
          <Award size={18} color="hsl(var(--primary))" />
        </div>
        <div>
          <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', fontWeight: '700', letterSpacing: '0.05em' }}>
            STAGE {state.unlockedLevel}: {currentStage.name.toUpperCase()}
          </div>
          <div style={{ fontFamily: 'var(--font-title)', fontWeight: '700', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span>Unit {state.unlockedLevel}.{targetUnitNum}</span>
            <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.35rem', borderRadius: '4px', backgroundColor: 'hsla(var(--primary), 0.15)', color: 'hsl(var(--primary))', fontWeight: '700' }}>
              {unitMasteredCount}/{unitTotalWords} mastered ({unitProgressPercent}%)
            </span>
          </div>
          {/* Progress bar */}
          <div style={{ 
            height: '4px', 
            width: '150px', 
            backgroundColor: 'hsl(var(--border-muted))', 
            borderRadius: '2px', 
            marginTop: '0.25rem', 
            overflow: 'hidden' 
          }}>
            <div style={{ 
              height: '100%', 
              width: `${unitProgressPercent}%`, 
              backgroundColor: 'hsl(var(--primary))',
              borderRadius: '2px',
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
          padding: '0.35rem 0.75rem', 
          borderRadius: 'var(--radius-md)', 
          backgroundColor: 'hsl(var(--bg-canvas) / 0.5)',
          border: '1px solid hsl(var(--border-muted))'
        }}>
          <div className={state.streak > 0 ? 'animate-fire' : ''}>
            <Flame size={16} color={state.streak > 0 ? '#F59E0B' : 'hsl(var(--text-muted))'} fill={state.streak > 0 ? '#F59E0B' : 'none'} />
          </div>
          <div>
            <div style={{ fontSize: '0.6rem', color: 'hsl(var(--text-muted))', fontWeight: '700' }}>STREAK</div>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', fontFamily: 'var(--font-title)', color: state.streak > 0 ? '#F59E0B' : 'hsl(var(--text-primary))', lineHeight: '1' }}>
              {state.streak} Days
            </div>
          </div>
        </div>

        {/* Prep Budget (Coins) */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.4rem', 
          padding: '0.35rem 0.75rem', 
          borderRadius: 'var(--radius-md)', 
          backgroundColor: 'hsl(var(--bg-canvas) / 0.5)',
          border: '1px solid hsl(var(--border-muted))'
        }}>
          <Coins size={16} color="#FBBF24" />
          <div>
            <div style={{ fontSize: '0.6rem', color: 'hsl(var(--text-muted))', fontWeight: '700' }}>BUDGET</div>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', fontFamily: 'var(--font-title)', color: '#FBBF24', lineHeight: '1' }}>
              {state.coins} Coins
            </div>
          </div>
        </div>

        {/* Experience Points (XP) */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.4rem', 
          padding: '0.35rem 0.75rem', 
          borderRadius: 'var(--radius-md)', 
          backgroundColor: 'hsl(var(--bg-canvas) / 0.5)',
          border: '1px solid hsl(var(--border-muted))'
        }}>
          <div style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: 'hsl(var(--accent-purple))',
            color: 'black',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.6rem',
            fontWeight: '900'
          }}>XP</div>
          <div>
            <div style={{ fontSize: '0.6rem', color: 'hsl(var(--text-muted))', fontWeight: '700' }}>TOTAL XP</div>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', fontFamily: 'var(--font-title)', color: 'hsl(var(--accent-purple))', lineHeight: '1' }}>
              {state.xp.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
