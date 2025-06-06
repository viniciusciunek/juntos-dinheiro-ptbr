import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  userId: string;
}

export interface ThirdParty {
  id: string;
  name: string;
  userId: string;
  relationship?: string;
  avatar?: string;
}

export interface BankAccount {
  id: string;
  accountName: string;
  bankName: string;
  accountType: 'conta_corrente' | 'conta_poupanca' | 'conta_pagamentos' | 'outra';
  initialBalance: number;
  initialBalanceDate: string;
  identificationColor?: string;
  userId: string;
}

export interface CreditCard {
  id: string;
  cardName: string;
  cardBrand?: 'visa' | 'mastercard' | 'elo' | 'amex' | 'outra';
  issuer?: string;
  closingDay: number;
  dueDay: number;
  cardLimit?: number;
  identificationColor?: string;
  userId: string;
}

// Legacy Card interface for backward compatibility
export interface Card {
  id: string;
  name: string;
  userId: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: 'expense' | 'income';
  userId: string;
  
  // Campos específicos para despesas
  paymentMethod?: 'credito' | 'debito' | 'pix' | 'dinheiro';
  cardId?: string;
  bankAccountId?: string;
  creditCardId?: string;
  responsibleType?: 'eu' | 'conjuge' | 'terceiro';
  thirdPartyId?: string;
  isInstallment?: boolean;
  currentInstallment?: number;
  totalInstallments?: number;
  categoryId?: string; // Nova propriedade para categoria
  
  // Campos específicos para receitas
  source?: string;
  recipient?: 'eu' | 'conjuge';
  
  // Controle de pagamento por terceiros
  isPaid?: boolean;
  paidAmount?: number;
}

export interface Receivable {
  id: string;
  thirdPartyId: string;
  transactionId: string;
  amount: number;
  paidAmount: number;
  status: 'pendente' | 'parcialmente_pago' | 'pago';
  dueDate: string;
  userId: string;
}

export interface ScheduledIncome {
  id: string;
  userId: string;
  description: string;
  amount: number;
  expectedDate: string;
  status: 'pendente' | 'recebido';
  notes?: string;
}

interface FinanceContextType {
  // Categories
  categories: Category[];
  addCategory: (category: Omit<Category, 'id' | 'userId'>) => void;
  updateCategory: (id: string, category: Partial<Omit<Category, 'id' | 'userId'>>) => void;
  deleteCategory: (id: string) => boolean;
  
  // Third Parties
  thirdParties: ThirdParty[];
  addThirdParty: (thirdParty: Omit<ThirdParty, 'id' | 'userId'>) => void;
  updateThirdParty: (id: string, thirdParty: Partial<Omit<ThirdParty, 'id' | 'userId'>>) => void;
  deleteThirdParty: (id: string) => void;
  
  // Bank Accounts
  bankAccounts: BankAccount[];
  addBankAccount: (account: Omit<BankAccount, 'id' | 'userId'>) => void;
  updateBankAccount: (id: string, account: Partial<BankAccount>) => void;
  deleteBankAccount: (id: string) => boolean;
  getBankAccountBalance: (accountId: string) => number;
  
  // Credit Cards
  creditCards: CreditCard[];
  addCreditCard: (card: Omit<CreditCard, 'id' | 'userId'>) => void;
  updateCreditCard: (id: string, card: Partial<CreditCard>) => void;
  deleteCreditCard: (id: string) => boolean;
  getCreditCardCurrentBill: (cardId: string) => number;
  
  // Legacy Cards (for backward compatibility)
  cards: Card[];
  addCard: (name: string) => void;
  updateCard: (id: string, name: string) => void;
  deleteCard: (id: string) => void;
  
  // Transactions
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'userId'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  
  // Receivables
  receivables: Receivable[];
  recordPayment: (receivableId: string, amount: number, accountId?: string) => void;
  
  // Scheduled Incomes
  scheduledIncomes: ScheduledIncome[];
  addScheduledIncome: (income: Omit<ScheduledIncome, 'id' | 'userId'>) => void;
  updateScheduledIncome: (id: string, income: Partial<ScheduledIncome>) => void;
  deleteScheduledIncome: (id: string) => void;
  confirmScheduledIncomeReceipt: (id: string, amount: number, date: string, accountId: string) => void;
  
