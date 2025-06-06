
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useFinance } from '@/contexts/FinanceContext';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';
import CategoryForm from './CategoryForm';

const CategoriesScreen: React.FC = () => {
  const { categories, deleteCategory } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Você tem certeza que deseja excluir a categoria '${name}'?`)) {
      try {
        deleteCategory(id);
        toast({
          title: "Categoria excluída",
          description: "A categoria foi excluída com sucesso.",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: error instanceof Error ? error.message : "Erro desconhecido",
          variant: "destructive"
        });
      }
    }
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
  };

  if (showForm) {
    return <CategoryForm editingId={editingId} onClose={handleCloseForm} />;
  }

  return (
    <div className="min-h-screen bg-finance-background">
      <div className="p-4 space-y-4 pb-20">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-finance-secondary">Minhas Categorias</h1>
          <Button
            onClick={() => setShowForm(true)}
            className="finance-button-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Categoria
          </Button>
        </div>

        <div className="space-y-3">
          {categories.length === 0 ? (
            <Card className="finance-card">
              <CardContent className="p-6 text-center">
                <p className="text-finance-text-muted mb-4">
                  Nenhuma categoria cadastrada ainda.
                </p>
                <Button
                  onClick={() => setShowForm(true)}
                  className="finance-button-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Categoria
                </Button>
              </CardContent>
            </Card>
          ) : (
            categories.map((category) => (
              <Card key={category.id} className="finance-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {category.color && (
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: category.color }}
                        />
                      )}
                      {category.icon && (
                        <span className="text-lg">{category.icon}</span>
                      )}
                      <div>
                        <h3 className="font-medium text-finance-text">{category.name}</h3>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(category.id)}
                        className="hover:bg-finance-background"
                      >
                        <Edit className="h-4 w-4 text-finance-gold" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(category.id, category.name)}
                        className="hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 text-finance-red" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoriesScreen;
