
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getMessaging, Messaging, isSupported } from "firebase/messaging";
import { getFunctions, Functions } from "firebase/functions";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp;
let authInstance: Auth;
let dbInstance: Firestore;
let storageInstance: FirebaseStorage;
let functionsInstance: Functions;
let messagingInstance: Messaging | null = null;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

authInstance = getAuth(app);
dbInstance = getFirestore(app);
storageInstance = getStorage(app);
functionsInstance = getFunctions(app, 'us-central1'); // Specify region if not us-central1

// Initialize messaging only in client-side environments where it's supported
if (typeof window !== 'undefined') {
    isSupported().then((supported) => {
        if (supported) {
            messagingInstance = getMessaging(app);
        } else {
            console.warn("Firebase Messaging not supported in this browser.");
        }
    }).catch(error => {
        console.error("Error checking for Firebase Messaging support:", error);
    });
}

export { app, authInstance as auth, dbInstance as db, storageInstance as storage, functionsInstance as functions, messagingInstance as messaging };
