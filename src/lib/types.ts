// Tipos para la aplicación Print & Co

export interface Product {
  id: string;
  name: string;
  category: 'impresion' | 'encuadernacion' | 'fotografico' | 'autoadhesivo';
  price: number; // Precio de venta
  cost: number;  // Costo de producción
  requiredSupplies: { [supplyId: string]: number }; // Insumos requeridos y cantidad
  description?: string;
}

export interface Supply {
  id: string;
  name: string;
  category: 'papel' | 'espiral' | 'tapa' | 'tinta';
  currentStock: number;
  minStock: number;
  unit: 'hoja' | 'unidad' | 'gramo' | 'ml';
  cost: number; // Costo por unidad
}

export interface Sale {
  id: string;
  date: string; // ISO string
  items: SaleItem[];
  total: number;
  profit: number; // Ganancia total
  paymentMethod: 'efectivo' | 'transferencia' | 'tarjeta';
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  unitCost: number;
  profit: number;
}

export interface Expense {
  id: string;
  date: string; // ISO string
  concept: string;
  amount: number;
  category: 'insumos' | 'servicios' | 'alquiler' | 'impuestos' | 'otros';
  description?: string;
}

export interface CashRegister {
  id: string;
  date: string; // ISO string (solo fecha, sin hora)
  openingAmount: number;
  cashSales: number; // Solo ventas en efectivo
  totalExpenses: number;
  finalBalance: number;
  closed: boolean;
}

export interface DailySummary {
  date: string;
  totalSales: number;
  totalProfit: number;
  totalExpenses: number;
  netProfit: number;
  salesCount: number;
}

export interface StockAlert {
  supplyId: string;
  supplyName: string;
  currentStock: number;
  minStock: number;
  severity: 'low' | 'critical';
}

// Tipos para reportes
export interface SalesReport {
  period: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  totalSales: number;
  totalProfit: number;
  totalExpenses: number;
  netProfit: number;
  salesCount: number;
  averageTicket: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
  }>;
}

// Estado global de la aplicación
export interface AppState {
  products: Product[];
  supplies: Supply[];
  sales: Sale[];
  expenses: Expense[];
  cashRegisters: CashRegister[];
  settings: AppSettings;
}

export interface AppSettings {
  businessName: string;
  currency: string;
  taxRate: number;
  lowStockThreshold: number;
}

// Tipos para el carrito de ventas
export interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
  profit: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  totalProfit: number;
  itemCount: number;
}

// Tipos para filtros y paginación
export interface DateFilter {
  startDate?: string;
  endDate?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
}

// Tipos para dashboard
export interface DashboardStats {
  todaySales: number;
  todayProfit: number;
  todayExpenses: number;
  monthSales: number;
  monthProfit: number;
  lowStockItems: number;
  pendingOrders: number;
}

export type ViewMode = 'dashboard' | 'ventas' | 'productos' | 'stock' | 'egresos' | 'reportes' | 'cierre';