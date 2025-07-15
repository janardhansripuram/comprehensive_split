import { initializeApp } from '@firebase/app';
import { getAuth } from '@firebase/auth';
import { getFirestore } from '@firebase/firestore';
import { getStorage } from '@firebase/storage';

// Firebase configuration - Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC-y4YY70SOfqFu5fdEn6KQP1iil1Ggutg",
  authDomain: "oweme-469e0.firebaseapp.com",
  projectId: "oweme-469e0",
  storageBucket: "oweme-469e0.appspot.com",
  messagingSenderId: "736723332834",
  appId: "1:736723332834:android:4d7b077515d8d99544f8bb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;