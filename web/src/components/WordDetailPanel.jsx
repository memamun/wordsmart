import React from 'react';
import { Sparkles, X, Volume2 } from 'lucide-react';

export default function WordDetailPanel({ word, onClose }) {
  if (!word) return null;

  const speakWord = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <>
      {/* Mobile fullscreen overlay backdrop */}
      <div 
        className="detail-panel-backdrop"
        onClick={onClose}
      />
      
      <div className="detail-panel animate-fade">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'white' }}>{word.word}</span>
            <span style={{ fontSize: '0.75rem', padding: '2px 10px', borderRadius: '99px', background: 'hsla(var(--primary), 0.15)', color: 'hsl(var(--primary))', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{word.part_of_speech}</span>
            <button
              onClick={() => speakWord(word.word)}
              style={{
                width: '28px', height: '28px', borderRadius: '50%',
                backgroundColor: 'hsla(var(--primary), 0.1)',
                border: '1px solid hsla(var(--primary), 0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'hsl(var(--primary))'
              }}
            >
              <Volume2 size={13} />
            </button>
          </div>
          <button onClick={onClose} className="detail-panel-close">
            <X size={18} />
          </button>
        </div>

        {/* Definition summary */}
        <div style={{ padding: '0.75rem 1rem', borderRadius: '12px', background: 'hsla(0,0%,100%,0.03)', border: '1px solid hsla(0,0%,100%,0.06)', marginBottom: '1rem', flexShrink: 0 }}>
          {word.bengali_meaning && (
            <div style={{ fontSize: '1.35rem', fontWeight: '700', color: 'hsl(var(--primary))', lineHeight: '1.4', marginBottom: '0.35rem' }}>
              {word.bengali_meaning}
            </div>
          )}
          <div style={{ fontSize: '0.95rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.55' }}>
            {word.definition}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem', paddingRight: '0.25rem' }}>

          {/* Mnemonic */}
          {word.mnemonic && (
            <div style={{ padding: '0.85rem 1rem', borderRadius: '12px', background: 'linear-gradient(135deg, hsla(var(--secondary), 0.08) 0%, hsla(var(--secondary), 0.03) 100%)', border: '1px solid hsla(var(--secondary), 0.12)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.4rem' }}>
                <Sparkles size={14} color="hsl(var(--secondary))" />
                <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'hsl(var(--secondary))', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Mnemonic</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.5', margin: 0, fontStyle: 'italic' }}>
                {word.mnemonic}
              </p>
            </div>
          )}

          {/* Example with translation */}
          {word.examples && word.examples.length > 0 && (
            <div style={{ padding: '0.85rem 1rem', borderRadius: '12px', background: 'linear-gradient(135deg, hsla(var(--primary), 0.06) 0%, hsla(var(--primary), 0.02) 100%)', border: '1px solid hsla(var(--primary), 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'hsl(var(--primary))', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Example</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.55', margin: 0 }}>
                "{word.examples[0].split(/(\*\*.*?\*\*)/g).map((part, i) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={i} style={{ color: 'hsl(var(--primary))', fontWeight: '700' }}>{part.replace(/\*\*/g, '')}</strong>;
                  }
                  return part;
                })}"
              </p>
              {word.example_translations && word.example_translations[0] && (
                <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', lineHeight: '1.45', margin: '0.5rem 0 0', paddingTop: '0.5rem', borderTop: '1px solid hsla(var(--primary), 0.08)' }}>
                  {word.example_translations[0]}
                </p>
              )}
            </div>
          )}

          {/* Synonyms & Antonyms row */}
          {(word.synonyms?.length > 0 || word.antonyms?.length > 0) && (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {word.synonyms?.length > 0 && (
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'hsl(142, 70%, 45%)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>Synonyms</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {word.synonyms.slice(0, 5).map((s, i) => (
                      <span key={i} style={{ fontSize: '0.78rem', padding: '3px 10px', borderRadius: '99px', background: 'rgba(16, 185, 129, 0.1)', color: 'hsl(142, 70%, 55%)', fontWeight: '600' }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {word.antonyms?.length > 0 && (
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'hsl(350, 80%, 60%)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>Antonyms</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {word.antonyms.slice(0, 5).map((a, i) => (
                      <span key={i} style={{ fontSize: '0.78rem', padding: '3px 10px', borderRadius: '99px', background: 'rgba(239, 68, 68, 0.1)', color: 'hsl(350, 80%, 65%)', fontWeight: '600' }}>{a}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Collocations */}
          {word.collocations?.length > 0 && (
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'hsl(var(--accent-purple))', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>Common Collocations</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {word.collocations.slice(0, 5).map((c, i) => (
                  <span key={i} style={{ fontSize: '0.78rem', padding: '4px 12px', borderRadius: '8px', background: 'hsla(var(--accent-purple), 0.1)', color: 'hsl(var(--accent-purple))', fontWeight: '500', border: '1px solid hsla(var(--accent-purple), 0.15)' }}>{c}</span>
                ))}
              </div>
            </div>
          )}

          {/* Derivatives */}
          {word.derivatives && Object.keys(word.derivatives).length > 0 && (
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>Derivatives</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {Object.entries(word.derivatives).map(([form, pos], i) => (
                  <span key={i} style={{ fontSize: '0.78rem', padding: '4px 12px', borderRadius: '8px', background: 'hsla(0,0%,100%,0.04)', color: 'hsl(var(--text-secondary))', fontWeight: '500', border: '1px solid hsla(0,0%,100%,0.06)' }}>
                    {form} <span style={{ color: 'hsl(var(--text-muted))', fontStyle: 'italic', fontSize: '0.7rem' }}>({pos})</span>
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
