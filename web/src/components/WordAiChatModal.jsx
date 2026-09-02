import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  RotateCcw, 
  Loader2, 
  BookOpen, 
  MessageSquare, 
  Lightbulb, 
  AlertCircle, 
  Copy, 
  Check, 
  Maximize2, 
  Minimize2,
  HelpCircle,
  Target,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sendGeminiChatMessage } from '../utils/gemini';
import { renderRichMarkdown } from '../utils/markdown';

const getQuickPrompts = (word) => [
  {
    icon: <BookOpen size={13} />,
    label: "Easy Sentences",
    userText: "Give me 3 easy example sentences",
    prompt: `Give me 3 easy example sentences using the word "${word?.word}".`
  },
  {
    icon: <Target size={13} />,
    label: "Quiz Me",
    userText: "Quiz me on this word",
    prompt: `Quiz me on the word "${word?.word}" with a multiple-choice question in English.`
  },
  {
    icon: <MessageSquare size={13} />,
    label: "Simple Bengali",
    userText: "Explain in simple Bengali",
    prompt: `Explain the word "${word?.word}" and its nuances in simple Bengali.`
  },
  {
    icon: <Lightbulb size={13} />,
    label: "Memory Trick",
    userText: "Give me a memory trick",
    prompt: `Give me a creative, memorable trick to remember the word "${word?.word}".`
  }
];

/**
 * Parses dynamic follow-up suggestions from AI response text: [Suggestions: Q1 | Q2 | Q3]
 */
function extractSuggestionsFromText(text) {
  if (!text || typeof text !== 'string') return null;
  const match = text.match(/\[Suggestions:\s*(.+?)\]/i);
  if (match) {
    const raw = match[1];
    const suggestions = raw
      .split('|')
      .map(s => s.trim().replace(/^[-•\d.]+\s*/, ''))
      .filter(Boolean);
    if (suggestions.length > 0) return suggestions;
  }
  return null;
}

/**
 * Strips internal machine tags like [Suggestions: ...] and [Answer: ...] for clean display
 */
function cleanDisplayText(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/\[Suggestions:\s*.+?\]/gi, '')
    .replace(/\[Answer:\s*[A-D]\]/gi, '')
    .trim();
}

/**
 * Parses multiple-choice quiz questions from AI responses.
 */
function extractQuizFromText(text) {
  if (!text || typeof text !== 'string') return null;

  const answerMatch = text.match(/\[Answer:\s*([A-D])\]/i);
  const cleanText = text
    .replace(/\[Suggestions:\s*.+?\]/gi, '')
    .replace(/\[Answer:\s*[A-D]\]/gi, '')
    .trim();

  const lines = cleanText.split('\n');
  const questionLines = [];
  const options = [];
  let firstOptionIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const optMatch = line.match(/^([A-D])[.)]\s+(.*)$/);
    if (optMatch) {
      if (firstOptionIndex === -1) firstOptionIndex = i;
      options.push({
        letter: optMatch[1].toUpperCase(),
        text: optMatch[2].trim()
      });
    } else if (firstOptionIndex === -1) {
      questionLines.push(line);
    }
  }

  if (options.length >= 2) {
    return {
      question: questionLines.join('\n').trim(),
      options,
      correctLetter: answerMatch ? answerMatch[1].toUpperCase() : null
    };
  }

  return null;
}

/**
 * Interactive Quiz Card Component with Confetti and Instant Feedback
 */
