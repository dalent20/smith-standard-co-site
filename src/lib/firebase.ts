// src/lib/firebase.ts

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyAvkAuCwBVHSbAXJdoZ8PkdvYkO7h5Vw3A',
  authDomain: 'smith-standard-co-site.firebaseapp.com',
  projectId: 'smith-standard-co-site',
  storageBucket: 'smith-standard-co-site.appspot.com',
  messagingSenderId: '701119270005',
  appId: '1:701119270005:web:ee388236c320296d5dfc3c',
  measurementId: 'G-C8XJ8ZK4C6',
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) getAnalytics(app);
  });
}

export { app, db, auth, storage, firebaseConfig };
