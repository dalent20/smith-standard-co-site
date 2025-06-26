// src/lib/firebase.ts

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// Optional: Only import analytics if used
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
    apiKey: "AIzaSyAvkAuCwBVHSbAXJdoZ8PkdvYkO7h5Vw3A",
    authDomain: "smith-standard-co-site.firebaseapp.com",
    projectId: "smith-standard-co-site",
    storageBucket: "smith-standard-co-site.appspot.com", // fix typo here
    messagingSenderId: "701119270005",
    appId: "1:701119270005:web:ee388236c320296d5dfc3c",
    measurementId: "G-C8XJ8ZK4C6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);
const auth = getAuth(app)

// Optional: Initialize Analytics (only if you're using it in the browser)
if (typeof window !== 'undefined') {
    isSupported().then((supported) => {
        if (supported) {
            getAnalytics(app);
        }
    });
}

export { db, auth };
