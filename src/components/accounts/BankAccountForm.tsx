
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { useFinance } from '@/contexts/FinanceContext';
import { toast } from '@/hooks/use-toast';

interface BankAccountFormProps {
  mode: 'create' | 'edit';
  accountId?: string | null;
  onClose: () => void;
}

const BankAccountForm: React.FC<BankAccountFormProps> = ({ mode, accountId, onClose }) => {
  const { bankAccounts, addBankAccount, updateBankAccount } = useFinance();
  
  const [formData, setFormData] = useState({
    accountName: '',
    bankName: '',
    accountType: 'conta_corrente' as 'conta_corrente' | 'conta_poupanca' | 'conta_pagamentos' | 'outra',
    initialBalance: '',
    initialBalanceDate: new Date().toISOString().split('T')[0],
    identificationColor: '#3B82F6'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === 'edit' && accountId) {
      const account = bankAccounts.find(acc => acc.id === accountId);
      if (account) {
        setFormData({
          accountName: account.accountName,
          bankName: account.bankName,
          accountType: account.accountType,
          initialBalance: account.initialBalance.toString(),
          initialBalanceDate: account.initialBalanceDate,
          identificationColor: account.identificationColor || '#3B82F6'
        });
      }
    }
  }, [mode, accountId, bankAccounts]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.accountName.trim()) {
      newErrors.accountName = 'Nome da conta é obrigatório';
    }

    if (!formData.bankName.trim()) {
      newErrors.bankName = 'Nome do banco é obrigatório';
    }

    if (!formData.initialBalance || isNaN(Number(formData.initialBalance))) {
      newErrors.initialBalance = 'Saldo inicial deve ser um número válido';
    }

    if (!formData.initialBalanceDate) {
      newErrors.initialBalanceDate = 'Data do saldo inicial é obrigatória';
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
      const accountData = {
        accountName: formData.accountName.trim(),
        bankName: formData.bankName.trim(),
        accountType: formData.accountType,
        initialBalance: Number(formData.initialBalance),
        initialBalanceDate: formData.initialBalanceDate,
        identificationColor: formData.identificationColor
      };

      if (mode === 'create') {
        addBankAccount(accountData);
        toast({
          title: "Sucesso!",
          description: "Conta bancária criada com sucesso.",
        });
      } else if (mode === 'edit' && accountId) {
        updateBankAccount(accountId, accountData);
        toast({
          title: "Sucesso!",
          description: "Conta bancária atualizada com sucesso.",
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

  const bankOptions = [
    'Banco do Brasil', 'Bradesco', 'Caixa Econômica Federal', 'Itaú',
    'Nubank', 'Inter', 'Santander', 'BTG Pactual', 'C6 Bank',
    'PicPay', 'Next', 'Neon', 'Original', 'XP Investimentos', 'Outro'
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" onClick={onClose} size="sm">
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold">
          {mode === 'create' ? 'Nova Conta Bancária' : 'Editar Conta Bancária'}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Conta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome da Conta *</label>
              <Input
                placeholder="Ex: Conta Corrente BB, Conta Poupança Inter"
                value={formData.accountName}
                onChange={(e) => setFormData(prev => ({ ...prev, accountName: e.target.value }))}
                className={errors.accountName ? 'border-red-500' : ''}
              />
              {errors.accountName && (
                <p className="text-sm text-red-500">{errors.accountName}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Nome do Banco *</label>
              <Select 
                value={formData.bankName} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, bankName: value }))}
              >
                <SelectTrigger className={errors.bankName ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione o banco" />
                </SelectTrigger>
                <SelectContent>
                  {bankOptions.map((bank) => (
                    <SelectItem key={bank} value={bank}>
                      {bank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.bankName && (
                <p className="text-sm text-red-500">{errors.bankName}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Conta *</label>
              <Select 
                value={formData.accountType} 
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, accountType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conta_corrente">Conta Corrente</SelectItem>
                  <SelectItem value="conta_poupanca">Conta Poupança</SelectItem>
                  <SelectItem value="conta_pagamentos">Conta de Pagamentos</SelectItem>
                  <SelectItem value="outra">Outra</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Saldo Inicial *</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.initialBalance}
                  onChange={(e) => setFormData(prev => ({ ...prev, initialBalance: e.target.value }))}
                  className={errors.initialBalance ? 'border-red-500' : ''}
                  disabled={mode === 'edit'}
                />
                {errors.initialBalance && (
                  <p className="text-sm text-red-500">{errors.initialBalance}</p>
                )}
                {mode === 'edit' && (
                  <p className="text-xs text-gray-500">O saldo inicial não pode ser alterado após a criação</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Data do Saldo Inicial *</label>
                <Input
                  type="date"
                  value={formData.initialBalanceDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, initialBalanceDate: e.target.value }))}
                  className={errors.initialBalanceDate ? 'border-red-500' : ''}
                  disabled={mode === 'edit'}
                />
                {errors.initialBalanceDate && (
                  <p className="text-sm text-red-500">{errors.initialBalanceDate}</p>
                )}
                {mode === 'edit' && (
                  <p className="text-xs text-gray-500">A data do saldo inicial não pode ser alterada após a criação</p>
                )}
              </div>
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
                  Esta cor será usada para identificar a conta visualmente
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                {mode === 'create' ? 'Criar Conta' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BankAccountForm;
