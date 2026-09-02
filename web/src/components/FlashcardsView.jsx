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
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DetailPanelContext } from '../App';

export default function FlashcardsView({ state, wordsData, setActiveView, selectedUnit, setSelectedUnit }) {
  const { detailWord, setDetailWord } = useContext(DetailPanelContext);
  const revealMnemonic = detailWord !== null;

  const currentUnit = selectedUnit || 1;

  const levelWords = React.useMemo(() => {
    return wordsData?.getWordsForUnit(state.unlockedLevel, currentUnit) || [];
  }, [wordsData, state.unlockedLevel, currentUnit]);

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

  // Reset animations when card index or unit changes
  useEffect(() => {
    setFlipped(false);
    setCurrentIndex(0);
    x.set(0);
  }, [currentUnit]);

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
    if (e && e.stopPropagation) e.stopPropagation();
    try {
      if ('speechSynthesis' in window && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.85;
        utterance.pitch = 1.0;
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.warn('Speech synthesis unavailable:', err);
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
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-muted)', borderTopColor: 'hsl(var(--primary))', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ color: 'var(--text-secondary)' }}>Loading vocabulary cards...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (levelWords.length === 0) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
        <AlertCircle size={48} color="hsl(var(--danger))" style={{ marginBottom: '1rem' }} />
        <h2 style={{ fontFamily: 'var(--font-title)', marginBottom: '0.5rem' }}>No words available</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Could not load vocabulary for this level. Please make sure the JSON data is placed correctly.</p>
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', margin: '0 auto' }} className={`animate-fade flashcard-view-container ${revealMnemonic ? 'detail-open' : ''}`}>
      {/* Progress stats + bar */}
      <div style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              fontSize: '0.7rem', fontWeight: '800', color: '#000',
              background: 'var(--theme-cyan)', padding: '3px 10px',
              borderRadius: '99px', border: 'var(--border-thin)',
              boxShadow: 'var(--shadow-one)',
              textTransform: 'uppercase'
            }}>
              <Award size={11} strokeWidth={2.5} /> {levelMasteredCount} MASTERED
            </span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              fontSize: '0.7rem', fontWeight: '800', color: '#000',
              background: 'var(--theme-yellow)', padding: '3px 10px',
              borderRadius: '99px', border: 'var(--border-thin)',
              boxShadow: 'var(--shadow-one)',
              textTransform: 'uppercase'
            }}>
              {levelWords.length - levelMasteredCount} REMAINING
            </span>
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'var(--font-title)' }}>
            {levelProgressPercent}%
          </span>
        </div>
        <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--bg-canvas)', border: 'var(--border-thin)', overflow: 'hidden', boxShadow: 'var(--shadow-tiny)' }}>
          <div style={{
            height: '100%',
            width: `${levelProgressPercent}%`,
            backgroundColor: 'var(--theme-green)',
            transition: 'var(--transition-normal)'
          }}></div>
        </div>
      </div>

      {/* Flashcard Content Area */}
      {levelProgressPercent >= 100 ? (
        <div className="glass-panel animate-fade" style={{
          width: '100%',
          padding: '2.5rem 2rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Accent bar */}
          <div style={{ height: '4px', background: 'linear-gradient(90deg, var(--theme-green), var(--theme-cyan), var(--theme-green))', position: 'absolute', top: 0, left: 0, right: 0 }} />
          
          <div style={{
            width: '72px', height: '72px', borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--theme-green), var(--theme-cyan))',
            border: 'var(--border-thick)', boxShadow: 'var(--shadow-small)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem'
          }}>
            <Award size={32} color="#000" strokeWidth={2.5} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-title)', marginBottom: '0.5rem' }}>
            Unit {state.unlockedLevel}.{currentUnit} Vocab Mastered! 🎉
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '500px', margin: '0 auto 1.5rem', lineHeight: '1.5' }}>
            Outstanding work! You have mastered all words in Unit {state.unlockedLevel}.{currentUnit}. Continue your learning momentum below!
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setActiveView('quizzes', currentUnit)}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <HelpCircle size={16} /> Take Unit {state.unlockedLevel}.{currentUnit} Quiz
            </button>

            {currentUnit < 10 && (
              <button 
                onClick={() => {
                  if (setSelectedUnit) setSelectedUnit(currentUnit + 1);
                }}
                className="btn btn-accent"
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Sparkles size={16} /> Start Unit {state.unlockedLevel}.{currentUnit + 1} Flashcards <ArrowRight size={16} />
              </button>
            )}

            {currentUnit >= 10 && (
              <button 
                onClick={() => setActiveView('quizzes')}
                className="btn btn-accent"
              >
                Stage {state.unlockedLevel} Qualification Exam <ArrowRight size={16} />
              </button>
            )}

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
                borderRadius: 'var(--radius-lg)',
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
                borderRadius: 'var(--radius-lg)',
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
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
                    CARD {currentIndex + 1} OF {levelWords.length}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        state.toggleBookmark(word.id);
                      }}
                      className="min-touch"
                      aria-label={state.bookmarkedWordIds.includes(word.id) ? 'Remove bookmark' : 'Bookmark word'}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: state.bookmarkedWordIds.includes(word.id) ? 'hsl(var(--secondary))' : 'var(--text-muted)' }}
                    >
                      {state.bookmarkedWordIds.includes(word.id) ? <BookmarkCheck size={22} fill="hsl(var(--secondary))" /> : <Bookmark size={22} />}
                    </button>
                  </div>
                </div>

                {/* Word details */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', margin: 'auto 0' }}>
                  <h2 style={{ fontSize: '3rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>{word.word.toUpperCase()}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontStyle: 'italic', color: 'var(--text-secondary)', fontWeight: '500' }}>
                      ({word.part_of_speech})
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>
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
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', position: 'absolute', bottom: '2rem' }}>
                    💡 Click card to flip | Swipe left/right to study/master
                  </div>
                )}
              </div>

              {/* BACK OF THE CARD */}
              <div className="flashcard-back" style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%', padding: '2rem 1.5rem 1.5rem' }}>
                {/* Top row actions */}
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'absolute', top: '1.5rem', left: 0, padding: '0 2rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
                    CARD {currentIndex + 1} OF {levelWords.length}
                  </span>
                </div>

                {/* Back Contents (Centered like the front) with scroll support for long definitions */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', margin: 'auto 0', width: '100%', maxHeight: '250px', overflowY: 'auto', padding: '0.25rem 0.5rem' }} className="no-swipe">
                  {word.bengali_meaning && (
                    <div style={{ fontSize: '2.25rem', fontWeight: '700', color: 'hsl(var(--primary))', lineHeight: '1.3', fontFamily: 'var(--font-bengali)', textAlign: 'center' }}>
                      {word.bengali_meaning}
                    </div>
                  )}

                  <div style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', lineHeight: '1.45', fontWeight: '500', maxWidth: '90%', textAlign: 'center', margin: '0 auto' }}>
                    {word.definition}
                  </div>
                </div>

                {/* Bottom notification */}
                {currentIndex < 3 && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', position: 'absolute', bottom: '2rem', left: 0, right: 0, textAlign: 'center' }}>
                    💡 Click to flip back | Swipe left/right to study/master
                  </div>
                )}


              </div>
            </motion.div>
          </motion.div>

          {/* Action Buttons underneath card */}
          <div style={{ display: 'flex', gap: '0.75rem', width: '100%', maxWidth: '450px', alignItems: 'center' }}>
            <button 
              onClick={() => triggerRate('left', 'study')}
              className="btn btn-secondary"
              style={{ flex: 1, padding: '0.85rem' }}
            >
              Study Later
            </button>
            <button 
              onClick={() => triggerRate('right', 'mastered')}
              className="btn btn-primary"
              style={{ flex: 1, padding: '0.85rem' }}
            >
              <CheckCircle size={18} /> Mastered
            </button>
          </div>
        </>
      )}

      </div>
  );
}
