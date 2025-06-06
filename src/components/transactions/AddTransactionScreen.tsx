
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useFinance } from '@/contexts/FinanceContext';
import { toast } from '@/hooks/use-toast';

const AddTransactionScreen: React.FC = () => {
  const { 
    bankAccounts, 
    creditCards, 
    thirdParties, 
    categories, 
    addTransaction 
  } = useFinance();
  
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Campos para despesas
  const [paymentSourceType, setPaymentSourceType] = useState<'bank' | 'credit'>('credit');
  const [bankAccountId, setBankAccountId] = useState('');
  const [creditCardId, setCreditCardId] = useState('');
  const [responsibleType, setResponsibleType] = useState<'eu' | 'conjuge' | 'terceiro'>('eu');
  const [thirdPartyId, setThirdPartyId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isInstallment, setIsInstallment] = useState(false);
  const [totalInstallments, setTotalInstallments] = useState('');
  
  // Campos para receitas
  const [source, setSource] = useState('');
  const [recipient, setRecipient] = useState<'eu' | 'conjuge'>('eu');

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setPaymentSourceType('credit');
    setBankAccountId('');
    setCreditCardId('');
    setResponsibleType('eu');
    setThirdPartyId('');
    setCategoryId('');
    setIsInstallment(false);
    setTotalInstallments('');
    setSource('');
    setRecipient('eu');
  };

  const showCategoryField = transactionType === 'expense' && 
    (responsibleType === 'eu' || responsibleType === 'conjuge');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description || !amount || !date) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    if (transactionType === 'expense') {
      // Validar fonte de pagamento
      if (paymentSourceType === 'credit' && !creditCardId) {
        toast({
          title: "Erro",
          description: "Selecione um cartão de crédito.",
          variant: "destructive"
        });
        return;
      }

      if (paymentSourceType === 'bank' && !bankAccountId) {
        toast({
          title: "Erro",
          description: "Selecione uma conta bancária.",
          variant: "destructive"
        });
        return;
      }

      // Validar terceiro
      if (responsibleType === 'terceiro' && !thirdPartyId) {
        toast({
          title: "Erro",
          description: "Selecione o terceiro responsável pela despesa.",
          variant: "destructive"
        });
        return;
      }

      // Validar categoria para gastos pessoais
      if (showCategoryField && !categoryId) {
        toast({
          title: "Erro",
          description: "Selecione uma categoria para este gasto.",
          variant: "destructive"
        });
        return;
      }
    }

    const transactionData: any = {
      description,
      amount: parseFloat(amount),
      date,
      type: transactionType
    };

    if (transactionType === 'expense') {
      transactionData.responsibleType = responsibleType;
      
      // Definir fonte de pagamento
      if (paymentSourceType === 'credit') {
        transactionData.paymentMethod = 'credito';
        transactionData.creditCardId = creditCardId;
      } else {
        transactionData.paymentMethod = 'debito'; // Pode ser débito, PIX ou dinheiro
        transactionData.bankAccountId = bankAccountId;
      }
      
      if (responsibleType === 'terceiro') {
        transactionData.thirdPartyId = thirdPartyId;
      }
      
      // Categoria só para gastos pessoais (eu ou cônjuge)
      if (showCategoryField) {
        transactionData.categoryId = categoryId;
      }
      
      if (isInstallment && totalInstallments) {
        transactionData.isInstallment = true;
        transactionData.currentInstallment = 1;
        transactionData.totalInstallments = parseInt(totalInstallments);
      }
    } else {
      transactionData.source = source;
      transactionData.recipient = recipient;
      transactionData.bankAccountId = bankAccountId; // Receitas sempre vão para uma conta
    }

    try {
      addTransaction(transactionData);
      
      toast({
        title: "Sucesso!",
        description: `${transactionType === 'expense' ? 'Despesa' : 'Receita'} adicionada com sucesso.`,
      });
      
      resetForm();
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-4 space-y-4 pb-20">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Adicionar Transação</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tipo de Transação */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant={transactionType === 'expense' ? 'default' : 'outline'}
                onClick={() => setTransactionType('expense')}
                className="flex-1"
              >
                Despesa
              </Button>
              <Button
                type="button"
                variant={transactionType === 'income' ? 'default' : 'outline'}
                onClick={() => setTransactionType('income')}
                className="flex-1"
              >
                Receita
              </Button>
            </div>

            {/* Campos Comuns */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição *</label>
              <Input
                placeholder="Descrição da transação"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Valor *</label>
              <Input
                type="number"
                step="0.01"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Data *</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            {/* Campos Específicos para Despesas */}
            {transactionType === 'expense' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Paga com *</label>
                  <div className="space-y-3">
                    {/* Seletor de Tipo de Fonte */}
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={paymentSourceType === 'credit' ? 'default' : 'outline'}
                        onClick={() => setPaymentSourceType('credit')}
                        className="flex-1"
                        size="sm"
                      >
                        Cartão de Crédito
                      </Button>
                      <Button
                        type="button"
                        variant={paymentSourceType === 'bank' ? 'default' : 'outline'}
                        onClick={() => setPaymentSourceType('bank')}
                        className="flex-1"
                        size="sm"
                      >
                        Conta Bancária
                      </Button>
                    </div>

                    {/* Dropdown de Cartões */}
                    {paymentSourceType === 'credit' && (
                      <Select value={creditCardId} onValueChange={setCreditCardId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um cartão de crédito" />
                        </SelectTrigger>
                        <SelectContent>
                          {creditCards.map((card) => (
                            <SelectItem key={card.id} value={card.id}>
                              {card.cardName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {/* Dropdown de Contas */}
                    {paymentSourceType === 'bank' && (
                      <Select value={bankAccountId} onValueChange={setBankAccountId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma conta bancária" />
                        </SelectTrigger>
                        <SelectContent>
                          {bankAccounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.accountName} - {account.bankName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Responsável pelo Gasto *</label>
                  <Select value={responsibleType} onValueChange={(value: any) => setResponsibleType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eu">Eu</SelectItem>
                      <SelectItem value="conjuge">Meu Cônjuge</SelectItem>
                      {thirdParties.map((tp) => (
                        <SelectItem key={tp.id} value="terceiro" onClick={() => setThirdPartyId(tp.id)}>
                          {tp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {responsibleType === 'terceiro' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Terceiro *</label>
                    <Select value={thirdPartyId} onValueChange={setThirdPartyId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o terceiro" />
                      </SelectTrigger>
                      <SelectContent>
                        {thirdParties.map((tp) => (
                          <SelectItem key={tp.id} value={tp.id}>
                            {tp.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Campo Categoria - Só aparece para gastos pessoais */}
                {showCategoryField && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Categoria *</label>
                    <Select value={categoryId} onValueChange={setCategoryId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center space-x-2">
                              {category.icon && <span>{category.icon}</span>}
                              <span>{category.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {categories.length === 0 && (
                      <p className="text-xs text-gray-500">
                        Nenhuma categoria cadastrada. Acesse a seção "Categorias" para criar uma.
                      </p>
                    )}
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Switch
                    id="installment"
                    checked={isInstallment}
                    onCheckedChange={setIsInstallment}
                  />
                  <label htmlFor="installment" className="text-sm font-medium">
                    É parcelado?
                  </label>
                </div>

                {isInstallment && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Total de Parcelas</label>
                    <Input
                      type="number"
                      placeholder="Ex: 12"
                      value={totalInstallments}
                      onChange={(e) => setTotalInstallments(e.target.value)}
                    />
                  </div>
                )}
              </>
            )}

            {/* Campos Específicos para Receitas */}
            {transactionType === 'income' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fonte</label>
                  <Input
                    placeholder="Ex: Salário, Freelance, Recebimento"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Recebedor</label>
                  <Select value={recipient} onValueChange={(value: any) => setRecipient(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eu">Eu</SelectItem>
                      <SelectItem value="conjuge">Meu Cônjuge</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Conta de Destino *</label>
                  <Select value={bankAccountId} onValueChange={setBankAccountId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a conta que receberá o dinheiro" />
                    </SelectTrigger>
                    <SelectContent>
                      {bankAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.accountName} - {account.bankName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <Button type="submit" className="w-full gradient-primary">
              Adicionar {transactionType === 'expense' ? 'Despesa' : 'Receita'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddTransactionScreen;
