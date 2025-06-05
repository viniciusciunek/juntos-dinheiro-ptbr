
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Plus, CreditCard, Building2 } from 'lucide-react';
import { useFinance } from '@/contexts/FinanceContext';
import { toast } from '@/hooks/use-toast';
import BankAccountForm from './BankAccountForm';
import CreditCardForm from './CreditCardForm';

type FormType = 'none' | 'bank-account' | 'credit-card';
type FormMode = 'create' | 'edit';

const AccountsScreen: React.FC = () => {
  const { 
    bankAccounts, 
    creditCards, 
    deleteBankAccount, 
    deleteCreditCard,
    getBankAccountBalance,
    getCreditCardCurrentBill
  } = useFinance();
  
  const [activeForm, setActiveForm] = useState<FormType>('none');
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleEditBankAccount = (id: string) => {
    setEditingId(id);
    setFormMode('edit');
    setActiveForm('bank-account');
  };

  const handleEditCreditCard = (id: string) => {
    setEditingId(id);
    setFormMode('edit');
    setActiveForm('credit-card');
  };

  const handleDeleteBankAccount = (id: string, name: string) => {
    if (window.confirm(`Você tem certeza que deseja excluir '${name}'? Esta ação não pode ser desfeita.`)) {
      const hasTransactions = deleteBankAccount(id);
      if (hasTransactions) {
        toast({
          title: "Conta excluída",
          description: "A conta foi excluída e as transações associadas foram desvinculadas.",
          variant: "default"
        });
      } else {
        toast({
          title: "Conta excluída",
          description: "A conta foi excluída com sucesso.",
          variant: "default"
        });
      }
    }
  };

  const handleDeleteCreditCard = (id: string, name: string) => {
    if (window.confirm(`Você tem certeza que deseja excluir '${name}'? Esta ação não pode ser desfeita.`)) {
      const hasTransactions = deleteCreditCard(id);
      if (hasTransactions) {
        toast({
          title: "Cartão excluído",
          description: "O cartão foi excluído e as transações associadas foram desvinculadas.",
          variant: "default"
        });
      } else {
        toast({
          title: "Cartão excluído",
          description: "O cartão foi excluído com sucesso.",
          variant: "default"
        });
      }
    }
  };

  const handleFormClose = () => {
    setActiveForm('none');
    setFormMode('create');
    setEditingId(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getAccountTypeLabel = (type: string) => {
    const types = {
      'conta_corrente': 'Conta Corrente',
      'conta_poupanca': 'Conta Poupança',
      'conta_pagamentos': 'Conta de Pagamentos',
      'outra': 'Outra'
    };
    return types[type as keyof typeof types] || type;
  };

  const getBrandLabel = (brand?: string) => {
    if (!brand) return '';
    const brands = {
      'visa': 'Visa',
      'mastercard': 'Mastercard',
      'elo': 'Elo',
      'amex': 'American Express',
      'outra': 'Outra'
    };
    return brands[brand as keyof typeof brands] || brand;
  };

  if (activeForm !== 'none') {
    return (
      <div className="p-4 pb-20">
        {activeForm === 'bank-account' && (
          <BankAccountForm
            mode={formMode}
            accountId={editingId}
            onClose={handleFormClose}
          />
        )}
        {activeForm === 'credit-card' && (
          <CreditCardForm
            mode={formMode}
            cardId={editingId}
            onClose={handleFormClose}
          />
        )}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Minhas Contas</h1>
        <div className="flex gap-2">
          <Button 
            onClick={() => {
              setFormMode('create');
              setActiveForm('bank-account');
            }}
            className="flex items-center gap-2"
            variant="outline"
          >
            <Building2 size={16} />
            Nova Conta
          </Button>
          <Button 
            onClick={() => {
              setFormMode('create');
              setActiveForm('credit-card');
            }}
            className="flex items-center gap-2"
          >
            <CreditCard size={16} />
            Novo Cartão
          </Button>
        </div>
      </div>

      {/* Contas Bancárias */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Building2 size={20} />
          Contas Bancárias
        </h2>
        
        {bankAccounts.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              <Building2 size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Nenhuma conta bancária cadastrada</p>
              <Button 
                onClick={() => {
                  setFormMode('create');
                  setActiveForm('bank-account');
                }}
                className="mt-4"
                variant="outline"
              >
                Adicionar primeira conta
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {bankAccounts.map((account) => (
              <Card key={account.id} className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {account.identificationColor && (
                        <div 
                          className="w-4 h-16 rounded-full"
                          style={{ backgroundColor: account.identificationColor }}
                        />
                      )}
                      <div>
                        <h3 className="font-semibold text-lg">{account.accountName}</h3>
                        <p className="text-gray-600">{account.bankName}</p>
                        <Badge variant="secondary" className="text-xs">
                          {getAccountTypeLabel(account.accountType)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(getBankAccountBalance(account.id))}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditBankAccount(account.id)}
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteBankAccount(account.id, account.accountName)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Cartões de Crédito */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <CreditCard size={20} />
          Cartões de Crédito
        </h2>
        
        {creditCards.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              <CreditCard size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Nenhum cartão de crédito cadastrado</p>
              <Button 
                onClick={() => {
                  setFormMode('create');
                  setActiveForm('credit-card');
                }}
                className="mt-4"
                variant="outline"
              >
                Adicionar primeiro cartão
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {creditCards.map((card) => (
              <Card key={card.id} className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {card.identificationColor && (
                        <div 
                          className="w-4 h-16 rounded-full"
                          style={{ backgroundColor: card.identificationColor }}
                        />
                      )}
                      <div>
                        <h3 className="font-semibold text-lg">{card.cardName}</h3>
                        <p className="text-gray-600">{card.issuer}</p>
                        <div className="flex gap-2 mt-1">
                          {card.cardBrand && (
                            <Badge variant="secondary" className="text-xs">
                              {getBrandLabel(card.cardBrand)}
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            Fecha dia {card.closingDay}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Vence dia {card.dueDay}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Fatura Atual</p>
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(getCreditCardCurrentBill(card.id))}
                      </p>
                      {card.cardLimit && (
                        <p className="text-sm text-gray-500">
                          Limite: {formatCurrency(card.cardLimit)}
                        </p>
                      )}
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditCreditCard(card.id)}
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteCreditCard(card.id, card.cardName)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountsScreen;
