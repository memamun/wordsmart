import React, { useState, useMemo } from 'react';
import { Search, ArrowLeft, BookOpen, FileText, BookOpenCheck, Cpu, DollarSign, Globe, FlaskConical, Palette } from 'lucide-react';

const META = {
  'Common Usage Errors':    { icon: FileText,      accent: 'var(--primary)',       label: 'Usage guide' },
  'Abbreviations':          { icon: BookOpenCheck, accent: 'var(--accent-purple)', label: 'Reference list' },
  'The Arts':               { icon: Palette,       accent: 'var(--secondary)',     label: 'Reference list' },
  'Computers':              { icon: Cpu,           accent: 'var(--accent-blue)',   label: 'Reference list' },
  'Finance':                { icon: DollarSign,    accent: 'var(--primary)',       label: 'Reference list' },
  'Foreign Words and Phrases': { icon: Globe,      accent: 'var(--accent-purple)', label: 'Reference list' },
  'Science':                { icon: FlaskConical,  accent: 'var(--danger)',        label: 'Reference list' },
};

export default function SpecializedVocabView({ wordsData }) {
  const [chapter, setChapter] = useState(null);
  const [query, setQuery] = useState('');

  const chapters = wordsData?.specializedVocab || [];

  const entries = useMemo(() => {
    if (!chapter) return [];
    if (!query.trim()) return chapter.entries;
    const q = query.toLowerCase();
    return chapter.entries.filter(e =>
      e.term.toLowerCase().includes(q) || e.definition.toLowerCase().includes(q)
    );
  }, [chapter, query]);

  if (wordsData.loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1rem' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid hsl(var(--border-muted))', borderTopColor: 'hsl(var(--primary))', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ color: 'hsl(var(--text-secondary))' }}>Loading...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (chapters.length === 0) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
        <BookOpen size={48} color="hsl(var(--text-muted))" style={{ marginBottom: '1rem' }} />
        <h2 style={{ fontFamily: 'var(--font-title)', marginBottom: '0.5rem' }}>No specialized vocabulary</h2>
        <p style={{ color: 'hsl(var(--text-secondary))' }}>Could not load the data.</p>
      </div>
    );
  }

  if (!chapter) {
    return (
<div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fade specialized-vocab-container">
          <div>
          <h1 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-title)' }}>Specialized Vocabulary</h1>
          <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            {chapters.reduce((s, c) => s + c.entries.length, 0)} reference entries across {chapters.length} chapters
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem' }}>
          {chapters.map(ch => {
            const m = META[ch.chapter_title] || { icon: BookOpen, accent: 'var(--primary)', label: 'Reference' };
            const Icon = m.icon;
            return (
              <button type="button" key={ch.chapter_number} onClick={() => { setChapter(ch); setQuery(''); }}
                aria-label={`Open ${ch.chapter_title}`}
                style={{
                  borderRadius: '12px', padding: '1.15rem 1.25rem', cursor: 'pointer',
                  background: 'hsl(var(--bg-surface))', border: '1px solid hsl(var(--border-muted))',
                  display: 'flex', alignItems: 'center', gap: '0.85rem',
                  transition: 'border-color 0.15s, background 0.15s',
                  width: '100%', textAlign: 'left', color: 'inherit', font: 'inherit',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'hsla(var(--primary), 0.3)'; e.currentTarget.style.background = 'hsl(var(--bg-surface-elevated))'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'hsl(var(--border-muted))'; e.currentTarget.style.background = 'hsl(var(--bg-surface))'; }}
              >
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                  background: 'hsla(var(--primary), 0.08)', color: 'hsl(var(--primary))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'hsl(var(--text-primary))' }}>{ch.chapter_title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginTop: '1px' }}>
                    {ch.entries.length} entries
                  </div>
                </div>
                <span style={{ color: 'hsl(var(--text-muted))', fontSize: '1.1rem' }}>→</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const m = META[chapter.chapter_title] || { icon: BookOpen, accent: 'var(--primary)', label: 'Reference' };
  const Icon = m.icon;

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }} className="animate-fade">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button onClick={() => setChapter(null)} className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}>
          <ArrowLeft size={14} /> Back
        </button>
        <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>{chapter.chapter_number}. {chapter.chapter_title}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', paddingBottom: '1rem', borderBottom: '1px solid hsl(var(--border-muted))' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
          background: 'hsla(var(--primary), 0.08)', color: 'hsl(var(--primary))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={18} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-title)', color: 'hsl(var(--text-primary))', lineHeight: '1.2' }}>{chapter.chapter_title}</h1>
          <div style={{ fontSize: '0.78rem', color: 'hsl(var(--text-muted))' }}>
            {entries.length} of {chapter.entries.length} entries
          </div>
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        <Search style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }} size={16} />
        <input type="text" placeholder="Filter..." value={query} onChange={e => setQuery(e.target.value)}
          className="form-control" style={{ paddingLeft: '2.5rem', width: '100%', fontSize: '0.88rem' }} />
      </div>

      {entries.length === 0 ? (
        <div style={{ padding: '2.5rem', textAlign: 'center', color: 'hsl(var(--text-muted))', fontSize: '0.9rem' }}>No matches.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {entries.map((entry, i) => (
            <div key={i} style={{
              padding: '1rem 1.25rem', borderRadius: '10px',
              background: 'hsl(var(--bg-surface))', border: '1px solid hsl(var(--border-muted))',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'hsl(var(--text-muted))',
                  padding: '1px 7px', borderRadius: '4px', background: 'hsla(var(--text-primary), 0.04)' }}>
                  #{i + 1}
                </span>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'hsl(var(--secondary))' }}>{entry.term}</span>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.55', margin: 0 }}>{entry.definition}</p>
              {entry.examples?.length > 0 && (
                <div style={{ marginTop: '0.6rem', paddingTop: '0.6rem', borderTop: '1px solid hsl(var(--border-muted))' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'hsl(var(--primary))', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>Examples</div>
                  {entry.examples.map((ex, j) => (
                    <div key={j} style={{
                      fontSize: '0.82rem', color: 'hsl(var(--text-muted))', lineHeight: '1.45', fontStyle: 'italic',
                      paddingLeft: '0.6rem', borderLeft: '2px solid hsla(var(--primary), 0.2)', marginBottom: j < entry.examples.length - 1 ? '0.3rem' : 0
                    }}>
                      "{ex}"
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
