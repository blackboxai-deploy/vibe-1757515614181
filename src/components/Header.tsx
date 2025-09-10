'use client';

import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/format-utils';
import { formatDate, formatDisplayDate } from '@/lib/date-utils';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  showDate?: boolean;
  stats?: Array<{
    label: string;
    value: string | number;
    trend?: 'up' | 'down' | 'stable';
    badge?: boolean;
  }>;
}

export function Header({ 
  title, 
  subtitle, 
  actions, 
  showDate = true,
  stats 
}: HeaderProps) {
  const today = new Date();
  
  return (
    <div className="bg-white border-b border-gray-200 mb-6 -mx-6 px-6 py-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{title}</h1>
              {subtitle && (
                <p className="text-base text-gray-600 mt-2 font-medium">{subtitle}</p>
              )}
              {showDate && (
                <div className="flex items-center space-x-2 mt-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <p className="text-sm text-gray-500 font-medium">
                    {formatDisplayDate(formatDate(today))}
                  </p>
                </div>
              )}
            </div>
            
            {stats && stats.length > 0 && (
              <div className="hidden md:flex items-center space-x-4 ml-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">{stat.label}</span>
                      {stat.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {typeof stat.value === 'number' ? stat.value : stat.value}
                        </Badge>
                      )}
                    </div>
                    {!stat.badge && (
                      <div className="flex items-center space-x-1 mt-1">
                        <span className="font-semibold text-lg text-gray-900">
                          {typeof stat.value === 'number' 
                            ? formatCurrency(stat.value) 
                            : stat.value
                          }
                        </span>
                        {stat.trend && (
                          <span className={`text-xs ${
                            stat.trend === 'up' 
                              ? 'text-green-600' 
                              : stat.trend === 'down' 
                                ? 'text-red-600' 
                                : 'text-gray-500'
                          }`}>
                            {stat.trend === 'up' ? '↗' : stat.trend === 'down' ? '↘' : '→'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {actions && (
          <div className="flex items-center space-x-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

interface QuickStatsProps {
  stats: Array<{
    label: string;
    value: number;
    icon: string;
    change?: {
      value: number;
      trend: 'up' | 'down' | 'stable';
    };
  }>;
}

export function QuickStats({ stats }: QuickStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-3">
                {formatCurrency(stat.value)}
              </p>
              {stat.change && (
                <div className="flex items-center mt-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    stat.change.trend === 'up' 
                      ? 'text-green-800 bg-green-100' 
                      : stat.change.trend === 'down' 
                        ? 'text-red-800 bg-red-100' 
                        : 'text-gray-800 bg-gray-100'
                  }`}>
                    {stat.change.trend === 'up' ? '↗' : stat.change.trend === 'down' ? '↘' : '→'}
                    {' '}{Math.abs(stat.change.value)}%
                  </span>
                </div>
              )}
            </div>
            <div className="text-4xl opacity-80 ml-4">{stat.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
}