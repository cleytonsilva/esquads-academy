// ============================================================================
// DECLARAÇÕES DE TIPOS PARA MÓDULOS SEM SUPORTE TYPESCRIPT
// ============================================================================

declare module '*.css' {
  const content: string
  export default content
}

declare module '*.scss' {
  const content: string
  export default content
}

declare module '*.sass' {
  const content: string
  export default content
}

declare module '*.less' {
  const content: string
  export default content
}

declare module '*.styl' {
  const content: string
  export default content
}

declare module '*.png' {
  const content: string
  export default content
}

declare module '*.jpg' {
  const content: string
  export default content
}

declare module '*.jpeg' {
  const content: string
  export default content
}

declare module '*.gif' {
  const content: string
  export default content
}

declare module '*.svg' {
  const content: string
  export default content
}

declare module '*.webp' {
  const content: string
  export default content
}

declare module '*.ico' {
  const content: string
  export default content
}

declare module '*.woff' {
  const content: string
  export default content
}

declare module '*.woff2' {
  const content: string
  export default content
}

declare module '*.ttf' {
  const content: string
  export default content
}

declare module '*.eot' {
  const content: string
  export default content
}

declare module '*.otf' {
  const content: string
  export default content
}

// ============================================================================
// DECLARAÇÕES PARA COMPONENTES PERSONALIZADOS
// ============================================================================

declare module 'components/*' {
  const component: React.ComponentType<any>
  export default component
}

declare module 'pages/*' {
  const page: React.ComponentType<any>
  export default page
}

// ============================================================================
// DECLARAÇÕES PARA UTILITÁRIOS
// ============================================================================

declare module 'utils/*' {
  const util: any
  export default util
}

// ============================================================================
// DECLARAÇÕES PARA HOOKS PERSONALIZADOS
// ============================================================================

declare module 'hooks/*' {
  const hook: any
  export default hook
}

// ============================================================================
// DECLARAÇÕES PARA TIPOS PERSONALIZADOS
// ============================================================================

declare module 'types/*' {
  const types: any
  export default types
}

// ============================================================================
// DECLARAÇÕES PARA ESTILOS
// ============================================================================

declare module 'styles/*' {
  const styles: any
  export default styles
}

// ============================================================================
// DECLARAÇÕES GLOBAIS
// ============================================================================

declare global {
  interface Window {
    // Adicionar propriedades globais do window se necessário
  }
}

export {}
