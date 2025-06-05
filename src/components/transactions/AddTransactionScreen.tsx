
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useFinance } from '@/contexts/FinanceContext';
import { toast } from '@/hooks/use-toast';

const AddTransactionScreen: React.FC = () => {
  const { cards, thirdParties, addTransaction } = useFinance();
  
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Campos para despesas
  const [paymentMethod, setPaymentMethod] = useState<'credito' | 'debito' | 'pix' | 'dinheiro'>('credito');
  const [cardId, setCardId] = useState('');
  const [responsibleType, setResponsibleType] = useState<'eu' | 'conjuge' | 'terceiro'>('eu');
  const [thirdPartyId, setThirdPartyId] = useState('');
  const [isInstallment, setIsInstallment] = useState(false);
  const [totalInstallments, setTotalInstallments] = useState('');
  const [category, setCategory] = useState('');
  
  // Campos para receitas
  const [source, setSource] = useState('');
  const [recipient, setRecipient] = useState<'eu' | 'conjuge'>('eu');

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod('credito');
    setCardId('');
    setResponsibleType('eu');
    setThirdPartyId('');
    setIsInstallment(false);
    setTotalInstallments('');
    setCategory('');
    setSource('');
    setRecipient('eu');
  };

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

    if (transactionType === 'expense' && paymentMethod === 'credito' && !cardId) {
      toast({
        title: "Erro",
        description: "Selecione um cartão para pagamentos no crédito.",
        variant: "destructive"
      });
      return;
    }

    if (transactionType === 'expense' && responsibleType === 'terceiro' && !thirdPartyId) {
      toast({
        title: "Erro",
        description: "Selecione o terceiro responsável pela despesa.",
        variant: "destructive"
      });
      return;
    }

    const transactionData: any = {
      description,
      amount: parseFloat(amount),
      date,
      type: transactionType
    };

    if (transactionType === 'expense') {
      transactionData.paymentMethod = paymentMethod;
      transactionData.responsibleType = responsibleType;
      transactionData.category = category;
      
      if (paymentMethod === 'credito') {
        transactionData.cardId = cardId;
      }
      
      if (responsibleType === 'terceiro') {
        transactionData.thirdPartyId = thirdPartyId;
      }
      
      if (isInstallment && totalInstallments) {
        transactionData.isInstallment = true;
        transactionData.currentInstallment = 1;
        transactionData.totalInstallments = parseInt(totalInstallments);
      }
    } else {
      transactionData.source = source;
      transactionData.recipient = recipient;
    }

    addTransaction(transactionData);
    
    toast({
      title: "Sucesso!",
      description: `${transactionType === 'expense' ? 'Despesa' : 'Receita'} adicionada com sucesso.`,
    });
    
    resetForm();
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
                  <label className="text-sm font-medium">Forma de Pagamento</label>
                  <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credito">Crédito</SelectItem>
                      <SelectItem value="debito">Débito</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {paymentMethod === 'credito' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cartão *</label>
                    <Select value={cardId} onValueChange={setCardId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cartão" />
                      </SelectTrigger>
                      <SelectContent>
                        {cards.map((card) => (
                          <SelectItem key={card.id} value={card.id}>
                            {card.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Responsável</label>
                  <Select value={responsibleType} onValueChange={(value: any) => setResponsibleType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eu">Eu</SelectItem>
                      <SelectItem value="conjuge">Meu Cônjuge</SelectItem>
                      <SelectItem value="terceiro">Terceiro</SelectItem>
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

                <div className="space-y-2">
                  <label className="text-sm font-medium">Categoria</label>
                  <Input
                    placeholder="Ex: Alimentação, Transporte, Lazer"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>

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
