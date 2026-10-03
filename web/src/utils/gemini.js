import { authenticatedPost } from '../services/api.js';
import { readTutorStream } from './tutorStream.js';

// Credentials and provider selection live exclusively in the authenticated backend.
export async function sendGeminiChatMessage(messages, wordContext = null, options = {}) {
  const { signal, onChunk } = options;
  const recent = messages.slice(-20).map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', text: m.text }));
  while (recent.length && recent[0].role !== 'user') recent.shift();
  const context = wordContext ? Object.fromEntries(
    ['word', 'definition', 'part_of_speech', 'bengali_meaning']
      .filter(key => typeof wordContext[key] === 'string').map(key => [key, wordContext[key]])
  ) : null;
  const response = await authenticatedPost('/api/tutor', { messages: recent, wordContext: context }, signal);
  return readTutorStream(response, onChunk, signal);
}
