import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useFinance } from '@/contexts/FinanceContext';
import { ArrowLeft, CreditCard } from 'lucide-react';
import PaymentRegistrationForm from './PaymentRegistrationForm';

interface ThirdPartyDetailsProps {
  thirdPartyId: string;
  onBack: () => void;
}

const ThirdPartyDetails: React.FC<ThirdPartyDetailsProps> = ({ thirdPartyId, onBack }) => {
  const { thirdParties, receivables, transactions, getThirdPartyBalance } = useFinance();
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  
  const thirdParty = thirdParties.find(tp => tp.id === thirdPartyId);
  const balance = getThirdPartyBalance(thirdPartyId);
  
  if (!thirdParty) {
    return (
      <div className="p-4">
        <p>Terceiro não encontrado.</p>
        <Button onClick={onBack} variant="outline">Voltar</Button>
      </div>
    );
  }

  const thirdPartyReceivables = receivables.filter(r => r.thirdPartyId === thirdPartyId);
  const pendingReceivables = thirdPartyReceivables.filter(r => r.status !== 'paid');
  const paidReceivables = thirdPartyReceivables.filter(r => r.status === 'paid');

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

  if (showPaymentForm) {
    return (
      <PaymentRegistrationForm
        thirdPartyId={thirdPartyId}
        onBack={() => setShowPaymentForm(false)}
      />
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
        <h1 className="text-2xl font-bold">Detalhes do Terceiro</h1>
      </div>

      {/* Header Card */}
      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={thirdParty.avatar} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg">
                  {thirdParty.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{thirdParty.name}</h2>
                {thirdParty.relationship && (
                  <p className="text-gray-600">{thirdParty.relationship}</p>
                )}
                <Badge 
                  variant={balance > 0 ? "destructive" : "secondary"}
                  className="mt-2 text-lg px-3 py-1"
                >
                  Saldo Devedor: {formatCurrency(balance)}
                </Badge>
              </div>
            </div>
            
            {balance > 0 && (
              <Button
                onClick={() => setShowPaymentForm(true)}
                className="gradient-primary"
                size="lg"
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Registrar Pagamento
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transactions History */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Histórico de Transações</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pending">
                Pendentes ({pendingReceivables.length})
              </TabsTrigger>
              <TabsTrigger value="paid">
                Pagas ({paidReceivables.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending" className="mt-4">
              {pendingReceivables.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Nenhuma dívida pendente.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Valor Total</TableHead>
                      <TableHead>Valor Pendente</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingReceivables.map((receivable) => {
                      const transaction = getTransactionDetails(receivable.transactionId);
                      const pendingAmount = receivable.amount - (receivable.paidAmount || 0);
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
                              receivable.status === 'pending' ? 'destructive' : 'secondary'
                            }>
                              {receivable.status === 'pending' ? 'Pendente' :
                               receivable.status === 'paid' ? 'Pago' : 'Parcial'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
            
            <TabsContent value="paid" className="mt-4">
              {paidReceivables.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Nenhuma dívida paga ainda.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paidReceivables.map((receivable) => {
                      const transaction = getTransactionDetails(receivable.transactionId);
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
                            <Badge variant="secondary">
                              Pago
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThirdPartyDetails;
