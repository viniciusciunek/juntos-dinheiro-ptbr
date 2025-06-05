
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User, 
  Plus, 
  CreditCard, 
  Calendar,
  Settings,
  LogOut,
  Bell
} from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const { user, logout, hasPartner } = useAuth();

  const tabs = [
    { id: 'dashboard', label: 'Início', icon: Calendar },
    { id: 'add-transaction', label: 'Adicionar', icon: Plus },
    { id: 'cards', label: 'Cartões', icon: CreditCard },
    { id: 'third-parties', label: 'Terceiros', icon: User },
    { id: 'receivables', label: 'A Receber', icon: Bell },
    { id: 'family', label: 'Família', icon: User, disabled: !hasPartner }
  ];

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            Olá, {user?.name}! 👋
          </h1>
          <p className="text-sm text-gray-500">
            {hasPartner ? `Conectado com ${user?.partnerEmail}` : 'Convide seu cônjuge para começar'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTabChange('settings')}
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isDisabled = tab.disabled;
            
            return (
              <Button
                key={tab.id}
                variant="ghost"
                size="sm"
                className={`flex flex-col items-center gap-1 px-2 py-2 h-auto ${
                  isActive 
                    ? 'text-primary bg-primary/10' 
                    : isDisabled 
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600'
                }`}
                onClick={() => !isDisabled && onTabChange(tab.id)}
                disabled={isDisabled}
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
