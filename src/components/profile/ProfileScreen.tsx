
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { User, Lock, ArrowLeft, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProfileScreenProps {
  onNavigate: (section: string) => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onNavigate }) => {
  const { user, profile, updateProfile, changePassword } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Estados para edição de perfil
  const [name, setName] = useState(profile?.name || '');
  
  // Estados para mudança de senha
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      toast({
        title: "Erro",
        description: "O nome não pode estar vazio.",
        variant: "destructive",
      });
      return;
    }

    const success = await updateProfile(name.trim());
    if (success) {
      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!",
      });
      setIsEditing(false);
    } else {
      toast({
        title: "Erro",
        description: "Erro ao atualizar perfil. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Erro",
        description: "Todos os campos de senha são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "A nova senha e a confirmação não coincidem.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A nova senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    const success = await changePassword(currentPassword, newPassword);
    if (success) {
      toast({
        title: "Sucesso",
        description: "Senha alterada com sucesso!",
      });
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      toast({
        title: "Erro",
        description: "Erro ao alterar senha. Verifique a senha atual.",
        variant: "destructive",
      });
    }
  };

  const cancelEdit = () => {
    setName(profile?.name || '');
    setIsEditing(false);
  };

  const cancelPasswordChange = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsChangingPassword(false);
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
            <User className="h-6 w-6 text-finance-primary" />
            <h2 className="text-2xl font-bold text-finance-secondary">Meu Perfil</h2>
          </div>
        </div>

        {/* Informações Básicas */}
        <Card className="finance-card">
          <CardHeader>
            <CardTitle className="text-finance-text">Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Email (não editável) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-finance-text">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-gray-50 text-finance-text-muted"
              />
            </div>

            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-finance-text">Nome</Label>
              {isEditing ? (
                <div className="flex gap-2">
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    onClick={handleUpdateProfile}
                    className="finance-button-success px-3"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={cancelEdit}
                    className="px-3"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    id="name"
                    type="text"
                    value={profile?.name || ''}
                    disabled
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                  >
                    Editar
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Alterar Senha */}
        <Card className="finance-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-finance-text">
              <Lock className="h-5 w-5" />
              Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isChangingPassword ? (
              <Button
                onClick={() => setIsChangingPassword(true)}
                variant="outline"
                className="w-full"
              >
                Alterar Senha
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-finance-text">
                    Senha Atual
                  </Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-finance-text">
                    Nova Senha
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-finance-text">
                    Confirmar Nova Senha
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleChangePassword}
                    className="finance-button-primary flex-1"
                  >
                    Alterar Senha
                  </Button>
                  <Button
                    variant="outline"
                    onClick={cancelPasswordChange}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileScreen;
