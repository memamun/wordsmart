import React, { useState, createContext, useEffect } from 'react';
import { auth, db, googleProvider } from './firebase.js';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import AuthGateModal from './components/AuthGateModal.jsx';
import { isViewFree } from './config/freemium.js';
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import Dashboard from './components/Dashboard.jsx';
import LandingView from './components/LandingView.jsx';
import FlashcardsView from './components/FlashcardsView.jsx';
import ReviewSessionView from './components/ReviewSessionView.jsx';
import StoriesView from './components/StoriesView.jsx';
import QuizzesView from './components/QuizzesView.jsx';
import VocabDrillsView from './components/VocabDrillsView.jsx';
import QuickMatchView from './components/QuickMatchView.jsx';
import AdvancedQuizzesView from './components/AdvancedQuizzesView.jsx';
import TimeBlitzView from './components/TimeBlitzView.jsx';
import SearchView from './components/SearchView.jsx';
import LeaderboardView from './components/LeaderboardView.jsx';
import SpecializedVocabView from './components/SpecializedVocabView.jsx';
import WordDetailPanel from './components/WordDetailPanel.jsx';
import HitParadesView from './components/HitParadesView.jsx';
import AllQuizzesView from './components/AllQuizzesView.jsx';
import { useGameState } from './hooks/useGameState.js';
import { useWordsData } from './hooks/useWordsData.js';
import { AlertCircle, Compass, BookOpen, Award, Search, Menu, RotateCcw, Shield } from 'lucide-react';

export const DetailPanelContext = createContext();

const getSystemTheme = () => {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  return savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : getSystemTheme();
};

