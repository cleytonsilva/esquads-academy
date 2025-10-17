/**
 * Componente LoadingSpinner para estados de carregamento
 * Inclui diferentes variações e animações
 */

import React from 'react';
import { Loader2, RefreshCw, Circle, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars' | 'circle';
  color?: 'primary' | 'secondary' | 'muted' | 'white';
  text?: string;
  className?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
};

const colorClasses = {
  primary: 'text-blue-600',
  secondary: 'text-gray-600',
  muted: 'text-gray-400',
  white: 'text-white'
};

const textSizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl'
};

export function LoadingSpinner({
  size = 'md',
  variant = 'spinner',
  color = 'primary',
  text,
  className,
  fullScreen = false,
  overlay = false
}: LoadingSpinnerProps) {
  const renderSpinner = () => {
    const baseClasses = cn(
      sizeClasses[size],
      colorClasses[color],
      'animate-spin'
    );

    switch (variant) {
      case 'spinner':
        return <Loader2 className={baseClasses} />;
      
      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  'rounded-full',
                  size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : 'w-4 h-4',
                  colorClasses[color].replace('text-', 'bg-'),
                  'animate-pulse'
                )}
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
        );
      
      case 'pulse':
        return (
          <div
            className={cn(
              'rounded-full animate-pulse',
              sizeClasses[size],
              colorClasses[color].replace('text-', 'bg-')
            )}
          />
        );
      
      case 'bars':
        return (
          <div className="flex space-x-1 items-end">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  'rounded-sm',
                  size === 'sm' ? 'w-1' : size === 'md' ? 'w-1.5' : size === 'lg' ? 'w-2' : 'w-3',
                  colorClasses[color].replace('text-', 'bg-'),
                  'animate-pulse'
                )}
                style={{
                  height: `${(i + 1) * (size === 'sm' ? 4 : size === 'md' ? 6 : size === 'lg' ? 8 : 12)}px`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '0.8s'
                }}
              />
            ))}
          </div>
        );
      
      case 'circle':
        return (
          <div className="relative">
            <Circle 
              className={cn(
                sizeClasses[size],
                'text-gray-200'
              )} 
            />
            <Circle 
              className={cn(
                sizeClasses[size],
                colorClasses[color],
                'absolute top-0 left-0 animate-spin'
              )}
              style={{
                strokeDasharray: '50 50',
                strokeDashoffset: '25'
              }}
            />
          </div>
        );
      
      default:
        return <Loader2 className={baseClasses} />;
    }
  };

  const content = (
    <div className={cn(
      'flex flex-col items-center justify-center space-y-2',
      className
    )}>
      {renderSpinner()}
      {text && (
        <p className={cn(
          'font-medium',
          textSizeClasses[size],
          colorClasses[color]
        )}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        overlay ? 'bg-black/50' : 'bg-white'
      )}>
        {content}
      </div>
    );
  }

  return content;
}

// Componente para loading inline
interface InlineLoadingProps {
  size?: 'sm' | 'md';
  text?: string;
  className?: string;
}

export function InlineLoading({ 
  size = 'sm', 
  text = 'Carregando...', 
  className 
}: InlineLoadingProps) {
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <Loader2 className={cn(
        'animate-spin',
        size === 'sm' ? 'w-4 h-4' : 'w-5 h-5',
        'text-gray-500'
      )} />
      <span className={cn(
        'text-gray-600',
        size === 'sm' ? 'text-sm' : 'text-base'
      )}>
        {text}
      </span>
    </div>
  );
}

// Componente para loading de botão
interface ButtonLoadingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ButtonLoading({ size = 'md', className }: ButtonLoadingProps) {
  return (
    <Loader2 className={cn(
      'animate-spin',
      sizeClasses[size],
      className
    )} />
  );
}

// Componente para loading de página
interface PageLoadingProps {
  title?: string;
  description?: string;
  variant?: 'spinner' | 'dots' | 'pulse';
}

export function PageLoading({ 
  title = 'Carregando...', 
  description,
  variant = 'spinner'
}: PageLoadingProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="text-center space-y-4">
        <LoadingSpinner 
          size="lg" 
          variant={variant}
          color="primary"
        />
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {title}
          </h3>
          {description && (
            <p className="text-gray-600 max-w-md">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Componente para loading de card
interface CardLoadingProps {
  lines?: number;
  showAvatar?: boolean;
  className?: string;
}

export function CardLoading({ 
  lines = 3, 
  showAvatar = false, 
  className 
}: CardLoadingProps) {
  return (
    <div className={cn('animate-pulse space-y-4 p-4', className)}>
      {showAvatar && (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-3 bg-gray-200 rounded w-1/3" />
          </div>
        </div>
      )}
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-4 bg-gray-200 rounded',
              i === lines - 1 ? 'w-2/3' : 'w-full'
            )}
          />
        ))}
      </div>
    </div>
  );
}

// Componente para loading de tabela
interface TableLoadingProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function TableLoading({ 
  rows = 5, 
  columns = 4, 
  className 
}: TableLoadingProps) {
  return (
    <div className={cn('animate-pulse space-y-4', className)}>
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div 
          key={rowIndex} 
          className="grid gap-4" 
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div 
              key={colIndex} 
              className={cn(
                'h-4 bg-gray-100 rounded',
                colIndex === 0 ? 'w-3/4' : 'w-full'
              )} 
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// Hook para gerenciar estados de loading
export function useLoading(initialState = false) {
  const [isLoading, setIsLoading] = React.useState(initialState);
  const [loadingText, setLoadingText] = React.useState<string>();

  const startLoading = (text?: string) => {
    setIsLoading(true);
    setLoadingText(text);
  };

  const stopLoading = () => {
    setIsLoading(false);
    setLoadingText(undefined);
  };

  const withLoading = async <T,>(
    asyncFn: () => Promise<T>,
    text?: string
  ): Promise<T> => {
    startLoading(text);
    try {
      const result = await asyncFn();
      return result;
    } finally {
      stopLoading();
    }
  };

  return {
    isLoading,
    loadingText,
    startLoading,
    stopLoading,
    withLoading
  };
}

// Componente de loading com timeout
interface LoadingWithTimeoutProps extends LoadingSpinnerProps {
  timeout?: number;
  onTimeout?: () => void;
  timeoutMessage?: string;
}

export function LoadingWithTimeout({
  timeout = 30000, // 30 segundos
  onTimeout,
  timeoutMessage = 'O carregamento está demorando mais que o esperado...',
  ...props
}: LoadingWithTimeoutProps) {
  const [showTimeout, setShowTimeout] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowTimeout(true);
      onTimeout?.();
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout, onTimeout]);

  if (showTimeout) {
    return (
      <div className="text-center space-y-4">
        <LoadingSpinner {...props} />
        <p className="text-amber-600 text-sm">
          {timeoutMessage}
        </p>
      </div>
    );
  }

  return <LoadingSpinner {...props} />;
}