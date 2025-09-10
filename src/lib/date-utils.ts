// Utilidades para manejo de fechas sin dependencias externas

export const formatDate = (date: Date): string => {
  // Ajustar la fecha para la zona horaria local
  const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, '0');
  const day = String(localDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateTime = (date: Date): string => {
  const dateStr = formatDate(date);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${dateStr}T${hours}:${minutes}:${seconds}`;
};

export const formatDisplayDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatDisplayDateTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getStartOfWeek = (date: Date): Date => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1); // Lunes como primer día
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result;
};

export const getEndOfWeek = (date: Date): Date => {
  const result = getStartOfWeek(date);
  result.setDate(result.getDate() + 6);
  result.setHours(23, 59, 59, 999);
  return result;
};

export const getStartOfMonth = (date: Date): Date => {
  const result = new Date(date.getFullYear(), date.getMonth(), 1);
  result.setHours(0, 0, 0, 0);
  return result;
};

export const getEndOfMonth = (date: Date): Date => {
  const result = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  result.setHours(23, 59, 59, 999);
  return result;
};

export const getStartOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

export const getEndOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

export const isToday = (dateStr: string): boolean => {
  const today = formatDate(new Date());
  return dateStr.startsWith(today);
};

export const isThisWeek = (dateStr: string): boolean => {
  const date = new Date(dateStr);
  const now = new Date();
  const startOfWeek = getStartOfWeek(now);
  const endOfWeek = getEndOfWeek(now);
  return date >= startOfWeek && date <= endOfWeek;
};

export const isThisMonth = (dateStr: string): boolean => {
  const date = new Date(dateStr);
  const now = new Date();
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
};

export const getDaysDifference = (date1: string, date2: string): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const timeDiff = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const subtractDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
};

export const getWeekRange = (date: Date): { start: string; end: string } => {
  const start = getStartOfWeek(date);
  const end = getEndOfWeek(date);
  return {
    start: formatDate(start),
    end: formatDate(end)
  };
};

export const getMonthRange = (date: Date): { start: string; end: string } => {
  const start = getStartOfMonth(date);
  const end = getEndOfMonth(date);
  return {
    start: formatDate(start),
    end: formatDate(end)
  };
};

export const getDateRange = (period: 'daily' | 'weekly' | 'monthly', date: Date): { start: string; end: string } => {
  switch (period) {
    case 'weekly':
      return getWeekRange(date);
    case 'monthly':
      return getMonthRange(date);
    default: // daily
      const dayStr = formatDate(date);
      return { start: dayStr, end: dayStr };
  }
};