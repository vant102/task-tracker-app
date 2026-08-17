import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  signOut,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Determine appropriate authDomain
const isCustomHosting = typeof window !== 'undefined' && (
  window.location.hostname.endsWith('.web.app') || 
  window.location.hostname.endsWith('.firebaseapp.com')
);

const firebaseConfig = {
  apiKey: "AIzaSyDISrhrstpV2WmsMA_zoy-ylT77VHQwjB8",
  authDomain: isCustomHosting ? window.location.hostname : "task-manager-app-578f5.firebaseapp.com",
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
provider.setCustomParameters({
  prompt: 'select_account'
});

export const loginWithGoogle = async () => {
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch (e) {
    try {
      await setPersistence(auth, browserSessionPersistence);
    } catch (err) {
      console.warn("Persistence setup warning:", err);
    }
  }

  try {
    return await signInWithPopup(auth, provider);
  } catch (err) {
    console.error("Popup login error:", err);
    // If browser blocks popup or throws IndexedDB closing/hidden error, seamlessly fallback to redirect
    if (err.message && (err.message.includes('closing') || err.message.includes('hidden') || err.code === 'auth/internal-error' || err.code === 'auth/popup-blocked')) {
      return await signInWithRedirect(auth, provider);
    }
    throw err;
  }
};

export const logout = () => signOut(auth);
