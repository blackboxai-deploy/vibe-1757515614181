'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Expense } from '@/lib/types';
import { formatDateTime } from '@/lib/date-utils';
import { generateExpenseId } from '@/lib/calculations';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { toast } from 'sonner';
import { useState } from 'react';
import { formatCategoryName } from '@/lib/format-utils';

interface ExpenseFormProps {
  onCancel: () => void;
  onSuccess: () => void;
  editingExpense?: Expense;
}

const expenseCategories = [
  'insumos',
  'servicios', 
  'alquiler',
  'impuestos',
  'otros'
] as const;

export function ExpenseForm({ onCancel, onSuccess, editingExpense }: ExpenseFormProps) {
  const { addExpense } = useLocalStorage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    concept: editingExpense?.concept || '',
    amount: editingExpense?.amount.toString() || '',
    category: editingExpense?.category || 'otros' as const,
    description: editingExpense?.description || ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.concept.trim()) {
      newErrors.concept = 'El concepto es requerido';
    }

    const amount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amount) || amount <= 0) {
      newErrors.amount = 'Ingresa un monto válido mayor a 0';
    }

    if (!formData.category) {
      newErrors.category = 'Selecciona una categoría';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const expense: Expense = {
        id: editingExpense?.id || generateExpenseId(),
        date: editingExpense?.date || formatDateTime(new Date()),
        concept: formData.concept.trim(),
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description.trim() || undefined
      };

      addExpense(expense);

      toast.success(
        editingExpense ? 'Gasto actualizado correctamente' : 'Gasto registrado correctamente',
        {
          description: `${expense.concept} - ${expense.amount.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}`
        }
      );

      onSuccess();
    } catch (error) {
      console.error('Error saving expense:', error);
      toast.error('Error al guardar el gasto');
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (value: string) => {
    // Permitir solo números y un punto decimal
    const numericValue = value.replace(/[^0-9.]/g, '');
    
    // Asegurar solo un punto decimal
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      const formatted = parts[0] + '.' + parts.slice(1).join('');
      setFormData({ ...formData, amount: formatted });
    } else {
      setFormData({ ...formData, amount: numericValue });
    }
    
    // Limpiar error de monto si existe
    if (errors.amount) {
      setErrors({ ...errors, amount: '' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>📝</span>
          <span>{editingExpense ? 'Editar Gasto' : 'Nuevo Gasto'}</span>
        </CardTitle>
        <CardDescription>
          {editingExpense ? 'Modifica los datos del gasto' : 'Registra un nuevo gasto operativo'}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Concepto */}
            <div className="space-y-2">
              <Label htmlFor="concept">Concepto *</Label>
              <Input
                id="concept"
                placeholder="Ej: Compra de papel, Alquiler local..."
                value={formData.concept}
                onChange={(e) => {
                  setFormData({ ...formData, concept: e.target.value });
                  if (errors.concept) setErrors({ ...errors, concept: '' });
                }}
                className={errors.concept ? 'border-red-500' : ''}
              />
              {errors.concept && (
                <p className="text-sm text-red-500">{errors.concept}</p>
              )}
            </div>

            {/* Monto */}
            <div className="space-y-2">
              <Label htmlFor="amount">Monto *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="amount"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className={`pl-8 ${errors.amount ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount}</p>
              )}
            </div>
          </div>

          {/* Categoría */}
          <div className="space-y-2">
            <Label htmlFor="category">Categoría *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => {
                setFormData({ ...formData, category: value as typeof expenseCategories[number] });
                if (errors.category) setErrors({ ...errors, category: '' });
              }}
            >
              <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map(category => (
                  <SelectItem key={category} value={category}>
                    {formatCategoryName(category)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category}</p>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Detalles adicionales sobre el gasto..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          {/* Vista previa */}
          {formData.concept && formData.amount && !isNaN(parseFloat(formData.amount)) && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700 font-medium mb-1">Vista previa:</p>
              <div className="flex justify-between items-center">
                <span className="text-blue-900">
                  {formData.concept} - {formatCategoryName(formData.category)}
                </span>
                <span className="font-bold text-blue-900">
                  ${parseFloat(formData.amount).toLocaleString('es-AR')}
                </span>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading 
                ? 'Guardando...' 
                : editingExpense ? 'Actualizar Gasto' : 'Registrar Gasto'
              }
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}