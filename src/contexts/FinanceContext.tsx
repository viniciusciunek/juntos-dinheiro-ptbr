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
    accountName: string;
    accountType: string;
  };
  creditCard?: {
    id: string;
    cardName: string;
    bankName: string;
  };
}

export interface BankAccount {
  id: string;
  userId: string;
  accountName: string;
  bankName: string;
  accountType: 'conta_corrente' | 'conta_poupanca' | 'conta_pagamentos' | 'outra';
  initialBalance: number;
  initialBalanceDate: string;
  identificationColor?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreditCard {
  id: string;
  userId: string;
  cardName: string;
  cardBrand?: 'visa' | 'mastercard' | 'elo' | 'amex' | 'outra';
  issuer?: string;
  closingDay: number;
  dueDay: number;
  cardLimit?: number;
  identificationColor?: string;
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
  avatar?: string;
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
  paidAmount?: number;
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
  bankAccounts: BankAccount[];
  creditCards: CreditCard[];
  categories: Category[];
  thirdParties: ThirdParty[];
  receivables: Receivable[];
  scheduledIncomes: ScheduledIncome[];
  loading: boolean;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addBankAccount: (account: Omit<BankAccount, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<void>;
  updateBankAccount: (id: string, updates: Partial<BankAccount>) => Promise<void>;
  deleteBankAccount: (id: string) => boolean;
  addCreditCard: (creditCard: Omit<CreditCard, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<void>;
  updateCreditCard: (id: string, updates: Partial<CreditCard>) => Promise<void>;
  deleteCreditCard: (id: string) => boolean;
  addCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addThirdParty: (thirdParty: Omit<ThirdParty, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<void>;
  updateThirdParty: (id: string, updates: Partial<ThirdParty>) => Promise<void>;
  deleteThirdParty: (id: string) => Promise<void>;
  addReceivable: (receivable: Omit<Receivable, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<void>;
  updateReceivable: (id: string, updates: Partial<Receivable>) => Promise<void>;
  deleteReceivable: (id: string) => Promise<void>;
  addScheduledIncome: (scheduledIncome: Omit<ScheduledIncome, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<void>;
  updateScheduledIncome: (id: string, updates: Partial<ScheduledIncome>) => Promise<void>;
  deleteScheduledIncome: (id: string) => Promise<void>;
  getReceivablesTotal: () => number;
  getScheduledIncomesTotal: () => number;
  getBankAccountBalance: (accountId: string) => number;
  getCreditCardCurrentBill: (cardId: string) => number;
  getThirdPartyBalance: (thirdPartyId: string) => number;
  getCurrentMonthReceivables: () => { 
    receivables: Receivable[]; 
    scheduledIncomes: ScheduledIncome[];
    total: number;
    thirdPartyDebt: number;
    scheduledIncomesTotal: number;
  };
  recordPayment: (receivableId: string, amount: number, accountId: string) => Promise<void>;
  confirmScheduledIncomeReceipt: (id: string, amount: number, date: string, accountId: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

interface FinanceProviderProps {
  children: ReactNode;
}

export const FinanceProvider: React.FC<FinanceProviderProps> = ({ children }) => {
  const { user, profile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
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

      // Transform the data to match our interface with proper type casting
      const transformedTransactions: Transaction[] = (transactionsData || []).map(t => ({
        id: t.id,
        userId: t.user_id,
        accountId: t.account_id,
        creditCardId: t.credit_card_id,
        categoryId: t.category_id,
        thirdPartyId: t.third_party_id,
        description: t.description,
        amount: t.amount,
        type: t.type as 'income' | 'expense',
        transactionDate: t.transaction_date,
        dueDate: t.due_date,
        responsiblePersonId: t.responsible_person_id,
        installments: t.installments,
        currentInstallment: t.current_installment,
        parentTransactionId: t.parent_transaction_id,
        status: t.status as 'completed' | 'pending' | 'paid',
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
          accountName: t.accounts.name,
          accountType: t.accounts.type
        } : undefined,
        creditCard: t.credit_cards ? {
          id: t.credit_cards.id,
          cardName: t.credit_cards.name,
          bankName: t.credit_cards.bank
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
      setBankAccounts((accountsData || []).map(transformAccountToCamel));
      setCreditCards((creditCardsData || []).map(transformCreditCardToCamel));
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

  // Helper functions to transform data
  const transformSnakeToCamel = (obj: any): any => {
    const transformed: any = {};
    for (const key in obj) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      transformed[camelKey] = obj[key];
    }
    return transformed;
  };

  const transformAccountToCamel = (obj: any): BankAccount => ({
    id: obj.id,
    userId: obj.user_id,
    accountName: obj.name,
    bankName: obj.type,
    accountType: obj.type,
    initialBalance: obj.balance || 0,
    initialBalanceDate: obj.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    identificationColor: obj.identification_color,
    createdAt: obj.created_at,
    updatedAt: obj.updated_at
  });

  const transformCreditCardToCamel = (obj: any): CreditCard => ({
    id: obj.id,
    userId: obj.user_id,
    cardName: obj.name,
    cardBrand: obj.card_brand,
    issuer: obj.bank,
    closingDay: obj.closing_day,
    dueDay: obj.due_day,
    cardLimit: obj.limit_amount,
    identificationColor: obj.identification_color,
    createdAt: obj.created_at,
    updatedAt: obj.updated_at
  });

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

  const getBankAccountBalance = (accountId: string) => {
    const account = bankAccounts.find(a => a.id === accountId);
    if (!account) return 0;
    
    const accountTransactions = transactions.filter(t => t.accountId === accountId);
    const income = accountTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = accountTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    
    return account.initialBalance + income - expenses;
  };

  const getCreditCardCurrentBill = (cardId: string) => {
    return transactions
      .filter(t => t.creditCardId === cardId && t.type === 'expense' && t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getThirdPartyBalance = (thirdPartyId: string) => {
    return receivables
      .filter(r => r.thirdPartyId === thirdPartyId && r.status === 'pending')
      .reduce((sum, r) => sum + r.amount - (r.paidAmount || 0), 0);
  };

  const getCurrentMonthReceivables = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthReceivables = receivables.filter(r => {
      const dueDate = new Date(r.dueDate);
      return dueDate >= startOfMonth && dueDate <= endOfMonth;
    });

    const monthScheduledIncomes = scheduledIncomes.filter(s => {
      const expectedDate = new Date(s.expectedDate);
      return expectedDate >= startOfMonth && expectedDate <= endOfMonth;
    });

    const thirdPartyDebt = monthReceivables
      .filter(r => r.status === 'pending')
      .reduce((sum, r) => sum + (r.amount - (r.paidAmount || 0)), 0);

    const scheduledIncomesTotal = monthScheduledIncomes
      .filter(s => s.status === 'pending')
      .reduce((sum, s) => sum + s.amount, 0);

    const total = thirdPartyDebt + scheduledIncomesTotal;

    return { 
      receivables: monthReceivables, 
      scheduledIncomes: monthScheduledIncomes,
      total,
      thirdPartyDebt,
      scheduledIncomesTotal
    };
  };

  // CRUD operations
  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    const { error } = await supabase
      .from('transactions')
      .insert([transformCamelToSnake({ ...transaction, userId: user!.id })]);
    
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

  const addBankAccount = async (account: Omit<BankAccount, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    const { error } = await supabase
      .from('accounts')
      .insert([{
        user_id: user!.id,
        name: account.accountName,
        type: account.accountType,
        balance: account.initialBalance,
        identification_color: account.identificationColor
      }]);
    
    if (error) throw error;
    await loadData();
  };

  const updateBankAccount = async (id: string, updates: Partial<BankAccount>) => {
    const { error } = await supabase
      .from('accounts')
      .update({
        name: updates.accountName,
        type: updates.accountType,
        identification_color: updates.identificationColor
      })
      .eq('id', id);
    
    if (error) throw error;
    await loadData();
  };

  const deleteBankAccount = (id: string): boolean => {
    // Implementation would delete from Supabase and return whether there were associated transactions
    // For now, just a placeholder
    return false;
  };

  const addCreditCard = async (creditCard: Omit<CreditCard, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    const { error } = await supabase
      .from('credit_cards')
      .insert([{
        user_id: user!.id,
        name: creditCard.cardName,
        bank: creditCard.issuer || '',
        limit_amount: creditCard.cardLimit || 0,
        closing_day: creditCard.closingDay,
        due_day: creditCard.dueDay,
        card_brand: creditCard.cardBrand,
        identification_color: creditCard.identificationColor
      }]);
    
    if (error) throw error;
    await loadData();
  };

  const updateCreditCard = async (id: string, updates: Partial<CreditCard>) => {
    const { error } = await supabase
      .from('credit_cards')
      .update({
        name: updates.cardName,
        bank: updates.issuer,
        limit_amount: updates.cardLimit,
        closing_day: updates.closingDay,
        due_day: updates.dueDay,
        card_brand: updates.cardBrand,
        identification_color: updates.identificationColor
      })
      .eq('id', id);
    
    if (error) throw error;
    await loadData();
  };

  const deleteCreditCard = (id: string): boolean => {
    // Implementation would delete from Supabase and return whether there were associated transactions
    return false;
  };

  const addCategory = async (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    const { error } = await supabase
      .from('categories')
      .insert([{ ...transformCamelToSnake(category), user_id: user!.id }]);
    
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

  const addThirdParty = async (thirdParty: Omit<ThirdParty, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    const { error } = await supabase
      .from('third_parties')
      .insert([{ ...transformCamelToSnake(thirdParty), user_id: user!.id }]);
    
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

  const addReceivable = async (receivable: Omit<Receivable, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    const { error } = await supabase
      .from('receivables')
      .insert([{ ...transformCamelToSnake(receivable), user_id: user!.id }]);
    
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

  const addScheduledIncome = async (scheduledIncome: Omit<ScheduledIncome, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    const { error } = await supabase
      .from('scheduled_incomes')
      .insert([{ ...transformCamelToSnake(scheduledIncome), user_id: user!.id }]);
    
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

  const recordPayment = async (receivableId: string, amount: number, accountId: string) => {
    try {
      // Update receivable with payment
      const receivable = receivables.find(r => r.id === receivableId);
      if (!receivable) throw new Error('Receivable not found');

      const newPaidAmount = (receivable.paidAmount || 0) + amount;
      const newStatus = newPaidAmount >= receivable.amount ? 'paid' : 'pending';

      const { error: receivableError } = await supabase
        .from('receivables')
        .update({ 
          paid_amount: newPaidAmount,
          status: newStatus
        })
        .eq('id', receivableId);

      if (receivableError) throw receivableError;

      // Create income transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert([{
          user_id: user!.id,
          account_id: accountId,
          description: `Pagamento recebido: ${receivable.description}`,
          amount,
          type: 'income',
          transaction_date: new Date().toISOString().split('T')[0],
          status: 'completed'
        }]);

      if (transactionError) throw transactionError;

      await loadData();
    } catch (error) {
      console.error('Error recording payment:', error);
      throw error;
    }
  };

  const confirmScheduledIncomeReceipt = async (id: string, amount: number, date: string, accountId: string) => {
    try {
      const scheduledIncome = scheduledIncomes.find(s => s.id === id);
      if (!scheduledIncome) throw new Error('Scheduled income not found');

      // Update scheduled income status
      const { error: scheduleError } = await supabase
        .from('scheduled_incomes')
        .update({ status: 'received' })
        .eq('id', id);

      if (scheduleError) throw scheduleError;

      // Create income transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert([{
          user_id: user!.id,
          account_id: accountId,
          description: scheduledIncome.description,
          amount,
          type: 'income',
          transaction_date: date,
          status: 'completed'
        }]);

      if (transactionError) throw transactionError;

      await loadData();
    } catch (error) {
      console.error('Error confirming scheduled income receipt:', error);
      throw error;
    }
  };

  const refreshData = async () => {
    await loadData();
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        bankAccounts,
        creditCards,
        categories,
        thirdParties,
        receivables,
        scheduledIncomes,
        loading,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addBankAccount,
        updateBankAccount,
        deleteBankAccount,
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
        getBankAccountBalance,
        getCreditCardCurrentBill,
        getThirdPartyBalance,
        getCurrentMonthReceivables,
        recordPayment,
        confirmScheduledIncomeReceipt,
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
