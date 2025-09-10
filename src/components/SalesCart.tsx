'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { CartItem, Sale, SaleItem } from '@/lib/types';
import { formatCurrency } from '@/lib/format-utils';
import { formatDateTime } from '@/lib/date-utils';
import { calculateCartTotal, calculateStockDeduction, canProcessSale, generateSaleId } from '@/lib/calculations';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { toast } from 'sonner';
import { useState } from 'react';

interface SalesCartProps {
  items: CartItem[];
  onUpdateItem: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
}

export function SalesCart({ items, onUpdateItem, onRemoveItem, onClearCart }: SalesCartProps) {
  const { state, addSale, updateStockAfterSale } = useLocalStorage();
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'transferencia' | 'tarjeta'>('efectivo');
  const [processing, setProcessing] = useState(false);

  const { total, totalProfit, itemCount } = calculateCartTotal(items);

  const handleProcessSale = async () => {
    if (items.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    setProcessing(true);

    try {
      // Verificar disponibilidad de stock
      const stockCheck = canProcessSale(items, state.supplies);
      if (!stockCheck.canProcess) {
        toast.error('Stock insuficiente para procesar la venta');
        stockCheck.missingItems.forEach(item => {
          toast.error(item);
        });
        setProcessing(false);
        return;
      }

      // Crear la venta
      const saleItems: SaleItem[] = items.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: item.product.price,
        subtotal: item.subtotal,
        unitCost: item.product.cost,
        profit: item.profit
      }));

      const sale: Sale = {
        id: generateSaleId(),
        date: formatDateTime(new Date()),
        items: saleItems,
        total,
        profit: totalProfit,
        paymentMethod
      };

      // Guardar la venta
      addSale(sale);

      // Actualizar stock
      const stockDeductions = calculateStockDeduction(items);
      updateStockAfterSale(stockDeductions);

      // Limpiar carrito
      onClearCart();

      toast.success('Venta procesada exitosamente', {
        description: `Total: ${formatCurrency(total)} | Ganancia: ${formatCurrency(totalProfit)}`
      });

    } catch (error) {
      console.error('Error processing sale:', error);
      toast.error('Error al procesar la venta');
    } finally {
      setProcessing(false);
    }
  };

  const handleQuantityChange = (productId: string, value: string) => {
    const quantity = parseInt(value) || 0;
    onUpdateItem(productId, quantity);
  };

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>🛒</span>
            <span>Carrito de Venta</span>
          </CardTitle>
          <CardDescription>
            Agrega productos para comenzar una venta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🛒</div>
            <p className="text-gray-500">Carrito vacío</p>
            <p className="text-sm text-gray-400 mt-1">
              Selecciona productos del catálogo
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span>🛒</span>
            <span>Carrito</span>
          </div>
          <span className="text-sm font-normal text-gray-500">
            {itemCount} items
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Items del carrito */}
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {items.map((item) => (
            <div key={item.product.id} className="flex items-center space-x-3 p-3 border rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm leading-tight">
                  {item.product.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatCurrency(item.product.price)} c/u
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(item.product.id, e.target.value)}
                  className="w-16 h-8 text-center text-sm"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveItem(item.product.id)}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  ✕
                </Button>
              </div>
              
              <div className="text-right min-w-0">
                <p className="font-medium text-sm">
                  {formatCurrency(item.subtotal)}
                </p>
                <p className="text-xs text-green-600">
                  +{formatCurrency(item.profit)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Resumen */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span className="font-medium">{formatCurrency(total)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Ganancia:</span>
            <span className="font-medium text-green-600">{formatCurrency(totalProfit)}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Método de pago */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Método de pago:</label>
          <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'efectivo' | 'transferencia' | 'tarjeta')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="efectivo">💵 Efectivo</SelectItem>
              <SelectItem value="transferencia">🏦 Transferencia</SelectItem>
              <SelectItem value="tarjeta">💳 Tarjeta</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Acciones */}
        <div className="space-y-2">
          <Button
            onClick={handleProcessSale}
            disabled={processing}
            className="w-full"
            size="lg"
          >
            {processing ? 'Procesando...' : 'Procesar Venta'}
          </Button>
          
          <Button
            onClick={onClearCart}
            variant="outline"
            className="w-full"
          >
            Limpiar Carrito
          </Button>
        </div>

        {/* Información adicional */}
        <div className="text-xs text-gray-500 text-center pt-2 border-t">
          <p>La venta actualizará automáticamente el stock</p>
        </div>
      </CardContent>
    </Card>
  );
}