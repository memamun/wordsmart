import React, { useState, useEffect, useContext } from 'react';
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from 'framer-motion';
import { 
  Volume2, 
  Bookmark, 
  BookmarkCheck, 
  Award,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DetailPanelContext } from '../App';

export default function FlashcardsView({ state, wordsData, setActiveView, selectedUnit }) {
  const { detailWord, setDetailWord } = useContext(DetailPanelContext);
  const revealMnemonic = detailWord !== null;

  const levelWords = React.useMemo(() => {
    return wordsData.getWordsForUnit(state.unlockedLevel, selectedUnit || 1);
  }, [wordsData, state.unlockedLevel, selectedUnit]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const word = levelWords[currentIndex];

  // Framer Motion Tinder values
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-150, 0, 150], [-15, 0, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);
  
  // Tinder stamp opacity and scale transforms
  const likeOpacity = useTransform(x, [40, 120], [0, 1]);
  const nopeOpacity = useTransform(x, [-120, -40], [1, 0]);
  const likeScale = useTransform(x, [40, 120], [0.8, 1.2]);
  const nopeScale = useTransform(x, [-120, -40], [1.2, 0.8]);

  // Reset animations when card index changes
  useEffect(() => {
    setFlipped(false);
    x.set(0);
  }, [currentIndex]);

  useEffect(() => {
    if (detailWord) {
      setDetailWord(word);
    }
  }, [word?.id]);

  const handleNext = () => {
    setFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % levelWords.length);
    }, 150);
  };

  const triggerRate = async (direction, type) => {
    await animate(x, direction === 'right' ? 600 : -600, { duration: 0.25, ease: 'easeOut' });
    if (type === 'mastered') {
      state.markWordMastered(word.id);
      confetti({
        particleCount: 20,
        spread: 30,
        origin: { y: 0.8 }
      });
    } else {
      state.markWordLearning(word.id);
    }
    handleNext();
  };

  // Keyboard navigation listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (wordsData.loading || levelWords.length === 0) return;

      const target = e.target;
      if (target?.closest?.('button, input, textarea, select, [contenteditable="true"]')) return;

      if (e.key === ' ') {
        e.preventDefault();
        setFlipped(prev => !prev);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        triggerRate('left', 'study');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        triggerRate('right', 'mastered');
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (flipped) {
          setDetailWord(detailWord ? null : word);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [wordsData.loading, levelWords, flipped, currentIndex, word]);

  // Speech synthesis pronunciation
  const speakWord = (text, e) => {
    e.stopPropagation(); // Don't flip the card when clicking audio
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleDragEnd = (event, info) => {
    if (info.offset.x > 120) {
      triggerRate('right', 'mastered');
    } else if (info.offset.x < -120) {
      triggerRate('left', 'study');
    } else {
      animate(x, 0, { duration: 0.1, ease: 'easeOut' });
    }
  };

  if (wordsData.loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1rem' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid hsl(var(--border-muted))', borderTopColor: 'hsl(var(--primary))', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ color: 'hsl(var(--text-secondary))' }}>Loading vocabulary cards...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (levelWords.length === 0) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
        <AlertCircle size={48} color="hsl(var(--danger))" style={{ marginBottom: '1rem' }} />
        <h2 style={{ fontFamily: 'var(--font-title)', marginBottom: '0.5rem' }}>No words available</h2>
        <p style={{ color: 'hsl(var(--text-secondary))' }}>Could not load vocabulary for this level. Please make sure the JSON data is placed correctly.</p>
        <button 
          onClick={() => setActiveView('dashboard')}
          className="btn btn-secondary"
          style={{ marginTop: '1rem' }}
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Count mastered words in this specific Unit
  const levelMasteredCount = levelWords.filter(w => state.masteredWordIds.includes(w.id)).length;
  const levelProgressPercent = Math.round((levelMasteredCount / levelWords.length) * 100);

  useEffect(() => {
    if (levelProgressPercent >= 100) {
      setDetailWord(null);
    }
  }, [levelProgressPercent]);

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', margin: '0 auto' }} className={`animate-fade flashcard-view-container ${revealMnemonic ? 'detail-open' : ''}`}>
      {/* View Navigation Header */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button 
          onClick={() => setActiveView('dashboard')}
          className="btn btn-secondary"
          style={{ padding: '0.40rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
        >
          ← Return to Roadmap
        </button>
        <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', fontWeight: '700' }}>
          STAGE {state.unlockedLevel} / UNIT {selectedUnit || 1}
        </span>
      </div>

      {/* View Header */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-title)' }}>Unit {state.unlockedLevel}.{selectedUnit || 1} Study Quest</h1>
          <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.9rem' }}>
            Master spelling, pronunciation, meaning, and mnemonics for every word.
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: '700' }}>UNIT MASTERY PROGRESS</div>
          <div style={{ fontSize: '1.05rem', fontWeight: '700', color: 'hsl(var(--primary))' }}>
            {levelMasteredCount} / {levelWords.length} mastered ({levelProgressPercent}%)
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: '6px', backgroundColor: 'hsl(var(--border-muted))', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${levelProgressPercent}%`,
          backgroundColor: 'hsl(var(--primary))',
          borderRadius: '4px',
          transition: 'var(--transition-normal)'
        }}></div>
      </div>

      {/* Flashcard Content Area */}
      {levelProgressPercent >= 100 ? (
        <div className="glass-panel animate-fade" style={{
          width: '100%',
          padding: '2.5rem 2rem',
          textAlign: 'center',
          background: 'linear-gradient(135deg, hsla(var(--primary), 0.15) 0%, hsla(var(--bg-surface), 0.7) 100%)',
          border: '1px solid hsl(var(--primary))',
          borderRadius: 'var(--radius-lg)',
          marginTop: '1rem'
        }}>
          <Award size={48} color="hsl(var(--secondary))" style={{ margin: '0 auto 1rem', display: 'block' }} />
          <h2 style={{ fontFamily: 'var(--font-title)', marginBottom: '0.5rem', color: 'hsl(var(--secondary))' }}>
            Unit {state.unlockedLevel}.{selectedUnit || 1} Vocab Completed!
          </h2>
          <p style={{ color: 'hsl(var(--text-secondary))', marginBottom: '1.5rem', maxWidth: '500px', margin: '0 auto 1.5rem', lineHeight: '1.5' }}>
            Congratulations! You have mastered all the words in this unit. Prove your skills in the Unit Quiz or Stage Cumulative Exam to unlock the next levels.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setActiveView('quizzes')}
              className="btn btn-accent"
            >
              Go to Qualification Exam <ArrowRight size={16} />
            </button>
            <button 
              onClick={() => state.resetWordProgress(levelWords.map(w => w.id))}
              className="btn btn-secondary"
            >
              Study Unit Again
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Flashcard wrapper */}
          <motion.div 
            className="flashcard-wrapper"
            style={{
              x,
              rotate,
              opacity,
              userSelect: 'none',
              cursor: 'grab',
              position: 'relative'
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            onClick={() => {
              if (Math.abs(x.get()) < 10) {
                setFlipped(!flipped);
              }
            }}
          >
            {/* Tinder Stamps */}
            <motion.div
              style={{
                opacity: likeOpacity,
                scale: likeScale,
                position: 'absolute',
                top: '5rem',
                left: '2rem',
                zIndex: 30,
                border: '4px solid hsl(var(--primary))',
                color: 'hsl(var(--primary))',
                fontWeight: '900',
                fontSize: '2rem',
                padding: '0.25rem 1.05rem',
                borderRadius: '8px',
                transform: 'rotate(-20deg)',
                pointerEvents: 'none',
                textTransform: 'uppercase',
                backgroundColor: 'hsla(var(--primary), 0.15)',
              }}
            >
              Mastered
            </motion.div>
            <motion.div
              style={{
                opacity: nopeOpacity,
                scale: nopeScale,
                position: 'absolute',
                top: '5rem',
                right: '2rem',
                zIndex: 30,
                border: '4px solid hsl(var(--danger))',
                color: 'hsl(var(--danger))',
                fontWeight: '900',
                fontSize: '2rem',
                padding: '0.25rem 1.05rem',
                borderRadius: '8px',
                transform: 'rotate(20deg)',
                pointerEvents: 'none',
                textTransform: 'uppercase',
                backgroundColor: 'hsla(var(--danger), 0.15)',
              }}
            >
              Study
            </motion.div>

            {/* Inner 3D Flipping Card Container */}
            <motion.div 
              className="flashcard-inner"
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              style={{ transformStyle: 'preserve-3d', height: '100%', width: '100%' }}
            >
              {/* FRONT OF THE CARD */}
              <div className="flashcard-front">
                {/* Top row actions */}
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'absolute', top: '1.5rem', left: 0, padding: '0 2rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'hsl(var(--text-muted))', letterSpacing: '0.1em' }}>
                    CARD {currentIndex + 1} OF {levelWords.length}
                  </span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      state.toggleBookmark(word.id);
                    }}
                    className="min-touch"
                    aria-label={state.bookmarkedWordIds.includes(word.id) ? 'Remove bookmark' : 'Bookmark word'}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: state.bookmarkedWordIds.includes(word.id) ? 'hsl(var(--secondary))' : 'hsl(var(--text-muted))' }}
                  >
                    {state.bookmarkedWordIds.includes(word.id) ? <BookmarkCheck size={22} fill="hsl(var(--secondary))" /> : <Bookmark size={22} />}
                  </button>
                </div>

                {/* Word details */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', margin: 'auto 0' }}>
                  <h2 style={{ fontSize: '3rem', letterSpacing: '-0.02em', color: 'hsl(var(--text-primary))' }}>{word.word.toUpperCase()}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontStyle: 'italic', color: 'hsl(var(--text-secondary))', fontWeight: '500' }}>
                      ({word.part_of_speech})
                    </span>
                    <span style={{ color: 'hsl(var(--text-muted))', fontFamily: 'monospace' }}>
                      /{word.pronunciation}/
                    </span>
                    <button 
                      onClick={(e) => speakWord(word.word, e)}
                      className="min-touch"
                      aria-label="Listen to pronunciation"
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        backgroundColor: 'hsla(var(--primary), 0.1)',
                        border: '1px solid hsla(var(--primary), 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'hsl(var(--primary))'
                      }}
                      title="Listen Pronunciation"
                    >
                      <Volume2 size={18} />
                    </button>
                  </div>
                </div>

                {currentIndex < 3 && (
                  <div style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', position: 'absolute', bottom: '2rem' }}>
                    💡 Click card to flip | Swipe left/right to study/master
                  </div>
                )}
              </div>

              {/* BACK OF THE CARD */}
              <div className="flashcard-back" style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%', padding: '2rem 1.5rem 1.5rem' }}>
                {/* Top row actions (identical to front for design alignment) */}
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'absolute', top: '1.5rem', left: 0, padding: '0 2rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'hsl(var(--text-muted))', letterSpacing: '0.1em' }}>
                    CARD {currentIndex + 1} OF {levelWords.length}
                  </span>
                  {(word.mnemonic || (word.examples && word.examples.length > 0)) && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setDetailWord(word);
                      }}
                        className="min-touch"
                        aria-label="View word details and mnemonic"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--text-muted))' }}
                      title="View Details & Mnemonic"
                    >
                      <Info size={22} />
                    </button>
                  )}
                </div>

                {/* Back Contents (Centered like the front) */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', margin: 'auto 0', width: '100%' }}>
                  {word.bengali_meaning && (
                    <div style={{ fontSize: '2.25rem', fontWeight: '800', color: 'hsl(var(--primary))', lineHeight: '1.3', fontFamily: 'var(--font-title)', textAlign: 'center' }}>
                      {word.bengali_meaning}
                    </div>
                  )}

                  <div style={{ fontSize: '1.25rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.45', fontWeight: '500', maxWidth: '90%', textAlign: 'center', margin: '0 auto' }}>
                    {word.definition}
                  </div>
                </div>

                {/* Bottom notification */}
                {currentIndex < 3 && (
                  <div style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', position: 'absolute', bottom: '2rem', left: 0, right: 0, textAlign: 'center' }}>
                    💡 Click to flip back | Swipe left/right to study/master
                  </div>
                )}


              </div>
            </motion.div>
          </motion.div>

          {/* Action Buttons underneath card */}
          <div style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '500px' }}>
            <button 
              onClick={() => triggerRate('left', 'study')}
              className="btn btn-secondary"
              style={{ flex: 1, padding: '1rem' }}
            >
              Study Later
            </button>
            <button 
              onClick={() => triggerRate('right', 'mastered')}
              className="btn btn-primary"
              style={{ flex: 1, padding: '1rem' }}
            >
              <CheckCircle size={18} /> Mastered (+10 XP)
            </button>
          </div>
        </>
      )}

      </div>
  );
}
