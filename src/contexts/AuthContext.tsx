
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  partnerId?: string;
  partnerEmail?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  invitePartner: (email: string) => Promise<boolean>;
  acceptInvite: (inviteCode: string) => Promise<boolean>;
  isAuthenticated: boolean;
  hasPartner: boolean;
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

  useEffect(() => {
    // Verificar se há usuário logado no localStorage
    const savedUser = localStorage.getItem('finance_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simulação de autenticação - em produção seria uma API
      const users = JSON.parse(localStorage.getItem('finance_users') || '[]');
      const foundUser = users.find((u: any) => u.email === email && u.password === password);
      
      if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        localStorage.setItem('finance_user', JSON.stringify(userWithoutPassword));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const users = JSON.parse(localStorage.getItem('finance_users') || '[]');
      
      if (users.find((u: any) => u.email === email)) {
        return false; // Email já cadastrado
      }

      const newUser = {
        id: Date.now().toString(),
        email,
        password,
        name,
        partnerId: undefined,
        partnerEmail: undefined
      };

      users.push(newUser);
      localStorage.setItem('finance_users', JSON.stringify(users));

      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      localStorage.setItem('finance_user', JSON.stringify(userWithoutPassword));
      
      return true;
    } catch (error) {
      console.error('Erro no registro:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('finance_user');
  };

  const invitePartner = async (email: string): Promise<boolean> => {
    try {
      if (!user) return false;
      
      const users = JSON.parse(localStorage.getItem('finance_users') || '[]');
      const partner = users.find((u: any) => u.email === email);
      
      if (!partner) return false;

      // Atualizar ambos os usuários
      const updatedUsers = users.map((u: any) => {
        if (u.id === user.id) {
          return { ...u, partnerId: partner.id, partnerEmail: partner.email };
        }
        if (u.id === partner.id) {
          return { ...u, partnerId: user.id, partnerEmail: user.email };
        }
        return u;
      });

      localStorage.setItem('finance_users', JSON.stringify(updatedUsers));
      
      // Atualizar usuário atual
      const updatedUser = { ...user, partnerId: partner.id, partnerEmail: partner.email };
      setUser(updatedUser);
      localStorage.setItem('finance_user', JSON.stringify(updatedUser));
      
      return true;
    } catch (error) {
      console.error('Erro ao convidar parceiro:', error);
      return false;
    }
  };

  const acceptInvite = async (inviteCode: string): Promise<boolean> => {
    // Implementação simplificada - em produção seria mais complexa
    return true;
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    invitePartner,
    acceptInvite,
    isAuthenticated: !!user,
    hasPartner: !!(user?.partnerId)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
