'use client';

import { useState, useEffect, useCallback } from 'react';
import { AppState } from '@/lib/types';
import { loadAppState, saveAppState } from '@/lib/storage';

export const useLocalStorage = () => {
  const [state, setState] = useState<AppState>(() => {
    if (typeof window === 'undefined') {
      return {
        products: [],
        supplies: [],
        sales: [],
        expenses: [],
        cashRegisters: [],
        settings: {
          businessName: 'Print & Co',
          currency: '$',
          taxRate: 21,
          lowStockThreshold: 10
        }
      };
    }
    return loadAppState();
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar estado inicial
  useEffect(() => {
    try {
      const loadedState = loadAppState();
      setState(loadedState);
      setError(null);
    } catch (err) {
      setError('Error cargando datos');
      console.error('Error loading state:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para actualizar el estado y guardarlo
  const updateState = useCallback((newState: AppState | ((prev: AppState) => AppState)) => {
    try {
      const finalState = typeof newState === 'function' ? newState(state) : newState;
      setState(finalState);
      saveAppState(finalState);
      setError(null);
      return finalState;
    } catch (err) {
      setError('Error guardando datos');
      console.error('Error saving state:', err);
      return state;
    }
  }, [state]);

  // Funciones específicas para cada entidad
  const updateProducts = useCallback((products: AppState['products']) => {
    return updateState(prev => ({ ...prev, products }));
  }, [updateState]);

  const updateSupplies = useCallback((supplies: AppState['supplies']) => {
    return updateState(prev => ({ ...prev, supplies }));
  }, [updateState]);

  const updateSales = useCallback((sales: AppState['sales']) => {
    return updateState(prev => ({ ...prev, sales }));
  }, [updateState]);

  const updateExpenses = useCallback((expenses: AppState['expenses']) => {
    return updateState(prev => ({ ...prev, expenses }));
  }, [updateState]);

  const updateCashRegisters = useCallback((cashRegisters: AppState['cashRegisters']) => {
    return updateState(prev => ({ ...prev, cashRegisters }));
  }, [updateState]);

  const updateSettings = useCallback((settings: AppState['settings']) => {
    return updateState(prev => ({ ...prev, settings }));
  }, [updateState]);

  // Función para agregar una venta
  const addSale = useCallback((sale: AppState['sales'][0]) => {
    return updateState(prev => ({
      ...prev,
      sales: [sale, ...prev.sales]
    }));
  }, [updateState]);

  // Función para agregar un gasto
  const addExpense = useCallback((expense: AppState['expenses'][0]) => {
    return updateState(prev => ({
      ...prev,
      expenses: [expense, ...prev.expenses]
    }));
  }, [updateState]);

  // Función para actualizar stock después de una venta
  const updateStockAfterSale = useCallback((stockDeductions: { [supplyId: string]: number }) => {
    return updateState(prev => ({
      ...prev,
      supplies: prev.supplies.map(supply => ({
        ...supply,
        currentStock: stockDeductions[supply.id] !== undefined 
          ? Math.max(0, supply.currentStock - stockDeductions[supply.id])
          : supply.currentStock
      }))
    }));
  }, [updateState]);

  // Función para resetear todos los datos
  const resetData = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('printco_data');
      }
      const initialState = loadAppState();
      setState(initialState);
      setError(null);
      return initialState;
    } catch (err) {
      setError('Error reseteando datos');
      console.error('Error resetting data:', err);
      return state;
    }
  }, [state]);

  // Función para exportar datos
  const exportData = useCallback(() => {
    try {
      return JSON.stringify(state, null, 2);
    } catch (err) {
      setError('Error exportando datos');
      console.error('Error exporting data:', err);
      return null;
    }
  }, [state]);

  // Función para importar datos
  const importData = useCallback((jsonData: string) => {
    try {
      const imported = JSON.parse(jsonData);
      const newState = {
        products: Array.isArray(imported.products) ? imported.products : state.products,
        supplies: Array.isArray(imported.supplies) ? imported.supplies : state.supplies,
        sales: Array.isArray(imported.sales) ? imported.sales : state.sales,
        expenses: Array.isArray(imported.expenses) ? imported.expenses : state.expenses,
        cashRegisters: Array.isArray(imported.cashRegisters) ? imported.cashRegisters : state.cashRegisters,
        settings: imported.settings ? { ...state.settings, ...imported.settings } : state.settings,
      };
      
      setState(newState);
      saveAppState(newState);
      setError(null);
      return newState;
    } catch (err) {
      setError('Error importando datos - formato inválido');
      console.error('Error importing data:', err);
      return state;
    }
  }, [state]);

  return {
    // Estado
    state,
    loading,
    error,
    
    // Funciones de actualización
    updateState,
    updateProducts,
    updateSupplies,
    updateSales,
    updateExpenses,
    updateCashRegisters,
    updateSettings,
    
    // Funciones específicas
    addSale,
    addExpense,
    updateStockAfterSale,
    
    // Utilidades
    resetData,
    exportData,
    importData,
    
    // Limpiar error
    clearError: () => setError(null)
  };
};