import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, X, Volume2, BookOpen, Lightbulb, Layers, 
  ChevronLeft, ChevronRight, Bookmark, BookmarkCheck, Copy, Check, 
  ArrowLeft
} from 'lucide-react';
import { renderMarkdown, formatExampleText } from '../utils/markdown';
import WordAiChatModal from './WordAiChatModal';

const SectionHeader = ({ icon, label, color }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.75rem' }}>
    {icon}
    <span 
      className="detail-section-title"
      style={{ color: color || 'var(--text-primary)' }}
    >
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
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const panelRef = useRef(null);

  // Guarantee scroll to top when word changes or panel mounts
  useEffect(() => {
    if (panelRef.current) {
      panelRef.current.scrollTop = 0;
    }
    const rafId = requestAnimationFrame(() => {
      if (panelRef.current) {
        panelRef.current.scrollTop = 0;
      }
    });
    return () => cancelAnimationFrame(rafId);
  }, [word?.id, word?.word]);

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

  // Touch Swipe Handlers for Mobile
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
      ref={panelRef}
      className="word-detail-fullscreen"
      role="main"
      aria-label={`Full screen word details for ${word.word}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        backgroundColor: 'var(--bg-canvas)',
        color: 'var(--text-primary)'
      }}
    >
      {/* Sticky Top Navigation Bar - Single Row Guarantee */}
      <div className="detail-top-nav">
        {/* Back Button */}
        <button
          onClick={onClose}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem',
            padding: '0.45rem 0.75rem',
            borderRadius: '9999px',
            border: 'var(--border-thin)',
            backgroundColor: 'var(--bg-surface-elevated)',
            color: 'var(--text-primary)',
            fontSize: '0.85rem',
            fontWeight: '800',
            fontFamily: 'var(--font-title)',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-tiny)',
            flexShrink: 0
          }}
          className="btn-icon-hover"
          title="Back"
        >
          <ArrowLeft size={17} />
          <span className="detail-header-label">Back</span>
        </button>

        {/* Word Progress Indicator */}
        {wordList.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'var(--bg-surface-elevated)',
            padding: '0.35rem 0.75rem',
            borderRadius: '9999px',
            border: 'var(--border-thin)',
            flexShrink: 0
          }}>
            <span style={{
              fontSize: '0.78rem',
              fontWeight: '800',
              fontFamily: 'var(--font-title)',
              color: 'var(--text-secondary)'
            }}>
              <span className="detail-word-prefix">WORD </span>
              {currentIndex >= 0 ? currentIndex + 1 : 1} / {wordList.length}
            </span>
            <div className="detail-progress-bar" style={{
              width: '45px',
              height: '5px',
              backgroundColor: 'var(--border-muted)',
              borderRadius: '99px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progressPct}%`,
                height: '100%',
                backgroundColor: 'var(--theme-cyan)',
                borderRadius: '99px',
                transition: 'width 0.25s ease'
              }} />
            </div>
          </div>
        )}

        {/* Header Actions Suite */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginLeft: 'auto', flexShrink: 0 }}>
          {/* Ask AI Button */}
          <button
            onClick={() => setAiChatOpen(true)}
            title="Ask AI (Gemini Tutor)"
            style={{
              padding: '0.45rem 0.75rem',
              borderRadius: '9999px',
              border: '2px solid #000000',
              backgroundColor: 'var(--theme-cyan)',
              color: '#000000',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              fontSize: '0.82rem',
              fontWeight: '900',
              fontFamily: 'var(--font-title)',
              boxShadow: '2px 2px 0px #000000',
              flexShrink: 0
            }}
            className="btn-icon-hover"
          >
            <Sparkles size={15} />
            <span className="detail-header-label">Ask AI</span>
          </button>

          {/* Audio Button */}
          <button
            onClick={() => speakWord(word.word)}
            title="Pronounce Word (Spacebar)"
            style={{
              padding: '0.45rem 0.75rem',
              borderRadius: '9999px',
              border: 'var(--border-thin)',
              backgroundColor: 'var(--theme-yellow)',
              color: '#000000',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              fontSize: '0.82rem',
              fontWeight: '900',
              fontFamily: 'var(--font-title)',
              boxShadow: 'var(--shadow-tiny)',
              flexShrink: 0
            }}
            className="btn-icon-hover"
          >
            <Volume2 size={16} />
            <span className="detail-header-label">Audio</span>
          </button>

          {/* Bookmark Toggle */}
          {gameState?.toggleBookmark && word.id && (
            <button
              onClick={() => gameState.toggleBookmark(word.id)}
              title={isBookmarked ? "Remove bookmark (B)" : "Add bookmark (B)"}
              aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
              style={{
                padding: '0.45rem 0.6rem',
                borderRadius: '10px',
                border: 'var(--border-thin)',
                backgroundColor: isBookmarked ? '#F59E0B' : 'var(--bg-surface-elevated)',
                color: isBookmarked ? '#000000' : 'var(--text-secondary)',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-tiny)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
              className="btn-icon-hover"
            >
              {isBookmarked ? <BookmarkCheck size={18} fill="#000000" /> : <Bookmark size={18} />}
            </button>
          )}

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            title="Copy word & definition"
            aria-label="Copy word"
            style={{
              padding: '0.45rem 0.6rem',
              borderRadius: '10px',
              border: 'var(--border-thin)',
              backgroundColor: copied ? 'var(--theme-green)' : 'var(--bg-surface-elevated)',
              color: copied ? '#000000' : 'var(--text-secondary)',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-tiny)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
            className="btn-icon-hover"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            title="Close (Esc)"
            aria-label="Close"
            style={{
              padding: '0.45rem 0.6rem',
              borderRadius: '10px',
              border: 'var(--border-thin)',
              backgroundColor: 'var(--bg-surface-elevated)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-tiny)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
            className="btn-icon-hover"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Full-Screen Body */}
      <div className="detail-body-container">
        {/* Soothing Hero Word Card with Side Navigation Arrows */}
        <div className="detail-hero-card">
          {/* Previous Word Chevron */}
          <button
            onClick={handlePrevWord}
            disabled={!hasPrev}
            className="detail-nav-chevron prev btn-icon-hover"
            title="Previous Word"
            style={{ opacity: hasPrev ? 1 : 0.35, cursor: hasPrev ? 'pointer' : 'not-allowed' }}
          >
            <ChevronLeft size={20} />
          </button>

          {/* Next Word Chevron */}
          <button
            onClick={handleNextWord}
            disabled={!hasNext}
            className="detail-nav-chevron next btn-icon-hover"
            title="Next Word"
            style={{ opacity: hasNext ? 1 : 0.35, cursor: hasNext ? 'pointer' : 'not-allowed' }}
          >
            <ChevronRight size={20} />
          </button>

          {/* Top Line: Headword + Part of Speech + Pronunciation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h1 className="detail-headword">
                {word.word}
              </h1>

              {word.part_of_speech && (
                <span style={{
                  fontSize: '0.82rem',
                  padding: '0.25rem 0.8rem',
                  borderRadius: '9999px',
                  backgroundColor: 'var(--theme-cyan)',
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
              <span className="detail-pronunciation">
                /{word.pronunciation}/
              </span>
            )}
          </div>

          {/* Bengali Meaning (High Contrast, Hind Siliguri, Readable Font Size) */}
          {word.bengali_meaning && (
            <div className="detail-bengali-meaning">
              {renderMarkdown(word.bengali_meaning)}
            </div>
          )}

          {/* English Definition */}
          <div className="detail-english-definition">
            {renderMarkdown(word.definition)}
          </div>

          {/* Ask AI Quick Trigger Button */}
          <div style={{ marginTop: '0.25rem' }}>
            <button
              onClick={() => setAiChatOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.42rem 0.95rem',
                borderRadius: '9999px',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1.5px dashed var(--theme-cyan)',
                color: 'var(--text-primary)',
                fontSize: '0.84rem',
                fontWeight: '700',
                fontFamily: 'var(--font-title)',
                cursor: 'pointer'
              }}
              className="btn-icon-hover"
              title="Ask AI for easy sentences & help"
            >
              <Sparkles size={15} style={{ color: 'var(--theme-cyan)' }} />
              <span>Ask AI for easy sentences & help</span>
            </button>
          </div>
        </div>

        {/* 2-Column Content Bento Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {/* Left Column: Mnemonic & Examples */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {word.mnemonic && (
              <div 
                className="detail-bento-card"
                style={{ borderLeft: '6px solid var(--mnemonic-accent)' }}
              >
                <SectionHeader icon={<Lightbulb size={18} color="var(--mnemonic-accent)" />} color="var(--mnemonic-accent)" label="Memory Trick (Mnemonic)" />
                <p className="detail-mnemonic-text">
                  {renderMarkdown(word.mnemonic)}
                </p>
              </div>
            )}

            {word.examples && word.examples.length > 0 && (
              <div 
                className="detail-bento-card"
                style={{ borderLeft: '6px solid var(--sentence-accent)' }}
              >
                <SectionHeader icon={<BookOpen size={18} color="var(--sentence-accent)" />} color="var(--sentence-accent)" label="Usage Examples" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {word.examples.map((ex, index) => (
                    <div key={index} style={{ borderLeft: '3.5px solid var(--sentence-quote-border)', paddingLeft: '0.9rem' }}>
                      <p className="detail-example-english">
                        {renderMarkdown(formatExampleText(ex))}
                      </p>
                      {word.example_translations && word.example_translations[index] && (
                        <p className="detail-example-bengali">
                          {renderMarkdown(word.example_translations[index])}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Synonyms, Antonyms & Collocations */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Synonyms (Theme-Aware Sky Blue) */}
            {word.synonyms && word.synonyms.length > 0 && (
              <div 
                className="detail-bento-card"
                style={{ borderLeft: '6px solid var(--synonym-accent)' }}
              >
                <SectionHeader icon={<Layers size={18} color="var(--synonym-accent)" />} color="var(--synonym-accent)" label="Synonyms" />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginTop: '0.25rem' }}>
                  {word.synonyms.map((syn, index) => (
                    <span 
                      key={index}
                      className="detail-chip"
                      style={{
                        backgroundColor: 'var(--synonym-bg)',
                        color: 'var(--synonym-text)',
                        border: '1.5px solid var(--synonym-border)'
                      }}
                    >
                      {syn}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Antonyms (Theme-Aware Red) */}
            {word.antonyms && word.antonyms.length > 0 && (
              <div 
                className="detail-bento-card"
                style={{ borderLeft: '6px solid var(--antonym-accent)' }}
              >
                <SectionHeader icon={<X size={18} color="var(--antonym-accent)" />} color="var(--antonym-accent)" label="Antonyms" />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginTop: '0.25rem' }}>
                  {word.antonyms.map((ant, index) => (
                    <span 
                      key={index}
                      className="detail-chip"
                      style={{
                        backgroundColor: 'var(--antonym-bg)',
                        color: 'var(--antonym-text)',
                        border: '1.5px solid var(--antonym-border)'
                      }}
                    >
                      {ant}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Common Collocations (Theme-Aware Purple) */}
            {word.collocations && word.collocations.length > 0 && (
              <div 
                className="detail-bento-card"
                style={{ borderLeft: '6px solid var(--colloc-accent)' }}
              >
                <SectionHeader icon={<Sparkles size={18} color="var(--colloc-accent)" />} color="var(--colloc-accent)" label="Common Collocations" />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginTop: '0.25rem' }}>
                  {word.collocations.map((col, index) => (
                    <span 
                      key={index}
                      className="detail-chip"
                      style={{
                        borderRadius: '9999px',
                        background: 'linear-gradient(135deg, #E040FB 0%, #7C4DFF 100%)',
                        color: '#FFFFFF',
                        border: '2px solid #000000',
                        boxShadow: '2px 2px 0px #000000'
                      }}
                    >
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Side Chat Button (FAB) */}
      <button
        onClick={() => setAiChatOpen(!aiChatOpen)}
        className="detail-ai-floating-fab"
        title={aiChatOpen ? "Close AI Chat" : "Ask AI Vocabulary Tutor"}
        aria-label="Ask AI"
      >
        <Sparkles size={18} />
        <span>{aiChatOpen ? 'Close AI' : 'Ask AI'}</span>
      </button>

      {/* Side Floating AI Chat Panel */}
      <WordAiChatModal 
        word={word}
        isOpen={aiChatOpen}
        onClose={() => setAiChatOpen(false)}
      />
    </div>
  );
}
