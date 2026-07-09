import React, { useState, createContext, useContext } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import Dashboard from './components/Dashboard.jsx';
import FlashcardsView from './components/FlashcardsView.jsx';
import ReviewSessionView from './components/ReviewSessionView.jsx';
import StoriesView from './components/StoriesView.jsx';
import QuizzesView from './components/QuizzesView.jsx';
import AnalogyView from './components/AnalogyView.jsx';
import TimeBlitzView from './components/TimeBlitzView.jsx';
import SearchView from './components/SearchView.jsx';
import LeaderboardView from './components/LeaderboardView.jsx';
import SpecializedVocabView from './components/SpecializedVocabView.jsx';
import WordDetailPanel from './components/WordDetailPanel.jsx';
import { useGameState } from './hooks/useGameState.js';
import { useWordsData } from './hooks/useWordsData.js';
import { AlertCircle } from 'lucide-react';

export const DetailPanelContext = createContext();

export default function App() {
  const state = useGameState();
  const wordsData = useWordsData();
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedUnit, setSelectedUnit] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [detailWord, setDetailWord] = useState(null);

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <Dashboard 
            state={state} 
            wordsData={wordsData} 
            setActiveView={setActiveView} 
            selectedUnit={selectedUnit}
            setSelectedUnit={setSelectedUnit}
          />
        );
      case 'flashcards':
        return (
          <FlashcardsView 
            state={state} 
            wordsData={wordsData} 
            setActiveView={setActiveView} 
            selectedUnit={selectedUnit}
            setSelectedUnit={setSelectedUnit}
          />
        );
      case 'review':
        return (
          <ReviewSessionView 
            state={state} 
            wordsData={wordsData} 
          />
        );
      case 'stories':
        return (
          <StoriesView 
            state={state} 
            wordsData={wordsData} 
          />
        );
      case 'quizzes':
        return (
          <QuizzesView 
            state={state} 
            wordsData={wordsData} 
            setActiveView={setActiveView} 
            selectedUnit={selectedUnit}
            setSelectedUnit={setSelectedUnit}
          />
        );
      case 'analogy':
        return (
          <AnalogyView 
            state={state} 
            wordsData={wordsData} 
          />
        );
      case 'timeblitz':
        return (
          <TimeBlitzView 
            state={state} 
            wordsData={wordsData} 
          />
        );
      case 'search':
        return (
          <SearchView 
            state={state} 
            wordsData={wordsData} 
          />
        );
      case 'specialized':
        return (
          <SpecializedVocabView 
            wordsData={wordsData} 
          />
        );
      case 'leaderboard':
        return (
          <LeaderboardView 
            state={state} 
          />
        );
      default:
        return (
          <Dashboard 
            state={state} 
            wordsData={wordsData} 
            setActiveView={setActiveView} 
            selectedUnit={selectedUnit}
            setSelectedUnit={setSelectedUnit}
          />
        );
    }
  };

  if (wordsData.loading && wordsData.words.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#0b0f19',
        color: 'white',
        gap: '1rem'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid rgba(255,255,255,0.05)',
          borderTopColor: '#10B981',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: '600' }}>Loading WordSmart</h3>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Loading vocabulary databases...</p>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (wordsData.error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#0b0f19',
        color: 'white',
        padding: '2rem',
        textAlign: 'center',
        gap: '1rem'
      }}>
        <AlertCircle size={48} color="#EF4444" />
        <h2 style={{ fontFamily: 'Outfit, sans-serif' }}>Loading Error</h2>
        <p style={{ color: '#e2e8f0', maxWidth: '500px', lineHeight: '1.5' }}>
          Could not load the core vocabulary database. Please verify that the files `core_vocabulary.json`, `mcq_quizzes.json`, `contextual_stories.json`, and `hit_parades.json` are placed in the `web/public/data/` directory.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="btn btn-primary"
          style={{ marginTop: '1rem' }}
        >
          Retry Load
        </button>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeView={activeView} 
        setActiveView={(view) => {
          setActiveView(view);
          setSidebarOpen(false); // Auto close sidebar on mobile navigation
        }}
        state={state} 
        wordsData={wordsData}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Sidebar Overlay (Mobile Dismissal Backdrop) */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 998,
          }}
          className="animate-fade"
        />
      )}

      {/* Main Content Area */}
      <DetailPanelContext.Provider value={{ detailWord, setDetailWord }}>
        <main className="main-content">
          <Header 
            state={state} 
            wordsData={wordsData} 
            selectedUnit={selectedUnit}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {renderActiveView()}
          </div>
        </main>
        {detailWord && (
          <WordDetailPanel word={detailWord} onClose={() => setDetailWord(null)} />
        )}
      </DetailPanelContext.Provider>
    </div>
  );
}
