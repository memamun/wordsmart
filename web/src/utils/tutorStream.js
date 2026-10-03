export async function readTutorStream(response, onChunk, signal) {
  if (!response.headers.get('content-type')?.includes('text/event-stream') || !response.body) {
    throw new Error('The AI tutor is unavailable. Please try again later.');
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let text = '';
  let complete = false;
  const parse = line => {
    if (!line.startsWith('data:')) return;
    const value = line.slice(5).trim();
    if (value === '[DONE]') { complete = true; return; }
    if (!value) return;
    const data = JSON.parse(value);
    if (data.error) throw new Error(data.error);
    if (typeof data.delta === 'string') { text += data.delta; onChunk?.(text, data.delta); }
  };
  try {
    while (!complete) {
      signal?.throwIfAborted();
      const { done, value } = await reader.read();
      if (done) { buffer += decoder.decode(); parse(buffer.trim()); break; }
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();
      for (const line of lines) parse(line.trim());
    }
    signal?.throwIfAborted();
    if (!complete || !text.trim()) throw new Error('The tutor response was interrupted. Please try again.');
    return text.trim();
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
