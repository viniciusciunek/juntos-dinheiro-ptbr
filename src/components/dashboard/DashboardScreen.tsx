
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFinance } from '@/contexts/FinanceContext';
import { useAuth } from '@/contexts/AuthContext';
import { TrendingUp, TrendingDown, DollarSign, CalendarCheck, Eye } from 'lucide-react';

const DashboardScreen: React.FC = () => {
  const { 
    transactions,
    getCurrentMonthExpenses, 
    getCurrentMonthIncome, 
    getCurrentMonthReceivables,
    categories
  } = useFinance();
  const { user } = useAuth();

  const [selectedPeriod, setSelectedPeriod] = useState('current');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getMonthData = (period: string) => {
    const currentDate = new Date();
    let targetMonth = '';
    let displayName = '';

    switch (period) {
      case 'current':
        targetMonth = currentDate.toISOString().substring(0, 7);
        displayName = 'Mês Atual';
        break;
      case 'previous':
        const prevDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
        targetMonth = prevDate.toISOString().substring(0, 7);
        displayName = 'Mês Anterior';
        break;
      default:
        targetMonth = period;
        const [year, month] = period.split('-');
        displayName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('pt-BR', { 
          month: 'long', 
          year: 'numeric' 
        });
    }

    // Calcular dados para o período selecionado
    const periodIncome = transactions
      .filter(t => t.type === 'income' && t.date.startsWith(targetMonth) && t.recipient === 'eu')
      .reduce((sum, t) => sum + t.amount, 0);

    const periodExpenses = transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(targetMonth) && t.responsibleType === 'eu')
      .reduce((sum, t) => sum + t.amount, 0);

    const periodBalance = periodIncome - periodExpenses;

    // Para valores a receber, usar sempre o mês atual como referência
    const currentMonthReceivables = getCurrentMonthReceivables();

    // Top categorias do período
    const categoryExpenses = categories.map(category => {
      const total = transactions
        .filter(t => 
          t.type === 'expense' && 
          t.categoryId === category.id && 
          t.date.startsWith(targetMonth) &&
          t.responsibleType === 'eu'
        )
        .reduce((sum, t) => sum + t.amount, 0);
      
      return { ...category, total };
    }).filter(c => c.total > 0).sort((a, b) => b.total - a.total).slice(0, 5);

    // Últimas transações do período
    const recentTransactions = transactions
      .filter(t => t.date.startsWith(targetMonth))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    return {
      displayName,
      income: periodIncome,
      expenses: periodExpenses,
      balance: periodBalance,
      receivables: currentMonthReceivables.total,
      categoryExpenses,
      recentTransactions
    };
  };

  const monthData = getMonthData(selectedPeriod);

  // Gerar opções de meses para o seletor
  const generateMonthOptions = () => {
    const options = [
      { value: 'current', label: 'Mês Atual' },
      { value: 'previous', label: 'Mês Anterior' }
    ];

    // Adicionar últimos 12 meses
    const currentDate = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i);
      const value = date.toISOString().substring(0, 7);
      const label = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      
      if (!options.find(opt => opt.value === value)) {
        options.push({ value, label });
      }
    }

    return options;
  };

  return (
    <div className="min-h-screen bg-finance-background">
      <div className="p-4 space-y-6 pb-20">
        {/* Header com filtro de período */}
        <div className="text-center space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-finance-secondary">Meu Dashboard Financeiro</h2>
            <p className="text-finance-text-muted">Visão geral da sua situação financeira</p>
          </div>
          
          <div className="flex justify-center">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-64 finance-card">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                {generateMonthOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <p className="text-sm text-finance-text-muted">
            Exibindo dados de: {monthData.displayName}
          </p>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="finance-card border-l-4 border-finance-green">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-finance-text">Receitas</CardTitle>
              <TrendingUp className="h-4 w-4 text-finance-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold finance-text-positive">
                {formatCurrency(monthData.income)}
              </div>
              <p className="text-xs text-finance-text-muted">
                No período selecionado
              </p>
            </CardContent>
          </Card>

          <Card className="finance-card border-l-4 border-finance-red">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-finance-text">Despesas</CardTitle>
              <TrendingDown className="h-4 w-4 text-finance-red" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold finance-text-negative">
                {formatCurrency(monthData.expenses)}
              </div>
              <p className="text-xs text-finance-text-muted">
                Gastos pessoais no período
              </p>
            </CardContent>
          </Card>

          <Card className="finance-card border-l-4 border-finance-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-finance-text">Saldo do Período</CardTitle>
              <DollarSign className={`h-4 w-4 ${monthData.balance >= 0 ? 'text-finance-green' : 'text-finance-red'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${monthData.balance >= 0 ? 'finance-text-positive' : 'finance-text-negative'}`}>
                {formatCurrency(monthData.balance)}
              </div>
              <p className="text-xs text-finance-text-muted">
                Receitas - Despesas
              </p>
            </CardContent>
          </Card>

          <Card className="finance-card border-l-4 border-finance-gold">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-finance-text">A Receber</CardTitle>
              <CalendarCheck className="h-4 w-4 text-finance-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold finance-text-accent">
                {formatCurrency(monthData.receivables)}
              </div>
              <p className="text-xs text-finance-text-muted">
                Valores previstos (mês atual)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Top Categorias */}
        {monthData.categoryExpenses.length > 0 && (
          <Card className="finance-card">
            <CardHeader>
              <CardTitle className="text-finance-secondary">Top Categorias - {monthData.displayName}</CardTitle>
              <CardDescription>Maiores gastos por categoria no período</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {monthData.categoryExpenses.map((category, index) => (
                <div key={category.id} className="flex items-center justify-between p-3 bg-finance-background rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-finance-primary-light text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    {category.icon && <span className="text-lg">{category.icon}</span>}
                    <span className="font-medium text-finance-text">{category.name}</span>
                  </div>
                  <span className="text-lg font-bold finance-text-negative">
                    {formatCurrency(category.total)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Últimas Transações */}
        {monthData.recentTransactions.length > 0 && (
          <Card className="finance-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-finance-secondary">
                <Eye className="h-5 w-5" />
                Últimas Transações - {monthData.displayName}
              </CardTitle>
              <CardDescription>Atividade recente no período selecionado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {monthData.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-finance-background rounded-lg border-l-4" 
                     style={{ borderLeftColor: transaction.type === 'income' ? '#2E7D32' : '#C62828' }}>
                  <div className="flex-1">
                    <div className="font-medium text-finance-text">{transaction.description}</div>
                    <div className="text-sm text-finance-text-muted">
                      {new Date(transaction.date).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${transaction.type === 'income' ? 'finance-text-positive' : 'finance-text-negative'}`}>
                    {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Dicas para novos usuários */}
        {monthData.recentTransactions.length === 0 && (
          <Card className="finance-card border-l-4 border-finance-gold">
            <CardHeader>
              <CardTitle className="text-finance-gold">💡 Primeiros Passos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <ul className="text-sm space-y-1 text-finance-text-muted">
                <li>• Configure suas contas e cartões na seção "Cartões"</li>
                <li>• Cadastre categorias para organizar seus gastos</li>
                <li>• Adicione familiares/amigos na aba "Terceiros"</li>
                <li>• Comece registrando suas transações usando o botão "+"</li>
                <li>• Agende receitas futuras em "A Receber"</li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DashboardScreen;
