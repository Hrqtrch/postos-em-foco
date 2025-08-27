import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'primary' | 'accent' | 'warning';
  loading?: boolean;
  className?: string;
}

export function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  variant = 'default',
  loading = false,
  className 
}: MetricCardProps) {
  const variantStyles = {
    default: 'dashboard-elevated',
    primary: 'gradient-primary text-primary-foreground',
    accent: 'gradient-accent text-accent-foreground',
    warning: 'bg-warning text-warning-foreground'
  };

  return (
    <Card className={cn(
      'shadow-card transition-smooth hover:shadow-elegant',
      variantStyles[variant],
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        {icon && (
          <div className="h-4 w-4 text-muted-foreground">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {loading ? (
            <div className="h-8 w-24 bg-muted/20 rounded animate-pulse" />
          ) : (
            <div className="text-2xl font-bold">
              {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
            </div>
          )}
          {subtitle && (
            <p className="text-xs text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}