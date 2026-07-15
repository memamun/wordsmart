import React, { useState } from 'react';
import { BookOpen, Calendar } from 'lucide-react';
import FlashcardsView from './FlashcardsView.jsx';
import ReviewSessionView from './ReviewSessionView.jsx';

export default function StudyDeckView({ state, wordsData, selectedUnit, setSelectedUnit }) {
  const [activeTab, setActiveTab] = useState('flashcards');

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Sub-navigation Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '0.75rem', 
        padding: '1rem 2rem', 
        borderBottom: 'var(--border-thick)',
        backgroundColor: 'var(--bg-surface-elevated)'
      }}>
        <button
          onClick={() => setActiveTab('flashcards')}
          className="btn"
          style={{
            backgroundColor: activeTab === 'flashcards' ? 'var(--theme-yellow)' : 'var(--bg-surface)',
            color: activeTab === 'flashcards' ? 'var(--text-black)' : 'var(--text-primary)',
            boxShadow: activeTab === 'flashcards' ? 'var(--shadow-tiny)' : 'var(--shadow-one)',
            padding: '0.5rem 1rem',
            fontSize: '0.9rem'
          }}
        >
          <BookOpen size={16} /> Flashcard Quest
        </button>
        <button
          onClick={() => setActiveTab('review')}
          className="btn"
          style={{
            backgroundColor: activeTab === 'review' ? 'var(--theme-yellow)' : 'var(--bg-surface)',
            color: activeTab === 'review' ? 'var(--text-black)' : 'var(--text-primary)',
            boxShadow: activeTab === 'review' ? 'var(--shadow-tiny)' : 'var(--shadow-one)',
            padding: '0.5rem 1rem',
            fontSize: '0.9rem'
          }}
        >
          <Calendar size={16} /> Spaced Review
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {activeTab === 'flashcards' ? (
          <FlashcardsView 
            state={state} 
            wordsData={wordsData} 
            selectedUnit={selectedUnit}
            setSelectedUnit={setSelectedUnit}
          />
        ) : (
          <ReviewSessionView 
            state={state} 
            wordsData={wordsData} 
          />
        )}
      </div>
    </div>
  );
}
