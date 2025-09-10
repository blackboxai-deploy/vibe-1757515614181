'use client';

import { Header, QuickStats } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { calculateDashboardStats, getStockAlerts } from '@/lib/calculations';
import { formatCurrency, formatStockLevel } from '@/lib/format-utils';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const { state, loading } = useLocalStorage();
  const [stats, setStats] = useState({
    todaySales: 0,
    todayProfit: 0,
    todayExpenses: 0,
    monthSales: 0,
    monthProfit: 0,
    lowStockItems: 0,
    pendingOrders: 0
  });

  useEffect(() => {
    if (!loading) {
      const dashboardStats = calculateDashboardStats(state);
      setStats(dashboardStats);
    }
  }, [state, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  const stockAlerts = getStockAlerts(state.supplies);
  const criticalAlerts = stockAlerts.filter(alert => alert.severity === 'critical');
  const lowAlerts = stockAlerts.filter(alert => alert.severity === 'low');

  const quickStats = [
    {
      label: 'Ventas Hoy',
      value: stats.todaySales,
      icon: '💰',
    },
    {
      label: 'Ganancia Hoy',
      value: stats.todayProfit,
      icon: '📈',
    },
    {
      label: 'Gastos Hoy',
      value: stats.todayExpenses,
      icon: '📋',
    },
    {
      label: 'Ventas del Mes',
      value: stats.monthSales,
      icon: '🗓️',
    }
  ];

  return (
    <div>
      <Header 
        title="Dashboard"
        subtitle="Panel de control principal - Print & Co"
        actions={
          <div className="flex space-x-2">
            <Link href="/ventas">
              <Button>Nueva Venta</Button>
            </Link>
            <Link href="/reportes">
              <Button variant="outline">Ver Reportes</Button>
            </Link>
          </div>
        }
      />

      <QuickStats stats={quickStats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resumen de Ventas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>📊</span>
              <span>Resumen de Ventas</span>
            </CardTitle>
            <CardDescription>
              Análisis de ventas y ganancias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Ventas de Hoy</p>
                  <p className="text-xl font-bold text-blue-600">
                    {formatCurrency(stats.todaySales)}
                  </p>
                </div>
                <div className="text-2xl">💰</div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Ganancia de Hoy</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(stats.todayProfit)}
                  </p>
                </div>
                <div className="text-2xl">📈</div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Ventas del Mes</p>
                  <p className="text-xl font-bold text-gray-700">
                    {formatCurrency(stats.monthSales)}
                  </p>
                </div>
                <div className="text-2xl">🗓️</div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <Link href="/reportes">
                <Button variant="outline" className="w-full">
                  Ver Reportes Detallados
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Alertas de Stock */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span>📦</span>
                <span>Alertas de Stock</span>
              </div>
              {(criticalAlerts.length > 0 || lowAlerts.length > 0) && (
                <div className="flex space-x-2">
                  {criticalAlerts.length > 0 && (
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                      {criticalAlerts.length} críticos
                    </span>
                  )}
                  {lowAlerts.length > 0 && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                      {lowAlerts.length} bajos
                    </span>
                  )}
                </div>
              )}
            </CardTitle>
            <CardDescription>
              Control de inventario y reposición
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stockAlerts.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">✅</div>
                <p className="text-lg font-medium text-green-600">Stock Óptimo</p>
                <p className="text-sm text-gray-500">
                  Todos los insumos tienen stock suficiente
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {stockAlerts.slice(0, 6).map((alert) => (
                  <div 
                    key={alert.supplyId}
                    className={`p-3 rounded-lg border ${
                      alert.severity === 'critical' 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-yellow-50 border-yellow-200'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-sm">{alert.supplyName}</p>
                        <p className="text-xs text-gray-500">
                          Stock mínimo: {alert.minStock}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${
                          alert.severity === 'critical' ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                          {formatStockLevel(alert.currentStock, alert.minStock)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {stockAlerts.length > 6 && (
                  <p className="text-center text-sm text-gray-500 pt-2">
                    y {stockAlerts.length - 6} más...
                  </p>
                )}
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t">
              <Link href="/stock">
                <Button variant="outline" className="w-full">
                  Gestionar Inventario
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accesos Rápidos */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>⚡</span>
            <span>Accesos Rápidos</span>
          </CardTitle>
          <CardDescription>
            Funciones principales de la aplicación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/ventas">
              <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                <span className="text-2xl">💰</span>
                <span>Nueva Venta</span>
              </Button>
            </Link>
            
            <Link href="/egresos">
              <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                <span className="text-2xl">📋</span>
                <span>Registrar Gasto</span>
              </Button>
            </Link>
            
            <Link href="/cierre">
              <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                <span className="text-2xl">💳</span>
                <span>Cierre de Caja</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}