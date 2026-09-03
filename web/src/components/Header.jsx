import React, { useState, useRef, useEffect } from 'react';
import { 
  Flame, 
  Coins, 
  Award, 
  Menu, 
  Sun, 
  Moon, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Lock, 
  BookOpen, 
  HelpCircle,
  Layers,
  ArrowLeft
} from 'lucide-react';
import { PREP_STAGES } from '../hooks/useGameState';

export default function Header({ 
  state, 
  wordsData, 
  selectedUnit, 
  setSelectedUnit, 
  activeView, 
  setActiveView, 
  sidebarOpen, 
  setSidebarOpen, 
  theme, 
  setTheme,
  onBack,
  canGoBack
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentStage = PREP_STAGES.find(s => s.id === state.unlockedLevel) || PREP_STAGES[0];
  
  // Calculate unit-specific mastery progress
  const levelWords = wordsData?.getWordsForLevel(state.unlockedLevel) || [];
  const wordsPerUnit = levelWords.length ? Math.ceil(levelWords.length / 10) : 19;
  
  // Calculate stats for all 10 units in current level
  const unitsMastery = [];
  for (let u = 1; u <= 10; u++) {
    const start = (u - 1) * wordsPerUnit;
    const end = Math.min(u * wordsPerUnit, levelWords.length);
    const unitWords = levelWords.slice(start, end);
    const unitWordIds = unitWords.map(w => w.id);
    const masteredInUnit = (state.masteredWordIds || []).filter(id => unitWordIds.includes(id)).length;
    
    let isUnlocked = true;
    if (u > 1) {
      const prevStart = (u - 2) * wordsPerUnit;
      const prevEnd = Math.min((u - 1) * wordsPerUnit, levelWords.length);
      const prevUnitWords = levelWords.slice(prevStart, prevEnd);
      const prevUnitWordIds = prevUnitWords.map(w => w.id);
      const prevMastered = (state.masteredWordIds || []).filter(id => prevUnitWordIds.includes(id)).length;
      const prevPercent = prevUnitWords.length ? Math.round((prevMastered / prevUnitWords.length) * 100) : 0;
      isUnlocked = prevPercent >= 70;
    }

    unitsMastery.push({
      unitNumber: u,
      mastered: masteredInUnit,
      total: unitWords.length,
      isUnlocked,
    });
  }

  const targetUnitNum = selectedUnit || unitsMastery.find(u => u.mastered < u.total)?.unitNumber || 1;
  const currentUnitData = unitsMastery[targetUnitNum - 1] || { mastered: 0, total: 19, isUnlocked: true };

  const unitMasteredCount = currentUnitData.mastered;
  const unitTotalWords = currentUnitData.total;
  const unitProgressPercent = unitTotalWords ? Math.round((unitMasteredCount / unitTotalWords) * 100) : 0;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePrevUnit = () => {
    if (targetUnitNum > 1 && setSelectedUnit) {
      setSelectedUnit(targetUnitNum - 1);
    }
  };

  const handleNextUnit = () => {
    if (targetUnitNum < 10 && setSelectedUnit) {
      const nextUnitData = unitsMastery[targetUnitNum];
      if (nextUnitData && nextUnitData.isUnlocked) {
        setSelectedUnit(targetUnitNum + 1);
      }
    }
  };

  const handleSelectUnitFromMenu = (unitNum) => {
    if (setSelectedUnit) {
      setSelectedUnit(unitNum);
    }
    setDropdownOpen(false);
  };

  return (
    <header className="main-header" style={{
      backgroundColor: 'var(--bg-surface)',
      zIndex: 10,
      width: '100%'
    }}>
      {/* Top Nav Control Bar */}
      <div className="header-nav-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'nowrap' }}>
          {/* Mobile Control: Hamburger menu on home/dashboard, Back button on submenus */}
          {canGoBack ? (
            <button 
              onClick={onBack}
              className="mobile-menu-btn min-touch"
              aria-label="Back to Roadmap"
              title="Back to Roadmap"
              style={{
                background: 'var(--theme-yellow)',
                border: '2px solid #000000',
                boxShadow: '0 2.5px 0 #000000'
              }}
            >
              <ArrowLeft size={18} color="#000000" strokeWidth={2.5} />
            </button>
          ) : (
            <button 
              onClick={() => setSidebarOpen(true)}
              className="mobile-menu-btn min-touch"
              aria-label="Open navigation menu"
              title="Open navigation menu"
            >
              <Menu size={18} color="#000000" />
            </button>
          )}

          {/* Desktop Control: Award icon on home/dashboard, Back button on submenus */}
          {canGoBack ? (
            <button 
              onClick={onBack}
              className="header-back-btn hide-mobile"
              title="Back to Roadmap"
              aria-label="Back to Roadmap"
            >
              <ArrowLeft size={15} strokeWidth={2.5} />
              <span className="header-back-text">Roadmap</span>
            </button>
          ) : (
            <div className="hide-mobile" style={{
              width: '36px',
              height: '36px',
              backgroundColor: 'var(--theme-green)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'var(--border-thin)',
              boxShadow: 'var(--shadow-tiny)',
              flexShrink: 0
            }}>
              <Award size={18} color="var(--text-black)" />
            </div>
          )}

          {/* Quick Switcher Area */}
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              {/* Quick Switcher Trigger Pill */}
              <button
                onClick={() => setDropdownOpen(prev => !prev)}
                aria-label="Quick Select Unit"
                className="unit-switcher-pill"
                style={{
                  fontFamily: 'var(--font-title)',
                  fontWeight: '900',
                  fontSize: '0.82rem',
                  padding: '0.35rem 0.65rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  cursor: 'pointer'
                }}
              >
                <span className="hide-mobile">Unit {state.unlockedLevel}.{targetUnitNum}</span>
                <span className="show-mobile-inline">S{state.unlockedLevel} • U{targetUnitNum}</span>
                <ChevronDown size={14} style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: '0.2s ease' }} />
              </button>

              {/* Quick Prev / Next Unit Arrow Buttons */}
              <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                <button
                  onClick={handlePrevUnit}
                  disabled={targetUnitNum <= 1}
                  aria-label="Previous Unit"
                  title="Previous Unit"
                  className="unit-arrow-pill"
                  style={{
                    cursor: targetUnitNum <= 1 ? 'not-allowed' : 'pointer',
                    opacity: targetUnitNum <= 1 ? 0.4 : 1
                  }}
                >
                  <ChevronLeft size={16} />
                </button>

                <button
                  onClick={handleNextUnit}
                  disabled={targetUnitNum >= 10 || !unitsMastery[targetUnitNum]?.isUnlocked}
                  aria-label="Next Unit"
                  title="Next Unit"
                  className="unit-arrow-pill"
                  style={{
                    cursor: (targetUnitNum >= 10 || !unitsMastery[targetUnitNum]?.isUnlocked) ? 'not-allowed' : 'pointer',
                    opacity: (targetUnitNum >= 10 || !unitsMastery[targetUnitNum]?.isUnlocked) ? 0.4 : 1
                  }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Desktop Progress Badge */}
              <span className="unit-progress-pill hide-mobile" style={{ 
                fontSize: '0.75rem', 
                padding: '0.35rem 0.75rem', 
                fontWeight: '900',
                whiteSpace: 'nowrap'
              }}>
                {unitMasteredCount}/{unitTotalWords} mastered ({unitProgressPercent}%)
              </span>
            </div>

            {/* Unit Quick Switcher Dropdown Popover */}
            {dropdownOpen && (
              <div className="animate-fade glass-panel" style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                width: '320px',
                maxWidth: '90vw',
                backgroundColor: 'var(--bg-surface)',
                border: 'var(--border-thick)',
                boxShadow: 'var(--shadow-main)',
                zIndex: 100,
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-title)', fontWeight: '800', fontSize: '0.9rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Layers size={14} color="hsl(var(--primary))" /> Select Unit (Stage {state.unlockedLevel})
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>10 Units</span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '0.5rem'
                }}>
                  {unitsMastery.map(u => {
                    const isSelected = u.unitNumber === targetUnitNum;
                    const isUnlocked = u.isUnlocked;
                    const uPercent = u.total ? Math.round((u.mastered / u.total) * 100) : 0;

                    return (
                      <button
                        key={u.unitNumber}
                        disabled={!isUnlocked}
                        onClick={() => {
                          if (setSelectedUnit) setSelectedUnit(u.unitNumber);
                          setDropdownOpen(false);
                        }}
                        style={{
                          padding: '0.5rem 0.25rem',
                          borderRadius: 'var(--radius-sm)',
                          border: isSelected ? 'var(--border-thick)' : '1px solid var(--border-muted)',
                          backgroundColor: isSelected ? 'var(--theme-cyan)' : isUnlocked ? 'var(--bg-surface-elevated)' : 'var(--bg-canvas)',
                          color: isSelected ? '#000000' : isUnlocked ? 'var(--text-primary)' : 'var(--text-muted)',
                          cursor: isUnlocked ? 'pointer' : 'not-allowed',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.15rem',
                          opacity: isUnlocked ? 1 : 0.45,
                          fontWeight: '800',
                          fontSize: '0.75rem'
                        }}
                      >
                        <span>U{u.unitNumber}</span>
                        <span style={{ fontSize: '0.6rem', opacity: 0.85 }}>{uPercent}%</span>
                      </button>
                    );
                  })}
                </div>

                <div style={{ borderTop: '1px solid var(--border-muted)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Stage Mastered</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'hsl(var(--primary))' }}>
                    {unitsMastery.reduce((acc, curr) => acc + curr.mastered, 0)} / {unitsMastery.reduce((acc, curr) => acc + curr.total, 0)} words
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Right Controls: Streak Pill, Desktop Stats, and Dark/Light Mode Switch at the Far Right */}
      <div className="header-right-container" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
        {/* Mobile Streak Pill (Shown exclusively on mobile) */}
        <div 
          className="mobile-streak-pill"
          title={`Daily Streak: ${state.streak} ${state.streak === 1 ? 'day' : 'days'}`}
        >
          <div className={state.streak > 0 ? 'animate-fire' : ''} style={{ display: 'flex', alignItems: 'center' }}>
            <Flame size={15} color="#000000" fill={state.streak > 0 ? '#FFD54F' : 'none'} />
          </div>
          <span>{state.streak}d</span>
        </div>

        {/* Mobile Coins Pill (Shown exclusively on mobile) */}
        <div 
          className="mobile-coins-pill"
          title={`Coins: ${state.coins}`}
        >
          <Coins size={14} color="#000000" />
          <span>{state.coins}</span>
        </div>

        {/* Gamified Stats Header (Desktop Only) */}
        <div className="header-stats-container hide-mobile">
          {/* Streak Counter */}
          <div className="header-stat-badge header-stat-streak">
            <div className={state.streak > 0 ? 'animate-fire' : ''}>
              <Flame size={14} color="#000000" fill={state.streak > 0 ? '#000000' : 'none'} />
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: '900', fontFamily: 'var(--font-title)', lineHeight: '1', color: '#000000' }}>
              {state.streak} {state.streak === 1 ? 'Day' : 'Days'}
            </div>
          </div>

          {/* Prep Budget (Coins) */}
          <div className="header-stat-badge header-stat-coins">
            <Coins size={14} color="#000000" />
            <div style={{ fontSize: '0.82rem', fontWeight: '900', fontFamily: 'var(--font-title)', lineHeight: '1', color: '#000000' }}>
              {state.coins} Coins
            </div>
          </div>

          {/* Experience Points (XP) */}
          <div className="header-stat-badge header-stat-xp">
            <Award size={14} color="#000000" />
            <div style={{ fontSize: '0.82rem', fontWeight: '900', fontFamily: 'var(--font-title)', lineHeight: '1', color: '#000000' }}>
              {state.xp.toLocaleString()} XP
            </div>
          </div>
        </div>

        {/* Theme Toggler: ALWAYS at the far right */}
        <button
          className="header-theme-toggle"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'light' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>
    </header>
  );
}