  // Analytics
  getCurrentMonthExpenses: () => number;
  getCurrentMonthIncome: () => number;
  getCardExpenses: (cardId: string, month?: string) => number;
  getThirdPartyBalance: (thirdPartyId: string) => number;
  
  // Analytics for Receivables
  getCurrentMonthReceivables: () => { thirdPartyDebt: number; scheduledIncomes: number; total: number };
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance deve ser usado dentro de um FinanceProvider');
  }
  return context;
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [thirdParties, setThirdParties] = useState<ThirdParty[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [scheduledIncomes, setScheduledIncomes] = useState<ScheduledIncome[]>([]);

  // Carregar dados do localStorage
  useEffect(() => {
    if (user) {
      const savedCategories = localStorage.getItem(`finance_categories_${user.id}`);
      const savedThirdParties = localStorage.getItem(`finance_third_parties_${user.id}`);
      const savedBankAccounts = localStorage.getItem(`finance_bank_accounts_${user.id}`);
      const savedCreditCards = localStorage.getItem(`finance_credit_cards_${user.id}`);
      const savedCards = localStorage.getItem(`finance_cards_${user.id}`);
      const savedTransactions = localStorage.getItem(`finance_transactions_${user.id}`);
      const savedReceivables = localStorage.getItem(`finance_receivables_${user.id}`);
      const savedScheduledIncomes = localStorage.getItem(`finance_scheduled_incomes_${user.id}`);
      
      if (savedCategories) setCategories(JSON.parse(savedCategories));
      if (savedThirdParties) setThirdParties(JSON.parse(savedThirdParties));
      if (savedBankAccounts) setBankAccounts(JSON.parse(savedBankAccounts));
      if (savedCreditCards) setCreditCards(JSON.parse(savedCreditCards));
      if (savedCards) setCards(JSON.parse(savedCards));
      if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
      if (savedReceivables) setReceivables(JSON.parse(savedReceivables));
      if (savedScheduledIncomes) setScheduledIncomes(JSON.parse(savedScheduledIncomes));
    }
  }, [user]);

  // Salvar dados no localStorage
  const saveToLocalStorage = (key: string, data: any) => {
    if (user) {
      localStorage.setItem(`${key}_${user.id}`, JSON.stringify(data));
    }
  };

  // Categories functions
  const addCategory = (categoryData: Omit<Category, 'id' | 'userId'>) => {
    if (!user) return;
    
    // Check for unique name
    const existingCategory = categories.find(cat => 
      cat.name.toLowerCase() === categoryData.name.toLowerCase()
    );
    if (existingCategory) {
      throw new Error('Já existe uma categoria com este nome');
    }
    
    const newCategory: Category = {
      ...categoryData,
      id: Date.now().toString(),
      userId: user.id
    };
    const updated = [...categories, newCategory];
    setCategories(updated);
    saveToLocalStorage('finance_categories', updated);
  };

  const updateCategory = (id: string, categoryData: Partial<Omit<Category, 'id' | 'userId'>>) => {
    // Check for unique name if name is being updated
    if (categoryData.name) {
      const existingCategory = categories.find(cat => 
        cat.id !== id && cat.name.toLowerCase() === categoryData.name.toLowerCase()
      );
      if (existingCategory) {
        throw new Error('Já existe uma categoria com este nome');
      }
    }
    
    const updated = categories.map(cat => cat.id === id ? { ...cat, ...categoryData } : cat);
    setCategories(updated);
    saveToLocalStorage('finance_categories', updated);
  };

  const deleteCategory = (id: string): boolean => {
    // Check if there are transactions associated
    const associatedTransactions = transactions.filter(t => t.categoryId === id);
    
    if (associatedTransactions.length > 0) {
      throw new Error(`Não é possível excluir a categoria, pois ela está em uso por ${associatedTransactions.length} transações. Por favor, reatribua essas transações a outra categoria antes de excluir.`);
    }
    
    const updated = categories.filter(cat => cat.id !== id);
    setCategories(updated);
    saveToLocalStorage('finance_categories', updated);
    
    return true;
  };

  // Third Parties functions
  const addThirdParty = (thirdPartyData: Omit<ThirdParty, 'id' | 'userId'>) => {
    if (!user) return;
    
    // Check for unique name
    const existingThirdParty = thirdParties.find(tp => 
      tp.name.toLowerCase() === thirdPartyData.name.toLowerCase()
    );
    if (existingThirdParty) {
      throw new Error('Já existe um terceiro com este nome');
    }
    
    const newThirdParty: ThirdParty = {
      ...thirdPartyData,
      id: Date.now().toString(),
      userId: user.id
    };
    const updated = [...thirdParties, newThirdParty];
    setThirdParties(updated);
    saveToLocalStorage('finance_third_parties', updated);
  };

  const updateThirdParty = (id: string, thirdPartyData: Partial<Omit<ThirdParty, 'id' | 'userId'>>) => {
    // Check for unique name if name is being updated
    if (thirdPartyData.name) {
      const existingThirdParty = thirdParties.find(tp => 
        tp.id !== id && tp.name.toLowerCase() === thirdPartyData.name.toLowerCase()
      );
      if (existingThirdParty) {
        throw new Error('Já existe um terceiro com este nome');
      }
    }
    
    const updated = thirdParties.map(tp => tp.id === id ? { ...tp, ...thirdPartyData } : tp);
    setThirdParties(updated);
    saveToLocalStorage('finance_third_parties', updated);
  };

  const deleteThirdParty = (id: string) => {
    const updated = thirdParties.filter(tp => tp.id !== id);
    setThirdParties(updated);
    saveToLocalStorage('finance_third_parties', updated);
  };

  // Bank Accounts functions
  const addBankAccount = (account: Omit<BankAccount, 'id' | 'userId'>) => {
    if (!user) return;
    
    // Check for unique account name
    const existingAccount = bankAccounts.find(acc => acc.accountName.toLowerCase() === account.accountName.toLowerCase());
    if (existingAccount) {
      throw new Error('Já existe uma conta com este nome');
    }
    
    const newAccount: BankAccount = {
      ...account,
      id: Date.now().toString(),
      userId: user.id
    };
    const updated = [...bankAccounts, newAccount];
    setBankAccounts(updated);
    saveToLocalStorage('finance_bank_accounts', updated);
  };

  const updateBankAccount = (id: string, account: Partial<BankAccount>) => {
    // Check for unique account name if name is being updated
    if (account.accountName) {
      const existingAccount = bankAccounts.find(acc => 
        acc.id !== id && acc.accountName.toLowerCase() === account.accountName.toLowerCase()
      );
      if (existingAccount) {
        throw new Error('Já existe uma conta com este nome');
      }
    }
    
    const updated = bankAccounts.map(acc => {
      if (acc.id === id) {
        // Don't allow updating initialBalance and initialBalanceDate after creation
        const { initialBalance, initialBalanceDate, ...updateData } = account;
        return { ...acc, ...updateData };
      }
      return acc;
    });
    setBankAccounts(updated);
    saveToLocalStorage('finance_bank_accounts', updated);
  };

  const deleteBankAccount = (id: string): boolean => {
    // Check if there are transactions associated
    const associatedTransactions = transactions.filter(t => t.bankAccountId === id);
    
    if (associatedTransactions.length > 0) {
      // Update transactions to remove the account association
      const updatedTransactions = transactions.map(t => 
        t.bankAccountId === id ? { ...t, bankAccountId: undefined } : t
      );
      setTransactions(updatedTransactions);
      saveToLocalStorage('finance_transactions', updatedTransactions);
    }
    
    const updated = bankAccounts.filter(acc => acc.id !== id);
    setBankAccounts(updated);
    saveToLocalStorage('finance_bank_accounts', updated);
    
    return associatedTransactions.length > 0;
  };

  const getBankAccountBalance = (accountId: string): number => {
    const account = bankAccounts.find(acc => acc.id === accountId);
    if (!account) return 0;
    
    const accountTransactions = transactions.filter(t => t.bankAccountId === accountId);
    const income = accountTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = accountTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return account.initialBalance + income - expenses;
  };

  // Credit Cards functions
  const addCreditCard = (card: Omit<CreditCard, 'id' | 'userId'>) => {
    if (!user) return;
    
    // Check for unique card name
    const existingCard = creditCards.find(c => c.cardName.toLowerCase() === card.cardName.toLowerCase());
    if (existingCard) {
      throw new Error('Já existe um cartão com este nome');
    }
    
    const newCard: CreditCard = {
      ...card,
      id: Date.now().toString(),
      userId: user.id
    };
    const updated = [...creditCards, newCard];
    setCreditCards(updated);
    saveToLocalStorage('finance_credit_cards', updated);
  };

  const updateCreditCard = (id: string, card: Partial<CreditCard>) => {
    // Check for unique card name if name is being updated
    if (card.cardName) {
      const existingCard = creditCards.find(c => 
        c.id !== id && c.cardName.toLowerCase() === card.cardName.toLowerCase()
      );
      if (existingCard) {
        throw new Error('Já existe um cartão com este nome');
      }
    }
    
    const updated = creditCards.map(c => c.id === id ? { ...c, ...card } : c);
    setCreditCards(updated);
    saveToLocalStorage('finance_credit_cards', updated);
  };

  const deleteCreditCard = (id: string): boolean => {
    // Check if there are transactions associated
    const associatedTransactions = transactions.filter(t => t.creditCardId === id);
    
    if (associatedTransactions.length > 0) {
      // Update transactions to remove the card association
      const updatedTransactions = transactions.map(t => 
        t.creditCardId === id ? { ...t, creditCardId: undefined } : t
      );
      setTransactions(updatedTransactions);
      saveToLocalStorage('finance_transactions', updatedTransactions);
    }
    
    const updated = creditCards.filter(c => c.id !== id);
    setCreditCards(updated);
    saveToLocalStorage('finance_credit_cards', updated);
    
    return associatedTransactions.length > 0;
  };

  const getCreditCardCurrentBill = (cardId: string): number => {
    const card = creditCards.find(c => c.id === cardId);
    if (!card) return 0;
    
    // Calculate current bill based on closing day
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Determine the billing cycle
    let billingStart: Date;
    let billingEnd: Date;
    
    if (now.getDate() >= card.closingDay) {
      // Current billing cycle
      billingStart = new Date(currentYear, currentMonth, card.closingDay);
      billingEnd = new Date(currentYear, currentMonth + 1, card.closingDay);
    } else {
      // Previous billing cycle
      billingStart = new Date(currentYear, currentMonth - 1, card.closingDay);
      billingEnd = new Date(currentYear, currentMonth, card.closingDay);
    }
    
    const cardTransactions = transactions.filter(t => 
      t.creditCardId === cardId && 
      t.type === 'expense' &&
      new Date(t.date) >= billingStart && 
      new Date(t.date) < billingEnd
    );
    
    return cardTransactions.reduce((sum, t) => sum + t.amount, 0);
  };

  // Legacy Cards functions (for backward compatibility)
  const addCard = (name: string) => {
    if (!user) return;
    const newCard: Card = {
      id: Date.now().toString(),
      name,
      userId: user.id
    };
    const updated = [...cards, newCard];
    setCards(updated);
    saveToLocalStorage('finance_cards', updated);
  };

  const updateCard = (id: string, name: string) => {
    const updated = cards.map(card => card.id === id ? { ...card, name } : card);
    setCards(updated);
    saveToLocalStorage('finance_cards', updated);
  };

  const deleteCard = (id: string) => {
    const updated = cards.filter(card => card.id !== id);
    setCards(updated);
    saveToLocalStorage('finance_cards', updated);
  };

  // Transactions functions
  const addTransaction = (transaction: Omit<Transaction, 'id' | 'userId'>) => {
    if (!user) return;
    
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      userId: user.id
    };

    let updatedTransactions = [newTransaction];

    // Se for parcelamento, criar as parcelas futuras
    if (transaction.isInstallment && transaction.totalInstallments && transaction.totalInstallments > 1) {
      for (let i = 2; i <= transaction.totalInstallments; i++) {
        const futureDate = new Date(transaction.date);
        futureDate.setMonth(futureDate.getMonth() + (i - 1));
        
        const installmentTransaction: Transaction = {
          ...newTransaction,
          id: `${Date.now()}_${i}`,
          date: futureDate.toISOString().split('T')[0],
          currentInstallment: i
        };
        updatedTransactions.push(installmentTransaction);
      }
    }

    // Atualizar fonte de pagamento baseado no tipo
    if (transaction.type === 'expense') {
      // Se for conta bancária (débito, PIX, dinheiro)
      if (transaction.bankAccountId) {
        const updatedAccounts = bankAccounts.map(acc => {
          if (acc.id === transaction.bankAccountId) {
            // Subtrair o valor do saldo (para despesas)
            return { ...acc };
          }
          return acc;
        });
        setBankAccounts(updatedAccounts);
        saveToLocalStorage('finance_bank_accounts', updatedAccounts);
      }
      
      // Se for cartão de crédito
      if (transaction.creditCardId) {
        const updatedCards = creditCards.map(card => {
          if (card.id === transaction.creditCardId) {
            // A fatura será calculada dinamicamente, não precisa atualizar aqui
            return card;
          }
          return card;
        });
        setCreditCards(updatedCards);
      }
    }

    // Se a despesa é de um terceiro, criar um receivable
    if (transaction.type === 'expense' && transaction.responsibleType === 'terceiro' && transaction.thirdPartyId) {
      const newReceivable: Receivable = {
        id: `receivable_${Date.now()}`,
        thirdPartyId: transaction.thirdPartyId,
        transactionId: newTransaction.id,
        amount: transaction.amount,
        paidAmount: 0,
        status: 'pendente',
        dueDate: transaction.date,
        userId: user.id
      };
      
      const updatedReceivables = [...receivables, newReceivable];
      setReceivables(updatedReceivables);
      saveToLocalStorage('finance_receivables', updatedReceivables);
    }

    const allTransactions = [...transactions, ...updatedTransactions];
    setTransactions(allTransactions);
    saveToLocalStorage('finance_transactions', allTransactions);
  };

  const updateTransaction = (id: string, updatedTransaction: Partial<Transaction>) => {
    const updated = transactions.map(t => t.id === id ? { ...t, ...updatedTransaction } : t);
    setTransactions(updated);
    saveToLocalStorage('finance_transactions', updated);
  };

  const deleteTransaction = (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    saveToLocalStorage('finance_transactions', updated);
  };

  // Receivables functions
  const recordPayment = (receivableId: string, amount: number, accountId?: string) => {
    const updated = receivables.map(r => {
      if (r.id === receivableId) {
        const newPaidAmount = r.paidAmount + amount;
        const status: 'pendente' | 'parcialmente_pago' | 'pago' = 
          newPaidAmount >= r.amount ? 'pago' : 
          newPaidAmount > 0 ? 'parcialmente_pago' : 'pendente';
        
        return { ...r, paidAmount: newPaidAmount, status };
      }
      return r;
    });
    
    setReceivables(updated);
    saveToLocalStorage('finance_receivables', updated);

    // Add as income transaction
    if (user) {
      const receivable = receivables.find(r => r.id === receivableId);
      const thirdParty = thirdParties.find(tp => tp.id === receivable?.thirdPartyId);
      
      const paymentTransaction: Transaction = {
        id: `payment_${Date.now()}`,
        description: `Recebimento de ${thirdParty?.name || 'terceiro'}`,
        amount,
        date: new Date().toISOString().split('T')[0],
        type: 'income',
        source: 'Recebimento de Terceiro',
        recipient: 'eu',
        userId: user.id,
        bankAccountId: accountId
      };
      
      const updatedTransactions = [...transactions, paymentTransaction];
      setTransactions(updatedTransactions);
      saveToLocalStorage('finance_transactions', updatedTransactions);
    }
  };

  // Scheduled Incomes functions
  const addScheduledIncome = (incomeData: Omit<ScheduledIncome, 'id' | 'userId'>) => {
    if (!user) return;
    
    const newIncome: ScheduledIncome = {
      ...incomeData,
      id: Date.now().toString(),
      userId: user.id,
      status: 'pendente'
    };
    const updated = [...scheduledIncomes, newIncome];
    setScheduledIncomes(updated);
    saveToLocalStorage('finance_scheduled_incomes', updated);
  };

  const updateScheduledIncome = (id: string, incomeData: Partial<ScheduledIncome>) => {
    const updated = scheduledIncomes.map(income => income.id === id ? { ...income, ...incomeData } : income);
    setScheduledIncomes(updated);
    saveToLocalStorage('finance_scheduled_incomes', updated);
  };

  const deleteScheduledIncome = (id: string) => {
    const updated = scheduledIncomes.filter(income => income.id !== id);
    setScheduledIncomes(updated);
    saveToLocalStorage('finance_scheduled_incomes', updated);
  };

  const confirmScheduledIncomeReceipt = (id: string, amount: number, date: string, accountId: string) => {
    if (!user) return;
    
    // Create income transaction
    const scheduledIncome = scheduledIncomes.find(si => si.id === id);
    if (!scheduledIncome) return;
    
    const incomeTransaction: Transaction = {
      id: `scheduled_income_${Date.now()}`,
      description: `Recebimento: ${scheduledIncome.description}`,
      amount,
      date,
      type: 'income',
      source: 'Receita Agendada',
      recipient: 'eu',
      userId: user.id,
      bankAccountId: accountId
    };
    
    const updatedTransactions = [...transactions, incomeTransaction];
    setTransactions(updatedTransactions);
    saveToLocalStorage('finance_transactions', updatedTransactions);
    
    // Update scheduled income status
    const updatedScheduledIncomes = scheduledIncomes.map(si => 
      si.id === id ? { ...si, status: 'recebido' as const } : si
    );
    setScheduledIncomes(updatedScheduledIncomes);
    saveToLocalStorage('finance_scheduled_incomes', updatedScheduledIncomes);
  };

  // Analytics functions
  const getCurrentMonthExpenses = () => {
    const currentMonth = new Date().toISOString().substring(0, 7);
    return transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth) && t.responsibleType === 'eu')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getCurrentMonthIncome = () => {
    const currentMonth = new Date().toISOString().substring(0, 7);
    return transactions
      .filter(t => t.type === 'income' && t.date.startsWith(currentMonth) && t.recipient === 'eu')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getCardExpenses = (cardId: string, month?: string) => {
    const targetMonth = month || new Date().toISOString().substring(0, 7);
    return transactions
      .filter(t => t.type === 'expense' && t.cardId === cardId && t.date.startsWith(targetMonth))
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getThirdPartyBalance = (thirdPartyId: string) => {
    return receivables
      .filter(r => r.thirdPartyId === thirdPartyId && r.status !== 'pago')
      .reduce((sum, r) => sum + (r.amount - r.paidAmount), 0);
  };

  const getCurrentMonthReceivables = () => {
    const currentMonth = new Date().toISOString().substring(0, 7);
    
    // Third party debts for current month
    const thirdPartyDebt = receivables
      .filter(r => r.status !== 'pago' && r.dueDate.startsWith(currentMonth))
      .reduce((sum, r) => sum + (r.amount - r.paidAmount), 0);
    
    // Scheduled incomes for current month
    const scheduledIncomesAmount = scheduledIncomes
      .filter(si => si.status === 'pendente' && si.expectedDate.startsWith(currentMonth))
      .reduce((sum, si) => sum + si.amount, 0);
    
    return {
      thirdPartyDebt,
      scheduledIncomes: scheduledIncomesAmount,
      total: thirdPartyDebt + scheduledIncomesAmount
    };
  };

  const value: FinanceContextType = {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    thirdParties,
    addThirdParty,
    updateThirdParty,
    deleteThirdParty,
    bankAccounts,
    addBankAccount,
    updateBankAccount,
    deleteBankAccount,
    getBankAccountBalance,
    creditCards,
    addCreditCard,
    updateCreditCard,
    deleteCreditCard,
    getCreditCardCurrentBill,
    cards,
    addCard,
    updateCard,
    deleteCard,
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    receivables,
    recordPayment,
    getCurrentMonthExpenses,
    getCurrentMonthIncome,
    getCardExpenses,
    getThirdPartyBalance,
    scheduledIncomes,
    addScheduledIncome,
    updateScheduledIncome,
    deleteScheduledIncome,
    confirmScheduledIncomeReceipt,
    getCurrentMonthReceivables
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};
