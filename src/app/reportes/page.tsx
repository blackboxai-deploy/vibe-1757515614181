'use client';

import { Header } from '@/components/Header';
import { ReportCharts } from '@/components/ReportCharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { calculateSalesReport } from '@/lib/calculations';
import { formatCurrency } from '@/lib/format-utils';
import { formatDisplayDate } from '@/lib/date-utils';
import { useState, useMemo } from 'react';

export default function ReportesPage() {
  const { state } = useLocalStorage();
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Generar reporte para el período seleccionado
  const report = useMemo(() => {
    return calculateSalesReport(period, selectedDate, state.sales, state.expenses, state.products);
  }, [period, selectedDate, state.sales, state.expenses, state.products]);

  // Calcular comparación con período anterior
  const previousPeriodDate = useMemo(() => {
    const date = new Date(selectedDate);
    switch (period) {
      case 'daily':
        date.setDate(date.getDate() - 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() - 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() - 1);
        break;
    }
    return date;
  }, [selectedDate, period]);

  const previousReport = useMemo(() => {
    return calculateSalesReport(period, previousPeriodDate, state.sales, state.expenses, state.products);
  }, [period, previousPeriodDate, state.sales, state.expenses, state.products]);

  // Calcular tendencias
  const trends = useMemo(() => {
    const salesTrend = previousReport.totalSales > 0 
      ? ((report.totalSales - previousReport.totalSales) / previousReport.totalSales) * 100 
      : report.totalSales > 0 ? 100 : 0;
      
    const profitTrend = previousReport.totalProfit > 0 
      ? ((report.totalProfit - previousReport.totalProfit) / previousReport.totalProfit) * 100 
      : report.totalProfit > 0 ? 100 : 0;
      
    const expensesTrend = previousReport.totalExpenses > 0 
      ? ((report.totalExpenses - previousReport.totalExpenses) / previousReport.totalExpenses) * 100 
      : report.totalExpenses > 0 ? 100 : 0;

    return { salesTrend, profitTrend, expensesTrend };
  }, [report, previousReport]);

  const getTrendIcon = (trend: number) => {
    if (Math.abs(trend) < 1) return '→';
    return trend > 0 ? '↗️' : '↘️';
  };

  const getTrendColor = (trend: number, isExpense = false) => {
    if (Math.abs(trend) < 1) return 'text-gray-500';
    
    if (isExpense) {
      return trend > 0 ? 'text-red-500' : 'text-green-500';
    }
    return trend > 0 ? 'text-green-500' : 'text-red-500';
  };

  // Navegación entre períodos
  const navigatePeriod = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    const multiplier = direction === 'next' ? 1 : -1;
    
    switch (period) {
      case 'daily':
        newDate.setDate(newDate.getDate() + multiplier);
        break;
      case 'weekly':
        newDate.setDate(newDate.getDate() + (7 * multiplier));
        break;
      case 'monthly':
        newDate.setMonth(newDate.getMonth() + multiplier);
        break;
    }
    
    setSelectedDate(newDate);
  };

  return (
    <div>
      <Header 
        title="Reportes y Estadísticas"
        subtitle="Análisis de rendimiento y tendencias"
      />

      {/* Controles de período */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Select value={period} onValueChange={(value) => setPeriod(value as 'daily' | 'weekly' | 'monthly')}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Diario</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensual</SelectItem>
                </SelectContent>
              </Select>

              <div className="text-center">
                <p className="text-sm text-gray-600">Período Actual</p>
                <p className="font-medium">
                  {formatDisplayDate(report.startDate)} - {formatDisplayDate(report.endDate)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigatePeriod('prev')}
              >
                ← Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(new Date())}
              >
                Hoy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigatePeriod('next')}
              >
                Siguiente →
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Ventas Totales */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ventas Totales</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(report.totalSales)}
                </p>
                <div className="flex items-center mt-1">
                  <span className={`text-sm ${getTrendColor(trends.salesTrend)}`}>
                    {getTrendIcon(trends.salesTrend)} {Math.abs(trends.salesTrend).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="text-3xl">💰</div>
            </div>
          </CardContent>
        </Card>

        {/* Ganancia */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ganancia Bruta</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(report.totalProfit)}
                </p>
                <div className="flex items-center mt-1">
                  <span className={`text-sm ${getTrendColor(trends.profitTrend)}`}>
                    {getTrendIcon(trends.profitTrend)} {Math.abs(trends.profitTrend).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="text-3xl">📈</div>
            </div>
          </CardContent>
        </Card>

        {/* Gastos */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gastos</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(report.totalExpenses)}
                </p>
                <div className="flex items-center mt-1">
                  <span className={`text-sm ${getTrendColor(trends.expensesTrend, true)}`}>
                    {getTrendIcon(trends.expensesTrend)} {Math.abs(trends.expensesTrend).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="text-3xl">📋</div>
            </div>
          </CardContent>
        </Card>

        {/* Ganancia Neta */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ganancia Neta</p>
                <p className={`text-2xl font-bold ${
                  report.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(report.netProfit)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Bruta - Gastos
                </p>
              </div>
              <div className="text-3xl">{report.netProfit >= 0 ? '💎' : '⚠️'}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Cantidad de Ventas</p>
              <p className="text-3xl font-bold text-purple-600">{report.salesCount}</p>
              <p className="text-xs text-gray-500 mt-1">transacciones</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Ticket Promedio</p>
              <p className="text-3xl font-bold text-orange-600">
                {formatCurrency(report.averageTicket)}
              </p>
              <p className="text-xs text-gray-500 mt-1">por venta</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Margen de Ganancia</p>
              <p className="text-3xl font-bold text-indigo-600">
                {report.totalSales > 0 
                  ? `${((report.totalProfit / report.totalSales) * 100).toFixed(1)}%`
                  : '0%'
                }
              </p>
              <p className="text-xs text-gray-500 mt-1">promedio</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <ReportCharts 
        report={report}
        period={period}
        sales={state.sales}
        expenses={state.expenses}
      />

      {/* Productos más vendidos */}
      {report.topProducts.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>🏆</span>
              <span>Top 5 Productos Más Vendidos</span>
            </CardTitle>
            <CardDescription>
              Ranking de productos por ingresos en el período seleccionado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {report.topProducts.map((product, index) => (
                <div key={product.productId} className="flex items-center space-x-4 p-3 rounded-lg border">
                  <div className="flex-shrink-0">
                    <Badge variant={index === 0 ? "default" : "secondary"} className="w-8 h-8 rounded-full flex items-center justify-center">
                      {index + 1}
                    </Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{product.productName}</p>
                    <p className="text-sm text-gray-500">
                      {product.quantity} unidades vendidas
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      {formatCurrency(product.revenue)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {report.totalSales > 0 
                        ? `${((product.revenue / report.totalSales) * 100).toFixed(1)}% del total`
                        : '0%'
                      }
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}