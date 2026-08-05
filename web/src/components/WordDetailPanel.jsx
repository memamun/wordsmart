import React, { useState, useEffect } from 'react';
import { 
  Sparkles, X, Volume2, BookOpen, Lightbulb, Hash, Layers, 
  ChevronLeft, ChevronRight, Bookmark, BookmarkCheck, Copy, Check, 
  ArrowLeft, Award, Clock, HelpCircle, Compass
} from 'lucide-react';

const SectionHeader = ({ icon, label, color }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.65rem' }}>
    {icon}
    <span style={{ fontSize: '0.8rem', fontWeight: '900', color, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-title)' }}>
      {label}
    </span>
  </div>
);

export default function WordDetailPanel({ word, wordList = [], onClose, onSelectWord, gameState }) {
  if (!word) return null;

  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [deltaX, setDeltaX] = useState(0);
  const [deltaY, setDeltaY] = useState(0);
  const [copied, setCopied] = useState(false);

  // Guide visibility state: Show on first 2 launches
  const [showGuide, setShowGuide] = useState(() => {
    try {
      const count = parseInt(localStorage.getItem('wordsmart_detail_guide_count') || '0', 10);
      return count < 2;
    } catch (e) {
      return true;
    }
  });

  useEffect(() => {
    try {
      const count = parseInt(localStorage.getItem('wordsmart_detail_guide_count') || '0', 10);
      if (count < 2) {
        localStorage.setItem('wordsmart_detail_guide_count', (count + 1).toString());
        const timer = setTimeout(() => {
          setShowGuide(false);
        }, 2500);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.warn('LocalStorage unavailable for guide count:', e);
    }
  }, []);

  // Find index of current word in list
  const currentIndex = wordList.findIndex(w => (w.id && word.id && w.id === word.id) || (w.word && word.word && w.word.toUpperCase() === word.word.toUpperCase()));
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < wordList.length - 1;

  const isBookmarked = gameState?.bookmarkedWordIds?.includes(word.id);

  const handlePrevWord = () => {
    if (hasPrev && onSelectWord) {
      onSelectWord(wordList[currentIndex - 1]);
    }
  };

  const handleNextWord = () => {
    if (hasNext && onSelectWord) {
      onSelectWord(wordList[currentIndex + 1]);
    }
  };

  // Speech synthesis
  const speakWord = (text) => {
    try {
      if ('speechSynthesis' in window && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.85;
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.warn('Speech synthesis unavailable:', err);
    }
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        if (hasNext) handleNextWord();
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        if (hasPrev) handlePrevWord();
      } else if (e.key === ' ' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        speakWord(word.word);
      } else if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        if (gameState?.toggleBookmark && word.id) {
          gameState.toggleBookmark(word.id);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, wordList, word, hasNext, hasPrev]);

  // Touch Swipe Handlers for Mobile & Gesture Keyboards
  const handleTouchStart = (e) => {
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
    setDeltaX(0);
    setDeltaY(0);
  };

  const handleTouchMove = (e) => {
    const currentX = e.targetTouches[0].clientX;
    const currentY = e.targetTouches[0].clientY;
    const diffX = currentX - touchStart.x;
    const diffY = currentY - touchStart.y;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      setDeltaX(diffX);
    } else if (diffY > 0) {
      setDeltaY(diffY);
    }
  };

  const handleTouchEnd = () => {
    if (Math.abs(deltaX) > 75) {
      if (deltaX < 0 && hasNext) {
        handleNextWord();
      } else if (deltaX > 0 && hasPrev) {
        handlePrevWord();
      }
    }
    setDeltaX(0);
    setDeltaY(0);
  };

  const handleCopy = () => {
    const text = `${word.word}: ${word.bengali_meaning ? word.bengali_meaning + ' - ' : ''}${word.definition}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const progressPct = wordList.length > 1 ? Math.round(((currentIndex + 1) / wordList.length) * 100) : 100;

  return (
    <div 
      className="word-detail-fullscreen"
      role="main"
      aria-label={`Full screen word details for ${word.word}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '3px solid #000000',
        boxShadow: '0 4px 0 #000000',
        padding: '0.85rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        {/* Back Button */}
        <button
          onClick={onClose}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 1.1rem',
            borderRadius: '12px',
            border: '2.5px solid #000000',
            backgroundColor: 'var(--bg-surface-elevated)',
            color: 'var(--text-primary)',
            fontSize: '0.88rem',
            fontWeight: '900',
            fontFamily: 'var(--font-title)',
            cursor: 'pointer',
            boxShadow: '3px 3px 0px #000000',
            transition: 'transform 0.1s ease'
          }}
        >
          <ArrowLeft size={18} /> Back
        </button>

        {/* Word Progress Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {wordList.length > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              backgroundColor: 'var(--bg-canvas)',
              padding: '0.35rem 0.9rem',
              borderRadius: '9999px',
              border: '2px solid #000000',
              boxShadow: '2px 2px 0px #000000'
            }}>
              <span style={{
                fontSize: '0.8rem',
                fontWeight: '900',
                fontFamily: 'var(--font-title)',
                color: 'var(--text-primary)'
              }}>
                WORD {currentIndex >= 0 ? currentIndex + 1 : 1} / {wordList.length}
              </span>
              <div style={{
                width: '50px',
                height: '6px',
                backgroundColor: 'rgba(0,0,0,0.15)',
                borderRadius: '99px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${progressPct}%`,
                  height: '100%',
                  backgroundColor: '#18FFFF',
                  borderRadius: '99px',
                  transition: 'width 0.25s ease'
                }} />
              </div>
            </div>
          )}
        </div>

        {/* Header Actions Suite */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginLeft: 'auto' }}>
          {/* Audio Button */}
          <button
            onClick={() => speakWord(word.word)}
            title="Pronounce Word (Spacebar)"
            style={{
              padding: '0.5rem 0.9rem',
              borderRadius: '12px',
              border: '2.5px solid #000000',
              background: 'linear-gradient(135deg, #E040FB 0%, #7C4DFF 100%)',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.85rem',
              fontWeight: '900',
              boxShadow: '3px 3px 0px #000000'
            }}
          >
            <Volume2 size={18} /> <span className="header-btn-label">Audio</span>
          </button>

          {/* Bookmark Toggle */}
          {gameState?.toggleBookmark && word.id && (
            <button
              onClick={() => gameState.toggleBookmark(word.id)}
              title={isBookmarked ? "Remove bookmark (B)" : "Add bookmark (B)"}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '12px',
                border: '2.5px solid #000000',
                backgroundColor: isBookmarked ? '#FFD54F' : 'var(--bg-surface-elevated)',
                color: isBookmarked ? '#000000' : 'var(--text-primary)',
                cursor: 'pointer',
                boxShadow: '3px 3px 0px #000000',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              {isBookmarked ? <BookmarkCheck size={18} fill="#000000" /> : <Bookmark size={18} />}
            </button>
          )}

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            title="Copy word & definition"
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: '12px',
              border: '2.5px solid #000000',
              backgroundColor: copied ? '#69F0AE' : 'var(--bg-surface-elevated)',
              color: copied ? '#000000' : 'var(--text-primary)',
              cursor: 'pointer',
              boxShadow: '3px 3px 0px #000000'
            }}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            title="Close (Esc)"
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: '12px',
              border: '2.5px solid #000000',
              backgroundColor: '#FF5252',
              color: '#FFFFFF',
              cursor: 'pointer',
              boxShadow: '3px 3px 0px #000000'
            }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Full-Screen Body */}
      <div style={{
        maxWidth: '1050px',
        width: '100%',
        margin: '0 auto',
        padding: '2rem 1.5rem 6.5rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
      }}>
        {/* Playful Neobrutalist Hero Card Banner with Side Chevron Controls */}
        <div style={{
          padding: '2.25rem 2.5rem',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, rgba(224, 64, 251, 0.15) 0%, rgba(24, 255, 255, 0.12) 50%, var(--bg-surface) 100%)',
          border: '3px solid #000000',
          boxShadow: '8px 8px 0px #000000',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          position: 'relative'
        }}>
          {/* Hero Card Previous Chevron Arrow */}
          <button
            onClick={handlePrevWord}
            disabled={!hasPrev}
            style={{
              position: 'absolute',
              left: '-1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              border: '2.5px solid #000000',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: hasPrev ? 'pointer' : 'not-allowed',
              opacity: hasPrev ? 1 : 0.4,
              boxShadow: hasPrev ? '3px 3px 0px #000000' : 'none',
              zIndex: 10
            }}
            title="Previous Word"
          >
            <ChevronLeft size={22} />
          </button>

          {/* Hero Card Next Chevron Arrow */}
          <button
            onClick={handleNextWord}
            disabled={!hasNext}
            style={{
              position: 'absolute',
              right: '-1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              border: '2.5px solid #000000',
              background: 'linear-gradient(135deg, #18FFFF 0%, #00E5FF 100%)',
              color: '#000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: hasNext ? 'pointer' : 'not-allowed',
              opacity: hasNext ? 1 : 0.4,
              boxShadow: hasNext ? '3px 3px 0px #000000' : 'none',
              zIndex: 10
            }}
            title="Next Word"
          >
            <ChevronRight size={22} />
          </button>

          {/* Word Title Line */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <h1 style={{
                fontSize: '3rem',
                fontFamily: 'var(--font-title)',
                fontWeight: '900',
                letterSpacing: '-0.02em',
                margin: 0,
                color: 'var(--text-primary)'
              }}>
                {word.word}
              </h1>

              {word.part_of_speech && (
                <span style={{
                  fontSize: '0.85rem',
                  padding: '0.35rem 1rem',
                  borderRadius: '9999px',
                  background: 'linear-gradient(135deg, #18FFFF 0%, #00E5FF 100%)',
                  color: '#000000',
                  fontWeight: '900',
                  textTransform: 'uppercase',
                  border: '2px solid #000000',
                  boxShadow: '2px 2px 0px #000000'
                }}>
                  {word.part_of_speech}
                </span>
              )}
            </div>

            {word.pronunciation && (
              <span style={{
                fontSize: '1.1rem',
                fontFamily: 'monospace',
                fontWeight: '800',
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-surface-elevated)',
                padding: '0.4rem 1rem',
                borderRadius: '12px',
                border: '2px solid #000000',
                boxShadow: '2.5px 2.5px 0px #000000'
              }}>
                /{word.pronunciation}/
              </span>
            )}
          </div>

          {/* Bengali Meaning & Definition Container */}
          <div style={{
            padding: '1.5rem 1.75rem',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, hsla(var(--primary), 0.15) 0%, hsla(var(--primary), 0.05) 100%)',
            border: '2.5px solid #000000',
            boxShadow: '4px 4px 0px #000000',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem'
          }}>
            {word.bengali_meaning && (
              <div style={{
                fontSize: '1.9rem',
                fontWeight: '900',
                color: 'hsl(var(--primary))',
                fontFamily: 'var(--font-body)',
                lineHeight: '1.3'
              }}>
                {word.bengali_meaning}
              </div>
            )}
            <div style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: '1.65', fontWeight: '600' }}>
              {word.definition}
            </div>
          </div>
        </div>

        {/* 2-Column Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.75rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {word.mnemonic && (
              <div style={{
                padding: '1.5rem 1.75rem',
                borderRadius: '18px',
                backgroundColor: 'var(--bg-surface)',
                border: '2.5px solid #000000',
                borderLeft: '8px solid #FFD54F',
                boxShadow: '4px 4px 0px #000000'
              }}>
                <SectionHeader icon={<Lightbulb size={18} color="#FFD54F" />} color="#FFD54F" label="Memory Trick (Mnemonic)" />
                <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: '1.65', margin: 0, fontStyle: 'italic', fontWeight: '500' }}>
                  {word.mnemonic}
                </p>
              </div>
            )}
            {word.examples && word.examples.length > 0 && (
              <div style={{
                padding: '1.5rem 1.75rem',
                borderRadius: '18px',
                backgroundColor: 'var(--bg-surface)',
                border: '2.5px solid #000000',
                borderLeft: '8px solid #69F0AE',
                boxShadow: '4px 4px 0px #000000'
              }}>
                <SectionHeader icon={<BookOpen size={18} color="#69F0AE" />} color="#69F0AE" label="Usage Examples" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {word.examples.map((ex, index) => (
                    <div key={index} style={{ borderLeft: '3.5px solid hsla(var(--primary), 0.5)', paddingLeft: '0.85rem' }}>
                      <p style={{ fontSize: '0.98rem', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0, fontWeight: '500' }}>
                        "{ex.replace(/\*\*/g, '')}"
                      </p>
                      {word.example_translations && word.example_translations[index] && (
                        <p style={{ fontSize: '0.9rem', color: 'hsl(var(--primary))', margin: '0.35rem 0 0 0', fontWeight: '700' }}>
                          {word.example_translations[index]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {word.synonyms && word.synonyms.length > 0 && (
              <div style={{
                padding: '1.5rem 1.75rem',
                borderRadius: '18px',
                backgroundColor: 'var(--bg-surface)',
                border: '2.5px solid #000000',
                borderLeft: '8px solid var(--theme-blue)',
                boxShadow: '4px 4px 0px #000000'
              }}>
                <SectionHeader icon={<Layers size={18} color="var(--theme-blue)" />} color="var(--theme-blue)" label="Synonyms" />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.35rem' }}>
                  {word.synonyms.map((syn, index) => (
                    <span key={index} style={{
                      fontSize: '0.85rem', fontWeight: '900', padding: '0.4rem 0.9rem', borderRadius: '10px',
                      background: 'linear-gradient(135deg, #18FFFF 0%, #00E5FF 100%)', color: '#000000',
                      border: '2px solid #000000', boxShadow: '2px 2px 0px #000000'
                    }}>
                      {syn}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {word.antonyms && word.antonyms.length > 0 && (
              <div style={{
                padding: '1.5rem 1.75rem',
                borderRadius: '18px',
                backgroundColor: 'var(--bg-surface)',
                border: '2.5px solid #000000',
                borderLeft: '8px solid var(--theme-red)',
                boxShadow: '4px 4px 0px #000000'
              }}>
                <SectionHeader icon={<X size={18} color="var(--theme-red)" />} color="var(--theme-red)" label="Antonyms" />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.35rem' }}>
                  {word.antonyms.map((ant, index) => (
                    <span key={index} style={{
                      fontSize: '0.85rem', fontWeight: '900', padding: '0.4rem 0.9rem', borderRadius: '10px',
                      background: 'linear-gradient(135deg, #FF5252 0%, #FF1744 100%)', color: '#FFFFFF',
                      border: '2px solid #000000', boxShadow: '2px 2px 0px #000000'
                    }}>
                      {ant}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {word.collocations && word.collocations.length > 0 && (
              <div style={{
                padding: '1.5rem 1.75rem',
                borderRadius: '18px',
                backgroundColor: 'var(--bg-surface)',
                border: '2.5px solid #000000',
                borderLeft: '8px solid #E040FB',
                boxShadow: '4px 4px 0px #000000'
              }}>
                <SectionHeader icon={<Sparkles size={18} color="#E040FB" />} color="#E040FB" label="Common Collocations" />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.35rem' }}>
                  {word.collocations.map((col, index) => (
                    <span key={index} style={{
                      fontSize: '0.85rem', fontWeight: '900', padding: '0.4rem 0.9rem', borderRadius: '9999px',
                      background: 'linear-gradient(135deg, #E040FB 0%, #7C4DFF 100%)', color: '#FFFFFF',
                      border: '2px solid #000000', boxShadow: '2px 2px 0px #000000'
                    }}>
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
