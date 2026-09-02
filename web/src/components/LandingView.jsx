import React, { useState } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Award, 
  ArrowRight, 
  Brain, 
  Compass, 
  Zap, 
  Trophy, 
  CheckCircle2, 
  RotateCw, 
  Volume2, 
  Layers, 
  Book, 
  Check, 
  Clock, 
  Star, 
  Folder, 
  ShieldCheck,
  Flame,
  LogIn,
  Sun,
  Moon,
  ChevronRight,
  ChevronDown,
  HelpCircle,
  BarChart3,
  ExternalLink,
  GraduationCap,
  Users,
  Target,
  Sparkle
} from 'lucide-react';
import { PREP_STAGES } from '../hooks/useGameState';

function WelcomeDecoration() {
  return (
    <div className="welcome-decor-container" style={{
      position: 'relative',
      width: '160px',
      height: '160px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      margin: '0 auto'
    }}>
      {/* Neo-brutalist floating elements */}
      <svg width="120" height="120" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(var(--shadow-small))' }}>
        {/* Outer dotted grid circle */}
        <circle cx="80" cy="80" r="70" stroke="var(--text-muted)" strokeWidth="2" strokeDasharray="6 6" opacity="0.3" />
        
        {/* Main circular frame */}
        <circle cx="80" cy="80" r="55" fill="var(--bg-canvas)" stroke="var(--border-muted)" strokeWidth="4" />
        
        {/* Inner grid lines */}
        <path d="M40 80H120" stroke="var(--border-muted)" strokeWidth="2" opacity="0.5" />
        <path d="M80 40V120" stroke="var(--border-muted)" strokeWidth="2" opacity="0.5" />
        
        {/* Neobrutalist accent shape: star/burst */}
        <path d="M80 50L84 76L110 80L84 84L80 110L76 84L50 80L76 76L80 50Z" fill="var(--theme-yellow)" stroke="var(--border-muted)" strokeWidth="3" />
        
        {/* Small floating sparkles/dots */}
        <circle cx="45" cy="55" r="5" fill="var(--theme-cyan)" stroke="var(--border-muted)" strokeWidth="2" />
        <circle cx="115" cy="115" r="4" fill="var(--theme-purple)" stroke="var(--border-muted)" strokeWidth="2" />
        <path d="M110 50L115 55M115 50L110 55" stroke="var(--theme-green)" strokeWidth="3" strokeLinecap="round" />
        <path d="M50 110L55 115M55 110L50 115" stroke="var(--theme-yellow)" strokeWidth="3" strokeLinecap="round" />
      </svg>
      
      {/* Floating vocabulary badge */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        right: '5px',
        background: 'var(--theme-cyan)',
        color: 'var(--text-black)',
        border: 'var(--border-thin)',
        boxShadow: 'var(--shadow-tiny)',
        padding: '0.25rem 0.5rem',
        borderRadius: 'var(--radius-md)',
        fontWeight: '900',
        fontSize: '0.65rem',
        transform: 'rotate(8deg)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        animation: 'float 3s ease-in-out infinite'
      }}>
        VOCAB PRO
      </div>
      
      {/* Floating streak badge */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '5px',
        background: 'var(--theme-purple)',
        color: 'var(--text-black)',
        border: 'var(--border-thin)',
        boxShadow: 'var(--shadow-tiny)',
        padding: '0.25rem 0.5rem',
        borderRadius: 'var(--radius-md)',
        fontWeight: '900',
        fontSize: '0.65rem',
        transform: 'rotate(-8deg)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        animation: 'float 3.5s ease-in-out infinite alternate'
      }}>
        LEVEL UP ⚡
      </div>
    </div>
  );
}

function SpecializedDecoration() {
  return (
    <div className="welcome-decor-container" style={{
      position: 'relative',
      width: '120px',
      height: '100px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      margin: '0 auto',
      animation: 'float 3.2s ease-in-out infinite'
    }}>
      {/* Stack of English and Bengali card graphics */}
      <div style={{
        position: 'absolute',
        width: '55px',
        height: '70px',
        background: 'var(--theme-purple)',
        border: 'var(--border-thick)',
        borderRadius: 'var(--radius-lg)',
        transform: 'rotate(-15deg) translate(-20px, 0px)',
        boxShadow: 'var(--shadow-small)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '900',
        color: 'var(--text-black)',
        fontSize: '1.25rem',
        fontFamily: 'var(--font-title)'
      }}>
        A
      </div>
      <div style={{
        position: 'absolute',
        width: '55px',
        height: '70px',
        background: 'var(--theme-yellow)',
        border: 'var(--border-thick)',
        borderRadius: 'var(--radius-lg)',
        transform: 'rotate(5deg) translate(15px, -5px)',
        boxShadow: 'var(--shadow-small)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '900',
        color: 'var(--text-black)',
        fontSize: '1.25rem',
        fontFamily: 'var(--font-title)',
        zIndex: 2
      }}>
        অ
      </div>
    </div>
  );
}

