import { doc, getDocFromServer, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.js';
import { cloudRevision } from '../state/progress.js';

export function progressRemote(uid) {
  const ref = doc(db, 'users', uid, 'data', 'progress');
  return {
    async read() {
      const snapshot = await getDocFromServer(ref);
      if (snapshot.exists()) return snapshot.data();
      // Read legacy profiles once; never combine them with another browser user's progress.
      const legacy = await getDocFromServer(doc(db, 'users', uid));
      return legacy.exists() ? { ...legacy.data(), revision: 0 } : null;
    },
    write(progress, expectedRevision) {
      return runTransaction(db, async transaction => {
        const snapshot = await transaction.get(ref);
        const data = snapshot.exists() ? snapshot.data() : null;
        if (cloudRevision(data) !== expectedRevision) return { conflict: true, data };
        const revision = expectedRevision + 1;
        // Replace the snapshot: merging nested maps would resurrect reset/deleted entries.
        transaction.set(ref, { ...progress, schemaVersion: 3, revision, updatedAt: serverTimestamp() });
        return { revision };
      });
    },
  };
}
