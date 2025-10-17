import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, RefreshCw } from 'lucide-react'

interface LoadingStateProps {
  type?: 'spinner' | 'skeleton' | 'pulse' | 'dots'
  size?: 'sm' | 'md' | 'lg'
  message?: string
  fullScreen?: boolean
  overlay?: boolean
  className?: string
}

const LoadingState: React.FC<LoadingStateProps> = ({
  type = 'spinner',
  size = 'md',
  message = 'Carregando...',
  fullScreen = false,
  overlay = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-white z-50'
    : overlay
    ? 'absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10'
    : 'flex items-center justify-center p-8'

  const SpinnerLoader = () => (
    <div className={`${containerClasses} ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
        {message && (
          <p className="text-sm text-gray-600 animate-pulse">{message}</p>
        )}
      </div>
    </div>
  )

  const PulseLoader = () => (
    <div className={`${containerClasses} ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        <RefreshCw className={`${sizeClasses[size]} animate-pulse text-blue-600`} />
        {message && (
          <p className="text-sm text-gray-600">{message}</p>
        )}
      </div>
    </div>
  )

  const DotsLoader = () => (
    <div className={`${containerClasses} ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`${sizeClasses[size]} bg-blue-600 rounded-full animate-bounce`}
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
        {message && (
          <p className="text-sm text-gray-600">{message}</p>
        )}
      </div>
    </div>
  )

  const SkeletonLoader = () => (
    <div className={`${containerClasses} ${className}`}>
      <div className="space-y-4 w-full max-w-md">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  )

  switch (type) {
    case 'pulse':
      return <PulseLoader />
    case 'dots':
      return <DotsLoader />
    case 'skeleton':
      return <SkeletonLoader />
    default:
      return <SpinnerLoader />
  }
}

// Componentes auxiliares
export const PageLoadingState = ({ message = 'Carregando página...' }: { message?: string }) => (
  <LoadingState type="spinner" size="lg" message={message} fullScreen />
)

export const CardLoadingState = ({ message = 'Carregando...' }: { message?: string }) => (
  <Card className="p-6">
    <CardContent>
      <LoadingState type="skeleton" message={message} />
    </CardContent>
  </Card>
)

export const ButtonLoadingState = ({ message = 'Processando...' }: { message?: string }) => (
  <LoadingState type="spinner" size="sm" message={message} />
)

export const OverlayLoadingState = ({ message = 'Processando...' }: { message?: string }) => (
  <LoadingState type="spinner" size="md" message={message} overlay />
)

// Hook para gerenciar estado de loading
export const useLoadingState = (initialState = false) => {
  const [isLoading, setIsLoading] = React.useState(initialState)
  const [loadingMessage, setLoadingMessage] = React.useState<string>('')

  const startLoading = (message = 'Carregando...') => {
    setLoadingMessage(message)
    setIsLoading(true)
  }

  const stopLoading = () => {
    setIsLoading(false)
    setLoadingMessage('')
  }

  const withLoading = async <T,>(
    asyncFn: () => Promise<T>,
    message = 'Processando...'
  ): Promise<T> => {
    startLoading(message)
    try {
      const result = await asyncFn()
      return result
    } finally {
      stopLoading()
    }
  }

  return {
    isLoading,
    loadingMessage,
    startLoading,
    stopLoading,
    withLoading
  }
}

export { LoadingState }
export default LoadingState