import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFinance } from '@/contexts/FinanceContext';
import { toast } from '@/hooks/use-toast';
import { X } from 'lucide-react';

interface PaymentModalProps {
  type: 'debt' | 'income';
  item: any;
  onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ type, item, onClose }) => {
  const { bankAccounts, recordPayment, confirmScheduledIncomeReceipt } = useFinance();
  
  const [formData, setFormData] = useState({
    amount: type === 'debt' ? (item.amount - (item.paidAmount || 0)).toString() : item.amount.toString(),
    date: new Date().toISOString().split('T')[0],
    accountId: ''
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Erro",
        description: "O valor deve ser um número maior que zero.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.accountId) {
      toast({
        title: "Erro",
        description: "Selecione uma conta para creditar o valor.",
        variant: "destructive"
      });
      return;
    }

    // Validate amount for debt payments
    if (type === 'debt') {
      const maxAmount = item.amount - (item.paidAmount || 0);
      if (amount > maxAmount) {
        toast({
          title: "Erro",
          description: `O valor não pode ser maior que ${formatCurrency(maxAmount)}.`,
          variant: "destructive"
        });
        return;
      }
    }

    try {
      if (type === 'debt') {
        recordPayment(item.id, amount, formData.accountId);
        toast({
          title: "Pagamento registrado",
          description: `Pagamento de ${formatCurrency(amount)} registrado com sucesso.`,
        });
      } else {
        confirmScheduledIncomeReceipt(item.id, amount, formData.date, formData.accountId);
        toast({
          title: "Recebimento confirmado",
          description: `Recebimento de ${formatCurrency(amount)} confirmado com sucesso.`,
        });
      }
      
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao processar o pagamento. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const maxAmount = type === 'debt' ? item.amount - (item.paidAmount || 0) : item.amount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {type === 'debt' ? 'Registrar Pagamento' : 'Confirmar Recebimento'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="font-medium">
              {type === 'debt' ? 'Dívida' : 'Receita'}: {item.description || 'Pagamento de terceiro'}
            </div>
            <div className="text-sm text-gray-600">
              Valor {type === 'debt' ? 'pendente' : 'total'}: {formatCurrency(maxAmount)}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="amount">Valor Recebido (R$) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                max={maxAmount}
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                required
              />
              {type === 'debt' && (
                <div className="text-xs text-gray-500 mt-1">
                  Máximo: {formatCurrency(maxAmount)}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="date">Data do Recebimento *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="account">Creditar na Conta *</Label>
              <Select onValueChange={(value) => handleChange('accountId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma conta" />
                </SelectTrigger>
                <SelectContent>
                  {bankAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.accountName} - {account.bankName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {bankAccounts.length === 0 && (
                <div className="text-xs text-red-500 mt-1">
                  Você precisa cadastrar pelo menos uma conta bancária primeiro.
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
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
                disabled={bankAccounts.length === 0}
              >
                {type === 'debt' ? 'Registrar Pagamento' : 'Confirmar Recebimento'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentModal;
