import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "./supabase";

// Import the AuthChangeEvent type from @supabase/auth-js
type Session = {
  user: SupabaseUser | null;
};

// Import the AuthChangeEvent type from @supabase/auth-js
type AuthChangeEvent = Parameters<typeof supabase.auth.onAuthStateChange>[0];

export interface User {
  id: string;
  email: string;
  role: string;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Check active sessions and set the user
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          await handleUserSession(session);
        }
      } catch (error) {
        console.error("Error checking user session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const handleUserSession = async (session: { user: SupabaseUser | null }) => {
      if (!session?.user) {
        setUser(null);
        return;
      }

      try {
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (error) throw error;
        
        const user: User = {
          id: userData.id,
          email: userData.email,
          role: userData.role,
          created_at: userData.created_at,
          updated_at: userData.updated_at
        };
        
        setUser(user);
      } catch (error) {
        console.error("Error handling user session:", error);
        setUser(null);
      }
    };

    // Set up auth state change listener with proper typing
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Handle the session change without returning anything
        handleUserSession(session || { user: null }).catch(error => {
          console.error('Error in auth state change:', error);
        });
      }
    );

    checkUser();

    return () => {
      subscription?.unsubscribe();
    };
  }, [queryClient]);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error("No user returned from login");

      // Get the user data from your users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (userError) throw userError;
      if (!userData) throw new Error("User not found in database");

      const user: User = {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        created_at: userData.created_at,
        updated_at: userData.updated_at
      };

      setUser(user);
      return user;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      queryClient.clear();
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout
  };

  // Use type assertion as a last resort
  const AuthProviderComponent = AuthContext.Provider as unknown as React.FC<{ value: AuthContextType; children: ReactNode }>;
  
  return (
    <AuthProviderComponent value={value}>
      {children}
    </AuthProviderComponent>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

type UnauthorizedBehavior = 'redirect' | 'throw';

export function getQueryFn({ on401 }: { on401: UnauthorizedBehavior }) {
  return async function queryFn<T>(queryKey: string[]) {
    const { data, error } = await supabase
      .from(queryKey[0])
      .select('*')
      .eq(queryKey[1], queryKey[2]);

    if (error) {
      if (error.code === '401' && on401 === 'redirect') {
        window.location.href = '/login';
      }
      throw error;
    }

    return data as T[];
  };
}