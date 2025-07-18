import { initializeApp } from '@firebase/app';
import { getAuth } from '@firebase/auth';
import { getFirestore } from '@firebase/firestore';
import { getStorage } from '@firebase/storage';

// Firebase configuration - Using the same config as web version
const firebaseConfig = {
  apiKey: "AIzaSyDbGPToe9ip8Ozi0bYDFEdTPeVw27stKis",
  authDomain: "expenseflow-ykb45.firebaseapp.com",
  projectId: "expenseflow-ykb45",
  storageBucket: "expenseflow-ykb45.firebasestorage.app",
  messagingSenderId: "471981177559",
  appId: "1:471981177559:android:77b2a0595ad9135f96ce92"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;