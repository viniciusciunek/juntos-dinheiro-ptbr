
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFinance } from '@/contexts/FinanceContext';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

interface ThirdPartyFormProps {
  editingId: string | null;
  onClose: () => void;
}

const ThirdPartyForm: React.FC<ThirdPartyFormProps> = ({ editingId, onClose }) => {
  const { thirdParties, addThirdParty, updateThirdParty } = useFinance();
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [avatar, setAvatar] = useState('');

  const isEditing = editingId !== null;
  const editingThirdParty = isEditing ? thirdParties.find(tp => tp.id === editingId) : null;

  useEffect(() => {
    if (editingThirdParty) {
      setName(editingThirdParty.name);
      setRelationship(editingThirdParty.relationship || '');
      setAvatar(editingThirdParty.avatar || '');
    }
  }, [editingThirdParty]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Erro",
        description: "O nome é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    // Check for unique name (excluding current record when editing)
    const existingThirdParty = thirdParties.find(tp => 
      tp.name.toLowerCase() === name.trim().toLowerCase() && tp.id !== editingId
    );
    
    if (existingThirdParty) {
      toast({
        title: "Erro",
        description: "Já existe um terceiro com este nome.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isEditing) {
        updateThirdParty(editingId, {
          name: name.trim(),
          relationship: relationship.trim() || undefined,
          avatar: avatar.trim() || undefined
        });
        toast({
          title: "Terceiro atualizado",
          description: "Os dados foram atualizados com sucesso.",
        });
      } else {
        addThirdParty({
          name: name.trim(),
          relationship: relationship.trim() || undefined,
          avatar: avatar.trim() || undefined
        });
        toast({
          title: "Terceiro cadastrado",
          description: "O terceiro foi cadastrado com sucesso.",
        });
      }
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-4 pb-20">
      <div className="flex items-center mb-4">
        <Button
          variant="ghost"
          onClick={onClose}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">
          {isEditing ? 'Editar Terceiro' : 'Novo Terceiro'}
        </h1>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>
            {isEditing ? 'Editar informações' : 'Informações do terceiro'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome *</label>
              <Input
                placeholder="Ex: João Silva, Mãe, Cunhada Ana"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Relacionamento</label>
              <Input
                placeholder="Ex: Família, Amigos, Trabalho"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">URL da Foto/Avatar</label>
              <Input
                placeholder="https://exemplo.com/foto.jpg (opcional)"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                type="url"
              />
              <p className="text-xs text-gray-500">
                Cole aqui o link de uma foto para identificação visual.
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="flex-1 gradient-primary"
              >
                {isEditing ? 'Atualizar' : 'Cadastrar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThirdPartyForm;
