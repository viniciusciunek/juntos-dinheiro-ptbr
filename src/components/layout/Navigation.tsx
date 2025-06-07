
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User, 
  Plus, 
  CreditCard, 
  Calendar,
  Settings,
  LogOut,
  Bell,
  Tags
} from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const { profile, logout, hasPartner } = useAuth();

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Calendar },
    { id: 'add-transaction', label: 'Adicionar', icon: Plus },
    { id: 'cards', label: 'Cartões', icon: CreditCard },
    { id: 'third-parties', label: 'Terceiros', icon: User },
    { id: 'receivables', label: 'A Receber', icon: Bell }
  ];

  return (
    <>
      {/* Header */}
      <div className="bg-finance-background-card border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="text-lg font-semibold text-finance-secondary">
            Olá, {profile?.name}! 👋
          </h1>
          <p className="text-sm text-finance-text-muted">
            {hasPartner ? 'Conectado em família' : 'Gerencie suas finanças pessoais'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTabChange('categories')}
            className="hover:bg-finance-background"
          >
            <Tags className="h-4 w-4 text-finance-gold" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTabChange('settings')}
            className="hover:bg-finance-background"
          >
            <Settings className="h-4 w-4 text-finance-primary" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 text-finance-red" />
          </Button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-finance-background-card border-t border-gray-200 px-2 py-2 shadow-lg">
        <div className="flex justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <Button
                key={tab.id}
                variant="ghost"
                size="sm"
                className={`flex flex-col items-center gap-1 px-3 py-2 h-auto transition-all duration-200 ${
                  isActive 
                    ? 'text-finance-primary bg-finance-primary/10 font-medium' 
                    : 'text-finance-text-muted hover:text-finance-primary hover:bg-finance-background'
                }`}
                onClick={() => onTabChange(tab.id)}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs">{tab.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Navigation;
