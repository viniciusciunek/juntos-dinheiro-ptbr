
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Users, ArrowLeft, UserPlus, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FamilyInviteScreenProps {
  onNavigate: (section: string) => void;
}

const FamilyInviteScreen: React.FC<FamilyInviteScreenProps> = ({ onNavigate }) => {
  const { invitePartner, hasPartner, profile } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendInvite = async () => {
    if (!email.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira um e-mail válido.",
        variant: "destructive",
      });
      return;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Erro",
        description: "Por favor, insira um e-mail válido.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const success = await invitePartner(email);
    setIsLoading(false);

    if (success) {
      toast({
        title: "Convite Enviado!",
        description: `Convite enviado para ${email}. Eles receberão uma notificação ao fazer login.`,
      });
      setEmail('');
    } else {
      toast({
        title: "Erro",
        description: "Erro ao enviar convite. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-finance-background">
      <div className="p-4 space-y-6 pb-20">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('settings')}
            className="hover:bg-finance-background"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-finance-primary" />
            <h2 className="text-2xl font-bold text-finance-secondary">Finanças da Família</h2>
          </div>
        </div>

        {hasPartner ? (
          /* Já vinculado */
          <Card className="finance-card border-l-4 border-finance-green">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-finance-green/10 flex items-center justify-center mx-auto">
                  <Users className="h-8 w-8 text-finance-green" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-finance-text">
                    Família Conectada!
                  </h3>
                  <p className="text-finance-text-muted mt-2">
                    Você está vinculado às finanças familiares e pode ver as transações compartilhadas.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Não vinculado - mostrar formulário de convite */
          <>
            <Card className="finance-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-finance-text">
                  <UserPlus className="h-5 w-5" />
                  Convidar para a Família
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-finance-text-muted">
                  Convide seu cônjuge ou parceiro para compartilhar o controle financeiro.
                  Vocês poderão ver as transações um do outro e ter uma visão unificada das finanças.
                </p>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-finance-text">
                    E-mail do cônjuge/parceiro
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="exemplo@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full"
                  />
                </div>

                <Button
                  onClick={handleSendInvite}
                  disabled={isLoading}
                  className="finance-button-primary w-full"
                >
                  {isLoading ? (
                    "Enviando..."
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Enviar Convite
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="finance-card">
              <CardContent className="p-4">
                <h4 className="font-medium text-finance-text mb-2">Como funciona?</h4>
                <ul className="space-y-2 text-sm text-finance-text-muted">
                  <li>• O convite é enviado por e-mail</li>
                  <li>• Eles precisam ter uma conta no app</li>
                  <li>• Após aceitar, vocês compartilharão as finanças</li>
                  <li>• Ambos podem ver e gerenciar as transações</li>
                </ul>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default FamilyInviteScreen;
