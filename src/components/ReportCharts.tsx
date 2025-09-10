'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SalesReport, Sale, Expense } from '@/lib/types';
import { formatCurrency } from '@/lib/format-utils';
import { getDateRange } from '@/lib/date-utils';
import { useMemo } from 'react';

interface ReportChartsProps {
  report: SalesReport;
  period: 'daily' | 'weekly' | 'monthly';
  sales: Sale[];
  expenses: Expense[];
}

export function ReportCharts({ report, period, sales, expenses }: ReportChartsProps) {
  // Generar datos para gráfico de tendencias (últimos períodos)
  const trendData = useMemo(() => {
    const data = [];
    const currentDate = new Date();
    
    // Generar últimos 7 períodos
    for (let i = 6; i >= 0; i--) {
      const date = new Date(currentDate);
      
      switch (period) {
        case 'daily':
          date.setDate(date.getDate() - i);
          break;
        case 'weekly':
          date.setDate(date.getDate() - (i * 7));
          break;
        case 'monthly':
          date.setMonth(date.getMonth() - i);
          break;
      }
      
      const { start, end } = getDateRange(period, date);
      
      // Filtrar ventas y gastos para este período
      const periodSales = sales.filter(sale => {
        const saleDate = sale.date.split('T')[0];
        return saleDate >= start && saleDate <= end;
      });
      
      const periodExpenses = expenses.filter(expense => {
        const expenseDate = expense.date.split('T')[0];
        return expenseDate >= start && expenseDate <= end;
      });
      
      const totalSales = periodSales.reduce((sum, sale) => sum + sale.total, 0);
      const totalProfit = periodSales.reduce((sum, sale) => sum + sale.profit, 0);
      const totalExpenses = periodExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      data.push({
        period: formatPeriodLabel(start, end, period),
        sales: totalSales,
        profit: totalProfit,
        expenses: totalExpenses,
        net: totalProfit - totalExpenses
      });
    }
    
    return data;
  }, [period, sales, expenses]);

  // Datos para gráfico de distribución de ventas por día de la semana
  const weekdayData = useMemo(() => {
    const weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const data = weekdays.map((day) => ({
      day,
      sales: 0,
      count: 0
    }));

    sales.forEach(sale => {
      if (sale.date >= report.startDate && sale.date <= report.endDate + 'T23:59:59') {
        const dayOfWeek = new Date(sale.date).getDay();
        data[dayOfWeek].sales += sale.total;
        data[dayOfWeek].count += 1;
      }
    });

    return data;
  }, [sales, report.startDate, report.endDate]);

  // Datos para gráfico de gastos por categoría
  const expenseCategoryData = useMemo(() => {
    const categories: { [key: string]: number } = {};
    
    expenses.forEach(expense => {
      if (expense.date >= report.startDate && expense.date <= report.endDate + 'T23:59:59') {
        categories[expense.category] = (categories[expense.category] || 0) + expense.amount;
      }
    });

    return Object.entries(categories).map(([category, amount]) => ({
      category: formatCategoryName(category),
      amount
    })).sort((a, b) => b.amount - a.amount);
  }, [expenses, report.startDate, report.endDate]);

  return (
    <div className="space-y-6">
      {/* Gráfico de tendencias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>📈</span>
            <span>Tendencia de Ventas</span>
          </CardTitle>
          <CardDescription>
            Evolución de ventas, ganancias y gastos (últimos 7 períodos)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trendData.map((item, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{item.period}</h4>
                  <div className="flex space-x-4 text-sm">
                    <span className="text-blue-600">
                      Ventas: {formatCurrency(item.sales)}
                    </span>
                    <span className="text-green-600">
                      Ganancia: {formatCurrency(item.profit)}
                    </span>
                    <span className="text-red-600">
                      Gastos: {formatCurrency(item.expenses)}
                    </span>
                  </div>
                </div>
                
                {/* Barra visual simple */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-16 text-xs text-blue-600">Ventas</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(100, (item.sales / Math.max(...trendData.map(d => d.sales)) * 100))}%`
                        }}
                      />
                    </div>
                    <span className="w-20 text-xs font-mono">{formatCurrency(item.sales)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="w-16 text-xs text-green-600">Ganancia</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(100, (item.profit / Math.max(...trendData.map(d => d.profit)) * 100))}%`
                        }}
                      />
                    </div>
                    <span className="w-20 text-xs font-mono">{formatCurrency(item.profit)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="w-16 text-xs text-red-600">Gastos</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(100, (item.expenses / Math.max(...trendData.map(d => d.expenses)) * 100))}%`
                        }}
                      />
                    </div>
                    <span className="w-20 text-xs font-mono">{formatCurrency(item.expenses)}</span>
                  </div>
                </div>
                
                {/* Ganancia neta */}
                <div className="mt-3 pt-3 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Ganancia Neta:</span>
                    <span className={`font-bold ${item.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(item.net)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución por día de la semana */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>📅</span>
              <span>Ventas por Día de la Semana</span>
            </CardTitle>
            <CardDescription>
              Distribución de ventas en el período actual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weekdayData.map((item) => {
                const maxSales = Math.max(...weekdayData.map(d => d.sales));
                const percentage = maxSales > 0 ? (item.sales / maxSales) * 100 : 0;
                
                return (
                  <div key={item.day} className="flex items-center space-x-3">
                    <span className="w-8 text-sm font-medium">{item.day}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-blue-600 h-4 rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${percentage}%` }}
                      >
                        {item.sales > 0 && (
                          <span className="text-xs text-white font-medium">
                            {item.count}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="w-24 text-sm text-right">
                      {formatCurrency(item.sales)}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Gastos por categoría */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>💳</span>
              <span>Gastos por Categoría</span>
            </CardTitle>
            <CardDescription>
              Distribución de gastos en el período actual
            </CardDescription>
          </CardHeader>
          <CardContent>
            {expenseCategoryData.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-gray-500">No hay gastos en este período</p>
              </div>
            ) : (
              <div className="space-y-3">
                {expenseCategoryData.map((item) => {
                  const percentage = report.totalExpenses > 0 ? (item.amount / report.totalExpenses) * 100 : 0;
                  
                  return (
                    <div key={item.category} className="flex items-center space-x-3">
                      <span className="w-20 text-sm font-medium truncate">{item.category}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-4">
                        <div
                          className="bg-red-500 h-4 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="w-24 text-right">
                        <p className="text-sm font-medium">{formatCurrency(item.amount)}</p>
                        <p className="text-xs text-gray-500">{percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Funciones auxiliares
function formatPeriodLabel(start: string, end: string, period: 'daily' | 'weekly' | 'monthly'): string {
  const startDate = new Date(start);
  
  switch (period) {
    case 'daily':
      return startDate.toLocaleDateString('es-AR', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short' 
      });
    case 'weekly':
      const endDate = new Date(end);
      return `${startDate.getDate()}/${startDate.getMonth() + 1} - ${endDate.getDate()}/${endDate.getMonth() + 1}`;
    case 'monthly':
      return startDate.toLocaleDateString('es-AR', { 
        month: 'long', 
        year: 'numeric' 
      });
    default:
      return start;
  }
}

function formatCategoryName(category: string): string {
  const categoryMap: { [key: string]: string } = {
    'insumos': 'Insumos',
    'servicios': 'Servicios',
    'alquiler': 'Alquiler',
    'impuestos': 'Impuestos',
    'otros': 'Otros'
  };
  
  return categoryMap[category] || category;
}