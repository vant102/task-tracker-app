import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDISrhrstpV2WmsMA_zoy-ylT77VHQwjB8",
  authDomain: "task-manager-app-578f5.firebaseapp.com",
  projectId: "task-manager-app-578f5",
  storageBucket: "task-manager-app-578f5.firebasestorage.app",
  messagingSenderId: "911549178382",
  appId: "1:911549178382:web:c6a21ef5ff12640c23925f",
  measurementId: "G-V5FFHQ5MM1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const dbFirestore = getFirestore(app);
export const provider = new GoogleAuthProvider();

export const loginWithGoogle = () => signInWithPopup(auth, provider);
export const logout = () => signOut(auth);
