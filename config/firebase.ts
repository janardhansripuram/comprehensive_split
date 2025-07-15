import { initializeApp } from '@firebase/app';
import { getAuth } from '@firebase/auth';
import { getFirestore } from '@firebase/firestore';
import { getStorage } from '@firebase/storage';

// Firebase configuration - Using the same config as web version
const firebaseConfig = {
  apiKey: "AIzaSyDQpvnKXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "splitchey.firebaseapp.com",
  projectId: "splitchey",
  storageBucket: "splitchey.appspot.com",
  messagingSenderId: "XXXXXXXXXXXX",
  appId: "1:XXXXXXXXXXXX:web:XXXXXXXXXXXXXXXX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;