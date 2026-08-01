import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
// getAuth import hata diya — login feature abhi use nahi ho raha

const firebaseConfig = {
  apiKey: "AIzaSyBnnbFAmgXYQ3SM_8IV2RQZX6q6FCwC1jU",
  authDomain: "codex-hackfest2026.firebaseapp.com",
  databaseURL: "https://codex-hackfest2026-default-rtdb.firebaseio.com",
  projectId: "codex-hackfest2026",
  storageBucket: "codex-hackfest2026.firebasestorage.app",
  messagingSenderId: "765886398488",
  appId: "1:765886398488:web:c94e54f1100fdee1c4036d"
};

const app = initializeApp(firebaseConfig);

// auth export hata diya taaki 400 CONFIGURATION_NOT_FOUND error na aaye
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const storage = getStorage(app);

export default app;