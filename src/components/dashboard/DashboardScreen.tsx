
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFinance } from '@/contexts/FinanceContext';
import { useAuth } from '@/contexts/AuthContext';
import { CreditCard, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

const DashboardScreen: React.FC = () => {
  const { 
    getCurrentMonthExpenses, 
    getCurrentMonthIncome, 
    cards, 
    getCardExpenses,
    receivables,
    thirdParties 
  } = useFinance();
  const { user } = useAuth();

  const currentMonthExpenses = getCurrentMonthExpenses();
  const currentMonthIncome = getCurrentMonthIncome();
  const monthlyBalance = currentMonthIncome - currentMonthExpenses;

  const totalToReceive = receivables
    .filter(r => r.status !== 'pago')
    .reduce((sum, r) => sum + (r.amount - r.paidAmount), 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="p-4 space-y-4 pb-20">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Minhas Finanças</h2>
        <p className="text-gray-500">Resumo do mês atual</p>
      </div>

      {/* Resumo Principal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas do Mês</CardTitle>
            <TrendingUp className="h-4 w-4 text-finance-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-finance-green">
              {formatCurrency(currentMonthIncome)}
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos do Mês</CardTitle>
            <TrendingDown className="h-4 w-4 text-finance-red" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-finance-red">
              {formatCurrency(currentMonthExpenses)}
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo do Mês</CardTitle>
            <DollarSign className={`h-4 w-4 ${monthlyBalance >= 0 ? 'text-finance-green' : 'text-finance-red'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${monthlyBalance >= 0 ? 'text-finance-green' : 'text-finance-red'}`}>
              {formatCurrency(monthlyBalance)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gastos por Cartão */}
      {cards.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Gastos por Cartão (Mês Atual)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cards.map((card) => {
              const expenses = getCardExpenses(card.id);
              return (
                <div key={card.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{card.name}</span>
                  <span className="text-lg font-bold text-finance-red">
                    {formatCurrency(expenses)}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Valores a Receber */}
      {totalToReceive > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-finance-orange">
              💰 Total a Receber: {formatCurrency(totalToReceive)}
            </CardTitle>
            <CardDescription>
              Valores pendentes de terceiros
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {receivables
                .filter(r => r.status !== 'pago')
                .map((receivable) => {
                  const thirdParty = thirdParties.find(tp => tp.id === receivable.thirdPartyId);
                  const pendingAmount = receivable.amount - receivable.paidAmount;
                  
                  return (
                    <div key={receivable.id} className="flex justify-between items-center p-2 border-l-4 border-finance-orange bg-finance-orange-light">
                      <span className="text-sm font-medium">
                        {thirdParty?.name || 'Terceiro'}
                      </span>
                      <span className="text-sm font-bold text-finance-orange">
                        {formatCurrency(pendingAmount)}
                      </span>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dicas e Próximos Passos */}
      <Card className="shadow-card border-l-4 border-finance-blue">
        <CardHeader>
          <CardTitle className="text-finance-blue">💡 Próximos Passos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <ul className="text-sm space-y-1">
            {cards.length === 0 && (
              <li>• Cadastre seus cartões de crédito na aba "Cartões"</li>
            )}
            {thirdParties.length === 0 && (
              <li>• Adicione familiares/amigos na aba "Terceiros"</li>
            )}
            <li>• Use a aba "Adicionar" para registrar suas transações</li>
            {!user?.partnerId && (
              <li>• Convide seu cônjuge em "Configurações" para visão familiar</li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardScreen;
