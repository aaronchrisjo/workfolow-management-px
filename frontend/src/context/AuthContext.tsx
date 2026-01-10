import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '../types';
import { AuthContext } from './AuthContextDef';

export { AuthContext } from './AuthContextDef';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const loadedUserIdRef = useRef<string | null>(null);

  const fetchProfile = useCallback(async (userId: string) => {
    if (loadedUserIdRef.current === userId) {
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.warn('Profile fetch failed, continuing without profile:', error.message);
      return;
    }

    if (!data) {
      console.warn('Profile not found for user, continuing without profile');
      return;
    }

    loadedUserIdRef.current = userId;
    setUser({
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role,
      created_at: data.created_at,
    });
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        fetchProfile(session.user.id);
      }

      setIsLoading(false);
    };

    initAuth();

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setUser(null);
        }
      });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    loadedUserIdRef.current = null;
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
