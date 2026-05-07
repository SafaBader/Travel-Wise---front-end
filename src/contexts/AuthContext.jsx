import { createContext, useContext, useEffect, useState } from 'react';
import { api, getToken, setToken, normalizeUser } from '../lib/api';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const applyAuth = (payload) => {
    const token = payload?.token || payload?.access_token || payload?.accessToken;
    const nextUser = normalizeUser(payload?.user || payload?.profile || payload);
    if (token) setToken(token);
    setUser(nextUser || null);
    setProfile(nextUser || null);
    setSession(token ? { access_token: token, user: nextUser } : null);
  };

  const loadMe = async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const data = await api.get('/users/me');
      const me = normalizeUser(data.user || data.profile || data);
      setUser(me);
      setProfile(me);
      setSession({ access_token: token, user: me });
    } catch (error) {
      console.error('Failed to load user profile:', error.message);
      // Keep user logged in even if profile fetch fails
      // Only clear session if token is explicitly invalid (401)
      if (error.message?.includes('401') || error.message?.includes('Invalid') || error.message?.includes('expired')) {
        setToken(null);
        setUser(null);
        setProfile(null);
        setSession(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMe(); }, []);

  const signUp = async (email, password, fullName) => {
    try {
      const data = await api.post('/users/register', { name: fullName, email, password });
      applyAuth(data);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email, password) => {
    try {
      const data = await api.post('/users/login', { email, password });
      applyAuth(data);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    setToken(null);
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const updateProfile = async (updates) => {
    if (!user) return { error: new Error('Not authenticated') };
    try {
      const data = await api.patch('/users/me', {
        name: updates.name || updates.full_name,
        bio: updates.bio,
        avatar_url: updates.avatar_url,
      });
      const updated = normalizeUser(data.user || data.profile || data);
      setUser(updated);
      setProfile(updated);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      loading,
      signUp,
      signIn,
      signOut,
      updateProfile,
      isAdmin: profile?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
