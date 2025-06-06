
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFinance } from '@/contexts/FinanceContext';
import { useAuth } from '@/contexts/AuthContext';
import { CreditCard, TrendingUp, TrendingDown, DollarSign, CalendarCheck } from 'lucide-react';

const DashboardScreen: React.FC = () => {
  const { 
    getCurrentMonthExpenses, 
    getCurrentMonthIncome, 
    cards, 
    getCardExpenses,
    receivables,
    thirdParties,
    getCurrentMonthReceivables
  } = useFinance();
  const { user } = useAuth();

  const currentMonthExpenses = getCurrentMonthExpenses();
  const currentMonthIncome = getCurrentMonthIncome();
  const monthlyBalance = currentMonthIncome - currentMonthExpenses;
  const currentMonthReceivables = getCurrentMonthReceivables();

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

      {/* Valores a Receber */}
      {currentMonthReceivables.total > 0 && (
        <Card className="shadow-card border-l-4 border-finance-blue">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-finance-blue">
              <CalendarCheck className="h-5 w-5" />
              Valores a Receber - {new Date().toLocaleDateString('pt-BR', { month: 'long' })}
            </CardTitle>
            <CardDescription>
              Dinheiro esperado para este mês
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-finance-blue mb-3">
              {formatCurrency(currentMonthReceivables.total)}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-finance-orange-light p-3 rounded-lg">
                <div className="font-medium text-finance-orange">Dívidas de Terceiros</div>
                <div className="text-lg font-bold text-finance-orange">
                  {formatCurrency(currentMonthReceivables.thirdPartyDebt)}
                </div>
              </div>
              <div className="bg-finance-blue-light p-3 rounded-lg">
                <div className="font-medium text-finance-blue">Receitas Agendadas</div>
                <div className="text-lg font-bold text-finance-blue">
                  {formatCurrency(currentMonthReceivables.scheduledIncomes)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
            <li>• Agende receitas futuras em "A Receber"</li>
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
