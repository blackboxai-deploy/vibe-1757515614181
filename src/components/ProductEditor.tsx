'use client';

import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Product } from '@/lib/types';
import { formatCurrency, formatCategoryName, formatProfitMargin } from '@/lib/format-utils';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { toast } from 'sonner';
import { useState } from 'react';

interface ProductEditorProps {
  product: Product;
  onProductUpdated?: () => void;
}

export function ProductEditor({ product, onProductUpdated }: ProductEditorProps) {
  const { updateState, state } = useLocalStorage();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: product.name,
    price: product.price.toString(),
    cost: product.cost.toString(),
    description: product.description || ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    const price = parseFloat(formData.price);
    if (!formData.price || isNaN(price) || price <= 0) {
      newErrors.price = 'Ingresa un precio válido mayor a 0';
    }

    const cost = parseFloat(formData.cost);
    if (!formData.cost || isNaN(cost) || cost < 0) {
      newErrors.cost = 'Ingresa un costo válido mayor o igual a 0';
    }

    if (price > 0 && cost > 0 && cost >= price) {
      newErrors.cost = 'El costo debe ser menor al precio de venta';
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
      const updatedProduct: Product = {
        ...product,
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        cost: parseFloat(formData.cost),
        description: formData.description.trim() || undefined
      };

      const newState = {
        ...state,
        products: state.products.map(p => 
          p.id === product.id ? updatedProduct : p
        )
      };

      updateState(newState);

      toast.success('Producto actualizado correctamente', {
        description: `${updatedProduct.name} - ${formatCurrency(updatedProduct.price)}`
      });

      setOpen(false);
      onProductUpdated?.();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Error al actualizar el producto');
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = (value: string, field: 'price' | 'cost') => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    const parts = numericValue.split('.');
    let formatted = numericValue;
    
    if (parts.length > 2) {
      formatted = parts[0] + '.' + parts.slice(1).join('');
    }
    
    setFormData({ ...formData, [field]: formatted });
    
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const currentProfit = parseFloat(formData.price) - parseFloat(formData.cost);
  const newMargin = parseFloat(formData.price) > 0 ? 
    ((currentProfit / parseFloat(formData.price)) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          ✏️ Editar
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>✏️</span>
            <span>Editar Producto</span>
          </DialogTitle>
          <DialogDescription>
            Modifica los precios y datos del producto
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información actual */}
          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-medium text-gray-900">{product.name}</h3>
                <Badge variant="secondary" className="mt-1">
                  {formatCategoryName(product.category)}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Precio actual</p>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(product.price)}
                </p>
                <p className="text-xs text-gray-500">
                  Margen: {formatProfitMargin(product.price, product.cost)}
                </p>
              </div>
            </div>
          </div>

          {/* Nombre del producto */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Producto *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: '' });
              }}
              className={errors.name ? 'border-red-500' : ''}
              placeholder="Nombre del producto"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Precios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Precio de venta */}
            <div className="space-y-2">
              <Label htmlFor="price">Precio de Venta *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="price"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => handlePriceChange(e.target.value, 'price')}
                  className={`pl-8 ${errors.price ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.price && (
                <p className="text-sm text-red-500">{errors.price}</p>
              )}
            </div>

            {/* Costo */}
            <div className="space-y-2">
              <Label htmlFor="cost">Costo de Producción *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="cost"
                  placeholder="0.00"
                  value={formData.cost}
                  onChange={(e) => handlePriceChange(e.target.value, 'cost')}
                  className={`pl-8 ${errors.cost ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.cost && (
                <p className="text-sm text-red-500">{errors.cost}</p>
              )}
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripción del producto"
            />
          </div>

          {/* Vista previa de cambios */}
          {(formData.price && formData.cost && !isNaN(parseFloat(formData.price)) && !isNaN(parseFloat(formData.cost))) && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-3">Vista Previa de Cambios:</h4>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-blue-700 font-medium">Antes:</p>
                  <p>Precio: {formatCurrency(product.price)}</p>
                  <p>Costo: {formatCurrency(product.cost)}</p>
                  <p>Ganancia: {formatCurrency(product.price - product.cost)}</p>
                  <p>Margen: {formatProfitMargin(product.price, product.cost)}</p>
                </div>
                
                <div>
                  <p className="text-blue-700 font-medium">Después:</p>
                  <p>Precio: {formatCurrency(parseFloat(formData.price))}</p>
                  <p>Costo: {formatCurrency(parseFloat(formData.cost))}</p>
                  <p className={`font-medium ${currentProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Ganancia: {formatCurrency(currentProfit)}
                  </p>
                  <p className={`font-medium ${newMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Margen: {newMargin.toFixed(1)}%
                  </p>
                </div>
              </div>
              
              {currentProfit < 0 && (
                <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
                  ⚠️ Advertencia: El costo es mayor al precio de venta (pérdida)
                </div>
              )}
            </div>
          )}

          {/* Botones */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Guardando...' : 'Actualizar Producto'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}