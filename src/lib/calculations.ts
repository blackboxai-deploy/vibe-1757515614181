import { Product, Supply, Sale, Expense, CartItem, StockAlert, DailySummary, SalesReport, AppState } from './types';
import { formatDate, getDateRange } from './date-utils';

// Cálculos de carrito
export const calculateCartItem = (product: Product, quantity: number): CartItem => {
  const subtotal = product.price * quantity;
  const profit = (product.price - product.cost) * quantity;
  
  return {
    product,
    quantity,
    subtotal,
    profit,
  };
};

export const calculateCartTotal = (items: CartItem[]) => {
  const total = items.reduce((sum, item) => sum + item.subtotal, 0);
  const totalProfit = items.reduce((sum, item) => sum + item.profit, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  
  return {
    total,
    totalProfit,
    itemCount,
  };
};

// Cálculos de stock
export const canProcessSale = (items: CartItem[], supplies: Supply[]): { canProcess: boolean; missingItems: string[] } => {
  const missingItems: string[] = [];
  
  for (const item of items) {
    const requiredSupplies = item.product.requiredSupplies;
    
    for (const [supplyId, requiredQuantity] of Object.entries(requiredSupplies)) {
      const supply = supplies.find(s => s.id === supplyId);
      if (!supply) {
        missingItems.push(`Insumo no encontrado: ${supplyId}`);
        continue;
      }
      
      const totalRequired = (requiredQuantity as number) * item.quantity;
      if (supply.currentStock < totalRequired) {
        missingItems.push(`Stock insuficiente: ${supply.name} (necesario: ${totalRequired}, disponible: ${supply.currentStock})`);
      }
    }
  }
  
  return {
    canProcess: missingItems.length === 0,
    missingItems,
  };
};

export const calculateStockDeduction = (items: CartItem[]): { [supplyId: string]: number } => {
  const deductions: { [supplyId: string]: number } = {};
  
  for (const item of items) {
    const requiredSupplies = item.product.requiredSupplies;
    
    for (const [supplyId, requiredQuantity] of Object.entries(requiredSupplies)) {
      deductions[supplyId] = (deductions[supplyId] || 0) + ((requiredQuantity as number) * item.quantity);
    }
  }
  
  return deductions;
};

export const getStockAlerts = (supplies: Supply[]): StockAlert[] => {
  return supplies
    .filter(supply => supply.currentStock <= supply.minStock)
    .map(supply => ({
      supplyId: supply.id,
      supplyName: supply.name,
      currentStock: supply.currentStock,
      minStock: supply.minStock,
      severity: (supply.currentStock <= supply.minStock * 0.5 ? 'critical' : 'low') as 'critical' | 'low'
    }))
    .sort((a, b) => {
      // Primero los críticos, luego por menor stock
      if (a.severity === 'critical' && b.severity === 'low') return -1;
      if (a.severity === 'low' && b.severity === 'critical') return 1;
      return a.currentStock - b.currentStock;
    });
};

// Cálculos de reportes
export const calculateDailySummary = (date: string, sales: Sale[], expenses: Expense[]): DailySummary => {
  const daySales = sales.filter(sale => sale.date.startsWith(date));
  const dayExpenses = expenses.filter(expense => expense.date.startsWith(date));
  
  const totalSales = daySales.reduce((sum, sale) => sum + sale.total, 0);
  const totalProfit = daySales.reduce((sum, sale) => sum + sale.profit, 0);
  const totalExpenses = dayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const netProfit = totalProfit - totalExpenses;
  
  return {
    date,
    totalSales,
    totalProfit,
    totalExpenses,
    netProfit,
    salesCount: daySales.length,
  };
};

export const calculateSalesReport = (
  period: 'daily' | 'weekly' | 'monthly',
  date: Date,
  sales: Sale[],
  expenses: Expense[],
  products: Product[]
): SalesReport => {
  const { start: startDateStr, end: endDateStr } = getDateRange(period, date);
  
  // Filtrar ventas y gastos del período
  const periodSales = sales.filter(sale => {
    const saleDate = sale.date.split('T')[0];
    return saleDate >= startDateStr && saleDate <= endDateStr;
  });
  
  const periodExpenses = expenses.filter(expense => {
    const expenseDate = expense.date.split('T')[0];
    return expenseDate >= startDateStr && expenseDate <= endDateStr;
  });
  
  const totalSales = periodSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalProfit = periodSales.reduce((sum, sale) => sum + sale.profit, 0);
  const totalExpenses = periodExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const netProfit = totalProfit - totalExpenses;
  const salesCount = periodSales.length;
  const averageTicket = salesCount > 0 ? totalSales / salesCount : 0;
  
  // Calcular productos más vendidos
  const productSales: { [productId: string]: { quantity: number; revenue: number } } = {};
  
  periodSales.forEach(sale => {
    sale.items.forEach(item => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = { quantity: 0, revenue: 0 };
      }
      productSales[item.productId].quantity += item.quantity;
      productSales[item.productId].revenue += item.subtotal;
    });
  });
  
  const topProducts = Object.entries(productSales)
    .map(([productId, data]) => {
      const product = products.find(p => p.id === productId);
      return {
        productId,
        productName: product?.name || 'Producto eliminado',
        quantity: data.quantity,
        revenue: data.revenue,
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5); // Top 5 productos
  
  return {
    period,
    startDate: startDateStr,
    endDate: endDateStr,
    totalSales,
    totalProfit,
    totalExpenses,
    netProfit,
    salesCount,
    averageTicket,
    topProducts,
  };
};

// Cálculos de dashboard
export const calculateDashboardStats = (state: AppState) => {
  const today = formatDate(new Date());
  const thisMonth = today.substring(0, 7); // yyyy-MM
  
  // Ventas de hoy
  const todaySales = state.sales
    .filter(sale => sale.date.startsWith(today))
    .reduce((sum, sale) => sum + sale.total, 0);
  
  // Ganancia de hoy
  const todayProfit = state.sales
    .filter(sale => sale.date.startsWith(today))
    .reduce((sum, sale) => sum + sale.profit, 0);
  
  // Gastos de hoy
  const todayExpenses = state.expenses
    .filter(expense => expense.date.startsWith(today))
    .reduce((sum, expense) => sum + expense.amount, 0);
  
  // Ventas del mes
  const monthSales = state.sales
    .filter(sale => sale.date.startsWith(thisMonth))
    .reduce((sum, sale) => sum + sale.total, 0);
  
  // Ganancia del mes
  const monthProfit = state.sales
    .filter(sale => sale.date.startsWith(thisMonth))
    .reduce((sum, sale) => sum + sale.profit, 0);
  
  // Items con stock bajo
  const lowStockItems = getStockAlerts(state.supplies).length;
  
  return {
    todaySales,
    todayProfit,
    todayExpenses,
    monthSales,
    monthProfit,
    lowStockItems,
    pendingOrders: 0, // Placeholder para futuras funcionalidades
  };
};

// Utilidades de formato
export const formatCurrency = (amount: number, currency: string = '$'): string => {
  return `${currency} ${amount.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

export const formatPercentage = (value: number, total: number): string => {
  if (total === 0) return '0%';
  return `${((value / total) * 100).toFixed(1)}%`;
};

export const calculateProfitMargin = (price: number, cost: number): number => {
  if (price === 0) return 0;
  return ((price - cost) / price) * 100;
};

export const generateSaleId = (): string => {
  const now = new Date();
  const timestamp = now.getTime();
  const random = Math.floor(Math.random() * 1000);
  return `SALE_${timestamp}_${random}`;
};

export const generateExpenseId = (): string => {
  const now = new Date();
  const timestamp = now.getTime();
  const random = Math.floor(Math.random() * 1000);
  return `EXP_${timestamp}_${random}`;
};

export const generateCashRegisterId = (): string => {
  const today = formatDate(new Date());
  return `CASH_${today}`;
};