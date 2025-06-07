
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  name: string;
  linkedUserId?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthUser extends User {
  name?: string;
  partnerEmail?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  hasPartner: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (name: string) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  invitePartner: (email: string) => Promise<boolean>;
  checkInvitations: () => Promise<void>;
  acceptInvitation: (token: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        linkedUserId: data.linked_user_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error loading profile:', error);
      return null;
    }
  };

  const checkInvitations = async () => {
    if (!user?.email) return;

    try {
      const { data: invitations, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('invited_email', user.email)
        .eq('status', 'pendente')
        .gte('expires_at', new Date().toISOString());

      if (error) {
        console.error('Error checking invitations:', error);
        return;
      }

      if (invitations && invitations.length > 0) {
        // Show invitation notification
        console.log('You have pending invitations:', invitations);
      }
    } catch (error) {
      console.error('Error checking invitations:', error);
    }
  };

  const acceptInvitation = async (token: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // Verify token and get invitation
      const { data: invitation, error: invitationError } = await supabase
        .from('invitations')
        .select('*')
        .eq('token', token)
        .eq('status', 'pendente')
        .gte('expires_at', new Date().toISOString())
        .single();

      if (invitationError || !invitation) {
        console.error('Invalid or expired invitation');
        return false;
      }

      // Update both profiles to link them
      const { error: updateError1 } = await supabase
        .from('profiles')
        .update({ linked_user_id: invitation.inviting_user_id })
        .eq('id', user.id);

      const { error: updateError2 } = await supabase
        .from('profiles')
        .update({ linked_user_id: user.id })
        .eq('id', invitation.inviting_user_id);

      // Update invitation status
      const { error: inviteUpdateError } = await supabase
        .from('invitations')
        .update({ status: 'aceito' })
        .eq('id', invitation.id);

      if (updateError1 || updateError2 || inviteUpdateError) {
        console.error('Error accepting invitation');
        return false;
      }

      // Reload profile
      const updatedProfile = await loadProfile(user.id);
      setProfile(updatedProfile);

      return true;
    } catch (error) {
      console.error('Error accepting invitation:', error);
      return false;
    }
  };

  const invitePartner = async (email: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // Generate unique token
      const token = Math.random().toString(36).substring(2, 18);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

      const { error } = await supabase
        .from('invitations')
        .insert([{
          inviting_user_id: user.id,
          invited_email: email,
          token: token,
          expires_at: expiresAt.toISOString()
        }]);

      if (error) {
        console.error('Error creating invitation:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error inviting partner:', error);
      return false;
    }
  };

  const updateProfile = async (name: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        return false;
      }

      // Reload profile
      const updatedProfile = await loadProfile(user.id);
      setProfile(updatedProfile);

      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('Error changing password:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error changing password:', error);
      return false;
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        
        if (session?.user) {
          const authUser: AuthUser = {
            ...session.user,
            name: session.user.user_metadata?.name
          };
          setUser(authUser);
          
          // Load profile
          const userProfile = await loadProfile(session.user.id);
          setProfile(userProfile);
          
          // Check for invitations
          setTimeout(() => {
            checkInvitations();
          }, 1000);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        const authUser: AuthUser = {
          ...session.user,
          name: session.user.user_metadata?.name
        };
        setUser(authUser);
        
        loadProfile(session.user.id).then(userProfile => {
          setProfile(userProfile);
          setLoading(false);
          
          // Check for invitations after profile is loaded
          setTimeout(() => {
            checkInvitations();
          }, 1000);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      return { error: 'Erro inesperado durante o login' };
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: name,
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      return { error: 'Erro inesperado durante o registro' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const isAuthenticated = !!user;
  const hasPartner = !!profile?.linkedUserId;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isAuthenticated,
        hasPartner,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        invitePartner,
        checkInvitations,
        acceptInvitation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
