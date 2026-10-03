import { auth } from '../firebase.js';

export async function authenticatedPost(path, body, signal) {
  const user = auth.currentUser;
  if (!user) throw new Error('Sign in with Google to use this feature.');
  const token = await user.getIdToken();
  signal?.throwIfAborted();
  const response = await fetch(path, {
    method: 'POST', signal,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'The service is unavailable. Please try again later.');
  }
  return response;
}

export async function submitRankedAnswers(answers, signal) {
  return (await authenticatedPost('/api/quiz/score', { answers }, signal)).json();
}
