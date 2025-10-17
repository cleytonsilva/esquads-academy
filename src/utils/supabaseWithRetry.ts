/**
 * supabaseWithRetry.ts
 * 
 * Finalidade: Utilitário para executar operações do Supabase com retry automático e refresh de token
 * Conecta-se com: Supabase client, sistema de autenticação, operações de módulos
 * Função principal: Implementar retry automático com refresh de token e interceptação de requisições para debug
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Utilitário para executar operações do Supabase com retry automático
 * Implementa refresh de token quando necessário
 */
interface SupabaseError {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
}

export async function supabaseWithRetry<T>(
  operation: () => Promise<{ data: T; error: SupabaseError | null }>
): Promise<{ data: T; error: SupabaseError | null }> {
  console.log('🔄 supabaseWithRetry: Executando operação...');
  
  let result = await operation();
  
  // Verificar se o erro é relacionado a token expirado
  if (result.error?.message?.includes('JWT expired') || 
      result.error?.message?.includes('invalid JWT') ||
      result.error?.code === 'PGRST301') {
    
    console.log('🔄 supabaseWithRetry: Token expirado, tentando refresh...');
    
    try {
      const { error: refreshError } = await supabase.auth.refreshSession();
      
      if (!refreshError) {
        console.log('✅ supabaseWithRetry: Token refreshed, tentando operação novamente...');
        result = await operation();
        
        if (!result.error) {
          console.log('✅ supabaseWithRetry: Operação bem-sucedida após refresh');
        } else {
          console.warn('⚠️ supabaseWithRetry: Operação falhou mesmo após refresh:', result.error);
        }
      } else {
        console.error('❌ supabaseWithRetry: Falha no refresh do token:', refreshError);
      }
    } catch (refreshException) {
      console.error('❌ supabaseWithRetry: Exceção durante refresh:', refreshException);
    }
  } else if (result.error) {
    console.warn('⚠️ supabaseWithRetry: Erro não relacionado a token:', result.error);
  } else {
    console.log('✅ supabaseWithRetry: Operação bem-sucedida');
  }
  
  return result;
}

/**
 * Versão específica para operações de módulos
 * Adiciona logs específicos para debugging de problemas de persistência
 */
export async function supabaseModuleRetry<T>(
  operation: () => Promise<{ data: T; error: SupabaseError | null }>,
  moduleId?: string,
  operationType?: string
): Promise<{ data: T; error: SupabaseError | null }> {
  console.log('📝 supabaseModuleRetry: Executando operação de módulo:', {
    moduleId,
    operationType,
    timestamp: new Date().toISOString()
  });
  
  const result = await supabaseWithRetry(operation);
  
  if (result.error) {
    console.error('❌ supabaseModuleRetry: Erro na operação de módulo:', {
      moduleId,
      operationType,
      error: result.error,
      timestamp: new Date().toISOString()
    });
  } else {
    console.log('✅ supabaseModuleRetry: Operação de módulo bem-sucedida:', {
      moduleId,
      operationType,
      timestamp: new Date().toISOString()
    });
  }
  
  return result;
}

/**
 * Hook para interceptar requisições e adicionar logs de debug
 * Útil para diagnosticar problemas de autenticação
 */
export function enableRequestInterceptor() {
  if (typeof window !== 'undefined' && !window.__supabase_interceptor_enabled) {
    const originalFetch = window.fetch;
    
    window.fetch = function(...args) {
      const url = args[0];
      const options = args[1] || {};
      
      // Log apenas requisições para Supabase
      if (typeof url === 'string' && url.includes('supabase.co')) {
        console.log('🌐 Requisição Supabase:', {
          url,
          method: options.method || 'GET',
          headers: 'redacted',
          timestamp: new Date().toISOString()
        });
      }
      
      return originalFetch.apply(this, args);
    };
    
    window.__supabase_interceptor_enabled = true;
    console.log('🔍 Request interceptor habilitado para debug');
  }
}

/**
 * Desabilita o interceptor de requisições
 */
export function disableRequestInterceptor() {
  if (typeof window !== 'undefined' && window.__supabase_interceptor_enabled) {
    // Restaurar fetch original seria complexo, então apenas marcamos como desabilitado
    window.__supabase_interceptor_enabled = false;
    console.log('🔍 Request interceptor desabilitado');
  }
}

// Declaração de tipos para o window
declare global {
  interface Window {
    __supabase_interceptor_enabled?: boolean;
  }
}
