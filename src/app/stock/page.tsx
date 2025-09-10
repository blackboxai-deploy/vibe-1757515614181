'use client';

import { Header } from '@/components/Header';
import { StockTable } from '@/components/StockTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { getStockAlerts } from '@/lib/calculations';
import { formatCategoryName } from '@/lib/format-utils';
import { useState, useMemo } from 'react';

export default function StockPage() {
  const { state } = useLocalStorage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAlertsOnly, setShowAlertsOnly] = useState(false);

  // Obtener alertas de stock
  const stockAlerts = getStockAlerts(state.supplies);
  const criticalAlerts = stockAlerts.filter(alert => alert.severity === 'critical');
  const lowAlerts = stockAlerts.filter(alert => alert.severity === 'low');

  // Filtrar insumos
  const filteredSupplies = useMemo(() => {
    let supplies = state.supplies;

    // Filtrar por alertas si está activado
    if (showAlertsOnly) {
      const alertSupplyIds = stockAlerts.map(alert => alert.supplyId);
      supplies = supplies.filter(supply => alertSupplyIds.includes(supply.id));
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      supplies = supplies.filter(supply =>
        supply.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por categoría
    if (selectedCategory !== 'all') {
      supplies = supplies.filter(supply => supply.category === selectedCategory);
    }

    return supplies.sort((a, b) => {
      // Primero los críticos, luego los bajos, luego el resto
      const aAlert = stockAlerts.find(alert => alert.supplyId === a.id);
      const bAlert = stockAlerts.find(alert => alert.supplyId === b.id);
      
      if (aAlert && !bAlert) return -1;
      if (!aAlert && bAlert) return 1;
      if (aAlert && bAlert) {
        if (aAlert.severity === 'critical' && bAlert.severity === 'low') return -1;
        if (aAlert.severity === 'low' && bAlert.severity === 'critical') return 1;
      }
      
      return a.name.localeCompare(b.name);
    });
  }, [state.supplies, searchTerm, selectedCategory, showAlertsOnly, stockAlerts]);

  // Obtener categorías únicas
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(state.supplies.map(s => s.category))];
    return uniqueCategories.map(cat => ({
      value: cat,
      label: formatCategoryName(cat)
    }));
  }, [state.supplies]);

  return (
    <div>
      <Header 
        title="Control de Stock"
        subtitle="Gestión de inventario y alertas de reposición"
        stats={[
          { label: 'Items críticos', value: criticalAlerts.length, badge: true },
          { label: 'Stock bajo', value: lowAlerts.length, badge: true },
          { label: 'Total insumos', value: state.supplies.length, badge: true }
        ]}
      />

      {/* Resumen de Alertas */}
      {stockAlerts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {criticalAlerts.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-red-800 flex items-center space-x-2">
                  <span>⚠️</span>
                  <span>Stock Crítico</span>
                </CardTitle>
                <CardDescription>
                  {criticalAlerts.length} insumos necesitan reposición urgente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {criticalAlerts.slice(0, 3).map(alert => (
                    <div key={alert.supplyId} className="flex justify-between items-center">
                      <span className="text-sm font-medium">{alert.supplyName}</span>
                      <span className="text-sm text-red-600 font-bold">
                        {alert.currentStock} / {alert.minStock}
                      </span>
                    </div>
                  ))}
                  {criticalAlerts.length > 3 && (
                    <p className="text-xs text-red-600">
                      y {criticalAlerts.length - 3} más...
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {lowAlerts.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-yellow-800 flex items-center space-x-2">
                  <span>⚡</span>
                  <span>Stock Bajo</span>
                </CardTitle>
                <CardDescription>
                  {lowAlerts.length} insumos están por debajo del mínimo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lowAlerts.slice(0, 3).map(alert => (
                    <div key={alert.supplyId} className="flex justify-between items-center">
                      <span className="text-sm font-medium">{alert.supplyName}</span>
                      <span className="text-sm text-yellow-600 font-bold">
                        {alert.currentStock} / {alert.minStock}
                      </span>
                    </div>
                  ))}
                  {lowAlerts.length > 3 && (
                    <p className="text-xs text-yellow-600">
                      y {lowAlerts.length - 3} más...
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar insumos..."
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
            <div className="flex items-center space-x-2">
              <Button
                variant={showAlertsOnly ? "default" : "outline"}
                onClick={() => setShowAlertsOnly(!showAlertsOnly)}
                className="whitespace-nowrap"
              >
                {showAlertsOnly ? '📋 Ver Todos' : '⚠️ Solo Alertas'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Stock */}
      <StockTable supplies={filteredSupplies} stockAlerts={stockAlerts} />

      {/* Información adicional */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>ℹ️</span>
            <span>Información del Stock</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl mb-2">✅</div>
              <p className="font-medium">Stock Óptimo</p>
              <p className="text-sm text-gray-600">
                {state.supplies.filter(s => s.currentStock > s.minStock).length} insumos
              </p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl mb-2">⚡</div>
              <p className="font-medium">Stock Bajo</p>
              <p className="text-sm text-gray-600">
                {lowAlerts.length} insumos
              </p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl mb-2">⚠️</div>
              <p className="font-medium">Stock Crítico</p>
              <p className="text-sm text-gray-600">
                {criticalAlerts.length} insumos
              </p>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">💡 Consejos de Gestión:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• El stock se actualiza automáticamente con cada venta</li>
              <li>• Los insumos críticos necesitan reposición inmediata</li>
              <li>• Mantén un margen de seguridad del 20% sobre el stock mínimo</li>
              <li>• Revisa regularmente los patrones de consumo para ajustar mínimos</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}