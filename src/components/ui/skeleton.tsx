import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  width,
  height,
  lines = 1
}) => {
  const baseClasses = 'animate-pulse bg-gray-200 rounded';
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded'
  };

  const style = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1rem' : '2rem')
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(baseClasses, variantClasses[variant])}
            style={{
              ...style,
              width: index === lines - 1 ? '75%' : '100%'
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={style}
    />
  );
};

// Skeleton components for common use cases
const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('p-4 border border-gray-200 rounded-lg', className)}>
    <div className="flex items-center space-x-4">
      <Skeleton variant="circular" width={48} height={48} />
      <div className="flex-1">
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="40%" className="mt-2" />
      </div>
    </div>
    <div className="mt-4">
      <Skeleton variant="text" lines={3} />
    </div>
  </div>
);

const SkeletonTable: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton 
            key={colIndex} 
            variant="text" 
            className="flex-1" 
          />
        ))}
      </div>
    ))}
  </div>
);

const SkeletonDashboard: React.FC = () => (
  <div className="space-y-6">
    {/* Header com gradiente */}
    <div className="bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton variant="text" width={250} height={32} className="bg-white/20" />
          <Skeleton variant="text" width={300} height={20} className="mt-2 bg-white/20" />
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <Skeleton variant="text" width={40} height={24} className="bg-white/20" />
            <Skeleton variant="text" width={60} height={16} className="mt-1 bg-white/20" />
          </div>
          <div className="text-center">
            <Skeleton variant="text" width={50} height={24} className="bg-white/20" />
            <Skeleton variant="text" width={70} height={16} className="mt-1 bg-white/20" />
          </div>
        </div>
      </div>
      <div className="mt-4">
        <Skeleton variant="rectangular" width="100%" height={8} className="bg-white/20 rounded-full" />
      </div>
    </div>
    
    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="p-6 border border-gray-200 rounded-lg">
          <div className="flex items-center">
            <Skeleton variant="circular" width={48} height={48} />
            <div className="ml-4 flex-1">
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="60%" className="mt-2" />
            </div>
          </div>
        </div>
      ))}
    </div>
    
    {/* Content Area */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Missões IA */}
        <div className="p-6 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <Skeleton variant="text" width={150} height={24} />
            <Skeleton variant="rectangular" width={80} height={32} />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 border border-gray-100 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Skeleton variant="text" width="70%" height={20} />
                    <Skeleton variant="text" width="90%" height={16} className="mt-2" />
                  </div>
                  <Skeleton variant="rectangular" width={60} height={24} />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Cursos Recentes */}
        <div className="p-6 border border-gray-200 rounded-lg">
          <Skeleton variant="text" width={120} height={24} className="mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-3 border border-gray-100 rounded-lg">
                <Skeleton variant="rectangular" width={60} height={40} />
                <div className="flex-1">
                  <Skeleton variant="text" width="80%" height={18} />
                  <Skeleton variant="text" width="60%" height={14} className="mt-1" />
                </div>
                <Skeleton variant="rectangular" width={80} height={6} />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Conquistas Recentes */}
        <div className="p-6 border border-gray-200 rounded-lg">
          <Skeleton variant="text" width={140} height={24} className="mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton variant="circular" width={40} height={40} />
                <div className="flex-1">
                  <Skeleton variant="text" width="70%" height={16} />
                  <Skeleton variant="text" width="50%" height={12} className="mt-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Recomendações */}
        <div className="p-6 border border-gray-200 rounded-lg">
          <Skeleton variant="text" width={120} height={24} className="mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="p-3 border border-gray-100 rounded-lg">
                <Skeleton variant="text" width="90%" height={16} />
                <Skeleton variant="text" width="70%" height={14} className="mt-2" />
                <div className="flex items-center justify-between mt-2">
                  <Skeleton variant="text" width={40} height={12} />
                  <Skeleton variant="text" width={30} height={12} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export { Skeleton, SkeletonCard, SkeletonTable, SkeletonDashboard };
