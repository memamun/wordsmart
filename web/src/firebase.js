import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAxiaWl1ZadMdUlU4ifudIObmVfY44tn3o",
  authDomain: "wordsmart-vocab-76.firebaseapp.com",
  projectId: "wordsmart-vocab-76",
  storageBucket: "wordsmart-vocab-76.firebasestorage.app",
  messagingSenderId: "33237847985",
  appId: "1:33237847985:web:f522f3da79121d5bbf3790"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };
