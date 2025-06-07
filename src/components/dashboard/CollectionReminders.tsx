
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle, Users } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ReceivableReminder {
  id: string;
  description: string;
  amount: number;
  due_date: string;
  third_party_name: string;
}

const CollectionReminders: React.FC = () => {
  const { user, profile } = useAuth();
  const [receivables, setReceivables] = useState<ReceivableReminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadCollectionReminders();
    }
  }, [user, profile]);

  const loadCollectionReminders = async () => {
    try {
      const today = new Date();
      const nextWeek = addDays(today, 7);

      // Buscar valores a receber com vencimento nos próximos 7 dias
      const userIds = [user?.id];
      if (profile?.linkedUserId) {
        userIds.push(profile.linkedUserId);
      }

      const { data, error } = await supabase
        .from('receivables')
        .select(`
          id,
          description,
          amount,
          due_date,
          third_parties!inner(name)
        `)
        .in('user_id', userIds)
        .eq('status', 'pending')
        .gte('due_date', today.toISOString().split('T')[0])
        .lte('due_date', nextWeek.toISOString().split('T')[0])
        .order('due_date', { ascending: true });

      if (error) {
        console.error('Erro ao carregar lembretes de cobrança:', error);
        return;
      }

      const transformedData = (data || []).map(item => ({
        id: item.id,
        description: item.description,
        amount: item.amount,
        due_date: item.due_date,
        third_party_name: item.third_parties.name
      }));

      setReceivables(transformedData);
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
    if (diffDays < 0) return 'Atrasado';
    return `${diffDays} dias`;
  };

  if (loading) {
    return (
      <Card className="finance-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-finance-text">
            <Users className="h-5 w-5" />
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
          <Users className="h-5 w-5" />
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
            {receivables.slice(0, 5).map((receivable) => {
              const daysUntil = getDaysUntilDue(receivable.due_date);
              const isOverdue = daysUntil === 'Atrasado';
              
              return (
                <div
                  key={receivable.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    isOverdue ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                  }`}
                >
                  <div className="flex-1">
                    <p className="font-medium text-finance-text text-sm">
                      {receivable.description}
                    </p>
                    <p className="text-xs text-finance-text-muted">
                      {receivable.third_party_name} • {formatDate(receivable.due_date)} • {daysUntil}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-finance-green text-sm">
                      {formatCurrency(receivable.amount)}
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

export default CollectionReminders;
