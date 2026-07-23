import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthChange, signIn, signUp, signOutUser } from '../services/backend';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading, null = signed out

  useEffect(() => {
    const unsub = onAuthChange(setUser);
    return unsub;
  }, []);

  const value = {
    user,
    loading: user === undefined,
    login: (email, password) => signIn(email, password),
    signup: (email, password, displayName) => signUp(email, password, displayName),
    logout: () => signOutUser(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
