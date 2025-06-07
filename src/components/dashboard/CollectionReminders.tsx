
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Users } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ReceivableItem {
  id: string;
  description: string;
  amount: number;
  due_date: string;
  third_party?: {
    name: string;
  };
  type: 'receivable' | 'scheduled_income';
}

const CollectionReminders: React.FC = () => {
  const { user } = useAuth();
  const [receivables, setReceivables] = useState<ReceivableItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadCollectionReminders();
    }
  }, [user]);

  const loadCollectionReminders = async () => {
    try {
      const today = new Date();
      const nextWeek = addDays(today, 7);

      // Buscar dívidas de terceiros com vencimento nos próximos 7 dias
      const { data: receivablesData, error: receivablesError } = await supabase
        .from('receivables')
        .select(`
          id,
          description,
          amount,
          due_date,
          third_parties (
            name
          )
        `)
        .eq('user_id', user?.id)
        .eq('status', 'pending')
        .gte('due_date', today.toISOString().split('T')[0])
        .lte('due_date', nextWeek.toISOString().split('T')[0])
        .order('due_date', { ascending: true });

      // Buscar receitas agendadas com vencimento nos próximos 7 dias
      const { data: scheduledData, error: scheduledError } = await supabase
        .from('scheduled_incomes')
        .select('id, description, amount, expected_date')
        .eq('user_id', user?.id)
        .eq('status', 'pending')
        .gte('expected_date', today.toISOString().split('T')[0])
        .lte('expected_date', nextWeek.toISOString().split('T')[0])
        .order('expected_date', { ascending: true });

      if (receivablesError) {
        console.error('Erro ao carregar recebíveis:', receivablesError);
      }

      if (scheduledError) {
        console.error('Erro ao carregar receitas agendadas:', scheduledError);
      }

      // Combinar e formatar os dados
      const combinedData: ReceivableItem[] = [
        ...(receivablesData || []).map(item => ({
          ...item,
          type: 'receivable' as const,
          third_party: item.third_parties,
        })),
        ...(scheduledData || []).map(item => ({
          ...item,
          due_date: item.expected_date,
          type: 'scheduled_income' as const,
        })),
      ];

      // Ordenar por data de vencimento
      combinedData.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

      setReceivables(combinedData);
    } catch (error) {
      console.error('Erro ao carregar lembretes de cobrança:', error);
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
    return `${diffDays} dias`;
  };

  if (loading) {
    return (
      <Card className="finance-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-finance-text">
            <Bell className="h-5 w-5" />
            Lembretes de Cobrança
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
          <Bell className="h-5 w-5" />
          Lembretes de Cobrança
        </CardTitle>
      </CardHeader>
      <CardContent>
        {receivables.length === 0 ? (
          <p className="text-finance-text-muted text-center py-4">
            Nenhuma cobrança pendente para os próximos dias! 💰
          </p>
        ) : (
          <div className="space-y-3">
            {receivables.slice(0, 5).map((item) => {
              const daysUntil = getDaysUntilDue(item.due_date);
              
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {item.type === 'receivable' && (
                        <Users className="h-4 w-4 text-finance-green" />
                      )}
                      <p className="font-medium text-finance-text text-sm">
                        {item.description}
                      </p>
                    </div>
                    <p className="text-xs text-finance-text-muted">
                      {item.type === 'receivable' && item.third_party && (
                        <span>{item.third_party.name} • </span>
                      )}
                      {formatDate(item.due_date)} • {daysUntil}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-finance-green text-sm">
                      {formatCurrency(item.amount)}
                    </p>
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

export default CollectionReminders;
