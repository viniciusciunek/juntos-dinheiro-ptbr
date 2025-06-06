
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFinance } from '@/contexts/FinanceContext';
import { toast } from '@/hooks/use-toast';
import { Plus, DollarSign, Users, Calendar } from 'lucide-react';
import ScheduledIncomeForm from './ScheduledIncomeForm';
import PaymentModal from './PaymentModal';

const ReceivablesScreen: React.FC = () => {
  const { 
    receivables, 
    thirdParties, 
    scheduledIncomes, 
    getCurrentMonthReceivables 
  } = useFinance();
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [paymentModal, setPaymentModal] = useState<{
    show: boolean;
    type: 'debt' | 'income';
    item: any;
  }>({ show: false, type: 'debt', item: null });

  const currentMonthReceivables = getCurrentMonthReceivables();
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const pendingReceivables = receivables.filter(r => r.status !== 'pago');
  const pendingScheduledIncomes = scheduledIncomes.filter(si => si.status === 'pendente');

  // Group receivables by third party
  const groupedReceivables = pendingReceivables.reduce((acc, receivable) => {
    const thirdParty = thirdParties.find(tp => tp.id === receivable.thirdPartyId);
    const thirdPartyName = thirdParty?.name || 'Terceiro';
    
    if (!acc[thirdPartyName]) {
      acc[thirdPartyName] = [];
    }
    acc[thirdPartyName].push(receivable);
    return acc;
  }, {} as Record<string, typeof receivables>);

  const handleRegisterPayment = (receivable: any) => {
    setPaymentModal({
      show: true,
      type: 'debt',
      item: receivable
    });
  };

  const handleConfirmReceipt = (scheduledIncome: any) => {
    setPaymentModal({
      show: true,
      type: 'income',
      item: scheduledIncome
    });
  };

  if (showIncomeForm) {
    return <ScheduledIncomeForm onClose={() => setShowIncomeForm(false)} />;
  }

  return (
    <div className="p-4 space-y-4 pb-20">
      {/* Header with Summary */}
      <Card className="gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="text-center text-lg font-bold">
            💰 Valores a Receber - {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-finance-green mb-2">
              {formatCurrency(currentMonthReceivables.total)}
            </div>
            <div className="text-sm text-gray-600">Total a Receber no Mês</div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users className="h-4 w-4 text-finance-orange" />
                <span className="text-sm font-medium">Dívidas de Terceiros</span>
              </div>
              <div className="text-lg font-bold text-finance-orange">
                {formatCurrency(currentMonthReceivables.thirdPartyDebt)}
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-finance-blue" />
                <span className="text-sm font-medium">Receitas Agendadas</span>
              </div>
              <div className="text-lg font-bold text-finance-blue">
                {formatCurrency(currentMonthReceivables.scheduledIncomes)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Button */}
      <div className="flex justify-center">
        <Button
          onClick={() => setShowIncomeForm(true)}
          className="gradient-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agendar Nova Receita
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="debts" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="debts">Dívidas de Terceiros</TabsTrigger>
          <TabsTrigger value="scheduled">Receitas Agendadas</TabsTrigger>
        </TabsList>

        <TabsContent value="debts" className="space-y-4">
          {Object.keys(groupedReceivables).length === 0 ? (
            <Card className="shadow-card">
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">
                  Nenhuma dívida de terceiros pendente.
                </p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupedReceivables).map(([thirdPartyName, receivablesList]) => {
              const totalOwed = receivablesList.reduce((sum, r) => sum + (r.amount - r.paidAmount), 0);
              
              return (
                <Card key={thirdPartyName} className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{thirdPartyName}</span>
                      <span className="text-finance-orange font-bold">
                        Total: {formatCurrency(totalOwed)}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {receivablesList.map((receivable) => {
                      const pendingAmount = receivable.amount - receivable.paidAmount;
                      
                      return (
                        <div key={receivable.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium">
                              Valor: {formatCurrency(pendingAmount)}
                            </div>
                            <div className="text-sm text-gray-600">
                              Vence em: {new Date(receivable.dueDate).toLocaleDateString('pt-BR')}
                            </div>
                            {receivable.paidAmount > 0 && (
                              <div className="text-xs text-finance-green">
                                Já pago: {formatCurrency(receivable.paidAmount)}
                              </div>
                            )}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleRegisterPayment(receivable)}
                            className="bg-finance-orange hover:bg-finance-orange/90"
                          >
                            Registrar Pagamento
                          </Button>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          {pendingScheduledIncomes.length === 0 ? (
            <Card className="shadow-card">
              <CardContent className="p-6 text-center">
                <p className="text-gray-500 mb-4">
                  Nenhuma receita agendada pendente.
                </p>
                <Button
                  onClick={() => setShowIncomeForm(true)}
                  className="gradient-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agendar Primeira Receita
                </Button>
              </CardContent>
            </Card>
          ) : (
            pendingScheduledIncomes.map((scheduledIncome) => (
              <Card key={scheduledIncome.id} className="shadow-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{scheduledIncome.description}</h3>
                      <div className="text-lg font-bold text-finance-blue">
                        {formatCurrency(scheduledIncome.amount)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Data esperada: {new Date(scheduledIncome.expectedDate).toLocaleDateString('pt-BR')}
                      </div>
                      {scheduledIncome.notes && (
                        <div className="text-xs text-gray-500 mt-1">
                          {scheduledIncome.notes}
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleConfirmReceipt(scheduledIncome)}
                      className="bg-finance-blue hover:bg-finance-blue/90"
                    >
                      Confirmar Recebimento
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Payment Modal */}
      {paymentModal.show && (
        <PaymentModal
          type={paymentModal.type}
          item={paymentModal.item}
          onClose={() => setPaymentModal({ show: false, type: 'debt', item: null })}
        />
      )}
    </div>
  );
};

export default ReceivablesScreen;