function InteractiveQuizCard({ quiz, onAskExplanation }) {
  const [selected, setSelected] = useState(null);

  const handleSelect = (letter) => {
    if (selected) return;
    setSelected(letter);

    if (quiz.correctLetter && letter === quiz.correctLetter) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch (e) {}
    }
  };

  const isCorrect = selected && quiz.correctLetter && selected === quiz.correctLetter;

  return (
    <div className="chat-quiz-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--theme-cyan)', fontWeight: '800', fontSize: '0.8rem' }}>
        <Target size={14} />
        <span>QUICK QUIZ</span>
      </div>

      <div style={{ fontSize: '0.92rem', lineHeight: '1.6' }}>
        {renderRichMarkdown(quiz.question)}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
        {quiz.options.map((opt) => {
          let btnClass = "chat-quiz-option";
          if (selected) {
            if (quiz.correctLetter && opt.letter === quiz.correctLetter) {
              btnClass += " correct";
            } else if (opt.letter === selected) {
              btnClass += " wrong";
            }
          }

          return (
            <button
              key={opt.letter}
              onClick={() => handleSelect(opt.letter)}
              disabled={!!selected}
              className={btnClass}
            >
              <span className="chat-quiz-letter">{opt.letter}</span>
              <span style={{ flex: 1 }} dangerouslySetInnerHTML={{ __html: opt.text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>') }} />
              {selected && quiz.correctLetter && opt.letter === quiz.correctLetter && (
                <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0 }} />
              )}
              {selected && opt.letter === selected && opt.letter !== quiz.correctLetter && (
                <XCircle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
              )}
            </button>
          );
        })}
      </div>

      {selected && quiz.correctLetter && (
        <div style={{
          marginTop: '0.2rem',
          padding: '0.6rem 0.85rem',
          borderRadius: '8px',
          backgroundColor: isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: isCorrect ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          flexWrap: 'wrap'
        }}>
          <span style={{
            fontSize: '0.82rem',
            fontWeight: '700',
            color: isCorrect ? '#10b981' : '#ef4444'
          }}>
            {isCorrect ? '🎉 Correct! Great job!' : `✕ Incorrect. The correct answer is ${quiz.correctLetter}.`}
          </span>

          {onAskExplanation && (
            <button
              onClick={() => onAskExplanation(selected, quiz)}
              style={{
                fontSize: '0.76rem',
                fontWeight: '700',
                color: 'var(--theme-cyan)',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Explain why
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function WordAiChatModal({ word, isOpen, onClose }) {
  if (!word) return null;

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `Hello! Ask me anything or select an option above. I can help with sentences, meanings, quizzes, and memory tricks!`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stage, setStage] = useState('default'); // 'default' or 'maximized'
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);

  const placeholders = [
    `Ask anything or practice...`,
    `Quiz me in English...`,
    `Give me an easy sentence...`,
    `Explain in simple Bengali...`,
    `Give me a memory trick...`
  ];

  // Cycle animated placeholder every 3.5s when input is empty
  useEffect(() => {
    if (input) return;
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [input, placeholders.length]);

  // Auto-scroll chat to bottom ONLY within inner chat container when open
  const scrollToBottom = () => {
    if (!isOpen) return;
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, loading, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus({ preventScroll: true });
      }, 200);
    }
  }, [isOpen, stage]);

  // Reset chat when word changes
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        text: `Hello! Ask me anything or select an option above. I can help with sentences, meanings, quizzes, and memory tricks!`
      }
    ]);
    setError(null);
  }, [word?.id, word?.word]);

  const handleSendMessage = async (textToSend = null, displayText = null) => {
    const promptToSend = (textToSend || input).trim();
    if (!promptToSend || loading) return;

    setError(null);
    const visibleText = (displayText || textToSend || input).trim();
    const updatedMessages = [...messages, { role: 'user', text: visibleText }];
    setMessages(updatedMessages);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      // Pass the conversation history to Gemini
      const chatPayload = updatedMessages.map((m, i) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        text: i === updatedMessages.length - 1 ? promptToSend : m.text
      }));

      const reply = await sendGeminiChatMessage(chatPayload, word);
      setMessages([...updatedMessages, { role: 'assistant', text: reply }]);
    } catch (err) {
      console.error("Gemini AI error:", err);
      setError(err.message || "Failed to get response from AI. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        role: 'assistant',
        text: `Chat reset! Ask me anything or select an option above.`
      }
    ]);
    setError(null);
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(cleanDisplayText(text));
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  // Get dynamic follow-up suggestions based on AI response and user intent
  const getSuggestedQuestions = (lastMessageText) => {
    // 1. Check if AI returned dynamic suggestions in this response
    const dynamic = extractSuggestionsFromText(lastMessageText);
    if (dynamic && dynamic.length > 0) {
      return dynamic.map(q => ({ label: q, prompt: q, icon: "💡" }));
    }

    // 2. Fallback to contextual questions
    const askedTexts = messages
      .filter(m => m.role === 'user')
      .map(m => m.text.toLowerCase());

    const fallbackBank = [
      { label: "Give 3 easy sentences", prompt: "Give me 3 easy example sentences with Bengali translations.", icon: "📝" },
      { label: "Quiz me in English", prompt: "Quiz me on this word with a multiple-choice question in English.", icon: "🎯" },
      { label: "Synonyms & antonyms", prompt: "What are the key synonyms and antonyms for this word?", icon: "🔄" },
      { label: "Explain in simple Bengali", prompt: "Explain this word and its nuances in simple Bengali.", icon: "🇧🇩" },
      { label: "Common mistakes & tips", prompt: "What are common mistakes learners make with this word?", icon: "⚠️" },
      { label: "Use in conversation", prompt: "Show a realistic 2-line conversation using this word naturally.", icon: "💬" },
    ];

    const available = fallbackBank.filter(sug => {
      const lowerLabel = sug.label.toLowerCase();
      return !askedTexts.some(asked => asked.includes(lowerLabel) || lowerLabel.includes(asked));
    });

    return (available.length >= 3 ? available : fallbackBank).slice(0, 3);
  };

  const panelClasses = `ai-floating-panel ${isOpen ? 'open' : ''} ${stage === 'maximized' ? 'maximized' : ''}`;

  return (
    <aside 
      className={panelClasses}
      aria-hidden={!isOpen}
    >
      {/* Modern Clean Header */}
      <div 
        style={{
          padding: '0.75rem 1.15rem',
          borderBottom: 'var(--border-thin)',
          backgroundColor: 'var(--bg-surface-elevated)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            backgroundColor: 'var(--theme-cyan)',
            color: '#000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '1.5px 1.5px 0px #000000'
          }}>
            <Sparkles size={16} />
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span className="tutor-pulse-dot" />
              <span style={{
                fontFamily: 'var(--font-title)',
                fontWeight: '900',
                fontSize: '0.98rem',
                color: 'var(--text-primary)',
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                AI Tutor
              </span>
            </div>
            <p style={{
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              margin: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: 1.2
            }}>
              Ask anything or choose a topic
            </p>
          </div>
        </div>

        {/* Header Window Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
          <button
            onClick={handleResetChat}
            title="Reset Conversation"
            className="btn-icon-hover"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'transparent',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
          >
            <RotateCcw size={14} />
          </button>

          {/* Stage Maximize / Standard */}
          <button
            onClick={() => setStage(stage === 'maximized' ? 'default' : 'maximized')}
            title={stage === 'maximized' ? "Standard Size" : "Expand Size"}
            className="btn-icon-hover"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'transparent',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
          >
            {stage === 'maximized' ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>

          {/* Close Panel */}
          <button
            onClick={onClose}
            title="Close Assistant"
            className="btn-icon-hover"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'transparent',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Quick Action Prompt Pills */}
      <div style={{
        padding: '0.55rem 1rem',
        borderBottom: 'var(--border-thin)',
        backgroundColor: 'var(--bg-surface)',
        display: 'flex',
        gap: '0.45rem',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        scrollbarWidth: 'none'
      }}>
        {getQuickPrompts(word).map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(qp.prompt, qp.userText)}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: '700',
              fontFamily: 'var(--font-title)',
              backgroundColor: 'var(--bg-surface-elevated)',
              color: 'var(--text-primary)',
              border: 'var(--border-thin)',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              flexShrink: 0
            }}
            className="btn-icon-hover"
          >
            <span style={{ color: 'var(--theme-cyan)' }}>{qp.icon}</span>
            <span>{qp.label}</span>
          </button>
        ))}
      </div>

      {/* Messages Feed */}
      <div 
        ref={messagesContainerRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.15rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.15rem'
        }}
      >
        {messages.map((m, idx) => {
          const isUser = m.role === 'user';
          const isLastMessage = idx === messages.length - 1;
          const quiz = !isUser ? extractQuizFromText(m.text) : null;
          const displayText = cleanDisplayText(m.text);

          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: isUser ? 'flex-end' : 'flex-start',
                gap: '0.65rem',
                alignItems: 'flex-start'
              }}
            >
              {!isUser && (
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--theme-cyan)',
                  color: '#000000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px',
                  boxShadow: '1px 1px 0px #000000'
                }}>
                  <Sparkles size={14} />
                </div>
              )}

              <div style={{
                maxWidth: isUser ? '82%' : '90%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: isUser ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  padding: isUser ? '0.6rem 0.95rem' : '0.85rem 1.15rem',
                  borderRadius: isUser ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
                  backgroundColor: isUser ? 'var(--theme-cyan)' : 'var(--bg-surface-elevated)',
                  color: isUser ? '#000000' : 'var(--text-primary)',
                  fontWeight: isUser ? '700' : '400',
                  fontSize: '0.92rem',
                  lineHeight: '1.65',
                  border: isUser ? '1.5px solid #000000' : 'var(--border-thin)',
                  boxShadow: 'var(--shadow-tiny)',
                  wordBreak: 'break-word',
                  fontFamily: 'inherit'
                }}>
                  {quiz ? (
                    <InteractiveQuizCard 
                      quiz={quiz} 
                      onAskExplanation={(choice, q) => handleSendMessage(
                        `Can you explain why option ${q.correctLetter} is correct for "${q.options.find(o => o.letter === q.correctLetter)?.text}" and why option ${choice} is not?`, 
                        `Explain why ${q.correctLetter} is correct`
                      )}
                    />
                  ) : (
                    renderRichMarkdown(displayText)
                  )}
                </div>

                {/* AI Message Footer: Copy button & Dynamic Follow-up Suggestions */}
                {!isUser && (
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '0.6rem',
                    marginTop: '0.35rem', 
                    paddingLeft: '0.2rem',
                    width: '100%'
                  }}>
                    <button
                      onClick={() => handleCopy(m.text, idx)}
                      title="Copy response"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.72rem',
                        fontWeight: '600',
                        color: copiedIndex === idx ? '#10b981' : 'var(--text-muted)',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.15rem 0.4rem',
                        borderRadius: '4px',
                        transition: 'color 0.15s ease',
                        alignSelf: 'flex-start'
                      }}
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check size={12} color="#10b981" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    {/* Show Dynamic Follow-up Suggestions below the latest response */}
                    {isLastMessage && !loading && (
                      <div style={{
                        marginTop: '0.35rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.4rem'
                      }}>
                        <div style={{
                          fontSize: '0.73rem',
                          fontWeight: '700',
                          color: 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}>
                          <HelpCircle size={12} style={{ color: 'var(--theme-cyan)' }} />
                          <span>Suggested next questions:</span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                          {getSuggestedQuestions(m.text).map((sug, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => handleSendMessage(sug.prompt, sug.label)}
                              className="btn-icon-hover"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.35rem 0.75rem',
                                borderRadius: '9999px',
                                fontSize: '0.76rem',
                                fontWeight: '600',
                                backgroundColor: 'var(--bg-surface)',
                                border: 'var(--border-thin)',
                                color: 'var(--text-primary)',
                                cursor: 'pointer',
                                boxShadow: 'var(--shadow-tiny)',
                                transition: 'all 0.15s ease',
                                textAlign: 'left'
                              }}
                            >
                              <span>{sug.icon}</span>
                              <span>{sug.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', paddingLeft: '0.2rem' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              backgroundColor: 'var(--theme-cyan)',
              color: '#000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Sparkles size={14} />
            </div>
            <div style={{
              padding: '0.55rem 0.9rem',
              borderRadius: '4px 14px 14px 14px',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: 'var(--border-thin)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--text-muted)',
              fontSize: '0.84rem'
            }}>
              <Loader2 size={14} className="spin-animation" style={{ color: 'var(--theme-cyan)' }} />
              <span>Thinking & explaining...</span>
            </div>
          </div>
        )}

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 0.85rem',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px',
            color: 'var(--theme-red)',
            fontSize: '0.86rem'
          }}>
            <AlertCircle size={17} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Modern Style Input Composer */}
      <div style={{
        padding: '0.75rem 1.15rem',
        borderTop: 'var(--border-thin)',
        backgroundColor: 'var(--bg-surface-elevated)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem'
      }}>
        <div style={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}>
          <input
            ref={inputRef}
            type="text"
            className="ai-chat-composer-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder={placeholders[placeholderIndex]}
            style={{
              width: '100%',
              padding: '0.65rem 1rem',
              paddingRight: '2.5rem',
              borderRadius: '9999px',
              border: 'var(--border-thin)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              outline: 'none',
              boxShadow: 'none',
              fontFamily: 'inherit'
            }}
          />
          {input && (
            <button
              onClick={() => setInput('')}
              title="Clear input"
              style={{
                position: 'absolute',
                right: '0.75rem',
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.2rem'
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <button
          onClick={() => handleSendMessage()}
          disabled={!input.trim() || loading}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: input.trim() && !loading ? 'var(--theme-cyan)' : 'var(--bg-surface)',
            color: input.trim() && !loading ? '#000000' : 'var(--text-muted)',
            border: input.trim() && !loading ? '2px solid #000000' : 'var(--border-thin)',
            boxShadow: input.trim() && !loading ? '2px 2px 0px #000000' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
            flexShrink: 0,
            transition: 'all 0.15s ease'
          }}
          title="Send (Enter)"
        >
          <Send size={16} />
        </button>
      </div>
    </aside>
  );
}
