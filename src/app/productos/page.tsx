'use client';

import { Header } from '@/components/Header';
import { ProductCard } from '@/components/ProductCard';
import { ProductCreator } from '@/components/ProductCreator';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useState, useMemo } from 'react';
import { formatCategoryName } from '@/lib/format-utils';

export default function ProductosPage() {
  const { state } = useLocalStorage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [refreshKey, setRefreshKey] = useState(0);

  // Forzar re-render cuando se actualiza un producto
  const handleProductUpdated = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Filtrar productos
  const filteredProducts = useMemo(() => {
    return state.products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [state.products, searchTerm, selectedCategory, refreshKey]);

  // Obtener categorías únicas
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(state.products.map(p => p.category))];
    return uniqueCategories.map(cat => ({
      value: cat,
      label: formatCategoryName(cat)
    }));
  }, [state.products]);

  // Calcular estadísticas
  const stats = useMemo(() => {
    const totalProducts = state.products.length;
    const avgPrice = state.products.reduce((sum, p) => sum + p.price, 0) / totalProducts;
    const avgMargin = state.products.reduce((sum, p) => sum + ((p.price - p.cost) / p.price * 100), 0) / totalProducts;
    const lowMarginCount = state.products.filter(p => ((p.price - p.cost) / p.price * 100) < 30).length;

    return {
      totalProducts,
      avgPrice,
      avgMargin,
      lowMarginCount
    };
  }, [state.products, refreshKey]);

  // Función dummy para agregar al carrito (no se usa en esta página)
  const dummyAddToCart = () => {};

  return (
    <div>
      <Header 
        title="Gestión de Productos"
        subtitle="Administra precios y datos de productos"
        stats={[
          { label: 'Total productos', value: stats.totalProducts, badge: true },
          { label: 'Precio promedio', value: Math.round(stats.avgPrice) },
          { label: 'Margen promedio', value: `${stats.avgMargin.toFixed(1)}%`, badge: false },
          { label: 'Margen bajo (<30%)', value: stats.lowMarginCount, badge: true }
        ]}
        actions={
          <ProductCreator 
            supplies={state.supplies}
            onProductCreated={handleProductUpdated}
          />
        }
      />

      {/* Información importante */}
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-blue-900 flex items-center space-x-2">
            <span>💡</span>
            <span>Gestión de Precios</span>
          </CardTitle>
          <CardDescription className="text-blue-700">
            Desde aquí puedes modificar los precios de venta y costos de todos tus productos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-blue-900">
            <div className="flex items-center space-x-2">
              <span className="font-medium">➕ Crear:</span>
              <span>Agrega nuevos productos</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">✏️ Editar:</span>
              <span>Modifica productos existentes</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">💰 Precios:</span>
              <span>Ajusta precios y costos</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">📊 Margen:</span>
              <span>Control de rentabilidad</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl mb-2">📦</div>
              <p className="text-sm text-gray-600">Total Productos</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalProducts}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl mb-2">💰</div>
              <p className="text-sm text-gray-600">Precio Promedio</p>
              <p className="text-2xl font-bold text-green-600">${Math.round(stats.avgPrice)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl mb-2">📈</div>
              <p className="text-sm text-gray-600">Margen Promedio</p>
              <p className="text-2xl font-bold text-purple-600">{stats.avgMargin.toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl mb-2">⚠️</div>
              <p className="text-sm text-gray-600">Margen Bajo</p>
              <p className="text-2xl font-bold text-orange-600">{stats.lowMarginCount}</p>
              <p className="text-xs text-gray-500">menos de 30%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar productos por nombre o descripción..."
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
        </CardContent>
      </Card>

      {/* Lista de productos con editor */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              key={`${product.id}-${refreshKey}`}
              product={product}
              onAddToCart={dummyAddToCart}
              showEditor={true}
              onProductUpdated={handleProductUpdated}
            />
          ))
        )}
      </div>

      {/* Información adicional */}
      {filteredProducts.length > 0 && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Mostrando {filteredProducts.length} de {state.products.length} productos
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Los cambios se guardan automáticamente y se reflejan inmediatamente en las ventas
          </p>
        </div>
      )}
    </div>
  );
}