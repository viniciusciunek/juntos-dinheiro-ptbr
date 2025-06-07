
import React, { useState } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { FinanceProvider } from '@/contexts/FinanceContext';
import LoginScreen from '@/components/auth/LoginScreen';
import RegisterScreen from '@/components/auth/RegisterScreen';
import Navigation from '@/components/layout/Navigation';
import DashboardScreen from '@/components/dashboard/DashboardScreen';
import AddTransactionScreen from '@/components/transactions/AddTransactionScreen';
import AccountsScreen from '@/components/accounts/AccountsScreen';
import ThirdPartiesScreen from '@/components/third-parties/ThirdPartiesScreen';
import CategoriesScreen from '@/components/categories/CategoriesScreen';
import ReceivablesScreen from '@/components/receivables/ReceivablesScreen';
import SettingsScreen from '@/components/settings/SettingsScreen';
import ProfileScreen from '@/components/profile/ProfileScreen';
import FamilyInviteScreen from '@/components/family/FamilyInviteScreen';

const AuthWrapper: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  
  return isLogin ? (
    <LoginScreen onSwitchToRegister={() => setIsLogin(false)} />
  ) : (
    <RegisterScreen onSwitchToLogin={() => setIsLogin(true)} />
  );
};

const MainApp: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-finance-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-finance-primary mx-auto"></div>
          <p className="text-finance-text-muted mt-2">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthWrapper />;
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardScreen />;
      case 'add-transaction':
        return <AddTransactionScreen />;
      case 'cards':
        return <AccountsScreen />;
      case 'third-parties':
        return <ThirdPartiesScreen />;
      case 'categories':
        return <CategoriesScreen />;
      case 'receivables':
        return <ReceivablesScreen />;
      case 'settings':
        return <SettingsScreen onNavigate={setActiveTab} />;
      case 'profile':
        return <ProfileScreen onNavigate={setActiveTab} />;
      case 'family':
        return <FamilyInviteScreen onNavigate={setActiveTab} />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-finance-background">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="animate-fade-in">
        {renderActiveTab()}
      </main>
    </div>
  );
};

const Index: React.FC = () => {
  return (
    <AuthProvider>
      <FinanceProvider>
        <MainApp />
      </FinanceProvider>
    </AuthProvider>
  );
};

export default Index;