function WindowPanel({ title, headerColor, shadowVar, className = '', style = {}, children }) {
  return (
    <div className={`card-hover ${className}`} style={{
      backgroundColor: 'var(--bg-surface)',
      border: 'var(--border-thick)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: shadowVar || 'var(--shadow-main)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      transition: 'var(--transition-normal)',
      position: 'relative',
      ...style
    }}>
      {/* Window Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.5rem 0.75rem',
        background: headerColor,
        borderBottom: 'var(--border-thick)',
        color: 'var(--text-black)',
        fontWeight: '900',
        fontSize: '0.65rem',
        fontFamily: 'monospace',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        userSelect: 'none'
      }}>
        {/* Retro Window Control Circles */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FF5252', border: '1.5px solid var(--border-muted)' }} />
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FFD700', border: '1.5px solid var(--border-muted)' }} />
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#69F0AE', border: '1.5px solid var(--border-muted)' }} />
        </div>
        <div>{title}</div>
      </div>
      {/* Window Body Content */}
      <div className="window-body" style={{ padding: '1.5rem', flex: 1, position: 'relative' }}>
        {children}
      </div>
    </div>
  );
}

export default function LandingView({ setActiveView, setSelectedUnit, user, onGoogleSignIn, wordsData, theme, setTheme }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [sampleWordIndex, setSampleWordIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);

  // Sample words for interactive live demo
  const sampleWords = [
    {
      word: 'ABERRATION',
      phonetic: '/ˌæb.əˈreɪ.ʃən/',
      partOfSpeech: 'noun',
      bangla: 'স্বাভাবিক অবস্থা থেকে বিচ্যুতি বা অস্বাভাবিক ঘটনা',
      definition: 'A departure from what is normal, usual, or expected, typically one that is unwelcome.',
      example: 'In a year of record high profits, the loss in the second quarter was an aberration.',
      unit: '1.1',
      stage: '1'
    },
    {
      word: 'EPHEMERAL',
      phonetic: '/ɪˈfem.ər.əl/',
      partOfSpeech: 'adjective',
      bangla: 'ক্ষণস্থায়ী, অল্পক্ষণ টিকে থাকে এমন',
      definition: 'Lasting for a very short time; transitory.',
      example: 'Fame in the age of social media can be surprisingly ephemeral.',
      unit: '1.1',
      stage: '1'
    },
    {
      word: 'UBIQUITOUS',
      phonetic: '/juːˈbɪk.wɪ.təs/',
      partOfSpeech: 'adjective',
      bangla: 'সর্বব্যাপী, সর্বত্র বিদ্যমান',
      definition: 'Present, appearing, or found everywhere.',
      example: 'Smartphones have become ubiquitous across modern urban society.',
      unit: '1.2',
      stage: '1'
    }
  ];

  const currentSample = sampleWords[sampleWordIndex];

  const handleNextSample = () => {
    setIsFlipped(false);
    setSampleWordIndex((prev) => (prev + 1) % sampleWords.length);
  };

  const handlePlayAudio = (e) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentSample.word);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const faqs = [
    {
      q: "How does the SM-2 Spaced Repetition engine work?",
      a: "WordSmart tracks your confidence level on every flashcard and quiz attempt. Words you find challenging are scheduled for recall review sooner, while mastered words are spaced across wider intervals, maximizing long-term memory retention before the forgetting curve takes effect."
    },
    {
      q: "Is WordSmart free for new learners?",
      a: "Yes! You can explore the interactive trial, study Unit 1.1 flashcards, take practice quizzes, and access the dictionary portal without any account. Creating a free account with Google syncs your SM-2 progress deck across all devices and unlocks all 100 units."
    },
    {
      q: "What examinations is this vocabulary aligned with?",
      a: "The curriculum is specifically crafted for SASS, GRE, SAT, and competitive government / university exams. It includes 1,900+ high-frequency headwords, specialized idioms, foreign expressions, and grammar usage terms."
    },
    {
      q: "Does WordSmart support offline and mobile devices?",
      a: "Yes. WordSmart is built mobile-first with responsive touch swipe navigation, audio pronunciations, and lightning-fast client caching for smooth study sessions on phones, tablets, and desktops."
    }
  ];

  return (
    <div className="standalone-landing-page animate-fade" style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-canvas)',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-body)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      
      {/* ======================================================== */}
      {/* STANDALONE SAAS NAVBAR                                   */}
      {/* ======================================================== */}
      <nav className="saas-navbar" style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'var(--bg-surface)',
        borderBottom: 'var(--border-thick)',
        boxShadow: 'var(--shadow-tiny)',
        padding: '0.85rem 2rem'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          {/* Brand Logo */}
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
          >
            <div style={{
              width: '38px',
              height: '38px',
              backgroundColor: 'var(--theme-yellow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'var(--border-thin)',
              boxShadow: 'var(--shadow-tiny)',
              borderRadius: 'var(--radius-sm)'
            }}>
              <Sparkles size={22} color="#000" />
            </div>
            <div>
              <div style={{ fontSize: '1.3rem', fontFamily: 'var(--font-title)', fontWeight: '900', lineHeight: '1', textTransform: 'uppercase' }}>
                WordSmart
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '900', letterSpacing: '0.05em' }}>
                SASS VOCAB MASTERY
              </div>
            </div>
          </div>

          {/* Nav Links (Desktop) */}
          <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontWeight: '800', fontSize: '0.85rem' }}>
            <button 
              onClick={() => scrollToSection('features')}
              style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: '800' }}
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('interactive-demo')}
              style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: '800' }}
            >
              Live Demo
            </button>
            <button 
              onClick={() => scrollToSection('stages-roadmap')}
              style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: '800' }}
            >
              10 Stages
            </button>
            <button 
              onClick={() => scrollToSection('specialized-section')}
              style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: '800' }}
            >
              Grammar & Idioms
            </button>
            <button 
              onClick={() => scrollToSection('faq-section')}
              style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: '800' }}
            >
              FAQ
            </button>
          </div>

          {/* Right Action Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Theme Toggle */}
            {setTheme && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-label="Toggle theme"
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                style={{
                  background: 'var(--bg-surface-elevated)',
                  border: 'var(--border-thin)',
                  borderRadius: 'var(--radius-md)',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--text-primary)'
                }}
              >
                {theme === 'light' ? <Sun size={17} /> : <Moon size={17} />}
              </button>
            )}

            {user ? (
              <button
                onClick={() => setActiveView('dashboard')}
                className="btn btn-primary"
                style={{ padding: '0.55rem 1.1rem', fontSize: '0.85rem', gap: '0.4rem' }}
              >
                Go to Dashboard <ArrowRight size={15} />
              </button>
            ) : (
              <>
                <button
                  onClick={() => onGoogleSignIn && onGoogleSignIn('dashboard', 1)}
                  className="btn btn-secondary hide-mobile"
                  style={{ padding: '0.55rem 1rem', fontSize: '0.85rem', gap: '0.4rem' }}
                >
                  <LogIn size={15} /> Sign In
                </button>
                <button
                  onClick={() => setActiveView('dashboard')}
                  className="btn btn-primary"
                  style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem', gap: '0.4rem' }}
                >
                  Launch App <ArrowRight size={15} />
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ======================================================== */}
      {/* HERO & MAIN CONTENT AREA                                 */}
      {/* ======================================================== */}
      <main style={{
        maxWidth: '1240px',
        margin: '0 auto',
        padding: '2.5rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '3.5rem',
        width: '100%'
      }}>

        {/* Top Announcement Pill */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{
            background: 'var(--bg-surface-elevated)',
            border: 'var(--border-thin)',
            boxShadow: 'var(--shadow-tiny)',
            padding: '0.45rem 1.2rem',
            borderRadius: 'var(--radius-full)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontSize: '0.8rem',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            <Sparkles size={14} color="var(--theme-yellow)" />
            <span>THE DEFINITIVE SASS VOCABULARY ENGINE • 2026 EDITION</span>
            <span style={{
              background: 'var(--theme-green)',
              color: 'var(--text-black)',
              padding: '2px 8px',
              borderRadius: '999px',
              fontSize: '0.65rem',
              fontWeight: '900'
            }}>1,900+ WORDS</span>
          </div>
        </div>

        {/* SECTION 1: MASTER 1,900+ HIGH-FREQUENCY WORDS (HERO) */}
        <WindowPanel
          title="WORDSMART_OS_v1.0.SYS"
          headerColor="var(--theme-green)"
          shadowVar="var(--welcome-shadow)"
          className="welcome-banner landing-hero-card"
          style={{
            background: 'var(--welcome-bg)',
            color: 'var(--welcome-text)',
            border: 'var(--welcome-border)',
            borderRadius: 'var(--radius-lg)'
          }}
        >
          <div className="bento-welcome-content" style={{ flex: 1 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'var(--theme-yellow)',
              color: 'var(--text-black)',
              fontWeight: '900',
              fontSize: '0.75rem',
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-sm)',
              border: 'var(--border-thin)',
              boxShadow: 'var(--shadow-one)',
              marginBottom: '0.75rem',
              textTransform: 'uppercase'
            }}>
              <Flame size={14} /> Comprehensive Vocabulary Engine
            </div>

            <h1 style={{ 
              fontSize: 'clamp(2rem, 4vw, 3rem)', 
              fontFamily: 'var(--font-title)', 
              fontWeight: '900', 
              marginBottom: '0.85rem', 
              textTransform: 'uppercase',
              lineHeight: '1.12'
            }}>
              Master 1,900+ High-Frequency Words
            </h1>

            <p style={{ 
              color: 'var(--welcome-subtext)', 
              fontWeight: '600', 
              lineHeight: '1.6', 
              fontSize: '1.05rem',
              maxWidth: '780px',
              marginBottom: '1.75rem'
            }}>
              Progress through 10 stages of vocabulary mastery. Use flashcards, spaced repetition, and quizzes to retain every word long-term. Earn coins for hints and climb the leaderboard.
            </p>

            {/* Direct Hero CTA Buttons */}
            <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  if (setSelectedUnit) setSelectedUnit(1);
                  setActiveView('flashcards', 1);
                }}
                className="btn btn-primary"
                style={{ padding: '0.85rem 1.75rem', fontSize: '0.95rem', gap: '0.5rem' }}
              >
                <BookOpen size={18} /> Start Free Unit 1 Quest
              </button>
              <button
                onClick={() => setActiveView('dashboard')}
                className="btn btn-secondary"
                style={{ padding: '0.85rem 1.5rem', fontSize: '0.95rem', gap: '0.5rem' }}
              >
                <Compass size={18} /> Explore Roadmap & Stages
              </button>
              {!user && (
                <button
                  onClick={() => onGoogleSignIn && onGoogleSignIn('dashboard', 1)}
                  className="btn btn-accent"
                  style={{ padding: '0.85rem 1.35rem', fontSize: '0.95rem', gap: '0.5rem' }}
                >
                  <LogIn size={18} /> Sign In with Google
                </button>
              )}
            </div>

            {/* Quick feature checklist row */}
            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', marginTop: '1.5rem', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle2 size={15} color="var(--theme-green)" /> 100% Free Starter Deck
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle2 size={15} color="var(--theme-green)" /> SM-2 Memory Optimization
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle2 size={15} color="var(--theme-green)" /> Dual English-Bengali Context
              </span>
            </div>
          </div>

          <WelcomeDecoration />
        </WindowPanel>

        {/* SAAS METRICS STRIP */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{
            background: 'var(--bg-surface)',
            border: 'var(--border-thick)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-tiny)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: '900', fontFamily: 'var(--font-title)', color: 'var(--theme-yellow)' }}>
              1,900+
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.2rem' }}>
              Curated Headwords
            </div>
          </div>

          <div style={{
            background: 'var(--bg-surface)',
            border: 'var(--border-thick)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-tiny)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: '900', fontFamily: 'var(--font-title)', color: 'var(--theme-cyan)' }}>
              10 Stages
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.2rem' }}>
              100 Structured Units
            </div>
          </div>

          <div style={{
            background: 'var(--bg-surface)',
            border: 'var(--border-thick)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-tiny)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: '900', fontFamily: 'var(--font-title)', color: 'var(--theme-purple)' }}>
              SM-2
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.2rem' }}>
              Spaced Repetition
            </div>
          </div>

          <div style={{
            background: 'var(--bg-surface)',
            border: 'var(--border-thick)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-tiny)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: '900', fontFamily: 'var(--font-title)', color: 'var(--theme-green)' }}>
              100% Free
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.2rem' }}>
              Instant Starter Access
            </div>
          </div>
        </div>

        {/* SECTION 2: SPECIALIZED VOCABULARY & GRAMMAR (GRAMMAR_MODULE.TXT) */}
        <div id="specialized-section">
          <WindowPanel
            title="GRAMMAR_MODULE.TXT"
            headerColor="var(--theme-purple)"
            shadowVar="var(--spec-shadow)"
            className="landing-grammar-card"
            style={{
              background: 'var(--spec-bg)',
              color: 'var(--spec-text)',
              border: 'var(--spec-border)',
              borderRadius: 'var(--radius-lg)'
            }}
          >
            {/* Background glow circle */}
            <div style={{
              position: 'absolute',
              top: '-50px',
              left: '-50px',
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              background: 'hsla(var(--secondary), 0.08)',
              filter: 'blur(35px)',
              pointerEvents: 'none'
            }} />
            <div style={{ flex: 1, minWidth: '280px', zIndex: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--spec-text)', fontWeight: '900', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                <Book size={18} color="var(--spec-text)" />
                <span>SPECIALIZED VOCABULARY</span>
              </div>
              <h2 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.95rem)', fontFamily: 'var(--font-title)', fontWeight: '900', color: 'var(--spec-text)', textTransform: 'uppercase' }}>
                Grammar, Usage & Specialized Terms
              </h2>
              <p style={{ color: 'var(--spec-subtext)', fontSize: '0.95rem', fontWeight: '600', marginTop: '0.35rem', lineHeight: '1.5', maxWidth: '750px' }}>
                Master common usage errors, abbreviations, foreign expressions, and register terminology across multiple domains with definitions and example sentences.
              </p>
            </div>

            <SpecializedDecoration />

            <button 
              onClick={() => setActiveView('specialized')}
              className="btn btn-secondary"
              style={{ 
                padding: '0.85rem 1.75rem', 
                whiteSpace: 'nowrap',
                zIndex: 3,
                fontSize: '0.9rem'
              }}
            >
              Explore Specialized Vocabs →
            </button>
          </WindowPanel>
        </div>

        {/* SECTION 3: LIVE INTERACTIVE FLASHCARD DEMO */}
        <div id="interactive-demo" className="glass-panel" style={{
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          background: 'var(--bg-surface)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{
                fontSize: '0.75rem',
                fontWeight: '900',
                color: 'hsl(var(--primary))',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                ⚡ INTERACTIVE TRIAL
              </div>
              <h2 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-title)', fontWeight: '900', marginTop: '0.2rem' }}>
                Experience WordSmart Flashcards Live
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Click anywhere on the card below to flip between definition, Bengali meaning, and authentic example sentence.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={handleNextSample}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', gap: '0.4rem' }}
              >
                <RotateCw size={14} /> Try Another Word
              </button>
            </div>
          </div>

          {/* Interactive 3D Flip Card */}
          <div 
            onClick={() => setIsFlipped(!isFlipped)}
            style={{
              minHeight: '220px',
              backgroundColor: isFlipped ? 'var(--bg-surface-elevated)' : 'var(--bg-canvas)',
              border: isFlipped ? '3px solid var(--theme-purple)' : '3px solid var(--theme-yellow)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: isFlipped ? '6px 6px 0px var(--theme-purple)' : '6px 6px 0px var(--theme-yellow)',
              padding: '1.75rem 2rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              position: 'relative'
            }}
          >
            {/* Card Top Meta */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                background: 'var(--theme-yellow)',
                color: 'var(--text-black)',
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: '900',
                fontSize: '0.75rem',
                border: 'var(--border-thin)'
              }}>
                STAGE {currentSample.stage} • UNIT {currentSample.unit}
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button 
                  onClick={handlePlayAudio}
                  title="Pronounce"
                  style={{
                    background: 'var(--bg-surface)',
                    border: 'var(--border-thin)',
                    borderRadius: '50%',
                    width: '34px',
                    height: '34px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-primary)',
                    cursor: 'pointer'
                  }}
                >
                  <Volume2 size={16} />
                </button>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '800' }}>
                  {isFlipped ? 'CLICK TO SEE FRONT' : 'CLICK TO REVEAL MEANING ↻'}
                </span>
              </div>
            </div>

            {/* Card Center Content */}
            <div style={{ margin: '1.25rem 0' }}>
              {!isFlipped ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '2.4rem', fontFamily: 'var(--font-title)', fontWeight: '900', letterSpacing: '0.02em', color: 'var(--text-primary)' }}>
                      {currentSample.word}
                    </h3>
                    <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {currentSample.phonetic}
                    </span>
                    <span style={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'hsl(var(--primary))', fontWeight: '800' }}>
                      ({currentSample.partOfSpeech})
                    </span>
                  </div>
                  <p style={{ marginTop: '0.85rem', fontSize: '1.05rem', color: 'var(--text-secondary)', fontStyle: 'italic', borderLeft: '3px solid var(--theme-green)', paddingLeft: '0.85rem' }}>
                    "{currentSample.example}"
                  </p>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '900', color: 'var(--theme-purple)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    Bengali Meaning & Definition
                  </div>
                  <h4 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'hsl(var(--secondary))', marginBottom: '0.5rem' }}>
                    {currentSample.bangla}
                  </h4>
                  <p style={{ fontSize: '1.05rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                    {currentSample.definition}
                  </p>
                </div>
              )}
            </div>

            {/* Card Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.85rem', borderTop: 'var(--border-thin)' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700' }}>
                Word {sampleWordIndex + 1} of {sampleWords.length} in quick trial deck
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (setSelectedUnit) setSelectedUnit(1);
                  setActiveView('flashcards', 1);
                }}
                className="btn btn-primary"
                style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
              >
                Study Full Deck →
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 4: 10-STAGE PROGRESSION ROADMAP PREVIEW */}
        <div id="stages-roadmap">
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--theme-yellow)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              STRUCTURED CURRICULUM
            </div>
            <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)', fontWeight: '900', textTransform: 'uppercase', marginTop: '0.25rem' }}>
              10 Mastery Stages • 100 Bite-Sized Units
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '0.4rem auto 0' }}>
              From foundation basics to advanced SASS examination vocabulary, each stage includes 10 units with cumulative qualification exams.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem'
          }}>
            {PREP_STAGES.map((stage) => (
              <div
                key={stage.id}
                onClick={() => {
                  if (setSelectedUnit) setSelectedUnit(1);
                  setActiveView('dashboard');
                }}
                className="card-hover"
                style={{
                  background: 'var(--bg-surface)',
                  border: 'var(--border-thick)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  boxShadow: 'var(--shadow-tiny)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    background: stage.id === 1 ? 'var(--theme-yellow)' : 'var(--bg-surface-elevated)',
                    color: stage.id === 1 ? '#000' : 'var(--text-muted)',
                    fontWeight: '900',
                    fontSize: '0.7rem',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                    border: '1px solid var(--border-muted)'
                  }}>
                    STAGE 0{stage.id}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '800' }}>
                    10 UNITS
                  </span>
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '900', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                  {stage.name}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  {stage.desc}
                </p>
                <div style={{ marginTop: 'auto', paddingTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'hsl(var(--primary))', fontSize: '0.75rem', fontWeight: '800' }}>
                  <span>Open Stage Directory</span> <ChevronRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 5: CORE PILLARS & FEATURE MATRIX */}
        <div id="features">
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--theme-cyan)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              BUILT FOR HIGH RETENTION
            </div>
            <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)', fontWeight: '900', textTransform: 'uppercase', marginTop: '0.25rem' }}>
              Why WordSmart Outperforms
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}>
            {/* Feature 1 */}
            <WindowPanel
              title="SPACED_REPETITION.EXE"
              headerColor="var(--theme-cyan)"
              shadowVar="var(--stats-shadow-1)"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--theme-cyan)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-black)',
                  border: 'var(--border-thin)',
                  boxShadow: 'var(--shadow-tiny)'
                }}>
                  <Brain size={22} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '900', textTransform: 'uppercase' }}>
                  SM-2 Memory Scheduling
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  Words automatically resurface for active recall right before your memory decays, giving maximum retention with minimum study time.
                </p>
              </div>
            </WindowPanel>

            {/* Feature 2 */}
            <WindowPanel
              title="GAMIFIED_ARENA.SH"
              headerColor="var(--theme-green)"
              shadowVar="var(--welcome-shadow)"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--theme-green)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-black)',
                  border: 'var(--border-thin)',
                  boxShadow: 'var(--shadow-tiny)'
                }}>
                  <Zap size={22} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '900', textTransform: 'uppercase' }}>
                  Competitive Practice Arena
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  Level up with Time Blitz, Quick Match, Drills, daily streak multipliers, hints for coins, and real-time global leaderboards.
                </p>
              </div>
            </WindowPanel>

            {/* Feature 3 */}
            <WindowPanel
              title="DUAL_LANGUAGE_CARDS.BIN"
              headerColor="var(--theme-purple)"
              shadowVar="var(--stats-shadow-2)"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--theme-purple)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-black)',
                  border: 'var(--border-thin)',
                  boxShadow: 'var(--shadow-tiny)'
                }}>
                  <BookOpen size={22} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '900', textTransform: 'uppercase' }}>
                  Dual-Language Bengali Context
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  Every English headword includes authentic Bengali meanings, etymological roots, synonyms, antonyms, and sentence usages.
                </p>
              </div>
            </WindowPanel>

            {/* Feature 4 */}
            <WindowPanel
              title="DICTIONARY_PORTAL.SYS"
              headerColor="var(--theme-yellow)"
              shadowVar="var(--stats-shadow-3)"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--theme-yellow)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-black)',
                  border: 'var(--border-thin)',
                  boxShadow: 'var(--shadow-tiny)'
                }}>
                  <Layers size={22} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '900', textTransform: 'uppercase' }}>
                  Instant Dictionary Search
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  Lightning-fast phonetic and semantic search across all 1,900+ words with audio pronunciation and detail inspect panes.
                </p>
              </div>
            </WindowPanel>
          </div>
        </div>

        {/* SECTION 6: FAST 3-STEP ONBOARDING PATH */}
        <div className="glass-panel" style={{
          padding: '2.5rem 2rem',
          background: 'var(--bg-surface-elevated)',
          border: 'var(--border-thick)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '900', color: 'hsl(var(--secondary))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ZERO FRICTION ONBOARDING
            </div>
            <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)', fontWeight: '900', textTransform: 'uppercase', marginTop: '0.25rem' }}>
              How to Get Started in 3 Steps
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}>
            {/* Step 1 */}
            <div style={{
              background: 'var(--bg-surface)',
              border: 'var(--border-thick)',
              borderRadius: 'var(--radius-md)',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-small)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'var(--theme-cyan)',
                  color: 'var(--text-black)',
                  fontWeight: '900',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'var(--border-thin)',
                  fontSize: '1.1rem'
                }}>
                  1
                </div>
                <span style={{ fontWeight: '900', fontSize: '1rem', textTransform: 'uppercase' }}>Study Unit 1.1 Free</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Jump straight into Unit 1.1 flashcards without sign-up. Flip cards, listen to audio, and master the initial 19 words.
              </p>
              <button
                onClick={() => {
                  if (setSelectedUnit) setSelectedUnit(1);
                  setActiveView('flashcards', 1);
                }}
                className="btn btn-secondary"
                style={{ marginTop: 'auto', padding: '0.6rem', fontSize: '0.85rem' }}
              >
                Open Unit 1.1 Quest →
              </button>
            </div>

            {/* Step 2 */}
            <div style={{
              background: 'var(--bg-surface)',
              border: 'var(--border-thick)',
              borderRadius: 'var(--radius-md)',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-small)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'var(--theme-yellow)',
                  color: 'var(--text-black)',
                  fontWeight: '900',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'var(--border-thin)',
                  fontSize: '1.1rem'
                }}>
                  2
                </div>
                <span style={{ fontWeight: '900', fontSize: '1rem', textTransform: 'uppercase' }}>Test Recall with Quizzes</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Reinforce active recall with MCQ quizzes, instant explanations, and earn coins for every correct answer.
              </p>
              <button
                onClick={() => {
                  if (setSelectedUnit) setSelectedUnit(1);
                  setActiveView('quizzes', 1);
                }}
                className="btn btn-secondary"
                style={{ marginTop: 'auto', padding: '0.6rem', fontSize: '0.85rem' }}
              >
                Take Practice Quiz →
              </button>
            </div>

            {/* Step 3 */}
            <div style={{
              background: 'var(--bg-surface)',
              border: 'var(--border-thick)',
              borderRadius: 'var(--radius-md)',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-small)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'var(--theme-green)',
                  color: 'var(--text-black)',
                  fontWeight: '900',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'var(--border-thin)',
                  fontSize: '1.1rem'
                }}>
                  3
                </div>
                <span style={{ fontWeight: '900', fontSize: '1rem', textTransform: 'uppercase' }}>Sign In to Sync SM-2</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Sign in with Google to unlock all 100 units, sync your memory deck across all devices, and rank on the global leaderboard.
              </p>
              {user ? (
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--theme-green)', fontWeight: '800', fontSize: '0.85rem' }}>
                  <CheckCircle2 size={16} /> Signed In as {user.displayName || 'Learner'}
                </div>
              ) : (
                <button
                  onClick={() => onGoogleSignIn && onGoogleSignIn('dashboard', 1)}
                  className="btn btn-accent"
                  style={{ marginTop: 'auto', padding: '0.6rem', fontSize: '0.85rem' }}
                >
                  Sign In with Google
                </button>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 7: INTERACTIVE FAQ ACCORDION */}
        <div id="faq-section">
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '900', color: 'hsl(var(--primary))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              FREQUENTLY ASKED QUESTIONS
            </div>
            <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)', fontWeight: '900', textTransform: 'uppercase', marginTop: '0.25rem' }}>
              Got Questions? We've Got Answers
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxWidth: '850px', margin: '0 auto' }}>
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx}
                  style={{
                    background: 'var(--bg-surface)',
                    border: 'var(--border-thick)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    boxShadow: isOpen ? 'var(--shadow-small)' : 'var(--shadow-tiny)',
                    transition: 'var(--transition-normal)'
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    style={{
                      width: '100%',
                      padding: '1.1rem 1.5rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontWeight: '900',
                      fontSize: '1rem',
                      fontFamily: 'var(--font-title)'
                    }}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown size={18} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.2s ease', flexShrink: 0, marginLeft: '0.5rem' }} />
                  </button>
                  {isOpen && (
                    <div style={{ padding: '0 1.5rem 1.25rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', borderTop: 'var(--border-thin)', paddingTop: '0.85rem' }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 8: BOTTOM LAUNCH PAD CTA */}
        <WindowPanel
          title="LAUNCH_PAD.CMD"
          headerColor="var(--theme-yellow)"
          shadowVar="var(--shadow-main)"
          style={{
            background: 'linear-gradient(135deg, var(--bg-surface) 0%, hsla(var(--primary), 0.1) 100%)',
            textAlign: 'center',
            padding: '0'
          }}
        >
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.25rem',
            maxWidth: '750px',
            margin: '0 auto',
            textAlign: 'center',
            padding: '1.5rem 1rem'
          }}>
            <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-title)', fontWeight: '900', textTransform: 'uppercase' }}>
              Ready to Expand Your Vocabulary?
            </h2>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Join thousands of candidates mastering 1,900+ words with spaced repetition. Start your Stage 1 Quest right now.
            </p>
            <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
              <button
                onClick={() => {
                  if (setSelectedUnit) setSelectedUnit(1);
                  setActiveView('flashcards', 1);
                }}
                className="btn btn-primary"
                style={{ padding: '0.95rem 2.25rem', fontSize: '1.05rem', gap: '0.5rem' }}
              >
                Start Learning Now <ArrowRight size={20} />
              </button>
              <button
                onClick={() => setActiveView('dashboard')}
                className="btn btn-secondary"
                style={{ padding: '0.95rem 2rem', fontSize: '1.05rem' }}
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </WindowPanel>
      </main>

      {/* ======================================================== */}
      {/* STANDALONE SAAS FOOTER                                   */}
      {/* ======================================================== */}
      <footer style={{
        marginTop: 'auto',
        backgroundColor: 'var(--bg-surface)',
        borderTop: 'var(--border-thick)',
        padding: '2.5rem 2rem'
      }}>
        <div style={{
          maxWidth: '1240px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}>
          {/* Footer Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              backgroundColor: 'var(--theme-yellow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'var(--border-thin)',
              borderRadius: 'var(--radius-sm)'
            }}>
              <Sparkles size={18} color="#000" />
            </div>
            <div>
              <div style={{ fontWeight: '900', fontSize: '1.1rem', fontFamily: 'var(--font-title)', textTransform: 'uppercase' }}>
                WordSmart
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700' }}>
                © 2026 WordSmart Learning Platform. Built for SASS & Competitive Exam Candidates.
              </div>
            </div>
          </div>

          {/* Quick Nav in Footer */}
          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.85rem', fontWeight: '800' }}>
            <button 
              onClick={() => setActiveView('dashboard')}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveView('specialized')}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              Grammar & Idioms
            </button>
            <button 
              onClick={() => setActiveView('search')}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              Dictionary Portal
            </button>
            <button 
              onClick={() => setActiveView('hitparades')}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              Hit Parades
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
