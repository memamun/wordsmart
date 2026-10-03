import { RequestError, validateTutorInput } from './validation.js';
import { openTutorStream, tutorDeltas } from './tutor.js';

export function createWebHandler({ verifyToken, scoreQuiz, limitUsage, getConfig, openStream = openTutorStream }) {
  return async (req, res) => {
    res.set('Cache-Control', 'no-store');
    if (req.method !== 'POST') return res.status(405).set('Allow', 'POST').json({ error: 'Use POST.' });
    const path = req.path.replace(/\/$/, '');
    if (!['/api/tutor', '/api/quiz/score'].includes(path)) return res.status(404).json({ error: 'Not found.' });
    try {
      const token = req.get('Authorization')?.match(/^Bearer (.+)$/)?.[1];
      let user;
      try { user = token ? await verifyToken(token) : null; } catch { /* Return a generic authentication error. */ }
      if (!user || user.firebase?.sign_in_provider === 'anonymous') throw new RequestError(401, 'Sign in to use this feature.');
      if ((req.rawBody?.length || 0) > 32000) throw new RequestError(413, 'Request is too large.');
      if (path === '/api/quiz/score') return res.json(await scoreQuiz(user, req.body?.answers));
      const input = validateTutorInput(req.body);
      await limitUsage(user.uid, 'tutor', 5, 50);
      let config;
      try { config = JSON.parse(getConfig()); } catch { throw new RequestError(503, 'The AI tutor is not configured yet.'); }
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 45000);
      const disconnect = () => { if (!res.writableEnded) controller.abort(); };
      res.on('close', disconnect);
      try {
        const upstream = await openStream(input, config, controller.signal);
        res.status(200).set('Content-Type', 'text/event-stream');
        let received = false;
        for await (const delta of tutorDeltas(upstream.body)) {
          received = true;
          res.write(`data: ${JSON.stringify({ delta })}\n\n`);
        }
        if (!received) throw new Error('Empty response');
        res.write('data: [DONE]\n\n');
        res.end();
      } finally {
        clearTimeout(timer);
        res.off('close', disconnect);
      }
    } catch (error) {
      const message = error instanceof RequestError ? error.message : 'The service is temporarily unavailable. Please try again.';
      if (res.headersSent) { res.write(`data: ${JSON.stringify({ error: message })}\n\n`); res.end(); }
      else res.status(error instanceof RequestError ? error.status : 503).json({ error: message });
    }
  };
}
