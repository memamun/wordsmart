import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  ArrowLeft, 
  Info, 
  BookOpenCheck,
  Cpu,
  FileText,
  DollarSign,
  Globe,
  FlaskConical,
  HelpCircle,
  HelpCircle as ArtIcon
} from 'lucide-react';

// Maps chapter titles to premium icons
const getChapterIcon = (title) => {
  const t = title.toLowerCase();
  if (t.includes('error') || t.includes('usage')) return FileText;
  if (t.includes('abbreviation')) return BookOpenCheck;
  if (t.includes('art')) return ArtIcon;
  if (t.includes('computer')) return Cpu;
  if (t.includes('finance')) return DollarSign;
  if (t.includes('foreign')) return Globe;
  if (t.includes('science')) return FlaskConical;
  return BookOpen;
};

export default function SpecializedVocabView({ wordsData }) {
  const [activeChapter, setActiveChapter] = useState(null); // null or chapter object
  const [searchQuery, setSearchQuery] = useState('');

  // Handle data state
  const chapters = wordsData?.specializedVocab || [];

  // Filter entries in the active chapter
  const filteredEntries = useMemo(() => {
    if (!activeChapter) return [];
    if (!searchQuery.trim()) return activeChapter.entries;

    const q = searchQuery.toLowerCase().trim();
    return activeChapter.entries.filter(entry => 
      entry.term.toLowerCase().includes(q) || 
      entry.definition.toLowerCase().includes(q) ||
      entry.examples?.some(ex => ex.toLowerCase().includes(q))
    );
  }, [activeChapter, searchQuery]);

  if (wordsData.loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyBetween: 'center', height: '60vh', gap: '1rem' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid hsl(var(--border-muted))', borderTopColor: 'hsl(var(--primary))', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ color: 'hsl(var(--text-secondary))' }}>Loading specialized vocabularies...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (chapters.length === 0) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
        <Info size={48} color="hsl(var(--text-muted))" style={{ marginBottom: '1rem' }} />
        <h2 style={{ fontFamily: 'var(--font-title)', marginBottom: '0.5rem' }}>No specialized vocabularies</h2>
        <p style={{ color: 'hsl(var(--text-secondary))' }}>
          Could not load the specialized vocabulary database. Ensure the JSON source asset is synced correctly.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }} className="animate-fade specialized-vocab-container">
      {/* 1. CHAPTER SELECTOR GRID */}
      {!activeChapter ? (
        <>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-title)' }}>Specialized Vocabularies</h1>
            <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Master specialized grammar rules, common usage errors, foreign expressions, and subject-specific registers frequently tested in central bank exams.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginTop: '0.5rem'
          }}>
            {chapters.map((ch) => {
              const IconComp = getChapterIcon(ch.chapter_title);
              return (
                <div 
                  key={ch.chapter_number}
                  onClick={() => {
                    setActiveChapter(ch);
                    setSearchQuery('');
                  }}
                  className="card card-hover"
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    padding: '1.5rem',
                    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(16, 185, 129, 0.04) 100%)',
                    border: '1px solid hsl(var(--border-muted))'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'hsla(var(--primary), 0.1)',
                      color: 'hsl(var(--primary))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <IconComp size={20} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'hsl(var(--text-muted))' }}>
                        CHAPTER {ch.chapter_number}
                      </span>
                      <h3 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-title)', color: 'white', marginTop: '0.1rem' }}>
                        {ch.chapter_title}
                      </h3>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem',
                    color: 'hsl(var(--text-secondary))',
                    borderTop: '1px solid hsl(var(--border-muted))',
                    paddingTop: '0.75rem',
                    marginTop: 'auto'
                  }}>
                    <span>{ch.entries.length} Essential Terms</span>
                    <span style={{ color: 'hsl(var(--primary))', fontWeight: '700' }}>Study Chapter →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* 2. SPECIFIC CHAPTER TERM VIEW */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Back Action & Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <button 
              onClick={() => setActiveChapter(null)}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem 1rem', fontSize: '0.85rem' }}
            >
              <ArrowLeft size={16} /> Back to Chapters
            </button>
            <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', fontWeight: '700', letterSpacing: '0.05em' }}>
              CHAPTER {activeChapter.chapter_number} / {activeChapter.chapter_title.toUpperCase()}
            </span>
          </div>

          {/* Chapter title and description */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid hsl(var(--border-muted))', paddingBottom: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-title)', color: 'white' }}>
                {activeChapter.chapter_title}
              </h1>
              <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.90rem', marginTop: '0.25rem' }}>
                Mastering specific vocabulary and terms for Bangladesh Bank AD.
              </p>
            </div>
            <span style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', fontWeight: '600' }}>
              Showing {filteredEntries.length} of {activeChapter.entries.length} terms
            </span>
          </div>

          {/* Search bar inside Chapter */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }} size={18} />
              <input
                type="text"
                placeholder={`Search terms or definitions in ${activeChapter.chapter_title}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '2.75rem', width: '100%' }}
              />
            </div>
          </div>

          {/* Entries list */}
          {filteredEntries.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
              No terms match your search query. Try typing another term.
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {filteredEntries.map((entry, index) => (
                <div 
                  key={index}
                  className="card"
                  style={{
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    border: '1px solid hsl(var(--border-muted))',
                    backgroundColor: 'hsl(var(--bg-surface) / 0.5)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.15rem', color: 'hsl(var(--secondary))', fontWeight: '700', fontFamily: 'var(--font-title)' }}>
                      {entry.term}
                    </h3>
                    <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', fontWeight: '600', padding: '0.15rem 0.4rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'hsl(var(--bg-canvas))' }}>
                      #{index + 1}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.9rem', color: 'white', lineHeight: '1.5' }}>
                    {entry.definition}
                  </p>

                  {/* Examples box */}
                  {entry.examples && entry.examples.length > 0 && (
                    <div style={{
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'hsl(var(--bg-canvas) / 0.8)',
                      borderLeft: '3px solid hsl(var(--primary))',
                      marginTop: '0.25rem'
                    }}>
                      <div style={{ fontSize: '0.7rem', color: 'hsl(var(--primary))', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <BookOpen size={12} />
                        <span>Example Sentences</span>
                      </div>
                      <ul style={{ listStyleType: 'disc', paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', margin: 0 }}>
                        {entry.examples.map((ex, i) => (
                          <li key={i} style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.4', fontStyle: 'italic' }}>
                            "{ex}"
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
