'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CashRegister as CashRegisterType } from '@/lib/types';
import { formatCurrency } from '@/lib/format-utils';
import { generateCashRegisterId } from '@/lib/calculations';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { toast } from 'sonner';
import { useState } from 'react';

interface CashRegisterProps {
  date: string;
  dayData: {
    totals: {
      sales: number;
      cashSales: number;
      transferSales: number;
      cardSales: number;
      profit: number;
      expenses: number;
      netProfit: number;
    };
  };
  existingRegister?: CashRegisterType;
  previousDayBalance?: number;
}

export function CashRegister({ date, dayData, existingRegister, previousDayBalance }: CashRegisterProps) {
  const { updateState, state } = useLocalStorage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    openingAmount: existingRegister?.openingAmount?.toString() || previousDayBalance?.toString() || '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Calcular saldo final automáticamente
  const openingAmount = parseFloat(formData.openingAmount) || 0;
  const finalBalance = openingAmount + dayData.totals.cashSales - dayData.totals.expenses;
  
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    const opening = parseFloat(formData.openingAmount);
    if (!formData.openingAmount || isNaN(opening) || opening < 0) {
      newErrors.openingAmount = 'Ingresa un monto de apertura válido';
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
      const cashRegister: CashRegisterType = {
        id: existingRegister?.id || generateCashRegisterId(),
        date,
        openingAmount: parseFloat(formData.openingAmount),
        cashSales: dayData.totals.cashSales,
        totalExpenses: dayData.totals.expenses,
        finalBalance,
        closed: true
      };

      const existingIndex = state.cashRegisters.findIndex(cr => cr.date === date);
      const newCashRegisters = existingIndex >= 0
        ? state.cashRegisters.map(cr => cr.date === date ? cashRegister : cr)
        : [...state.cashRegisters, cashRegister];

      const newState = {
        ...state,
        cashRegisters: newCashRegisters
      };

      updateState(newState);

      toast.success('Cierre de caja realizado exitosamente', {
        description: `Saldo final: ${formatCurrency(finalBalance)}`
      });

    } catch (error) {
      console.error('Error saving cash register:', error);
      toast.error('Error al realizar el cierre de caja');
    } finally {
      setLoading(false);
    }
  };

  const handleOpeningAmountChange = (value: string) => {
    // Permitir solo números y un punto decimal
    const numericValue = value.replace(/[^0-9.]/g, '');
    
    // Asegurar solo un punto decimal
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      const formatted = parts[0] + '.' + parts.slice(1).join('');
      setFormData({ ...formData, openingAmount: formatted });
    } else {
      setFormData({ ...formData, openingAmount: numericValue });
    }
    
    // Limpiar error si existe
    if (errors.openingAmount) {
      setErrors({ ...errors, openingAmount: '' });
    }
  };

  const isReadOnly = existingRegister?.closed || false;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>💳</span>
          <span>
            {existingRegister?.closed ? 'Cierre de Caja Realizado' : 'Realizar Cierre de Caja'}
          </span>
        </CardTitle>
        <CardDescription>
          {existingRegister?.closed 
            ? 'Registro completado del cierre de caja' 
            : 'Registra el monto de apertura para completar el balance diario'
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Monto de apertura */}
          <div className="space-y-2">
            <Label htmlFor="openingAmount">
              Monto de Apertura de Caja {!isReadOnly && '*'}
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <Input
                id="openingAmount"
                placeholder="0.00"
                value={formData.openingAmount}
                onChange={(e) => handleOpeningAmountChange(e.target.value)}
                className={`pl-8 ${errors.openingAmount ? 'border-red-500' : ''}`}
                disabled={isReadOnly}
              />
            </div>
            {errors.openingAmount && (
              <p className="text-sm text-red-500">{errors.openingAmount}</p>
            )}
            {!isReadOnly && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  Monto en efectivo con el que se abrió la caja al inicio del día
                </p>
                {previousDayBalance && !existingRegister && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      💡 <strong>Sugerencia:</strong> El saldo del día anterior fue de {formatCurrency(previousDayBalance)}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Puedes usar este valor si no retiraste efectivo
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Resumen de movimientos */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Resumen de Movimientos</h3>
            
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Apertura de caja:</span>
                <span className="font-medium">
                  {formatCurrency(openingAmount)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-green-600">+ Ventas en efectivo:</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(dayData.totals.cashSales)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-red-600">- Gastos del día:</span>
                <span className="font-medium text-red-600">
                  {formatCurrency(dayData.totals.expenses)}
                </span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center text-lg">
                <span className="font-bold">Saldo Final Esperado:</span>
                <span className={`font-bold text-xl ${
                  finalBalance >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(finalBalance)}
                </span>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-blue-50 p-4 rounded-lg space-y-2">
            <h4 className="font-medium text-blue-900">Información del Día</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Total ventas:</span>
                <p className="font-medium">{formatCurrency(dayData.totals.sales)}</p>
              </div>
              <div>
                <span className="text-blue-700">Ganancia bruta:</span>
                <p className="font-medium">{formatCurrency(dayData.totals.profit)}</p>
              </div>
              <div>
                <span className="text-blue-700">Ventas transferencia:</span>
                <p className="font-medium">{formatCurrency(dayData.totals.transferSales)}</p>
              </div>
              <div>
                <span className="text-blue-700">Ventas tarjeta:</span>
                <p className="font-medium">{formatCurrency(dayData.totals.cardSales)}</p>
              </div>
            </div>
          </div>

          {/* Vista previa del registro */}
          {openingAmount > 0 && !isReadOnly && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700 font-medium mb-2">Vista previa del cierre:</p>
              <div className="space-y-1 text-sm text-green-900">
                <p>• Apertura: {formatCurrency(openingAmount)}</p>
                <p>• Ingresos efectivo: {formatCurrency(dayData.totals.cashSales)}</p>
                <p>• Egresos: {formatCurrency(dayData.totals.expenses)}</p>
                <p className="font-bold pt-1 border-t border-green-300">
                  • Saldo final: {formatCurrency(finalBalance)}
                </p>
              </div>
            </div>
          )}

          {/* Botones */}
          {!isReadOnly && (
            <div className="flex space-x-3">
              <Button
                type="submit"
                disabled={loading || !openingAmount}
                className="flex-1"
              >
                {loading ? 'Procesando...' : 'Confirmar Cierre de Caja'}
              </Button>
            </div>
          )}

          {isReadOnly && (
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-green-800 font-medium">
                ✅ Cierre de caja completado
              </p>
              <p className="text-sm text-green-600 mt-1">
                Este registro ya no puede ser modificado
              </p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}