
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { useFinance } from '@/contexts/FinanceContext';
import { toast } from '@/hooks/use-toast';

interface CreditCardFormProps {
  mode: 'create' | 'edit';
  cardId?: string | null;
  onClose: () => void;
}

const CreditCardForm: React.FC<CreditCardFormProps> = ({ mode, cardId, onClose }) => {
  const { creditCards, addCreditCard, updateCreditCard } = useFinance();
  
  const [formData, setFormData] = useState({
    cardName: '',
    cardBrand: 'visa' as 'visa' | 'mastercard' | 'elo' | 'amex' | 'outra' | '',
    issuer: '',
    closingDay: '',
    dueDay: '',
    cardLimit: '',
    identificationColor: '#DC2626'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === 'edit' && cardId) {
      const card = creditCards.find(c => c.id === cardId);
      if (card) {
        setFormData({
          cardName: card.cardName,
          cardBrand: card.cardBrand || '',
          issuer: card.issuer || '',
          closingDay: card.closingDay.toString(),
          dueDay: card.dueDay.toString(),
          cardLimit: card.cardLimit?.toString() || '',
          identificationColor: card.identificationColor || '#DC2626'
        });
      }
    }
  }, [mode, cardId, creditCards]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.cardName.trim()) {
      newErrors.cardName = 'Nome do cartão é obrigatório';
    }

    if (!formData.closingDay || isNaN(Number(formData.closingDay))) {
      newErrors.closingDay = 'Dia de fechamento é obrigatório';
    } else {
      const day = Number(formData.closingDay);
      if (day < 1 || day > 31) {
        newErrors.closingDay = 'Dia deve estar entre 1 e 31';
      }
    }

    if (!formData.dueDay || isNaN(Number(formData.dueDay))) {
      newErrors.dueDay = 'Dia de vencimento é obrigatório';
    } else {
      const day = Number(formData.dueDay);
      if (day < 1 || day > 31) {
        newErrors.dueDay = 'Dia deve estar entre 1 e 31';
      }
    }

    if (formData.cardLimit && isNaN(Number(formData.cardLimit))) {
      newErrors.cardLimit = 'Limite deve ser um número válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const cardData = {
        cardName: formData.cardName.trim(),
        cardBrand: formData.cardBrand || undefined,
        issuer: formData.issuer.trim() || undefined,
        closingDay: Number(formData.closingDay),
        dueDay: Number(formData.dueDay),
        cardLimit: formData.cardLimit ? Number(formData.cardLimit) : undefined,
        identificationColor: formData.identificationColor
      };

      if (mode === 'create') {
        addCreditCard(cardData);
        toast({
          title: "Sucesso!",
          description: "Cartão de crédito criado com sucesso.",
        });
      } else if (mode === 'edit' && cardId) {
        updateCreditCard(cardId, cardData);
        toast({
          title: "Sucesso!",
          description: "Cartão de crédito atualizado com sucesso.",
        });
      }

      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
    }
  };

  const issuerOptions = [
    'Nubank', 'Inter', 'Itaú', 'Bradesco', 'Banco do Brasil', 'Santander',
    'Caixa', 'BTG Pactual', 'C6 Bank', 'XP Investimentos', 'Original',
    'Next', 'PicPay', 'Neon', 'Outro'
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" onClick={onClose} size="sm">
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold">
          {mode === 'create' ? 'Novo Cartão de Crédito' : 'Editar Cartão de Crédito'}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Cartão</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome do Cartão *</label>
              <Input
                placeholder="Ex: Nubank Ultravioleta, Inter Gold"
                value={formData.cardName}
                onChange={(e) => setFormData(prev => ({ ...prev, cardName: e.target.value }))}
                className={errors.cardName ? 'border-red-500' : ''}
              />
              {errors.cardName && (
                <p className="text-sm text-red-500">{errors.cardName}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Bandeira</label>
                <Select 
                  value={formData.cardBrand} 
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, cardBrand: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a bandeira" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visa">Visa</SelectItem>
                    <SelectItem value="mastercard">Mastercard</SelectItem>
                    <SelectItem value="elo">Elo</SelectItem>
                    <SelectItem value="amex">American Express</SelectItem>
                    <SelectItem value="outra">Outra</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Emissor</label>
                <Select 
                  value={formData.issuer} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, issuer: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o emissor" />
                  </SelectTrigger>
                  <SelectContent>
                    {issuerOptions.map((issuer) => (
                      <SelectItem key={issuer} value={issuer}>
                        {issuer}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Dia de Fechamento *</label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  placeholder="20"
                  value={formData.closingDay}
                  onChange={(e) => setFormData(prev => ({ ...prev, closingDay: e.target.value }))}
                  className={errors.closingDay ? 'border-red-500' : ''}
                />
                {errors.closingDay && (
                  <p className="text-sm text-red-500">{errors.closingDay}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Dia de Vencimento *</label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  placeholder="28"
                  value={formData.dueDay}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDay: e.target.value }))}
                  className={errors.dueDay ? 'border-red-500' : ''}
                />
                {errors.dueDay && (
                  <p className="text-sm text-red-500">{errors.dueDay}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Limite do Cartão</label>
              <Input
                type="number"
                step="0.01"
                placeholder="10000,00"
                value={formData.cardLimit}
                onChange={(e) => setFormData(prev => ({ ...prev, cardLimit: e.target.value }))}
                className={errors.cardLimit ? 'border-red-500' : ''}
              />
              {errors.cardLimit && (
                <p className="text-sm text-red-500">{errors.cardLimit}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Cor de Identificação</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.identificationColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, identificationColor: e.target.value }))}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <span className="text-sm text-gray-600">
                  Esta cor será usada para identificar o cartão visualmente
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                {mode === 'create' ? 'Criar Cartão' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreditCardForm;
