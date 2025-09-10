'use client';

import { Header } from '@/components/Header';
import { ExpenseForm } from '@/components/ExpenseForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { formatCurrency, formatCategoryName } from '@/lib/format-utils';
import { formatDisplayDate, isToday, isThisMonth } from '@/lib/date-utils';
import { useState, useMemo } from 'react';

export default function EgresosPage() {
  const { state } = useLocalStorage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'month'>('all');
  const [showForm, setShowForm] = useState(false);

  // Calcular totales
  const todayExpenses = state.expenses
    .filter(expense => isToday(expense.date))
    .reduce((sum, expense) => sum + expense.amount, 0);

  const monthExpenses = state.expenses
    .filter(expense => isThisMonth(expense.date))
    .reduce((sum, expense) => sum + expense.amount, 0);



  // Filtrar gastos
  const filteredExpenses = useMemo(() => {
    let expenses = state.expenses;

    // Filtrar por fecha
    switch (dateFilter) {
      case 'today':
        expenses = expenses.filter(expense => isToday(expense.date));
        break;
      case 'month':
        expenses = expenses.filter(expense => isThisMonth(expense.date));
        break;
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      expenses = expenses.filter(expense =>
        expense.concept.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por categoría
    if (selectedCategory !== 'all') {
      expenses = expenses.filter(expense => expense.category === selectedCategory);
    }

    return expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [state.expenses, searchTerm, selectedCategory, dateFilter]);

  // Obtener categorías únicas
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(state.expenses.map(e => e.category))];
    return uniqueCategories.map(cat => ({
      value: cat,
      label: formatCategoryName(cat)
    }));
  }, [state.expenses]);

  // Estadísticas por categoría para este mes
  const monthlyStats = useMemo(() => {
    const monthExpensesList = state.expenses.filter(expense => isThisMonth(expense.date));
    const categoryTotals: { [key: string]: number } = {};
    
    monthExpensesList.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: (amount / monthExpenses) * 100
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [state.expenses, monthExpenses]);

  return (
    <div>
      <Header 
        title="Gestión de Egresos"
        subtitle="Control de gastos operativos"
        stats={[
          { label: 'Gastos hoy', value: todayExpenses },
          { label: 'Gastos del mes', value: monthExpenses },
          { label: 'Total registrados', value: state.expenses.length, badge: true }
        ]}
        actions={
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancelar' : '+ Nuevo Gasto'}
          </Button>
        }
      />

      {/* Formulario de nuevo gasto */}
      {showForm && (
        <div className="mb-6">
          <ExpenseForm onCancel={() => setShowForm(false)} onSuccess={() => setShowForm(false)} />
        </div>
      )}

      {/* Resumen rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">💰</div>
              <div>
                <p className="text-sm text-gray-600">Gastos de Hoy</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(todayExpenses)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">📅</div>
              <div>
                <p className="text-sm text-gray-600">Gastos del Mes</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(monthExpenses)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">📊</div>
              <div>
                <p className="text-sm text-gray-600">Promedio Diario</p>
                <p className="text-2xl font-bold text-gray-600">
                  {formatCurrency(monthExpenses / new Date().getDate())}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estadísticas por categoría */}
      {monthlyStats.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Gastos por Categoría - Este Mes</CardTitle>
            <CardDescription>
              Distribución de gastos por categoría
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {monthlyStats.map(({ category, amount, percentage }) => (
                <div key={category} className="flex items-center space-x-3">
                  <Badge variant="secondary" className="w-20 justify-center">
                    {formatCategoryName(category)}
                  </Badge>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-24 text-right">
                    <p className="font-semibold">{formatCurrency(amount)}</p>
                    <p className="text-xs text-gray-500">{percentage.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar gastos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="w-full md:w-48">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-36">
              <Select value={dateFilter} onValueChange={(value) => setDateFilter(value as 'all' | 'today' | 'month')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="month">Este mes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de gastos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>📋</span>
            <span>Historial de Gastos</span>
          </CardTitle>
          <CardDescription>
            Mostrando {filteredExpenses.length} registros
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay gastos registrados
              </h3>
              <p className="text-gray-500 mb-4">
                {state.expenses.length === 0 
                  ? 'Comienza registrando tu primer gasto'
                  : 'No hay gastos que coincidan con los filtros'
                }
              </p>
              {!showForm && (
                <Button onClick={() => setShowForm(true)}>
                  Registrar Primer Gasto
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary">
                        {formatCategoryName(expense.category)}
                      </Badge>
                      <div>
                        <p className="font-medium">{expense.concept}</p>
                        {expense.description && (
                          <p className="text-sm text-gray-500">{expense.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">
                      {formatCurrency(expense.amount)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDisplayDate(expense.date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}