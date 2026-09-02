import React, { useState } from 'react';
import { 
  Trophy, 
  BookOpen, 
  Award, 
  Lock, 
  CheckCircle, 
  HelpCircle, 
  ArrowRight,
  TrendingUp,
  Brain,
  ShieldCheck,
  Folder,
  FolderOpen,
  Flame,
  Coins,
  Sparkles,
  Layers,
  ChevronRight,
  ChevronDown,
  CheckCircle2
} from 'lucide-react';
import { PREP_STAGES } from '../hooks/useGameState';

function BlockMeter({ value, max, color }) {
  const blocksCount = 5;
  const filledBlocks = max > 0 ? Math.round((value / max) * blocksCount) : 0;
  
  return (
    <div style={{ display: 'flex', gap: '5px', zIndex: 2, marginRight: '0.25rem', flexShrink: 0 }}>
      {Array.from({ length: blocksCount }).map((_, i) => {
        const isFilled = i < filledBlocks;
        return (
          <div
            key={i}
            style={{
              width: '12px',
              height: '24px',
              background: isFilled ? color : 'var(--bg-canvas)',
              border: 'var(--border-thin)',
              borderRadius: '3px',
              boxShadow: isFilled ? 'var(--shadow-one)' : 'none',
              transform: isFilled ? 'translateY(-2px)' : 'none',
              transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
          />
        );
      })}
    </div>
  );
}

function WindowPanel({ title, headerColor, shadowVar, className = '', style = {}, children }) {
  return (
    <div className={`card-hover ${className}`} style={{
      backgroundColor: 'var(--bg-surface)',
      border: 'var(--border-thick)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: shadowVar || 'var(--shadow-main)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      transition: 'var(--transition-normal)',
      position: 'relative',
      ...style
    }}>
      {/* Window Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.5rem 0.75rem',
        background: headerColor,
        borderBottom: 'var(--border-thick)',
        color: 'var(--text-black)',
        fontWeight: '900',
        fontSize: '0.65rem',
        fontFamily: 'monospace',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        userSelect: 'none'
      }}>
        {/* Retro Window Control Circles */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FF5252', border: '1.5px solid var(--border-muted)' }} />
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FFD700', border: '1.5px solid var(--border-muted)' }} />
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#69F0AE', border: '1.5px solid var(--border-muted)' }} />
        </div>
        <div>{title}</div>
      </div>
      {/* Window Body Content */}
      <div className="window-body" style={{ padding: '1.25rem', flex: 1, position: 'relative' }}>
        {children}
      </div>
    </div>
  );
}

export default function Dashboard({ state, wordsData, setActiveView, selectedUnit, setSelectedUnit, user, onGoogleSignIn }) {
  const currentStage = PREP_STAGES.find(s => s.id === state.unlockedLevel) || PREP_STAGES[0];
  const [activeStageFolder, setActiveStageFolder] = useState(() => state.unlockedLevel || 1);
  const [viewMode, setViewMode] = useState('folder'); // 'folder' (focused level folder) or 'all' (expanded tree)

  // Stats calculations
  const totalMastered = state.masteredWordIds?.length || 0;
  const totalLearning = state.learningWordIds?.length || 0;
  const totalWords = wordsData?.words?.length || 1913;
  const masteryPercentage = totalWords > 0 
    ? Math.round((totalMastered / totalWords) * 100) 
    : 0;

  // Calculate recommended next unit action
  const levelWords = wordsData?.getWordsForLevel(state.unlockedLevel) || [];
  const wordsPerUnit = levelWords.length ? Math.ceil(levelWords.length / 10) : 19;
  
  let recUnit = selectedUnit || 1;
  let recType = 'flashcards';

  for (let u = 1; u <= 10; u++) {
    const start = (u - 1) * wordsPerUnit;
    const end = Math.min(u * wordsPerUnit, levelWords.length);
    const uWords = levelWords.slice(start, end);
    const uWordIds = uWords.map(w => w.id);
    const masteredInU = (state.masteredWordIds || []).filter(id => uWordIds.includes(id)).length;
    
    if (masteredInU < uWords.length) {
      recUnit = u;
      recType = 'flashcards';
      break;
    } else if (u === 10 && masteredInU >= uWords.length) {
      recUnit = 10;
      recType = 'exam';
    }
  }

  // Calculate stage progress for a given stage
  const getStageStats = (stageId) => {
    const sWords = wordsData?.getWordsForLevel(stageId) || [];
    const sWordIds = sWords.map(w => w.id);
    const sMastered = (state.masteredWordIds || []).filter(id => sWordIds.includes(id)).length;
    const sPercent = sWords.length ? Math.round((sMastered / sWords.length) * 100) : 0;
    const isCompleted = state.levelAttempts?.[stageId]?.passed;
    const isActive = state.unlockedLevel === stageId;
    const isLocked = stageId > state.unlockedLevel;

    // Count completed units
    const sWordsPerUnit = sWords.length ? Math.ceil(sWords.length / 10) : 19;
    let completedUnits = 0;
    for (let u = 1; u <= 10; u++) {
      const uStart = (u - 1) * sWordsPerUnit;
      const uEnd = Math.min(u * sWordsPerUnit, sWords.length);
      const uWords = sWords.slice(uStart, uEnd);
      const uWordIds = uWords.map(w => w.id);
      const mCount = (state.masteredWordIds || []).filter(id => uWordIds.includes(id)).length;
      if (uWords.length > 0 && mCount >= uWords.length) {
        completedUnits++;
      }
    }

    return {
      words: sWords,
      mastered: sMastered,
      percent: sPercent,
      isCompleted,
      isActive,
      isLocked,
      completedUnits,
      totalUnits: 10
    };
  };

  const selectedStageStats = getStageStats(activeStageFolder);
  const selectedStageData = PREP_STAGES.find(s => s.id === activeStageFolder) || PREP_STAGES[0];

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }} className="animate-fade dashboard-container">
      
      {/* ======================================================== */}
      {/* 1. TOP PROGRESS METRICS BENTO GRID                       */}
      {/* ======================================================== */}
      <div className="dashboard-stats-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.25rem'
      }}>
        {/* Metric 1: Words Mastered */}
        <WindowPanel
          title="MASTERED_WORDS.DLL"
          headerColor="var(--theme-cyan)"
          shadowVar="var(--stats-shadow-1)"
          style={{ padding: 0 }}
        >
          <ShieldCheck size={96} style={{
            position: 'absolute',
            right: '-10px',
            bottom: '-15px',
            color: 'hsl(var(--primary))',
            opacity: 0.08,
            transform: 'rotate(-15deg)',
            pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'hsla(var(--primary), 0.1)',
            filter: 'blur(12px)',
            pointerEvents: 'none'
          }} />
          <span style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            fontSize: '0.6rem',
            fontWeight: '900',
            background: 'hsla(var(--primary), 0.1)',
            color: 'hsl(var(--primary))',
            padding: '0.15rem 0.35rem',
            borderRadius: '4px',
            border: '1px solid hsla(var(--primary), 0.3)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Active
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', zIndex: 2 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '800', letterSpacing: '0.05em' }}>WORDS MASTERED</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '900', fontFamily: 'var(--font-title)', marginTop: '0.15rem' }}>
              {totalMastered} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500' }}>/ {totalWords}</span>
            </div>
          </div>
          <BlockMeter value={totalMastered} max={totalWords} color="hsl(var(--primary))" />
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: '4px',
            width: `${masteryPercentage}%`,
            background: 'hsl(var(--primary))',
            transition: 'width 1s ease'
          }} />
        </WindowPanel>

        {/* Metric 2: Mastery Rate */}
        <WindowPanel
          title="MASTERY_RATE.EXE"
          headerColor="var(--theme-purple)"
          shadowVar="var(--stats-shadow-2)"
          style={{ padding: 0 }}
        >
          <TrendingUp size={96} style={{
            position: 'absolute',
            right: '-10px',
            bottom: '-15px',
            color: 'hsl(var(--accent-purple))',
            opacity: 0.08,
            transform: 'rotate(-15deg)',
            pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'hsla(var(--accent-purple), 0.1)',
            filter: 'blur(12px)',
            pointerEvents: 'none'
          }} />
          <span style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            fontSize: '0.6rem',
            fontWeight: '900',
            background: 'hsla(var(--accent-purple), 0.1)',
            color: 'hsl(var(--accent-purple))',
            padding: '0.15rem 0.35rem',
            borderRadius: '4px',
            border: '1px solid hsla(var(--accent-purple), 0.3)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Overall
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', zIndex: 2 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '800', letterSpacing: '0.05em' }}>MASTERY RATE</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '900', fontFamily: 'var(--font-title)', color: 'hsl(var(--accent-purple))', marginTop: '0.15rem' }}>
              {masteryPercentage}%
            </div>
          </div>
          <BlockMeter value={masteryPercentage} max={100} color="hsl(var(--accent-purple))" />
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: '4px',
            width: `${masteryPercentage}%`,
            background: 'hsl(var(--accent-purple))',
            transition: 'width 1s ease'
          }} />
        </WindowPanel>

        {/* Metric 3: Active Prep Stage */}
        <WindowPanel
          title="PREP_STAGE.SYS"
          headerColor="var(--theme-yellow)"
          shadowVar="var(--stats-shadow-3)"
          style={{ padding: 0 }}
        >
          <Trophy size={96} style={{
            position: 'absolute',
            right: '-10px',
            bottom: '-15px',
            color: 'hsl(var(--secondary))',
            opacity: 0.08,
            transform: 'rotate(-15deg)',
            pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'hsla(var(--secondary), 0.1)',
            filter: 'blur(12px)',
            pointerEvents: 'none'
          }} />
          <span style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            fontSize: '0.65rem',
            fontWeight: '900',
            background: 'hsla(var(--secondary), 0.1)',
            color: 'hsl(var(--secondary))',
            padding: '0.15rem 0.35rem',
            borderRadius: '4px',
            border: '1px solid hsla(var(--secondary), 0.3)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Lvl {state.unlockedLevel}
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', zIndex: 2 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '800', letterSpacing: '0.05em' }}>PREP STAGE REACHED</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '900', fontFamily: 'var(--font-title)', color: 'hsl(var(--secondary))', marginTop: '0.15rem' }}>
              {state.unlockedLevel}/10
            </div>
          </div>
          <BlockMeter value={state.unlockedLevel} max={10} color="hsl(var(--secondary))" />
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: '4px',
            width: `${(state.unlockedLevel / 10) * 100}%`,
            background: 'hsl(var(--secondary))',
            transition: 'width 1s ease'
          }} />
        </WindowPanel>

        {/* Metric 4: Daily Streak & Coins */}
        <WindowPanel
          title="DAILY_STREAK.LOG"
          headerColor="var(--theme-green)"
          shadowVar="var(--welcome-shadow)"
          style={{ padding: 0 }}
        >
          <Flame size={96} style={{
            position: 'absolute',
            right: '-10px',
            bottom: '-15px',
            color: 'var(--theme-orange)',
            opacity: 0.1,
            transform: 'rotate(-15deg)',
            pointerEvents: 'none'
          }} />
          <span style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            fontSize: '0.65rem',
            fontWeight: '900',
            background: 'hsla(38, 100%, 58%, 0.15)',
            color: 'var(--theme-yellow)',
            padding: '0.15rem 0.4rem',
            borderRadius: '4px',
            border: '1px solid hsla(38, 100%, 58%, 0.4)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}>
            <Coins size={10} /> {state.coins || 0} COINS
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', zIndex: 2 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '800', letterSpacing: '0.05em' }}>CURRENT STREAK</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '900', fontFamily: 'var(--font-title)', color: 'var(--theme-orange)', marginTop: '0.15rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Flame size={24} color="var(--theme-orange)" /> {state.streak || 0} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600' }}>days</span>
            </div>
          </div>
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: '4px',
            width: '100%',
            background: 'var(--theme-green)'
          }} />
        </WindowPanel>
      </div>

      {/* ======================================================== */}
      {/* 2. RECOMMENDED NEXT ACTION HERO CARD                     */}
      {/* ======================================================== */}
      <div className="glass-panel animate-fade" style={{
        padding: '1.5rem 2rem',
        background: 'linear-gradient(135deg, var(--bg-surface) 0%, hsla(var(--primary), 0.08) 100%)',
        border: 'var(--border-thick)',
        boxShadow: 'var(--shadow-main)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--theme-yellow)',
            border: 'var(--border-thick)',
            boxShadow: 'var(--shadow-tiny)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-black)',
            flexShrink: 0
          }}>
            <Brain size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '900', color: 'hsl(var(--secondary))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ⚡ RECOMMENDED NEXT STEP
            </div>
            <h3 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-title)', fontWeight: '900', color: 'var(--text-primary)', marginTop: '0.1rem' }}>
              {recType === 'exam' 
                ? `Stage ${state.unlockedLevel} Cumulative Qualification Exam`
                : `Stage ${state.unlockedLevel} • Unit ${state.unlockedLevel}.${recUnit} Vocabulary`}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              {recType === 'exam' 
                ? 'You completed all 10 units! Take the qualification exam to unlock the next stage.'
                : `Master the next set of words in Unit ${state.unlockedLevel}.${recUnit} without interrupting your streak.`}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {recType === 'exam' ? (
            <button
              onClick={() => {
                if (setSelectedUnit) setSelectedUnit(10);
                setActiveView('quizzes');
              }}
              className="btn btn-accent"
              style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}
            >
              Take Qualification Exam <ArrowRight size={16} />
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  if (setSelectedUnit) setSelectedUnit(recUnit);
                  setActiveView('flashcards', recUnit);
                }}
                className="btn btn-primary"
                style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}
              >
                <BookOpen size={16} /> Study Unit {state.unlockedLevel}.{recUnit}
              </button>
              <button
                onClick={() => {
                  if (setSelectedUnit) setSelectedUnit(recUnit);
                  setActiveView('quizzes', recUnit);
                }}
                className="btn btn-secondary"
                style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}
              >
                <HelpCircle size={16} /> Quiz
              </button>
            </>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. LEVEL FOLDER SYSTEM & OPTION HIERARCHY                */}
      {/* ======================================================== */}
      <div className="glass-panel" style={{
        padding: '0',
        overflow: 'hidden',
        border: 'var(--border-thick)',
        boxShadow: 'var(--shadow-main)'
      }}>
        {/* Explorer Title Bar */}
        <div style={{
          padding: '0.75rem 1.25rem',
          background: 'var(--bg-surface-elevated)',
          borderBottom: 'var(--border-thick)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FF5252', border: '1px solid #000' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FFD700', border: '1px solid #000' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#69F0AE', border: '1px solid #000' }} />
            </div>
            <span style={{ fontFamily: 'monospace', fontWeight: '900', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
              STAGE_DIRECTORY://STAGES/STAGE_{activeStageFolder < 10 ? `0${activeStageFolder}` : activeStageFolder}/
            </span>
          </div>

          {/* View Mode Toggle Switcher */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              onClick={() => setViewMode('folder')}
              className={`filter-pill ${viewMode === 'folder' ? 'active active-yellow' : ''}`}
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}
            >
              <Folder size={13} /> Level Folder Focus
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`filter-pill ${viewMode === 'all' ? 'active active-cyan' : ''}`}
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}
            >
              <Layers size={13} /> Expand All 10 Stages
            </button>
          </div>
        </div>

        {/* Stage Level Folder Navigator Bar (Tabs) */}
        <div style={{
          padding: '1rem 1.25rem',
          background: 'var(--bg-canvas)',
          borderBottom: 'var(--border-thin)',
          display: 'flex',
          gap: '0.6rem',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch'
        }} className="no-scrollbar">
          {PREP_STAGES.map((stage) => {
            const stats = getStageStats(stage.id);
            const isSelected = activeStageFolder === stage.id;

            return (
              <button
                key={stage.id}
                onClick={() => {
                  if (!stats.isLocked) {
                    setActiveStageFolder(stage.id);
                  }
                }}
                disabled={stats.isLocked}
                style={{
                  padding: '0.55rem 0.95rem',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected ? '2px solid #000' : 'var(--border-thin)',
                  backgroundColor: isSelected 
                    ? 'var(--theme-yellow)' 
                    : stats.isCompleted 
                      ? 'var(--bg-surface-elevated)' 
                      : stats.isLocked 
                        ? 'var(--bg-canvas)' 
                        : 'var(--bg-surface)',
                  color: isSelected ? '#000' : stats.isLocked ? 'var(--text-muted)' : 'var(--text-primary)',
                  cursor: stats.isLocked ? 'not-allowed' : 'pointer',
                  opacity: stats.isLocked ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  whiteSpace: 'nowrap',
                  boxShadow: isSelected ? 'var(--shadow-tiny)' : 'none',
                  transition: 'var(--transition-fast)',
                  fontWeight: '800',
                  fontSize: '0.8rem'
                }}
              >
                {stats.isCompleted ? (
                  <CheckCircle size={14} color={isSelected ? '#000' : 'var(--theme-green)'} />
                ) : stats.isLocked ? (
                  <Lock size={14} />
                ) : isSelected ? (
                  <FolderOpen size={14} color="#000" />
                ) : (
                  <Folder size={14} color="var(--theme-yellow)" />
                )}
                <span>Stage {stage.id}</span>
                <span style={{
                  fontSize: '0.65rem',
                  padding: '1px 5px',
                  borderRadius: '4px',
                  background: isSelected ? '#000' : 'var(--bg-surface-elevated)',
                  color: isSelected ? '#fff' : 'var(--text-muted)'
                }}>
                  {stats.completedUnits}/10
                </span>
              </button>
            );
          })}
        </div>

        {/* Level Folder Content Container */}
        <div style={{ padding: '1.5rem 2rem' }}>
          {viewMode === 'folder' ? (
            /* FOCUSED LEVEL FOLDER VIEW */
            <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Folder Banner Header */}
              <div style={{
                background: 'linear-gradient(135deg, var(--bg-surface) 0%, hsla(var(--secondary), 0.08) 100%)',
                border: 'var(--border-thick)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                boxShadow: 'var(--shadow-small)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: selectedStageStats.isCompleted ? 'var(--theme-green)' : selectedStageStats.isActive ? 'var(--theme-yellow)' : 'var(--bg-surface-elevated)',
                    border: 'var(--border-thick)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#000',
                    fontWeight: '900',
                    fontSize: '1.2rem',
                    boxShadow: 'var(--shadow-tiny)'
                  }}>
                    {selectedStageStats.isCompleted ? <CheckCircle size={24} /> : `S${selectedStageData.id}`}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <h2 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-title)', fontWeight: '900', color: 'var(--text-primary)' }}>
                        Stage {selectedStageData.id}: {selectedStageData.name}
                      </h2>
                      {selectedStageStats.isActive && (
                        <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--theme-yellow)', color: '#000', fontWeight: '900', border: '1px solid #000' }}>
                          ACTIVE STAGE
                        </span>
                      )}
                      {selectedStageStats.isCompleted && (
                        <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--theme-green)', color: '#000', fontWeight: '900', border: '1px solid #000' }}>
                          QUALIFIED (SCORE: {state.levelAttempts?.[selectedStageData.id]?.score}%)
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      {selectedStageData.desc}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem', minWidth: '160px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)' }}>
                    Stage Mastery: <strong style={{ color: 'var(--theme-yellow)' }}>{selectedStageStats.percent}%</strong> ({selectedStageStats.mastered}/{selectedStageStats.words.length} words)
                  </span>
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-canvas)', border: 'var(--border-thin)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${selectedStageStats.percent}%`,
                      height: '100%',
                      backgroundColor: selectedStageStats.percent >= 100 ? 'var(--theme-green)' : 'var(--theme-yellow)',
                      transition: 'width 0.4s ease'
                    }} />
                  </div>
                </div>
              </div>

              {/* Units Grid inside Folder */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '1rem'
              }}>
                {Array.from({ length: 10 }).map((_, index) => {
                  const unitNum = index + 1;
                  const wordsPerU = selectedStageStats.words.length ? Math.ceil(selectedStageStats.words.length / 10) : 19;
                  const uStart = (unitNum - 1) * wordsPerU;
                  const uEnd = Math.min(unitNum * wordsPerU, selectedStageStats.words.length);
                  const uWords = selectedStageStats.words.slice(uStart, uEnd);
                  const uWordIds = uWords.map(w => w.id);
                  const masteredCount = (state.masteredWordIds || []).filter(id => uWordIds.includes(id)).length;
                  const totalCount = uWords.length || 19;
                  const unitPercent = totalCount ? Math.round((masteredCount / totalCount) * 100) : 0;

                  // Unlocked check
                  let isUnitUnlocked = true;
                  if (unitNum > 1 && !selectedStageStats.isCompleted) {
                    const prevStart = (unitNum - 2) * wordsPerU;
                    const prevEnd = Math.min((unitNum - 1) * wordsPerU, selectedStageStats.words.length);
                    const prevWords = selectedStageStats.words.slice(prevStart, prevEnd);
                    const prevWordIds = prevWords.map(w => w.id);
                    const prevMastered = (state.masteredWordIds || []).filter(id => prevWordIds.includes(id)).length;
                    const prevPercent = prevWords.length ? Math.round((prevMastered / prevWords.length) * 100) : 0;
                    isUnitUnlocked = prevPercent >= 70;
                  }

                  const isCurrentActive = isUnitUnlocked && masteredCount < totalCount && selectedStageStats.isActive;

                  return (
                    <div
                      key={unitNum}
                      style={{
                        padding: '1rem 1.25rem',
                        border: isCurrentActive ? '2.5px solid var(--theme-yellow)' : 'var(--border-thick)',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: isCurrentActive ? 'var(--bg-surface-elevated)' : isUnitUnlocked ? 'var(--bg-surface)' : 'var(--bg-canvas)',
                        boxShadow: isCurrentActive ? 'var(--shadow-medium)' : isUnitUnlocked ? 'var(--shadow-tiny)' : 'none',
                        opacity: isUnitUnlocked ? 1 : 0.6,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        position: 'relative',
                        transition: 'var(--transition-normal)'
                      }}
                    >
                      {/* Unit Card Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ fontWeight: '900', fontSize: '0.95rem', color: isUnitUnlocked ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                            Unit {selectedStageData.id}.{unitNum}
                          </span>
                          {isCurrentActive && (
                            <span style={{ fontSize: '0.65rem', color: 'hsl(var(--secondary))', fontWeight: '900' }}>
                              ● CURRENT
                            </span>
                          )}
                        </div>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: '800',
                          padding: '0.15rem 0.4rem',
                          borderRadius: '4px',
                          background: unitPercent === 100 ? 'var(--theme-green)' : 'var(--bg-surface-elevated)',
                          color: unitPercent === 100 ? '#000' : 'var(--text-muted)'
                        }}>
                          {unitPercent === 100 ? 'MASTERED' : `${totalCount} words`}
                        </span>
                      </div>

                      {/* Mastery Bar */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', fontWeight: '700' }}>
                          <span>Mastery</span>
                          <span>{masteredCount}/{totalCount} ({unitPercent}%)</span>
                        </div>
                        <div style={{ height: '8px', backgroundColor: 'var(--bg-canvas)', border: 'var(--border-thin)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            width: `${unitPercent}%`,
                            backgroundColor: unitPercent >= 100 ? 'var(--theme-green)' : 'var(--theme-cyan)',
                            transition: 'width 0.3s ease'
                          }} />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {isUnitUnlocked ? (
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.25rem' }}>
                          <button
                            onClick={() => {
                              if (setSelectedUnit) setSelectedUnit(unitNum);
                              setActiveView('flashcards', unitNum);
                            }}
                            className="btn btn-primary"
                            style={{ flex: 1, padding: '0.45rem', fontSize: '0.75rem', gap: '0.35rem' }}
                          >
                            <BookOpen size={13} /> Study
                          </button>
                          <button
                            onClick={() => {
                              if (setSelectedUnit) setSelectedUnit(unitNum);
                              setActiveView('quizzes', unitNum);
                            }}
                            className="btn btn-secondary"
                            style={{ flex: 1, padding: '0.45rem', fontSize: '0.75rem', gap: '0.35rem' }}
                          >
                            <Award size={13} /> Quiz
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 'auto', paddingTop: '0.25rem' }}>
                          <Lock size={12} /> Locked (Need 70% in Unit {selectedStageData.id}.{unitNum - 1})
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Cumulative Qualification Exam for this stage */}
                <div 
                  style={{
                    gridColumn: '1 / -1',
                    padding: '1.25rem 1.5rem',
                    background: 'linear-gradient(135deg, var(--bg-surface) 0%, hsla(var(--secondary), 0.12) 100%)',
                    border: 'var(--border-thick)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    boxShadow: 'var(--shadow-small)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--theme-yellow)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#000',
                      border: 'var(--border-thin)'
                    }}>
                      <Trophy size={22} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: '900', color: 'var(--text-primary)' }}>
                        Stage {selectedStageData.id} Cumulative Qualification Exam
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Required score: 70%+ across all words in this stage to qualify and unlock next stage.
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (setSelectedUnit) setSelectedUnit(10);
                      setActiveView('quizzes');
                    }}
                    className="btn btn-accent"
                    style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}
                  >
                    Launch Stage Exam <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* EXPAND ALL 10 STAGES TREE VIEW */
            <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {PREP_STAGES.map((stage) => {
                const stats = getStageStats(stage.id);

                return (
                  <div
                    key={stage.id}
                    style={{
                      border: stats.isActive ? '2.5px solid var(--theme-yellow)' : 'var(--border-thick)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: stats.isActive ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
                      boxShadow: stats.isActive ? 'var(--shadow-medium)' : 'var(--shadow-tiny)',
                      padding: '1.25rem 1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                      opacity: stats.isLocked ? 0.6 : 1
                    }}
                  >
                    {/* Stage Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: stats.isCompleted ? 'var(--theme-green)' : stats.isActive ? 'var(--theme-yellow)' : 'var(--bg-canvas)',
                          border: 'var(--border-thick)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#000',
                          fontWeight: '900',
                          fontSize: '0.9rem'
                        }}>
                          {stats.isCompleted ? <CheckCircle size={16} /> : stats.isLocked ? <Lock size={14} /> : stage.id}
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: stats.isActive ? 'hsl(var(--secondary))' : 'var(--text-primary)' }}>
                            Stage {stage.id}: {stage.name}
                          </h3>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {stage.desc}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)' }}>
                          {stats.completedUnits}/10 Units ({stats.percent}%)
                        </span>
                        {!stats.isLocked && (
                          <button
                            onClick={() => {
                              setActiveStageFolder(stage.id);
                              setViewMode('folder');
                            }}
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                          >
                            Open Folder →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
