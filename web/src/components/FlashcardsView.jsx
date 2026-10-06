import React, { useState, useEffect, useContext } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
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
  Sparkles, 
  Lock,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DetailPanelContext } from '../App';
import { useSpeech } from '../hooks/useSpeech.js';
import { checkIsUnitUnlocked, getUnitsCountForStage } from '../state/learning.js';

export default function FlashcardsView({ state, wordsData, setActiveView, selectedUnit, setSelectedUnit, selectedStage, setSelectedStage }) {
  const context = useContext(DetailPanelContext) || {};
  const detailWord = context.detailWord || null;
  const setDetailWord = context.setDetailWord || (() => {});
  const revealMnemonic = detailWord !== null;

  const currentStage = selectedStage || state.unlockedLevel || 1;
  const currentUnit = selectedUnit || 1;
  const totalUnitsInStage = getUnitsCountForStage(currentStage);

  const levelWords = React.useMemo(() => {
    return wordsData?.getWordsForUnit(currentStage, currentUnit) || [];
  }, [wordsData, currentStage, currentUnit]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [isRoundComplete, setIsRoundComplete] = useState(false);
  const [filterUnmastered, setFilterUnmastered] = useState(false);

  // Compute mastered words for this unit
  const masteredSet = React.useMemo(() => new Set(state.masteredWordIds || []), [state.masteredWordIds]);
  const levelMasteredCount = React.useMemo(() => {
    return levelWords.filter(w => masteredSet.has(w.id)).length;
  }, [levelWords, masteredSet]);
  
  const levelProgressPercent = levelWords.length 
    ? Math.round((levelMasteredCount / levelWords.length) * 100) 
    : 0;

  // Filtered list if reviewing only unmastered words
  const displayedWords = React.useMemo(() => {
    if (!filterUnmastered) return levelWords;
    const unmastered = levelWords.filter(w => !masteredSet.has(w.id));
    return unmastered.length > 0 ? unmastered : levelWords;
  }, [levelWords, filterUnmastered, masteredSet]);

  const word = displayedWords[currentIndex] || displayedWords[0];

  // Framer Motion Tinder values
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-150, 0, 150], [-15, 0, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);
  
  // Tinder stamp opacity and scale transforms
  const likeOpacity = useTransform(x, [40, 120], [0, 1]);
  const nopeOpacity = useTransform(x, [-120, -40], [1, 0]);
  const likeScale = useTransform(x, [40, 120], [0.8, 1.2]);
  const nopeScale = useTransform(x, [-120, -40], [1.2, 0.8]);

  // Reset states when unit or stage changes
  useEffect(() => {
    setFlipped(false);
    setCurrentIndex(0);
    setIsRoundComplete(false);
    setFilterUnmastered(false);
    x.set(0);
  }, [currentUnit, currentStage]);

  // Keep index within bounds if displayed list length changes
  useEffect(() => {
    if (currentIndex >= displayedWords.length && displayedWords.length > 0) {
      setCurrentIndex(0);
    }
  }, [displayedWords.length]);

  useEffect(() => {
    setFlipped(false);
    x.set(0);
  }, [currentIndex]);

  useEffect(() => {
    if (detailWord && word) {
      setDetailWord(word);
    }
  }, [word?.id]);

  useEffect(() => {
    if (levelProgressPercent >= 100) {
      setDetailWord(null);
    }
  }, [levelProgressPercent]);

  const handlePrevCard = () => {
    if (currentIndex > 0) {
      setFlipped(false);
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleNextCard = () => {
    if (currentIndex < displayedWords.length - 1) {
      setFlipped(false);
      setCurrentIndex(prev => prev + 1);
    }
  };

  const advanceAfterRate = () => {
    setFlipped(false);
    x.set(0);
    if (currentIndex >= displayedWords.length - 1) {
      // Reached the end of the round!
      setIsRoundComplete(true);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const triggerRate = async (direction, type) => {
    if (!word) return;
    await animate(x, direction === 'right' ? 600 : -600, { duration: 0.22, ease: 'easeOut' });
    
    if (type === 'know') {
      // Mark word mastered: increments mastered list, awards 10 XP & coins, and updates achievements
      state.markWordMastered(word.id);
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.8 }
      });
    } else {
      // Mark word learning for future spaced review
      state.markWordLearning(word.id);
    }

    advanceAfterRate();
  };

  // Keyboard navigation listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (wordsData.loading || displayedWords.length === 0 || isRoundComplete) return;

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
        triggerRate('right', 'know');
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (flipped) {
          setDetailWord(detailWord ? null : word);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [wordsData.loading, displayedWords, flipped, currentIndex, word, isRoundComplete]);

  const { speak: speakWord, isSpeaking } = useSpeech(0.85);

  const handleDragEnd = (event, info) => {
    if (info.offset.x > 120) {
      triggerRate('right', 'know');
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

  if (!checkIsUnitUnlocked(currentStage, currentUnit, state)) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }} className="animate-fade">
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-surface-elevated)',
          border: 'var(--border-thick)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          color: 'var(--text-muted)'
        }}>
          <Lock size={32} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-title)', marginBottom: '0.5rem' }}>
          Unit {currentStage}.{currentUnit} is Locked
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1.5rem' }}>
          This unit is locked. Pass the Unit {currentStage}.{currentUnit - 1} assessment quiz with 70%+ to unlock it.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button 
            onClick={() => setActiveView('quizzes', currentUnit - 1, currentStage)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Award size={16} /> Take Unit {currentStage}.{currentUnit - 1} Quiz
          </button>
          <button 
            onClick={() => setActiveView('dashboard')}
            className="btn btn-secondary"
          >
            Roadmap
          </button>
        </div>
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

  const remainingCount = Math.max(0, levelWords.length - levelMasteredCount);

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
              {remainingCount} REMAINING
            </span>
            {filterUnmastered && (
              <span style={{
                fontSize: '0.68rem', fontWeight: '800', color: 'hsl(var(--primary))',
                background: 'hsla(var(--primary), 0.12)', padding: '2px 8px',
                borderRadius: '99px', border: '1px solid hsla(var(--primary), 0.3)'
              }}>
                FOCUSING UNMASTERED
              </span>
            )}
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

      {/* State A: All Words in Unit Mastered (100% Complete) */}
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
            Unit {currentStage}.{currentUnit} Vocab Mastered! 🎉
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '500px', margin: '0 auto 1.5rem', lineHeight: '1.5' }}>
            Outstanding work! You have mastered all {levelWords.length} words in Unit {currentStage}.{currentUnit}. Prove your mastery in the assessment quiz to qualify!
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setActiveView('quizzes', currentUnit, currentStage)}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: '900', padding: '0.8rem 1.4rem' }}
            >
              <HelpCircle size={16} /> Take Unit {currentStage}.{currentUnit} Quiz <ArrowRight size={16} />
            </button>

            {currentUnit < totalUnitsInStage && (
              <button 
                onClick={() => {
                  if (setSelectedUnit) setSelectedUnit(currentUnit + 1);
                  setCurrentIndex(0);
                  setIsRoundComplete(false);
                  setFilterUnmastered(false);
                }}
                className="btn btn-accent"
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Sparkles size={16} /> Start Unit {currentStage}.{currentUnit + 1} Flashcards <ArrowRight size={16} />
              </button>
            )}

            <button 
              onClick={() => setActiveView('dashboard')}
              className="btn btn-secondary"
            >
              Return to Roadmap
            </button>

            <button 
              onClick={() => {
                state.resetWordProgress(levelWords.map(w => w.id));
                setCurrentIndex(0);
                setIsRoundComplete(false);
                setFilterUnmastered(false);
              }}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <RotateCcw size={15} /> Study Unit Again
            </button>
          </div>
        </div>
      ) : isRoundComplete ? (
        /* State B: Round Complete (Finished reviewing all cards in the deck, with some left to master) */
        <div className="glass-panel animate-fade" style={{
          width: '100%',
          padding: '2.5rem 2rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ height: '4px', background: 'linear-gradient(90deg, var(--theme-yellow), var(--theme-cyan))', position: 'absolute', top: 0, left: 0, right: 0 }} />
          
          <div style={{
            width: '72px', height: '72px', borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--theme-yellow), var(--theme-bulb))',
            border: 'var(--border-thick)', boxShadow: 'var(--shadow-small)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem'
          }}>
            <Sparkles size={32} color="#000" strokeWidth={2.5} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-title)', marginBottom: '0.5rem' }}>
            Unit Study Round Complete! 👏
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '520px', margin: '0 auto 1.5rem', lineHeight: '1.5' }}>
            You reviewed all {levelWords.length} words in this unit. You have mastered <strong>{levelMasteredCount}</strong> words, with <strong>{remainingCount}</strong> remaining to master.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={() => {
                setFilterUnmastered(true);
                setCurrentIndex(0);
                setIsRoundComplete(false);
              }}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: '900', padding: '0.8rem 1.4rem' }}
            >
              Review Remaining ({remainingCount}) Words <ArrowRight size={16} />
            </button>

            <button 
              onClick={() => {
                setFilterUnmastered(false);
                setCurrentIndex(0);
                setIsRoundComplete(false);
              }}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <RotateCcw size={15} /> Review All {levelWords.length} Cards
            </button>

            <button 
              onClick={() => setActiveView('quizzes', currentUnit, currentStage)}
              className="btn btn-secondary"
            >
              Take Unit Quiz
            </button>

            <button 
              onClick={() => setActiveView('dashboard')}
              className="btn btn-secondary"
            >
              Roadmap
            </button>
          </div>
        </div>
      ) : (
        /* State C: Active Flashcard Deck */
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
                {/* Top row actions & Navigation arrows */}
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'absolute', top: '1.25rem', left: 0, padding: '0 1.5rem', zIndex: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); handlePrevCard(); }}
                      disabled={currentIndex === 0}
                      className="min-touch"
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        cursor: currentIndex === 0 ? 'default' : 'pointer', 
                        color: currentIndex === 0 ? 'var(--border-thin)' : 'var(--text-muted)', 
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Previous Card"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                      CARD {currentIndex + 1} OF {displayedWords.length}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleNextCard(); }}
                      disabled={currentIndex >= displayedWords.length - 1}
                      className="min-touch"
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        cursor: currentIndex >= displayedWords.length - 1 ? 'default' : 'pointer', 
                        color: currentIndex >= displayedWords.length - 1 ? 'var(--border-thin)' : 'var(--text-muted)', 
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Next Card"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {masteredSet.has(word?.id) && (
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: '800',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '99px',
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        color: '#10B981',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}>
                        <CheckCircle size={10} /> Mastered
                      </span>
                    )}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (word) state.toggleBookmark(word.id);
                      }}
                      className="min-touch"
                      aria-label={state.bookmarkedWordIds.includes(word?.id) ? 'Remove bookmark' : 'Bookmark word'}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: state.bookmarkedWordIds.includes(word?.id) ? 'hsl(var(--secondary))' : 'var(--text-muted)' }}
                    >
                      {state.bookmarkedWordIds.includes(word?.id) ? <BookmarkCheck size={22} fill="hsl(var(--secondary))" /> : <Bookmark size={22} />}
                    </button>
                  </div>
                </div>

                {/* Word details */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', margin: 'auto 0' }}>
                  <h2 style={{ fontSize: '3rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>{word?.word.toUpperCase()}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontStyle: 'italic', color: 'var(--text-secondary)', fontWeight: '500' }}>
                      ({word?.part_of_speech})
                    </span>
                    {word?.pronunciation && (
                      <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        /{word.pronunciation}/
                      </span>
                    )}
                    <button 
                      onClick={(e) => speakWord(word?.word, e)}
                      className="min-touch"
                      aria-label="Listen to pronunciation"
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        backgroundColor: isSpeaking ? 'hsla(var(--primary), 0.3)' : 'hsla(var(--primary), 0.1)',
                        border: isSpeaking ? '2px solid hsl(var(--primary))' : '1px solid hsla(var(--primary), 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'hsl(var(--primary))',
                        boxShadow: isSpeaking ? '0 0 12px hsla(var(--primary), 0.5)' : 'none',
                        transform: isSpeaking ? 'scale(1.08)' : 'none',
                        transition: 'all 0.2s ease'
                      }}
                      title="Listen Pronunciation"
                    >
                      <Volume2 size={18} style={{ animation: isSpeaking ? 'pulse 1s infinite' : 'none' }} />
                    </button>
                  </div>
                </div>

                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', position: 'absolute', bottom: '1.75rem' }}>
                  💡 Click card to flip | Swipe right for Got It (+10 XP) | Swipe left for Study Later
                </div>
              </div>

              {/* BACK OF THE CARD */}
              <div className="flashcard-back" style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%', padding: '2rem 1.5rem 1.5rem' }}>
                {/* Top row actions */}
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'absolute', top: '1.25rem', left: 0, padding: '0 1.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                    CARD {currentIndex + 1} OF {displayedWords.length}
                  </span>
                  {masteredSet.has(word?.id) && (
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: '800',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '99px',
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                      color: '#10B981',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}>
                      <CheckCircle size={10} /> Mastered
                    </span>
                  )}
                </div>

                {/* Back Contents (Centered like the front) with scroll support for long definitions */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', margin: 'auto 0', width: '100%', maxHeight: '250px', overflowY: 'auto', padding: '0.25rem 0.5rem' }} className="no-swipe">
                  {word?.bengali_meaning && (
                    <div style={{ fontSize: '2.25rem', fontWeight: '700', color: 'hsl(var(--primary))', lineHeight: '1.3', fontFamily: 'var(--font-bengali)', textAlign: 'center' }}>
                      {word.bengali_meaning}
                    </div>
                  )}

                  <div style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', lineHeight: '1.45', fontWeight: '500', maxWidth: '90%', textAlign: 'center', margin: '0 auto' }}>
                    {word?.definition}
                  </div>
                </div>

                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', position: 'absolute', bottom: '1.75rem', left: 0, right: 0, textAlign: 'center' }}>
                  💡 Click to flip back | Swipe right for Got It (+10 XP) | Swipe left for Study Later
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Action Buttons underneath card */}
          <div style={{ display: 'flex', gap: '0.75rem', width: '100%', maxWidth: '450px', alignItems: 'center' }}>
            <button 
              onClick={() => triggerRate('left', 'study')}
              className="btn btn-secondary"
              style={{ flex: 1, padding: '0.85rem', fontWeight: '700' }}
            >
              Study Later
            </button>
            <button 
              onClick={() => triggerRate('right', 'know')}
              className="btn btn-primary"
              style={{ flex: 1, padding: '0.85rem', fontWeight: '800' }}
            >
              <CheckCircle size={18} /> Got It (+10 XP)
            </button>
          </div>
        </>
      )}
    </div>
  );
}
