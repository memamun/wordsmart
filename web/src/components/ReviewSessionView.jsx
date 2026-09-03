import React, { useState, useMemo, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from 'framer-motion';
import { 
  Volume2, 
  CheckCircle, 
  AlertCircle, 
  HelpCircle, 
  Calendar,
  Award,
  ArrowRight,
  TrendingUp,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import WordDetailPanel from './WordDetailPanel';

export default function ReviewSessionView({ state, wordsData }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [revealDetails, setRevealDetails] = useState(false);
  const [sessionWords, setSessionWords] = useState([]);
  const [sessionInitialized, setSessionInitialized] = useState(false);

  // Initialize stable review session queue from cards due at session start
  useEffect(() => {
    if (!sessionInitialized && (wordsData.words || []).length > 0) {
      const now = new Date();
      const due = (wordsData.words || []).filter((w) => {
        const progress = (state.wordProgress || {})[w.id];
        if (!progress || !progress.nextReviewAt) return false;
        return new Date(progress.nextReviewAt) <= now;
      });
      setSessionWords(due);
      setSessionInitialized(true);
    }
  }, [wordsData.words, sessionInitialized, state.wordProgress]);

  const restartSession = () => {
    const now = new Date();
    const due = (wordsData.words || []).filter((w) => {
      const progress = (state.wordProgress || {})[w.id];
      if (!progress || !progress.nextReviewAt) return false;
      return new Date(progress.nextReviewAt) <= now;
    });
    setSessionWords(due);
    setCurrentIndex(0);
    setFlipped(false);
    setRevealDetails(false);
  };

  const word = sessionWords[currentIndex];

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
    setRevealDetails(false);
    x.set(0);
  }, [currentIndex]);

  const speakWord = (text, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleRate = (rating) => {
    if (!word) return;
    state.submitSM2Review(word.id, rating);
    
    // Celebration effect on high scores
    if (rating >= 4) {
      confetti({
        particleCount: 15,
        spread: 20,
        origin: { y: 0.8 }
      });
    }

    setCompletedCount(prev => prev + 1);
    setFlipped(false);
    setRevealDetails(false);

    // Wait for flip transition to end, then advance index smoothly without skipping
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, 150);
  };

  const triggerRate = async (direction, rating) => {
    await animate(x, direction === 'right' ? 600 : -600, { duration: 0.25, ease: 'easeOut' });
    handleRate(rating);
  };

  // Keyboard navigation listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (wordsData.loading || sessionWords.length === 0) return;

      const target = e.target;
      if (target?.closest?.('button, input, textarea, select, [contenteditable="true"]')) return;

      if (e.key === ' ') {
        e.preventDefault();
        setFlipped(prev => !prev);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        triggerRate('left', 2); // Rate 2 (Forgot / Hard)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        triggerRate('right', 4); // Rate 4 (Good)
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (flipped) {
          setRevealDetails(prev => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [wordsData.loading, sessionWords, flipped, currentIndex, word]);

  const handleDragEnd = (event, info) => {
    if (info.offset.x > 120) {
      triggerRate('right', 4); // Good
    } else if (info.offset.x < -120) {
      triggerRate('left', 2); // Forgot
    } else {
      animate(x, 0, { duration: 0.1, ease: 'easeOut' });
    }
  };

  if (wordsData.loading) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading review queue...</div>;
  }

  // All caught up / session finished state
  if (sessionWords.length === 0 || !word) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', maxWidth: '520px', margin: '3rem auto' }} className="glass-panel animate-fade">
        <div style={{
          width: '72px', height: '72px', borderRadius: 'var(--radius-md)',
          background: 'linear-gradient(135deg, var(--theme-green), var(--theme-cyan))',
          border: 'var(--border-thick)', boxShadow: 'var(--shadow-small)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1rem'
        }}>
          <CheckCircle size={32} color="#000" strokeWidth={2.5} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-title)', marginBottom: '0.75rem', fontSize: '1.6rem', textTransform: 'uppercase' }}>
          {completedCount > 0 ? 'Session Complete!' : 'All Caught Up!'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1.5rem' }}>
          {completedCount > 0 
            ? `Fantastic effort! You successfully completed ${completedCount} spaced-repetition card reviews today.`
            : 'Excellent work. You have completed all scheduled vocabulary reviews for today.'}
        </p>
        <div style={{
          padding: '1rem',
          border: 'var(--border-thin)',
          boxShadow: 'var(--shadow-tiny)',
          backgroundColor: 'var(--bg-canvas)',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: '700' }}>Cards Reviewed Session:</span>
            <span style={{ fontWeight: '800', color: 'var(--theme-green)' }}>{completedCount} cards</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: '700' }}>Total Active Cards:</span>
            <span style={{ fontWeight: '800', color: 'var(--text-primary)' }}>{Object.keys(state.wordProgress).length} words</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: '700' }}>Mastered (Level 4+):</span>
            <span style={{ fontWeight: '800', color: 'var(--theme-cyan)' }}>
              {Object.values(state.wordProgress).filter(p => p.status === 'mastered').length} words
            </span>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <button
            onClick={restartSession}
            className="btn btn-primary"
            style={{
              padding: '0.75rem 1.5rem',
              fontWeight: '800',
              fontFamily: 'var(--font-title)',
              borderRadius: '12px',
              border: '2px solid #000',
              boxShadow: '3px 3px 0 #000',
              cursor: 'pointer'
            }}
          >
            Check for Due Words
          </button>
        </div>
      </div>
    );
  }

  const activeProgress = state.wordProgress[word?.id] || {};

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', maxWidth: '800px', margin: '0 auto' }} className={`animate-fade review-view-container ${revealDetails ? 'detail-open' : ''}`}>
      {/* Header Info */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar color="var(--theme-purple)" /> Spaced Repetition Queue
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Review cards due today using the SM-2 cognitive algorithm.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            fontSize: '0.7rem', fontWeight: '800', color: '#000',
            background: 'var(--theme-red)', padding: '3px 10px',
            borderRadius: '99px', border: 'var(--border-thin)',
            boxShadow: 'var(--shadow-one)',
            textTransform: 'uppercase'
          }}>
            {sessionWords.length - currentIndex} LEFT
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--bg-canvas)', border: 'var(--border-thin)', overflow: 'hidden', boxShadow: 'var(--shadow-tiny)' }}>
        <div style={{
          height: '100%',
          width: `${sessionWords.length > 0 ? (currentIndex / sessionWords.length) * 100 : 0}%`,
          backgroundColor: 'var(--theme-purple)',
          transition: 'var(--transition-normal)'
        }}></div>
      </div>

      {/* Flashcard Component */}
      {word && (
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
            Known
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
            Unknown
          </motion.div>

          {/* Inner 3D Flipping Card Container */}
          <motion.div 
            className="flashcard-inner"
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            style={{ transformStyle: 'preserve-3d', height: '100%', width: '100%' }}
          >
            {/* Front */}
            <div className="flashcard-front">
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'absolute', top: '1.5rem', left: 0, padding: '0 2rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'hsl(var(--accent-purple))', letterSpacing: '0.1em' }}>
                  OVERDUE SYSTEM CARD
                </span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    state.toggleBookmark(word.id);
                  }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: state.bookmarkedWordIds.includes(word.id) ? 'hsl(var(--secondary))' : 'var(--text-muted)' }}
                  aria-label={state.bookmarkedWordIds.includes(word.id) ? 'Remove bookmark' : 'Bookmark word'}
                >
                  {state.bookmarkedWordIds.includes(word.id) ? <BookmarkCheck size={22} fill="hsl(var(--secondary))" /> : <Bookmark size={22} />}
                </button>
              </div>

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
                    aria-label="Listen to pronunciation"
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: 'hsla(var(--primary), 0.1)',
                      border: '1px solid hsla(var(--primary), 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: 'hsl(var(--primary))'
                    }}
                  >
                    <Volume2 size={16} />
                  </button>
                </div>
              </div>

                {currentIndex < 3 && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', position: 'absolute', bottom: '2rem' }}>
                    💡 Click card to flip | Swipe left/right to study/master
                  </div>
                )}
            </div>

            {/* Back */}
            <div className="flashcard-back" style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%', padding: '2rem 1.5rem 1.5rem' }}>
              {/* Top row actions */}
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'absolute', top: '1.5rem', left: 0, padding: '0 2rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'hsl(var(--accent-purple))', letterSpacing: '0.1em' }}>
                  OVERDUE SYSTEM CARD
                </span>
              </div>

              {/* Back Contents (Centered like front) with scroll support for long definitions */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', margin: 'auto 0', width: '100%', maxHeight: '250px', overflowY: 'auto', padding: '0.25rem 0.5rem' }} className="no-swipe">
                {word.bengali_meaning && (
                  <div style={{ fontSize: '2.25rem', fontWeight: '800', color: 'hsl(var(--primary))', lineHeight: '1.3', fontFamily: 'var(--font-bengali)', textAlign: 'center' }}>
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
      )}

      {/* SM-2 Cognitive Rating Buttons (Only visible when flipped) */}
      <div style={{ width: '100%', maxWidth: '600px', position: 'relative' }}>
        {flipped ? (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.05em' }}>
              HOW WELL DID YOU RECALL THIS WORD?
            </span>
            <div style={{ display: 'flex', gap: '0.4rem', width: '100%', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button 
                onClick={(e) => { e.stopPropagation(); triggerRate('left', 0); }}
                className="btn"
                style={{ flex: 1, padding: '0.7rem 0.35rem', fontSize: '0.75rem', minHeight: '42px', backgroundColor: 'hsla(var(--danger), 0.15)', color: 'hsl(var(--danger))', border: '1px solid hsla(var(--danger), 0.3)' }}
                title="Forgot completely (Blackout)"
              >
                Blackout (0)
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); triggerRate('left', 2); }}
                className="btn"
                style={{ flex: 1, padding: '0.7rem 0.35rem', fontSize: '0.75rem', minHeight: '42px', backgroundColor: 'hsla(var(--secondary), 0.1)', color: 'hsl(var(--secondary))', border: '1px solid hsla(var(--secondary), 0.3)' }}
                title="Incorrect, but recognized once shown"
              >
                Forgot (2)
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); triggerRate('right', 3); }}
                className="btn"
                style={{ flex: 1, padding: '0.7rem 0.35rem', fontSize: '0.75rem', minHeight: '42px', backgroundColor: 'hsla(var(--accent-blue), 0.1)', color: 'hsl(var(--accent-blue))', border: '1px solid hsla(var(--accent-blue), 0.3)' }}
                title="Correct, with extreme effort"
              >
                Hard (3)
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); triggerRate('right', 4); }}
                className="btn"
                style={{ flex: 1, padding: '0.7rem 0.35rem', fontSize: '0.75rem', minHeight: '42px', backgroundColor: 'hsla(var(--accent-purple), 0.1)', color: 'hsl(var(--accent-purple))', border: '1px solid hsla(var(--accent-purple), 0.3)' }}
                title="Correct, after slight hesitation"
              >
                Good (4)
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); triggerRate('right', 5); }}
                className="btn"
                style={{ flex: 1, padding: '0.7rem 0.35rem', fontSize: '0.75rem', minHeight: '42px', backgroundColor: 'hsla(var(--primary), 0.15)', color: 'hsl(var(--primary))', border: '1px solid hsla(var(--primary), 0.3)' }}
                title="Perfect, instant recall"
              >
                Easy (5)
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Tap the card above to flip and rate your memory.
          </div>
        )}
      </div>

      {/* Word Detail Panel (sidebar on desktop, fullscreen on mobile) */}
      {revealDetails && word && (
        <WordDetailPanel word={word} onClose={() => setRevealDetails(false)} />
      )}
    </div>
  );
}
