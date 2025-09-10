// Utilidades de formato para la aplicación

export const formatCurrency = (amount: number, currency: string = '$'): string => {
  return `${currency} ${amount.toLocaleString('es-AR', { 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 0 
  })}`;
};

export const formatNumber = (num: number): string => {
  return num.toLocaleString('es-AR');
};

export const formatPercentage = (value: number, total: number): string => {
  if (total === 0) return '0%';
  return `${((value / total) * 100).toFixed(1)}%`;
};

export const formatDecimal = (num: number, decimals: number = 2): string => {
  return num.toLocaleString('es-AR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

export const formatQuantity = (quantity: number, unit: string): string => {
  const unitText = quantity === 1 ? unit : unit + 's';
  return `${formatNumber(quantity)} ${unitText}`;
};

export const formatStockLevel = (current: number, min: number): string => {
  if (current <= min * 0.5) {
    return `⚠️ CRÍTICO (${current})`;
  } else if (current <= min) {
    return `⚡ BAJO (${current})`;
  }
  return `✅ OK (${current})`;
};

export const formatStockStatus = (current: number, min: number): 'ok' | 'low' | 'critical' => {
  if (current <= min * 0.5) {
    return 'critical';
  } else if (current <= min) {
    return 'low';
  }
  return 'ok';
};

export const formatBusinessHours = (date: Date): string => {
  return date.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const formatCardNumber = (cardNumber: string): string => {
  // Formato: **** **** **** 1234
  return cardNumber.replace(/(.{4})/g, '$1 ').trim();
};

export const formatPhoneNumber = (phone: string): string => {
  // Formato argentino: +54 9 11 1234-5678
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

export const formatTaxId = (taxId: string): string => {
  // Formato CUIT/CUIL: 20-12345678-9
  const cleaned = taxId.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 10)}-${cleaned.slice(10)}`;
  }
  return taxId;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
};

export const capitalizeFirst = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const formatCategoryName = (category: string): string => {
  const categoryMap: { [key: string]: string } = {
    'impresion': 'Impresión',
    'encuadernacion': 'Encuadernación',
    'fotografico': 'Fotográfico',
    'autoadhesivo': 'Autoadhesivo',
    'papel': 'Papel',
    'espiral': 'Espiral',
    'tapa': 'Tapa',
    'tinta': 'Tinta',
    'insumos': 'Insumos',
    'servicios': 'Servicios',
    'alquiler': 'Alquiler',
    'impuestos': 'Impuestos',
    'otros': 'Otros',
    'efectivo': 'Efectivo',
    'transferencia': 'Transferencia',
    'tarjeta': 'Tarjeta'
  };
  
  return categoryMap[category] || capitalizeFirst(category);
};

export const formatSearchQuery = (query: string): string => {
  return query.trim().toLowerCase().replace(/\s+/g, ' ');
};

export const highlightSearchTerm = (text: string, searchTerm: string): string => {
  if (!searchTerm) return text;
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

export const formatReportPeriod = (period: 'daily' | 'weekly' | 'monthly'): string => {
  const periodMap = {
    'daily': 'Diario',
    'weekly': 'Semanal',
    'monthly': 'Mensual'
  };
  
  return periodMap[period];
};

export const formatProfitMargin = (price: number, cost: number): string => {
  if (price === 0) return '0%';
  const margin = ((price - cost) / price) * 100;
  return `${margin.toFixed(1)}%`;
};

export const formatGrowthRate = (current: number, previous: number): { rate: string; trend: 'up' | 'down' | 'stable' } => {
  if (previous === 0) {
    return { rate: current > 0 ? '+100%' : '0%', trend: 'up' };
  }
  
  const growth = ((current - previous) / previous) * 100;
  
  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (Math.abs(growth) > 1) {
    trend = growth > 0 ? 'up' : 'down';
  }
  
  const sign = growth > 0 ? '+' : '';
  return { 
    rate: `${sign}${growth.toFixed(1)}%`, 
    trend 
  };
};

export const formatInputValue = (value: string, type: 'currency' | 'number' | 'text' = 'text'): string => {
  switch (type) {
    case 'currency':
      return value.replace(/[^0-9]/g, '');
    case 'number':
      return value.replace(/[^0-9.]/g, '');
    default:
      return value;
  }
};