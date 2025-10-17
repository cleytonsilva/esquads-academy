import { ShieldCheck, Play, Layers } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useDecryptAnimation } from '../hooks/useDecryptAnimation';
import { useScrollReveal, useScrollRevealStagger } from '../hooks/useScrollReveal';
import { UserProgressPanel } from '@/components/landing/UserProgressPanel';

export default function Hero() {
  const [currentTerm, setCurrentTerm] = useState(0);
  const terms = ['missões práticas', 'CTFs', 'laboratórios em nuvem', 'simulações de ataque'];
  
  const heroTitle = 'Cibersegurança para todos, sem complicação';
  const decryptedTitle = useDecryptAnimation(heroTitle, 2500);

  const badgeReveal = useScrollReveal<HTMLDivElement>({ delay: 0 }, 'hero');
  const titleReveal = useScrollReveal<HTMLHeadingElement>({ delay: 200 }, 'hero');
  const descriptionReveal = useScrollReveal<HTMLDivElement>({ delay: 400 }, 'hero');
  const buttonsReveal = useScrollReveal<HTMLDivElement>({ delay: 600 }, 'hero');
  const badgesReveal = useScrollReveal<HTMLDivElement>({ delay: 800 }, 'hero');
  const dashboardReveal = useScrollReveal<HTMLDivElement>({ delay: 300 }, 'fromRight');
  const cardsStagger = useScrollRevealStagger<HTMLDivElement>(4, { delay: 100 }, 'staggered');

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTerm((prev) => (prev + 1) % terms.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const scrollToPlans = () => {
    document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToMissions = () => {
    document.getElementById('missoes')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-20 h-72 w-72 rounded-full bg-indigo-100 blur-3xl opacity-70 animate-pulse" style={{animationDuration: '7s'}}></div>
        <div className="absolute top-28 -left-12 h-64 w-64 rounded-full bg-sky-100 blur-3xl opacity-70 animate-pulse" style={{animationDuration: '8s'}}></div>
        <div className="absolute bottom-0 right-1/3 h-56 w-56 rounded-full bg-emerald-100 blur-3xl opacity-60 animate-pulse" style={{animationDuration: '9s'}}></div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 pb-16 md:pt-20 md:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6">
            <span 
              ref={badgeReveal.ref}
              className={`inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[12px] font-medium text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 ${badgeReveal.animationClasses}`}
              style={badgeReveal.animationStyles}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Aprenda praticando em missões reais
            </span>
            <h1 
              ref={titleReveal.ref}
              className={`mt-5 text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-slate-900 ${titleReveal.animationClasses}`}
              style={titleReveal.animationStyles}
            >
              {decryptedTitle}
            </h1>
            <div 
              ref={descriptionReveal.ref}
              className={`mt-4 text-base md:text-lg text-slate-700 ${descriptionReveal.animationClasses}`}
              style={descriptionReveal.animationStyles}
            >
              <p className="mb-2">
                Treine com <span className="font-semibold text-indigo-600 animate-pulse">{terms[currentTerm]}</span>, simulações de ataque e defesa.
              </p>
              <p>
                Evolua do básico ao avançado e conquiste certificações de mercado.
              </p>
            </div>

            <div 
              ref={buttonsReveal.ref}
              className={`mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 ${buttonsReveal.animationClasses}`}
              style={buttonsReveal.animationStyles}
            >
              <a href="/register" className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-900 text-white px-5 py-3 text-sm font-medium hover:bg-slate-800 shadow-sm ring-1 ring-slate-900/10 transition-all hover:shadow-md hover:-translate-y-0.5">
                <Play className="w-4 h-4" />
                Criar conta grátis
              </a>
              <button onClick={scrollToPlans} className="inline-flex items-center justify-center gap-2 rounded-md bg-white text-slate-900 px-5 py-3 text-sm font-medium border border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all hover:-translate-y-0.5">
                <Layers className="w-4 h-4" />
                Ver planos
              </button>
              <button onClick={scrollToMissions} className="inline-flex items-center justify-center gap-2 rounded-md bg-white/70 text-slate-900 px-5 py-3 text-sm font-medium border border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all hover:-translate-y-0.5">
                Ver missões
              </button>
            </div>

            <div 
              ref={badgesReveal.ref}
              className={`mt-4 flex items-center gap-4 text-[12px] text-slate-600 ${badgesReveal.animationClasses}`}
              style={badgesReveal.animationStyles}
            >
              <div className="inline-flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Labs guiados
              </div>
              <div className="inline-flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
                CTFs
              </div>
              <div className="inline-flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-sky-500 animate-pulse"></span>
                Simulados
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div 
              ref={dashboardReveal.ref}
              className={`${dashboardReveal.animationClasses}`}
              style={dashboardReveal.animationStyles}
            >
              <UserProgressPanel />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

