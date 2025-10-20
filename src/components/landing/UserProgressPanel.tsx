import React from 'react';
import { Lock, Target, Server, Award, Sparkles, ArrowRight } from 'lucide-react';

interface ProgressCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  progress: number;
  progressColor: string;
  className?: string;
}

const ProgressCard: React.FC<ProgressCardProps> = ({
  icon,
  title,
  subtitle,
  badge,
  badgeColor,
  progress,
  progressColor,
  className = ''
}) => (
  <div className={`rounded-xl border border-slate-200 p-4 bg-slate-50/70 hover:bg-slate-50 transition-all hover:-translate-y-0.5 hover:shadow transition-all duration-700 ease-out opacity-100 translate-x-0 translate-y-0 scale-100 ${className}`}>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-md bg-white border border-slate-200 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-900 tracking-tight">{title}</p>
          <p className="text-xs text-slate-600">{subtitle}</p>
        </div>
      </div>
      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${badgeColor}`}>
        {badge}
      </span>
    </div>
    <div className="mt-3">
      <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full ${progressColor}`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="mt-1 text-[12px] text-slate-600">Progresso {progress}%</div>
    </div>
  </div>
);

const SuggestedPathCard: React.FC = () => (
  <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 transition-all hover:-translate-y-0.5 hover:shadow">
    <div className="flex items-center gap-3">
      <div className="h-9 w-9 rounded-md bg-slate-900 text-white flex items-center justify-center">
        <Sparkles className="w-4.5 h-4.5" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-900 tracking-tight">Trilha sugerida</p>
        <p className="text-xs text-slate-600">Red Team • Web • Cloud</p>
      </div>
    </div>
    <a 
      href="#cursos" 
      className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-900 hover:bg-slate-50 transition-all hover:-translate-y-0.5"
    >
      Explorar
      <ArrowRight className="w-4 h-4" />
    </a>
  </div>
);

export const UserProgressPanel: React.FC = () => {
  const progressCards = [
    {
      icon: <Lock className="w-4.5 h-4.5 text-slate-800" />,
      title: "Missão: Hardening",
      subtitle: "Linux Server",
      badge: "+120 XP",
      badgeColor: "text-emerald-700 bg-emerald-50 border border-emerald-200",
      progress: 68,
      progressColor: "bg-emerald-500"
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5 text-slate-800">
          <path d="M19.07 4.93A10 10 0 0 0 6.99 3.34"></path>
          <path d="M4 6h.01"></path>
          <path d="M2.29 9.62A10 10 0 1 0 21.31 8.35"></path>
          <path d="M16.24 7.76A6 6 0 1 0 8.23 16.67"></path>
          <path d="M12 18h.01"></path>
          <path d="M17.99 11.66A6 6 0 0 1 15.77 16.67"></path>
          <circle cx="12" cy="12" r="2"></circle>
          <path d="m13.41 10.59 5.66-5.66"></path>
        </svg>
      ),
      title: "CTF: Web Exploitation",
      subtitle: "OWASP Top 10",
      badge: "+200 XP",
      badgeColor: "text-indigo-700 bg-indigo-50 border border-indigo-200",
      progress: 40,
      progressColor: "bg-indigo-500"
    },
    {
      icon: <Server className="w-4.5 h-4.5 text-slate-800" />,
      title: "Simulado: AWS Security",
      subtitle: "Ferramentas Free",
      badge: "50 questões",
      badgeColor: "text-sky-700 bg-sky-50 border border-sky-200",
      progress: 24,
      progressColor: "bg-sky-500 animate-pulse",
      progressStyle: { animationDuration: '2.2s' }
    },
    {
      icon: <Award className="w-4.5 h-4.5 text-slate-800" />,
      title: "Certificação Pro",
      subtitle: "Blue Team Analyst",
      badge: "Exclusivo Pro",
      badgeColor: "text-amber-700 bg-amber-50 border border-amber-200",
      progress: 82,
      progressColor: "bg-amber-500"
    }
  ];

  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_30px_80px_-20px_rgba(37,99,235,0.25)]">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {progressCards.map((card, index) => (
          <ProgressCard
            key={index}
            icon={card.icon}
            title={card.title}
            subtitle={card.subtitle}
            badge={card.badge}
            badgeColor={card.badgeColor}
            progress={card.progress}
            progressColor={card.progressColor}
          />
        ))}
      </div>
      <SuggestedPathCard />
    </div>
  );
};
