import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  ArrowLeft, 
  Bug, 
  Wifi, 
  Server, 
  Shield,
  HelpCircle,
  Mail,
  ExternalLink
} from 'lucide-react'

interface ErrorStateProps {
  type?: 'network' | 'server' | 'permission' | 'notFound' | 'validation' | 'generic'
  title?: string
  message?: string
  details?: string
  showRetry?: boolean
  showHome?: boolean
  showBack?: boolean
  showSupport?: boolean
  onRetry?: () => void
  onHome?: () => void
  onBack?: () => void
  onSupport?: () => void
  className?: string
  fullScreen?: boolean
}

export default function ErrorState({
  type = 'generic',
  title,
  message,
  details,
  showRetry = true,
  showHome = false,
  showBack = false,
  showSupport = false,
  onRetry,
  onHome,
  onBack,
  onSupport,
  className = '',
  fullScreen = false
}: ErrorStateProps) {
  const getErrorConfig = () => {
    switch (type) {
      case 'network':
        return {
          icon: <Wifi className="w-12 h-12 text-orange-500" />,
          title: title || 'Problema de Conexão',
          message: message || 'Verifique sua conexão com a internet e tente novamente.',
          color: 'orange'
        }
      case 'server':
        return {
          icon: <Server className="w-12 h-12 text-red-500" />,
          title: title || 'Erro do Servidor',
          message: message || 'Nossos servidores estão temporariamente indisponíveis. Tente novamente em alguns minutos.',
          color: 'red'
        }
      case 'permission':
        return {
          icon: <Shield className="w-12 h-12 text-yellow-500" />,
          title: title || 'Acesso Negado',
          message: message || 'Você não tem permissão para acessar este recurso.',
          color: 'yellow'
        }
      case 'notFound':
        return {
          icon: <HelpCircle className="w-12 h-12 text-blue-500" />,
          title: title || 'Página Não Encontrada',
          message: message || 'A página que você está procurando não existe ou foi movida.',
          color: 'blue'
        }
      case 'validation':
        return {
          icon: <AlertTriangle className="w-12 h-12 text-amber-500" />,
          title: title || 'Dados Inválidos',
          message: message || 'Por favor, verifique os dados informados e tente novamente.',
          color: 'amber'
        }
      default:
        return {
          icon: <Bug className="w-12 h-12 text-gray-500" />,
          title: title || 'Algo deu errado',
          message: message || 'Ocorreu um erro inesperado. Tente novamente ou entre em contato com o suporte.',
          color: 'gray'
        }
    }
  }

  const config = getErrorConfig()

  const containerClasses = fullScreen
    ? 'min-h-screen flex items-center justify-center bg-gray-50'
    : 'flex items-center justify-center p-8'

  return (
    <div className={`${containerClasses} ${className}`}>
      <Card className="w-full max-w-md">
        <CardContent className="text-center p-8">
          <div className="flex justify-center mb-6">
            {config.icon}
          </div>
          
          <CardTitle className="text-xl font-semibold text-gray-900 mb-3">
            {config.title}
          </CardTitle>
          
          <p className="text-gray-600 mb-6">
            {config.message}
          </p>

          {details && (
            <Alert className="mb-6 text-left">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Detalhes do Erro</AlertTitle>
              <AlertDescription className="text-sm text-gray-600 mt-2">
                {details}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            {showRetry && onRetry && (
              <Button onClick={onRetry} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar Novamente
              </Button>
            )}

            <div className="flex space-x-2">
              {showBack && onBack && (
                <Button variant="outline" onClick={onBack} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              )}

              {showHome && onHome && (
                <Button variant="outline" onClick={onHome} className="flex-1">
                  <Home className="w-4 h-4 mr-2" />
                  Início
                </Button>
              )}
            </div>

            {showSupport && onSupport && (
              <Button variant="ghost" onClick={onSupport} className="w-full text-sm">
                <Mail className="w-4 h-4 mr-2" />
                Entrar em Contato com o Suporte
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Componentes específicos para diferentes tipos de erro
export const NetworkErrorState = ({ onRetry }: { onRetry?: () => void }) => (
  <ErrorState
    type="network"
    showRetry
    onRetry={onRetry}
  />
)

export const ServerErrorState = ({ onRetry, onSupport }: { onRetry?: () => void; onSupport?: () => void }) => (
  <ErrorState
    type="server"
    showRetry
    showSupport
    onRetry={onRetry}
    onSupport={onSupport}
  />
)

export const PermissionErrorState = ({ onHome, onBack }: { onHome?: () => void; onBack?: () => void }) => (
  <ErrorState
    type="permission"
    showHome
    showBack
    onHome={onHome}
    onBack={onBack}
  />
)

export const NotFoundErrorState = ({ onHome, onBack }: { onHome?: () => void; onBack?: () => void }) => (
  <ErrorState
    type="notFound"
    showHome
    showBack
    onHome={onHome}
    onBack={onBack}
  />
)

export const ValidationErrorState = ({ message, onRetry }: { message?: string; onRetry?: () => void }) => (
  <ErrorState
    type="validation"
    message={message}
    showRetry
    onRetry={onRetry}
  />
)

// Hook para gerenciar estados de erro
export const useErrorState = () => {
  const [error, setError] = React.useState<{
    type: string
    title?: string
    message?: string
    details?: string
  } | null>(null)

  const showError = (
    type: string,
    title?: string,
    message?: string,
    details?: string
  ) => {
    setError({ type, title, message, details })
  }

  const clearError = () => {
    setError(null)
  }

  const handleError = (err: any, context?: string) => {
    console.error('Error occurred:', err, context)
    
    if (err.name === 'NetworkError' || err.message?.includes('fetch')) {
      showError('network')
    } else if (err.status >= 500) {
      showError('server')
    } else if (err.status === 403) {
      showError('permission')
    } else if (err.status === 404) {
      showError('notFound')
    } else if (err.status >= 400 && err.status < 500) {
      showError('validation', undefined, err.message)
    } else {
      showError('generic', undefined, err.message, err.stack)
    }
  }

  return {
    error,
    showError,
    clearError,
    handleError,
    hasError: !!error
  }
}

// Boundary de erro para React
interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{
    fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  }>,
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error!} resetError={this.resetError} />
      }

      return (
        <ErrorState
          type="generic"
          title="Erro na Aplicação"
          message="Ocorreu um erro inesperado na aplicação."
          details={this.state.error?.message}
          showRetry
          onRetry={this.resetError}
          fullScreen
        />
      )
    }

    return this.props.children
  }
}