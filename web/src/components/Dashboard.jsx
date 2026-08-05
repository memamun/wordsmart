import React from 'react';
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
  Book
} from 'lucide-react';
import { PREP_STAGES } from '../hooks/useGameState';

const STUDY_TIPS = [
  "Spaced repetition is the only proven way to retain 1,900+ high-frequency words long-term.",
  "Create mnemonics for words that don't stick — memory anchors reinforce recall.",
  "Active recall through quizzes and flashcards beats passive reading every time.",
  "Study in focused 25-minute sessions with short breaks for best retention.",
  "Use the review feature to revisit words you're learning — repetition builds mastery.",
  "Learning word roots helps decode unfamiliar vocabulary and expands your range."
];

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

function WelcomeDecoration() {
  return (
    <div className="welcome-decor-container" style={{
      position: 'relative',
      width: '160px',
      height: '160px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      margin: '0 auto'
    }}>
      {/* Neo-brutalist floating elements */}
      <svg width="120" height="120" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(var(--shadow-small))' }}>
        {/* Outer dotted grid circle */}
        <circle cx="80" cy="80" r="70" stroke="var(--text-muted)" strokeWidth="2" strokeDasharray="6 6" opacity="0.3" />
        
        {/* Main circular frame */}
        <circle cx="80" cy="80" r="55" fill="var(--bg-canvas)" stroke="var(--border-muted)" strokeWidth="4" />
        
        {/* Inner grid lines */}
        <path d="M40 80H120" stroke="var(--border-muted)" strokeWidth="2" opacity="0.5" />
        <path d="M80 40V120" stroke="var(--border-muted)" strokeWidth="2" opacity="0.5" />
        
        {/* Neobrutalist accent shape: star/burst */}
        <path d="M80 50L84 76L110 80L84 84L80 110L76 84L50 80L76 76L80 50Z" fill="var(--theme-yellow)" stroke="var(--border-muted)" strokeWidth="3" />
        
        {/* Small floating sparkles/dots */}
        <circle cx="45" cy="55" r="5" fill="var(--theme-cyan)" stroke="var(--border-muted)" strokeWidth="2" />
        <circle cx="115" cy="115" r="4" fill="var(--theme-purple)" stroke="var(--border-muted)" strokeWidth="2" />
        <path d="M110 50L115 55M115 50L110 55" stroke="var(--theme-green)" strokeWidth="3" strokeLinecap="round" />
        <path d="M50 110L55 115M55 110L50 115" stroke="var(--theme-yellow)" strokeWidth="3" strokeLinecap="round" />
      </svg>
      
      {/* Floating vocabulary badge */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        right: '5px',
        background: 'var(--theme-cyan)',
        color: 'var(--text-black)',
        border: 'var(--border-thin)',
        boxShadow: 'var(--shadow-tiny)',
        padding: '0.25rem 0.5rem',
        borderRadius: 'var(--radius-md)',
        fontWeight: '900',
        fontSize: '0.65rem',
        transform: 'rotate(8deg)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        animation: 'float 3s ease-in-out infinite'
      }}>
        VOCAB PRO
      </div>
      
      {/* Floating streak badge */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '5px',
        background: 'var(--theme-purple)',
        color: 'var(--text-black)',
        border: 'var(--border-thin)',
        boxShadow: 'var(--shadow-tiny)',
        padding: '0.25rem 0.5rem',
        borderRadius: 'var(--radius-md)',
        fontWeight: '900',
        fontSize: '0.65rem',
        transform: 'rotate(-8deg)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        animation: 'float 3.5s ease-in-out infinite alternate'
      }}>
        LEVEL UP ⚡
      </div>
    </div>
  );
}

function SpecializedDecoration() {
  return (
    <div className="welcome-decor-container" style={{
      position: 'relative',
      width: '120px',
      height: '100px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      margin: '0 auto',
      animation: 'float 3.2s ease-in-out infinite'
    }}>
      {/* Stack of English and Bengali card graphics */}
      <div style={{
        position: 'absolute',
        width: '55px',
        height: '70px',
        background: 'var(--theme-purple)',
        border: 'var(--border-thick)',
        borderRadius: 'var(--radius-lg)',
        transform: 'rotate(-15deg) translate(-20px, 0px)',
        boxShadow: 'var(--shadow-small)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '900',
        color: 'var(--text-black)',
        fontSize: '1.25rem',
        fontFamily: 'var(--font-title)'
      }}>
        A
      </div>
      <div style={{
        position: 'absolute',
        width: '55px',
        height: '70px',
        background: 'var(--theme-yellow)',
        border: 'var(--border-thick)',
        borderRadius: 'var(--radius-lg)',
        transform: 'rotate(5deg) translate(15px, -5px)',
        boxShadow: 'var(--shadow-small)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '900',
        color: 'var(--text-black)',
        fontSize: '1.25rem',
        fontFamily: 'var(--font-title)',
        zIndex: 2
      }}>
        অ
      </div>
    </div>
  );
}

