'use client';

import { Header } from '@/components/Header';
import { CashRegister } from '@/components/CashRegister';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { formatCurrency } from '@/lib/format-utils';
import { formatDate, formatDisplayDate } from '@/lib/date-utils';
import { useState, useMemo } from 'react';

export default function CierrePage() {
  const { state } = useLocalStorage();
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  
  const todayStr = formatDate(new Date());
  
  // Obtener datos del día seleccionado
  const dayData = useMemo(() => {
    // Ventas del día
    const daySales = state.sales.filter(sale => sale.date.startsWith(selectedDate));
    const cashSales = daySales.filter(sale => sale.paymentMethod === 'efectivo');
    const transferSales = daySales.filter(sale => sale.paymentMethod === 'transferencia');
    const cardSales = daySales.filter(sale => sale.paymentMethod === 'tarjeta');
    
    // Gastos del día
    const dayExpenses = state.expenses.filter(expense => expense.date.startsWith(selectedDate));
    
    // Cierre de caja del día
    const cashRegister = state.cashRegisters.find(cr => cr.date === selectedDate);
    
    // Obtener el saldo del día anterior
    const previousDate = new Date(selectedDate);
    previousDate.setDate(previousDate.getDate() - 1);
    const previousDateStr = formatDate(previousDate);
    const previousDayRegister = state.cashRegisters.find(cr => cr.date === previousDateStr && cr.closed);
    
    // Totales
    const totalSales = daySales.reduce((sum, sale) => sum + sale.total, 0);
    const totalCashSales = cashSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalTransferSales = transferSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalCardSales = cardSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalProfit = daySales.reduce((sum, sale) => sum + sale.profit, 0);
    const totalExpenses = dayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    return {
      daySales,
      cashSales,
      transferSales,
      cardSales,
      dayExpenses,
      cashRegister,
      previousDayBalance: previousDayRegister?.finalBalance,
      totals: {
        sales: totalSales,
        cashSales: totalCashSales,
        transferSales: totalTransferSales,
        cardSales: totalCardSales,
        profit: totalProfit,
        expenses: totalExpenses,
        netProfit: totalProfit - totalExpenses
      }
    };
  }, [state, selectedDate]);

  // Obtener últimos cierres
  const recentClosures = useMemo(() => {
    return state.cashRegisters
      .filter(cr => cr.closed)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);
  }, [state.cashRegisters]);

  const navigateDate = (direction: 'prev' | 'next') => {
    const currentDate = new Date(selectedDate);
    const newDate = new Date(currentDate);
    
    if (direction === 'next') {
      newDate.setDate(newDate.getDate() + 1);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    
    setSelectedDate(formatDate(newDate));
  };

  const isSelectedToday = selectedDate === todayStr;
  const hasActivity = dayData.daySales.length > 0 || dayData.dayExpenses.length > 0;

  return (
    <div>
      <Header 
        title="Cierre de Caja"
        subtitle="Gestión y balance diario de caja"
      />

      {/* Selector de fecha */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateDate('prev')}
              >
                ← Día Anterior
              </Button>
              
              <div className="text-center">
                <p className="text-sm text-gray-600">Fecha Seleccionada</p>
                <p className="text-lg font-bold">
                  {formatDisplayDate(selectedDate)}
                  {isSelectedToday && (
                    <Badge variant="default" className="ml-2">HOY</Badge>
                  )}
                </p>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateDate('next')}
                disabled={selectedDate >= todayStr}
              >
                Día Siguiente →
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setSelectedDate(todayStr)}
                disabled={isSelectedToday}
              >
                Ir a Hoy
              </Button>
              
              {dayData.cashRegister && (
                <Badge 
                  variant={dayData.cashRegister.closed ? "default" : "secondary"}
                  className="px-3"
                >
                  {dayData.cashRegister.closed ? '✓ Cerrado' : '⏳ Pendiente'}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen del día */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">💰</div>
              <div>
                <p className="text-sm text-gray-600">Total Ventas</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(dayData.totals.sales)}
                </p>
                <p className="text-xs text-gray-500">
                  {dayData.daySales.length} transacciones
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">💵</div>
              <div>
                <p className="text-sm text-gray-600">Ventas Efectivo</p>
                <p className="text-xl font-bold text-blue-600">
                  {formatCurrency(dayData.totals.cashSales)}
                </p>
                <p className="text-xs text-gray-500">
                  {dayData.cashSales.length} en efectivo
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">📋</div>
              <div>
                <p className="text-sm text-gray-600">Gastos</p>
                <p className="text-xl font-bold text-red-600">
                  {formatCurrency(dayData.totals.expenses)}
                </p>
                <p className="text-xs text-gray-500">
                  {dayData.dayExpenses.length} registros
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">📈</div>
              <div>
                <p className="text-sm text-gray-600">Ganancia Neta</p>
                <p className={`text-xl font-bold ${
                  dayData.totals.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(dayData.totals.netProfit)}
                </p>
                <p className="text-xs text-gray-500">
                  Ganancia - Gastos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Desglose de ventas por método de pago */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>💳</span>
            <span>Desglose por Método de Pago</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl mb-2">💵</div>
              <p className="font-medium">Efectivo</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(dayData.totals.cashSales)}
              </p>
              <p className="text-sm text-gray-600">
                {dayData.cashSales.length} transacciones
              </p>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl mb-2">🏦</div>
              <p className="font-medium">Transferencia</p>
              <p className="text-xl font-bold text-blue-600">
                {formatCurrency(dayData.totals.transferSales)}
              </p>
              <p className="text-sm text-gray-600">
                {dayData.transferSales.length} transacciones
              </p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl mb-2">💳</div>
              <p className="font-medium">Tarjeta</p>
              <p className="text-xl font-bold text-purple-600">
                {formatCurrency(dayData.totals.cardSales)}
              </p>
              <p className="text-sm text-gray-600">
                {dayData.cardSales.length} transacciones
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulario de cierre de caja */}
      {hasActivity ? (
        <CashRegister
          date={selectedDate}
          dayData={dayData}
          existingRegister={dayData.cashRegister}
          previousDayBalance={dayData.previousDayBalance}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>📝</span>
              <span>Cierre de Caja</span>
            </CardTitle>
            <CardDescription>
              Sin actividad para realizar cierre de caja
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Sin Actividad
              </h3>
              <p className="text-gray-500">
                No hay ventas ni gastos registrados para {formatDisplayDate(selectedDate)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historial de cierres recientes */}
      {recentClosures.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>📚</span>
              <span>Cierres Recientes</span>
            </CardTitle>
            <CardDescription>
              Últimos 5 cierres de caja realizados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentClosures.map((closure) => (
                <div key={closure.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant="default" className="text-xs">
                      CERRADO
                    </Badge>
                    <div>
                      <p className="font-medium">
                        {formatDisplayDate(closure.date)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Apertura: {formatCurrency(closure.openingAmount)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      {formatCurrency(closure.finalBalance)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Efectivo: {formatCurrency(closure.cashSales)}
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