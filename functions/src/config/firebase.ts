import { initializeApp, getApps, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";

const app: App = getApps().length === 0 ? initializeApp() : getApps()[0];

// Firebase Authentication
export const auth: Auth = getAuth(app);

// Firestore
export const firestore: Firestore = getFirestore(app);
