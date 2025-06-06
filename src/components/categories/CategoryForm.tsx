
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFinance } from '@/contexts/FinanceContext';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

interface CategoryFormProps {
  editingId: string | null;
  onClose: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ editingId, onClose }) => {
  const { categories, addCategory, updateCategory } = useFinance();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [color, setColor] = useState('#3B82F6');

  const isEditing = editingId !== null;
  const editingCategory = isEditing ? categories.find(cat => cat.id === editingId) : null;

  const commonIcons = ['🛒', '🍕', '⛽', '🏥', '🎬', '👕', '📚', '🎵', '💊', '🚗', '🏠', '💻'];
  const commonColors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name);
      setIcon(editingCategory.icon || '');
      setColor(editingCategory.color || '#3B82F6');
    }
  }, [editingCategory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Erro",
        description: "O nome da categoria é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isEditing) {
        updateCategory(editingId, {
          name: name.trim(),
          icon: icon.trim() || undefined,
          color: color || undefined
        });
        toast({
          title: "Categoria atualizada",
          description: "A categoria foi atualizada com sucesso.",
        });
      } else {
        addCategory({
          name: name.trim(),
          icon: icon.trim() || undefined,
          color: color || undefined
        });
        toast({
          title: "Categoria criada",
          description: "A categoria foi criada com sucesso.",
        });
      }
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-4 pb-20">
      <div className="flex items-center mb-4">
        <Button
          variant="ghost"
          onClick={onClose}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">
          {isEditing ? 'Editar Categoria' : 'Nova Categoria'}
        </h1>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>
            {isEditing ? 'Editar informações' : 'Informações da categoria'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome da Categoria *</label>
              <Input
                placeholder="Ex: Mercado, Lazer, Transporte"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ícone (Opcional)</label>
              <div className="space-y-2">
                <Input
                  placeholder="Digite um emoji ou deixe em branco"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  maxLength={2}
                />
                <div className="flex flex-wrap gap-2">
                  {commonIcons.map((emoji, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setIcon(emoji)}
                      className="p-2 border rounded hover:bg-gray-100 text-lg"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Cor (Opcional)</label>
              <div className="space-y-2">
                <Input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-20 h-10"
                />
                <div className="flex flex-wrap gap-2">
                  {commonColors.map((colorOption, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setColor(colorOption)}
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: colorOption }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="flex-1 gradient-primary"
              >
                {isEditing ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryForm;
