// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBFFCxLou6Xaj2aH_mhTO9VQ-xWT20FQXM",
  authDomain: "deskmates-gaye.firebaseapp.com",
  projectId: "deskmates-gaye",
  storageBucket: "deskmates-gaye.firebasestorage.app",
  messagingSenderId: "716028559362",
  appId: "1:716028559362:web:5673dfa08ee889ac10e71b",
  measurementId: "G-EX85Q6ZZB1"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// THE FIX: Export the provider so we can call .setCustomParameters on it
const googleProvider = new GoogleAuthProvider(); 
googleProvider.setCustomParameters({ prompt: 'select_account' });

export { app, auth, db, googleProvider };