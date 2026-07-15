import React, { useState } from 'react';
import { Search, Book, Star } from 'lucide-react';
import SearchView from './SearchView.jsx';
import SpecializedVocabView from './SpecializedVocabView.jsx';
import HitParadesView from './HitParadesView.jsx';

export default function WordBankView({ state, wordsData }) {
  const [activeTab, setActiveTab] = useState('search');

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Sub-navigation Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '0.75rem', 
        padding: '1rem 2rem', 
        borderBottom: 'var(--border-thick)',
        backgroundColor: 'var(--bg-surface-elevated)',
        overflowX: 'auto',
        whiteSpace: 'nowrap'
      }}>
        <button
          onClick={() => setActiveTab('search')}
          className="btn"
          style={{
            backgroundColor: activeTab === 'search' ? 'var(--theme-yellow)' : 'var(--bg-surface)',
            boxShadow: activeTab === 'search' ? 'var(--shadow-tiny)' : 'var(--shadow-one)',
            color: activeTab === 'search' ? 'var(--text-black)' : 'var(--text-primary)',
            padding: '0.5rem 1rem',
            fontSize: '0.9rem'
          }}
        >
          <Search size={16} /> Dictionary Portal
        </button>
        <button
          onClick={() => setActiveTab('specialized')}
          className="btn"
          style={{
            backgroundColor: activeTab === 'specialized' ? 'var(--theme-yellow)' : 'var(--bg-surface)',
            boxShadow: activeTab === 'specialized' ? 'var(--shadow-tiny)' : 'var(--shadow-one)',
            color: activeTab === 'specialized' ? 'var(--text-black)' : 'var(--text-primary)',
            padding: '0.5rem 1rem',
            fontSize: '0.9rem'
          }}
        >
          <Book size={16} /> Specialized Vocabs
        </button>
        <button
          onClick={() => setActiveTab('hitparades')}
          className="btn"
          style={{
            backgroundColor: activeTab === 'hitparades' ? 'var(--theme-yellow)' : 'var(--bg-surface)',
            boxShadow: activeTab === 'hitparades' ? 'var(--shadow-tiny)' : 'var(--shadow-one)',
            color: activeTab === 'hitparades' ? 'var(--text-black)' : 'var(--text-primary)',
            padding: '0.5rem 1rem',
            fontSize: '0.9rem'
          }}
        >
          <Star size={16} /> Hit Parades
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {activeTab === 'search' ? (
          <SearchView 
            state={state}
            wordsData={wordsData} 
          />
        ) : activeTab === 'specialized' ? (
          <SpecializedVocabView 
            state={state} 
            wordsData={wordsData} 
          />
        ) : (
          <HitParadesView 
            wordsData={wordsData} 
          />
        )}
      </div>
    </div>
  );
}
