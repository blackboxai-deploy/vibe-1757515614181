import { AppState, Product, Sale, Expense, CashRegister } from './types';
import { initialProducts, initialSupplies, defaultSettings } from './data';

const STORAGE_KEY = 'printco_data';

// Estado inicial de la aplicación
export const getInitialState = (): AppState => ({
  products: initialProducts,
  supplies: initialSupplies,
  sales: [],
  expenses: [],
  cashRegisters: [],
  settings: defaultSettings,
});

// Cargar datos desde localStorage
export const loadAppState = (): AppState => {
  if (typeof window === 'undefined') {
    return getInitialState();
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return getInitialState();
    }

    const parsedData = JSON.parse(stored);
    
    // Verificar que tenga la estructura correcta
    return {
      products: parsedData.products || initialProducts,
      supplies: parsedData.supplies || initialSupplies,
      sales: parsedData.sales || [],
      expenses: parsedData.expenses || [],
      cashRegisters: parsedData.cashRegisters || [],
      settings: { ...defaultSettings, ...parsedData.settings },
    };
  } catch (error) {
    console.error('Error loading app state:', error);
    return getInitialState();
  }
};

// Guardar datos en localStorage
export const saveAppState = (state: AppState): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving app state:', error);
  }
};

// Funciones específicas para cada entidad

// Productos
export const saveProduct = (product: Product, state: AppState): AppState => {
  const existingIndex = state.products.findIndex(p => p.id === product.id);
  const newProducts = existingIndex >= 0 
    ? state.products.map(p => p.id === product.id ? product : p)
    : [...state.products, product];

  const newState = { ...state, products: newProducts };
  saveAppState(newState);
  return newState;
};

export const deleteProduct = (productId: string, state: AppState): AppState => {
  const newState = {
    ...state,
    products: state.products.filter(p => p.id !== productId)
  };
  saveAppState(newState);
  return newState;
};

// Insumos
export const updateSupply = (supplyId: string, newStock: number, state: AppState): AppState => {
  const newState = {
    ...state,
    supplies: state.supplies.map(s => 
      s.id === supplyId ? { ...s, currentStock: newStock } : s
    )
  };
  saveAppState(newState);
  return newState;
};

export const updateMultipleSupplies = (updates: { [supplyId: string]: number }, state: AppState): AppState => {
  const newState = {
    ...state,
    supplies: state.supplies.map(s => 
      updates[s.id] !== undefined 
        ? { ...s, currentStock: Math.max(0, s.currentStock - updates[s.id]) }
        : s
    )
  };
  saveAppState(newState);
  return newState;
};

// Ventas
export const saveSale = (sale: Sale, state: AppState): AppState => {
  const newState = {
    ...state,
    sales: [sale, ...state.sales]
  };
  saveAppState(newState);
  return newState;
};

export const deleteSale = (saleId: string, state: AppState): AppState => {
  const newState = {
    ...state,
    sales: state.sales.filter(s => s.id !== saleId)
  };
  saveAppState(newState);
  return newState;
};

// Egresos
export const saveExpense = (expense: Expense, state: AppState): AppState => {
  const existingIndex = state.expenses.findIndex(e => e.id === expense.id);
  const newExpenses = existingIndex >= 0
    ? state.expenses.map(e => e.id === expense.id ? expense : e)
    : [expense, ...state.expenses];

  const newState = { ...state, expenses: newExpenses };
  saveAppState(newState);
  return newState;
};

export const deleteExpense = (expenseId: string, state: AppState): AppState => {
  const newState = {
    ...state,
    expenses: state.expenses.filter(e => e.id !== expenseId)
  };
  saveAppState(newState);
  return newState;
};

// Cierre de caja
export const saveCashRegister = (cashRegister: CashRegister, state: AppState): AppState => {
  const existingIndex = state.cashRegisters.findIndex(c => c.date === cashRegister.date);
  const newCashRegisters = existingIndex >= 0
    ? state.cashRegisters.map(c => c.date === cashRegister.date ? cashRegister : c)
    : [cashRegister, ...state.cashRegisters];

  const newState = { ...state, cashRegisters: newCashRegisters };
  saveAppState(newState);
  return newState;
};

// Utilidades de consulta
export const getSalesByDateRange = (startDate: string, endDate: string, state: AppState): Sale[] => {
  return state.sales.filter(sale => {
    const saleDate = sale.date.split('T')[0]; // Solo la fecha, sin hora
    return saleDate >= startDate && saleDate <= endDate;
  });
};

export const getExpensesByDateRange = (startDate: string, endDate: string, state: AppState): Expense[] => {
  return state.expenses.filter(expense => {
    const expenseDate = expense.date.split('T')[0];
    return expenseDate >= startDate && expenseDate <= endDate;
  });
};

export const getCashRegisterByDate = (date: string, state: AppState): CashRegister | undefined => {
  return state.cashRegisters.find(c => c.date === date);
};

// Utilidades de exportación/importación
export const exportData = (state: AppState): string => {
  return JSON.stringify(state, null, 2);
};

export const importData = (jsonData: string): AppState => {
  try {
    const imported = JSON.parse(jsonData);
    
    // Validar estructura básica
    const validatedState: AppState = {
      products: Array.isArray(imported.products) ? imported.products : initialProducts,
      supplies: Array.isArray(imported.supplies) ? imported.supplies : initialSupplies,
      sales: Array.isArray(imported.sales) ? imported.sales : [],
      expenses: Array.isArray(imported.expenses) ? imported.expenses : [],
      cashRegisters: Array.isArray(imported.cashRegisters) ? imported.cashRegisters : [],
      settings: imported.settings ? { ...defaultSettings, ...imported.settings } : defaultSettings,
    };

    saveAppState(validatedState);
    return validatedState;
  } catch (error) {
    console.error('Error importing data:', error);
    throw new Error('Formato de datos inválido');
  }
};

// Resetear datos a estado inicial
export const resetAppData = (): AppState => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
  return getInitialState();
};