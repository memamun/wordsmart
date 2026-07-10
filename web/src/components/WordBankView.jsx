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
        borderBottom: '3px solid #000000',
        backgroundColor: 'var(--bg-surface-elevated)',
        overflowX: 'auto',
        whiteSpace: 'nowrap'
      }}>
        <button
          onClick={() => setActiveTab('search')}
          className="btn"
          style={{
            backgroundColor: activeTab === 'search' ? '#FFD740' : '#ffffff',
            boxShadow: activeTab === 'search' ? '2px 2px 0px #000000' : '1px 1px 0px #000000',
            color: '#000000',
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
            backgroundColor: activeTab === 'specialized' ? '#FFD740' : '#ffffff',
            boxShadow: activeTab === 'specialized' ? '2px 2px 0px #000000' : '1px 1px 0px #000000',
            color: '#000000',
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
            backgroundColor: activeTab === 'hitparades' ? '#FFD740' : '#ffffff',
            boxShadow: activeTab === 'hitparades' ? '2px 2px 0px #000000' : '1px 1px 0px #000000',
            color: '#000000',
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
