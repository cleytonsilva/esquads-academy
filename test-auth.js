// Teste simples de autenticação
// Execute este arquivo no console do navegador para testar a autenticação

console.log('🧪 Iniciando teste de autenticação...');

// Função para testar registro
async function testRegister() {
  console.log('📝 Testando registro de usuário...');
  
  try {
    // Simular dados de registro
    const testUser = {
      email: `teste${Date.now()}@exemplo.com`,
      password: 'MinhaSenh@123',
      fullName: 'Usuário Teste',
      role: 'student'
    };
    
    console.log('📤 Enviando dados de registro:', { 
      email: testUser.email, 
      fullName: testUser.fullName, 
      role: testUser.role 
    });
    
    // Usar o contexto de autenticação da aplicação
    if (window.authContext && window.authContext.signUp) {
      await window.authContext.signUp(
        testUser.email, 
        testUser.password, 
        testUser.fullName, 
        testUser.role
      );
      console.log('✅ Registro realizado com sucesso!');
    } else {
      console.log('⚠️ Contexto de autenticação não disponível');
    }
    
  } catch (error) {
    console.error('❌ Erro no registro:', error);
  }
}

// Função para testar login
async function testLogin() {
  console.log('🔑 Testando login de usuário...');
  
  try {
    const testCredentials = {
      email: 'teste@exemplo.com',
      password: 'MinhaSenh@123'
    };
    
    console.log('📤 Enviando credenciais de login:', { email: testCredentials.email });
    
    if (window.authContext && window.authContext.signIn) {
      await window.authContext.signIn(
        testCredentials.email, 
        testCredentials.password
      );
      console.log('✅ Login realizado com sucesso!');
    } else {
      console.log('⚠️ Contexto de autenticação não disponível');
    }
    
  } catch (error) {
    console.error('❌ Erro no login:', error);
  }
}

// Função para verificar estado atual
function checkAuthState() {
  console.log('🔍 Verificando estado de autenticação...');
  
  if (window.authContext) {
    console.log('📊 Estado atual:', {
      user: window.authContext.user,
      isAuthenticated: window.authContext.isAuthenticated,
      role: window.authContext.role,
      loading: window.authContext.loading
    });
  } else {
    console.log('⚠️ Contexto de autenticação não disponível');
  }
}

// Expor funções globalmente para teste manual
window.testAuth = {
  register: testRegister,
  login: testLogin,
  checkState: checkAuthState
};

console.log('🎯 Funções de teste disponíveis:');
console.log('- window.testAuth.register() - Testar registro');
console.log('- window.testAuth.login() - Testar login');
console.log('- window.testAuth.checkState() - Verificar estado');

// Verificar estado inicial
checkAuthState();