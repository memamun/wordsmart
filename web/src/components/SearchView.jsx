import React, { useState, useMemo, useContext } from 'react';
import { 
  Search, 
  Bookmark, 
  BookmarkCheck, 
  Volume2, 
  Award, 
  Filter, 
  Star, 
  BookOpen, 
  LayoutGrid, 
  List as ListIcon, 
  Sparkles, 
  ArrowRight, 
  X,
  Compass
} from 'lucide-react';
import { DetailPanelContext } from '../App';

const ALPHABET = ['ALL', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

export default function SearchView({ state, wordsData }) {
  const { setDetailWord } = useContext(DetailPanelContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'bookmarked', 'mastered', 'learning', 'hit_parades', 'beginner', 'intermediate', 'advanced'
  const [selectedLetter, setSelectedLetter] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

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
    if ((wordsData.words || []).length === 0) return [];

    let result = wordsData.words || [];

    // Apply category & difficulty filters
    if (filterMode === 'bookmarked') {
      result = result.filter(w => (state.bookmarkedWordIds || []).includes(w.id));
    } else if (filterMode === 'mastered') {
      result = result.filter(w => {
        const prog = (state.wordProgress || {})[w.id];
        return prog && prog.status === 'mastered';
      });
    } else if (filterMode === 'learning') {
      result = result.filter(w => {
        const prog = (state.wordProgress || {})[w.id];
        return prog && (prog.status === 'learning' || prog.status === 'reviewing' || prog.status === 'relearning');
      });
    } else if (filterMode === 'hit_parades') {
      const satList = wordsData.hitParades?.sat_hit_parade?.map(item => item.word.toLowerCase()) || [];
      result = result.filter(w => satList.includes(w.word.toLowerCase()));
    } else if (filterMode === 'beginner' || filterMode === 'intermediate' || filterMode === 'advanced') {
      result = result.filter(w => w.level === filterMode);
    }

    // Apply A-Z letter filter
    if (selectedLetter !== 'ALL') {
      result = result.filter(w => w.word.toUpperCase().startsWith(selectedLetter));
    }

    // Apply search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(w => 
        w.word.toLowerCase().includes(q) || 
        w.definition.toLowerCase().includes(q) ||
        (w.bengali_meaning && w.bengali_meaning.toLowerCase().includes(q)) ||
        (w.synonyms && w.synonyms.some(s => s.toLowerCase().includes(q)))
      );
    }

    return result;
  }, [wordsData.words, wordsData.hitParades, searchQuery, filterMode, selectedLetter, state.bookmarkedWordIds, state.wordProgress]);

  const handleOpenDetail = (word) => {
    if (setDetailWord) {
      setDetailWord({ word, list: filteredWords });
    }
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fade search-view-container">
      
      {/* Neumorphic Hero Header Banner */}
      <div className="glass-panel" style={{
        padding: '1.75rem 2rem',
        background: 'linear-gradient(135deg, rgba(24, 255, 255, 0.1) 0%, rgba(224, 64, 251, 0.08) 50%, rgba(18, 24, 36, 0.95) 100%)',
        border: 'var(--border-thick)',
        boxShadow: 'var(--neu-shadow-extrude), var(--shadow-medium)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #18FFFF 0%, #00E5FF 100%)',
              border: '2.5px solid #000000',
              boxShadow: '0 4px 0 #000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Search size={28} color="#000000" />
            </div>
            <div>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: '900',
                padding: '0.2rem 0.6rem',
                borderRadius: '9999px',
                backgroundColor: '#000000',
                color: '#FFD54F',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                border: '1px solid rgba(255, 213, 79, 0.4)'
              }}>
                <Sparkles size={11} style={{ display: 'inline', marginRight: '3px' }} /> Smart Vocabulary Search
              </span>
              <h1 style={{ fontSize: '1.85rem', fontFamily: 'var(--font-title)', fontWeight: '900', margin: '0.2rem 0 0 0' }}>
                Dictionary Portal
              </h1>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{
              fontSize: '0.82rem',
              fontWeight: '900',
              fontFamily: 'var(--font-title)',
              backgroundColor: 'var(--bg-surface-elevated)',
              color: 'var(--theme-cyan)',
              padding: '0.4rem 0.9rem',
              borderRadius: '9999px',
              border: 'var(--border-thin)',
              boxShadow: 'var(--shadow-tiny)'
            }}>
              {filteredWords.length} / {(wordsData.words || []).length || 1913} WORDS
            </span>

            {/* View Mode Toggle */}
            <div style={{ display: 'flex', backgroundColor: 'var(--bg-surface)', padding: '3px', borderRadius: '10px', border: 'var(--border-thin)' }}>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '0.35rem 0.6rem',
                  borderRadius: '7px',
                  border: 'none',
                  backgroundColor: viewMode === 'grid' ? 'var(--theme-purple)' : 'transparent',
                  color: viewMode === 'grid' ? '#FFFFFF' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Grid View"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  padding: '0.35rem 0.6rem',
                  borderRadius: '7px',
                  border: 'none',
                  backgroundColor: viewMode === 'list' ? 'var(--theme-purple)' : 'transparent',
                  color: viewMode === 'list' ? '#FFFFFF' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="List View"
              >
                <ListIcon size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Search Input Bar */}
        <div style={{ position: 'relative', width: '100%' }}>
          <input 
            type="text"
            placeholder="Search by word spelling, definition, Bengali meaning, or synonyms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input-field"
            style={{
              width: '100%',
              padding: '0.85rem 2.8rem 0.85rem 3.4rem',
              fontSize: '0.92rem',
              fontWeight: '700',
              borderRadius: '14px',
              border: '2.5px solid #000000',
              boxShadow: '3px 3px 0px #000000',
              background: 'var(--bg-surface-elevated)',
              color: 'var(--text-primary)',
              outline: 'none'
            }}
          />
          <Search 
            size={20} 
            color="#18FFFF" 
            style={{ position: 'absolute', left: '1.1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} 
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Alphabet A-Z Selector Bar */}
        <div className="no-scrollbar" style={{ display: 'flex', gap: '0.3rem', overflowX: 'auto', paddingBottom: '0.2rem', WebkitOverflowScrolling: 'touch' }}>
          {ALPHABET.map(letter => {
            const isSelected = selectedLetter === letter;
            return (
              <button
                key={letter}
                onClick={() => setSelectedLetter(letter)}
                style={{
                  padding: '0.3rem 0.6rem',
                  fontSize: '0.75rem',
                  fontWeight: '900',
                  fontFamily: 'var(--font-title)',
                  borderRadius: '8px',
                  border: isSelected ? '2px solid #000000' : '1px solid var(--border-muted)',
                  backgroundColor: isSelected ? 'var(--theme-cyan)' : 'var(--bg-surface-elevated)',
                  color: isSelected ? '#000000' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  flexShrink: 0,
                  boxShadow: isSelected ? '2px 2px 0 #000000' : 'none'
                }}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category & Status Filter Tabs */}
      <div className="pill-tabs no-scrollbar" style={{ display: 'flex', gap: '0.6rem', overflowX: 'auto', paddingBottom: '0.25rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0 }}>
          <Filter size={14} /> Filter:
        </span>
        <button 
          onClick={() => setFilterMode('all')}
          className={`filter-pill ${filterMode === 'all' ? 'active active-cyan' : ''}`}
        >
          All ({(wordsData.words || []).length})
        </button>
        <button 
          onClick={() => setFilterMode('bookmarked')}
          className={`filter-pill ${filterMode === 'bookmarked' ? 'active active-yellow' : ''}`}
        >
          <Bookmark size={13} /> Bookmarked ({(state.bookmarkedWordIds || []).length})
        </button>
        <button 
          onClick={() => setFilterMode('mastered')}
          className={`filter-pill ${filterMode === 'mastered' ? 'active active-green' : ''}`}
        >
          <Award size={13} /> Mastered ({Object.values(state.wordProgress || {}).filter(p => p.status === 'mastered').length})
        </button>
        <button 
          onClick={() => setFilterMode('learning')}
          className={`filter-pill ${filterMode === 'learning' ? 'active active-purple' : ''}`}
        >
          <BookOpen size={13} /> Learning ({Object.values(state.wordProgress || {}).filter(p => p.status === 'learning' || p.status === 'reviewing' || p.status === 'relearning').length})
        </button>
        <button 
          onClick={() => setFilterMode('hit_parades')}
          className={`filter-pill ${filterMode === 'hit_parades' ? 'active active-blue' : ''}`}
        >
          <Star size={13} /> SAT Hit Parade
        </button>
      </div>

      {/* Words Grid / List Container */}
      {filteredWords.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', borderRadius: 'var(--radius-lg)' }}>
          <Compass size={36} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
          <h3 style={{ fontFamily: 'var(--font-title)', color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>No matching vocabulary terms</h3>
          <p style={{ fontSize: '0.9rem', margin: 0 }}>Try clearing your search query or switching your letter / category filters.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '1.25rem' }}>
          {filteredWords.slice(0, 100).map((w) => {
            const isBookmarked = (state.bookmarkedWordIds || []).includes(w.id);

            return (
              <div
                key={w.id}
                className="card card-hover"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  padding: '1.35rem',
                  borderRadius: '16px',
                  border: '2.5px solid #000000',
                  borderLeft: '7px solid #18FFFF',
                  boxShadow: '4px 4px 0px #000000',
                  backgroundColor: 'var(--bg-surface)',
                  cursor: 'pointer'
                }}
                onClick={() => handleOpenDetail(w)}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-title)', fontWeight: '900', color: 'var(--text-primary)', margin: 0 }}>
                      {w.word}
                    </h3>
                    {w.part_of_speech && (
                      <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '99px', background: 'linear-gradient(135deg, #18FFFF 0%, #00E5FF 100%)', color: '#000000', fontWeight: '900', textTransform: 'uppercase', border: '1.5px solid #000000' }}>
                        {w.part_of_speech}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }} onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => speakWord(w.word, e)}
                      title="Listen pronunciation"
                      style={{ background: 'none', border: 'none', color: 'var(--theme-purple)', cursor: 'pointer', padding: '0.2rem' }}
                    >
                      <Volume2 size={16} />
                    </button>
                    <button
                      onClick={() => state.toggleBookmark(w.id)}
                      title={isBookmarked ? "Remove bookmark" : "Bookmark word"}
                      style={{ background: 'none', border: 'none', color: isBookmarked ? '#FFD54F' : 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem' }}
                    >
                      {isBookmarked ? <BookmarkCheck size={18} fill="#FFD54F" /> : <Bookmark size={18} />}
                    </button>
                  </div>
                </div>

                {/* Definition */}
                <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.55', margin: 0, fontWeight: '500' }}>
                  {w.definition}
                </p>

                {/* Synonyms Preview */}
                {w.synonyms && w.synonyms.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap', fontSize: '0.78rem' }}>
                    <span style={{ fontWeight: '900', color: '#18FFFF', fontSize: '0.7rem', textTransform: 'uppercase' }}>SYN:</span>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>
                      {w.synonyms.slice(0, 3).join(', ')}
                    </span>
                  </div>
                )}

                {/* Bengali Meaning Pill (High Contrast) */}
                {w.bengali_meaning && (
                  <div style={{
                    marginTop: 'auto',
                    padding: '0.5rem 0.85rem',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, rgba(24, 255, 255, 0.15) 0%, rgba(224, 64, 251, 0.15) 100%)',
                    border: '1.5px solid rgba(24, 255, 255, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'space-between',
                    boxShadow: '2px 2px 0px rgba(0,0,0,0.4)'
                  }}>
                    <span style={{ fontSize: '0.92rem', fontWeight: '900', color: '#18FFFF', fontFamily: 'var(--font-body)' }}>
                      {w.bengali_meaning}
                    </span>
                    <ArrowRight size={15} color="#18FFFF" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredWords.slice(0, 100).map((w) => {
            const isBookmarked = (state.bookmarkedWordIds || []).includes(w.id);

            return (
              <div
                key={w.id}
                className="card card-hover"
                style={{
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderRadius: '14px',
                  border: '2px solid #000000',
                  boxShadow: '3px 3px 0px #000000',
                  backgroundColor: 'var(--bg-surface)',
                  cursor: 'pointer',
                  gap: '1rem'
                }}
                onClick={() => handleOpenDetail(w)}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: '900', fontFamily: 'var(--font-title)', color: 'var(--text-primary)' }}>
                      {w.word}
                    </span>
                    {w.part_of_speech && (
                      <span style={{ fontSize: '0.68rem', padding: '1px 7px', borderRadius: '4px', background: '#18FFFF', color: '#000000', fontWeight: '900' }}>
                        {w.part_of_speech}
                      </span>
                    )}
                    {w.bengali_meaning && (
                      <span style={{ fontSize: '0.88rem', color: '#18FFFF', fontWeight: '900', marginLeft: '0.5rem' }}>
                        {w.bengali_meaning}
                      </span>
                    )}
                  </div>

                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {w.definition}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => speakWord(w.word, e)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    <Volume2 size={16} />
                  </button>
                  <button
                    onClick={() => state.toggleBookmark(w.id)}
                    style={{ background: 'none', border: 'none', color: isBookmarked ? '#FFD54F' : 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    {isBookmarked ? <BookmarkCheck size={18} fill="#FFD54F" /> : <Bookmark size={18} />}
                  </button>
                  <BookOpen size={16} color="var(--theme-cyan)" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

