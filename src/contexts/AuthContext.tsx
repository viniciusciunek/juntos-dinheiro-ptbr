
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  name: string;
  linked_user_id?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (name: string) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  invitePartner: (email: string) => Promise<boolean>;
  isAuthenticated: boolean;
  hasPartner: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se há usuário logado
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      }
      setLoading(false);
    });

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erro ao carregar perfil:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Erro no login:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      });

      if (error) {
        console.error('Erro no registro:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro no registro:', error);
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (name: string): Promise<boolean> => {
    try {
      if (!user) return false;

      const { error } = await supabase
        .from('profiles')
        .update({ name })
        .eq('id', user.id);

      if (error) {
        console.error('Erro ao atualizar perfil:', error);
        return false;
      }

      setProfile(prev => prev ? { ...prev, name } : null);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return false;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('Erro ao alterar senha:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      return false;
    }
  };

  const invitePartner = async (email: string): Promise<boolean> => {
    try {
      if (!user) return false;

      // Gerar token único
      const token = Math.random().toString(36).substring(2, 18);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expira em 7 dias

      const { error } = await supabase
        .from('invitations')
        .insert({
          inviting_user_id: user.id,
          invited_email: email,
          token,
          expires_at: expiresAt.toISOString(),
        });

      if (error) {
        console.error('Erro ao enviar convite:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao enviar convite:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    invitePartner,
    isAuthenticated: !!user,
    hasPartner: !!(profile?.linked_user_id),
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
