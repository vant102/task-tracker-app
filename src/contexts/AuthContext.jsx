import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, loginWithGoogle, logout } from '../firebase';
import { onAuthStateChanged, getRedirectResult } from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle redirect result if user logged in via redirect
    getRedirectResult(auth).catch(err => {
      console.warn("Redirect result handler:", err);
    });

    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
