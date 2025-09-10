'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Product, Supply } from '@/lib/types';
import { formatCurrency, formatCategoryName } from '@/lib/format-utils';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { toast } from 'sonner';
import { useState } from 'react';

interface ProductCreatorProps {
  onProductCreated?: () => void;
  supplies: Supply[];
}

const productCategories = [
  'impresion',
  'encuadernacion', 
  'fotografico',
  'autoadhesivo'
] as const;

export function ProductCreator({ onProductCreated, supplies }: ProductCreatorProps) {
  const { updateState, state } = useLocalStorage();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'impresion' as const,
    price: '',
    cost: '',
    description: '',
    requiredSupplies: {} as { [supplyId: string]: number }
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'impresion',
      price: '',
      cost: '',
      description: '',
      requiredSupplies: {}
    });
    setErrors({});
  };

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

    if (!formData.category) {
      newErrors.category = 'Selecciona una categoría';
    }

    const hasSupplies = Object.keys(formData.requiredSupplies).length > 0;
    if (!hasSupplies) {
      newErrors.supplies = 'Selecciona al menos un insumo requerido';
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
      // Generar ID único
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000);
      const productId = `custom_${timestamp}_${random}`;

      const newProduct: Product = {
        id: productId,
        name: formData.name.trim(),
        category: formData.category,
        price: parseFloat(formData.price),
        cost: parseFloat(formData.cost),
        requiredSupplies: formData.requiredSupplies,
        description: formData.description.trim() || undefined
      };

      const newState = {
        ...state,
        products: [...state.products, newProduct]
      };

      updateState(newState);

      toast.success('Producto creado correctamente', {
        description: `${newProduct.name} - ${formatCurrency(newProduct.price)}`
      });

      resetForm();
      setOpen(false);
      onProductCreated?.();
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Error al crear el producto');
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

  const handleSupplyChange = (supplyId: string, quantity: number) => {
    const newSupplies = { ...formData.requiredSupplies };
    
    if (quantity > 0) {
      newSupplies[supplyId] = quantity;
    } else {
      delete newSupplies[supplyId];
    }
    
    setFormData({ ...formData, requiredSupplies: newSupplies });
    
    if (errors.supplies) {
      setErrors({ ...errors, supplies: '' });
    }
  };

  const currentProfit = parseFloat(formData.price) - parseFloat(formData.cost);
  const newMargin = parseFloat(formData.price) > 0 ? 
    ((currentProfit / parseFloat(formData.price)) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) {
        resetForm();
      }
    }}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
          ➕ Nuevo Producto
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>➕</span>
            <span>Crear Nuevo Producto</span>
          </DialogTitle>
          <DialogDescription>
            Agrega un nuevo producto o servicio a tu catálogo
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                placeholder="Ej: Impresión A4 Color Premium"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Categoría */}
            <div className="space-y-2">
              <Label htmlFor="category">Categoría *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => {
                  setFormData({ ...formData, category: value as any });
                  if (errors.category) setErrors({ ...errors, category: '' });
                }}
              >
                <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {productCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {formatCategoryName(category)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-500">{errors.category}</p>
              )}
            </div>
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
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripción detallada del producto o servicio..."
              rows={3}
            />
          </div>

          {/* Insumos requeridos */}
          <div className="space-y-4">
            <div>
              <Label>Insumos Requeridos *</Label>
              <p className="text-sm text-gray-500 mt-1">
                Selecciona los insumos que se consumen al vender este producto
              </p>
              {errors.supplies && (
                <p className="text-sm text-red-500 mt-1">{errors.supplies}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-60 overflow-y-auto border rounded-lg p-4">
              {supplies.map((supply) => (
                <div key={supply.id} className="flex items-center space-x-3 p-2 border rounded hover:bg-gray-50">
                  <Checkbox
                    id={`supply-${supply.id}`}
                    checked={supply.id in formData.requiredSupplies}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleSupplyChange(supply.id, 1);
                      } else {
                        handleSupplyChange(supply.id, 0);
                      }
                    }}
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={`supply-${supply.id}`}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {supply.name}
                    </Label>
                    <p className="text-xs text-gray-500">
                      Stock: {supply.currentStock} {supply.unit}
                    </p>
                  </div>
                  {supply.id in formData.requiredSupplies && (
                    <Input
                      type="number"
                      min="1"
                      value={formData.requiredSupplies[supply.id]}
                      onChange={(e) => handleSupplyChange(supply.id, parseInt(e.target.value) || 1)}
                      className="w-16 h-8 text-center"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Vista previa */}
          {formData.name && formData.price && formData.cost && !isNaN(parseFloat(formData.price)) && !isNaN(parseFloat(formData.cost)) && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-3">Vista Previa del Producto:</h4>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-blue-700 font-medium">Información:</p>
                  <p>Nombre: {formData.name}</p>
                  <p>Categoría: {formatCategoryName(formData.category)}</p>
                  <p>Precio: {formatCurrency(parseFloat(formData.price))}</p>
                  <p>Costo: {formatCurrency(parseFloat(formData.cost))}</p>
                </div>
                
                <div>
                  <p className="text-blue-700 font-medium">Rentabilidad:</p>
                  <p className={`font-medium ${currentProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Ganancia: {formatCurrency(currentProfit)}
                  </p>
                  <p className={`font-medium ${newMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Margen: {newMargin.toFixed(1)}%
                  </p>
                  <p>Insumos: {Object.keys(formData.requiredSupplies).length} seleccionados</p>
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
          <div className="flex space-x-3 pt-4 border-t">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              {loading ? 'Creando...' : '✓ Crear Producto'}
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