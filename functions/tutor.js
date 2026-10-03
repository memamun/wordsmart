import { RequestError } from './validation.js';

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


export function buildTutorPrompt(wordContext) {
  return SYSTEM_INSTRUCTION + (wordContext.word ? `\n\nCURRENT TARGET WORD: ${JSON.stringify(wordContext)}\nBase vocabulary explanations and examples on this word.` : '');
}

export async function openTutorStream({ messages, wordContext }, config, signal, fetchImpl = fetch) {
  const systemPrompt = buildTutorPrompt(wordContext);
  const providers = [];
  if (config.openrouterKey) providers.push({
    url: 'https://openrouter.ai/api/v1/chat/completions',
    headers: { Authorization: `Bearer ${config.openrouterKey}`, 'X-Title': 'WordSmart AI' },
    body: { model: 'openrouter/free', stream: true, max_tokens: 1000, temperature: 0.7,
      messages: [{ role: 'system', content: systemPrompt }, ...messages.map(m => ({ role: m.role, content: m.text }))] },
  });
  for (const key of [config.geminiKey, config.geminiFallbackKey].filter(Boolean)) providers.push({
    url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse',
    headers: { 'x-goog-api-key': key },
    body: { contents: messages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.text }] })),
      systemInstruction: { parts: [{ text: systemPrompt }] }, generationConfig: { temperature: 0.7, maxOutputTokens: 1000 } },
  });
  if (!providers.length) throw new RequestError(503, 'The AI tutor is not configured yet. Please try again later.');
  for (const provider of providers) {
    signal.throwIfAborted();
    try {
      const response = await fetchImpl(provider.url, {
        method: 'POST', signal, headers: { 'Content-Type': 'application/json', ...provider.headers }, body: JSON.stringify(provider.body),
      });
      if (response.ok && response.body) return response;
      await response.body?.cancel();
    } catch (error) {
      if (signal.aborted) throw error;
    }
  }
  throw new RequestError(503, 'The AI tutor is temporarily unavailable. Please try again later.');
}

export async function* tutorDeltas(body) {
  const decoder = new TextDecoder();
  let buffer = '';
  function parseLine(line) {
    if (!line.startsWith('data:')) return null;
    const value = line.slice(5).trim();
    if (!value || value === '[DONE]') return null;
    const data = JSON.parse(value);
    if (data.error) throw new Error('Upstream stream failed');
    return data.choices?.[0]?.delta?.content || data.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || null;
  }
  for await (const chunk of body) {
    buffer += decoder.decode(chunk, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop();
    for (const line of lines) {
      const delta = parseLine(line.trim());
      if (delta) yield delta;
    }
  }
  buffer += decoder.decode();
  const delta = parseLine(buffer.trim());
  if (delta) yield delta;
}
