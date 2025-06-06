
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useFinance } from '@/contexts/FinanceContext';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

interface PaymentRegistrationFormProps {
  thirdPartyId: string;
  onBack: () => void;
}

const PaymentRegistrationForm: React.FC<PaymentRegistrationFormProps> = ({ thirdPartyId, onBack }) => {
  const { 
    thirdParties, 
    receivables, 
    transactions, 
    bankAccounts, 
    recordPayment 
  } = useFinance();
  
  const [amount, setAmount] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  
  const thirdParty = thirdParties.find(tp => tp.id === thirdPartyId);
  const pendingReceivables = receivables.filter(
    r => r.thirdPartyId === thirdPartyId && r.status !== 'pago'
  );

  const getTransactionDetails = (transactionId: string) => {
    return transactions.find(t => t.id === transactionId);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getTotalPendingAmount = () => {
    return pendingReceivables.reduce((sum, r) => sum + (r.amount - r.paidAmount), 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const paymentAmount = parseFloat(amount);
    
    if (!paymentAmount || paymentAmount <= 0) {
      toast({
        title: "Erro",
        description: "Informe um valor válido para o pagamento.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedAccountId) {
      toast({
        title: "Erro",
        description: "Selecione a conta de destino do pagamento.",
        variant: "destructive"
      });
      return;
    }

    const totalPending = getTotalPendingAmount();
    if (paymentAmount > totalPending) {
      toast({
        title: "Erro",
        description: `O valor informado (${formatCurrency(paymentAmount)}) é maior que o total pendente (${formatCurrency(totalPending)}).`,
        variant: "destructive"
      });
      return;
    }

    // Process payment by oldest receivable first
    let remainingAmount = paymentAmount;
    const sortedReceivables = [...pendingReceivables].sort((a, b) => 
      new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );

    for (const receivable of sortedReceivables) {
      if (remainingAmount <= 0) break;
      
      const pendingForThisReceivable = receivable.amount - receivable.paidAmount;
      const paymentForThis = Math.min(remainingAmount, pendingForThisReceivable);
      
      recordPayment(receivable.id, paymentForThis, selectedAccountId);
      remainingAmount -= paymentForThis;
    }

    toast({
      title: "Pagamento registrado",
      description: `Pagamento de ${formatCurrency(paymentAmount)} registrado com sucesso.`,
    });

    onBack();
  };

  if (!thirdParty) {
    return (
      <div className="p-4">
        <p>Terceiro não encontrado.</p>
        <Button onClick={onBack} variant="outline">Voltar</Button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-20">
      <div className="flex items-center mb-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Registrar Pagamento</h1>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Pagamento de {thirdParty.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <p className="font-medium">Total Pendente: {formatCurrency(getTotalPendingAmount())}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Valor Recebido *</label>
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
              <label className="text-sm font-medium">Conta de Destino *</label>
              <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a conta que recebeu o dinheiro" />
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

            <div className="flex gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onBack}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="flex-1 gradient-primary"
              >
                Registrar Pagamento
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Pending Receivables Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Dívidas Pendentes</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingReceivables.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              Nenhuma dívida pendente.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Pendente</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingReceivables.map((receivable) => {
                  const transaction = getTransactionDetails(receivable.transactionId);
                  const pendingAmount = receivable.amount - receivable.paidAmount;
                  return (
                    <TableRow key={receivable.id}>
                      <TableCell className="font-medium">
                        {transaction?.description || 'Transação não encontrada'}
                      </TableCell>
                      <TableCell>
                        {formatDate(receivable.dueDate)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(receivable.amount)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(pendingAmount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          receivable.status === 'pendente' ? 'destructive' : 'secondary'
                        }>
                          {receivable.status === 'pendente' ? 'Pendente' :
                           receivable.status === 'parcialmente_pago' ? 'Parcial' : 'Pago'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentRegistrationForm;
