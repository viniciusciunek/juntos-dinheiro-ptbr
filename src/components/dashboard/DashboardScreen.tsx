
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFinance } from '@/contexts/FinanceContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock,
  PieChart,
  Activity
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import UpcomingDueDates from './UpcomingDueDates';
import CollectionReminders from './CollectionReminders';

interface PeriodFilter {
  label: string;
  start: Date;
  end: Date;
}

const DashboardScreen: React.FC = () => {
  const { profile } = useAuth();
  const { transactions, getReceivablesTotal, getScheduledIncomesTotal } = useFinance();
  const [selectedPeriod, setSelectedPeriod] = useState<string>('current');
  const [currentPeriod, setCurrentPeriod] = useState<PeriodFilter>({
    label: 'Mês Atual',
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date())
  });

  const periods: Record<string, PeriodFilter> = {
    current: {
      label: 'Mês Atual',
      start: startOfMonth(new Date()),
      end: endOfMonth(new Date())
    },
    previous: {
      label: 'Mês Anterior',
      start: startOfMonth(subMonths(new Date(), 1)),
      end: endOfMonth(subMonths(new Date(), 1))
    }
  };

  useEffect(() => {
    setCurrentPeriod(periods[selectedPeriod]);
  }, [selectedPeriod]);

  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.transactionDate);
    return transactionDate >= currentPeriod.start && transactionDate <= currentPeriod.end;
  });

  const incomeTransactions = filteredTransactions.filter(t => t.type === 'income');
  const expenseTransactions = filteredTransactions.filter(t => t.type === 'expense');

  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
  const monthBalance = totalIncome - totalExpenses;

  const receivablesTotal = getReceivablesTotal();
  const scheduledIncomesTotal = getScheduledIncomesTotal();
  const totalToReceive = receivablesTotal + scheduledIncomesTotal;

  // Calcular top 5 categorias de despesas
  const expensesByCategory = expenseTransactions.reduce((acc, transaction) => {
    const categoryName = transaction.category?.name || 'Sem categoria';
    acc[categoryName] = (acc[categoryName] || 0) + transaction.amount;
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(expensesByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getRecentTransactions = () => {
    return filteredTransactions
      .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())
      .slice(0, 8);
  };

  return (
    <div className="min-h-screen bg-finance-background">
      <div className="p-4 space-y-6 pb-20">
        {/* Header com saudação */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-finance-secondary">
            Olá, {profile?.name}! 👋
          </h1>
          <p className="text-finance-text-muted">
            Aqui está o resumo das suas finanças
          </p>
        </div>

        {/* Filtro de Período */}
        <Card className="finance-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-finance-text">Período:</h3>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Mês Atual</SelectItem>
                  <SelectItem value="previous">Mês Anterior</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-finance-text-muted mt-2">
              {format(currentPeriod.start, 'dd/MM/yyyy', { locale: ptBR })} - {format(currentPeriod.end, 'dd/MM/yyyy', { locale: ptBR })}
            </p>
          </CardContent>
        </Card>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="finance-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-finance-text-muted">Receitas</p>
                  <p className="text-lg font-bold finance-text-positive">
                    {formatCurrency(totalIncome)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-finance-green" />
              </div>
            </CardContent>
          </Card>

          <Card className="finance-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-finance-text-muted">Despesas</p>
                  <p className="text-lg font-bold finance-text-negative">
                    {formatCurrency(totalExpenses)}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-finance-red" />
              </div>
            </CardContent>
          </Card>

          <Card className="finance-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-finance-text-muted">Saldo do Mês</p>
                  <p className={`text-lg font-bold ${
                    monthBalance >= 0 ? 'finance-text-positive' : 'finance-text-negative'
                  }`}>
                    {formatCurrency(monthBalance)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-finance-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="finance-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-finance-text-muted">A Receber</p>
                  <p className="text-lg font-bold finance-text-accent">
                    {formatCurrency(totalToReceive)}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-finance-gold" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detalhamento do "A Receber" */}
        <Card className="finance-card">
          <CardHeader>
            <CardTitle className="text-finance-text">Detalhamento - A Receber</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-finance-text-muted">Dívidas de Terceiros:</span>
              <span className="font-semibold finance-text-positive">
                {formatCurrency(receivablesTotal)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-finance-text-muted">Receitas Agendadas:</span>
              <span className="font-semibold finance-text-positive">
                {formatCurrency(scheduledIncomesTotal)}
              </span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-finance-text">Total:</span>
                <span className="font-bold text-lg finance-text-accent">
                  {formatCurrency(totalToReceive)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Componentes de Lembrete */}
        <div className="space-y-4">
          <UpcomingDueDates />
          <CollectionReminders />
        </div>

        {/* Top 5 Categorias */}
        {topCategories.length > 0 && (
          <Card className="finance-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-finance-text">
                <PieChart className="h-5 w-5" />
                Top 5 Categorias - Despesas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topCategories.map(([category, amount], index) => {
                  const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
                  
                  return (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-finance-primary" 
                             style={{ opacity: 1 - (index * 0.15) }} />
                        <span className="text-sm text-finance-text">{category}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-finance-text">
                          {formatCurrency(amount)}
                        </p>
                        <p className="text-xs text-finance-text-muted">
                          {percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Últimas Transações */}
        <Card className="finance-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-finance-text">
              <Activity className="h-5 w-5" />
              Últimas Transações
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getRecentTransactions().length === 0 ? (
              <p className="text-finance-text-muted text-center py-4">
                Nenhuma transação no período selecionado
              </p>
            ) : (
              <div className="space-y-3">
                {getRecentTransactions().map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium text-finance-text text-sm">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-finance-text-muted">
                        {format(new Date(transaction.transactionDate), 'dd/MM/yyyy', { locale: ptBR })}
                        {transaction.category && ` • ${transaction.category.name}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold text-sm ${
                        transaction.type === 'income' ? 'finance-text-positive' : 'finance-text-negative'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardScreen;
