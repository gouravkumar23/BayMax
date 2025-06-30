import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAPXOTNOxUgnrN8RFb0CXCipe2VDhKV-nA",
  authDomain: "baymax-a5669.firebaseapp.com",
  projectId: "baymax-a5669",
  storageBucket: "baymax-a5669.firebasestorage.app",
  messagingSenderId: "964291241719",
  appId: "1:964291241719:web:11f74e86cf50d4feb815f2",
  measurementId: "G-798XFSVP72"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);