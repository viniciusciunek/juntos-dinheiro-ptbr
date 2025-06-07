
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, AlertCircle } from 'lucide-react';
import { format, addDays, isAfter, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DueTransaction {
  id: string;
  description: string;
  amount: number;
  due_date: string;
  type: string;
}

const UpcomingDueDates: React.FC = () => {
  const { user, profile } = useAuth();
  const [transactions, setTransactions] = useState<DueTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUpcomingDueDates();
    }
  }, [user, profile]);

  const loadUpcomingDueDates = async () => {
    try {
      const today = new Date();
      const nextWeek = addDays(today, 7);

      // Buscar transações de despesa com vencimento nos próximos 7 dias
      const userIds = [user?.id];
      if (profile?.linked_user_id) {
        userIds.push(profile.linked_user_id);
      }

      const { data, error } = await supabase
        .from('transactions')
        .select('id, description, amount, due_date, type')
        .in('responsible_person_id', userIds)
        .eq('type', 'expense')
        .eq('status', 'pending')
        .gte('due_date', today.toISOString().split('T')[0])
        .lte('due_date', nextWeek.toISOString().split('T')[0])
        .order('due_date', { ascending: true });

      if (error) {
        console.error('Erro ao carregar vencimentos:', error);
        return;
      }

      setTransactions(data || []);
    } catch (error) {
      console.error('Erro ao carregar vencimentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return format(date, 'dd/MM', { locale: ptBR });
  };

  const getDaysUntilDue = (dueDateString: string) => {
    const today = new Date();
    const dueDate = new Date(dueDateString + 'T00:00:00');
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Amanhã';
    if (diffDays < 0) return 'Atrasado';
    return `${diffDays} dias`;
  };

  if (loading) {
    return (
      <Card className="finance-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-finance-text">
            <Calendar className="h-5 w-5" />
            Próximos Vencimentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-finance-text-muted">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="finance-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-finance-text">
          <Calendar className="h-5 w-5" />
          Próximos Vencimentos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-finance-text-muted text-center py-4">
            Nenhum vencimento próximo! 🎉
          </p>
        ) : (
          <div className="space-y-3">
            {transactions.slice(0, 5).map((transaction) => {
              const daysUntil = getDaysUntilDue(transaction.due_date);
              const isOverdue = daysUntil === 'Atrasado';
              
              return (
                <div
                  key={transaction.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    isOverdue ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex-1">
                    <p className="font-medium text-finance-text text-sm">
                      {transaction.description}
                    </p>
                    <p className={`text-xs ${
                      isOverdue ? 'text-red-600' : 'text-finance-text-muted'
                    }`}>
                      {formatDate(transaction.due_date)} • {daysUntil}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-finance-red text-sm">
                      {formatCurrency(transaction.amount)}
                    </p>
                    {isOverdue && (
                      <AlertCircle className="h-4 w-4 text-red-500 ml-auto" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingDueDates;
