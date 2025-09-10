'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ProductEditor } from '@/components/ProductEditor';
import { Product } from '@/lib/types';
import { formatCurrency, formatCategoryName, formatProfitMargin } from '@/lib/format-utils';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
  inCartQuantity?: number;
  showEditor?: boolean;
  onProductUpdated?: () => void;
}

export function ProductCard({ product, onAddToCart, inCartQuantity = 0, showEditor = false, onProductUpdated }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);

  const categoryColor = getCategoryColor(product.category);

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setQuantity(1); // Reset quantity after adding
  };

  const handleQuickAdd = () => {
    onAddToCart(product, 1);
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg leading-tight mb-1">
              {product.name}
            </CardTitle>
            <CardDescription className="text-sm">
              {product.description || 'Sin descripción disponible'}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end space-y-2 shrink-0">
            <Badge 
              variant="secondary" 
              className={categoryColor}
            >
              {formatCategoryName(product.category)}
            </Badge>
            {showEditor && (
              <ProductEditor 
                product={product} 
                onProductUpdated={onProductUpdated}
              />
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Precios */}
        <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-600">Precio de venta</p>
            <p className="text-xl font-bold text-green-600">
              {formatCurrency(product.price)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Costo: {formatCurrency(product.cost)}</p>
            <p className="text-xs text-green-600 font-medium">
              Margen: {formatProfitMargin(product.price, product.cost)}
            </p>
          </div>
        </div>

        {/* Ganancia por unidad */}
        <div className="text-center py-1">
          <span className="text-sm text-gray-600">Ganancia: </span>
          <span className="font-semibold text-blue-600">
            {formatCurrency(product.price - product.cost)}
          </span>
          <span className="text-sm text-gray-500"> por unidad</span>
        </div>

        {/* En carrito indicator */}
        {inCartQuantity > 0 && (
          <div className="flex items-center justify-center py-2 px-3 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-sm text-blue-700 font-medium">
              🛒 {inCartQuantity} en el carrito
            </span>
          </div>
        )}

        {/* Controles de cantidad y agregar */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 flex-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="h-8 w-8 p-0"
            >
              -
            </Button>
            <Input
              type="number"
              min="1"
              max="99"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="h-8 text-center w-16"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuantity(quantity + 1)}
              className="h-8 w-8 p-0"
            >
              +
            </Button>
          </div>
          
          <Button
            onClick={handleAddToCart}
            className="flex-1"
            size="sm"
          >
            Agregar
          </Button>
        </div>

        {/* Botón de agregar rápido */}
        <Button
          variant="outline"
          onClick={handleQuickAdd}
          className="w-full"
          size="sm"
        >
          + Agregar 1 rápido
        </Button>

        {/* Total si se agrega la cantidad actual */}
        {quantity > 1 && (
          <div className="text-center pt-2 border-t">
            <p className="text-sm text-gray-600">
              Total por {quantity} unidades:{' '}
              <span className="font-bold text-gray-900">
                {formatCurrency(product.price * quantity)}
              </span>
            </p>
            <p className="text-xs text-green-600">
              Ganancia: {formatCurrency((product.price - product.cost) * quantity)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Función auxiliar para obtener colores de categoría
function getCategoryColor(category: string): string {
  const colorMap: { [key: string]: string } = {
    'impresion': 'bg-blue-100 text-blue-800',
    'encuadernacion': 'bg-purple-100 text-purple-800',
    'fotografico': 'bg-green-100 text-green-800',
    'autoadhesivo': 'bg-orange-100 text-orange-800',
  };
  
  return colorMap[category] || 'bg-gray-100 text-gray-800';
}