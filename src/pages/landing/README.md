Landing Page Export

Este diretório contém uma versão isolada da Landing Page pronta para ser integrada em outro projeto React.

Conteúdo:
- src/pages/LandingPage.tsx
- src/components/* (Header, Hero, LearningTracks, CertificationsSection, MissionsSection, PricingPlans, EnterpriseSection, FinalCTA, Footer)
- src/hooks/useDecryptAnimation.ts, src/hooks/useScrollReveal.ts
- src/types/scroll-reveal.ts
- public/images/esquads2.png (copiar do projeto original para o diretório público do projeto de destino)
- public/images/* (todos os logos e imagens usados pela landing)
- public/favicon.ico (opcional)
- src/styles/landing.css (Tailwind base para a landing)

Dependências esperadas no projeto de destino:
- react, react-dom
- lucide-react (ícones)
- Tailwind CSS (classes utilitárias usadas pelos componentes)

Como usar:
1) Copie a pasta `src` deste diretório para dentro do seu projeto (ex.: `src/landing`).
2) Copie a pasta `public` deste diretório para dentro do `public/` do seu projeto (ou garanta que os arquivos caiam nos mesmos caminhos: `public/images/*` e `public/favicon.ico`).
3) Garanta que seu projeto tenha Tailwind configurado. Importe o CSS da landing no ponto de entrada (ou mescle no seu CSS global):
   import './landing/styles/landing.css'
4) Importe e renderize a página onde desejar:
   // exemplo
   import LandingPage from './landing/pages/LandingPage';
   
   export default function App() {
     return <LandingPage />;
   }

Observações:
- Removi dependências do app original (auth/router) para tornar os componentes autossuficientes. Links usam `<a href>` simples.
- Hooks customizados necessários (scroll reveal e animação de texto) já estão incluídos.
- Os componentes usam classes Tailwind apenas; incluí um CSS mínimo com `@tailwind base/components/utilities` e a importação da fonte Inter.
- Ajustei classes não padrão (`w-4.5/h-4.5`) para equivalentes `w-[18px]/h-[18px]` para evitar dependência de presets customizados.
