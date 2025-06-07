
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

export interface Transaction {
  id: string;
  userId: string;
  accountId?: string;
  creditCardId?: string;
  categoryId?: string;
  thirdPartyId?: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  transactionDate: string;
  dueDate?: string;
  responsiblePersonId?: string;
  installments?: number;
  currentInstallment?: number;
  parentTransactionId?: string;
  status: 'completed' | 'pending' | 'paid';
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    icon?: string;
    color?: string;
  };
  thirdParty?: {
    id: string;
    name: string;
    relationship: string;
  };
  account?: {
    id: string;
    name: string;
    type: string;
  };
  creditCard?: {
    id: string;
    name: string;
    bank: string;
  };
}

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreditCard {
  id: string;
  userId: string;
  name: string;
  bank: string;
  limitAmount: number;
  closingDay: number;
  dueDay: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  icon?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ThirdParty {
  id: string;
  userId: string;
  name: string;
  relationship: string;
  createdAt: string;
  updatedAt: string;
}

export interface Receivable {
  id: string;
  userId: string;
  thirdPartyId: string;
  transactionId?: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid';
  createdAt: string;
  updatedAt: string;
  thirdParty?: ThirdParty;
}

export interface ScheduledIncome {
  id: string;
  userId: string;
  description: string;
  amount: number;
  expectedDate: string;
  notes?: string;
  status: 'pending' | 'received';
  createdAt: string;
  updatedAt: string;
}

interface FinanceContextType {
  transactions: Transaction[];
  accounts: Account[];
  creditCards: CreditCard[];
  categories: Category[];
  thirdParties: ThirdParty[];
  receivables: Receivable[];
  scheduledIncomes: ScheduledIncome[];
  loading: boolean;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addAccount: (account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateAccount: (id: string, updates: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  addCreditCard: (creditCard: Omit<CreditCard, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCreditCard: (id: string, updates: Partial<CreditCard>) => Promise<void>;
  deleteCreditCard: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addThirdParty: (thirdParty: Omit<ThirdParty, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateThirdParty: (id: string, updates: Partial<ThirdParty>) => Promise<void>;
  deleteThirdParty: (id: string) => Promise<void>;
  addReceivable: (receivable: Omit<Receivable, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateReceivable: (id: string, updates: Partial<Receivable>) => Promise<void>;
  deleteReceivable: (id: string) => Promise<void>;
  addScheduledIncome: (scheduledIncome: Omit<ScheduledIncome, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateScheduledIncome: (id: string, updates: Partial<ScheduledIncome>) => Promise<void>;
  deleteScheduledIncome: (id: string) => Promise<void>;
  getReceivablesTotal: () => number;
  getScheduledIncomesTotal: () => number;
  refreshData: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

interface FinanceProviderProps {
  children: ReactNode;
}

export const FinanceProvider: React.FC<FinanceProviderProps> = ({ children }) => {
  const { user, profile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [thirdParties, setThirdParties] = useState<ThirdParty[]>([]);
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [scheduledIncomes, setScheduledIncomes] = useState<ScheduledIncome[]>([]);
  const [loading, setLoading] = useState(true);

  const getUserIds = () => {
    const ids = [user?.id];
    if (profile?.linkedUserId) {
      ids.push(profile.linkedUserId);
    }
    return ids.filter(Boolean) as string[];
  };

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userIds = getUserIds();

      // Load transactions with related data
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select(`
          *,
          categories(id, name, icon, color),
          third_parties(id, name, relationship),
          accounts(id, name, type),
          credit_cards(id, name, bank)
        `)
        .in('user_id', userIds);

      if (transactionsError) throw transactionsError;

      // Transform the data to match our interface
      const transformedTransactions: Transaction[] = (transactionsData || []).map(t => ({
        id: t.id,
        userId: t.user_id,
        accountId: t.account_id,
        creditCardId: t.credit_card_id,
        categoryId: t.category_id,
        thirdPartyId: t.third_party_id,
        description: t.description,
        amount: t.amount,
        type: t.type,
        transactionDate: t.transaction_date,
        dueDate: t.due_date,
        responsiblePersonId: t.responsible_person_id,
        installments: t.installments,
        currentInstallment: t.current_installment,
        parentTransactionId: t.parent_transaction_id,
        status: t.status,
        createdAt: t.created_at,
        updatedAt: t.updated_at,
        category: t.categories ? {
          id: t.categories.id,
          name: t.categories.name,
          icon: t.categories.icon,
          color: t.categories.color
        } : undefined,
        thirdParty: t.third_parties ? {
          id: t.third_parties.id,
          name: t.third_parties.name,
          relationship: t.third_parties.relationship
        } : undefined,
        account: t.accounts ? {
          id: t.accounts.id,
          name: t.accounts.name,
          type: t.accounts.type
        } : undefined,
        creditCard: t.credit_cards ? {
          id: t.credit_cards.id,
          name: t.credit_cards.name,
          bank: t.credit_cards.bank
        } : undefined
      }));

      setTransactions(transformedTransactions);

      // Load other data in parallel
      const [
        { data: accountsData },
        { data: creditCardsData },
        { data: categoriesData },
        { data: thirdPartiesData },
        { data: receivablesData },
        { data: scheduledIncomesData }
      ] = await Promise.all([
        supabase.from('accounts').select('*').in('user_id', userIds),
        supabase.from('credit_cards').select('*').in('user_id', userIds),
        supabase.from('categories').select('*').in('user_id', userIds),
        supabase.from('third_parties').select('*').in('user_id', userIds),
        supabase.from('receivables').select('*, third_parties(*)').in('user_id', userIds),
        supabase.from('scheduled_incomes').select('*').in('user_id', userIds)
      ]);

      // Transform data to camelCase
      setAccounts((accountsData || []).map(transformSnakeToCamel));
      setCreditCards((creditCardsData || []).map(transformSnakeToCamel));
      setCategories((categoriesData || []).map(transformSnakeToCamel));
      setThirdParties((thirdPartiesData || []).map(transformSnakeToCamel));
      setReceivables((receivablesData || []).map(r => ({
        ...transformSnakeToCamel(r),
        thirdParty: r.third_parties ? transformSnakeToCamel(r.third_parties) : undefined
      })));
      setScheduledIncomes((scheduledIncomesData || []).map(transformSnakeToCamel));

    } catch (error) {
      console.error('Error loading finance data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to transform snake_case to camelCase
  const transformSnakeToCamel = (obj: any): any => {
    const transformed: any = {};
    for (const key in obj) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      transformed[camelKey] = obj[key];
    }
    return transformed;
  };

  // Helper function to transform camelCase to snake_case
  const transformCamelToSnake = (obj: any): any => {
    const transformed: any = {};
    for (const key in obj) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      transformed[snakeKey] = obj[key];
    }
    return transformed;
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, profile]);

  const getReceivablesTotal = () => {
    return receivables
      .filter(r => r.status === 'pending')
      .reduce((sum, r) => sum + r.amount, 0);
  };

  const getScheduledIncomesTotal = () => {
    return scheduledIncomes
      .filter(s => s.status === 'pending')
      .reduce((sum, s) => sum + s.amount, 0);
  };

  // CRUD operations would be implemented here
  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { error } = await supabase
      .from('transactions')
      .insert([transformCamelToSnake(transaction)]);
    
    if (error) throw error;
    await loadData();
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    const { error } = await supabase
      .from('transactions')
      .update(transformCamelToSnake(updates))
      .eq('id', id);
    
    if (error) throw error;
    await loadData();
  };

  const deleteTransaction = async (id: string) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    await loadData();
  };

  // Similar CRUD operations for other entities...
  const addAccount = async (account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { error } = await supabase
      .from('accounts')
      .insert([transformCamelToSnake(account)]);
    
    if (error) throw error;
    await loadData();
  };

  const updateAccount = async (id: string, updates: Partial<Account>) => {
    const { error } = await supabase
      .from('accounts')
      .update(transformCamelToSnake(updates))
      .eq('id', id);
    
    if (error) throw error;
    await loadData();
  };

  const deleteAccount = async (id: string) => {
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    await loadData();
  };

  const addCreditCard = async (creditCard: Omit<CreditCard, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { error } = await supabase
      .from('credit_cards')
      .insert([transformCamelToSnake(creditCard)]);
    
    if (error) throw error;
    await loadData();
  };

  const updateCreditCard = async (id: string, updates: Partial<CreditCard>) => {
    const { error } = await supabase
      .from('credit_cards')
      .update(transformCamelToSnake(updates))
      .eq('id', id);
    
    if (error) throw error;
    await loadData();
  };

  const deleteCreditCard = async (id: string) => {
    const { error } = await supabase
      .from('credit_cards')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    await loadData();
  };

  const addCategory = async (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { error } = await supabase
      .from('categories')
      .insert([transformCamelToSnake(category)]);
    
    if (error) throw error;
    await loadData();
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    const { error } = await supabase
      .from('categories')
      .update(transformCamelToSnake(updates))
      .eq('id', id);
    
    if (error) throw error;
    await loadData();
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    await loadData();
  };

  const addThirdParty = async (thirdParty: Omit<ThirdParty, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { error } = await supabase
      .from('third_parties')
      .insert([transformCamelToSnake(thirdParty)]);
    
    if (error) throw error;
    await loadData();
  };

  const updateThirdParty = async (id: string, updates: Partial<ThirdParty>) => {
    const { error } = await supabase
      .from('third_parties')
      .update(transformCamelToSnake(updates))
      .eq('id', id);
    
    if (error) throw error;
    await loadData();
  };

  const deleteThirdParty = async (id: string) => {
    const { error } = await supabase
      .from('third_parties')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    await loadData();
  };

  const addReceivable = async (receivable: Omit<Receivable, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { error } = await supabase
      .from('receivables')
      .insert([transformCamelToSnake(receivable)]);
    
    if (error) throw error;
    await loadData();
  };

  const updateReceivable = async (id: string, updates: Partial<Receivable>) => {
    const { error } = await supabase
      .from('receivables')
      .update(transformCamelToSnake(updates))
      .eq('id', id);
    
    if (error) throw error;
    await loadData();
  };

  const deleteReceivable = async (id: string) => {
    const { error } = await supabase
      .from('receivables')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    await loadData();
  };

  const addScheduledIncome = async (scheduledIncome: Omit<ScheduledIncome, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { error } = await supabase
      .from('scheduled_incomes')
      .insert([transformCamelToSnake(scheduledIncome)]);
    
    if (error) throw error;
    await loadData();
  };

  const updateScheduledIncome = async (id: string, updates: Partial<ScheduledIncome>) => {
    const { error } = await supabase
      .from('scheduled_incomes')
      .update(transformCamelToSnake(updates))
      .eq('id', id);
    
    if (error) throw error;
    await loadData();
  };

  const deleteScheduledIncome = async (id: string) => {
    const { error } = await supabase
      .from('scheduled_incomes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    await loadData();
  };

  const refreshData = async () => {
    await loadData();
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        accounts,
        creditCards,
        categories,
        thirdParties,
        receivables,
        scheduledIncomes,
        loading,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addAccount,
        updateAccount,
        deleteAccount,
        addCreditCard,
        updateCreditCard,
        deleteCreditCard,
        addCategory,
        updateCategory,
        deleteCategory,
        addThirdParty,
        updateThirdParty,
        deleteThirdParty,
        addReceivable,
        updateReceivable,
        deleteReceivable,
        addScheduledIncome,
        updateScheduledIncome,
        deleteScheduledIncome,
        getReceivablesTotal,
        getScheduledIncomesTotal,
        refreshData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = (): FinanceContextType => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
