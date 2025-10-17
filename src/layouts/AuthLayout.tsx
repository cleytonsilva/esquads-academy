// Esquads Academy - Layout de Autenticação

import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="flex min-h-screen">
        {/* Left side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white">
            <div className="max-w-md text-center">
              <h1 className="text-4xl font-bold mb-6">
                Esquads Academy
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Transforme seu aprendizado com nossa plataforma gamificada
              </p>
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold">1000+</div>
                  <div className="text-blue-200">Estudantes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">50+</div>
                  <div className="text-blue-200">Cursos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">95%</div>
                  <div className="text-blue-200">Satisfação</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">24/7</div>
                  <div className="text-blue-200">Suporte</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-300/20 rounded-full blur-xl"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-blue-300/20 rounded-full blur-lg"></div>
        </div>

        {/* Right side - Auth Form */}
        <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            {/* Logo for mobile */}
            <div className="lg:hidden text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Esquads Academy
              </h1>
              <p className="text-gray-600 mt-2">
                Sua jornada de aprendizado começa aqui
              </p>
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export { AuthLayout };
