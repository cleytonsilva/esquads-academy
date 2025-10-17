/**
 * Componente ErrorBoundary para capturar e tratar erros React
 * Inclui fallbacks elegantes e logging de erros
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  level?: 'page' | 'component' | 'critical';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Atualizar state para mostrar a UI de fallback
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Atualizar state com informações do erro
    this.setState({
      error,
      errorInfo
    });

    // Log do erro
    this.logError(error, errorInfo);

    // Callback personalizado
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      level: this.props.level || 'component'
    };

    // Log no console em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Error Data:', errorData);
      console.groupEnd();
    }

    // Em produção, enviar para serviço de logging
    if (process.env.NODE_ENV === 'production') {
      try {
        // Aqui você pode integrar com serviços como Sentry, LogRocket, etc.
        // fetch('/api/log-error', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(errorData)
        // });
      } catch (logError) {
        console.error('Erro ao enviar log:', logError);
      }
    }
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private renderErrorDetails = () => {
    if (!this.props.showDetails || process.env.NODE_ENV !== 'development') {
      return null;
    }

    return (
      <details className="mt-4 p-4 bg-gray-50 rounded-lg">
        <summary className="cursor-pointer font-medium text-gray-700 mb-2">
          Detalhes Técnicos (Desenvolvimento)
        </summary>
        <div className="space-y-2 text-sm">
          <div>
            <strong>Erro:</strong>
            <pre className="mt-1 p-2 bg-red-50 text-red-800 rounded text-xs overflow-auto">
              {this.state.error?.message}
            </pre>
          </div>
          <div>
            <strong>Stack Trace:</strong>
            <pre className="mt-1 p-2 bg-red-50 text-red-800 rounded text-xs overflow-auto max-h-32">
              {this.state.error?.stack}
            </pre>
          </div>
          <div>
            <strong>Component Stack:</strong>
            <pre className="mt-1 p-2 bg-red-50 text-red-800 rounded text-xs overflow-auto max-h-32">
              {this.state.errorInfo?.componentStack}
            </pre>
          </div>
          <div>
            <strong>Error ID:</strong>
            <code className="px-2 py-1 bg-gray-200 rounded text-xs">
              {this.state.errorId}
            </code>
          </div>
        </div>
      </details>
    );
  };

  render() {
    if (this.state.hasError) {
      // Se há um fallback customizado, usar ele
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Fallback baseado no nível do erro
      const level = this.props.level || 'component';

      if (level === 'critical') {
        return (
          <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle className="text-red-800">Erro Crítico</CardTitle>
                <CardDescription>
                  Ocorreu um erro crítico na aplicação. Por favor, recarregue a página.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-2">
                  <Button onClick={this.handleReload} className="w-full">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Recarregar Página
                  </Button>
                  <Button variant="outline" onClick={this.handleGoHome} className="w-full">
                    <Home className="w-4 h-4 mr-2" />
                    Ir para Início
                  </Button>
                </div>
                {this.renderErrorDetails()}
              </CardContent>
            </Card>
          </div>
        );
      }

      if (level === 'page') {
        return (
          <div className="min-h-[400px] flex items-center justify-center p-8">
            <Card className="w-full max-w-lg">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <Bug className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle className="text-orange-800">Ops! Algo deu errado</CardTitle>
                <CardDescription>
                  Esta página encontrou um problema. Você pode tentar novamente ou voltar ao início.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button onClick={this.handleRetry} className="flex-1">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Tentar Novamente
                  </Button>
                  <Button variant="outline" onClick={this.handleGoHome} className="flex-1">
                    <Home className="w-4 h-4 mr-2" />
                    Voltar ao Início
                  </Button>
                </div>
                {this.renderErrorDetails()}
              </CardContent>
            </Card>
          </div>
        );
      }

      // Fallback para componente
      return (
        <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-red-800">
                Erro no Componente
              </h3>
              <p className="text-sm text-red-700 mt-1">
                Este componente encontrou um erro e não pode ser exibido.
              </p>
              <div className="mt-3">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={this.handleRetry}
                  className="text-red-700 border-red-300 hover:bg-red-100"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Tentar Novamente
                </Button>
              </div>
              {this.renderErrorDetails()}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook para usar ErrorBoundary programaticamente
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    // Simular erro para acionar ErrorBoundary
    throw error;
  };
}

// Componente wrapper para facilitar o uso
interface ErrorBoundaryWrapperProps {
  children: ReactNode;
  level?: 'page' | 'component' | 'critical';
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export function ErrorBoundaryWrapper({ 
  children, 
  level = 'component',
  fallback,
  onError 
}: ErrorBoundaryWrapperProps) {
  return (
    <ErrorBoundary 
      level={level}
      fallback={fallback}
      onError={onError}
      showDetails={process.env.NODE_ENV === 'development'}
    >
      {children}
    </ErrorBoundary>
  );
}

// HOC para adicionar ErrorBoundary a componentes
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}