function WindowPanel({ title, headerColor, shadowVar, className, style, children }) {
  return (
    <div className={`card-hover ${className}`} style={{
      backgroundColor: 'var(--bg-surface)',
      border: 'var(--border-thick)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: shadowVar,
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
  
  // Stats calculations
  const totalMastered = state.masteredWordIds.length;
  const totalLearning = state.learningWordIds.length;
  const masteryPercentage = wordsData.words.length > 0 
    ? Math.round((totalMastered / wordsData.words.length) * 100) 
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

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }} className="animate-fade dashboard-container">
      {/* Bento Grid Highlights */}
      <div className="dashboard-bento">
        {/* Welcome Banner */}
        <WindowPanel
          title="WORDSMART_OS_v1.0.SYS"
          headerColor="var(--theme-green)"
          shadowVar="var(--welcome-shadow)"
          className="welcome-banner bento-welcome"
          style={{
            background: 'var(--welcome-bg)',
            color: 'var(--welcome-text)',
            border: 'var(--welcome-border)',
            borderRadius: 'var(--radius-lg)'
          }}
        >
          <div className="bento-welcome-content">
            <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)', fontWeight: '900', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              Master 1,900+ High-Frequency Words
            </h1>
            <p style={{ color: 'var(--welcome-subtext)', fontWeight: '600', lineHeight: '1.5', maxWidth: '800px' }}>
              Progress through 10 stages of vocabulary mastery. Use flashcards, spaced repetition, and quizzes to retain every word long-term. Earn coins for hints and climb the leaderboard.
            </p>
          </div>
          <WelcomeDecoration />
        </WindowPanel>

        {/* Words Mastered */}
        <WindowPanel
          title="MASTERED_WORDS.DLL"
          headerColor="var(--theme-cyan)"
          shadowVar="var(--stats-shadow-1)"
          className="bento-card-1"
          style={{ padding: 0 }}
        >
          {/* Large Watermark Background Icon */}
          <ShieldCheck size={96} style={{
            position: 'absolute',
            right: '-10px',
            bottom: '-15px',
            color: 'hsl(var(--primary))',
            opacity: 0.08,
            transform: 'rotate(-15deg)',
            pointerEvents: 'none'
          }} />
          {/* Accent glow circle */}
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
          {/* Top-right Status Pill */}
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
              {totalMastered} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500' }}>/ {wordsData.words.length || 1913}</span>
            </div>
          </div>
          {/* Right visual indicator: Block Meter */}
          <BlockMeter value={totalMastered} max={wordsData.words.length || 1913} color="hsl(var(--primary))" />
          {/* Dynamic Progress Line indicator at bottom */}
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

        {/* Mastery Rate */}
        <WindowPanel
          title="MASTERY_RATE.EXE"
          headerColor="var(--theme-purple)"
          shadowVar="var(--stats-shadow-2)"
          className="bento-card-2"
          style={{ padding: 0 }}
        >
          {/* Large Watermark Background Icon */}
          <TrendingUp size={96} style={{
            position: 'absolute',
            right: '-10px',
            bottom: '-15px',
            color: 'hsl(var(--accent-purple))',
            opacity: 0.08,
            transform: 'rotate(-15deg)',
            pointerEvents: 'none'
          }} />
          {/* Accent glow circle */}
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
          {/* Top-right Status Pill */}
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
            Success
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', zIndex: 2 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '800', letterSpacing: '0.05em' }}>MASTERY RATE</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '900', fontFamily: 'var(--font-title)', color: 'hsl(var(--accent-purple))', marginTop: '0.15rem' }}>
              {masteryPercentage}%
            </div>
          </div>
          {/* Right visual indicator: Block Meter */}
          <BlockMeter value={masteryPercentage} max={100} color="hsl(var(--accent-purple))" />
          {/* Dynamic Progress Line indicator at bottom */}
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

        {/* Specialized Vocabulary & Grammar Modules banner */}
        <WindowPanel
          title="GRAMMAR_MODULE.TXT"
          headerColor="var(--theme-purple)"
          shadowVar="var(--spec-shadow)"
          className="bento-specialized"
          style={{
            background: 'var(--spec-bg)',
            color: 'var(--spec-text)',
            border: 'var(--spec-border)',
            borderRadius: 'var(--radius-lg)'
          }}
        >
          {/* Background glow lines */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            left: '-50px',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: 'hsla(var(--secondary), 0.05)',
            filter: 'blur(30px)',
            pointerEvents: 'none'
          }} />
          <div style={{ flex: 1, minWidth: '250px', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--spec-text)', fontWeight: '900', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
              <Book size={16} color="var(--spec-text)" />
              <span>SPECIALIZED VOCABULARY</span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-title)', fontWeight: '900', color: 'var(--spec-text)', textTransform: 'uppercase' }}>
              Grammar, Usage & Specialized Terms
            </h2>
            <p style={{ color: 'var(--spec-subtext)', fontSize: '0.9rem', fontWeight: '700', marginTop: '0.25rem', lineHeight: '1.4' }}>
              Master common usage errors, abbreviations, foreign expressions, and register terminology across multiple domains with definitions and example sentences.
            </p>
          </div>
          <SpecializedDecoration />
          <button 
            onClick={() => setActiveView('specialized')}
            className="btn btn-secondary bento-specialized-btn"
            style={{ 
              padding: '0.75rem 1.5rem', 
              whiteSpace: 'nowrap',
              zIndex: 3
            }}
          >
            Explore Specialized Vocabs →
          </button>
        </WindowPanel>

        {/* Current Target Stage / Prep Stage Reached */}
        <WindowPanel
          title="PREP_STAGE.SYS"
          headerColor="var(--theme-yellow)"
          shadowVar="var(--stats-shadow-3)"
          className="bento-card-3"
          style={{ padding: 0 }}
        >
          {/* Large Watermark Background Icon */}
          <Trophy size={96} style={{
            position: 'absolute',
            right: '-10px',
            bottom: '-15px',
            color: 'hsl(var(--secondary))',
            opacity: 0.08,
            transform: 'rotate(-15deg)',
            pointerEvents: 'none'
          }} />
          {/* Accent glow circle */}
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
          {/* Top-right Status Pill */}
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
          {/* Right visual indicator: Block Meter */}
          <BlockMeter value={state.unlockedLevel} max={10} color="hsl(var(--secondary))" />
          {/* Dynamic Progress Line indicator at bottom */}
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
      </div>

      {/* Recommended Next Action Hero Card */}
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

      {/* Progression Roadmap */}
      <div className="glass-panel roadmap-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award color="hsl(var(--primary))" />
            Vocabulary Mastery Roadmap
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '800' }}>
            10 STAGES • 100 UNITS
          </span>
        </div>

        {/* Stage Selector Pills (Horizontal Touch Bar) */}
        <div className="pill-tabs no-scrollbar" style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.75rem',
          marginBottom: '1.5rem',
          WebkitOverflowScrolling: 'touch'
        }}>
          {PREP_STAGES.map((stage) => {
            const isCompleted = state.levelAttempts[stage.id]?.passed;
            const isActive = state.unlockedLevel === stage.id;
            const isLocked = stage.id > state.unlockedLevel;

            return (
              <button
                key={stage.id}
                onClick={() => {
                  if (!isLocked) {
                    if (setSelectedUnit) setSelectedUnit(1);
                  }
                }}
                disabled={isLocked}
                className={`pill-tab ${isActive ? 'active active-yellow' : isCompleted ? 'active-green' : ''}`}
                style={{
                  padding: '0.5rem 0.85rem',
                  fontSize: '0.8rem',
                  fontWeight: '900',
                  borderRadius: 'var(--radius-full)',
                  border: isActive ? '2px solid #000' : 'var(--border-thin)',
                  backgroundColor: isActive ? 'var(--theme-yellow)' : isCompleted ? 'var(--theme-green)' : isLocked ? 'var(--bg-canvas)' : 'var(--bg-surface)',
                  color: isLocked ? 'var(--text-muted)' : 'var(--text-black)',
                  cursor: isLocked ? 'not-allowed' : 'pointer',
                  opacity: isLocked ? 0.5 : 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  whiteSpace: 'nowrap',
                  boxShadow: isActive ? 'var(--shadow-tiny)' : 'none',
                  transition: 'var(--transition-fast)'
                }}
              >
                {isCompleted ? (
                  <CheckCircle size={12} color="#000" />
                ) : isLocked ? (
                  <Lock size={12} />
                ) : (
                  <span style={{ fontSize: '0.7rem' }}>S{stage.id}</span>
                )}
                <span>Stage {stage.id}</span>
                {isActive && <span style={{ fontSize: '0.65rem', background: '#000', color: '#fff', padding: '1px 5px', borderRadius: '99px' }}>ACTIVE</span>}
              </button>
            );
          })}
        </div>
        
        {/* Stages Display List */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          position: 'relative'
        }}>
          {PREP_STAGES.map((stage) => {
            const isCompleted = state.levelAttempts[stage.id]?.passed;
            const isActive = state.unlockedLevel === stage.id;
            const isLocked = stage.id > state.unlockedLevel;

            return (
              <div 
                key={stage.id} 
                className="animate-slide-up roadmap-node"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  position: 'relative',
                  zIndex: 2,
                  opacity: isLocked ? 0.6 : 1,
                  padding: '0.25rem 0'
                }}
              >
                {/* Stage Header Card */}
                <div className="card roadmap-card" style={{
                  padding: '1.25rem 1.5rem',
                  backgroundColor: isActive ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
                  border: isActive ? '2px solid var(--theme-yellow)' : 'var(--border-thick)',
                  boxShadow: isActive ? 'var(--shadow-medium)' : 'var(--shadow-tiny)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  borderRadius: 'var(--radius-md)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="roadmap-status-bubble" style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        backgroundColor: isCompleted ? 'var(--theme-green)' : isActive ? 'var(--theme-yellow)' : 'var(--bg-canvas)',
                        border: 'var(--border-thick)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-black)',
                        fontWeight: '900',
                        fontFamily: 'var(--font-title)',
                        boxShadow: isActive ? 'var(--shadow-tiny)' : 'none',
                        flexShrink: 0
                      }}>
                        {isCompleted ? <CheckCircle size={18} color="#000" /> : isLocked ? <Lock size={14} color="var(--text-muted)" /> : stage.id}
                      </div>

                      <div>
                        <h3 style={{ 
                          fontSize: '1.15rem', 
                          color: isActive ? 'hsl(var(--secondary))' : 'var(--text-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          flexWrap: 'wrap'
                        }}>
                          Stage {stage.id}: {stage.name}
                          {isActive && <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--theme-yellow)', color: '#000', fontWeight: '800', border: '1px solid #000' }}>ACTIVE</span>}
                          {isCompleted && <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--theme-green)', color: '#000', fontWeight: '800', border: '1px solid #000' }}>QUALIFIED</span>}
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                          {stage.desc}
                        </p>
                      </div>
                    </div>

                    {isCompleted && (
                      <div style={{ color: 'var(--theme-green)', fontSize: '0.85rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span>Best Score: {state.levelAttempts[stage.id]?.score}%</span>
                      </div>
                    )}
                    {isLocked && (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Lock size={14} /> Locked
                      </div>
                    )}
                  </div>

                  {/* Render Bite-sized Units inside Active Stage */}
                  {isActive && (
                    <div className="active-stage-units" style={{
                      marginTop: '0.75rem',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                      gap: '0.85rem',
                      width: '100%'
                    }}>
                      {Array.from({ length: 10 }).map((_, index) => {
                        const unitNum = index + 1;
                        
                        // Get words list for this unit
                        const levelWords = wordsData?.getWordsForLevel(stage.id) || [];
                        const wordsPerUnit = levelWords.length ? Math.ceil(levelWords.length / 10) : 19;
                        const start = (unitNum - 1) * wordsPerUnit;
                        const end = Math.min(unitNum * wordsPerUnit, levelWords.length);
                        const unitWords = levelWords.slice(start, end);
                        const unitWordIds = unitWords.map(w => w.id);
                        
                        // Calculate unit progress
                        const masteredInUnit = (state.masteredWordIds || []).filter(id => unitWordIds.includes(id)).length;
                        const totalInUnit = unitWords.length;
                        const unitPercent = totalInUnit ? Math.round((masteredInUnit / totalInUnit) * 100) : 0;
                        
                        // Unlocked status
                        let isUnitUnlocked = true;
                        if (unitNum > 1) {
                          const prevStart = (unitNum - 2) * wordsPerUnit;
                          const prevEnd = Math.min((unitNum - 1) * wordsPerUnit, levelWords.length);
                          const prevUnitWords = levelWords.slice(prevStart, prevEnd);
                          const prevUnitWordIds = prevUnitWords.map(w => w.id);
                          const prevMastered = (state.masteredWordIds || []).filter(id => prevUnitWordIds.includes(id)).length;
                          const prevPercent = prevUnitWords.length ? Math.round((prevMastered / prevUnitWords.length) * 100) : 0;
                          isUnitUnlocked = prevPercent >= 70;
                        }

                        const isCurrentActiveUnit = isUnitUnlocked && masteredInUnit < totalInUnit;

                        return (
                          <div 
                            key={unitNum} 
                            className="roadmap-unit-card"
                            style={{ 
                              padding: '0.85rem 1rem', 
                              border: isCurrentActiveUnit ? '2px solid var(--theme-yellow)' : 'var(--border-thick)',
                              borderRadius: 'var(--radius-md)',
                              display: 'flex', 
                              flexDirection: 'column', 
                              gap: '0.6rem',
                              opacity: isUnitUnlocked ? 1 : 0.6,
                              pointerEvents: isUnitUnlocked ? 'auto' : 'none',
                              position: 'relative',
                              background: isCurrentActiveUnit ? 'var(--bg-surface-elevated)' : isUnitUnlocked ? 'var(--bg-surface)' : 'var(--bg-canvas)',
                              boxShadow: isCurrentActiveUnit ? 'var(--shadow-medium)' : isUnitUnlocked ? 'var(--shadow-tiny)' : 'none',
                              transition: 'var(--transition-normal)'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: '800', fontSize: '0.9rem', color: isUnitUnlocked ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                                Unit {stage.id}.{unitNum}
                                {isCurrentActiveUnit && <span style={{ fontSize: '0.65rem', marginLeft: '0.35rem', color: 'hsl(var(--secondary))', fontWeight: '900' }}>● CURRENT</span>}
                              </span>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700' }}>
                                {totalInUnit} words
                              </span>
                            </div>

                            {/* Progress bar */}
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', fontWeight: '700' }}>
                                <span>Mastery</span>
                                <span>{masteredInUnit}/{totalInUnit} ({unitPercent}%)</span>
                              </div>
                              <div style={{ height: '8px', backgroundColor: 'var(--bg-canvas)', border: 'var(--border-thin)', overflow: 'hidden', borderRadius: '4px' }}>
                                <div style={{ 
                                  height: '100%', 
                                  width: `${unitPercent}%`, 
                                  backgroundColor: unitPercent >= 100 ? 'var(--theme-green)' : 'var(--theme-cyan)',
                                  transition: 'var(--transition-normal)'
                                }}></div>
                              </div>
                            </div>

                            {/* Actions */}
                            {isUnitUnlocked ? (
                              <div className="roadmap-unit-actions" style={{ display: 'flex', gap: '0.4rem', marginTop: '0.2rem' }}>
                                <button
                                  onClick={() => {
                                    if (setSelectedUnit) setSelectedUnit(unitNum);
                                    setActiveView('flashcards', unitNum);
                                  }}
                                  className="btn btn-primary"
                                  style={{ flex: 1, padding: '0.4rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                                >
                                  <BookOpen size={12} /> Study
                                </button>
                                <button
                                  onClick={() => {
                                    if (setSelectedUnit) setSelectedUnit(unitNum);
                                    setActiveView('quizzes', unitNum);
                                  }}
                                  className="btn btn-accent"
                                  style={{ flex: 1, padding: '0.4rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                                >
                                  <Award size={12} /> Quiz
                                </button>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: 'auto' }}>
                                <Lock size={11} /> Locked (Need 70% in Unit {stage.id}.{unitNum - 1})
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Cumulative Qualification Exam Card at end of stage */}
                      <div 
                        className="card"
                        style={{
                          gridColumn: '1 / -1',
                          padding: '1rem 1.25rem',
                          background: 'linear-gradient(135deg, var(--bg-surface) 0%, hsla(var(--secondary), 0.1) 100%)',
                          border: 'var(--border-thick)',
                          borderRadius: 'var(--radius-md)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '0.75rem',
                          marginTop: '0.5rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <Trophy size={24} color="hsl(var(--secondary))" />
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: '900', color: 'var(--text-primary)' }}>
                              Stage {stage.id} Cumulative Qualification Exam
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              Required score: 70%+ to unlock Stage {stage.id + 1}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            if (setSelectedUnit) setSelectedUnit(10);
                            setActiveView('quizzes');
                          }}
                          className="btn btn-accent"
                          style={{ padding: '0.45rem 1rem', fontSize: '0.8rem' }}
                        >
                          Take Stage Exam <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