export default function App() {
  const state = useGameState();
  const wordsData = useWordsData();
  const [activeView, setActiveView] = useState(() => localStorage.getItem('has_entered_app') ? 'dashboard' : 'landing');
  const [selectedUnit, setSelectedUnit] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('sidebarCollapsed') === 'true');
  const [detailWordConfig, setDetailWordConfig] = useState(null);

  const openDetailWord = (wordOrConfig, list = null) => {
    if (!wordOrConfig) {
      setDetailWordConfig(null);
      return;
    }
    if (wordOrConfig.word) {
      setDetailWordConfig({
        word: wordOrConfig.word,
        list: wordOrConfig.list || list || wordsData.words || []
      });
    } else {
      setDetailWordConfig({
        word: wordOrConfig,
        list: list || wordsData.words || []
      });
    }
  };

  const detailWord = detailWordConfig?.word || null;
  const [theme, setTheme] = useState(getInitialTheme);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authGatePendingView, setAuthGatePendingView] = useState(null);

  // Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser || null);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async (pendingView, pendingUnit) => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        if (pendingView) {
          setActiveView(pendingView);
          setSidebarOpen(false);
        }
        if (pendingUnit !== undefined) {
          setSelectedUnit(pendingUnit);
        }
      }
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        console.error('Google sign-in failed:', err.message);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // Return to dashboard on sign out
      setActiveView('dashboard');
    } catch {
      // Catch sign-out error silently
    }
  };

  // On sign-in, restore full cloud progress and analytics into local state
  useEffect(() => {
    if (!user || !db) return;
    let isMounted = true;
    async function restoreCloudProgress() {
      try {
        const progressRef = doc(db, 'users', user.uid, 'data', 'progress');
        const progressSnap = await getDoc(progressRef);
        if (progressSnap.exists() && isMounted) {
          state.syncFromCloud(progressSnap.data());
        } else {
          // Fallback to top-level user doc for older format
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists() && isMounted) {
            state.syncFromCloud(userSnap.data());
          }
        }
      } catch (err) {
        console.warn('Could not restore cloud progress:', err);
      }
    }
    restoreCloudProgress();
    return () => { isMounted = false; };
  }, [user]);

  // Sync logged-in user profile to Cloud Firestore for live global leaderboard
  // and persist comprehensive learning analytics to 'users/{uid}/data/progress'
  useEffect(() => {
    if (!user || !db) return;
    const timer = setTimeout(() => {
      try {
        // 1. Lightweight public leaderboard document
        const userRef = doc(db, 'users', user.uid);
        const leaderboardPayload = {
          uid: user.uid,
          displayName: user.displayName || 'WordSmart Learner',
          photoURL: user.photoURL || null,
          xp: Number(state.xp) || 0,
          level: Number(state.unlockedLevel) || 1,
          streak: Number(state.streak) || 0,
          coins: Number(state.coins) || 0,
          masteredWordsCount: state.masteredWordIds?.length || 0,
          learningWordsCount: state.learningWordIds?.length || 0,
          updatedAt: serverTimestamp()
        };
        setDoc(userRef, leaderboardPayload, { merge: true }).catch(() => {});

        // 2. Comprehensive learning progress & analytics document
        const progressRef = doc(db, 'users', user.uid, 'data', 'progress');
        const progressPayload = {
          xp: Number(state.xp) || 0,
          coins: Number(state.coins) || 0,
          unlockedLevel: Number(state.unlockedLevel) || 1,
          streak: Number(state.streak) || 0,
          bookmarkedWordIds: state.bookmarkedWordIds || [],
          levelAttempts: state.levelAttempts || {},
          wordProgress: state.wordProgress || {},
          achievements: state.achievements || [],
          lastActiveDate: state.lastActiveDate || null,
          analytics: {
            masteredCount: state.masteredWordIds?.length || 0,
            learningCount: state.learningWordIds?.length || 0,
            totalQuizzesAttempted: Object.keys(state.levelAttempts || {}).length,
            updatedAt: serverTimestamp()
          }
        };
        setDoc(progressRef, progressPayload, { merge: true }).catch(() => {});
      } catch {
        // Graceful catch for offline
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [user, state.xp, state.unlockedLevel, state.streak, state.coins, state.wordProgress, state.levelAttempts, state.bookmarkedWordIds]);

  // Navigation History Stack for dynamic back button across submenus
  const [viewHistory, setViewHistory] = useState(['dashboard']);

  /**
   * Gated navigation: free views navigate immediately;
   * premium views show the AuthGateModal for guests.
   */
  const gatedSetActiveView = (viewId, unitNum) => {
    let targetUnit = unitNum;
    if (targetUnit === undefined) {
      targetUnit = (viewId === 'flashcards' && !user) ? 1 : selectedUnit;
      if (viewId === 'flashcards' && !user && selectedUnit > 1) {
        setSelectedUnit(1);
      }
    }

    const isFreeFlashcards = viewId === 'flashcards' && targetUnit === 1;
    
    if (isViewFree(viewId) || isFreeFlashcards || user) {
      if (targetUnit !== selectedUnit) {
        setSelectedUnit(targetUnit);
      }
      if (viewId !== activeView) {
        setViewHistory(prev => [...prev, activeView]);
      }
      setActiveView(viewId);
      setSidebarOpen(false);
    } else {
      setSidebarOpen(false);
      setAuthGatePendingView({ viewId, unitNum: targetUnit });
    }
  };

  const handleBack = () => {
    if (viewHistory.length > 0) {
      const nextHistory = [...viewHistory];
      const prevView = nextHistory.pop();
      setViewHistory(nextHistory.length > 0 ? nextHistory : ['dashboard']);
      setActiveView(prevView || 'dashboard');
    } else {
      setActiveView('dashboard');
    }
  };

  // Gesture State for 2026 Mobile Viewport Gesture Navigation
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 });

  const handleTouchStart = (e) => {
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const handleTouchMove = (e) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const handleTouchEnd = (e) => {
    const xDiff = touchStart.x - touchEnd.x;
    const yDiff = touchStart.y - touchEnd.y;

    // Prevent conflicts with flashcard card swiping, matching games, and standard scrolls
    const target = e.target;
    if (
      target.closest('.flashcard-wrapper') || 
      target.closest('.flashcard-view-container') || 
      target.closest('.review-view-container') || 
      target.closest('.game-container') || 
      target.closest('.no-swipe') || 
      target.closest('.quickmatch-container')
    ) {
      return;
    }

    // Dominate horizontal swipes with 80px horizontal delta and minor vertical slope
    if (Math.abs(xDiff) > 80 && Math.abs(yDiff) < 60) {
      const tabs = ['dashboard', 'flashcards', 'quizzes', 'search'];
      const currentIndex = tabs.indexOf(activeView);

      if (xDiff > 0) {
        // Swipe Left -> Next Tab
        if (currentIndex !== -1 && currentIndex < tabs.length - 1) {
          setActiveView(tabs[currentIndex + 1]);
        }
      } else {
        // Swipe Right -> Previous Tab
        if (currentIndex !== -1 && currentIndex > 0) {
          setActiveView(tabs[currentIndex - 1]);
        } else if (touchStart.x < 50) {
          // Swipe Right from edge -> Reveal Drawer
          setSidebarOpen(true);
        }
      }
    }
  };

  // Sync Theme attribute on <html> element. The default is resolved from system once,
  // then the explicit light/dark choice is persisted.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const renderActiveView = () => {
    switch (activeView) {
      case 'landing':
        return (
          <LandingView
            setActiveView={gatedSetActiveView}
            selectedUnit={selectedUnit}
            setSelectedUnit={setSelectedUnit}
            user={user}
            onGoogleSignIn={handleGoogleSignIn}
            wordsData={wordsData}
          />
        );
      case 'dashboard':
        return (
          <Dashboard 
            state={state} 
            wordsData={wordsData} 
            setActiveView={gatedSetActiveView} 
            selectedUnit={selectedUnit}
            setSelectedUnit={setSelectedUnit}
            user={user}
            onGoogleSignIn={handleGoogleSignIn}
          />
        );
      case 'flashcards':
        return (
          <FlashcardsView 
            state={state} 
            wordsData={wordsData} 
            setActiveView={gatedSetActiveView}
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
            setActiveView={gatedSetActiveView}
            selectedUnit={selectedUnit}
            setSelectedUnit={setSelectedUnit}
          />
        );
      case 'vocabdrills':
        return (
          <VocabDrillsView 
            state={state} 
            wordsData={wordsData} 
          />
        );
      case 'quickmatch':
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
            state={state}
            wordsData={wordsData} 
          />
        );
      case 'hitparades':
        return (
          <HitParadesView 
            wordsData={wordsData} 
          />
        );
      case 'allquizzes':
        return (
          <AllQuizzesView 
            state={state} 
            wordsData={wordsData} 
            setActiveView={setActiveView}
          />
        );
      case 'leaderboard':
        return (
          <LeaderboardView 
            state={state} 
            user={user}
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
        backgroundColor: 'var(--bg-canvas)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-body)'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '5px solid var(--bg-surface-elevated)',
          borderTop: '5px solid var(--theme-yellow)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '1rem'
        }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <span style={{ fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Loading Vocab Universe...</span>
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
        backgroundColor: 'var(--bg-canvas)',
        color: 'var(--text-primary)',
        padding: '2rem',
        textAlign: 'center',
        fontFamily: 'var(--font-body)'
      }}>
        <div className="glass-panel" style={{ padding: '2rem', maxWidth: '450px' }}>
          <AlertCircle size={48} color="var(--theme-red)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Database Error</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: '1.5' }}>
            {wordsData.error}
          </p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Try Reloading
          </button>
        </div>
      </div>
    );
  }

  // Helper to resolve active tab in mobile bottom bar
  const getMobileActiveTab = () => {
    if (activeView === 'dashboard') return 'dashboard';
    if (activeView === 'flashcards') return 'flashcards';
    if (activeView === 'quizzes') return 'quizzes';
    if (activeView === 'search') return 'search';
    return 'more';
  };

  // Standalone Full-Page SaaS Landing Experience for First Visits & Onboarding
  if (activeView === 'landing') {
    return (
      <div 
        className="standalone-landing-wrapper"
        data-theme={theme}
      >
        <LandingView
          setActiveView={(view, unit) => {
            localStorage.setItem('has_entered_app', 'true');
            gatedSetActiveView(view, unit);
          }}
          selectedUnit={selectedUnit}
          setSelectedUnit={setSelectedUnit}
          user={user}
          onGoogleSignIn={handleGoogleSignIn}
          wordsData={wordsData}
          theme={theme}
          setTheme={(t) => {
            setTheme(t);
            localStorage.setItem('theme', t);
          }}
        />
        {authGatePendingView && (
          <AuthGateModal 
            viewId={authGatePendingView.viewId}
            onGoogleSignIn={() => {
              const pending = authGatePendingView;
              setAuthGatePendingView(null);
              handleGoogleSignIn(pending.viewId, pending.unitNum);
            }}
            onDismiss={() => setAuthGatePendingView(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div 
      className="app-container"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Navigation Sidebar */}
      <Sidebar 
        activeView={activeView} 
        setActiveView={gatedSetActiveView}
        state={state} 
        wordsData={wordsData}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={(val) => {
          setSidebarCollapsed(val);
          localStorage.setItem('sidebarCollapsed', val);
        }}
        setShowResetConfirm={setShowResetConfirm}
        user={user}
        authLoading={authLoading}
        onGoogleSignIn={handleGoogleSignIn}
        onSignOut={handleSignOut}
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
            backgroundColor: 'var(--overlay)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
          }}
          className="animate-fade"
        />
      )}

      {/* Main Content Area */}
      <DetailPanelContext.Provider value={{ detailWord, setDetailWord: openDetailWord }}>
        <main className="main-content">
          <Header 
            state={state} 
            wordsData={wordsData} 
            selectedUnit={selectedUnit}
            setSelectedUnit={setSelectedUnit}
            activeView={activeView}
            setActiveView={gatedSetActiveView}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            theme={theme}
            setTheme={(t) => {
              setTheme(t);
              localStorage.setItem('theme', t);
            }}
            onBack={handleBack}
            canGoBack={activeView !== 'dashboard' && activeView !== 'landing'}
          />
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {renderActiveView()}
          </div>
        </main>
        {detailWordConfig?.word && (
          <WordDetailPanel 
            word={detailWordConfig.word} 
            wordList={detailWordConfig.list}
            onClose={() => setDetailWordConfig(null)} 
            onSelectWord={(newWord) => setDetailWordConfig(prev => ({ ...prev, word: newWord }))}
            gameState={state}
          />
        )}
      </DetailPanelContext.Provider>

      {/* Mobile Bottom Navigation Bar */}
      <div className="mobile-bottom-nav">
        <button 
          onClick={() => setActiveView('dashboard')} 
          className={`mobile-bottom-tab ${getMobileActiveTab() === 'dashboard' ? 'active' : ''}`}
        >
          <Compass size={20} />
          <span>Roadmap</span>
        </button>
        <button 
          onClick={() => setActiveView('flashcards')} 
          className={`mobile-bottom-tab ${getMobileActiveTab() === 'flashcards' ? 'active' : ''}`}
        >
          <BookOpen size={20} />
          <span>Study</span>
        </button>
        <button 
          onClick={() => setActiveView('quizzes')} 
          className={`mobile-bottom-tab ${getMobileActiveTab() === 'quizzes' ? 'active' : ''}`}
        >
          <Award size={20} />
          <span>Quizzes</span>
        </button>
        <button 
          onClick={() => setActiveView('search')} 
          className={`mobile-bottom-tab ${getMobileActiveTab() === 'search' ? 'active' : ''}`}
        >
          <Search size={20} />
          <span>Search</span>
        </button>
        <button 
          onClick={() => setSidebarOpen(true)} 
          className={`mobile-bottom-tab ${getMobileActiveTab() === 'more' || sidebarOpen ? 'active' : ''}`}
        >
          <Menu size={20} />
          <span>More</span>
        </button>
      </div>

      {/* Auth Gate Soft Modal for Guest Users */}
      {authGatePendingView && (
        <AuthGateModal 
          viewId={authGatePendingView.viewId}
          onGoogleSignIn={() => {
            const pending = authGatePendingView;
            setAuthGatePendingView(null);
            handleGoogleSignIn(pending.viewId, pending.unitNum);
          }}
          onDismiss={() => setAuthGatePendingView(null)}
        />
      )}

      {/* Global Self-Destruct Dialog Modal (Creative Playful Design) */}
      {showResetConfirm && (
        <>
          {/* Backdrop Overlay */}
          <div 
            onClick={() => setShowResetConfirm(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'var(--overlay)',
              backdropFilter: 'blur(6px)',
              zIndex: 99998,
            }}
            className="animate-fade"
          />
          {/* Start Fresh Console Dialog */}
          <div 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="fresh-modal-title" 
            style={{ 
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '350px',
              maxWidth: '90vw',
              padding: '1.5rem', 
              border: 'var(--border-thick)', 
              backgroundColor: 'var(--theme-yellow)', 
              color: 'var(--text-black)', 
              boxShadow: '8px 8px 0px var(--shadow-color)',
              zIndex: 99999,
              borderRadius: 'var(--radius-lg)',
              textAlign: 'center',
              fontFamily: 'var(--font-body)'
            }}
            className="animate-fade"
          >
            {/* Warning/Hazard Diagonal Stripes Strip */}
            <div style={{
              height: '16px',
              background: 'repeating-linear-gradient(45deg, var(--theme-cyan), var(--theme-cyan) 10px, var(--shadow-color) 10px, var(--shadow-color) 20px)',
              borderBottom: 'var(--border-thick)',
              margin: '-1.5rem -1.5rem 1rem -1.5rem',
              borderTopLeftRadius: '4px',
              borderTopRightRadius: '4px'
            }} />

            {/* Glowing Refresh badge */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.85rem' }}>
              <div style={{
                width: '54px',
                height: '54px',
                backgroundColor: 'var(--bg-surface)',
                border: 'var(--border-thick)',
                boxShadow: '3px 3px 0px var(--shadow-color)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--theme-yellow)'
              }}>
                <RotateCcw size={28} color="var(--text-black)" />
              </div>
            </div>

            <div id="fresh-modal-title" style={{ fontWeight: '900', fontSize: '1.35rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '-0.02em', fontFamily: 'var(--font-title)' }}>
              Start Fresh?
            </div>
            
            <p style={{ fontSize: '0.82rem', fontWeight: '700', lineHeight: '1.4', marginBottom: '1.5rem', color: 'var(--text-black)' }}>
              This will reset all your stage progress, XP levels, review history, and bookmarks back to the beginning. It's a great opportunity to start your vocabulary journey clean!
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <button 
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  fontSize: '0.85rem', 
                  fontWeight: '900', 
                  backgroundColor: 'var(--bg-surface)',
                  border: 'var(--border-thick)',
                  cursor: 'pointer',
                  boxShadow: '3px 3px 0px var(--shadow-color)',
                  textTransform: 'uppercase',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  color: 'var(--theme-red)'
                }} 
                onClick={() => { state.resetProgress(); window.location.reload(); }}
              >
                <RotateCcw size={16} /> Yes, Start Fresh
              </button>
              <button 
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  fontSize: '0.85rem', 
                  fontWeight: '900', 
                  backgroundColor: 'var(--theme-green)', 
                  border: 'var(--border-thick)', 
                  cursor: 'pointer', 
                  boxShadow: '3px 3px 0px var(--shadow-color)',
                  textTransform: 'uppercase',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  color: 'var(--text-black)'
                }} 
                onClick={() => setShowResetConfirm(false)}
              >
                <Shield size={16} /> Keep Learning
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
