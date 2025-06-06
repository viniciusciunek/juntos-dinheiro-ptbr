
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

const AuthWrapper: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  
  return isLogin ? (
    <LoginScreen onSwitchToRegister={() => setIsLogin(false)} />
  ) : (
    <RegisterScreen onSwitchToLogin={() => setIsLogin(true)} />
  );
};

const MainApp: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

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
      case 'family':
        return <div className="p-4 pb-20"><h2 className="text-xl font-bold">Finanças da Família (Em desenvolvimento)</h2></div>;
      case 'settings':
        return <div className="p-4 pb-20"><h2 className="text-xl font-bold">Configurações (Em desenvolvimento)</h2></div>;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
