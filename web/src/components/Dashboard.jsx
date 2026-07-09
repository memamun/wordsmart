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

const BB_PREP_TIPS = [
  "Bangladesh Bank Recruitment Prelims allocate a heavy weight to English vocabulary (15-20% of total score).",
  "Sentence completion questions in BB tests require understanding the secondary definitions and grammatical collocations.",
  "Analogies test your logical connections. Make sure to establish a clear sentence relating the two words in the base pair.",
  "Make flashcards a daily habit! Spaced repetition is the only proven way to retain 1,900+ high-frequency GRE/BB words.",
  "Written Exams feature a translation section (English to Bangla & Bangla to English). Knowing precise meanings is essential.",
  "Look up mnemonics for words that just won't stick. Memory anchors save precious seconds in exam conditions."
];

export default function Dashboard({ state, wordsData, setActiveView, selectedUnit, setSelectedUnit }) {
  const currentStage = PREP_STAGES.find(s => s.id === state.unlockedLevel) || PREP_STAGES[0];
  
  // Stats calculations
  const totalMastered = state.masteredWordIds.length;
  const totalLearning = state.learningWordIds.length;
  const masteryPercentage = wordsData.words.length > 0 
    ? Math.round((totalMastered / wordsData.words.length) * 100) 
    : 0;

  // Selected random tip
  const randomTip = React.useMemo(() => {
    return BB_PREP_TIPS[Math.floor(Math.random() * BB_PREP_TIPS.length)];
  }, []);

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }} className="animate-fade dashboard-container">
      {/* Welcome Banner */}
      <div className="glass-panel welcome-banner" style={{
        padding: '2rem',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(30, 41, 59, 0.4) 100%)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '2rem'
      }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)', marginBottom: '0.5rem' }}>
            Road to Bangladesh Bank AD
          </h1>
          <p style={{ color: 'hsl(var(--text-secondary))', lineHeight: '1.5', maxWidth: '600px' }}>
            Prepare systematically for the central bank recruitment. Unlock 10 stages of specialized exam-prep, earn budget coins for hints, and master {wordsData.words.length || 1913} high-frequency words.
          </p>
        </div>
        <div className="motivation-card" style={{
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'hsl(var(--bg-canvas) / 0.8)',
          border: '1px solid hsla(var(--primary), 0.2)',
          maxWidth: '350px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'hsl(var(--primary))', fontWeight: '700', fontSize: '0.85rem' }}>
            <Brain size={16} />
            <span>EXAM PREP MOTIVATION</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', fontStyle: 'italic', lineHeight: '1.4' }}>
            "{randomTip}"
          </p>
        </div>
      </div>

      {/* Grid Stats Highlights */}
      <div className="grid-cols-responsive">
        {/* Words Mastered */}
        <div className="card card-hover" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'hsla(var(--primary), 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'hsl(var(--primary))'
          }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', fontWeight: '700' }}>WORDS MASTERED</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', fontFamily: 'var(--font-title)' }}>
              {totalMastered} <span style={{ fontSize: '0.9rem', color: 'hsl(var(--text-muted))', fontWeight: '500' }}>/ {wordsData.words.length || 1913}</span>
            </div>
          </div>
        </div>

        {/* Mastery Rate */}
        <div className="card card-hover" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'hsla(var(--accent-purple), 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'hsl(var(--accent-purple))'
          }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', fontWeight: '700' }}>MASTERY RATE</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', fontFamily: 'var(--font-title)', color: 'hsl(var(--accent-purple))' }}>
              {masteryPercentage}%
            </div>
          </div>
        </div>

        {/* Current Target Stage */}
        <div className="card card-hover" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'hsla(var(--secondary), 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'hsl(var(--secondary))'
          }}>
            <Trophy size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', fontWeight: '700' }}>PREP STAGE REACHED</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', fontFamily: 'var(--font-title)', color: 'hsl(var(--secondary))' }}>
              {state.unlockedLevel}/10
            </div>
          </div>
        </div>
      </div>

      {/* Specialized Vocabulary & Grammar Modules banner */}
      <div className="glass-panel" style={{
        padding: '1.5rem 2rem',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(30, 41, 59, 0.4) 100%)',
        border: '1px solid hsla(var(--accent-purple), 0.25)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '2rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(var(--accent-purple))', fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
            <Book size={16} />
            <span>SPECIALIZED RECRUITMENT DECK</span>
          </div>
          <h2 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-title)', color: 'white' }}>
            Bangladesh Bank AD Grammar & Usage Guide
          </h2>
          <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.85rem', marginTop: '0.25rem', lineHeight: '1.4' }}>
            Master common usage errors, abbreviations, foreign expressions, and register terminology (Finance, Arts, Computer, and Science lists) with definitions and example sentences.
          </p>
        </div>
        <button 
          onClick={() => setActiveView('specialized')}
          className="btn btn-accent"
          style={{ 
            padding: '0.75rem 1.5rem', 
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 15px -3px hsla(var(--accent-purple), 0.4)',
            backgroundColor: 'hsl(var(--accent-purple))',
            borderColor: 'hsl(var(--accent-purple))'
          }}
        >
          Explore Specialized Vocabs →
        </button>
      </div>

      {/* Progression Roadmap */}
      <div className="glass-panel roadmap-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-title)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Award color="hsl(var(--primary))" />
          Exam Preparation Roadmap
        </h2>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          position: 'relative'
        }}>
          {/* Vertical Timeline Bar */}
          <div className="roadmap-timeline-line" style={{
            position: 'absolute',
            left: '20px',
            top: '20px',
            bottom: '20px',
            width: '2px',
            backgroundColor: 'hsl(var(--border-muted))',
            zIndex: 1
          }}></div>

          {PREP_STAGES.map((stage) => {
            const isCompleted = state.levelAttempts[stage.id]?.passed;
            const isActive = state.unlockedLevel === stage.id;
            const isLocked = stage.id > state.unlockedLevel;

            let bgBubble = 'hsl(var(--bg-canvas))';
            let borderBubble = 'hsl(var(--border-muted))';

            if (isCompleted) {
              bgBubble = 'hsla(var(--primary), 0.1)';
              borderBubble = 'hsl(var(--primary))';
            } else if (isActive) {
              bgBubble = 'hsla(var(--secondary), 0.1)';
              borderBubble = 'hsl(var(--secondary))';
            }

            return (
              <div 
                key={stage.id} 
                className="animate-slide-up roadmap-node"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1.5rem',
                  position: 'relative',
                  zIndex: 2,
                  opacity: isLocked ? 0.6 : 1,
                  padding: '0.5rem 0'
                }}
              >
                {/* Node Status Bubble */}
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: bgBubble,
                  border: `2px solid ${borderBubble}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isCompleted ? 'hsl(var(--primary))' : isActive ? 'hsl(var(--secondary))' : 'hsl(var(--text-muted))',
                  boxShadow: isActive ? '0 0 12px hsla(var(--secondary), 0.3)' : 'none',
                  transition: 'var(--transition-normal)',
                  marginTop: '0.2rem'
                }}>
                  {isCompleted ? <CheckCircle size={20} /> : isLocked ? <Lock size={16} /> : <span style={{ fontWeight: '800', fontFamily: 'var(--font-title)' }}>{stage.id}</span>}
                </div>

                {/* Content Card */}
                <div className="card roadmap-card" style={{
                  flex: 1,
                  padding: '1.1rem 1.5rem',
                  backgroundColor: isActive ? 'hsl(var(--bg-surface-elevated))' : 'hsl(var(--bg-surface) / 0.5)',
                  border: isActive ? '1px solid hsla(var(--secondary), 0.3)' : '1px solid hsl(var(--border-muted))',
                  display: 'flex',
                  flexDirection: isActive ? 'column' : 'row',
                  alignItems: isActive ? 'stretch' : 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  boxShadow: isActive ? '0 4px 20px -4px rgba(0, 0, 0, 0.4)' : 'none'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <h3 style={{ 
                        fontSize: '1.1rem', 
                        color: isActive ? 'hsl(var(--secondary))' : 'hsl(var(--text-primary))',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        flexWrap: 'wrap'
                      }}>
                        Stage {stage.id}: {stage.name}
                        {isActive && <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', borderRadius: 'var(--radius-full)', backgroundColor: 'hsla(var(--secondary), 0.15)', color: 'hsl(var(--secondary))', fontWeight: '700' }}>ACTIVE PHASE</span>}
                        {isCompleted && <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', borderRadius: 'var(--radius-full)', backgroundColor: 'hsla(var(--primary), 0.15)', color: 'hsl(var(--primary))', fontWeight: '700' }}>QUALIFIED</span>}
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', marginTop: '0.25rem' }}>
                        {stage.desc}
                      </p>
                    </div>

                    {isCompleted && (
                      <div style={{ color: 'hsl(var(--text-muted))', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span>Best Score: {state.levelAttempts[stage.id]?.score}%</span>
                      </div>
                    )}
                    {isLocked && (
                      <div style={{ color: 'hsl(var(--text-muted))', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Lock size={14} /> Locked
                      </div>
                    )}
                  </div>

                  {/* Render Bite-sized Units inside Active Stage */}
                  {isActive && (
                    <div className="active-stage-units" style={{
                      marginTop: '1.25rem',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                      gap: '1rem',
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
                        const masteredInUnit = state.masteredWordIds.filter(id => unitWordIds.includes(id)).length;
                        const totalInUnit = unitWords.length;
                        const unitPercent = totalInUnit ? Math.round((masteredInUnit / totalInUnit) * 100) : 0;
                        
                        // Unlocked status
                        let isUnitUnlocked = true;
                        if (unitNum > 1) {
                          const prevStart = (unitNum - 2) * wordsPerUnit;
                          const prevEnd = Math.min((unitNum - 1) * wordsPerUnit, levelWords.length);
                          const prevUnitWords = levelWords.slice(prevStart, prevEnd);
                          const prevUnitWordIds = prevUnitWords.map(w => w.id);
                          const prevMastered = state.masteredWordIds.filter(id => prevUnitWordIds.includes(id)).length;
                          const prevPercent = prevUnitWords.length ? Math.round((prevMastered / prevUnitWords.length) * 100) : 0;
                          isUnitUnlocked = prevPercent >= 70;
                        }

                        return (
                          <div 
                            key={unitNum} 
                            className="glass-panel unit-card"
                            style={{ 
                              padding: '1rem', 
                              border: '1px solid hsl(var(--border-muted))',
                              borderRadius: 'var(--radius-md)',
                              display: 'flex', 
                              flexDirection: 'column', 
                              gap: '0.75rem',
                              opacity: isUnitUnlocked ? 1 : 0.6,
                              pointerEvents: isUnitUnlocked ? 'auto' : 'none',
                              position: 'relative',
                              background: isUnitUnlocked ? 'rgba(30, 41, 59, 0.6)' : 'rgba(15, 23, 42, 0.4)',
                              transition: 'var(--transition-normal)'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: '700', fontSize: '0.9rem', color: isUnitUnlocked ? 'white' : 'hsl(var(--text-muted))' }}>
                                Unit {stage.id}.{unitNum}
                              </span>
                              <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>
                                {totalInUnit} words
                              </span>
                            </div>

                            {/* Progress bar */}
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'hsl(var(--text-secondary))', marginBottom: '0.2rem' }}>
                                <span>Progress</span>
                                <span>{masteredInUnit}/{totalInUnit} ({unitPercent}%)</span>
                              </div>
                              <div style={{ height: '4px', backgroundColor: 'hsl(var(--border-muted))', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{ 
                                  height: '100%', 
                                  width: `${unitPercent}%`, 
                                  backgroundColor: 'hsl(var(--primary))',
                                  borderRadius: '2px',
                                  transition: 'var(--transition-normal)'
                                }}></div>
                              </div>
                            </div>

                            {/* Actions */}
                            {isUnitUnlocked ? (
                              <div style={{ display: 'flex', gap: '0.4rem', marginTop: 'auto' }}>
                                <button
                                  onClick={() => {
                                    setSelectedUnit(unitNum);
                                    setActiveView('flashcards');
                                  }}
                                  className="btn btn-primary"
                                  style={{ flex: 1, padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}
                                >
                                  <BookOpen size={12} /> Study
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedUnit(unitNum);
                                    setActiveView('quizzes');
                                  }}
                                  className="btn btn-accent"
                                  style={{ flex: 1, padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}
                                >
                                  <Award size={12} /> Quiz
                                </button>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'hsl(var(--text-muted))', fontSize: '0.7rem', marginTop: 'auto' }}>
                                <Lock size={12} /> Locked (Need 70% in Unit {stage.id}.{unitNum - 1})
                              </div>
                            )}
                          </div>
                        );
                      })}
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
