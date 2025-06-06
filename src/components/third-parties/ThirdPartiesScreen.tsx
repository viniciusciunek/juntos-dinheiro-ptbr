
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useFinance } from '@/contexts/FinanceContext';
import { Pencil, Trash2, Eye, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import ThirdPartyForm from './ThirdPartyForm';
import ThirdPartyDetails from './ThirdPartyDetails';

const ThirdPartiesScreen: React.FC = () => {
  const { thirdParties, deleteThirdParty, getThirdPartyBalance } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [editingThirdParty, setEditingThirdParty] = useState<string | null>(null);
  const [viewingThirdParty, setViewingThirdParty] = useState<string | null>(null);

  const handleEdit = (id: string) => {
    setEditingThirdParty(id);
    setShowForm(true);
  };

  const handleDelete = (id: string, name: string) => {
    const balance = getThirdPartyBalance(id);
    
    if (balance > 0) {
      toast({
        title: "Não é possível excluir",
        description: `Não é possível excluir '${name}'. Ele(a) possui um saldo devedor de R$ ${balance.toFixed(2)}. Para excluí-lo, primeiro registre o pagamento de todas as pendências através da tela de 'Detalhes'.`,
        variant: "destructive"
      });
      return;
    }

    if (confirm(`Você tem certeza que deseja excluir '${name}'? Todas as suas informações e histórico de transações pagas serão removidos. Esta ação não pode ser desfeita.`)) {
      deleteThirdParty(id);
      toast({
        title: "Terceiro excluído",
        description: `${name} foi excluído com sucesso.`,
      });
    }
  };

  const handleViewDetails = (id: string) => {
    setViewingThirdParty(id);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingThirdParty(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (viewingThirdParty) {
    return (
      <ThirdPartyDetails 
        thirdPartyId={viewingThirdParty} 
        onBack={() => setViewingThirdParty(null)} 
      />
    );
  }

  if (showForm) {
    return (
      <ThirdPartyForm 
        editingId={editingThirdParty} 
        onClose={handleFormClose} 
      />
    );
  }

  return (
    <div className="p-4 space-y-4 pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Terceiros</h1>
        <Button 
          onClick={() => setShowForm(true)}
          className="gradient-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Novo Terceiro
        </Button>
      </div>

      {thirdParties.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500 mb-4">Nenhum terceiro cadastrado ainda.</p>
            <Button 
              onClick={() => setShowForm(true)}
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Primeiro Terceiro
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {thirdParties.map((thirdParty) => {
            const balance = getThirdPartyBalance(thirdParty.id);
            return (
              <Card key={thirdParty.id} className="shadow-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={thirdParty.avatar} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                          {thirdParty.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">{thirdParty.name}</h3>
                        {thirdParty.relationship && (
                          <p className="text-sm text-gray-600">{thirdParty.relationship}</p>
                        )}
                        <Badge 
                          variant={balance > 0 ? "destructive" : "secondary"}
                          className="mt-1"
                        >
                          Saldo Devedor: {formatCurrency(balance)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(thirdParty.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(thirdParty.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(thirdParty.id, thirdParty.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ThirdPartiesScreen;
