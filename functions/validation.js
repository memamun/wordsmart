export class RequestError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

export function validateTutorInput(body) {
  if (!body || !Array.isArray(body.messages) || body.messages.length > 20) {
    throw new RequestError(400, 'Send up to 20 chat messages.');
  }
  const messages = body.messages.map(message => {
    if (!message || !['user', 'assistant', 'model'].includes(message.role) || typeof message.text !== 'string' || message.text.length > 4000) {
      throw new RequestError(400, 'Invalid chat message.');
    }
    return { role: message.role === 'user' ? 'user' : 'assistant', text: message.text };
  });
  while (messages.length && messages[0].role !== 'user') messages.shift();
  if (!messages.length || messages.at(-1).role !== 'user' || messages.reduce((n, m) => n + m.text.length, 0) > 16000) {
    throw new RequestError(400, 'Please shorten the conversation and try again.');
  }
  const wordContext = {};
  for (const field of ['word', 'definition', 'part_of_speech', 'bengali_meaning']) {
    const value = body.wordContext?.[field];
    if (value !== undefined && (typeof value !== 'string' || value.length > 2000)) {
      throw new RequestError(400, 'Invalid word context.');
    }
    if (value) wordContext[field] = value;
  }
  return { messages, wordContext };
}

export function correctWordIds(answers, vocabulary) {
  if (!Array.isArray(answers) || !answers.length || answers.length > 100) throw new RequestError(400, 'Invalid quiz submission.');
  const correct = new Set();
  for (const entry of answers) {
    if (!entry || !Number.isSafeInteger(entry.wordId) || !['definition', 'synonym', 'antonym'].includes(entry.kind) || typeof entry.answer !== 'string' || entry.answer.length > 250) {
      throw new RequestError(400, 'Invalid quiz answer.');
    }
    const word = vocabulary.get(entry.wordId);
    if (!word) continue;
    const accepted = entry.kind === 'definition' ? [word.word] : entry.kind === 'synonym' ? word.synonyms : word.antonyms;
    if (accepted.some(answer => answer.trim().toUpperCase() === entry.answer.trim().toUpperCase())) correct.add(word.id);
  }
  return [...correct];
}

export function rankedReward(previousIds, submittedIds) {
  const earnedIds = [...new Set([...previousIds, ...submittedIds])];
  return { earnedIds, awardedXp: (earnedIds.length - previousIds.length) * 10, totalXp: earnedIds.length * 10 };
}

export function consumeQuota(previous, now, perMinute, perDay) {
  const minute = Math.floor(now / 60000);
  const day = Math.floor(now / 86400000);
  const minuteCount = previous?.minute === minute ? previous.minuteCount : 0;
  const dayCount = previous?.day === day ? previous.dayCount : 0;
  if (minuteCount >= perMinute || dayCount >= perDay) throw new RequestError(429, 'Usage limit reached. Please try again later.');
  return { minute, day, minuteCount: minuteCount + 1, dayCount: dayCount + 1 };
}
