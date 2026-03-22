// Firebase Configuration
// TODO: Replace with your actual Firebase project credentials
// Get these from Firebase Console > Project Settings > General > Your apps > Web app

import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyAx5gYh-Fg4eLCiiyxcbKVmdXe1R0qv_zQ",
    authDomain: "disasterprepapp-177f6.firebaseapp.com",
    databaseURL: "https://disasterprepapp-177f6-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "disasterprepapp-177f6",
    storageBucket: "disasterprepapp-177f6.firebasestorage.app",
    messagingSenderId: "367342038978",
    appId: "1:367342038978:web:5248aed4a62c9479e3705b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log('✅ Firebase initialized successfully');
console.log('Database URL:', firebaseConfig.databaseURL);

// Initialize Realtime Database and get a reference to the service
// Explicitly pass the database URL to ensure correct region
export const database = getDatabase(app, firebaseConfig.databaseURL);
console.log('✅ Firebase Realtime Database connected to:', firebaseConfig.databaseURL);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);
console.log('✅ Firebase Storage connected');

export default app;


