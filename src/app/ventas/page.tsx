'use client';

import { Header } from '@/components/Header';
import { ProductCard } from '@/components/ProductCard';
import { SalesCart } from '@/components/SalesCart';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useState, useMemo } from 'react';
import { CartItem, Product } from '@/lib/types';
import { calculateCartItem } from '@/lib/calculations';
import { formatCategoryName } from '@/lib/format-utils';

export default function VentasPage() {
  const { state } = useLocalStorage();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filtrar productos
  const filteredProducts = useMemo(() => {
    return state.products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [state.products, searchTerm, selectedCategory]);

  // Obtener categorías únicas
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(state.products.map(p => p.category))];
    return uniqueCategories.map(cat => ({
      value: cat,
      label: formatCategoryName(cat)
    }));
  }, [state.products]);

  // Funciones del carrito
  const addToCart = (product: Product, quantity: number = 1) => {
    const existingItemIndex = cart.findIndex(item => item.product.id === product.id);
    
    if (existingItemIndex >= 0) {
      const updatedCart = [...cart];
      const newQuantity = updatedCart[existingItemIndex].quantity + quantity;
      updatedCart[existingItemIndex] = calculateCartItem(product, newQuantity);
      setCart(updatedCart);
    } else {
      const newItem = calculateCartItem(product, quantity);
      setCart([...cart, newItem]);
    }
  };

  const updateCartItem = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    const updatedCart = cart.map(item => 
      item.product.id === productId 
        ? calculateCartItem(item.product, quantity)
        : item
    );
    setCart(updatedCart);
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <div>
      <Header 
        title="Gestión de Ventas"
        subtitle="Catálogo de productos y servicios"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Catálogo de Productos */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filtros */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="sm:w-48">
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
            </div>
          </div>

          {/* Lista de Productos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron productos
                </h3>
                <p className="text-gray-500">
                  Intenta cambiar los filtros o el término de búsqueda
                </p>
              </div>
            ) : (
              filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                  inCartQuantity={cart.find(item => item.product.id === product.id)?.quantity || 0}
                />
              ))
            )}
          </div>

          {/* Información de productos */}
          {filteredProducts.length > 0 && (
            <div className="text-sm text-gray-500 text-center">
              Mostrando {filteredProducts.length} de {state.products.length} productos
            </div>
          )}
        </div>

        {/* Carrito de Ventas */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <SalesCart
              items={cart}
              onUpdateItem={updateCartItem}
              onRemoveItem={removeFromCart}
              onClearCart={clearCart}
            />
          </div>
        </div>
      </div>
    </div>
  );
}