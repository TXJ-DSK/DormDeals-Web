import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import React, { ReactNode, useContext, useEffect, useState } from 'react';

import { upsertUser } from '../api/users';
import { auth } from '../firebase/firebase';

const ALLOWED_DOMAIN = 'u.northwestern.edu';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Validate email domain
        const email = currentUser.email;
        if (!email || !email.endsWith(`@${ALLOWED_DOMAIN}`)) {
          // User doesn't have allowed email, sign them out
          await signOut(auth);
          setUser(null);
        } else {
          try {
            await upsertUser(currentUser.uid, {
              username: currentUser.displayName ?? email.split('@')[0],
              email,
            });
          } catch (err) {
            // Non-fatal — auth still succeeds even if DB write fails
            console.error('Failed to upsert user record:', err);
          }

          setUser(currentUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
