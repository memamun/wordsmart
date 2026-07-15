import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Bookmark, 
  BookmarkCheck, 
  Volume2, 
  HelpCircle, 
  Award,
  ChevronDown,
  ChevronUp,
  Filter,
  Info,
  Star,
  BookOpen
} from 'lucide-react';

export default function SearchView({ state, wordsData }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'bookmarked', 'mastered', 'learning', 'hit_parades'
  const [expandedWordId, setExpandedWordId] = useState(null);

  const speakWord = (text, e) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Filter and search words list
  const filteredWords = useMemo(() => {
    if (wordsData.words.length === 0) return [];

    let result = wordsData.words;

    // Apply category filters
    if (filterMode === 'bookmarked') {
      result = result.filter(w => state.bookmarkedWordIds.includes(w.id));
    } else if (filterMode === 'mastered') {
      result = result.filter(w => {
        const prog = state.wordProgress[w.id];
        return prog && prog.status === 'mastered';
      });
    } else if (filterMode === 'learning') {
      result = result.filter(w => {
        const prog = state.wordProgress[w.id];
        return prog && (prog.status === 'learning' || prog.status === 'reviewing' || prog.status === 'relearning');
      });
    } else if (filterMode === 'hit_parades') {
      // Filter words that exist in the SAT hit parade list
      const satList = wordsData.hitParades?.sat_hit_parade?.map(item => item.word.toLowerCase()) || [];
      result = result.filter(w => satList.includes(w.word.toLowerCase()));
    }

    // Apply search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(w => 
        w.word.toLowerCase().includes(q) || 
        w.definition.toLowerCase().includes(q) ||
        (w.bengali_meaning && w.bengali_meaning.toLowerCase().includes(q))
      );
    }

    return result;
  }, [wordsData.words, wordsData.hitParades, searchQuery, filterMode, state.bookmarkedWordIds, state.wordProgress]);

  const toggleExpand = (wordId) => {
    setExpandedWordId(expandedWordId === wordId ? null : wordId);
  };

  const handleCardKeyDown = (e, wordId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleExpand(wordId);
    }
  };

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '850px', margin: '0 auto' }} className="animate-fade search-view-container">
      {/* View Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Search /> Dictionary Search Portal
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Search the entire pre-loaded {wordsData.words.length || 1913} core vocabulary items. Filter by study status and check definitions.
        </p>
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative', width: '100%' }}>
        <input 
          type="text"
          placeholder="Search by spelling, English definition, or Bengali translation..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-control"
          style={{
            width: '100%',
            padding: '1rem 1rem 1rem 3rem',
          }}
        />
        <Search 
          size={18} 
          color="var(--text-muted)" 
          style={{ position: 'absolute', left: '1.1rem', top: '50%', transform: 'translateY(-50%)' }} 
        />
      </div>

      {/* Category Filter Chips */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '800', marginRight: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <Filter size={14} /> Filter:
        </span>
        <button 
          onClick={() => setFilterMode('all')}
          className={`filter-pill ${filterMode === 'all' ? 'active active-cyan' : ''}`}
        >
          All ({wordsData.words.length})
        </button>
        <button 
          onClick={() => setFilterMode('bookmarked')}
          className={`filter-pill ${filterMode === 'bookmarked' ? 'active active-yellow' : ''}`}
        >
          <Bookmark size={12} /> Bookmarked ({state.bookmarkedWordIds.length})
        </button>
        <button 
          onClick={() => setFilterMode('mastered')}
          className={`filter-pill ${filterMode === 'mastered' ? 'active active-green' : ''}`}
        >
          <Award size={12} /> Mastered ({Object.values(state.wordProgress).filter(p => p.status === 'mastered').length})
        </button>
        <button 
          onClick={() => setFilterMode('learning')}
          className={`filter-pill ${filterMode === 'learning' ? 'active active-purple' : ''}`}
        >
          <BookOpen size={12} /> Learning ({Object.values(state.wordProgress).filter(p => p.status === 'learning' || p.status === 'reviewing' || p.status === 'relearning').length})
        </button>
        <button 
          onClick={() => setFilterMode('hit_parades')}
          className={`filter-pill ${filterMode === 'hit_parades' ? 'active active-blue' : ''}`}
        >
          <Star size={12} /> SAT Hit Parade
        </button>
      </div>

      {/* Words List Output */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {filteredWords.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No vocabulary matches found. Adjust filters or search parameters.
          </div>
        ) : (
          filteredWords.slice(0, 50).map((w) => {
            const isExpanded = expandedWordId === w.id;
            const wProgress = state.wordProgress[w.id] || {};
            const isBookmarked = state.bookmarkedWordIds.includes(w.id);

            return (
              <div 
                key={w.id} 
                className="card"
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
                aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${w.word} details`}
                style={{
                  padding: '1rem 1.25rem',
                  borderColor: isExpanded ? 'hsla(var(--primary), 0.3)' : 'var(--border-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: isExpanded ? '1rem' : '0'
                }}
                onClick={() => toggleExpand(w.id)}
                onKeyDown={(e) => handleCardKeyDown(e, w.id)}
              >
                {/* Main collapsed row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                      {w.word.toUpperCase()}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                      ({w.part_of_speech})
                    </span>
                    {wProgress.status === 'mastered' && (
                      <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem', borderRadius: '4px', backgroundColor: 'hsla(var(--success), 0.15)', color: 'hsl(var(--success))', fontWeight: '700' }}>
                        MASTERED
                      </span>
                    )}
                    {(wProgress.status === 'learning' || wProgress.status === 'reviewing' || wProgress.status === 'relearning') && (
                      <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem', borderRadius: '4px', backgroundColor: 'hsla(var(--accent-purple), 0.15)', color: 'hsl(var(--accent-purple))', fontWeight: '700' }}>
                        LEARNING
                      </span>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} onClick={(e) => e.stopPropagation()}>
                    {/* Bookmark Toggle */}
                    <button 
                      onClick={() => state.toggleBookmark(w.id)}
                      aria-label={isBookmarked ? `Remove bookmark for ${w.word}` : `Bookmark ${w.word}`}
                      style={{ background: 'none', border: 'none', color: isBookmarked ? 'hsl(var(--secondary))' : 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      {isBookmarked ? <BookmarkCheck size={18} fill="hsl(var(--secondary))" /> : <Bookmark size={18} />}
                    </button>
                    {isExpanded ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                  </div>
                </div>

                {/* Collapsed short definition */}
                {!isExpanded && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '400px' }}>
                      {w.definition}
                    </span>
                    {w.bengali_meaning && (
                      <span style={{ color: 'hsl(var(--primary))', fontWeight: '600' }}>
                        {w.bengali_meaning}
                      </span>
                    )}
                  </div>
                )}

                {/* Expanded Details Portal */}
                {isExpanded && (
                  <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--border-muted)', paddingTop: '1rem', cursor: 'default' }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                      {/* Left Block */}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.8rem', minWidth: '250px' }}>
                        <div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Pronunciation Phonetics</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.15rem' }}>
                            <span style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>/{w.pronunciation}/</span>
                            <button 
                              onClick={(e) => speakWord(w.word, e)}
                              aria-label={`Listen to ${w.word} pronunciation`}
                              style={{ background: 'none', border: 'none', color: 'hsl(var(--primary))', cursor: 'pointer' }}
                            >
                              <Volume2 size={16} />
                            </button>
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>English Definition</div>
                          <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: '0.15rem', lineHeight: '1.4' }}>{w.definition}</p>
                        </div>

                        {w.bengali_meaning && (
                          <div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Bengali meaning (বাংলা অর্থ)</div>
                            <p style={{ fontSize: '0.9rem', color: 'hsl(var(--primary))', fontWeight: '600', marginTop: '0.15rem' }}>{w.bengali_meaning}</p>
                          </div>
                        )}
                      </div>

                      {/* Right Block */}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.8rem', minWidth: '250px' }}>
                        {w.mnemonic && (
                          <div style={{ padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-canvas)', borderLeft: '3px solid hsl(var(--secondary))' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.65rem', color: 'hsl(var(--secondary))', fontWeight: '700', textTransform: 'uppercase' }}>
                              <HelpCircle size={10} />
                              <span>Mnemonic Aid</span>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: '1.3' }}>{w.mnemonic}</p>
                          </div>
                        )}

                        {w.collocations && w.collocations.length > 0 && (
                          <div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Collocations</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.25rem' }}>
                              {w.collocations.map((col, idx) => (
                                <span key={idx} style={{ fontSize: '0.75rem', padding: '0.1rem 0.4rem', borderRadius: '4px', backgroundColor: 'var(--bg-canvas)', border: '1px solid var(--border-muted)', color: 'var(--text-primary)' }}>
                                  {col}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* SM-2 Progress details if active */}
                        {wProgress.nextReviewAt && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'hsla(var(--accent-purple), 0.05)', border: '1px solid hsla(var(--accent-purple), 0.2)', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                            <Info size={14} color="hsl(var(--accent-purple))" />
                            <span>SM-2: Mastery {wProgress.masteryScore}%. Next review: {new Date(wProgress.nextReviewAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {w.examples && w.examples.length > 0 && (
                      <div style={{ borderTop: '1px solid var(--border-muted)', paddingTop: '0.75rem' }}>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Example Usage</div>
                        <ul style={{ paddingLeft: '1.1rem', marginTop: '0.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem', lineHeight: '1.4' }}>
                          {w.examples.map((ex, idx) => (
                            <li key={idx}>"{ex.replace(/\*\*/g, '')}"</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
