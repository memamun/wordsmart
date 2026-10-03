import { useEffect, useRef, useState, useSyncExternalStore, useCallback } from 'react';
import { createProgressStore, createSyncController } from '../state/progress.js';
import { progressRemote } from '../services/progressRemote.js';

export function useProgressStore(uid) {
  // The containing app is keyed by uid, so state and outstanding work never cross accounts.
  const [store] = useState(() => createProgressStore(window.localStorage, uid));
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot);
  const controllerRef = useRef(null);
  useEffect(() => {
    if (!uid) return;
    const controller = createSyncController(store, progressRemote(uid));
    controllerRef.current = controller;
    controller.restore();
    const retry = () => controller.restore();
    window.addEventListener('online', retry);
    return () => {
      controller.stop();
      window.removeEventListener('online', retry);
    };
  }, [store, uid]);

  useEffect(() => {
    if (!uid || snapshot.status !== 'ready' || !snapshot.dirty) return;
    const timer = setTimeout(() => controllerRef.current?.save(), 600);
    return () => clearTimeout(timer);
  }, [uid, snapshot]);

  const retrySync = useCallback(() => controllerRef.current?.restore(), []);
  return { store, snapshot, retrySync };
}
