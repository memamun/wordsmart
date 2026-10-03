import test from 'node:test';
import assert from 'node:assert/strict';
import { readTutorStream } from '../src/utils/tutorStream.js';
const response = (parts) => new Response(new ReadableStream({ start(controller) {
  for (const part of parts) controller.enqueue(new TextEncoder().encode(part));
  controller.close();
} }), { headers: { 'Content-Type': 'text/event-stream' } });

test('streaming supports chunk boundaries and a final frame without a newline', async () => {
  const chunks = [];
  const text = await readTutorStream(response(['data: {"del', 'ta":"Hello "}\n\n', 'data: {"delta":"বাংলা"}\n\ndata: [DONE]']), t => chunks.push(t));
  assert.equal(text, 'Hello বাংলা');
  assert.deepEqual(chunks, ['Hello ', 'Hello বাংলা']);
});
test('interrupted and server-error streams are not reported as successful answers', async () => {
  await assert.rejects(readTutorStream(response(['data: {"delta":"partial"}\n'])), /interrupted/);
  await assert.rejects(readTutorStream(response(['data: {"error":"Try again"}\n'])), /Try again/);
  await assert.rejects(readTutorStream(new Response('<html>app</html>')), /unavailable/);
});
test('cancellation stops the response', async () => {
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(readTutorStream(response([]), null, controller.signal), { name: 'AbortError' });
});
