import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Centralized Speech Synthesis hook for WordSmart.
 * Handles voice selection (preferring clean English voices),
 * tracking speech playback state, and error resilience.
 */
export function useSpeech(defaultRate = 0.88) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingText, setSpeakingText] = useState(null);
  const selectedVoiceRef = useRef(null);

  // Load and select best English voice
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const updateVoices = () => {
      const available = window.speechSynthesis.getVoices() || [];
      if (available.length === 0) return;

      // Prefer natural/Google English voices, or en-US / en-GB
      const preferred = available.find(v => 
        (v.lang === 'en-US' || v.lang === 'en-GB') && 
        (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Enhanced') || v.name.includes('Samantha'))
      ) || available.find(v => v.lang.startsWith('en')) || available[0];

      selectedVoiceRef.current = preferred || null;
    };

    updateVoices();
    window.speechSynthesis.addEventListener('voiceschanged', updateVoices);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', updateVoices);
    };
  }, []);

  const cancel = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Safe catch
      }
    }
    setIsSpeaking(false);
    setSpeakingText(null);
  }, []);

  const speak = useCallback((text, rate = defaultRate) => {
    if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();

      const cleanText = typeof text === 'string' ? text.trim() : String(text);
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = rate;
      utterance.lang = 'en-US';

      if (selectedVoiceRef.current) {
        utterance.voice = selectedVoiceRef.current;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setSpeakingText(cleanText);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setSpeakingText(null);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setSpeakingText(null);
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('[WordSmart Speech] Error playing speech:', err);
      setIsSpeaking(false);
      setSpeakingText(null);
    }
  }, [defaultRate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return {
    speak,
    cancel,
    isSpeaking,
    speakingText
  };
}
