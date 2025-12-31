// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBFFCxLou6Xaj2aH_mhTO9VQ-xWT20FQXM",
  authDomain: "deskmates-gaye.firebaseapp.com",
  projectId: "deskmates-gaye",
  storageBucket: "deskmates-gaye.firebasestorage.app",
  messagingSenderId: "716028559362",
  appId: "1:716028559362:web:5673dfa08ee889ac10e71b",
  measurementId: "G-EX85Q6ZZB1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);