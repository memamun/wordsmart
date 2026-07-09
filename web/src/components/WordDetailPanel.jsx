import React from 'react';
import { Sparkles, X, Volume2, BookOpen, Lightbulb, Hash, Layers } from 'lucide-react';

const SectionHeader = ({ icon, label, color }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
    {icon}
    <span style={{ fontSize: '0.7rem', fontWeight: '800', color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
  </div>
);

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
      <div className="detail-panel-backdrop" onClick={onClose} />

      <div className="detail-panel animate-fade">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexShrink: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.35rem', fontWeight: '800', color: 'white', letterSpacing: '-0.02em', lineHeight: '1.2' }}>{word.word}</span>
              <span style={{ fontSize: '0.7rem', padding: '2px 10px', borderRadius: '99px', background: 'hsla(var(--primary), 0.12)', color: 'hsl(var(--primary))', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid hsla(var(--primary), 0.2)' }}>
                {word.part_of_speech}
              </span>
              <button
                onClick={() => speakWord(word.word)}
                title="Listen pronunciation"
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
          <button onClick={onClose} className="detail-panel-close" style={{ marginLeft: '0.5rem', flexShrink: 0 }}>
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
              <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.6', margin: 0 }}>
                "{word.examples[0].split(/(\*\*.*?\*\*)/g).map((part, i) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={i} style={{ color: 'hsl(var(--primary))', fontWeight: '700' }}>{part.replace(/\*\*/g, '')}</strong>;
                  }
                  return part;
                })}"
              </p>
              {word.example_translations && word.example_translations[0] && (
                <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', lineHeight: '1.5', margin: '0.6rem 0 0', paddingTop: '0.6rem', borderTop: '1px solid hsla(var(--primary), 0.08)' }}>
                  {word.example_translations[0]}
                </p>
              )}
            </div>
          )}

          {(word.synonyms?.length > 0 || word.antonyms?.length > 0) && (
            <div className="detail-card" style={{ padding: '0.85rem 1rem', borderRadius: '12px', background: 'hsla(0,0%,100%,0.02)', border: '1px solid hsla(0,0%,100%,0.05)', display: 'flex', gap: '0.75rem' }}>
              {word.synonyms?.length > 0 && (
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'hsl(142, 70%, 50%)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>Synonyms</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {word.synonyms.slice(0, 5).map((s, i) => (
                      <span key={i} className="detail-tag detail-tag-green">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {word.antonyms?.length > 0 && (
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'hsl(350, 80%, 60%)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>Antonyms</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {word.antonyms.slice(0, 5).map((a, i) => (
                      <span key={i} className="detail-tag detail-tag-red">{a}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {word.collocations?.length > 0 && (
            <div className="detail-card detail-card-purple">
              <SectionHeader icon={<Layers size={13} color="hsl(var(--accent-purple))" />} color="hsl(var(--accent-purple))" label="Common Collocations" />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {word.collocations.slice(0, 5).map((c, i) => (
                  <span key={i} className="detail-tag detail-tag-purple">{c}</span>
                ))}
              </div>
            </div>
          )}

          {word.derivatives && Object.keys(word.derivatives).length > 0 && (
            <div className="detail-card" style={{ padding: '0.85rem 1rem', borderRadius: '12px', background: 'hsla(0,0%,100%,0.02)', border: '1px solid hsla(0,0%,100%,0.05)' }}>
              <SectionHeader icon={<Layers size={13} color="hsl(var(--text-muted))" />} color="hsl(var(--text-muted))" label="Derivatives" />
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