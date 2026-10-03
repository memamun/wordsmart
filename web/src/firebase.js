import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAxiaWl1ZadMdUlU4ifudIObmVfY44tn3o",
  authDomain: "wordsmart-vocab-76.firebaseapp.com",
  projectId: "wordsmart-vocab-76",
  storageBucket: "wordsmart-vocab-76.firebasestorage.app",
  messagingSenderId: "33237847985",
  appId: "1:33237847985:web:f522f3da79121d5bbf3790"
};

const useEmulators = import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true';
const app = initializeApp(useEmulators ? { ...firebaseConfig, projectId: 'demo-wordsmart', apiKey: 'demo-key' } : firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
if (useEmulators) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
}

export { app, auth, db, googleProvider };
