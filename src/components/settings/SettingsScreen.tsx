
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User, 
  CreditCard, 
  Users, 
  Tags, 
  Bell, 
  LogOut,
  Settings,
  ChevronRight,
  UserPlus
} from 'lucide-react';

interface SettingsScreenProps {
  onNavigate: (section: string) => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onNavigate }) => {
  const { profile, logout, hasPartner } = useAuth();

  const settingsItems = [
    {
      id: 'profile',
      title: 'Meu Perfil',
      description: 'Editar nome, e-mail e senha',
      icon: User,
      action: () => onNavigate('profile'),
      color: 'text-finance-primary'
    },
    {
      id: 'family',
      title: hasPartner ? 'Finanças da Família' : 'Convidar para Família',
      description: hasPartner ? 'Gerenciar conexão familiar' : 'Conectar com cônjuge/parceiro',
      icon: hasPartner ? Users : UserPlus,
      action: () => onNavigate('family'),
      color: 'text-finance-green'
    },
    {
      id: 'accounts',
      title: 'Gerenciar Contas',
      description: 'Contas bancárias e cartões de crédito',
      icon: CreditCard,
      action: () => onNavigate('cards'),
      color: 'text-finance-gold'
    },
    {
      id: 'categories',
      title: 'Gerenciar Categorias',
      description: 'Categorias de despesas pessoais',
      icon: Tags,
      action: () => onNavigate('categories'),
      color: 'text-finance-red'
    },
    {
      id: 'third-parties',
      title: 'Gerenciar Terceiros',
      description: 'Familiares e amigos',
      icon: Users,
      action: () => onNavigate('third-parties'),
      color: 'text-finance-secondary'
    },
    {
      id: 'notifications',
      title: 'Notificações',
      description: 'Lembretes e alertas (em breve)',
      icon: Bell,
      action: () => {}, // Funcionalidade futura
      color: 'text-finance-text-muted',
      disabled: true
    }
  ];

  return (
    <div className="min-h-screen bg-finance-background">
      <div className="p-4 space-y-6 pb-20">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Settings className="h-6 w-6 text-finance-primary" />
            <h2 className="text-2xl font-bold text-finance-secondary">Configurações</h2>
          </div>
          
          {/* Informações do usuário */}
          <Card className="finance-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-finance-primary flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-finance-text">{profile?.name}</h3>
                  <p className="text-sm text-finance-text-muted">
                    {hasPartner ? 'Conectado em família' : 'Conta individual'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Configurações */}
        <div className="space-y-3">
          {settingsItems.map((item) => {
            const Icon = item.icon;
            
            return (
              <Card 
                key={item.id} 
                className={`finance-card transition-all duration-200 ${
                  item.disabled 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:shadow-lg cursor-pointer active:scale-95'
                }`}
                onClick={item.disabled ? undefined : item.action}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Icon className={`h-5 w-5 ${item.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-finance-text">{item.title}</h3>
                        <p className="text-sm text-finance-text-muted">{item.description}</p>
                      </div>
                    </div>
                    {!item.disabled && (
                      <ChevronRight className="h-5 w-5 text-finance-text-muted" />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Seção de Logout */}
        <Card className="finance-card border-l-4 border-finance-red">
          <CardContent className="p-4">
            <Button
              onClick={logout}
              variant="ghost"
              className="w-full flex items-center justify-center gap-2 text-finance-red hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Sair da Conta
            </Button>
          </CardContent>
        </Card>

        {/* Informações do App */}
        <Card className="finance-card">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-finance-text-muted">
              Controle Financeiro Pessoal
            </p>
            <p className="text-xs text-finance-text-muted mt-1">
              Versão 1.0 - Desenvolvido com ❤️
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsScreen;
