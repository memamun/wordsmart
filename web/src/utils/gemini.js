/**
 * AI Client for WordSmart AI Assistant
 * Primary: OpenRouter (openrouter/free)
 * Fallback: Gemini API
 */

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';
const OPENROUTER_MODEL = 'openrouter/free';

const GEMINI_API_KEYS = [
  import.meta.env.VITE_GEMINI_API_KEY,
  import.meta.env.VITE_GEMINI_API_KEY_FALLBACK,
].filter(Boolean);

const GEMINI_MODELS = ['gemini-2.5-flash'];

const SYSTEM_INSTRUCTION = `You are WordSmart AI, a friendly, concise bilingual English-Bengali vocabulary tutor.
Your goal is to help learners master English words quickly and effortlessly.

CORE PRINCIPLES:
1. BALANCED BILINGUAL (MIXED) RESPONSES:
   - Do NOT use Bengali only. Use a clear, natural mix of English and Bengali.
   - Explain meanings, usages, and examples primarily in English, paired with clear, simple Bengali translations where helpful.
   - If the user asks in Bengali, respond helpfully with Bengali explanations while keeping English vocabulary prominent.
2. QUIZZES MUST BE IN ENGLISH:
   - When quizzing the user (e.g. "Quiz Me", "Give me a quiz", or multiple choice questions):
     - The question and all 4 options (A, B, C, D) MUST BE IN ENGLISH.
     - Option letters must be A), B), C), D).
     - At the very end of the response, write: [Answer: X] (where X is the correct letter).
3. NO FILLER WORDS & NO FLUFF:
   - Start immediately with the answer. Avoid fluff like "Certainly!", "Sure, here you go!", "I hope this helps!".
   - Keep answers short, crisp, punchy, and direct to the point.
4. DYNAMIC FOLLOW-UP SUGGESTIONS:
   - At the very end of EVERY response, always generate 2 or 3 dynamic, context-aware follow-up suggestions based on user intent.
   - Write them in English (or bilingual if relevant).
   - Format strictly on the final line as:
     [Suggestions: Suggestion 1 | Suggestion 2 | Suggestion 3]
5. FORMATTING: Use clean, standard markdown (**bold** for target words, *italics* for translations).`;

/**
 * Parses an incoming Server-Sent Events (SSE) stream from OpenRouter or Gemini.
 */
async function parseSseStream(response, onChunk, signal) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let accumulated = '';
  let buffer = '';

  try {
    while (true) {
      if (signal?.aborted) {
        reader.cancel();
        break;
      }
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(':')) continue;
        if (trimmed === 'data: [DONE]') return accumulated;

        if (trimmed.startsWith('data: ')) {
          try {
            const data = JSON.parse(trimmed.slice(6));
            const delta = data.choices?.[0]?.delta?.content || 
                          data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            if (delta) {
              accumulated += delta;
              if (onChunk) onChunk(accumulated, delta);
            }
          } catch {
            // Segment may be incomplete JSON across SSE frame boundaries
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
  return accumulated;
}

/**
 * Sends chat messages to AI. Primary: OpenRouter, Fallback: Gemini.
 * Supports streaming via options.onChunk and cancellation via options.signal.
 * @param {Array<{role: string, text: string}>} messages 
 * @param {object} wordContext Optional current word information
 * @param {object} options Optional { signal, onChunk }
 * @returns {Promise<string>} AI text response
 */
export async function sendGeminiChatMessage(messages, wordContext = null, options = {}) {
  const { signal, onChunk } = options;

  let systemPrompt = SYSTEM_INSTRUCTION;
  if (wordContext && wordContext.word) {
    systemPrompt += `\n\nCURRENT TARGET WORD:
- Word: "${wordContext.word.toUpperCase()}" (${wordContext.part_of_speech || ''})
- Bengali Meaning: ${wordContext.bengali_meaning || ''}
- Definition: ${wordContext.definition || ''}

CRITICAL: The student is studying this specific word: "${wordContext.word.toUpperCase()}". Whenever the student asks for sentences, definitions, quizzes, explanations, memory tricks, or synonyms, ALWAYS base your response on "${wordContext.word.toUpperCase()}".`;
  }

  const validMessages = [...messages];
  while (validMessages.length > 0 && validMessages[0].role === 'assistant') {
    validMessages.shift();
  }

  if (validMessages.length === 0) {
    return "How can I help you with this word?";
  }

  let lastError = null;

  // === PRIMARY: OpenRouter free router ===
  if (OPENROUTER_API_KEY) {
    try {
      const orMessages = [
        { role: 'system', content: systemPrompt },
        ...validMessages.map((m) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.text
        }))
      ];

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'WordSmart AI'
        },
        body: JSON.stringify({
          model: OPENROUTER_MODEL,
          messages: orMessages,
          temperature: 0.7,
          max_tokens: 1000,
          stream: Boolean(onChunk)
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `OpenRouter HTTP ${response.status}`);
      }

      if (onChunk && response.body) {
        const streamed = await parseSseStream(response, onChunk, signal);
        if (streamed) return streamed.trim();
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content;

      if (text) {
        return text.trim();
      } else {
        throw new Error("No response from OpenRouter.");
      }
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      lastError = err;
      console.warn('OpenRouter failed:', err.message, '— trying Gemini fallback...');
    }
  }

  // === FALLBACK: Gemini API ===
  if (GEMINI_API_KEYS.length > 0) {
    const geminiContents = validMessages.map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    for (const apiKey of GEMINI_API_KEYS) {
      for (const model of GEMINI_MODELS) {
        try {
          const endpoint = onChunk ? 'streamGenerateContent?alt=sse&key=' : 'generateContent?key=';
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:${endpoint}${apiKey}`;
          const response = await fetch(url, {
            method: 'POST',
            signal,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: geminiContents,
              systemInstruction: {
                parts: [{ text: systemPrompt }]
              },
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1000
              }
            })
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            const errMsg = errData.error?.message || `HTTP ${response.status}`;
            if (response.status === 429 || response.status === 403) {
              console.warn(`Gemini (${model}) rate limited: ${errMsg}`);
              lastError = new Error(errMsg);
              continue;
            }
            throw new Error(errMsg);
          }

          if (onChunk && response.body) {
            const streamed = await parseSseStream(response, onChunk, signal);
            if (streamed) return streamed.trim();
          }

          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

          if (text) {
            return text.trim();
          } else {
            throw new Error("No response from Gemini.");
          }
        } catch (err) {
          if (err.name === 'AbortError') throw err;
          lastError = err;
          console.warn(`Gemini ${model} error:`, err.message);
        }
      }
    }
  }

  throw lastError || new Error("Unable to connect to any AI provider. Please check your API keys or network.");
}
