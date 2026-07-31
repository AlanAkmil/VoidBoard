import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  onSnapshot,
  doc,
  updateDoc,
  increment,
  serverTimestamp,
  where,
  getDoc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";

// Same project the original VoidBoard used. Move this to env vars
// (NEXT_PUBLIC_FIREBASE_*) whenever you're ready to rotate it.
const firebaseConfig = {
  apiKey: "AIzaSyCfMqEZfO8mf3pA3w0wW-ivHWIQF39SA1E",
  authDomain: "us-army-generator.firebaseapp.com",
  projectId: "us-army-generator",
  storageBucket: "us-army-generator.firebasestorage.app",
  messagingSenderId: "15384107814",
  appId: "1:15384107814:web:97990e119943487cca3fe7",
};

export function getDb() {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return getFirestore(app);
}

export const fs = {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  onSnapshot,
  doc,
  updateDoc,
  increment,
  serverTimestamp,
  where,
  getDoc,
  setDoc,
  deleteDoc,
};
