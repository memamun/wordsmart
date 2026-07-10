import React, { useState } from 'react';
import { Sparkles, X, Volume2, BookOpen, Lightbulb, Hash, Layers } from 'lucide-react';

const SectionHeader = ({ icon, label, color }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
    {icon}
    <span style={{ fontSize: '0.7rem', fontWeight: '800', color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
  </div>
);

export default function WordDetailPanel({ word, onClose }) {
  if (!word) return null;

  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [deltaY, setDeltaY] = useState(0);

  const speakWord = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleTouchStart = (e) => {
    // Only allow swipe down gesture on mobile views
    if (window.innerWidth >= 768) return;
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
    setDeltaY(0);
  };

  const handleTouchMove = (e) => {
    if (window.innerWidth >= 768) return;
    const currentY = e.targetTouches[0].clientY;
    const diffY = currentY - touchStart.y;
    
    // Only allow downward dragging
    if (diffY > 0) {
      setDeltaY(diffY);
    }
  };

  const handleTouchEnd = () => {
    if (window.innerWidth >= 768) return;
    if (deltaY > 100) {
      onClose();
    } else {
      setDeltaY(0); // Snap back to place
    }
  };

  const dragStyle = deltaY > 0 ? {
    transform: `translateY(${deltaY}px)`,
    transition: 'none'
  } : {
    transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
  };

  return (
    <>
      <div className="detail-panel-backdrop" onClick={onClose} />

      <div 
        className="detail-panel" 
        style={dragStyle}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Mobile bottom sheet drag indicator */}
        <div style={{
          width: '36px',
          height: '4px',
          backgroundColor: 'var(--text-muted)',
          borderRadius: '99px',
          margin: '-0.75rem auto 1rem auto',
          opacity: 0.4,
          display: 'block'
        }} className="mobile-drag-handle" />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexShrink: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.35rem', fontWeight: '800', color: 'hsl(var(--text-primary))', letterSpacing: '-0.02em', lineHeight: '1.2' }}>{word.word}</span>
              <span style={{ fontSize: '0.7rem', padding: '2px 10px', borderRadius: '99px', background: 'hsla(var(--primary), 0.12)', color: 'hsl(var(--primary))', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid hsla(var(--primary), 0.2)' }}>
                {word.part_of_speech}
              </span>
              <button
                onClick={() => speakWord(word.word)}
                title="Listen pronunciation"
                aria-label="Listen pronunciation"
                className="detail-icon-btn"
              >
                <Volume2 size={14} />
              </button>
            </div>
            {word.pronunciation && (
              <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', fontFamily: 'monospace' }}>
                /{word.pronunciation}/
              </span>
            )}
          </div>
          <button onClick={onClose} aria-label="Close word details" className="detail-panel-close" style={{ marginLeft: '0.5rem', flexShrink: 0 }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '1rem 1.1rem', borderRadius: '14px', background: 'linear-gradient(135deg, hsla(var(--primary), 0.08) 0%, hsla(var(--primary), 0.02) 100%)', border: '1px solid hsla(var(--primary), 0.15)', marginBottom: '1rem', flexShrink: 0 }}>
          {word.bengali_meaning && (
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'hsl(var(--primary))', lineHeight: '1.35', marginBottom: '0.35rem' }}>
              {word.bengali_meaning}
            </div>
          )}
          <div style={{ fontSize: '0.95rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.6' }}>
            {word.definition}
          </div>
        </div>

        <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.25rem' }}>

          {word.mnemonic && (
            <div className="detail-card detail-card-amber">
              <SectionHeader icon={<Lightbulb size={13} color="hsl(var(--secondary))" />} color="hsl(var(--secondary))" label="Mnemonic" />
              <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.55', margin: 0, fontStyle: 'italic' }}>
                {word.mnemonic}
              </p>
            </div>
          )}

          {word.examples && word.examples.length > 0 && (
            <div className="detail-card detail-card-emerald">
              <SectionHeader icon={<BookOpen size={13} color="hsl(var(--primary))" />} color="hsl(var(--primary))" label="Example" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {word.examples.map((ex, index) => (
                  <p key={index} style={{ fontSize: '0.88rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.5', margin: 0, borderLeft: '2px solid hsla(var(--primary), 0.3)', paddingLeft: '0.5rem' }}>
                    "{ex}"
                  </p>
                ))}
              </div>
            </div>
          )}

          {word.synonyms && word.synonyms.length > 0 && (
            <div className="detail-card detail-card-blue">
              <SectionHeader icon={<Layers size={13} color="#1E88E5" />} color="#1E88E5" label="Synonyms" />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.25rem' }}>
                {word.synonyms.map((syn, index) => (
                  <span key={index} style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '6px', background: 'rgba(30, 136, 229, 0.08)', color: '#1E88E5', fontWeight: '700', border: '1px solid rgba(30, 136, 229, 0.15)' }}>
                    {syn}
                  </span>
                ))}
              </div>
            </div>
          )}

          {word.antonyms && word.antonyms.length > 0 && (
            <div className="detail-card detail-card-pink">
              <SectionHeader icon={<X size={13} color="#D81B60" />} color="#D81B60" label="Antonyms" />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.25rem' }}>
                {word.antonyms.map((ant, index) => (
                  <span key={index} style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '6px', background: 'rgba(216, 27, 96, 0.08)', color: '#D81B60', fontWeight: '700', border: '1px solid rgba(216, 27, 96, 0.15)' }}>
                    {ant}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
