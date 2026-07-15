import React, { useState } from 'react';
import { 
  Award, 
  Zap, 
  Puzzle, 
  GraduationCap, 
  Library 
} from 'lucide-react';
import QuizzesView from './QuizzesView.jsx';
import VocabDrillsView from './VocabDrillsView.jsx';
import QuickMatchView from './QuickMatchView.jsx';
import AdvancedQuizzesView from './AdvancedQuizzesView.jsx';
import TimeBlitzView from './TimeBlitzView.jsx';
import AllQuizzesView from './AllQuizzesView.jsx';

export default function QuizHubView({ state, wordsData, selectedUnit, setSelectedUnit, setActiveView }) {
  const [activeTab, setActiveTab] = useState('library'); // Default to library to explore

  const TABS = [
    { id: 'library', label: 'Quiz Library', icon: Library, color: 'var(--theme-cyan)' },
    { id: 'qualification', label: 'Qualification MCQs', icon: Award, color: 'var(--theme-green)' },
    { id: 'drills', label: 'Vocab Drills', icon: Zap, color: 'var(--theme-purple)' },
    { id: 'match', label: 'Quick Match', icon: Puzzle, color: 'var(--theme-yellow)' },
    { id: 'advanced', label: 'Advanced GRE/SAT', icon: GraduationCap, color: 'var(--theme-red)' },
    { id: 'blitz', label: 'Time Blitz', icon: Zap, color: 'var(--theme-orange)' }
  ];

  const renderActiveView = () => {
    switch (activeTab) {
      case 'qualification':
        return (
          <QuizzesView 
            state={state} 
            wordsData={wordsData} 
            selectedUnit={selectedUnit}
            setSelectedUnit={setSelectedUnit}
          />
        );
      case 'drills':
        return (
          <VocabDrillsView 
            state={state} 
            wordsData={wordsData} 
          />
        );
      case 'match':
        return (
          <QuickMatchView 
            state={state} 
            wordsData={wordsData} 
          />
        );
      case 'advanced':
        return (
          <AdvancedQuizzesView 
            state={state} 
            wordsData={wordsData} 
          />
        );
      case 'blitz':
        return (
          <TimeBlitzView 
            state={state} 
            wordsData={wordsData} 
          />
        );
      case 'library':
      default:
        return (
          <AllQuizzesView 
            state={state} 
            wordsData={wordsData} 
            setActiveView={setActiveView}
          />
        );
    }
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Scrollable Sub-navigation Tabs */}
      <div className="no-scrollbar" style={{ 
        display: 'flex', 
        gap: '0.75rem', 
        padding: '1rem 2rem', 
        borderBottom: 'var(--border-thick)',
        backgroundColor: 'var(--bg-surface-elevated)',
        overflowX: 'auto',
        whiteSpace: 'nowrap'
      }}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="btn"
              style={{
                backgroundColor: isActive ? tab.color : 'var(--bg-surface)',
                boxShadow: isActive ? 'var(--shadow-tiny)' : 'var(--shadow-one)',
                color: isActive ? 'var(--text-black)' : 'var(--text-primary)',
                padding: '0.5rem 1rem',
                fontSize: '0.9rem',
                flexShrink: 0
              }}
            >
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {renderActiveView()}
      </div>
    </div>
  );
}
