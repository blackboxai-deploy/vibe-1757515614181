'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Supply, StockAlert } from '@/lib/types';
import { formatCurrency, formatCategoryName } from '@/lib/format-utils';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useState } from 'react';
import { toast } from 'sonner';

interface StockTableProps {
  supplies: Supply[];
  stockAlerts: StockAlert[];
}

export function StockTable({ supplies, stockAlerts }: StockTableProps) {
  const { updateState, state } = useLocalStorage();
  const [editingStock, setEditingStock] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});

  const getStockStatus = (supply: Supply) => {
    const alert = stockAlerts.find(a => a.supplyId === supply.id);
    if (alert) {
      return alert.severity === 'critical' ? 'critical' : 'low';
    }
    return 'ok';
  };

  const getStatusColor = (status: 'ok' | 'low' | 'critical') => {
    switch (status) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'low':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const getStatusIcon = (status: 'ok' | 'low' | 'critical') => {
    switch (status) {
      case 'critical':
        return '⚠️';
      case 'low':
        return '⚡';
      default:
        return '✅';
    }
  };

  const getStatusText = (status: 'ok' | 'low' | 'critical') => {
    switch (status) {
      case 'critical':
        return 'CRÍTICO';
      case 'low':
        return 'BAJO';
      default:
        return 'OK';
    }
  };

  const handleStockEdit = (supplyId: string, currentStock: number) => {
    setEditingStock({
      ...editingStock,
      [supplyId]: currentStock
    });
  };

  const handleStockUpdate = async (supplyId: string) => {
    const newStock = editingStock[supplyId];
    if (newStock === undefined || newStock < 0) {
      toast.error('Stock inválido');
      return;
    }

    setLoading({ ...loading, [supplyId]: true });

    try {
      const newState = {
        ...state,
        supplies: state.supplies.map(supply =>
          supply.id === supplyId 
            ? { ...supply, currentStock: newStock }
            : supply
        )
      };

      updateState(newState);
      
      // Limpiar el estado de edición
      const newEditingStock = { ...editingStock };
      delete newEditingStock[supplyId];
      setEditingStock(newEditingStock);

      toast.success('Stock actualizado correctamente');
    } catch (error) {
      toast.error('Error al actualizar el stock');
      console.error('Error updating stock:', error);
    } finally {
      setLoading({ ...loading, [supplyId]: false });
    }
  };

  const handleCancelEdit = (supplyId: string) => {
    const newEditingStock = { ...editingStock };
    delete newEditingStock[supplyId];
    setEditingStock(newEditingStock);
  };

  const handleQuickAdjust = async (supplyId: string, adjustment: number) => {
    const supply = supplies.find(s => s.id === supplyId);
    if (!supply) return;

    const newStock = Math.max(0, supply.currentStock + adjustment);
    setLoading({ ...loading, [supplyId]: true });

    try {
      const newState = {
        ...state,
        supplies: state.supplies.map(s =>
          s.id === supplyId 
            ? { ...s, currentStock: newStock }
            : s
        )
      };

      updateState(newState);
      
      toast.success(`Stock ${adjustment > 0 ? 'aumentado' : 'reducido'} en ${Math.abs(adjustment)}`);
    } catch (error) {
      toast.error('Error al ajustar el stock');
      console.error('Error adjusting stock:', error);
    } finally {
      setLoading({ ...loading, [supplyId]: false });
    }
  };

  if (supplies.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Control de Stock</CardTitle>
          <CardDescription>No se encontraron insumos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-lg font-medium text-gray-900 mb-2">
              No hay insumos
            </p>
            <p className="text-gray-500">
              No se encontraron insumos que coincidan con los filtros
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>📦</span>
          <span>Inventario de Insumos</span>
        </CardTitle>
        <CardDescription>
          Mostrando {supplies.length} insumos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Insumo</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-center">Stock Actual</TableHead>
                <TableHead className="text-center">Stock Mínimo</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-right">Costo Unit.</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {supplies.map((supply) => {
                const status = getStockStatus(supply);
                const isEditing = editingStock[supply.id] !== undefined;
                const isLoading = loading[supply.id] || false;

                return (
                  <TableRow key={supply.id} className={status !== 'ok' ? 'bg-red-50' : ''}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{supply.name}</p>
                        <p className="text-xs text-gray-500">{supply.unit}</p>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {formatCategoryName(supply.category)}
                      </Badge>
                    </TableCell>
                    
                    <TableCell className="text-center">
                      {isEditing ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            min="0"
                            value={editingStock[supply.id]}
                            onChange={(e) => setEditingStock({
                              ...editingStock,
                              [supply.id]: parseInt(e.target.value) || 0
                            })}
                            className="w-20 h-8 text-center"
                          />
                        </div>
                      ) : (
                        <div className="font-mono font-bold text-lg">
                          {supply.currentStock}
                        </div>
                      )}
                    </TableCell>
                    
                    <TableCell className="text-center">
                      <span className="font-mono text-gray-600">
                        {supply.minStock}
                      </span>
                    </TableCell>
                    
                    <TableCell className="text-center">
                      <Badge className={`${getStatusColor(status)} text-xs`}>
                        {getStatusIcon(status)} {getStatusText(status)}
                      </Badge>
                    </TableCell>
                    
                    <TableCell className="text-right">
                      {formatCurrency(supply.cost)}
                    </TableCell>
                    
                    <TableCell className="text-center">
                      {isEditing ? (
                        <div className="flex items-center space-x-1">
                          <Button
                            size="sm"
                            onClick={() => handleStockUpdate(supply.id)}
                            disabled={isLoading}
                            className="h-7 px-2 text-xs"
                          >
                            {isLoading ? '...' : '✓'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelEdit(supply.id)}
                            disabled={isLoading}
                            className="h-7 px-2 text-xs"
                          >
                            ✕
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStockEdit(supply.id, supply.currentStock)}
                            className="h-7 px-2 text-xs"
                          >
                            ✏️
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuickAdjust(supply.id, -1)}
                            disabled={isLoading}
                            className="h-7 px-2 text-xs"
                          >
                            -
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuickAdjust(supply.id, 1)}
                            disabled={isLoading}
                            className="h-7 px-2 text-xs"
                          >
                            +
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-4 text-sm text-gray-500 text-center">
          Tip: Haz clic en ✏️ para editar el stock manualmente, o usa +/- para ajustes rápidos
        </div>
      </CardContent>
    </Card>
  );
}