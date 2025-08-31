import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Timeout de sécurité pour éviter un chargement infini
    const timeoutId = setTimeout(() => {
      console.log('useAuth: Timeout reached, forcing loading to false');
      setLoading(false);
    }, 10000); // 10 secondes maximum

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('useAuth: Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('useAuth: Error getting session:', error);
          clearTimeout(timeoutId);
          setLoading(false);
          return;
        }
        
        console.log('useAuth: Session retrieved:', session ? 'User found' : 'No user');
        setUser(session?.user ?? null);
        clearTimeout(timeoutId);
        setLoading(false);
      } catch (error) {
        console.error('useAuth: Unexpected error getting session:', error);
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('useAuth: Auth state changed:', event, session ? 'User present' : 'No user');
        setUser(session?.user ?? null);
        clearTimeout(timeoutId);
        setLoading(false);
      }
    );

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
  };

  return {
    user,
    loading,
    signOut,
    isAuthenticated: !!user
  };
};